
import { useEffect, useState } from 'react';

import { D_CarryOver, D_History, D_Page, D_Receipts, D_Schema, J_ACCT, SCREENLINES }  from '../modules/terms.js';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { cents2EU }  from '../modules/money';
import { getParam, symbolic }  from '../modules/App';
import { CSEP,prettyTXN }  from '../modules/writeModule';
import { getCarryOver,storeCarryOver, useSession } from '../modules/sessionmanager';
import { bigEUMoney } from '../modules/money.mjs';

const SCREEN_TXNS=2+parseInt(SCREENLINES/3);

const VOID ="-,--";

var funcShowReceipt=null;
var funcKeepReceipt=null;
var funcHideReceipt=null;
var aSelText = {};
var aJMoney = {};
var aSelSaldo = {};
var jPageSum={};
// SCHEMA { acct:strValue }

export default function History() {

    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
    const [isOpen, setIsOpen] = useState(false);
    const [jHeads, setJHeads] = useState({});

    function removeCol(name) { console.log("REMOVE "+name); jHeads[name]='0'; setJHeads(JSON.parse(JSON.stringify(jHeads)));  }

    funcKeepReceipt = (() => { console.log("KEEP jSUM="+JSON.stringify(jSum)); storeCarryOver(jSum)  } );  // keep jSum
    funcHideReceipt = (() => setIsOpen(false)); 
    funcShowReceipt = (() => setIsOpen(true));

    useEffect(() => {
    // run each rendering and re-rendering
        aSelText = {};
        aJMoney = {};
        if(status !== 'success') return;
            let state = null;
            try { state=JSON.parse(sessionStorage.getItem('session')); } catch(err) {}
            if(state && Object.keys(state).length>5) {
                setSheet(state.generated);
                console.log("INIT PAGE#1 ")
                if(state.generated) {
                    
                    let jColumnHeads={}; 
                    let names=state.generated[D_Schema].Names;
                    names.slice(6).forEach(acct => { if(acct.length>2) jColumnHeads[acct]='1'; });
                    setJHeads(jColumnHeads);   
                    console.log("INIT PAGE#2 "+JSON.stringify(jColumnHeads))

                    resetJSum(jColumnHeads);         
                    console.log("INIT PAGE#4 "+JSON.stringify(jPageSum))
                }
            }
    }, [status])


    function resetJSum(jColumnHeads) { 
        let jCarryOver=getCarryOver();
        console.log("INIT PAGE#3 "+JSON.stringify(jCarryOver))
        if(jCarryOver && Object.keys(jCarryOver).length>0) {
            jPageSum=jCarryOver;
            console.log("INIT PAGE#3A "+JSON.stringify(jPageSum))
        } else  { 
            jPageSum={}; 
            Object.keys(jColumnHeads).forEach(acct=>{jPageSum[acct]="0,00";}); 
            console.log("INIT PAGE#3B "+JSON.stringify(jPageSum))
        }
    }


    if(!sheet) return null; //'Loading...';

    const pageGlobal = sheet[D_Page];

    function token() { return { client:session.client, year:session.year }}

    console.log("session.server="+JSON.stringify(session.server));

    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/HGB275S2Page?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/Operations?client="+session.client+"&year="+session.year; }

    let page = sheet[D_Page];
    let names = sheet[D_Schema].Names;

    let sHistory=makeHistory(sheet); // accumulates jSum

    let sPages = (sHistory.length+1) / SCREEN_TXNS;    
    let strToken=token();
    console.log("strToken="+JSON.stringify(strToken));

    let aPages = [];
    for(let p=1;p<sPages-1;p++) aPages[p]='none'; 
    aPages[0]='block';
       
    let aPattern = getParam("APATTERN");

    let jColumnHeads=jHeads; // state variable, do not touch

    if(isOpen) {
        Object.keys(aSelText).forEach(sym => 
            {if(aJMoney[sym])  (names.forEach(acct => { 
                if(acct.length>2 && jColumnHeads[acct]=='1') {   
                                            let value=aJMoney[sym][acct]; 
                                            if(bigEUMoney(value)!=0n) { 
                                                try { jColumnHeads[acct]=acct; } catch(e) {}
                                            }
                  } }))
            })
    }
    console.log("INIT jColumnHeads "+JSON.stringify(jColumnHeads));

    let jSum=JSON.parse(JSON.stringify(jPageSum));
    console.log("UNIFY jSum "+JSON.stringify(jSum));

    function makeLabel(index) { return (aPattern && aPattern.length>0) ?session.client+session.year+aPattern+index : ""}

    const tabName = 'HistoryContent';
        
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={isOpen ? [] : aPages.map((_,n)=>(1+n)) } tabName={tabName}>

            {isOpen &&             
                (
                <div>                     
                    <button onClick={() => funcKeepReceipt()}>{D_CarryOver}</button>
                    <button onClick={() => funcHideReceipt()}>{D_Receipts}</button>
                    <TXNReceiptHeader text="" jAmounts={jColumnHeads} jColumnHeads={jColumnHeads} id="" removeCol={removeCol}/>                   
                    { console.log("aSelText# = "+Object.keys(aSelText).length) ||
                    Object.keys(aSelText).map((sym,i) => ( (aSelText[sym] && i>1) ? 
                                                            TXNReceipt(
                                                                aSelText[sym].join(' '),
                                                                aJMoney[sym],
                                                                jColumnHeads,
                                                                jSum,
                                                                (aSelSaldo[sym]==VOID)?"":makeLabel(i)) :
                                                                    ""
                                                                    )) }
                    <TXNReceiptHeader text="" jAmounts={jSum} jColumnHeads={jColumnHeads} id="" removeCol={removeCol}/>                                                                                       
                </div>
            )}

            { !isOpen && (<SearchForm token={strToken} ></SearchForm>) }
            
            {aPages.map((m,n) => ( 
                <div className="FIELD"  key={"History0"+n}  id={tabName+n} style= {{ 'display': m }} >
                    { !isOpen && (sHistory.slice(n*SCREEN_TXNS,(n+1)*SCREEN_TXNS).map((row,k) => (  
                        <SigRow  key={"History2"+k} row={row} index={n} client={session.client}  year={session.year} />  
                    )))}
                    <div className="attrline">&nbsp;</div>
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

function SigRow({row,index,client,year}) {

    let aRow = [0n,0n,0n,0n,0n,0n]
    try { let saRow = row.entry;
        aRow = saRow.split(CSEP);
    } catch(err) {  aRow=[""+index+client+year,""+year+index+client] }    

    let tRow =  {};
    try { let moneyRow = row.jMoney;
        tRow = moneyRow; //  name-value pairs with sign
    } catch(err) {}

    let saldo="";
    if(isNaN(row.saldo)) saldo=VOID;
    else saldo = cents2EU(row.saldo); // cents2EU

    let id= ((aRow[0].substring(4).replace(/\D/g, ""))+symbolic(aRow.join('')+JSON.stringify(tRow)));

    var selectAll = getParam("SELECTALL");
    if(selectAll && selectAll.length<1) selectAll=null;
    if(selectAll) { 
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

function makeHistory(sheet) {       

    console.log("makeHistory sheet="+Object.keys(sheet));
 
    const arrHistory = [];                
    const jHistory  = sheet[D_History];
    let aLen = parseInt(sheet[D_Schema].assets);
    let eLen = parseInt(sheet[D_Schema].eqliab);
    const gSchema = sheet[D_Schema];
    const pageGlobal = sheet[D_Page];

    if(pageGlobal) {
        
        arrHistory.push({entry:CSEP+CSEP+pageGlobal["History"]+CSEP+pageGlobal["header"]+CSEP+CSEP});
        
        // 20220701
        var lPattern = getParam("LPATTERN");
        if(lPattern && lPattern.length<2) lPattern=null;

        var aPattern = getParam("APATTERN");
        if(aPattern && aPattern.length<2) aPattern=null;

        if(gSchema.Names && gSchema.Names.length>0) {
            var names=gSchema.Names;
            var iSaldo=0n;

            for (let hash in jHistory)  {

                let jPrettyTXN = prettyTXN(jHistory,hash,lPattern,aPattern,names,aLen,eLen);

                // GH 20220703
                if(jPrettyTXN.txnAcct) {
                    let txn = jPrettyTXN.raw;
                   
                    // GH20221228 see ['','AN'] in App.js turned to ['AN'] 
                        //jPrettyTXN.credit.join(CSEP)
                        //jPrettyTXN.debit.join(CSEP)+CSEP+CSEP+CSEP
                                           
                    var i=0;                    
                    var lMoney = {};
                    for (i=J_ACCT;i<txn.length;i++) { if(i!=aLen && i!=eLen && txn[i] && txn[i].length>1) lMoney[names[i]]=txn[i]; }  

                    console.log("txn="+JSON.stringify(lMoney));

                    iSaldo += BigInt(jPrettyTXN.strSaldo);
                    
                    arrHistory.push({'entry':jPrettyTXN.entry.join(CSEP), 'jMoney':lMoney,  'saldo':""+(iSaldo) });                    
                                 
                }
            }

            for (let i=1;i<SCREEN_TXNS;i++) arrHistory.push({entry:CSEP+CSEP+CSEP+CSEP+CSEP});
        }
    }
    return arrHistory;
}  


function SearchForm(token) {
    return (
        <div className="attrLine">
            <form onSubmit={(e)=>(console.log("SEARCH "+JSON.stringify(e.target)))} >                
                <div className="FIELD MOAM"></div>                
                <div className="FIELD LTXT">Line:<input type='edit' name='LPATTERN'/>&nbsp;</div>                
                <div className="FIELD LTXT">Acct:<input type='edit' name='APATTERN'/></div>                
                <input type='hidden' name='client' defaultValue={token.client}/>
                <input type='hidden' name='year' defaultValue={token.year}/>
                <div className="FIELD MOAM"><button autoFocus className='SYMB key'>Search</button></div>                
                <div className="FIELD MOAM"><input type='button' name='SELECT' value='SELECT' onClick={(event) => (funcShowReceipt())}/></div>                
            </form>
        </div>
    )
}

function TXNReceipt(text,jAmounts,jColumnHeads,jSum,id,removeCol) {
    
    Object.keys(jAmounts).forEach(acct=>{
        let value = jAmounts[acct];        
        if(jSum && value && value.length>2) {   
            console.log("TXNReceipt "+acct+" add "+value);        
            if(jSum[acct]) jSum[acct] = cents2EU(bigEUMoney(jSum[acct]) + bigEUMoney(value));
        }
    })
    if(jSum) console.log("TXNReceipt jSum "+JSON.stringify(jSum));

    return(
        <div className="FIELD" id={"PageContentReceipt"+id} key={"PageContentReceipt"+id}>
            <div className="BIGCELL">
                <div className="FIELD">{text} {id}</div>
                <BalanceRow jValues={jAmounts} jColumnHeads={jColumnHeads} removeCol={removeCol}/>
            </div>
        </div>
)}      

function TXNReceiptHeader(args) {
    console.log("HEAD "+JSON.stringify(args));
    //return (<div>TXNReceipt</div>);
    return TXNReceipt(args.text,args.jAmounts,args.jColumnHeads,null,args.id,args.removeCol);
}

function nop() {}

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

