


import { useEffect, useState } from 'react';

import { D_History, D_Page, D_Receipts, D_Schema, SCREENLINES }  from '../modules/terms.js';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { cents2EU }  from '../modules/money';
import { getParam, symbolic }  from '../modules/App';
import { CSEP,prettyTXN }  from '../modules/writeModule';
import { useSession } from '../modules/sessionmanager';
import { bigEUMoney } from '../modules/money.mjs';

const SCREEN_TXNS=2+parseInt(SCREENLINES/3);

const VOID ="-,--";

var funcShowReceipt=null;
var funcHideReceipt=null;
var aSelText = {};
var aSelMoney = {};
var aSelSaldo = {};


export default function History() {

    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
    const [isOpen, setIsOpen] = useState(false);
 
    funcShowReceipt = (() => setIsOpen(true));
    funcHideReceipt = (() => setIsOpen(false));

    useEffect(() => {
    // run each rendering and re-rendering
        aSelText = {};
        aSelMoney = {};
        if(status !== 'success') return;
            let state = null;
            try { state=JSON.parse(sessionStorage.getItem('session')); } catch(err) {}
            if(state && Object.keys(state).length>5) {
                setSheet(state.generated);
            }
    }, [status])

    if(!sheet) return null; //'Loading...';

    function token() { return { client:session.client, year:session.year }}

    console.log("session.server="+JSON.stringify(session.server));

    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/HGB275S2Page?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/Operations?client="+session.client+"&year="+session.year; }

    let page = sheet[D_Page];
    let sHistory=makeHistory(sheet);
    let sPages = (sHistory.length+1) / SCREEN_TXNS;    
    let strToken=token();
    console.log("strToken="+JSON.stringify(strToken));

    let aPages = [];
    for(let p=1;p<sPages-1;p++) aPages[p]='none'; 
    aPages[0]='block';
   
    let sum ={ value:" 12,34"};
    let aPattern = getParam("APATTERN");

    function makeLabel(index) { return (aPattern && aPattern.length>0) ?session.client+session.year+aPattern+index : ""}

    const tabName = 'HistoryContent';
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={isOpen ? [] : aPages.map((_,n)=>(1+n)) } tabName={tabName}>

            {isOpen && (
                <div>                    
                    <button onClick={() => funcHideReceipt()}>{D_Receipts}</button>
                    { Object.keys(aSelText).map((sym,i) => ( aSelText[sym] ? 
                                                            TXNReceipt(sym,sum,makeLabel(i)) :
                                                             "" )) }
                </div>
            )}

            { !isOpen && (<SearchForm token={strToken} ></SearchForm>) }
            
            {aPages.map((m,n) => ( 
                <div className="SWITCH"  key={"History0"+n}  id={tabName+n} style= {{ 'display': m }} >
                    { !isOpen && (sHistory.slice(n*SCREEN_TXNS,(n+1)*SCREEN_TXNS).map((row,k) => (  
                        <SigRow  key={"History2"+k} row={row} index={n} client={session.client}  year={session.year}/>  
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


function handleChange(target,aRow,mRow) {
    
    let id= ((aRow[0].substring(4).replace(/\D/g, ""))+symbolic(aRow.join('')+mRow.join('')));
    console.log("click "+id+"="+JSON.stringify(aRow));
    
    if(aSelText) {    
        if(aSelText && aSelText[id] && aSelText[id].length>0) {
            console.log("DESELECT "+id);
            aSelText[id]=null;
            aSelMoney[id]=null;
            aSelSaldo[id]=null;
            target.value='';
        } else  {
            console.log("SELECT "+id);
            aSelText[id]=aRow;
            aSelMoney[id]=mRow;
            aSelSaldo[id]="0";
        }
    }
}

function SigRow({row,index,client,year}) {
    let aRow = [0n,0n,0n,0n,0n,0n]
    try { let saRow = row.sig;
        aRow = saRow.split(CSEP);
     } catch(err) {  aRow=[""+index+client+year,""+year+index+client] }
    
    let mRow =  [0n,0n,0n,0n,0n,0n]
    try { let smRow = row.money;
        mRow = smRow.split(CSEP);
    } catch(err) {}

    let saldo="";
    if(isNaN(row.saldo)) saldo=VOID;
    else saldo = cents2EU(row.saldo); // cents2EU

    let id= ((aRow[0].substring(4).replace(/\D/g, ""))+symbolic(aRow.join('')+mRow.join('')));

    var selectAll = getParam("SELECTALL");
    if(selectAll && selectAll.length<1) selectAll=null;
    if(selectAll) { aSelText[id]=aRow;  aSelMoney[id]=mRow; aSelSaldo[id]=""+saldo; }

    var checked=(aSelSaldo[id]!=null);
    return (
        <div className="BIGCELL">
            <div className="attrLine" id={id}>
                <div className="FIELD SYMB"><label><input TYPE="CHECKBOX" onChange={(event) => handleChange(event.target,aRow,mRow)} defaultChecked={checked} />
                                        </label></div>
                <div className="FIELD TAX">{aRow[0]}</div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD IDNT">{aRow[1]}</div>
                <div className="FIELD IDNT">{aRow[2]}</div>
                <div className="FIELD IDNT">{aRow[3]}</div>
                <div className="FIELD IDNT">{aRow[4]}</div>
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
    //const response = JSON.parse(strText);
    const jHistory  = sheet[D_History];
    let aLen = parseInt(sheet[D_Schema].assets);
    let eLen = parseInt(sheet[D_Schema].eqliab);
    const gSchema = sheet[D_Schema];
    const pageGlobal = sheet[D_Page];


     if(pageGlobal) {
        
        arrHistory.push({sig:CSEP+CSEP+pageGlobal["History"]+CSEP+pageGlobal["header"]+CSEP+CSEP,money:CSEP+CSEP+CSEP+CSEP+CSEP});
        
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
                   
                    // GH20221228 see ['','AN'] in App.js turened to ['AN'] 
                    let data = (
                        jPrettyTXN.entry.join(CSEP)
                        +CSEP+jPrettyTXN.credit.join(CSEP)
                        +CSEP+jPrettyTXN.debit.join(CSEP)+CSEP+CSEP+CSEP
                        ).split(CSEP);
                   
                    var i=0;
                    var sigLine=[];
                    for (i=0;i< 6;i++) { sigLine.push(data[i]); }  
                    
                    var moneyLine=[];
                    for (i=6;i<14;i++) { moneyLine.push(data[i]); }  

                    iSaldo += BigInt(jPrettyTXN.strSaldo);
                    
                    arrHistory.push({'sig':sigLine.join(CSEP),'money':moneyLine.join(CSEP), 'saldo':""+(iSaldo) });
                                 
                }
            }
//            let rHistory=arrHistory.reverse();

            for (let i=1;i<SCREEN_TXNS;i++) arrHistory.push({sig:CSEP+CSEP+CSEP+CSEP+CSEP,money:CSEP+CSEP+CSEP+CSEP+CSEP+CSEP});
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

function TXNReceipt(sym,sum,id) {
    let amounts = aSelMoney[sym];
    let level7="";
    let level6="";
    let level5="";
    let level4="";
    let level3="";
    let level2="";
    let level1="";
    let level0="";
    level0=aSelSaldo[sym]; 
    if(level0==VOID) id="";
    if(amounts) { 
        if(amounts.length>0) { level7=amounts[0];
            if(amounts.length>1) { level6=amounts[1];
                if(amounts.length>2) { level5=amounts[2];
                    if(amounts.length>3) { level4=amounts[3];
                        if(amounts.length>4) { level3=amounts[4];
                            if(amounts.length>5) { level2=amounts[5];
                                if(amounts.length>6) { level1=amounts[6];
                                    
                                    
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return(
        <div className="SWITCH" id="PageContentReceipt">
            <div className="BIGCELL">
                <BalanceRow text={aSelText[sym].join(' ')} level7={level7} level6={level6} level5={level5} level4={level4} level3={level3} level2={level2} level1={level1} level0={level0}/>
                {id}
            </div>
        </div>
)}      

function BalanceRow({text,level7,level6,level5,level4,level3,level2,level1,level0,id}) { 
    return (
        <div className="attrLine">
            <div className="FIELD L280">{text}</div>
            <div className="FIELD MOAM">{level7}</div>
            <div className="FIELD MOAM">{level6}</div>
            <div className="FIELD MOAM">{level5}</div>
            <div className="FIELD MOAM">{level4}</div>
            <div className="FIELD MOAM">{level3}</div>
            <div className="FIELD MOAM">{level2}</div>
            <div className="FIELD MOAM">{level1}</div>
            <div className="FIELD MOAM">{level0}</div>
            <div className="FIELD MOAM">{id}</div>
        </div>
    )
}

