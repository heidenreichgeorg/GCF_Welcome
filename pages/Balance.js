/* global BigInt */

import { useEffect, useState  } from 'react';

import { cents2EU } from '../modules/money.mjs'
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { D_Balance, D_Page, D_Report, D_Schema, X_ASSETS, X_EQLIAB, SCREENLINES }  from '../modules/terms.js';
import { getSession,useSession } from '../modules/sessionmanager';



export default function Balance() {

    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
    useEffect(() => {
        if(status !== 'success') return;
        let state=getSession();
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
        }
    }, [status])

    if(!sheet) return null; //'Loading...';

    
    function prevFunc() { console.log("CLICK PREVIOUS"); window.location.href="/Accounts?client="+session.client+"&year="+session.year; }
    function nextFunc() { console.log("CLICK NEXT");     window.location.href="/FixedAssets?client="+session.client+"&year="+session.year; }
    
    let page = sheet[D_Page];
    

    let pageNames = [ 'init',  'yearEnd','next'];    
    let report = pageNames.map((name) =>( makeBalance(sheet,name)  ));
       
    let aPages = ['block'];
    for(let p=1;p<report.length;p++) aPages[p]='none'; 
    
    let pageText =  ['Init',  'Close',  'Next'].map((name) =>( page[name] ));

    const tabName = 'BalanceContent';
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={pageText} tabName={tabName}>
            {report.map((balance,n) => (
                <div className="FIELD" key={"Balance0"+n} id={tabName+n} style= {{ 'display': aPages[n]}} >
                    <div className="attrLine">{[page.BalanceOpen,page.BalanceClose,page.BalanceNext][n] + ' ' + (parseInt(session.year))}</div>
                    {JSON.parse(balance).map((row,i) => ( 
                        <BalanceRow  key={"Balance"+n+"1"+i} jArgs={row} id={i} />    
                        
                    ))}
                    <FooterRow  id={"F1"}  left={page["client"]}   right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                    <FooterRow  id={"F2"}  left={page["reference"]}  right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                </div>
            ))}
        </Screen>
    )
}


function makeBalance(response,value) {

    const sReport = JSON.stringify(response[D_Report]);
    var jReport = JSON.parse(sReport);
    let balance = new Array();

    console.log("makeBalance 001 from response D_Report"+JSON.stringify(Object.keys(jReport)));

    var jAccounts = response[D_Balance];

    let ass,eql,gls;
    // add three additional accounts: ASSETS, EQLIAB, GAINLOSS
    if(jReport["xbrlAssets"].account) { 
        ass = jReport["xbrlAssets"].account; 
        //console.log("ASSET "+JSON.stringify(ass)); 
        jAccounts["xbrlAssets"]=ass;
    }
    if(jReport["xbrlEqLiab"].account) { 
        eql = jReport["xbrlEqLiab"].account; 
        //console.log("EQLIB "+JSON.stringify(eql)); 
        jAccounts["xbrlEqLiab"]=eql;
    }
    if(jReport["xbrlRegular"].account) { 
        gls = jReport["xbrlRegular"].account; 
        //console.log("GALOS "+JSON.stringify(gls)); 
        jAccounts["xbrlRegular"]=gls;
    }
    //console.log("makeBalance from response D_Balance"+JSON.stringify(Object.keys(jAccounts)));

    
    // build three columns
    let aLeft={};
    let aRite={};

    for (let name in jAccounts)   {
        var account=jAccounts[name];
        if(account.xbrl.length>1) {
            var xbrl = account.xbrl.split('\.').reverse();
            var xbrl_pre = xbrl.pop()+ "."+ xbrl.pop();
            if(xbrl_pre===X_ASSETS) aLeft[name]=account;            
            if(xbrl_pre===X_EQLIAB) aRite[name]=account;
        }
    }
    
    var iEqLiab=0n;
    var income=0n;

    
 
    var iRite=3;
    var iLeft=3;
    balance.push({  });
    const aTag = Object.keys(jReport);
    balance.push({ 'tw1':jReport.xbrlAssets.de_DE,/* 'am1': (""+aTag),*/ 'tx1':jReport.xbrlEqLiab.de_DE });

    for (let tt=0;tt<aTag.length;tt++)   {
        let tag=aTag[tt];
        console.log("makeBalance 005 Report "+JSON.stringify(jReport[tag]));
        
        var element    =  jReport[tag];
        var level     =  element.level;
        var account  = element.account;
        var dispValue = account[value]; // account.yearEnd;
        var iName    =    account.name;
        var full_xbrl  =  account.xbrl;

        if(dispValue && iName && full_xbrl) {
            // collect compute total right side amount
            if(full_xbrl==='de-gaap-ci_bs.eqLiab') { iEqLiab=BigInt(dispValue);  }
            if(full_xbrl==='de-gaap-ci_is.netIncome.regular') { income=BigInt(dispValue); }
            if(full_xbrl==='de-gaap-ci_bs.eqLiab.income') { 
                let bIncome=(income+iEqLiab); 
                //console.log("INCOME = "+bIncome);
                dispValue=bIncome;
            }

            var xbrl = full_xbrl.split('\.');
            var side = xbrl[1];
           
            console.log('makeBalance side='+side + "  in "+full_xbrl + "= "+dispValue);

            if(side=='ass') {
                if(iLeft<SCREENLINES) {
                    if(!balance[iLeft]) balance[iLeft]={};
                    balance[iLeft].tw1=iName;
                    let cValue=cents2EU(dispValue);
                    if(level==1) { balance[iLeft].am1=cValue; }
                    if(level==2) { balance[iLeft].am2=cValue; }
                    if(level==3) { balance[iLeft].am3=cValue; }
                    if(level==4) { balance[iLeft].am4=cValue; }
                    iLeft++;
                }
            } else {
                if(iRite<SCREENLINES) {
                    if(!balance[iRite]) balance[iRite]={};
                    let cValue=cents2EU(dispValue);
                    balance[iRite].tx1=iName;
                    if(level==1) { balance[iRite].an1=cValue; }
                    if(level==2) { balance[iRite].an2=cValue; }
                    if(level==3) { balance[iRite].an3=cValue; }
                    if(level==4) { balance[iRite].an4=cValue; }
                    iRite++;
                }
            }


        } else {
            // divider line out
            console.log('makeBalance unknown '+JSON.stringify(account));
        }
    }

    while(iRite<=SCREENLINES && iLeft<=SCREENLINES) {
        balance.push({  });
        iLeft++;
        iRite++;
    }

    return JSON.stringify(balance);
    /*
    return [ 
        { tw1:'Gebäude    ',   am3:' 7,35' },
        { tw1:'Grundstücke',   am3:'10,00' },
        { tw1:'Sachanlagen',   am2:'17,35',  tx1:'Stammkapital',  an2:'17,35' },
        { tw1:'Aktien',        am3:'80,55',  },
        { tw1:'Münzen',        am3:'17,00',  },
        { tw1:'Finanzanlagen', am2:'97,55',  tx1:'Kredite', an2:'97,55' },
        { tw1:'Aktiva',       am1:'114,90',  tx1:'Passiva',an1:'114,90' }
        ]
      */  
}


function BalanceRow({ jArgs, id }) {
    if(jArgs)
    return(
        <div className={"attrLine"} >
            <div className="FIELD LNAM"> {jArgs.tw1}</div>
            <div className="FIELD MOAM"> {jArgs.am4}</div>
            <div className="FIELD MOAM"> {jArgs.am3}</div>
            <div className="FIELD MOAM"> {jArgs.am2}</div>
            <div className="FIELD MOAM"> {jArgs.am1}</div>
            <div className="FIELD SEP">|&nbsp;</div>
            <div className="FIELD LNAM"> {jArgs.tx1}</div>
            <div className="FIELD MOAM"> {jArgs.an4}</div>
            <div className="FIELD MOAM"> {jArgs.an3}</div>
            <div className="FIELD MOAM"> {jArgs.an2}</div>
            <div className="FIELD MOAM"> {jArgs.an1}</div>
        </div>
    )
}

