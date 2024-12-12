const debug=null;


import { D_Balance, D_History, D_Report, D_Schema, D_Page, X_ASSETS, X_EQLIAB, X_EQUITY, X_INCOME, X_INCOME_REGULAR, SCREENLINES } from './terms.js'
import { cents2EU }  from '../modules/money.mjs';
import { iCpField, prettyTXN } from './writeModule'


export function getSelect(targetId) { 
    var elem = document.getElementById(targetId);
    if(elem) {
        let index=elem.selectedIndex;
        return elem.options[index].value;        
    }
    return null;
}

export function setSelect(targetId,value) { 
    var elem = document.getElementById(targetId);
    if(elem) {
        if(debug) console.log("App.setSelect "+targetId+" WITH "+value);
        let arrElem=elem.options;
        for(let i=0;i<arrElem.length;i++) {
            if(arrElem[i].value==value) {
                elem.selectedIndex=i;
                if(debug) console.log("App.setSelect OPTION "+i);
            }
        }
    }
    return null;
}


export function getValue(targetName) { 
    var elem = document.getElementById(targetName);
    if(elem) {
       
        return elem.value;        
    }
    return targetName;
}


export function getParam(strParam) {
    
    var searchParams = new URL(window.location.href).searchParams;
    return searchParams.get(strParam);
}


// STOP Left Rite Midl

export function makeStatusData(response) {

    const debug=null;

    const page = response[D_Page];
    
    let iDebit=0n;
    let iCredit=0n;
    let iFixed=0n;
    let iEquity=0n;
    let iTan=0n;
    let iLia=0n;
    let iCur=0n;
    let iTax=0n;

    let ass="{close:0}";
    let eql="{close:0}";
    let gls="{close:0}";

    var jReport = response[D_Report];
    if(debug) console.log("makeStatusData from response D_Report"+JSON.stringify(Object.keys(jReport)));

    var jHistory = response[D_History];
    var gSchema = response[D_Schema];

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


    // show all accounts omn console
    if(debug) console.log("makeStatusData from response D_Balance"+JSON.stringify(Object.keys(jAccounts)));    
    else console.log( Object.keys(jAccounts).map((name,i)=>("   "+name+": "+(jAccounts[name].xbrl))).join(" "));



    if(debug) console.log(JSON.stringify(response));
    
    // build four columns
    let aLeft={};
    let aMidl={};
    let aRite={};
    let aInco={};

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
                    if(debug) console.log("makeStatusData Fixed Assets: "+JSON.stringify(account))
                } else if(account.xbrl.startsWith(jReport.xbrlAcurr.xbrl)) { // accumulate current assets#
                    iCur = iCur + iClose;
                    if(debug) console.log("makeStatusData Currency Assets: "+JSON.stringify(account))

                    if(account.xbrl.startsWith(jReport.xbrlPaidTax.xbrl)) { // accumulate paid tax#
                        iTax = iTax + iClose;
                    }
                }
            }
            if(xbrl_pre===X_INCOME) {
                aMidl[name]=account;
                var iGaLs = BigInt(account.init)+BigInt(account.debit)+BigInt(account.credit); 
                
            }
            if(xbrl_pre===X_EQLIAB) {
                aRite[name]=account;
                iDebit=iDebit+BigInt(account.debit);
                iCredit=iCredit+BigInt(account.credit);
                var iClose = BigInt(account.init)+BigInt(account.debit)+BigInt(account.credit); 
                if(account.xbrl.startsWith(jReport.xbrlEquity.xbrl)) { // accumulate equity
                    iEquity = iEquity + iClose;
                }
                else if(account.xbrl.startsWith(jReport.xbrlLiab.xbrl)) {
                    iLia = iLia + iClose;
                }
            }
        }
    }
    
    let maxCol = Object.keys(aLeft).length;
    let maxCom = Object.keys(aMidl).length;
    let maxCor = Object.keys(aRite).length;
    let maxRow= SCREENLINES-1;
    if(maxCol>maxRow) maxRow=maxCol;
    if(maxCom>maxRow) maxRow=maxCom;
    if(maxCor>maxRow) maxRow=maxCor;

    let statusData = []; for(let i=0;i<=maxRow && i<=SCREENLINES;i++) statusData[i]={ 'assets':{}, 'gals':{}, 'eqLiab':{} };
    if(maxRow>SCREENLINES) maxRow=SCREENLINES; // 20221201
    

    // synthetic EqLiab sum account
    eql.income=iGaLs;
    eql.tax=iTax;
    eql.credit=iCredit;
    eql.debit=iDebit;
    
    
    let iLeft=0;
    for (let name in aLeft)   {
        var account=aLeft[name];
        if(debug) console.log("STATUS.JS STATUSDATA LEFT "+iLeft+" "+name+"="+yearEnd);
        if(iLeft<SCREENLINES) {
            statusData[iLeft]={};
            statusData[iLeft].assets=account;
        }
        iLeft++;
    }
    for (let i=iLeft;i<maxRow && i<SCREENLINES;i++) {
        statusData[i]={};
        statusData[i].assets={};
     }; 



    let iMidl=0;
    for (let name in aMidl)   {
        var account=aMidl[name];
        statusData[iMidl].gals=account;
        iMidl++;
    }
    for (let i=iMidl;i<maxRow && i<SCREENLINES;i++) {  statusData[i].gals={}; }



    let iRite=0;    
    for (let name in aRite)   {
        var account=aRite[name];        
        if(iRite<SCREENLINES) {           
            statusData[iRite].eqLiab=account;
            iRite++;
        }        
    }
    for (let i=iRite;i<maxRow && i<SCREENLINES;i++) { statusData[i].eqLiab={}; }



    // build fourth column with recent transactions
    if(jHistory && gSchema.Names && gSchema.Names.length>0) {
        var names=gSchema.Names;
        var aLen = gSchema.assets;
        var eLen = gSchema.eqliab;

        let hLen = Object.keys(jHistory).length;
        var bLine=hLen;
        var iTran=maxRow;

        //statusData[0].lTran= "Recent Transactions";

        for (let hash in jHistory)  {

            if(debug) console.log("Recent TXN("+hash+") #iTran="+iTran+ "      #bLine="+bLine+"    #maxRow="+maxRow);

            if(bLine<=maxRow && iTran>=0) {
        
                let jPrettyTXN = prettyTXN(jHistory,hash,null,null,names,aLen,eLen);
                jPrettyTXN.credit.shift();
                jPrettyTXN.credit.push('AN'); // GH20230430
                jPrettyTXN.debit.shift();
                let aMount=jPrettyTXN.credit.concat(jPrettyTXN.debit);
                aMount.push("-.--"); aMount.push("-.--"); aMount.push("-.--"); aMount.push("-.--"); 

                let sAmount = (aMount[0]+"  "+aMount[1]+"  "+aMount[2]+"  "+aMount[3]+ " "+aMount[4]+ " ").slice(0,iCpField);

                iTran--;
                statusData[iTran].dTran=jPrettyTXN.entry[0].slice(2);
                statusData[iTran].nTran=jPrettyTXN.entry[1].slice(0,18);
                statusData[iTran].rTran= jPrettyTXN.entry[2].slice(0,18);
                statusData[iTran].lTran= sAmount;                                
            }
            bLine--;
        }
    }
    
   return {report:statusData, ass:ass.yearEnd, eql:eql.yearEnd, gls:gls.yearEnd, fix:(""+iFixed), equity:(""+iEquity), tan:(""+iTan), cur:(""+iCur), lia:(""+iLia)};
}



export function fillLeft(balance,dispValue1,dispValue2,dispValue3,iName,iLeft) {
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


function ignore(e) { e.preventDefault(); }

export function InputRow({ arrAcct, arrCode, txn }) {
    let date=txn.date;
    let sender=txn.sender;
    let reason=txn.reason;
    let reasonInfo=txn.reasonInfo;

    return(
        <div className="attrRow">            
            <div className="FIELD SYMB"> &nbsp;</div>
            <div className="FIELD XFER"><input type="date" id="cDate"   name="cDate"   defaultValue ={date}   onChange={(e)=>addTXNData(txn,'date',e.target.value)} onDrop={ignore} /></div>
            <div className="FIELD SEP">&nbsp;</div>
            <div className="BIGCELL LNAM"><input className="LNAM" type="edit" id="cSender" name="cSender" defaultValue ={sender} onChange={(e)=>addTXNData(txn,'sender',e.target.value)} onDrop={ignore} /></div>
            <div className="FIELD SEP">&nbsp;</div>
            <div className="FIELD XFER">
                <select type="radio" id="cReason" name="cReason" onChange={(e)=>addTXNData(txn,'refAcct',getSelect(e.target.id))} onDrop={ignore} >
                    {arrAcct.map((reason,i) => (
                        <option key={"reason0"+i} id={"reason0"+i} value={reason} onClick={()=>{console.log("Note "+reasonInfo)}}>{reason}</option>
                    ))}
                </select>                
            </div>
            <div className="FIELD SEP">&nbsp;</div>
            <div className="FIELD XFER"><input type="edit" id="cRef1"   name="cRef1"   defaultValue ={reason}   onChange={(e)=>addTXNData(txn,'reason',e.target.value)} onDrop={ignore} /></div>
            <div className="FIELD SEP">&nbsp;</div>
            <div className="FIELD XFER">
            <select type="radio" id="cRef2" name="cRef2" onChange={(e)=>addTXNData(txn,'refCode',getSelect(e.target.id))} onDrop={ignore} >
                    {arrCode.map((code,i) => (
                        <option key={"code0"+i} id={"code0"+i} value={code}>{code}</option>
                    ))}
                </select>
            </div>
        </div>)
}

export function FieldRow({ txn }) {

    return(
        <div className="attrRow">            
            <div className="FIELD SYMB"> &nbsp;</div>
            <div className="FIELD XFER"></div>
            <div className="FIELD SEP">&nbsp;</div>
            <div className="BIGCELL LNAM"></div>
            <div className="FIELD SEP">&nbsp;</div>
            <div className="FIELD LNAM"></div>
            <div className="BIGCELL R105">New Asset:</div>
            <div className="FIELD XFER">
                <input type="edit" id="cRef2" name="cRef2" onChange={(e)=>addTXNData(txn,'refCode',getSelect(e.target.id))} onDrop={ignore} >
                </input>                
            </div>
        </div>);
}


export function addTXNData(txn,shrtName,a) { txn[shrtName]=a; console.log("App.addTXNData TXN("+a+") "+JSON.stringify(txn)); return txn; } // avoid update




export function makeBalance(jAccounts,jReport,value) {

    let balance = new Array();

    // console.log("makeBalance 001 from response D_Report"+JSON.stringify(Object.keys(jReport)));


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

            // also include NKHA into right side, liability
//            if(xbrl_pre===X_EQLIAB) aRite[name]=account;
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
        //console.log("makeBalance 005 Report "+JSON.stringify(jReport[tag]));
        
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
           
            console.log('makeBalance '+iName+'='+side + "  in "+full_xbrl + "= "+dispValue);

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
        }
    }

    while(iRite<=SCREENLINES && iLeft<=SCREENLINES) {
        balance.push({  });
        iLeft++;
        iRite++;
    }

    console.log('makeBalance('+value+') EXIT '+JSON.stringify(balance));

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

export function makeHGBReport(jAccounts,page,jReport) {

    let balance = []; 
    
    console.log("makeReport from response D_Report "+JSON.stringify(Object.keys(jReport)));
              
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
        var chgbC = 0n; // Zinsaufwand
        var chgbD = 0n; // Finanzergebnis
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
                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.fin.sale')) { chgbA+=BigInt(yearEnd);chgbD+=BigInt(yearEnd);  }
                if(full_xbrl.startsWith('de-gaap-ci_bs.ass.currAss.receiv.unpaidC')) { chgbA-=BigInt(yearEnd); }
                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.fin.netInterest')) { chgbB+=BigInt(yearEnd);  console.log("EZIN = "+yearEnd+ " from "+JSON.stringify(account)); }
                if(full_xbrl.startsWith('de-gaap-ci_is.netIncome.regular.fin.expenses')) { chgbC+=BigInt(yearEnd); }
                if(full_xbrl.startsWith('de-gaap-ci_is.is.netIncome.tax')) { chgbE-=BigInt(yearEnd); }

               // console.log("READ xbrl="+full_xbrl+" "+chgb5+" "+chgb7+" "+chgb8+" "+chgbA+" "+chgbB+" "+chgbC+" "+chgbD+" "+chgbE+" "+chgbF);
               
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
        console.log("makeReport from response D_Balance "+JSON.stringify(Object.keys(jAccounts)));

        
        // build two columns
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
            //console.log("EqLiab account ="+JSON.stringify(account));
    
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
        fillRight(balance,chgb9+chgbD,'('+page.RegularEQUITY+')',10,2);
        fillRight(balance,chgbB,page.NetInterest,11,1);
        fillRight(balance,chgbC,page.InterestCost,12,1);
        
        let fin = chgb9+chgbA+chgbB+chgbC;
        fillRight(balance,fin,page.FinYield,13,3);
        
        let gain = regularOTC+fin;
        // Jahresueberschuss
        fillRight(balance,gain,page.closing,14,3);
        fillRight(balance,-chgbF,page.CapTax,15,3); // -- this part needed for 
        let netGain = gain-chgbF;
        fillRight(balance,netGain,page.NetIncome,16,3);

        fillRight(balance,cAvgFix,page.OpAssets,17,1);
        fillRight(balance,cAvgCur,page.AvgCurrent,18,1);
        fillRight(balance,cReceiv,page.rec,19,1);
        let opCap = cAvgFix+cAvgCur+cReceiv;
        fillRight(balance,opCap,page.OpCapital,21,3);
        let performanceBP = 1n;
        if(opCap>0n) performanceBP = (10000n*netGain) / opCap;
        iRite=fillRight(balance,performanceBP,page.CapMargin,22,3);
        
        }
    while(iRite<=SCREENLINES-1 && iLeft<=SCREENLINES-1) {
        balance.push({  });
        iLeft++;
        iRite++;
    }

    return balance;
}


export function fillRight(balance,cValue,iName,iRite,level) {
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
