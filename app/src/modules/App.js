/* global BigInt */

import { D_Balance, D_History, D_Report, D_Schema, D_Page, X_ASSETS, X_EQLIAB, X_INCOME, J_ACCT, COLMIN, DOUBLE, SCREENLINES } from '../terms.js'

import { bigEUMoney, cents2EU } from './money'

const HTMLSPACE=" "; 

export const CSEP = ';';
export const S_COLUMN = 15;
export const iCpField = 35;

export function prettyTXN(jHistory,hash,lPattern,aPattern,names,aLen,eLen) {

    var iBalance=0n;
    var iSaldo=0n;
    var result={};

    var entry = [];
    var credit = [HTMLSPACE];
    var debit = ['AN'];//['','AN'];
    var aNames = [];
    var aAmount = [];
    var delta = [];
    var txnAcct = false;

    let parts = jHistory[hash];
    if(parts && parts.length>2) {


        // GH20220701
        let txnLine = parts.join('');
        if(!lPattern || txnLine.toLowerCase().includes(lPattern.toLowerCase())) {


            // GH20220703
            txnAcct = (!aPattern || aPattern.length<2);



            // skip hash or index
            for(var i=1;i<J_ACCT && i<parts.length;i++) {
                if(parts[i] && parts[i].length>COLMIN) 
                    entry.push(parts[i].substring(0,iCpField)); 
                else entry.push(' ');                
            }
            
            for(var j=J_ACCT;j<parts.length;j++) {
                if(parts[j] && parts[j].length>0 && j!=aLen && j!=eLen && parts[j]!='0') { 
                    
                    // GH20220307 EU-style numbers with two decimal digits
                    let strCents = parts[j].replace('.','').replace(',','');
                    console.log("strCents="+strCents);
                    let item = BigInt(strCents); 

                    // GH20220703
                    if(    !txnAcct
                        && names[j] && names[j].length>1 
                        && aPattern && aPattern.length>1 
                        && names[j].toLowerCase().includes(aPattern.toLowerCase())) {
                            txnAcct=true;
                            iSaldo += item; // BigInt
                        }


//                    if(item!=0) {// Money
//                        delta.push(names[j]+DOUBLE+parts[j]); 
//
//                        // GH20220307
//                        let value = bigEUMoney(parts[j]);
//                        if(j<aLen) iBalance += value;
//                        else if(j!=aLen && j!=eLen) iBalance -= value;
//                        //console.dir("ADD "+parts[j]+ " --> "+value.cents+"  --> "+iBalance);
//                    }

                    aNames.push(names[j]);   
                    aAmount.push(parts[j]);   

                    // POS ASSET
                    if(item>0n && j<aLen && j!=eLen) credit.push(names[j]+DOUBLE+parts[j]);                                        
                // Money
                    // NEG EQLIAB
                    if(item<0n && j>aLen && j!=eLen) credit.push(names[j]+DOUBLE+parts[j].replace('-',''));
                // Money
                    // NEG ASSET
                    if(item<0n && j<aLen && j!=eLen) debit.push(names[j]+DOUBLE+parts[j].replace('-',''));
                // Money
                    // POS EQLIAB
                    if(item>0n && j>aLen && j!=eLen) debit.push(names[j]+DOUBLE+parts[j]);
                // Money
                
                }                
            }
        }
    }

    result.txnAcct=txnAcct;
    result.entry=entry;
    result.delta=delta;
    result.credit=credit;
    result.debit=debit;
    result.strBalance=""+iBalance;
    result.aNames=aNames;
    result.aAmount=aAmount;
    result.strSaldo=""+iSaldo;
    return result;
}

export function prepareTXN(schema,flow, name,amount) {
    
    var balanceNames=schema.Names;
    var aLen =       schema.assets;
    var eLen =       schema.eqliab;


    var newCredit=flow.credit;
    var newDebit=flow.debit;

    if(balanceNames && balanceNames.length>2) {
        for(var i=J_ACCT;i<balanceNames.length;i++) {
            if(balanceNames[i] && balanceNames[i].length>0 && i!=aLen && i!=eLen && balanceNames[i]===name 
                && amount && amount !='0') { 
                
                let iValue = bigEUMoney(amount);
                let entry = { index:i, value: cents2EU(iValue) }
                if(i<aLen && i!=eLen) {newCredit[name]=entry;}
                if(i>aLen && i!=eLen) {newDebit[name]= entry;}
            }
        }
    }

    flow = { 'credit':newCredit, 'debit':newDebit };
    console.dir("prepareTXN "+JSON.stringify(flow));
    return flow;
}


export function getParam(strParam) {
    
    var searchParams = new URL(window.location.href).searchParams;
    return searchParams.get(strParam);
}

export function symbolic(pat) {   
    var res = 0;
    if(pat) {
        var sequence = ' '+pat+pat+pat;
        var base=71;
        for(let p=0;p<sequence.length && p<80;p++) {
            res = (res + sequence.charCodeAt(p) & 0x1FFFFFFEF)*base;  
        }
    }
    return res & 0x3FFFFFFFF;
}


export function makeStatusData(response) {

    const page = response[D_Page];
    
    let iFixed=0n;
    let iEquity=0n;
    let iTan=0n;

    let ass="{close:0}";
    let eql="{close:0}";
    let gls="{close:0}";

    var jReport = response[D_Report];
    console.log("makeStatusData from response D_Report"+JSON.stringify(Object.keys(jReport)));

    var jHistory = response[D_History];
    var gSchema = response[D_Schema];

    var jAccounts = response[D_Balance];
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
    console.log("makeStatusData from response D_Balance"+JSON.stringify(Object.keys(jAccounts)));

    console.log(JSON.stringify(response));
    
    // build three columns
    let aLeft={};
    let aMidl={};
    let aRite={};

    for (let name in jAccounts)   {
        var account=jAccounts[name];
        if(account.xbrl.length>1) {
            var xbrl = account.xbrl.split('\.').reverse();
            var xbrl_pre = xbrl.pop()+ "."+ xbrl.pop();
            if(xbrl_pre===X_ASSETS) {
                aLeft[name]=account;
                let iClose=BigInt(account.init)+BigInt(account.debit)+BigInt(account.credit); ;
                if(account.xbrl.startsWith(jReport.xbrlFixed.xbrl)) { // accumulate fixed assets
                    iFixed = iFixed + iClose;
                    if(account.xbrl.startsWith(jReport.xbrlTanFix.xbrl)) { // accumulate tangible fixed assets
                        iTan = iTan + iClose;
                    }
                }
            }
            if(xbrl_pre===X_INCOME) {
                aMidl[name]=account;
            }
            if(xbrl_pre===X_EQLIAB) {
                aRite[name]=account;
                if(account.xbrl.startsWith(jReport.xbrlEquity.xbrl)) { // accumulate equity
                    iEquity = iEquity + BigInt(account.init)+BigInt(account.debit)+BigInt(account.credit); 
                }
            }
        }
    }
    
    let maxCol = Object.keys(aLeft).length;
    let maxCom = Object.keys(aMidl).length;
    let maxCor = Object.keys(aRite).length;
    let maxRow= SCREENLINES;
    if(maxCol>maxRow) maxRow=maxCol;
    if(maxCom>maxRow) maxRow=maxCom;
    if(maxCor>maxRow) maxRow=maxCor;

    let statusData = []; for(let i=0;i<=maxRow && i<=SCREENLINES;i++) statusData[i]={};
    if(maxRow>SCREENLINES) maxRow=SCREENLINES; // 20221201
    
    let iLeft=0;
    statusData[iLeft++].gLeft= page.Assets;

    for (let name in aLeft)   {
        var account=aLeft[name];
        var yearEnd = account.yearEnd;
        var iName = account.name;

        console.log("STATUS.JS STATUSDATA LEFT "+iLeft+" "+name+"="+yearEnd);

        if(iLeft<SCREENLINES) {
            statusData[iLeft]={"gLeft":yearEnd,"nLeft":iName};
        }
        iLeft++;
    }
    for (let i=iLeft;i<maxRow && i<SCREENLINES;i++) { statusData[i]={ "gLeft":null, "nLeft": " " }; }


    let iMidl=0;
    statusData[iMidl++].gMidl= page.GainLoss;

    for (let name in aMidl)   {
        var account=aMidl[name];
        var yearEnd = account.yearEnd;
        var iName = account.name;

        statusData[iMidl].gMidl = yearEnd;
        statusData[iMidl].nMidl = iName;
        iMidl++;
    }
    for (let i=iMidl;i<maxRow && i<SCREENLINES;i++) { statusData[i].gMidl=null; statusData[i].nMidl=' '; }


    let iRite=0;
    statusData[iRite++].gRite= page.eqliab;

    for (let name in aRite)   {
        var account=aRite[name];
        var yearEnd = account.yearEnd;
        var iName = account.name;

        if(iRite<SCREENLINES) {
            statusData[iRite].gRite = yearEnd;
            statusData[iRite].nRite = iName;
            iRite++;
        }
        
    }
    for (let i=iRite;i<maxRow && i<SCREENLINES;i++) { statusData[i].gRite=null; statusData[i].nRite=' '; }

    // build fourth column with recent transactions

   // let iHistory=Object.keys(jHistory).map((x) => (x));

    if(jHistory && gSchema.Names && gSchema.Names.length>0) {
        var names=gSchema.Names;
        var aLen = gSchema.assets;
        var eLen = gSchema.eqliab;

        let hLen = Object.keys(jHistory).length;
        var bLine=hLen;
        var iTran=maxRow;

        statusData[0].lTran= "Recent Transactions";

        for (let hash in jHistory)  {

            //console.log("Recent TXN("+hash+") #iTran="+iTran+ "      #bLine="+bLine+"    #maxRow="+maxRow);

            if(bLine<maxRow && iTran>0) {
        
                let jPrettyTXN = prettyTXN(jHistory,hash,null,null,names,aLen,eLen);
                jPrettyTXN.credit.shift();
//                jPrettyTXN.debit.shift();
                jPrettyTXN.debit.shift();
                let aMount=jPrettyTXN.credit.concat(jPrettyTXN.debit);
                aMount.push("-.--"); aMount.push("-.--"); aMount.push("-.--");

                let sAmount = (aMount[0]+"  "+aMount[1]+"  "+aMount[2]+"  "+aMount[3]+ " ").slice(0,iCpField);

                iTran--;
                statusData[iTran].dTran=jPrettyTXN.entry[0].slice(2);
                statusData[iTran].nTran=jPrettyTXN.entry[1].slice(0,16);
                statusData[iTran].lTran= sAmount;                                
            }
            bLine--;
        }
    }
    
   return {report:statusData, ass:ass.yearEnd, eql:eql.yearEnd, gls:gls.yearEnd, fix:(""+iFixed), equity:(""+iEquity), tan:(""+iTan)};
}


export function makeHGB275S2Report(response) {

    let balance = []; 

    var jReport = response[D_Report];
    
    console.log("makeReport from response D_Report"+JSON.stringify(Object.keys(jReport)));
    var jAccounts = response[D_Balance];
    let page = response[D_Page];
              
    if(page) {           
        var chgb1 = 0n; // Umsatz
        var chgb5 = 0n; // MAT+RHB+Leistungen direkter Aufwand
        // Bruttoergebnis

        var chgb7 = 0n; // Abschreibungen Sachanlagen
        var chgb8 = 0n; // sonstige betr. Aufwand
        // Ergebnis

        var chgb9 = 0n; // Ertrag aus Beteiligungen
        var chgbA = 0n; // Wertpapierertrag
        var chgbB = 0n; // Zinseinnahmen
        var chgbD = 0n; // Zinsaufwand
        var chgbE = 0n; // gezahlte Steuern v Einkommen und Ertrag
        var chgbF = 0n; // Steuerforderung d Gesellschafter
        // Jahresueberschuss

        var cAvgFix = 0n; // betriebsnotwendiges Vermoegen
        var cAvgCur = 0n; // mittleres Umlaufvermoegen
        var cReceiv = 0n; // Forderungen



        for (let name in jAccounts)   {
            var account=jAccounts[name];
            var init = account.init;
            var yearEnd = account.yearEnd;
            var iName = account.name;
            var full_xbrl = account.xbrl;



            if(yearEnd && iName && full_xbrl) {
                
                if(full_xbrl.startsWith('de-gaap-ci_bs.ass.fixAss'))  { cAvgFix = cAvgFix +(BigInt(init)+BigInt(yearEnd))/2n; console.log("BNV  "+name+"="+cAvgFix); }  
                if(full_xbrl.startsWith('de-gaap-ci_bs.ass.currAss')) { cAvgCur+=(BigInt(init)+BigInt(yearEnd))/2n; console.log("DUV  "+name+"="+cAvgCur); }
                if(full_xbrl.startsWith('de-gaap-ci_bs.ass.currAss.receiv')) { cReceiv-=BigInt(yearEnd);                     console.log("FOR  "+name+"="+cReceiv); }
                if(full_xbrl.startsWith('de-gaap-ci_bs.ass.currAss.receiv.other.otherTaxRec')) { chgbF+=BigInt(yearEnd); console.log("TAX  "+name+"("+yearEnd+")="+chgbF);  } // 20220521 keep tax claims separately

                // MIET / rent was 'de-gaap-ci_is.netIncome.regular.operatingTC.yearEndTradingProfit'
                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.operatingTC.grossTradingProfit')) { chgb1+=BigInt(yearEnd); }
                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.operatingTC.otherCost.fixingLandBuildings')) { chgb5+=BigInt(yearEnd); }

                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.operatingTC.deprAmort.fixAss.tan')) { chgb7+=BigInt(yearEnd); }
                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.operatingTC.otherCost.otherOrdinary')) { chgb8+=BigInt(yearEnd); }
                
                // EZIN = de-gaap-ci_is.netIncome.regular.fin.netInterest.income
                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.fin.netParticipation')) { chgb9+=BigInt(yearEnd); }
                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.fin.sale')) { chgbA+=BigInt(yearEnd); }
                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.fin.netInterest')) { chgbB+=BigInt(yearEnd);  console.log("EZIN = "+yearEnd+ " from "+JSON.stringify(account)); }
                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.fin.expenses')) { chgbD+=BigInt(yearEnd); }
                if(full_xbrl.startsWith('de-gaap-ci_is.is.netIncome.tax')) { chgbE-=BigInt(yearEnd); }

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
        balance.push({ 'tw1':jReport.xbrlEqLiab.de_DE, 'am3':page.Init, 'am2':page.Close, 'am1':page.Next });

 
        for (let name in aRite)   {
            var account=aRite[name];

            var iName = account.name;
            var cBegin= BigInt(account.init);
            var cClose = BigInt(account.yearEnd);
            var cNext = BigInt(account.next);
            console.log("EqLiab account ="+JSON.stringify(account));
    
           iLeft = fillLeft(balance,cBegin,cClose,cNext,iName,iLeft);
        }

        fillRight(balance,chgb1,page.Revenue,0,1);
        fillRight(balance,chgb5,page.OpCost,1,1);
        fillRight(balance,grossYield,page.GrossYield,2,2);
        // Bruttoergebnis

        fillRight(balance,chgb7,page.Depreciation,4,1); 
        fillRight(balance,chgb8,page.OtherOTC,5,1);
        fillRight(balance,chgb7+chgb8,page.OtherRegular,6,2);
        fillRight(balance,regularOTC,page.RegularOTC,7,3);
        // Ergebnis

        fillRight(balance,chgb9,page.PartYield,8,1);
        fillRight(balance,chgbA,page.FinSale,9,1);
        fillRight(balance,chgbB,page.NetInterest,10,1);
        fillRight(balance,chgbD,page.InterestCost,11,1);
        
        let fin = chgb9+chgbA+chgbB+chgbD;
        fillRight(balance,fin,page.FinYield,12,3);
        let gain = regularOTC+fin;
        // Jahresueberschuss
        fillRight(balance,gain,page.closing,13,3);
        fillRight(balance,-chgbF,page.CapTax,14,3); // -- this part needed for 
        let netGain = gain-chgbF;
        fillRight(balance,netGain,"Netto-Gewinn",16,3);

        fillRight(balance,cAvgFix,page.OpAssets,17,1);
        fillRight(balance,cAvgCur,page.AvgCurrent,18,1);
        fillRight(balance,cReceiv,page.rec,19,1);
        let opCap = cAvgFix+cAvgCur+cReceiv;
        fillRight(balance,opCap,page.OpCapital,21,3);
        let performanceBP = (10000n*netGain)/opCap;
        iRite=fillRight(balance,performanceBP,page.CapMargin,22,3);
        
        }
    while(iRite<=SCREENLINES && iLeft<=SCREENLINES) {
        balance.push({  });
        iLeft++;
        iRite++;
    }

    return balance;
}

function fillLeft(balance,dispValue1,dispValue2,dispValue3,iName,iLeft) {
    if(iLeft<SCREENLINES) {
        if(!balance[iLeft]) balance[iLeft]={};
        balance[iLeft].tw1=iName;
        let cValue1=cents2EU(dispValue1);
        let cValue2=cents2EU(dispValue2);
        let cValue3=cents2EU(dispValue3);
        balance[iLeft].am3=cValue1; 
        balance[iLeft].am2=cValue2; 
        balance[iLeft].am1=cValue3; 
        
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
