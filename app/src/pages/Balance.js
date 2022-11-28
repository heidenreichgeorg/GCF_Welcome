import { useEffect, useState  } from 'react';

import { moneyString, setEUMoney,addEUMoney } from '../modules/money'
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { D_Balance, D_History, D_Page, D_Report, D_Schema, X_ASSETS, X_EQLIAB, SCREENLINES }  from '../terms.js';
import { useSession } from '../modules/sessionmanager';



export default function Balance() {

    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
    useEffect(() => {
        if(status !== 'success') return;
        let state = null;
        try { state=JSON.parse(sessionStorage.getItem('session')); } catch(err) {}
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
        }
    }, [status])

    if(!sheet) return null; //'Loading...';

    
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="https://"+session.server.addr+":3000/transfer?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="https://"+session.server.addr+":3000/hgb275s?client="+session.client+"&year="+session.year; }

    let page = sheet[D_Page];
    
    let report = [ makeBalance(sheet,'init'), makeBalance(sheet,'yearEnd'), makeBalance(sheet,'next')  ];


    let aPages = [];
    for(let p=1;p<report.length;p++) aPages[p]='none'; 
    aPages[0]='block';
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aPages} >
            {report.map((balance,n) => ( 
                <div className="ulliTab" id={"PageContent"+n} style= {{ 'display': aPages[n]}} >
                    {balance.map((row,i) => (
                        <BalanceRow jArgs={row} id={i} />    
                    ))}
                    <FooterRow  id={"21"}  left={page["client"]}   right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                    <FooterRow  id={"22"}  left={page["reference"]}  right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                </div>
            ))}
        </Screen>
    )
}


function makeBalance(response,value) {

    var jReport = response[D_Report];
    console.log("makeBalance from response D_Report"+JSON.stringify(Object.keys(jReport)));

    var jHistory = response[D_History];
    var gSchema = response[D_Schema];

    var jAccounts = response[D_Balance];

    let ass,eql,gls;
    // add three additional accounts: ASSETS, EQLIAB, GAINLOSS
    if(jReport["xbrlAssets"].account) { 
        ass = jReport["xbrlAssets"].account; 
        console.log("ASSET "+JSON.stringify(ass)); 
        jAccounts["xbrlAssets"]=ass;
    }
    if(jReport["xbrlEqLiab"].account) { 
        eql = jReport["xbrlEqLiab"].account; 
        console.log("EQLIB "+JSON.stringify(eql)); 
        jAccounts["xbrlEqLiab"]=eql;
    }
    if(jReport["xbrlRegular"].account) { 
        gls = jReport["xbrlRegular"].account; 
        console.log("GALOS "+JSON.stringify(gls)); 
        jAccounts["xbrlRegular"]=gls;
    }
    console.log("makeBalance from response D_Balance"+JSON.stringify(Object.keys(jAccounts)));

    
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
    
    var mEqLiab={};
    var income="";

    let balance = []; 
 
    var iRite=2;
    var iLeft=2;
    balance.push({  });
    balance.push({ 'tw1':jReport.xbrlAssets.de_DE, 'tx1':jReport.xbrlEqLiab.de_DE });

    for (let tag in jReport)   {
        console.log("Report "+JSON.stringify(jReport[tag]));
        
        var element    =  jReport[tag];
        var level     =  element.level;
        var account  = element.account;
        var dispValue = account[value]; // account.yearEnd;
        var iName    =    account.name;
        var full_xbrl  =  account.xbrl;

        if(dispValue && iName && full_xbrl) {
            // collect compute total right side amount
            if(full_xbrl==='de-gaap-ci_bs.eqLiab') { mEqLiab=setEUMoney(dispValue);  dispValue=moneyString(mEqLiab); }
            if(full_xbrl==='de-gaap-ci_is.netIncome.regular') { income=dispValue; }
            if(full_xbrl==='de-gaap-ci_bs.eqLiab.income') { let mIncome=addEUMoney(income,mEqLiab); dispValue=moneyString(mIncome);}

            var xbrl = full_xbrl.split('\.');
            var side = xbrl[1];
            //var xbrl_pre = xbrl.pop()+'.'+xbrl.pop()+'.'+xbrl.pop();
            console.log('makeBalance side='+side);

            if(side==='ass') {
                if(iLeft<SCREENLINES) {
                    if(!balance[iLeft]) balance[iLeft]={};
                    balance[iLeft].tw1=iName;
                    if(level==1) { balance[iLeft].am1=dispValue; }
                    if(level==2) { balance[iLeft].am2=dispValue; }
                    if(level==3) { balance[iLeft].am3=dispValue; }
                    iLeft++;
                }
            } else {
                if(iRite<SCREENLINES) {
                    if(!balance[iRite]) balance[iRite]={};
                    balance[iRite].tx1=iName;
                    if(level==1) { balance[iRite].an1=dispValue; }
                    if(level==2) { balance[iRite].an2=dispValue; }
                    if(level==3) { balance[iRite].an3=dispValue; }
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

    return balance;
}


function BalanceRow({ jArgs, id }) {
    return(
        <div className={"attrLine line"+id} >
            <div className="LNAM"> {jArgs.tw1}</div>
            <div className="MOAM"> {jArgs.am3}</div>
            <div className="MOAM"> {jArgs.am2}</div>
            <div className="MOAM"> {jArgs.am1}</div>
            <div className="SEP">|&nbsp;</div>
            <div className="LNAM"> {jArgs.tx1}</div>
            <div className="MOAM"> {jArgs.an3}</div>
            <div className="MOAM"> {jArgs.an2}</div>
            <div className="MOAM"> {jArgs.an1}</div>
        </div>
    )
}

