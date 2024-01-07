
// GH20230428 carvedOut makeHistory, not sure about jSum

import { useEffect, useState } from 'react';

import { D_Account, D_Carry, D_CarryOff, D_CarryOver, D_History, D_Page, D_Receipts, D_Schema, J_ACCT, SCREENLINES }  from '../modules/terms.js';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { cents20EU }  from '../modules/money';
import { getParam }  from '../modules/App';
import { CSEP,makeHistory,symbolic }  from '../modules/writeModule';
import { getSession,getCarryOver,storeCarryOver, useSession } from '../modules/sessionmanager';
import { bigEUMoney } from '../modules/money.mjs';

const SCREEN_TXNS=2+parseInt(SCREENLINES/3);

const VOID ="-,--";

var funcShowReceipt=null;
var funcKeepReceipt=null;
var funcHideReceipt=null;
var funcCleaReceipt=null;
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

    funcCleaReceipt = (() => { storeCarryOver({}); resetJSum(jHeads); });
    funcKeepReceipt = (() => { storeCarryOver(purgeCarryOver(jSum));  });  
    funcHideReceipt = (() => setIsOpen(false)); 
    funcShowReceipt = (() => setIsOpen(true));

    useEffect(() => {
    // run each rendering and re-rendering
        aSelText = {};
        aJMoney = {};
        if(status !== 'success') return;
        let state=getSession();
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

function purgeCarryOver(jSum) {
    let result={}; 
    Object.keys(jSum).forEach(name => {if(bigEUMoney(jSum[name])!=0n) 
        result[name]=jSum[name];});
    return result;
}

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


    // GH20230428  accumulates jSum
    const jHistory  = sheet[D_History];
    let aLen = parseInt(sheet[D_Schema].assets);
    let eLen = parseInt(sheet[D_Schema].eqliab);
    const gSchema = sheet[D_Schema];    
    var aPattern = getParam("APATTERN");
    if(aPattern && aPattern.length<2) aPattern=null;
    var lPattern = getParam("LPATTERN");
    if(lPattern && lPattern.length<2) lPattern=null;
    let sHistory=makeHistory(sheet,aPattern,lPattern,jHistory,aLen,eLen,gSchema,pageGlobal,SCREEN_TXNS); // accumulates jSum


    let sPages = (sHistory.length+1) / SCREEN_TXNS;    
    let strToken=token();
    console.log("strToken="+JSON.stringify(strToken));

    let aPages = [];
    for(let p=1;p<sPages-1;p++) aPages[p]='none'; 
    aPages[0]='block';
       
    let jColumnHeads=jHeads; // state variable, do not touch

    let jSum=JSON.parse(JSON.stringify(jPageSum));
    console.log("UNIFY jSum "+JSON.stringify(jSum));

    if(isOpen) {
        Object.keys(aSelText).forEach(sym => 
            {if(aJMoney[sym])  (names.forEach(acct => { 
                if(acct.length>2 && jColumnHeads[acct]=='1') {   
                                            let value=aJMoney[sym][acct]; 
                                            let carry=jSum[acct];
                                            if(bigEUMoney(value)!=0n) { 
                                                try { jColumnHeads[acct]=acct; } catch(e) {}
                                                
                                                if(!carry || carry.length==0) {
                                                    jSum[acct]="0"; jPageSum[acct]="0";
                                                }
                                            }

                                            if(carry && carry.length>0) { 
                                                try { jColumnHeads[acct]=acct; } catch(e) {}
                                            }
                  } }))
            })
    }
    console.log("INIT jColumnHeads "+JSON.stringify(jColumnHeads));


    function makeLabel(index) { let p= (aPattern && aPattern.length>0) ? aPattern: "p"; return session.client+session.year+p+index }

    const tabName = 'HistoryContent';
 
    
    return (
        <Screen aFunc={[prevFunc, nextFunc]} aText={["PREV","NEXT"]} tabSelector={isOpen ? [] : aPages.map((_,n)=>(1+n)) } tabName={tabName} >


            {isOpen &&             
                (
                <div className="mTable">                     
                    <button onClick={() => funcKeepReceipt()}>{D_CarryOver}</button>
                    <button onClick={() => funcHideReceipt()}>{D_Receipts}</button>
                    { TXNReceipt(D_Account, jColumnHeads, jColumnHeads, null, session.year, removeCol) }
                    
                    <TXNReceiptSum text={D_Carry} jAmounts={jPageSum} jColumnHeads={jColumnHeads} id=""/>                   
                    { console.log("aSelText keys = "+Object.keys(aSelText).join('+')) ||
                    Object.keys(aSelText).map((sym,i) => ( (sym && aSelText[sym] && aJMoney[sym] ) ? // && i>1
                                                //console.log("Receipt "+sym+" for "+aSelText[sym]+" with "+aJMoney[sym]) && 
                                                            TXNReceipt(
                                                                aSelText[sym].join(' '),
                                                                aJMoney[sym],
                                                                jColumnHeads,
                                                                jSum,
                                                                makeLabel(i)) // && i>1
//                                                                (aSelSaldo[sym]==VOID)?"":makeLabel(i)) 
                                                                    :""
                                                                    )) }
                    <TXNReceiptSum text={page.Sum} jAmounts={jSum} jColumnHeads={jColumnHeads} id="" removeCol={removeCol}/>                                                                                       
                </div>
            )}

            { !isOpen && (<SearchForm token={strToken} ></SearchForm>) }
            
            {aPages.map((m,n) => ( 
                <div className="FIELD"  key={"History0"+n}  id={tabName+n} style= {{ 'display': m }} >
                    { !isOpen && (sHistory.slice(n*SCREEN_TXNS,(n+1)*SCREEN_TXNS).map((row,k) => (  
                        <SigRow  key={"History2"+k} row={row} index={n} client={session.client}  year={session.year} line={k} />  
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
        && (index>0 || line>0) // SKIP OPENING GH20230413 was
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


function SearchForm(token) {
    return (
        <div className="attrLine">
            <form onSubmit={(e)=>(console.log("SEARCH "+JSON.stringify(e.target)))} >                
                <div className="FIELD MOAM">                
                    
                </div>
                <div className="FIELD LTXT">Line:<input type='edit' name='LPATTERN'/>&nbsp;</div>                
                <div className="FIELD LTXT">Acct:<input type='edit' name='APATTERN'/></div>                
                <input type='hidden' name='client' defaultValue={token.client}/>
                <input type='hidden' name='year' defaultValue={token.year}/>
                <div className="FIELD MOAM"><button autoFocus className='SYMB key'>Search</button></div>                
                <div className="FIELD MOAM"><input type='button' name='SELECT' value='SELECT'     onClick={() => (funcShowReceipt())}/></div>                
                <div className="FIELD MOAM"><input type='button' name='SELECT' value={D_CarryOff} onClick={() => (funcCleaReceipt())}/></div>
            </form>
        </div>
    )
}

function TXNReceipt(text,jAmounts,jColumnHeads,jSum,id,removeCol) {
    
    Object.keys(jAmounts).forEach(acct=>{
        let value = jAmounts[acct];        
        if(jSum && value && value.length>2) {   
            console.log("TXNReceipt "+acct+" add "+value);        
            if(jSum[acct]) {
                jSum[acct] = cents20EU(bigEUMoney(jSum[acct]) + bigEUMoney(value));
            }
        }
    })
    if(jSum) console.log("TXNReceipt jSum "+JSON.stringify(jSum));
    

    return( // FIELD
        <div>
            <div className="attrLine"> <div className="FIELD"></div></div>
            <div className="attrLine"> <div className="FIELD">{text} {id}</div></div>
            <BalanceRow jValues={jAmounts} jColumnHeads={jColumnHeads} removeCol={removeCol}/>
        </div>
        
)}      

function TXNReceiptSum(args) {
    //console.log("HEAD "+JSON.stringify(args));
    
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

