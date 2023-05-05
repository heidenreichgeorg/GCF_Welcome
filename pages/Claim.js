
// GH20230428 carvedOut makeHistory, not sure about jSum

import { useEffect, useState } from 'react';

import { D_PreBook, D_Balance, D_Page,D_Schema, X_ASSETS, X_ASS_CASH, X_LIABILITY, X_INCOME, X_EQLIAB, SCREENLINES }  from '../modules/terms.js';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { bigEUMoney,cents20EU }  from '../modules/money';
import { symbolic }  from '../modules/session';
import { getParam,getSelect,getValue }  from '../modules/App';
import { book, CSEP,makeHistory,prepareTXN }  from '../modules/writeModule';
import { getSession, useSession, resetSession } from '../modules/sessionmanager';

const SCREEN_TXNS=2+parseInt(SCREENLINES/3);

var aSelText = {};
var aJMoney = {};
var aSelSaldo = {};

export default function Claim() {

    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)


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



    let debitor={};

    function onSelect(e,sender) {

// similar to Transaction.js

        e.preventDefault();

        console.log("onSelect click "+JSON.stringify(jHistory[sender-1]));
    
        let raw = jHistory[sender-1];
        let sSelect=makeHistory(sheet,aPattern,lPattern,[raw],aLen,eLen,gSchema,pageGlobal,SCREEN_TXNS)[1]; 
        console.log("onSelect click "+JSON.stringify(sSelect));

        // also see SigRow
        debitor =sSelect.jMoney;

        let dateControl =document.getElementById("dateBooked");

        let txn={};
        let aRow = [];
        try { let saRow = sSelect.entry;
            aRow = saRow.split(CSEP);
            txn.date  = aRow[0]; if(dateControl) txn.date=dateControl.value;
            txn.sender =aRow[1];
            txn.refAcct=aRow[2];
            txn.reason =aRow[3];
            txn.refCode=aRow[4];
        } catch(err) { console.log("onSelect aRow wrong "+JSON.stringify(aRow));  }    

        console.log("onSelect txn "+JSON.stringify(txn));


        // WITH SERVER-SIDE SESSION MANAGEMENT
        txn.sessionId = session.id; // won't book otherwise
        // WITH CLIENT-SIDE CLIENT/YEAR as PRIM KEY
        txn.year=session.year;
        txn.client=session.client;



        onBook(debitor,txn);
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
       
    
    var jAccounts = sheet[D_Balance];
    let arrAcct=[];
    let arrLiab=[];
    let arrCash=[];
    let arrAsst=[];
    for (let name in jAccounts)   {
        var account=jAccounts[name];
        if(account.xbrl.length>1) {
            var xbrl = account.xbrl.split('\.').reverse();
            var xbrl_pre = account.xbrl;//xbrl.pop()+ "."+ xbrl.pop()+ "."+ xbrl.pop()+ "."+ xbrl.pop();
            //console.log("Pattern "+xbrl_pre);
            if(xbrl.length>2) { 
                if(xbrl_pre.startsWith(X_INCOME) || xbrl_pre.startsWith(X_EQLIAB)) arrAcct.push(name);
                if(xbrl_pre.startsWith(X_LIABILITY)) arrLiab.push(name);
                if(xbrl_pre.startsWith(X_ASS_CASH)) arrCash.push(name);
                if(xbrl_pre.startsWith(X_ASSETS)) arrAsst.push(name);
            }
        }
    }

    const tabName = 'ClaimContent';
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={ aPages.map((_,n)=>(1+n)) } tabName={tabName}>
            <div className="attrLine">
            <div className="FIELD SYMB"></div>
            <div className="FIELD TEAM"><input id="dateBooked" type="date"></input></div>
            <div className="FIELD SYMB"></div>
            <div className="FIELD MOAM"><input id="iAmount0"></input></div>
            <div className="FIELD XFER">
                <select type="radio" key="acct0" id="acct0" name="acct0" onDrop={ignore} >
                    {arrCash.map((reason,i) => (
                        <option key={"reason0"+i} id={"reason0"+i} value={reason}>{reason}</option>
                    ))}
                </select>
                </div>
            <div className="SEP"></div>
            <div className="FIELD MOAM"><input id="iAmount1"></input></div>
            <div className="FIELD XFER">
                <select type="radio" key="acct1" id="acct1" name="acct1" onDrop={ignore} >
                    {arrAsst.map((reason,i) => (
                        <option key={"reason1"+i} id={"reason1"+i} value={reason}>{reason}</option>
                    ))}
                </select>
                </div>
                <div className="SEP"></div>
            <div className="FIELD MOAM"><input id="iAmount2"></input></div>
            <div className="FIELD XFER">
                <select type="radio" key="acct2" id="acct2" name="acct2" onDrop={ignore} >
                    {arrAsst.map((reason,i) => (
                        <option key={"reason2"+i} id={"reason2"+i} value={reason}>{reason}</option>
                    ))}
                </select>
                </div>
                <div className="SEP"></div>
            <div className="FIELD MOAM"><input id="iAmount3"></input></div>
            <div className="FIELD XFER">
                <select type="radio" key="acct3" id="acct3" name="acct3" onDrop={ignore} >
                    {arrAsst.map((reason,i) => (
                        <option key={"reason3"+i} id={"reason3"+i} value={reason}>{reason}</option>
                    ))}
                </select>
                </div>
        </div>
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

        // also see in onSelect
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
    function ignore(e) { e.preventDefault(); }
    

    
    function onBook(debitor,txn) {

        let flow = { 'credit':{}, 'debit':{}, 'balance':"0" };        

        // Asset accounts
        assetsData('acct0','iAmount0');
        assetsData('acct1','iAmount1');
        assetsData('acct2','iAmount2');
        assetsData('acct3','iAmount3');

        // preset accounts
        Object.keys(debitor).map(function(name,i) {flow=prepareTXN(sheet[D_Schema],flow,name,cents20EU(debitor[name]))});

        console.log("BOOK flow="+JSON.stringify(flow));

        txn.credit = flow.credit;
        txn.debit = flow.debit;

        console.log("BOOK transaction="+JSON.stringify(txn));

        if(flow.balance && flow.balance.length==0) 
            book(txn,session); 
        else console.log("BOOK O booked with remaining claim "+flow.balance);
 
 
        // invalidate current session
       //       resetSession();
 
        
  
    }

    function assetsData(shrtName,acctRef) { 
        let name = getSelect(shrtName);
        let amount=cents20EU(bigEUMoney(getValue(acctRef)));
        debitor[name]=amount; 
        console.log("Claim.addPreData ACCOUNT("+name+"):= VALUE("+amount+") "+JSON.stringify(debitor)); 
        return debitor; } // avoid update
    
 
}


