
const debug=null;
const debugTax=null;
const debugPreBook=null;
const debugAssets=1;
const debugRegular=null;


// SETTING THIS WILL VIOLATE PRIVACY AT THE ADMIN CONSOLE !!! 
const debugReport=null;

/* xglobal BigInt */


// K2 accounts must go first in EQLIAB
// K2.xbrl = ??limitedLiablePartners.VK  
// equity accounts must always have the same partner sequence
// CAN ONLY DOCUMENT UP TO SIX PARTNERS


// table parsing
const CEND= '|';
const CSEP = ';';
const J_ACCT = 6; // first account
const J_MINROW=7;

const Buffer = require('buffer' );



const Account = require('./account');

const Sheets = require('./sheets'); // setting root attribute
//const Server = require('../.old/server');

const HTMLSPACE=" "; 


// OBSOLETE extra XML pattern
// SYNTHETIC
const xbrlAssets = "de-gaap-ci_bs.ass";
const xbrlFixed = "de-gaap-ci_bs.ass.fixAss";
const xbrlEqLiab = "de-gaap-ci_bs.eqLiab";
const xbrlEqlInc = "de-gaap-ci_bs.eqlInc";
const xbrlEqlReg = "de-gaap-ci_bs.regularIncome";



// Language de_DE
let de_DE = {
    // Bilanz nach HGB
    assets:'Aktiva',
    tanfix:'Sachanlagen',
    finfix:'Finanzanlagen',
    fixed:'Anlagevermögen',
    cash:'Bargeld',
    bank:'Bankkonto',
    money:'Bargeld/Bank',
    rec:'Forderungen',
    curr:'Umlaufvermögen',
    eqliab:'Passiva',
    eq_income:'st. Ergebnis',
    eq_tax:'Steueranteil',
    eq_next:'Folgejahr',
    equity:'Eigenkapital',
    liab:'Fremdkapital',
    liabother:'Sonstige Verb.',
    eqfix:'Festkapital',
    eqpart:'Kommanditkapital',
    velimp:'Kommanditisten-VK',
    veulip:'Komplementär-VK',
    income:"Gewinn",
    closing:"Einkommen",
    
    thereof:"davon",
    reportYear:"Berichtsjahr",


    // Berichtstypen
    AcctOpen:"Kontenspiegel Eröffnung",
    AcctClose:"Kontenspiegel Abschluss",
    AcctNext:"Kontenspiegel Folgejahr",
    AcctHistory:"Kontoauszug",
    Assets:"Aktiva",
    AssetList:"Anlagespiegel",
    BalanceOpen:"Eröffnungsbilanz",
    DashBoard:"Übersicht",
    AccountHistory:"Kontenverlauf",
    AccountHistoryAssets:"Verlauf Vermögen",
    AccountHistoryEqLiab:"Verlauf Kapital",
    IncomeUsed:"Ergebnisverwendung",
    GainlossHGB:"Ergebnis HGB275A2",
    BalanceClose:"Bilanz mit Gewinn",
    BalanceNext:"Bilanz Folgejahr",
    GainLoss:"Gewinn/ Verlust",
    Gain:"Gewinn",
    History:"Buchungen",
    Patterns:"Vorlagen",
    Status:"Status",
    Transaction:"Eingabe",
    Sum:"Summe",

    // Anlagen
    AssetIdent: "Kennzeichen",
    AssetType:  "Anlagegut",
    AssetCost:  "Anschaffungsk.",
    AssetNumber:"Anzahl",
    AssetRemain:"Zeitwert",
    AssetPrice: "Stückkosten",
    AssetGain: "Ertrag",

    // GainLoss GuV
    Carry4Loss:  "Verlustvortrag",
    Expenses:    "Ausgaben",
    PaymentsIn:  "Einzahlungen",
    NextYear:    "Folgejahr",
    VariableCap: "Variables Kapital",
    CapGainTax:  "KapErtragSt",
    CapGainSoli: "KapErtragStSoli",
    Revenue:     "Umsatz",
    OpCost:      "Betriebsaufwand",
    DirectCost:  "zurechenb. Kosten",
    GrossYield:  "Rohertrag",
    DirectCost:  "zurechenb. Kosten",
    Depreciation:"Abschreibung",
    OtherOTC:    "betriebl. Nebenkosten",
    OtherRegular:"sonstig.betr.Aufwand",
    RegularOTC:  "Betriebsergebnis",
    RegularFIN:  "Finanzergebnis",
    RegularEQUITY:"WP-Ergebnis",
    PartYield:   "Beteiligungsergebnis",
    FinSale:     "Wertpapier-VK",
    NetInterest: "Zinseinnahmen",
    InterestCost:"Zinskosten",
    IncomeTax:   "Einkommensteuer",
    CapTax:      "Ertragssteuer",
    Tax:         "Steuern",
    NetIncome:   "Netto-Gewinn",
    PaidTax:     "Steuerforderung",
    FinYield:    "außerordentl.Ergebnis",
    OpAssets:    "betriebsnotw.Vermögen",
    AvgCurrent:  "mittl. Umlaufvermögen",
    OpCapital:   "betriebsnotw.Kapital",
    TaxClaims:   "Steuerforderung",
    SecLosses:   "Verluste Anl VK",
    CapMargin:   "Kapitalrendite",

    // Buttons
    Address:"Adresse",
    Book: "Buchen",
    Closing:"Abschluss",
    Diagram:"Diagramm",
    Display:"Anzeigen",
    Transfer:"Überweisung",
    Transaction:"Buchung",

    // Anlage
    AcqDate:"Anschaffungsdatum",
    AcquisitionPrice:"Anschaffungspreis",
    Init:"Anfangswert",
    Close:"Abschluss",
    Next:"Folgejahr",

    // Partner
    Name:"Name",
    Credit:"Einlagen",
    Debit:"Entnahmen",
    YearEnd:"Endstand"
}
module.exports['de_DE']=de_DE;
let jLastTransaction={};





// main response object
// SCHEMA-part
// must also repeat under terms.js !!!!
const COLMIN=2;

const YEAREND='31.12.';

const D_Schema = "Schema"; // includes .Names .total .assets .eqliab  N1.author N2.residence  I1.iban I2.register I3.taxnumber  K1.reportYear K2.client
const D_XBRL   = "XBRL";
const D_SteuerID = "SteuerID";
const D_Equity = "Kapital";
// TRANSACTIONS-part
const D_Balance= "Bilanz";
const D_History= "Historie";
const D_Partner= "PartnerR";
const D_PreBook= "Vorgemerkt";
const D_SHARES = "Anteile";
const D_Report = "Report";
const D_FixAss = "Anlagen";
const D_Muster = "Muster";
const D_Adressen="Adressen";
const D_Page = "Seite";   // client register reference author


import { cents2EU }  from '../modules/money';




function bigCost(idnt,nmbr,init) {
    var units = BigInt(nmbr);
    var iCost = BigInt(init);
    try {
        if(units>0) {
            iCost = BigInt(iCost / units);
        }
    } catch(err) { console.dir("0480 bigCost "+idnt+"COST("+init+"):"+iCost+" each of "+units); }
    return iCost;

}







//import { argv } from 'process';
var autoSave=36000000; // seconds, defaults to ten-hourly-save


// XBRL
function initBalance() {

    var balance = [];

    balance[D_Balance]={};
    balance[D_History]={};
    balance[D_Schema]= {};
    balance[D_FixAss]= {};
    balance[D_Partner]={}; 
    balance[D_PreBook]=[];
    
    balance[D_Report]={
        xbrlTanFix : { level:3, xbrl: "de-gaap-ci_bs.ass.fixAss.tan", de_DE:'Sachanlagen'},
        xbrlFinFix : { level:3, xbrl: "de-gaap-ci_bs.ass.fixAss.fin", de_DE:'Finanzanlagen'},
        xbrlFixed  : { level:2, xbrl: "de-gaap-ci_bs.ass.fixAss", de_DE:'Anlagevermögen'},
        abrlABank:   { level:4, xbrl: "de-gaap-ci_bs.ass.currAss.cashEquiv.bank", de_DE:'Bankkonto'},
        abrlAmoney:  { level:3, xbrl: "de-gaap-ci_bs.ass.currAss.cashEquiv", de_DE:'Geldinstr.'},
        xbrAuxUtils: { level:4, xbrl: "de-gaap-ci_bs.ass.currAss.receiv.trade", de_DE:'LuL Forderungen'},     
        xbrlPaidTax: { level:4, xbrl: "de-gaap-ci_bs.ass.currAss.receiv.other.otherTaxRec", de_DE:'gezahlte Steuer'},     
        // KESO KEST AQST= de-gaap-ci_bs.ass.currAss.receiv.other.otherTaxRec.CapTax 
        xbrlSecLoss:{  level:4, xbrl: "de-gaap-ci_bs.ass.currAss.receiv.unpaidCapital", de_DE:'Aktienverluste'}, // GH20230910
        //                used in json de-gaap-ci_bs.ass.currAss.receiv.unpaidCapital
        xbrlArec:  {   level:3, xbrl: "de-gaap-ci_bs.ass.currAss.receiv", de_DE:'Forderungen'},
        xbrlAcurr:  {  level:2, xbrl: "de-gaap-ci_bs.ass.currAss", de_DE:'Umlaufvermögen'},
        xbrlAssets :{  level:1, xbrl: "de-gaap-ci_bs.ass", de_DE:'Aktiva'},
        divider:    {  level:0, xbrl: "", de_DE:''},
        xbrlLother: {  level:3, xbrl: "de-gaap-ci_bs.eqLiab.liab.other", de_DE:'Sonstige Verb.'},
        xbrlLloan:  {  level:3, xbrl: "de-gaap-ci_bs.eqLiab.liab.bank", de_DE:'Darlehen'},
        xbrlLshare: {  level:3, xbrl: "de-gaap-ci_bs.eqLiab.liab.shareholders", de_DE:'Gesell.Darlehen'},
        xbrlLiab:   {  level:2, xbrl: "de-gaap-ci_bs.eqLiab.liab", de_DE:'Fremdkapital'},
        
        xbrlEqfix:  {  level:3, xbrl: "de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.FK", de_DE:'Festkapital'},
        xbrlEqlim:  {  level:3, xbrl: "de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.KK", de_DE:'Kommanditkapital'},
        xbrlEVulp:  {  level:3, xbrl: "de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.VK", de_DE:'Komplementär-VK'},
        xbrlEVlim:  {  level:3, xbrl: "de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.VK", de_DE:'Kommanditisten-VK'},
        xbrlEPRes:  {  level:3, xbrl: "de-gaap-ci_bs.eqLiab.equity.capRes", de_DE:'Kapitalrücklage'},
        xbrlUVAVA:  {  level:3, xbrl: "de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.accumLoss", de_DE:'Verlust FA Komplem.'},
        xbrlLVAVA:  {  level:3, xbrl: "de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.accumLoss", de_DE:'Verlust FA Kommmand.'},
        xbrlEquity: {  level:2, xbrl: "de-gaap-ci_bs.eqLiab.equity", de_DE:'Eigenkapital'},
        xbrlRegFin: {  level:3, xbrl: "de-gaap-ci_is.netIncome.regular.fin", de_DE:de_DE.RegularFIN},      
        xbrlRegOTC: {  level:3, xbrl: "de-gaap-ci_is.netIncome.regular.operatingTC", de_DE:de_DE.RegularOTC},      
        xbrlRegular:{  level:2, xbrl: "de-gaap-ci_is.netIncome.regular", de_DE:'Gewinn/Verlust'},     
        xbrlEqLiab :{  level:2, xbrl: "de-gaap-ci_bs.eqLiab", de_DE:'Passiva'}, // see HGBBeginYear.html HGBRegular.html
        xbrlIncome: {  level:1, xbrl: "de-gaap-ci_bs.eqLiab.income", de_DE:'Passiva Gewinn'},
        // see sendBalance(), CloseAndSave.htmlReport.xbrlIncome.closing.split(CSEP);
        //xbrlNIP:    {  level:1, xbrl: "de-gaap-ci_bs.eqLiab.equity.netIncomePartnerships", de_DE:'Einkommen'},
        // 20220123 previous row is synthetic, from KernTax for HGBRegular
        
    };
    // subscribed.limitedLiablePartners.accumLoss

    return balance;
}



export function compile(sessionData) {

    let creditorsT=sessionData.creditorsT;

    let logT=sessionData.logT;
    let aoaCells=sessionData.sheetCells;
    let strTimeSymbol=sessionData.strTimeSymbol;

    var result = initBalance();
    
    result[D_Muster] = logT;
 
    result[D_Adressen] = creditorsT;

    // digest aoaCells and write into balance object
    var firstLine=1;

    if(aoaCells && aoaCells.length>J_MINROW) {

        var numLines=aoaCells.length;

        let lastLine = aoaCells[numLines-1];
        let jlastTID = lastLine[0];
        let client=sessionData.client;
        let year=sessionData.year;
        if(year && client) {
            if(!jLastTransaction[client]) jLastTransaction[client]={ };
            let jClientTID = jLastTransaction[client];
            jClientTID[year]=jlastTID;
            if(debug) console.log("0100 compile.compile() LAST TXN includes "+lastLine[1]+" "+lastLine[3]);
            console.log("0100 compile.compile() LAST TXN "+jlastTID);
        } else console.log("0100 compile.compile() LAST TXN "+lastLine[0]);



        if(numLines>J_MINROW) {

            result[D_SteuerID] = {};
            result[D_Schema] = {};
            result[D_PreBook] = [];
            try {
                var iAssets=0;
                var iEqLiab=0;
                var iTotal=0;

                // print all lines
                aoaCells.forEach((row,lineCount) => {

                    
                    
                    if(debug>3) console.log("0110 compile.compile "+JSON.stringify(row));
                        
                    var column;
                    var key=row[0];
                    if(key && key==='N') {
                        const aNames=row;
                        result[D_Schema]["Names"]=aNames;
                        result.writeTime = strTimeSymbol;
                        if(debug>1) console.log("N at "+result.writeTime);
                        var column;
                        for(column=0;column<aNames.length && !(aNames[column].length>0 && aNames[column].length<4 && aNames[column].includes(CEND));column++) {
                            var rawName=aNames[column];
                            if(rawName && rawName.length>=COLMIN && column>=J_ACCT) {
                                var aName=rawName.trim();
                                if(debug>1) console.log("N "+aName);
                                if(aName==='ASSETS') { iAssets=column;
                                    result[D_Schema].assets=column;
                                } else if(aName==='EQLIAB') { iEqLiab=column;
                                    result[D_Schema].eqliab=column;
                                } else 
                                    result[D_Balance][aName] = aName;
                            }                    
                        }
                        iTotal=column;
                        result[D_Schema].total=column;

                        // N1.author N2.residence  I1.iban I2.register I3.taxnumber  K1.reportYear K2.client
                        result[D_Schema].author    = row[2];
                        result[D_Schema].residence = row[3];


                        // GH20211015 result[D_Schema]={ "Names": aNames }; crashes                        
                        if(debugAssets) console.log("0114 SCHEMA N assets="+iAssets+ " eqLiab="+iEqLiab+ " Total="+iTotal);
                        
                    }
                    else if(key && key==='C') {
                        const aDesc=row;
                        result[D_Schema]["Desc"]=aDesc;

                    }
                    else if(key && key==='I') {
                        // N1.author N2.residence  I1.iban I2.register I3.taxnumber  K1.reportYear K2.client
                        result[D_Schema].iban   =  row[1];
                        result[D_Schema].register= row[2];
                        result[D_Schema].taxnumber=row[3];
                    }
                    else if(key && key==='K') {
                        // N1.author N2.residence  I1.iban I2.register I3.taxnumber  K1.reportYear K2.client
                        result[D_Schema].reportYear= sessionData.year; //row[2]; GH20230402
                        result[D_Schema].client    = row[3];
                    }
                    else if(key && key==='A') {
                        if(debugAssets) console.log("0270 compile.compile ASSET  "+row);
                        const assetInfo = row;
                        if(assetInfo.length>J_ACCT) {
                            var date = assetInfo[1];
                            var type = assetInfo[2];
                            var orig = Sheets.bigEUMoney(assetInfo[3]); // bigENMoney AnschaffungsK parse huge EN format string
                            var nmbr = assetInfo[4];
                            var idnt = assetInfo[5];
                            if(idnt && idnt.length>COLMIN && nmbr && nmbr.length>0) {
                                var irest =bigAssetValueChange(assetInfo,iAssets,result[D_XBRL]);
                                var icost =bigCost(idnt,nmbr,orig);
                                result[D_FixAss][idnt]={ "date":date, 
                                                         "type":type,
                                                         "orig":""+orig,
                                                         "nmbr":nmbr,
                                                         "idnt":idnt,
                                                         "rest":""+irest,
                                                         "cost":""+icost,
                                                         "gain":"0" }; // GH20230303
                                if(debugAssets) console.log("0280 BOOK  "+idnt+" = "+result[D_FixAss][idnt].orig+ "for #"+nmbr+" at "+icost);                                
                            }
                        }
                    }
                    else if(key && key==='X') {

                        // GH20220126
                        var xRow=[];
                        var column;
                        for(column=0;column<row.length;column++) { let strCell=row[column]; if(!strCell) strCell=""; xRow.push(strCell.trim()); }
                        result[D_XBRL]=xRow;
                        firstLine=1;
                    }
                    else if(key && key==='E') {
                        result[D_Equity]=row;
                    }
                    else if(key && key==='S') {
                        result[D_SHARES]= row;
                    }
                    else if(key && key==='R') {

                    }
                    else if(key && key==='P') {
                        // tax subject identifier
                        result[D_SteuerID]=row;
                    }
                    else if(key && parseInt(key)>0) {                    
                        const MINTXN=5; // elements in a TXN
                        var jHistory = result[D_History];
                        //if(debug>1) console.log("BOOK "+row.join(CSEP));
                        if(row.length>MINTXN && result[D_Schema].Names){
                            try {

                                if(debugReport) {
                                    console.log("BOOK "+aLine.join(';'));
                                    console.log();
                                }


                                var gNames = result[D_Schema].Names;
                                var gDesc  = result[D_Schema].Desc;
                                var aLine = row;
                                
                                jHistory[lineCount]=aLine;
                                if(firstLine) {
                                    try {
                                        // opening balance lines
                                        for(var xColumn=0;xColumn<gNames.length;xColumn++) {
                                            var rawName = gNames[xColumn].trim(); // 20230120
                                            var xbrl = result[D_XBRL][xColumn];
                                            var xdesc=""+xColumn; if(gDesc && gDesc[xColumn]) xdesc=gDesc[xColumn];
                                            if(rawName && rawName.length>1) {
                                                result[D_Balance][rawName] = Account.makeAccount(rawName,xbrl,xdesc,xColumn);
                                            }
                                            if(debug>1) console.log("0358 makeAccount("+rawName+","+xbrl+","+xdesc+","+xColumn+")");
                                            
                                        };
                                    } catch(err) { console.dir("0359 FIRST REGULAR TXN INPUT "+err); }
                                }
                                if(aLine.length>0) {
                                    var column=0;
                                    aLine.forEach(strAmount => {
                                        if(debug>3) console.log("0360 init "+strAmount);
                                        if(column>=J_ACCT && strAmount && strAmount.length>0) {
                                            var acName = gNames[column];
                                            if(acName && acName.length>1) {
                                                if(firstLine) {
                                                    // initialize the values with 0,00 if nothing is specified
                                                    if(strAmount==null || strAmount.length==0) strAmount="0";
                                                }
                                                try {
                                                    var account = result[D_Balance][acName];
                                                    if(account && account.xbrl) {
                                                        const iAmount = Sheets.bigEUMoney(strAmount);
                                                        if(firstLine) {
                                                            result[D_Balance][acName] = Account.openAccount(account,iAmount);
                                                            if(debug>2) console.log("0366 open "+strAmount+"("+iAmount+")"
                                                                +" for "+gNames[column]
                                                                +"  = "+JSON.stringify(result[D_Balance][acName])
                                                            );
                                                        } else { 
                                                            result[D_Balance][acName] = Account.add(account,iAmount);
                                                            if(debug>2) console.log("0368 add  "+strAmount+"("+iAmount+")"
                                                            +" to  "+gNames[column]
                                                            +"  = "+JSON.stringify(result[D_Balance][acName]));
                                                        }
                                                    }
                                                } catch(err) { console.dir("0369 REGULAR TXN INPUT "+err); }
                                            }
                                        }
                                        column++;
                                    })
                                } else console.error("0367 Asset Line is not an array "+JSON.stringify(aLine));
                                firstLine=null;                
                                // Schema for asset line 2697211	2021-01-19	BAY001	INVEST	200	BAYR_1
                                
                                if(aLine[3] && aLine[3].trim().length>1) {
                                    let iAcc=iAccount(aLine[3].trim(),result[D_Schema].Names);
                                    if(debug>1 && iAcc>=J_ACCT) console.log("0370 compile: known account("+aLine[3]+"):"+iAcc);
                                    var date = aLine[1].trim();
                                    var type = aLine[2].trim();
                                    var nmbr = aLine[4].trim();
                                    var idnt = aLine[5].trim();

                                    // process YIELD,INVEST,SELL;(REGULAR)
                                    if(aLine[3].trim()==='INVEST') {
                                        try {
                                            var orig = bigAssetValueChange(aLine,iAssets,result[D_XBRL]);
                                            var icost = bigCost(idnt,nmbr,orig);
                
                                            result[D_FixAss][idnt]={"date":date, 
                                                                    "type":type,
                                                                    "orig":""+orig,
                                                                    "nmbr":nmbr,
                                                                    "idnt":idnt,
                                                                    "rest":""+orig,
                                                                    "cost":""+icost,
                                                                    "gain":"0"}; // GH20230202
                                            if(debugAssets) console.log("0372 INVEST "+idnt+" for "+
                                            cents2EU(result[D_FixAss][idnt].rest)+ " for #"+nmbr+" at "+cents2EU(icost));
                                        } catch(err) { console.dir("0365 SHEET LINE INVEST "+err); }
                                    }

                                    else if(aLine[3].trim()==='SELL') {

                                        var iSel = parseInt(aLine[4].trim());
                                        var iamnt = bigAssetValueChange(aLine,iAssets,result[D_XBRL]);  // asset value change

                                        var orig = BigInt(result[D_FixAss][idnt].orig);

                                        // sales reduce number of assets and amount of asset value
                                        var iNum = parseInt(result[D_FixAss][idnt].nmbr);
                                        var nmbr = iNum-iSel;
                                        var irest = BigInt(result[D_FixAss][idnt].rest);


                                        // GH20240301
                                        // REDUCE CURRENT COST FOR REMAINING PIECES OF THAT ASSET
                                        // was var iremn = irest+iamnt;
                                        var iremn = orig * BigInt(nmbr);


                                        // reduce cost basis for price per piece
                                        //var icost =bigCost(idnt,nmbr,orig);
                                        var icost =bigCost(idnt,nmbr,iremn);
                                        

                                        // SELL
                                        // GH20230923
                                        // REDUCE INITIAL PRICE FOR REMAINING PIECES OF THAT ASSET
                                        // GH20230923
                                        orig= ((orig*BigInt(nmbr)*10n)+4n)/BigInt(iNum*10);


                                        // GH20230923
                                        // REDUCE CURRENT COST FOR REMAINING PIECES OF THAT ASSET

                                        // OPEN
                                        // MUST VERIFY existing identifier
                                        result[D_FixAss][idnt]={"date":date, 
                                                                "type":type,
                                                                "orig":""+orig,
                                                                "nmbr":nmbr,
                                                                "idnt":idnt,
                                                                "rest":""+iremn,
                                                                "cost":""+icost,
                                                                "gain":"0" }; // GH20230303
                                        if(debugAssets) console.log(
                                                    "0374 SELL "+type+" "+iSel+" (giving "+cents2EU(iamnt)+
                                                    ") from "+iNum+" of Asset "+idnt+" resulting in "+
                                                    nmbr+" worth "+cents2EU(iremn) + " at "+cents2EU(icost)+" each");
                                    }

                                    else if(aLine[3].trim()==='YIELD') {

                                        var iamnt = bigAssetValueChange(aLine,iAssets,result[D_XBRL]); // asset value change

                                        if(result[D_FixAss]) {
                                            if(result[D_FixAss][idnt]) {
                                                var date = result[D_FixAss][idnt].date;
                                                var type = result[D_FixAss][idnt].type;
                                                var iVal = result[D_FixAss][idnt].orig;
                                                var nmbr =  result[D_FixAss][idnt].nmbr;
                                                var icurr = BigInt(result[D_FixAss][idnt].rest);

                                                // yield type of dividend payment reduces the INIT value
                                                // GH20220108  amount reduces the CURRent value
                                                var irest = icurr+iamnt;

                                                // GH20220108 NEW cost is calculated as the INIT price per number of units
                                                var icost = bigCost(idnt,nmbr,irest);
                                                // GH20230102 NEW cost is calculated as the REST price per number of units

                                                // OPEN
                                                // MUST VERIFY existing identifier
                                                result[D_FixAss][idnt]={ "date":date,
                                                                        "type":type,
                                                                        "orig":iVal,
                                                                        "nmbr":nmbr,
                                                                        "idnt":idnt,
                                                                        "rest":""+irest,
                                                                        "cost":""+icost,
                                                                        "gain":"0" }; // GH20230303
                                                if(debugAssets) console.log("0376 YIELD amount="+iamnt+" changes "+idnt+" from "+cents2EU(icurr)+" to "+cents2EU(result[D_FixAss][idnt].rest));

                                                } else  console.log("0371 YIELD UNKNOWN "+idnt+" ASSET");
                                        } else {
                                            if(debug>1) console.log("0373 YIELD UNKNOWN "+idnt);
                                        }
                                    } else if(iAcc>0) {
                                        try {
                                            const xbrl=result[D_XBRL][iAcc];
                                            const xRegular=result[D_Report].xbrlRegular.xbrl;
                                            if(xbrl && xbrl.startsWith(xRegular)) {
                                                // GH20230202
                                                if(debugRegular) console.log("0378 compile: ("+aLine[iAcc]+") regular income:"+xbrl);
                                                if(result[D_FixAss][idnt]) {
                                                    var iGain = BigInt(result[D_FixAss][idnt].gain);
                                                    result[D_FixAss][idnt].gain = ""+(iGain+Sheets.bigEUMoney(aLine[iAcc]));
                                                    if(debugRegular) console.log("0378 compile: Asset gain is "+cents2EU(iGain));
                                                }
                                            }
                                        } catch(err) { console.dir("0353 SHEET LINE GAIN "+err); }
                                    } else {
                                        if(debug>1) console.log("0354 compile: normal booking transaction");
                                    }
                                } // end processing YIELD,SELL,INVEST,(REGULAR)

                            } catch(err) { console.dir("0351 SHEET LINE INPUT "+err); }
                        }
                    }
                    else if(row.length>20) {
                        //if(!key || parseInt(key)==0) {                    
                        if(debugPreBook) console.dir("0352 SHEET LINE PRE-BOOK "+JSON.stringify(row)); 
                        row[1]=lineCount; // GH20231002 allow trace-back and put lineCount into date field
                        result[D_PreBook].push(row);
                    }
            });
                if(debug>1) console.log("0368 compile: check partners");

                // process the partners
                var partners = {};
                if(result[D_SHARES] && result[D_XBRL] && result[D_Schema] &&  result[D_SteuerID] && result[D_Schema].eqliab>J_ACCT) {

                    var shares = result[D_SHARES];
                    var arrXBRL= result[D_XBRL];
                    var arrTaxID=result[D_SteuerID];
                    var gNames = result[D_Schema].Names;
                    var eqliab = result[D_Schema].eqliab;

                    var basis = shares[2];


    
    
/*          D_Partner[i] = { }
            compile
                    id:     # 0-(N-1)
                    fixCap  Name 'EKxx' Festkapital/KK
                    varCap  Name 'K2xx' var Kapital
                    resCap  Name RExx Rücklage
                    gain:   Nenner
                    denom:  Zaehler
                    iVar    #Spalte K2xx
                    iCap    #Spalte Fest/Kommanditkapital
                    iCap    #Spalte Rücklage
                    name    Name (Text in Spalte mit FK oder KK)

            sendBalance
                    cyLoss Laufende Verluste aus Veraeusserungen VAVA
                    keso
                    kest
                    income
                    otc
                    cap

                    netIncomeFin
                    netIncomeOTC
*/

                    // create partners structure

                    // K2 accounts must go first
                    // K2.xbrl = ??limitedLiablePartners.VK  
                    // equity accounts must always have the same partner sequence

                    var pNum=0;
                    for(var col=eqliab+1;col<shares.length;col++) {
                        if(shares[col] && arrXBRL[col].includes('limitedLiablePartners.VK')) {
                            var pShare = shares[col];
                            
                            if(isNaN(pShare)) pShare=" 0";                       
                            partners[pNum]={ 'id':pNum, 'varCap':gNames[col], 'gain':pShare, 'denom':basis, 'iVar':col, 'taxID':arrTaxID[col] };
                            pNum++; // GH20220206 
                        }
                    }

                    if(arrXBRL) {
                        pNum=0;
                        for(var col=eqliab+1;col<shares.length;col++) {
                            var acc = arrXBRL[col];
                            if(shares[col] && (acc.includes('limitedLiablePartners.KK') || acc.includes('limitedLiablePartners.FK'))) {
                                partners[pNum].fixCap=gNames[col];
                                partners[pNum].iCap=col;
                                partners[pNum].name=shares[col];
                                pNum++;
                            }
                        }


                        pNum=0;
                        for(var col=eqliab+1;col<shares.length;col++) {
                            var acc = arrXBRL[col]+" ";
                            if(acc.includes('eqLiab.equity.capRes')) {
                                partners[pNum].resCap=gNames[col];
                                partners[pNum].iRes=col;
                                pNum++;
                            }
                        }
                    } else console.log("0377 compile: NO arrXBRL for PARTNERS");


                    /*
                    // VAVA VKxx Verluste Verlustvortrag
                    try {
                        if(arrEQUI) {

        // CREATE SYNTHETIC VKXX accounts 

        //                    display losses as booked over the year
                            pNum=0;
                            for(var col=eqliab+1;col<shares.length;col++) {
                                if(shares[col] && arrEQUI[col] && arrEQUI[col].includes('limitedPartners.VK') && 
                                    arrXBRL[col].includes('limitedLiablePartners.accumLoss')) {
                                    var glShare = shares[col];
                                    if(isNaN(glShare)) glShare=" 0";                       
                                    let vName = gNames[col];
                                    let vkxx = result[D_Balance][vName];
                                    partners[pNum].vaName=vName;                             // Name d Kontos für eigene Verluste aus Verkaeufen von Aktien
                                    partners[pNum].vaBook=vkxx?Account.getChange(vkxx):{'cents':0}; // Betrag - eigene Buchungen aus Verkaeufen von Aktien  MUSS NULL
                                    partners[pNum].glShare=glShare;                          // Anteil des Gesellschafters an Verlusten und Gewinnen
                                    partners[pNum].vaColumn=col;                             // Spalte - eigene Verluste aus Verkaeufen von Aktien 

                                    let monNYLoss = addEUMoney(vkxx.init,{'cents':p_cyLoss[pNum]});

                                    console.log("NEW VKxx  #"+pNum+"  "+p_cyLoss[pNum]+"+"+vkxx.init+"="+moneyString(monNYLoss));

                                    partners[pNum].nyLoss=moneyString(monNYLoss);

                                    pNum++;
                                }
                            }
                        } else console.log("compile: NO EQUITY list for partners");
                    } catch(err) { console.dir("compile: ERR EQUITY list for partners"+err); }
                    */

                    
                } else console.log("0379 compile.compile: NO PARTNERS");


                result[D_Partner]=partners;
                if(debugReport) 
                    for (let i in partners) { console.log("0380 compile Partner("+i+") "+JSON.stringify(partners[i])); }

            } catch (err) {
                console.error('0125 compile.js compile:'+err);
                console.dir('0125 compile.js compile:'+err);
            }

            if(debug) console.log("0129 compile.compile.Schema="+JSON.stringify(Object.keys(result[D_Schema])));

        } else console.error('0111 compile.js compile NO BALANCE');

    } else console.error('0101 compile.js compile NO aoaCells');



    for(let key in result) {
        if(debug) console.log('0386 compile.js compile() -> balance['+key+']'); 
    }

    if(debug) console.log("0388 COMPILED = "+JSON.stringify(Object.keys(result)));


    let balance = sendBalance(result);

    
    //if(debug) console.log("0390 COMPILED         = "+JSON.stringify(Object.keys(balance)));
    if(debug) console.log("0390 COMPILED HISTORY = "+JSON.stringify(Object.keys(balance[D_History])));
    if(debugPreBook) console.log("0390 COMPILED PRE_BOOK = "+JSON.stringify(balance[D_PreBook]));

    if(debugReport) { 
        let jHistory=balance[D_History];
        Object.keys(jHistory).map((lineNo) => (console.log("0390 #"+lineNo+"= "+JSON.stringify(jHistory[lineNo])))) }

    return balance;

}



function isSameFY(year) 
{
    let numYear=unixYear();
    if(debug) console.log("isSameFY"+numYear);
    if(parseInt(year)>numYear-1) return true;
    return (parseInt(year)==numYear) 
}
module.exports['isSameFY']=isSameFY;



function unixYear() {
    return new Date(Date.now()).getUTCFullYear();
};

function iAccount(strAccountName,arrAcctNames) {
    let index=0;
    try {
        index=parseInt(arrAcctNames.map((strName,i) => (strAccountName==strName?(""+i):" ")).join('').trim());
        if(debug) console.log("     iAccount("+strAccountName+") = "+index);
    } catch(e) {
        console.err("compile.iAccount("+strAccountName+") failed.");
    }
    return index;
}

// in gResponse generate a copy of the balance, with all accounts closed 
// and GAIN LOSS being distributed to partners
function sendBalance(balance) {
    
    var gResponse = {}; 

    let bAccounts = balance[D_Balance];
    gResponse[D_Balance]={}; 
    let gross  = gResponse[D_Balance];

    let bHistory = balance[D_History];
    gResponse[D_History]={}; 
    let txns = gResponse[D_History];

    var arrXBRL= balance[D_XBRL];
    gResponse[D_XBRL]=balance[D_XBRL];
    
    gResponse[D_Schema]={};
    var gNames = balance[D_Schema].Names;

    let partners=balance[D_Partner];
    gResponse[D_Partner]=partners;

    let preBooked=balance[D_PreBook];
    gResponse[D_PreBook]=[];
    preBooked.forEach(preTXN=>{
        if(debugPreBook) console.log("compile.js sendBalance preBook "+JSON.stringify(preTXN));           
        gResponse[D_PreBook].push(preTXN);
    })

    // 20230111 tax subject identifier in partner.taxID
    //let partnerIDs=balance[D_SteuerID];
    //gResponse[D_SteuerID]=partnerIDs;


    let bReport = balance[D_Report];
    gResponse[D_Report]=JSON.parse(JSON.stringify(bReport));


    // R1 add account structures to  the copy of D_Report
    let gReport = gResponse[D_Report];
    for(let xbrl in gReport) {
        var element=gReport[xbrl];
        if(debugReport) console.log("compile.js sendBalance ACCOUNT "+JSON.stringify(element));           
        element.account = Account.openAccount(Account.makeAccount(element.de_DE,element.xbrl),0n);
    }

    var iTaxPaid=0n;
    var iSoldSecurityLoss=0n;
                
    // ADD bAccounts' saldi to gReport
    for (let name in bAccounts)   {
        if(name && name.length>=COLMIN) {
            var account=bAccounts[name];
            if(account && account.xbrl && account.xbrl.length>COLMIN) {
                var axbrl = account.xbrl;
                account.yearEnd=""+Account.bigSaldo(account); // GH20221028

                

                // GH20221028
                if(axbrl.startsWith(bReport.xbrlRegular.xbrl)) {  // clear income
                    if(debugReport) console.log("compile.js sendBalance REGULAR:"+axbrl);
                    account.next="0";
                }
                else if(axbrl.startsWith(bReport.xbrlPaidTax.xbrl)) { // move tax paid
                    iTaxPaid += BigInt(account.yearEnd);
                    if(debugReport) console.log("compile.js sendBalance Tax Paid="+iTaxPaid);
                    account.next="0";
                }
                else if(axbrl.startsWith(bReport.xbrlSecLoss.xbrl)) { // move sold-security losses
                    iSoldSecurityLoss += BigInt(account.yearEnd);
                    if(debugReport) console.log("compile.js sendBalance Sold-Security Loss="+iSoldSecurityLoss);
                    account.next="0";
                    // GH 20230910 OPEN : kill partner capital 
                }
                else account.next=account.yearEnd;




                // search, find and update corresponding SYNTHETIC report account
                for(let rxbrl in gReport) {
                    var element=gReport[rxbrl];
                    var collect=element.account;
                    if(collect && axbrl.startsWith(element.xbrl)) {
                        
                        element.account = Account.add(collect,""+Account.bigSaldo(account));

                        element.account.init = ""+(BigInt(element.account.init)+BigInt(account.init)); 
                        element.account.next = ""+(BigInt(element.account.next)+BigInt(account.next)); 
                    }
                }
            }
        }
    }
    distribute(iTaxPaid,partners,'tax');


    // find common VAVA account GH202112222 and distribute current-year changes to partners
    var all_cs=null;
    var big_cyloss=0n;
    var all_iSale=-1;
    var assets = balance[D_Schema].assets;
    for(var lossCol=J_ACCT;lossCol<assets;lossCol++) {
        if( arrXBRL[lossCol] && arrXBRL[lossCol].includes('unpaidCapital')) { // GH20230910
            all_cs=gNames[lossCol]; // Kontoname gemeinschaftl Verluste aus Verkaeufen von Aktien
            all_iSale=lossCol;      // Spalte    gemeinschaftl Verluste aus Verkaeufen von Aktien
        }
    }
    // distribute share-sales losses to partners
    var p_cyLoss;
    if(all_cs) {
        //  distribute current-year VAVA changes to partners
        let vava = balance[D_Balance][all_cs];
        if(vava) {
            big_cyloss = Account.bigChange(vava)

            if(debugReport) {
                console.log("VAVA INIT   "+vava.init);
                console.log("VAVA CREDIT "+vava.credit);
                console.log("VAVA DEBIT  "+vava.debit);
                console.log("VAVA CHANGE "+big_cyloss);
            }

            p_cyLoss = distribute(big_cyloss,partners,'cyLoss');
            if(debugReport) console.log("compile.js sendBalance CYLOSS  G"+p_cyLoss[0]+" E"+p_cyLoss[1]+" A"+p_cyLoss[2]+" K"+p_cyLoss[3]+" T"+p_cyLoss[4]+" L"+p_cyLoss[5]); 
        } else if(debugReport) console.log("compile.js sendBalance CYLOSS  NO VAVA"); 
    }
    

    //   transfer overview to report 
    let aAssets = gReport.xbrlAssets.account;
    let aEqliab = gReport.xbrlEqLiab.account;
    let aEqlreg = gReport.xbrlRegular.account;
    let aRegFin = gReport.xbrlRegFin.account;
    let aRegOTC = gReport.xbrlRegOTC.account;

    let aEqlinc = gReport.xbrlIncome.account; // should be empty at this stage


    // started addition with aEqlinc to preserve account name
    let aEqlsum=Account.add(aEqlreg,""+Account.bigChange(aEqliab));
    aEqlinc=Account.add(aEqlinc,""+Account.bigChange(aEqlsum));

    if(debugReport) {
       console.log("compile.js sendBalance ASSETS = "+JSON.stringify(aAssets));           
       console.log("compile.js sendBalance EQLIAB = "+JSON.stringify(aEqliab));           
       console.log("compile.js sendBalance EQLREG = "+JSON.stringify(aEqlreg));           
       console.log("compile.js sendBalance REGOTC = "+JSON.stringify(aRegOTC));           
       console.log("compile.js sendBalance REGFIN = "+JSON.stringify(aRegFin));           
       console.log("compile.js sendBalance EQLINC = "+JSON.stringify(aEqlinc));         
    }
        
    // set the yearEnd component in each gReport account
    for(let rxbrl in gReport) {
        var element = gReport[rxbrl];
        var account = element.account;
        account.yearEnd=""+Account.bigChange(account);
        account.next = "0";

        if(debugReport) console.log("compile.js sendBalance send1 REPORT("+element.de_DE+") "+JSON.stringify(element.account));
    }


 
    let netIncome = Account.bigSaldo(aEqlreg);
    distribute(netIncome,partners,'income');
    // GH20220206


    let netIncomeFin = Account.bigSaldo(aRegFin);
    distribute(netIncomeFin,partners,'netIncomeFin');
    // GH20220206


    let netIncomeOTC = Account.bigSaldo(aRegOTC);
    distribute(netIncomeOTC,partners,'netIncomeOTC');
    // GH20220206




    
    // GH20220206 MODIFY K2xx accounts 
    // GH20230120 MODIFY RExx accounts 
    // substract KEST
    for (let id in partners) {
        var p=partners[id];

        // varCap is the name of the variable account 'K2xx'
        if(p && p.varCap) { 
            // consolidate K2 variable capital
            var varcap=bAccounts[p.varCap];
            varcap.income=p.income;
            varcap.netIncomeOTC=p.netIncomeOTC;
            varcap.netIncomeFin=p.netIncomeFin;
            varcap.yearEnd=""+Account.bigSaldo(varcap);

            // GH 20221028 substract paid tax
            let iYearEnd =  varcap.yearEnd ? BigInt(varcap.yearEnd) : 0n;
            let iIncome  = varcap.income ? BigInt(varcap.income) : 0n;
            let iTaxPaid = p.tax ? BigInt(p.tax) : 0n;
            let iSecLoss = p.cyLoss ? BigInt(p.cyLoss) : 0n;
            varcap.next =   ""+(iYearEnd + iIncome - iTaxPaid -iSecLoss); 

            // 20221029 detailed partner account info
            p.init = varcap.init;
            p.credit = varcap.credit;
            p.debit = varcap.debit;
            p.yearEnd = varcap.yearEnd;
            p.close =  ""+(iYearEnd + iIncome);
            p.cyLoss = ""+iSecLoss; 
            p.next=varcap.next;
            varcap.tax = ""+(iTaxPaid); // 20230218


            if(debugReport) console.log('compile sendBalance  '+JSON.stringify(p) + "\n ==>> MODIFY K2xx "+JSON.stringify(varcap));

            if(p.resCap) {
                // consolidate RE capital reserve
                var rescap=bAccounts[p.resCap]; // index with name
                if(debug) console.dir("compile sendBalance partner "+p.name+ " CapitalReserve("+p.resCap+")="+JSON.stringify(rescap));

                rescap.income="";
                rescap.netIncomeOTC="";
                rescap.netIncomeFin="";    
                rescap.yearEnd=""+Account.bigSaldo(rescap);

                
                /* Buchungen auf RE.. zählen als Entnahme oder Einlage GH20230202
                */
            }
                        
    }  else console.dir('compile sendBalance NO CAPITAL ACCOUNTS FOR PARTNER #'+p);


        if(debugReport) console.log('compile sendBalance  '+JSON.stringify(p) + "\n ==>> MODIFY K2xx  RExx"+JSON.stringify(varcap));
    }




    // build gResponse[D_Balance]==gross from bAccounts:normal Accounts
    // update yearEnd result with saldo for each account
    // clear CapTax accounts
    for (let name in bAccounts)   {
        // add yearEnd saldo value
        if(name && name.length>=COLMIN) {
            var account=bAccounts[name];
            if(account && account.xbrl && account.xbrl.length>COLMIN) {
                account.yearEnd=""+Account.bigSaldo(account);
                
                gross[name]=account; 
                if(debugReport) console.log("compile.js sendBalance2 ACCOUNT "+JSON.stringify(account));           
            }
        }
    }

    

    // GH20221028     
    // ADD bAccounts' next to gReport.next
    // this will overwrite the income accounts, as all other accounts.next are already set
    for (let name in bAccounts)   {
        if(name && name.length>=COLMIN) {
            var account=bAccounts[name];
            if(account && account.xbrl && account.xbrl.length>COLMIN
                // && account.xbrl.startsWith(xbrlEqLiab) // GH20221028
                 ) { 
                var axbrl = account.xbrl;

                for(let rxbrl in gReport) {
                    var element=gReport[rxbrl];
                    var collect=element.account;
                    if(collect && axbrl.startsWith(element.xbrl)) {
                        element.account.next = ""+(BigInt(element.account.next)+BigInt(account.next)); 
                    }
                }
            }
        }
    }


    // reverse or nor GH20221107
    Object.keys(bHistory).map((hash,i) => {txns[i] = bHistory[hash]});
    
    
    // transfer all fixed assets
    gResponse[D_FixAss] = balance[D_FixAss];

    // transfer schema information
    gResponse[D_Schema] = balance[D_Schema];


    // compensating closing statement
    try {
        var iMoneyIndex=0;

        let year = balance[D_Schema].reportYear;

        let gAccounts = gResponse[D_Balance];
        let gReport = gResponse[D_Report]

        if(gReport.xbrlRegular.account.yearEnd) {
            var closeIncome = { 'credit':{}, 'debit':{}  };
            closeIncome['date']=YEAREND+year;
            closeIncome['sender']='System';
            closeIncome['refAcct']=de_DE['GainLoss'];
            closeIncome['reason']=de_DE['Closing'];
            closeIncome['refCode']=de_DE['NextYear'];

            let yearEnd = gReport.xbrlRegular.account.yearEnd;
            if(debugReport) console.log("sendBalance CLOSING income "+yearEnd);

            var aNum=0;
            for(let name in gAccounts) {
                if(gAccounts[name]) {
                    // if(debugReport) console.dir("sendBalance UPDATE CLOSING OTC "+JSON.stringify(gAccounts[name]));
                    let acc = gAccounts[name];
                    let xbrl = acc.xbrl;
                    let iCents=0n;
                    if(xbrl.includes("netIncome.regular")) {
                        let aic = BigInt(acc.yearEnd);
                        if(aic<0n) {
                            iCents = -1n * aic;
                            closeIncome.debit[name]=""+iCents;
                        } else {
                            iCents = aic;
                            closeIncome.credit[name]=""+iCents;
                        }
                        iMoneyIndex=acc.index; 
                        if(debugReport) console.log("sendBalance CLOSING OTC "+iMoneyIndex);
                    }
                }
                aNum++;
            }

            if(partners) for (let i in partners) { 
                let p=partners[i];
                let iCents=0n;
                try {
                    let varcap=gAccounts[p.varCap];                   
                    if(varcap) {
                        // if(debugReport) console.dir("sendBalance UPDATE CLOSING VAR "+JSON.stringify(p)+"Partner("+i+") "+JSON.stringify(varcap)); 
                        let name = varcap.name;
                        let aci = BigInt(varcap.income);
                        if(aci<0n) {
                            iCents=-1n * aci;
                            closeIncome.credit[name]=""+iCents;
                        }
                        else {
                            iCents=aci;
                            closeIncome.debit[name]=""+iCents;
                        }
                        iMoneyIndex=p.iVar; 
                        if(debugReport) console.log("sendBalance CLOSING VAR "+iMoneyIndex);
                    }
                } catch(err) { console.dir("compile.js sendBalance UPDATE CLOSING  VARCAP ERROR: "+err); }
            }

            if(debugReport) console.log("sendBalance "+yearEnd+" CLOSING "+JSON.stringify(Object.keys(closeIncome.credit))+"  "+JSON.stringify(Object.keys(closeIncome.debit)));

            gReport.xbrlIncome.closing = JSON.stringify(closeIncome);
            if(debugReport) console.log("1900 compile.js sendBalance UPDATE gReport.xbrlIncome.closing="+gReport.xbrlIncome.closing);

        } else console.log("compile.js sendBalance UPDATE CLOSING: NO gReport.xbrlRegular.account.yearEnd");
    } catch(err) { console.dir("compile.js sendBalance UPDATE CLOSING ERROR: "+err); }

    






    // transfer txn pattern information
    gResponse[D_Muster]  = balance[D_Muster];
    gResponse[D_Adressen]= balance[D_Adressen];
    
    // transfer page header footer information
    var page = makePage(balance); // side-effect
    if(debugReport) console.log("compile.js sendBalance PAGE "+JSON.stringify(page));
    if(debugReport) console.log();
    gResponse[D_Page] = page;

    return gResponse;
}


function distribute(iMoney,bPartner,target) {      
    
    var check=0n;
    // can only serve six partners

    var shares=[ 0n, 0n, 0n, 0n, 0n, 0n ];
    var cents =[ 0n, 0n, 0n, 0n, 0n, 0n ];
    var sign=1n;
    if(debugTax) console.log('0130 Sender.distribute('+iMoney+') CALL WITH MONEY');
    if(iMoney<0n) { iMoney = -iMoney; sign=-1n; }
    if(debugTax) console.log('0132 Sender.distribute('+iMoney+' * '+sign+') ABSOLUTE VALUE ');
//return null;



    if(bPartner) { 

        var pNum=0;
        for (var n in bPartner) {
            var p=bPartner[n];
            if(p) pNum++;
        }
        // pNum = #partners

        // init with raw share
        let index1=0;
        for (var n in bPartner) {
            var p=bPartner[n];
            if(p) {
                let iShare = 0n;
                if(BigInt(p.denom)>0n) iShare = (iMoney * BigInt(p.gain)) / BigInt(p.denom);
                shares[index1]=iShare;
                cents[index1]=0n;
                if(debugTax) console.log('0134 Sender.distribute #'+n+'='+index1+': '+sign+'*'+iShare+' to '+ p.varCap+ " with "+p.gain+"/"+p.denom);
                index1++;
            }
        }

      

        // skip one-man show
        if(bPartner.length<2) {
            if(debugTax) console.log('0136 Sender.distributeMoney('+iMoney+') PRE-LOOP NO PARTNERS IN BALANCE'); 
            shares[0]=iMoney;
        }
        else while(check<iMoney){
            
            if(debugTax) console.log("\n");

            // init minimum correction
            let min=cents[0];


            // calculate error
            check=0n;
            for(var q=0;q<shares.length;q++) {
                check = check + shares[q] + cents[q];
                if(debugTax) console.log("0138 distribute  "+q+"="+shares[q]+"+"+cents[q])
            }
            let err = iMoney-check;

            if(err>0) {
                // find cents' minimum
                let mIndex=0;
                for(var q in cents) {
                    if(cents[q]<min) {
                        min=cents[q];
                        mIndex=q;
                    }
                }


                // increment cents' miminum
                cents[mIndex]=min+1n;                
                if(debugTax) console.log("0140 (min="+min+"   err="+err+") \n0140cents["+mIndex+"]="+cents[mIndex]+" G"+shares[0]+" E"+shares[1]+" A"+shares[2]+" K"+shares[3]+" T"+shares[5]);
                

            }
            /* compensate over-correction
            if(err<0) {
                let m=cents.length;
                while(m>0 && cents[m-1]>min) m--;
                cents[m]=cents[m]-1;
            }
            */


            // redo error calculation
            // OR leave the loop
        }


        // consolidate shares+cents
        for(var q in cents) {
            
                shares[q] = shares[q] + cents[q];
            
        }


        // transfer shares
        var index=0;
        for (let id in bPartner) {
            var p=bPartner[id];
            if(p) {
                p[target]= ""+shares[index];

                if(debugTax) console.log('0142 distributeMoney('+shares[index]+') to '+JSON.stringify(p)+"["+target+"]");

                index++;

            }
        }

    } else console.error('0133 Sender.distributeMoney('+JSON.stringify(iMoney)+') NO PARTNERS IN BALANCE');

    
    if(debugTax && shares && shares.length>1) console.log('0144 Sender.distributeMoney RESULT '+iMoney + " G"+shares[0]+" E"+shares[1]+" A"+shares[2]+" K"+shares[3]+" T"+shares[4]+" L"+shares[5]);
    if(debugTax && cents && cents.length>1)   console.log('0146 Sender.distributeMoney  CENTS '+iMoney + " G"+cents[0]+"  E"+cents[1] +" A"+ cents[2]+" K"+ cents[3]+" T"+ cents[4]+" L"+ cents[5]);
    return shares; // shares.map((s,i)=>(s+cents[i]));
}


function makePage(balance) {

    var page = {};

    if(balance) {
        if(balance[D_Schema]) {
            const gSchema  = balance[D_Schema];

            let author=gSchema.author;
            let residence=gSchema.residence;
            let iban=gSchema.iban;
            let register=gSchema.register;
            let taxnumber=gSchema.taxnumber;
            let reportYear=gSchema.reportYear;
            let client=gSchema.client;


            page['header'] = de_DE['reportYear'] + HTMLSPACE + (""+reportYear); // de_DE:
            page['client'] = client;
            page.residence = residence;
            page.register = register;
            page.taxnumber = taxnumber;
            page['register_tax'] = register+HTMLSPACE+taxnumber;
            page['reference'] = iban+HTMLSPACE+reportYear;
            page['author'] = author+HTMLSPACE+residence;
            page['footer'] = iban+HTMLSPACE+residence;

            for(let key in de_DE) {
                page[key]=  de_DE[key];  
                if(debug>1) console.log("compile makePage de_DE "+key+" -> "+de_DE[key]);
            }

            balance[D_Page] = page;
            // side-effect AND return value

            if(debug) console.log();
            if(debug>1) console.log("compile makePage "+JSON.stringify(Object.keys(page)));

        } else console.error("compile makePage:  NO schema");
    } else console.error("compile makePage: NO balance");

    return page;
}


function bigAssetValueChange(row,iAssets,aXBRL) {
    // aXBRL == result[D_XBRL]
    var column=J_ACCT;
    var iValue = 0n;
    var run=true;
    try {
        while(run && iValue==0 && column<iAssets) { // was  iValue<1n  GH20230924
            var test = row[column];
            if(test && test.length > 0 && Sheets.bigEUMoney(test)!=0n  && aXBRL[column].startsWith(xbrlFixed)) {
                iValue=Sheets.bigEUMoney(test); 
                if(debugAssets) console.log("ASSET ("+aXBRL[column]+") VALUE CHANGE="+iValue)
                run=false;
            }
            column++;
        } // shares before cash / account
    } catch(err) { console.dir("asset value("+row+")="+iValue+"   ERROR "+err); }
    return iValue;
}


export function formatTXN(session,reqBody) {

    var bookingForm=null;
    
    console.log("0066 compile.js formatTXN("+session.id+") book "+JSON.stringify(reqBody));

    if(Object.keys(reqBody).length>2) {
        if(debug) console.log("compile.js ENTER formatTXN("+session.id+") book "+JSON.stringify(reqBody));

        var jFlag  = reqBody.flag; if(!jFlag) jFlag=0;
        var jDate  = reqBody.date;
        var jSender= reqBody.sender;
        var jAcct  = reqBody.refAcct;
        var jSVWZ  = reqBody.reason;
        var jSVWZ2 = reqBody.refCode;
        var jCredit= reqBody.credit;
        var jDebit = reqBody.debit;


        let sessionId=session.id;
        
        if(session) {
            if(debug) console.dir("compile.js formatTXN("+sessionId+") book "+JSON.stringify(reqBody));

            var balance = session.generated;

            if(balance && balance[D_Schema]) {

                let year = balance[D_Schema].reportYear;
        
                if(isSameFY(year) || jFlag) {

                    if(debug>0) console.log("compile.js formatTXN() "+JSON.stringify(jCredit)+"/ "+JSON.stringify(jDebit));


                    var total = balance[D_Schema].total;
                    var aLen = parseInt(balance[D_Schema].assets);

                    bookingForm = (CSEP.repeat(total)).split(CSEP);

                    bookingForm[0]= 1-jFlag;
                    bookingForm[1]=jDate;
                    bookingForm[2]=jSender;
                    bookingForm[3]=jAcct;
                    bookingForm[4]=jSVWZ;
                    bookingForm[5]=jSVWZ2;
                    
                    // jCredit,jDebit { index:45, value:66266262 }

                    for(let money in jCredit) {
                        var i=jCredit[money].index;
                        bookingForm[i] = jCredit[money].value;
                    }

                    for(let money in jDebit) {
                        var i=jDebit[money].index;
                        bookingForm[i] = jDebit[money].value;
                    }
                } else { console.dir("compile.js formatTXN() rejects other fiscal year:"+year);
                    return null;
                }
            } else console.log("compile.js formatTXN("+sessionId+") no BALANCE table ");

        } else console.log("compile.js formatTXN("+sessionId+") no SESSION ");
        // receiver will append this to sheetCells
    } else console.log("compile.js formatTXN() no TXN ");

    console.log();
    console.log("0068 formatTXN returns "+(bookingForm ? bookingForm.join(';'): "null"));
    console.log();

    return bookingForm;

}




function getYear() {  return currentYear; }
module.exports['getYear']=getYear;


