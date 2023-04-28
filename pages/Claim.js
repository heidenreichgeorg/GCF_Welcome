
// GH20230428 carvedOut makeHistory, not sure about jSum

import { useEffect, useState } from 'react';

import { D_PreBook, D_Page,D_Schema, SCREENLINES }  from '../modules/terms.js';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { cents20EU }  from '../modules/money';
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

    useEffect(() => {
    // run each rendering and re-rendering
        aSelText = {};
        aJMoney = {};
        if(status !== 'success') return;
        let state=getSession();
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
            console.log("INIT PAGE#1 ")
            }
    }, [status])


    if(!sheet) return null; //'Loading...';

    const pageGlobal = sheet[D_Page];

    function token() { return { client:session.client, year:session.year }}

    console.log("session.server="+JSON.stringify(session.server));

    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/Book?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/Dashboard?client="+session.client+"&year="+session.year; }

    let page = sheet[D_Page];


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

function SigRow({row,index,client,year,line}) {

    let aRow = [0n,0n,0n,0n,0n,0n]
    try { let saRow = row.entry;
        aRow = saRow.split(CSEP);
    } catch(err) {  aRow=[""+index+client+year,""+year+index+client] }    

    let tRow =  {};
    try { let moneyRow = row.jMoney;
        tRow = moneyRow; //  name-value pairs with sign
    } catch(err) {}

    let saldo="";
    if(isNaN(row.saldo)) saldo="0";
    else saldo = cents20EU(row.saldo); // cents2EU with 0 digit

    
    //let id = line+symbolic(aRow.join('')+line+JSON.stringify(tRow));
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

    var checked=(aSelSaldo[id]!=null);

    let mRow=[];

    return (
        <div className="BIGCELL">
            <div className="attrLine" id={id}>
                <div className="FIELD SYMB"><label><input type="CHECKBOX" onChange={(event) => handleChange(event.target,aRow,tRow,id)} defaultChecked={checked} />
                                        </label></div>
                <div className="FIELD TAX">{aRow[0]}</div>
                <div className="FIELD TAX">&nbsp;{index}</div>
                <div className="FIELD L280">{aRow[1]}</div>
                <div className="FIELD IDNT">{aRow[2]}</div>
                <div className="FIELD IDNT">{aRow[3]}</div>
                <div className="FIELD LNAM">{aRow[4]}</div>
                <div className="FIELD IDNT">{aRow[5]}</div>
            </div>
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
                <div className="FIELD C100">{saldo}</div>
            </div>
        </div>
    )
}




function BalanceRow(args) { 
    let amounts =[]; let cols=[];  let count=0;
    let off = args.removeCol ? args.removeCol : nop;
    Object.keys(args.jColumnHeads).forEach(c=>
        {if(args.jColumnHeads[c] && args.jColumnHeads[c].length>1 && count++<12 ) { cols.push(c); amounts.push(args.jValues[c]?args.jValues[c]:"-,--")}});
    return (
        <div className="attrLine">
            { amounts.map((value,i)=>(
                <div className="FIELD MOAM" key={'sel'+i} onClick={()=>{off(cols[i])}}>{value}</div>
            )) }
        </div>
    )
    
}

