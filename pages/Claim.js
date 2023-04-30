
// GH20230428 carvedOut makeHistory, not sure about jSum

import { useEffect, useState } from 'react';

import { D_PreBook, D_History, D_Page,D_Schema, SCREENLINES }  from '../modules/terms.js';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { bigEUMoney,cents2EU }  from '../modules/money';
import { symbolic }  from '../modules/session';
import { getParam }  from '../modules/App';
import { CSEP,makeHistory }  from '../modules/writeModule';
import { getSession, useSession } from '../modules/sessionmanager';

const SCREEN_TXNS=2+parseInt(SCREENLINES/3);

var aSelText = {};
var aJMoney = {};
var aSelSaldo = {};

export default function Claim() {

    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
    const [ debitor, setDebitor ] = useState({'sender':'','acct0':'','acct1':'','acct2':'','iAmount0':'','iAmount1':'','iAmount2':''});
    const [txn,setTxn] = useState({ 'date':"", 'sender':"", 'refAcct':"", 'reason':"", 'refCode':"", 'credit':{},'debit':{}  })

    useEffect(() => {
    // run each rendering and re-rendering
        aSelText = {};
        aJMoney = {};
        if(status !== 'success') return;
        let state=getSession();
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
            console.log("INIT PAGE#1 ")


            // state.sheetCells are the payload lines
            }
    }, [status])



    function addPreData(shrtName,acctRef) { 
        let name = getSelect(shrtName);
        let amount=getValue(acctRef);
        debitor[shrtName]=name; 
        debitor[acctRef]=amount; 
        console.log("addPreData ACCOUNT("+name+"):= VALUE("+amount+") "+JSON.stringify(debitor)); 
        return debitor; } // avoid update
    
    
    function onSelect(e,sender) {
        e.preventDefault();

        console.log("onSelect "+JSON.stringify(jHistory[sender-1]));
/*
        addPreData('acct0','iAmount0');
        addPreData('acct1','iAmount1');
        addPreData('acct2','iAmount2');
*/    
        txn.sender = sender;
        txn.refAcct = debitor.acct0;
    
        console.log("onPreBook "+sender+" WITH "+txn.refAcct+" AS CRED "+JSON.stringify(debitor));
    
        let controlRefAcct1 = document.getElementById("acct1");
        let controlRefAcct2 = document.getElementById("acct2");
    
        let flow = { 'credit':{}, 'debit':{} };
        
        let iam0 = bigEUMoney(debitor.iAmount0);
        if(iam0 && iam0!=0n) flow=prepareTXN(sheet[D_Schema],flow,debitor.acct0,cents2EU(iam0));
        
        let iam1 = bigEUMoney(debitor.iAmount1);
        if(iam1 && iam1!=0n) {
            flow=prepareTXN(sheet[D_Schema],flow,debitor.acct1,cents2EU(iam1));
            if(controlRefAcct1) {
                console.log("SET SELECT1 "+controlRefAcct1.id+" WITH "+debitor.acct1);
                setSelect("cReason",debitor.acct1);
            } 
        }
    
        let iam2 = bigEUMoney(debitor.iAmount2);
        if(iam2 && iam2!=0n) {
            flow=prepareTXN(sheet[D_Schema],flow,debitor.acct2,cents2EU(iam2));
            if(controlRefAcct2) {
                console.log("SET SELECT2 "+controlRefAcct2.id+" WITH "+debitor.acct2);
                setSelect("cReason",debitor.acct2);
            }
        }
    
    
    
    
        txn.credit = flow.credit;
        txn.debit=flow.debit;
        //console.log("SET FLOW "+JSON.stringify(flow));
    
        // renders complete page, because txn is a controlled variable
        setTxn(JSON.parse(JSON.stringify(txn)))
    
    }    
    

    if(!sheet) return null; //'Loading...';

    const pageGlobal = sheet[D_Page];

    function token() { return { client:session.client, year:session.year }}

    console.log("session.server="+JSON.stringify(session.server));

    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/Book?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/Dashboard?client="+session.client+"&year="+session.year; }

    let page = sheet[D_Page];

    console.log("7010 Sessionprovider "+JSON.stringify(sheet.Vorgemerkt));

    // GH20230428  accumulates jSum
    const jHistory  = sheet[D_PreBook];
    let aLen = parseInt(sheet[D_Schema].assets);
    let eLen = parseInt(sheet[D_Schema].eqliab);
    const gSchema = sheet[D_Schema];    
    var aPattern = getParam("APATTERN");
    if(aPattern && aPattern.length<2) aPattern=null;
    var lPattern = getParam("LPATTERN");
    if(lPattern && lPattern.length<2) lPattern=null;
    console.log("CLAIM showing "+JSON.stringify(jHistory));
    let sHistory=makeHistory(sheet,aPattern,lPattern,jHistory,aLen,eLen,gSchema,pageGlobal,SCREEN_TXNS); // accumulates jSum

    let sPages = (sHistory.length+1) / SCREEN_TXNS;    
    let strToken=token();
    console.log("strToken="+JSON.stringify(strToken));

    let aPages = [];
    for(let p=1;p<sPages-1;p++) aPages[p]='none'; 
    aPages[0]='block';
       

    const tabName = 'ClaimContent';
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={ aPages.map((_,n)=>(1+n)) } tabName={tabName}>
            {aPages.map((m,n) => ( 
                <div className="FIELD"  key={"Claim0"+n}  id={tabName+n} style= {{ 'display': m }} >
                    { (sHistory.slice(n*SCREEN_TXNS,(n+1)*SCREEN_TXNS).map((row,k) => (  
                        <SigRow  key={"Claim2"+k} row={row} index={n} client={session.client}  year={session.year} line={k} />  
                    )))}                   
                    <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                    <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                </div>
                )
            )}
        </Screen>
    )


    function SigRow({row,index,client,year,line}) {

        let aRow = [0n,0n,0n,0n,0n,0n]
        try { let saRow = row.entry;
            aRow = saRow.split(CSEP);
        } catch(err) {  aRow=[""+index+client+year,""+year+index+client] }    

        let tRow =  {};
        let mRow=tRow;
        try { let moneyRow = row.jMoney;
            tRow = moneyRow; //  name-value pairs with sign
            console.log("SigRow tRow="+JSON.stringify(tRow));
            mRow = Object.keys(tRow).map((accName)=>(accName+" "+tRow[accName]));
        } catch(err) {}


        let id = symbolic(''+line+aRow.join('')+line+JSON.stringify(tRow));

        var selectAll = getParam("SELECTALL");
        if(selectAll && selectAll.length<1) selectAll=null;
        if(selectAll 
            && (index>0 || line>1) // SKIP OPENING GH20230413 was
            ) { 
            
                console.log("ADDING("+id+") "+JSON.stringify(aRow));

            aSelText[id]=aRow;  
            aJMoney[id]=tRow;
            aSelSaldo[id]=""+saldo;         
        }

        return (
            <div className="BIGCELL">
                
                { (aRow[0] && aRow[0].length>1) ? (
                <div className="attrLine" id={id}>
                    <div className="FIELD MOAM" id={"Book"+line}><input type="submit" className="key" value="BOOK" onClick={(e)=>onSelect(e,line)}/></div>
                    <div className="FIELD TAX">{aRow[0]}</div>
                    <div className="FIELD TAX">&nbsp;{index}</div>
                    <div className="FIELD L280">{aRow[1]}</div>
                    <div className="FIELD IDNT">{aRow[2]}</div>
                    <div className="FIELD IDNT">{aRow[3]}</div>
                    <div className="FIELD LNAM">{aRow[4]}</div>
                    <div className="FIELD IDNT">{aRow[5]}</div>
                </div>
                ):""}
                <div className="attrLine">
                    <div className="FIELD SEP">&nbsp;</div>
                    <div className="FIELD C100">{mRow[0]}</div>
                    <div className="FIELD C100">{mRow[1]}</div>
                    <div className="FIELD C100">{mRow[2]}</div>
                    <div className="FIELD C100">{mRow[3]}</div>
                    <div className="FIELD C100">{mRow[4]}</div>
                    <div className="FIELD C100">{mRow[5]}</div>
                    <div className="FIELD C100">{mRow[6]}</div>
                    <div className="FIELD C100">{mRow[7]}</div>
                </div>
            </div>
        )
    }

}



function handleChange(target,aRow,tRow,id) {
        
    console.log("click "+id+"="+JSON.stringify(aRow));
    
    if(aSelText) {    
        if(aSelText && aSelText[id] && aSelText[id].length>0) {
            console.log("DESELECT "+id);
            aSelText[id]=null;
            aSelSaldo[id]=null;
            target.value='';
            aJMoney[id]={};
        } else  {
            console.log("SELECT "+id);
            aSelText[id]=aRow;
            aSelSaldo[id]="0";
            aJMoney[id]=tRow;
            console.log("handleChange "+JSON.stringify(tRow))
        }
    }

}