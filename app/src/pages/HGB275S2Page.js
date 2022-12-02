import { useEffect, useState  } from 'react';

import { moneyString, cents2EU, setEUMoney,addEUMoney } from '../modules/money'
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { D_Balance, D_History, D_Page, D_Report, D_Schema, X_ASSETS, X_EQLIAB, SCREENLINES }  from '../terms.js';
import { useSession } from '../modules/sessionmanager';



export default function HGB275S2Page() {

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

    
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="https://"+session.server.addr+":3000/balance?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="https://"+session.server.addr+":3000/history?client="+session.client+"&year="+session.year; }

    let page = sheet[D_Page];
    
    let report = [  makeReport(sheet,'yearEnd') ];


    let aPages = [];
    for(let p=1;p<report.length;p++) aPages[p]='none'; 
    aPages[0]='block';
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aPages} >
            {report.map((balance,n) => ( 
                <div className="ulliTab" id={"PageContent"+n} style= {{ 'display': aPages[n]}} >
                    {balance.map((row,i) => (
                        <HGB275Row jArgs={row} id={i} />    
                    ))}
                    <FooterRow  id={"21"}  left={page["client"]}   right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                    <FooterRow  id={"22"}  left={page["reference"]}  right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                </div>
            ))}
        </Screen>
    )
}

function makeReport(response,value) {

    let balance = []; 

    var jReport = response[D_Report];
    console.log("makeReport from response D_Report"+JSON.stringify(Object.keys(jReport)));
    var jAccounts = response[D_Balance];
    let page = response[D_Page];
              
    if(page) {           
        var chgb1 = 0; // Umsatz
        var chgb5 = 0; // MAT+RHB+Leistungen direkter Aufwand
        // Bruttoergebnis

        var chgb7 = 0; // Abschreibungen Sachanlagen
        var chgb8 = 0; // sonstige betr. Aufwand
        // Ergebnis

        var chgb9 = 0; // Ertrag aus Beteiligungen
        var chgbA = 0; // Wertpapierertrag
        var chgbB = 0; // Zinseinnahmen
        var chgbD = 0; // Zinsaufwand
        var chgbE = 0; // gezahlte Steuern v Einkommen und Ertrag
        var chgbF = 0; // Steuerforderung d Gesellschafter
        // Jahresueberschuss

        var cAvgFix = 0; // betriebsnotwendiges Vermoegen
        var cAvgCur = 0; // mittleres Umlaufvermoegen
        var cReceiv = 0; // Forderungen



        for (let name in jAccounts)   {
            var account=jAccounts[name];
            var init = account.init;
            var yearEnd = account.yearEnd;
            var iName = account.name;
            var full_xbrl = account.xbrl;



            if(yearEnd && iName && full_xbrl) {
                if(full_xbrl.startsWith('de-gaap-ci_bs.ass.fixAss'))  { cAvgFix+=(setEUMoney(init).cents+setEUMoney(yearEnd).cents)/2; console.log("BNV  "+name+"="+cAvgFix); }
                if(full_xbrl.startsWith('de-gaap-ci_bs.ass.currAss')) { cAvgCur+=(setEUMoney(init).cents+setEUMoney(yearEnd).cents)/2; console.log("DUV  "+name+"="+cAvgCur); }
                if(full_xbrl.startsWith('de-gaap-ci_bs.ass.currAss.receiv')) { cReceiv-=setEUMoney(yearEnd).cents;                     console.log("FOR  "+name+"="+cReceiv); }
                if(full_xbrl.startsWith('de-gaap-ci_bs.ass.currAss.receiv.other.otherTaxRec')) { chgbF+=setEUMoney(yearEnd).cents; console.log("TAX  "+name+"("+yearEnd+")="+chgbF);  } // 20220521 keep tax claims separately

                // MIET / rent was 'de-gaap-ci_is.netIncome.regular.operatingTC.yearEndTradingProfit'
                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.operatingTC.grossTradingProfit')) { chgb1+=setEUMoney(yearEnd).cents; }
                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.operatingTC.otherCost.fixingLandBuildings')) { chgb5+=setEUMoney(yearEnd).cents; }

                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.operatingTC.deprAmort.fixAss.tan')) { chgb7+=setEUMoney(yearEnd).cents; }
                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.operatingTC.otherCost.otherOrdinary')) { chgb8+=setEUMoney(yearEnd).cents; }
                
                // EZIN = de-gaap-ci_is.netIncome.regular.fin.netInterest.income
                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.fin.netParticipation')) { chgb9+=setEUMoney(yearEnd).cents; }
                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.fin.sale')) { chgbA+=setEUMoney(yearEnd).cents; }
                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.fin.netInterest')) { chgbB+=setEUMoney(yearEnd).cents;  console.log("EZIN = "+yearEnd+ " from "+JSON.stringify(account)); }
                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.fin.expenses')) { chgbD+=setEUMoney(yearEnd).cents; }
                if(full_xbrl.startsWith('de-gaap-ci_is.is.netIncome.tax')) { chgbE-=setEUMoney(yearEnd).cents; }

               // console.log("READ xbrl="+full_xbrl+" "+chgb5+" "+chgb7+" "+chgb8+" "+chgbA+" "+chgbB+" "+chgbD+" "+chgbE+" "+chgbF);
            }

        }

        let grossYield = chgb5+chgb1;
    //                    cursor=printFormat(cursor,[' ',page.Revenue,cents2EU(chgb1)]);
    //                    cursor=printFormat(cursor,[' ',page.DirectCost,cents2EU(chgb5)]);
    //                    cursor=printFormat(cursor,['Gross Yield',' ',page.yearEndYield,cents2EU(grossYield)]);


        let regularOTC = grossYield+chgb7+chgb8;
    //                    cursor=printFormat(cursor,[' ',page.Depreciation,cents2EU(chgb7)]);
    //                    cursor=printFormat(cursor,[' ',page.OtherRegular,cents2EU(chgb8)]);
    //                    cursor=printFormat(cursor,['EBITDA',' ',page.RegularOTC,cents2EU(regularOTC)]);





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
        console.log("makeReport from response D_Balance"+JSON.stringify(Object.keys(jAccounts)));

        
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

    
        var iRite=2;
        var iLeft=1;
        //balance.push({  });
        balance.push({ 'tw1':jReport.xbrlEqLiab.de_DE, 'tx1':jReport.xbrlEqLiab.de_DE });

 
        for (let name in aRite)   {
            var account=aRite[name];

            var iName = account.name;
            var cBegin= account.init;
            var cNext = account.next;
            console.log("EqLiab account ="+JSON.stringify(account));
    
            iLeft = fillLeft(balance,cBegin,cNext,iName,iLeft);
        }

        fillRight(balance,chgb1,"Umsatz",0,1);
        fillRight(balance,chgb5,"Betriebsaufwand",1,1);
        fillRight(balance,grossYield,"Bruttoergebnis",2,2);
        // Bruttoergebnis

        fillRight(balance,chgb7,"Abschreibungen Sachanlagen",4,1); 
        fillRight(balance,chgb8,"betriebl. Nebenkosten",5,1);
        fillRight(balance,chgb7+chgb8,"Sonst betri. Aufwand",6,2);
        // Ergebnis

        fillRight(balance,chgb9 ,"Ertrag aus Beteiligungen",8,1);
        fillRight(balance,chgbA,"Wertpapierertrag",9,1);
        fillRight(balance,chgbB,"Zinseinnahmen",10,1);
        fillRight(balance,chgbD,"Zinsaufwand",11,1);
        //fillRight(balance,chgbE,"gezahlte Steuern Ein+Ert",12,1);
        let fin = chgb9+chgbA+chgbB+chgbD-chgbF
        fillRight(balance,chgbF,"Steuerforderung d Gesel.",12,1);
        fillRight(balance,fin,"außerorden.Ergebnis",13,2);
        let gain = regularOTC+fin;
        // Jahresueberschuss
        fillRight(balance,gain,"Gewinn/Verlust",14,3);

        fillRight(balance,cAvgFix,"betriebsnotwendiges Ver.",15,1);
        fillRight(balance,cAvgCur,"mittleres Umlaufvermögen",16,1);
        fillRight(balance,cReceiv,"Forderungen",17,1);
        let opCap = cAvgFix+cAvgCur+cReceiv;
        fillRight(balance,opCap,"betriebsnotwendiges Kap.",18,2);
        let performanceBP = (10000*gain)/opCap;
        iRite=fillRight(balance,performanceBP,"Kapitalrendite",19,3);
        
        }
    while(iRite<=SCREENLINES && iLeft<=SCREENLINES) {
        balance.push({  });
        iLeft++;
        iRite++;
    }

    return balance;
}

function fillLeft(balance,dispValue1,dispValue2,iName,iLeft) {
    if(iLeft<SCREENLINES) {
        if(!balance[iLeft]) balance[iLeft]={};
        balance[iLeft].tw1=iName;
        balance[iLeft].am3=dispValue1; 
        balance[iLeft].am2=dispValue2; 
        
        iLeft++;
    }
    return iLeft;
}


function fillRight(balance,cValue,iName,iRite,level) {
    if(iRite<SCREENLINES) {
        if(!balance[iRite]) balance[iRite]={};
        balance[iRite].tx1=iName;
        let dispValue=cents2EU(cValue);
        if(level==3) { balance[iRite].an1=dispValue; }
        if(level==2) { balance[iRite].an2=dispValue; }
        if(level==1) { balance[iRite].an3=dispValue; }
        iRite++;
    }
    return iRite;
}


function HGB275Row({ jArgs, id }) {
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

