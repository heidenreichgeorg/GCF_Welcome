
/* global BigInt */

const debug=false;


import { useEffect, useState, useRef } from 'react';

import Screen from './Screen.js'
import FooterRow from '../components/FooterRow.js'
import { addTXNData, FieldRow, InputRow }  from '../modules/App.js';
import { cents2EU, bigEUMoney }  from '../modules/money';
import { book, prepareTXN } from '../modules/writeModule.js';
import { D_Balance, D_FixAss, D_Page, D_Report, D_Schema, SCREENLINES, X_ASSETS, X_EQUITY, X_EQLIAB, X_INCOME, X_INCOME_REGULAR } from '../modules/terms.js'
import { getSession,resetSession,useSession } from '../modules/sessionmanager.js';

export default function Operations() {
    
    const [sheet, setSheet]  = useState() // returns a pair with object-location plus setter function for that location
    const [ year, setYear]   = useState()
    const [client,setClient] = useState()
    const [txn,setTxn] = useState({'add':{},'sub':{},'diff':"0", 'date':"", 'sender':"", 'refAcct':"", 'reason':"", 'reasonInfo':"", 'refCode':""  })

    const { session, status } = useSession()

    function ignore(e) { e.preventDefault(); }

    useEffect(() => {
        if(status !== 'success') return;
        setYear(session.year);
        setClient(session.client);
        let state=getSession();
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
        }
    }, [status])

    if(!sheet) {      
        return 'Loading...';
    }

  
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/HGB275S2Page?client="+client+"&year="+year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/Partner?client="+client+"&year="+year; }
      
    let page = sheet[D_Page];
    let sheet_status = makeOperationsForm(sheet,txn.add,txn.sub);
    let report = sheet_status.report;

//<form onSubmit={(e)=>(console.log("BOOKf "+JSON.stringify(txn)))} >                
//  </form>
    function onBook() {
        let flow = { 'credit':{}, 'debit':{} };
        Object.keys(txn.add).map(function(name,i) {flow=prepareTXN(sheet[D_Schema],flow,name,cents2EU(txn.add[name]))});
        Object.keys(txn.sub).map(function(name,i) {flow=prepareTXN(sheet[D_Schema],flow,name,cents2EU(txn.sub[name]))});

        console.log("BOOK F "+JSON.stringify(flow));

        txn.credit = flow.credit;
        txn.debit = flow.debit;
        
        // refAcct reason refCode missing

        console.log("BOOK B "+JSON.stringify(txn));

        // GH20230205
        // WITH SERVER-SIDE SESSION MANAGEMENT
        txn.sessionId = session.id; // won't book otherwise
        // WITH CLIENT-SIDE CLIENT/YEAR as PRIM KEY
        txn.year=year;
        txn.client=client;


        book(txn,session); 

        resetSession();
        // invalidate current session

        console.log("BOOK O booked.");
  
    }

    // build refAcct list with all GALS / EQUITY account names
    var jAccounts = sheet[D_Balance];
    let arrAcct=['INVEST','SELL','YIELD'];
    let arrInfo=['Activate all investment-related cost. No gain/equity move allowed.','Remaining gains go to FSAL','Remaining gains go to EDIV or EZIN or decrease the asset value.'];

    for (let name in jAccounts)   {
        var account=jAccounts[name];
        if(account.xbrl.length>1) {
            var xbrl = account.xbrl.split('\.').reverse();
            var xbrl_pre = xbrl.pop()+ "."+ xbrl.pop();
            if(xbrl.length>2) { // minimum of five levels in original xbrl, because of the two modifying pop(s)
                if((xbrl_pre===X_INCOME) || (xbrl_pre===X_EQLIAB)) { arrAcct.push(name); arrInfo.push("Gain/loss go to this account:"+name); console.log("Operations make arrAcct list add "+name);}
            }
        }

    }
    addTXNData(txn,'refAcct',arrAcct[0]);

        
    // build cRef2 = refCode list with assets codes
    var jAssets = sheet[D_FixAss];
    let arrCode=['DEP_MONEY',"DEP_IN_KIND","FEE","WITHDRAW","ADJUST"];
    Object.keys(jAssets).map(function(key,n) {
        var row = jAssets[key];
        arrCode.push(row.idnt);
    });
    addTXNData(txn,'refCode',arrCode[0]);


    const aNums = [0];
    return (
            <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aNums} >            
            {
                report.map((row,l) => (
                    <StatusRow  key={"Operations0"+l} 
                               am1={row.gAsset}  tx1={row.nAsset}  tt1={row.tAsset} 
                               am2={row.gLiab}   tx2={row.nLiab}   tt2={row.tLiab} 
                               am3={row.gGain}   tx3={row.nGain}   tt3={row.tGain}
                               am4={row.gEquity} tx4={row.nEquity} tt4={row.tEquity} /> 
                ))
            }
            <InputRow arrAcct={arrAcct} arrCode={arrCode} txn={txn}/>    
            <FieldRow/>
            <div className="attrRow">
                <input type="submit" className="key" value="Book" onClick={onBook}/>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD KEY">{cents2EU(txn.diff)}</div>                        
                <div className="FIELD SEP"> &nbsp;</div>
            </div>

            <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
            <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
        </Screen>
    )   

    function StatusRow({ am1,tx1,tt1,   am2,tx2,tt2,  am3,tx3,tt3,  am4,tx4,tt4}) {
        return(
            <div className="attrRow">
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM">{(tt1=='A')?(<input style={{'textAlign':'right'}} defaultValue={cents2EU(am1)} onChange={(e)=>addAccount(tx1,e.target.value)}/>):""}</div>
                <div className="FIELD SYMB" onClick={(e)=>remAddAccount(tx1)} >{tx1}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM">{(tt2=='L')?(<input style={{'textAlign':'right'}} defaultValue={cents2EU(am2)} onChange={(e)=>subAccount(tx2,e.target.value)}/>):""}</div>
                <div className="FIELD SYMB" onClick={(e)=>remSubAccount(tx2)} >{tx2}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM">{cents2EU(am3)}</div>
                <div className="FIELD SYMB" onClick={(e)=>setsubAccount(tx3,cents2EU(txn.diff))}>{tx3}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM">{cents2EU(am4)}</div>
                <div className="FIELD SYMB" onClick={(e)=>setsubAccount(tx4,cents2EU(txn.diff))}>{tx4}</div>
                <div className="FIELD SEP">.</div>
            </div>
        )
    }
 
    
    
    function setDiff(txn) {
        var iValue=0n; 
        Object.keys(txn.add).map((name)=>(iValue=iValue+BigInt(txn.add[name]))); 
        Object.keys(txn.sub).map((name)=>(iValue=iValue-BigInt(txn.sub[name]))); 
        txn.diff=""+iValue;
        return txn;
    }

    function remAddAccount(shrtName) { delete txn.add[shrtName]; setTxn(JSON.parse(JSON.stringify(txn))); } // avoid update
    function remSubAccount(shrtName) { delete txn.sub[shrtName]; setTxn(JSON.parse(JSON.stringify(txn))); } // avoid update

    function plusAccount(shrtName,a) { txn.add[shrtName]=""+bigEUMoney(a); return txn; } // avoid update
    function addAccount(shrtName,a) { setTxn(setDiff(plusAccount(shrtName,a))); console.log("ADD("+a+") "+JSON.stringify(txn)); }
    
    function minusAccount(shrtName,a) { txn.sub[shrtName]=""+bigEUMoney(a); return txn; } // avoid update
    function subAccount(shrtName,a) { setTxn(setDiff(minusAccount(shrtName,a))); console.log("SUB("+a+") "+JSON.stringify(txn)); }

    function setsubAccount(shrtName,a) { 

        if(bigEUMoney(txn.sub[shrtName])!=0n) { 
            // remove entry
            delete txn.sub[shrtName]; 
            // re-render please
            setTxn(JSON.parse(JSON.stringify(txn)));
        }
        else {
            // re-render please
            setTxn(JSON.parse(JSON.stringify(setDiff(minusAccount(shrtName,a))))); 
        }
        console.log("SET("+a+") "+JSON.stringify(txn)); 
    }    

    
}



function makeOperationsForm(response,formAdd,formSub) {

    
    const page = response[D_Page];
    
    let iFixed=0n;
    let iEquity=0n;
    let iTan=0n;

    let ass="{close:0}";
    let eql="{close:0}";
    let gls="{close:0}";

    var jReport = response[D_Report];
    if(debug) console.log("makeOperationsForm from response D_Report"+JSON.stringify(Object.keys(jReport)));

 //   var jHistory = response[D_History];
 //   var gSchema = response[D_Schema];

    var jAccounts = response[D_Balance];
    // add three additional accounts: ASSETS, EQLIAB, GAINLOSS
    if(jReport["xbrlAssets"].account) { 
        ass = jReport["xbrlAssets"].account; 
        if(debug) console.log("ASSET "+JSON.stringify(ass)); 
        jAccounts["xbrlAssets"]=ass;
    }
    if(jReport["xbrlEqLiab"].account) { 
        eql = jReport["xbrlEqLiab"].account; 
        if(debug) console.log("EQLIB "+JSON.stringify(eql)); 
        jAccounts["xbrlEqLiab"]=eql;
    }
    if(jReport["xbrlRegular"].account) { 
        gls = jReport["xbrlRegular"].account; 
        if(debug) console.log("GALOS "+JSON.stringify(gls)); 
        jAccounts["xbrlRegular"]=gls;
    }
    if(debug) console.log("makeOperationsForm from response D_Balance"+JSON.stringify(Object.keys(jAccounts)));

    if(debug) console.log(JSON.stringify(response));
    
    // build three columns
    let aAsset={};
    let aGain={};
    let aEquity={};
    let aLiab={};

    for (let name in jAccounts)   {
        var account=jAccounts[name];
        if(account.xbrl.length>1) {
            var xbrl = account.xbrl.split('\.').reverse();
            var xbrl_pre = xbrl.pop()+ "."+ xbrl.pop();
            if(xbrl_pre===X_ASSETS) {
                aAsset[name]=account;
                let iClose=BigInt(account.init)+BigInt(account.debit)+BigInt(account.credit); ;
                if(account.xbrl.startsWith(jReport.xbrlFixed.xbrl)) { // accumulate fixed assets
                    iFixed = iFixed + iClose;
                    if(account.xbrl.startsWith(jReport.xbrlTanFix.xbrl)) { // accumulate tangible fixed assets
                        iTan = iTan + iClose;
                    }
                }
            }
            if(xbrl_pre===X_INCOME) {
                aGain[name]=account;
            }
            if(xbrl_pre===X_EQLIAB) {
                // Passivkonten
                if(account.xbrl.startsWith(jReport.xbrlEquity.xbrl)) { // accumulate equity
                    aEquity[name]=account;
                    iEquity = iEquity + BigInt(account.init)+BigInt(account.debit)+BigInt(account.credit); 
                }
                else {
                    aLiab[name]=account;
                }
            }
        }
    }
    
    let maxCol = Object.keys(aAsset).length;
    let maxCom = Object.keys(aGain).length;
    let maxCor = Object.keys(aLiab).length;
    let maxCoe = Object.keys(aEquity).length;
    let maxRow= SCREENLINES-2;
    if(maxCol>maxRow) maxRow=maxCol;
    if(maxCom>maxRow) maxRow=maxCom;
    if(maxCor>maxRow) maxRow=maxCor;
    if(maxCoe>maxRow) maxRow=maxCoe;

    let statusData = []; for(let i=0;i<=maxRow && i<=SCREENLINES;i++) statusData[i]={};
    if(maxRow>SCREENLINES) maxRow=SCREENLINES; // 20221201
    
    let iAsset=0;
    for (let name in aAsset)   {
        var account=aAsset[name];
        var yearEnd = account.yearEnd;
        var iName = account.name;

        if(debug) console.log("STATUS.JS STATUSDATA LEFT "+iAsset+" "+name+"="+yearEnd);

        if(iAsset<SCREENLINES) {
            statusData[iAsset]={"gAsset":formAdd[iName],"nAsset":iName, "tAsset":(account.xbrl!=X_ASSETS)?"A":""};
        }
        iAsset++;
    }
    for (let i=iAsset;i<maxRow && i<SCREENLINES;i++) { statusData[i]={ "gAsset":null, "nAsset": " " }; }


    let iLiab=0;
    for (let name in aLiab)   {
        var account=aLiab[name];
        var iName = account.name;
        if(iLiab<SCREENLINES) {
            statusData[iLiab].gLiab = formSub[iName];
            statusData[iLiab].nLiab = iName;
            statusData[iLiab].tLiab = !(account.xbrl==X_EQLIAB)?(account.xbrl.startsWith(X_EQUITY))?'E':'L':'';
            iLiab++;
        }
        
    }
    for (let i=iLiab;i<maxRow && i<SCREENLINES;i++) { statusData[i].gLiab=null; statusData[i].nLiab=' '; }


    let iGain=0;
    for (let name in aGain)   {
        var account=aGain[name];
        var iName = account.name;
        statusData[iGain].gGain = formSub[iName]; 
        statusData[iGain].nGain = iName;
        statusData[iGain].tGain = (account.xbrl!=X_INCOME_REGULAR)?'G':'';
        iGain++;
    }
    for (let i=iGain;i<maxRow && i<SCREENLINES;i++) { statusData[i].gGain=null; statusData[i].nGain=' '; }


    let nEquity=0;
    for (let name in aEquity)   {
        var account=aEquity[name];
        var iName = account.name;
        statusData[nEquity].gEquity = formSub[iName];
        statusData[nEquity].nEquity = iName;
        statusData[nEquity].tEquity = account.xbrl!=X_EQUITY?'E':'E';
        nEquity++;
    }
    for (let i=nEquity;i<maxRow && i<SCREENLINES;i++) { statusData[i].gEquity=null; statusData[i].nEquity=' '; }

    // four columns: assets liab gain equity


   return {report:statusData, ass:ass.yearEnd, eql:eql.yearEnd, gls:gls.yearEnd, fix:(""+iFixed), equity:(""+iEquity), tan:(""+iTan)};
}

