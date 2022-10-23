import { useEffect, useState, useRef  } from 'react';

import { cents2EU, setEUMoney } from '../modules/App'
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { D_Balance, D_History, D_Page, D_Report, D_Schema, X_ASSETS, X_EQLIAB, X_INCOME, SCREENLINES }  from '../terms.js';
import { useSession } from '../modules/sessionmanager';


const SCREEN_TXNS=8;

export default function Balance() {

    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
    useEffect(() => {
        if(status !== 'success') return;
        fetch(`${process.env.REACT_APP_API_HOST}/SHOW?sessionId=${session.id}`)
        .then(data => data.json())
        .then(data => { setSheet(data);})
    }, [status]) 

    if(!sheet) return null; //'Loading...';

    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="http://localhost:3000/transfer" }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="http://localhost:3000/history"}

    let page = sheet[D_Page];
    let aPages = [];
    

    let report = makeBalance(sheet);

    const aNums = [0];
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aNums} >
            {
                report.map((row) => (
                    <BalanceRow jArgs={row}/>    
                ))
            }
            <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
            <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
        </Screen>
    )
}


function makeBalance(response) {


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
    
    let maxCol = 1+Object.keys(aLeft).length;
    let maxCom = 3+Object.keys(aRite).length;
    let maxRow= SCREENLINES;
    if(maxCol>maxRow) maxRow=maxCol;
    if(maxCom>maxRow) maxRow=maxCom;

    let balance = []; for(let i=0;i<=maxRow;i++) balance[i]={};
    
    let iLeft=0;
    balance[iLeft++].am1= "Assets";

    for (let name in aLeft)   {
        var account=aLeft[name];
        var gross = account.gross;
        var iName = account.name;

        console.log("BALANCE.JS makeBalance LEFT "+iLeft+" "+name+"="+gross);

        balance[iLeft]={"am1":gross,"tw1":iName};
        iLeft++;
    }

    for (let i=iLeft;i<maxRow;i++) { balance[i]={ "am1":" ", "tw1": " " }; }





    let iRite=0;    
    for (let name in aRite)   {
        var account=aRite[name];
        var gross = account.gross;
        var iName = account.name;
        balance[iRite].am2=gross;balance[iRite].tw2=iName;
        iRite++;
    }

    if(gls) {
        balance[iRite].am2= gls.gross;
        balance[iRite].tw2= gls.name;
        iRite++;
        
        balance[iRite].am2 = cents2EU(  
            setEUMoney(gls.gross).cents
            +setEUMoney(eql.gross).cents );
    }
    balance[iRite].tw2= "Equity/Liab";
    iRite++;

    for (let i=iRite;i<maxRow;i++) { balance[i].am2=" ";balance[i].tw2=" "; }; 

    return balance;
}

function BalanceRow({ jArgs }) {
    return(
        <div class="attrLine">
            <div class="R90"> {jArgs.am1}</div>
            <div class="L66"> {jArgs.tw1}</div>
            <div class="L66"> {jArgs.tx1}</div>
            <div class="L66"> {jArgs.ty1}</div>
            <div class="L66"> {jArgs.tz1}</div>
            <div class="L22">|&nbsp;</div>
            <div class="R90"> {jArgs.am2}</div>
            <div class="L66"> {jArgs.tw2}</div>
            <div class="L66"> {jArgs.tx2}</div>
            <div class="L66"> {jArgs.ty2}</div>
            <div class="L66"> {jArgs.tz2}</div>
        </div>
    )
}

