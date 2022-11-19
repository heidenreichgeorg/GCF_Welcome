
/*

2021 - sales xbrl MIET

*/

let debug=1;


// THIS WILL VIOLATE PRIVACY AT THE ADMIN CONSOLE !!! 
let debugReport=1;

// table parsing
const CEND= '|';
const CSEP = ';';
const J_ACCT = 6; // first account
const J_MINROW=7;

const Buffer = require('buffer' );
const fs = require('fs');

const Account = require('./account');
const Money = require('./money');
const Sheets = require('./sheets');
const Server = require('./server');
const { stringify } = require('querystring');


const D_Page = "Seite";   // client register reference author
const HTMLSPACE=" "; 


// OBSOLETE extra XML pattern
// SYNTHETIC
const xbrlAssets = "de-gaap-ci_bs.ass";
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
    equity:'Eigenkapital',
    liab:'Fremdkapital',
    liabother:'Sonstige Verb.',
    eqfix:'Festkapital',
    eqpart:'Kommanditkapital',
    velimp:'Kommanditisten-VK',
    veulip:'Komplementär-VK',
    income:"Gewinn",
    closing:"Bilanzgewinn",
    
    thereof:"davon",
    reportYear:"Berichtsjahr",


    // Berichtstypen
    AcctOpen:"Kontenspiegel Eröffnung",
    AcctClose:"Kontenspiegel Abschluss",
    AcctHistory:"Kontoauszug",
    Assets:"Anlagespiegel",
    BalanceOpen:"Eröffnungsbilanz",
    DashBoard:"Übersicht",
    GainlossHGB:"Ergebnis HGB275A2",
    BalanceClose:"Bilanz mit Gewinn",
    GainLoss:"Gewinn/ Verlust",
    History:"Buchungen",
    Patterns:"Vorlagen",
    Status:"Status",


    // Anlagen
    AssetIdent: "Kennzeichen",
    AssetType:  "Anlagegut",
    AssetCost:  "Anschaffungsk.",
    AssetNumber:"Anzahl",
    AssetRemain:"Zeitwert",
    AssetPrice: "Stückkosten",

    // GainLoss GuV
    Carry4Loss: "Verlustvortrag",
    NextYear: "Folgejahr",
    VariableCap: "Variables Kapital",
    CapGainTax: "KapErtragSt",
    CapGainSoli: "KapErtragStSoli",
    RegularOTC: "Betriebsergebnis",
    RegularFIN: "Finanzergebnis",
    Revenue:    "Umsatz",
    DirectCost: "zurechenb. Kosten",
    GrossYield: "Rohertrag",
    DirectCost: "zurechenb. Kosten",
    Depreciation:"Abschreibung",
    OtherRegular:"and. betriebl. Kosten",
    YPart:"Beteiligungsergebnis",
    FinSale:"Wertpapier-VK",
    NetInterest:"Zinseinnahmen",
    InterestCost:"Zinskosten",
    CapTax:"Kap.Ertragssteuer",
    PaidTax:"gezahlte Steuern",
    OpAssets:"betriebsnotw.Vermögen",
    AvgCurrent:"mittl.Umlaufvermögen",
    OpCapital:"betriebsnotw.Kapital",
    TaxClaims:"Steuerforderung",
    CapMargin:"Kapitalrendite",

    // Buttons
    Address:"Adresse",
    Book: "Buchen",
    Closing:"Abschluss",
    Diagram:"Diagramm",
    Transfer:"Überweisung",
    Transaction:"Buchung"
}
module.exports['de_DE']=de_DE;


// main response object
// SCHEMA-part
const COLMIN=2;
const D_Schema = "Schema"; // includes .Names .total .assets .eqliab  N1.author N2.residence  I1.iban I2.register I3.taxnumber  K1.reportYear K2.client
const D_XBRL   = "XBRL";
const D_Eigner = "Eigner";
const D_Equity = "Kapital";
// TRANSACTIONS-part
const D_Balance= "Bilanz";
const D_History= "Historie";
const D_Partner_NET= "NETPartner";
const D_Partner_CAP= "CAPPartner";
const D_Partner_OTC= "OTCPartner";
const D_SHARES = "Anteile";
const D_Report = "Report";
const D_FixAss = "Anlagen";
const D_Muster = "Muster";
const D_Adressen="Adressen";










//import { argv } from 'process';
var autoSave=36000000; // seconds, defaults to ten-hourly-save

function init(app, argv) {

    // GENERAL request for current session data
    app.get('/', (req, res) => {
        res.redirect('/SHOW');
    })



    app.post("/BOOK", (req, res) => { 
        if(debug) console.log("\n\n");
        // from TransferForm.html       
        if(debug) console.log(Server.timeSymbol());
        if(debugReport) console.log("0010 app.post BOOK prepareTXN('"+JSON.stringify(req.body)+"')");

        var result="SERVER BOOKED";
        let sessionId = req.body.sessionId; // OLD
        let oldSession=Server.getSession(sessionId);
        let client = oldSession.client;
        let year = oldSession.year;
        let jFileName = year+client+".json";
        if(sessionId && client && year) {

            // SECURITY SANITIZE req.body
            let tBuffer = prepareTXN(sessionId,req.body);
            let sessionTime=Server.timeSymbol();
            let nextSessionId= Server.strSymbol(sessionTime+client+year+sessionTime);

            // modifies session object and stores it under new sessionId
            let session = Sheets.bookSheet(sessionId,tBuffer,sessionTime,nextSessionId);
            // 20220516 Sheets.xlsxWrite(req.body.sessionId,tBuffer,sessionTime,nextSessionId); 
            // state change in YYYYCCCC.json

            let serverAddr = Server.localhost();

            // async
            Sheets.save2Server(session,client,year)
                .then(jFileName => { if(res) res.json({url:serverAddr+'/LATEST', client, year, 'jFileName':jFileName  })
                });

        } else {
            result="NO SESSION ID";
            console.log("0015 app.post BOOK NO sessionId");
        }        
    });


        
    app.post("/STORE", (req, res) => { 
        // STORE txn into LOG for later use
        // from HistoryList.html       
        if(debug) console.log("\n\n");
        if(debug) console.log(Server.timeSymbol());
        if(debug) console.log("0010 app.post STORE LOG txn into log('"+JSON.stringify(req.body)+"')");
        
        let delta = req.body.delta;

        if(debug) console.log("0019 app.post STORE LOG with session id=("+req.body.sessionId+")");

        if(delta) Sheets.saveSessionLog(req.body.sessionId,req.body);
        else console.log("0021 app.post STORE LOG Id=("+req.body.sessionId+") did not save: no transaction!");
        
        res.writeHead(Sheets.HTTP_OK, {"Content-Type": "text/html"});    
        res.end("\nSTORED.");
    });



    app.get("/favicon.ico", (req, res)  => { res.sendFile(__dirname + "/favicon.jpg"); });

    app.get('/SHOW/', (req, res)    => {     
        // two very different functions here
        // 1. with SESSION-ID: returns normal JSON data structure
        // 2. with client name: return HTML dialog with latest session
        console.log("\n\n");
        console.log(Server.timeSymbol());
        console.log("1910 app.get SHOW sessionId="+ req.query.sessionId);

        // load session via id
        let session = null;
        if(req.query.sessionId) session=Server.getSession(req.query.sessionId);
        
        if(session) {
            let balance = session.generated;
            // SERVER FUNCTION INTERPRET1 GH20220918

            console.dir("1920 app.get SHOW sends Balance ="+JSON.stringify(Object.keys(balance)))
            // .map((element,i)=>(element + Object.keys(balance.element).length))));
            res.writeHead(Sheets.HTTP_OK, {"Content-Type": "text/html"}); 
            send(res,balance); 
        }
        /*
        else {
            // 20220730
            // SY !!
            console.dir("1930 app.get SHOW - NO SESSION ID KNOWN");
            if(req.query.client) session=Server.getClient(req.query.client);
            
            if(session && session.year && session.id && session.client) {

                let jLogin = Server.jLoginURL(session.year,session.client,session.id);

                res.writeHead(Sheets.HTTP_OK, {"Content-Type": "text/html"}); 
                                
                res.write("<HTML><BODY><FORM METHOD='GET' ACTION='LOGIN'><BUTTON TYPE='submit' VALUE='ENTER'>Enter</BUTTON>"
                    +"<INPUT type='text' name='year'  value='"+session.year+"'>"+session.year+"</INPUT>"
                    +"<INPUT type='text' name='client' value='"+session.client+"'>"+session.client+"</INPUT>"
                    +"<INPUT type= 'hidden' name='mainSid' value='"+jLogin.mainSid+"'></INPUT>"
                    +"<INPUT type= 'edit' name='postFix'>....</INPUT>"
                    +"</FORM></BODY></HTML>");

            } else {
                // No session known for that client

                res.writeHead(Sheets.HTTP_OK, {"Content-Type": "text/html"}); 
                res.write("<HTML><BODY>Client "+req.query.client+" not  logged in </BODY></HTML>");

            }
        }
        */
        res.end();
    })




    app.get("/DOWNLOAD", (req, res) => { 
        // DOWNLOAD JSON to client     

        console.log("\n\n");
        console.log(Server.timeSymbol());
        let sessionId = req.query.sessionId;
        console.log("1500 app.post DOWNLOAD JSON for with session id=("+sessionId+")");

        let session = Server.getSession(sessionId);

        if(session && session.year && session.client) {


            //setAutoJSON(`+strSessionId+`)


            // 20220520 server-side XLSX
            console.log("1510 app.post DOWNLOAD XLSX for year"+session.year);

            let sessionTime=Server.timeSymbol();
            let monthYearHour = sessionTime.slice(4,10);

            // no state change, because no tBuffer is given
            Sheets.xlsxWrite(sessionId,null,sessionTime,sessionId); 
            console.log("1530 app.post DOWNLOAD writing XLSX");


            // download JSON
            let fileName = session.year+session.client+monthYearHour+'.json';
            console.log("1540 app.post DOWNLOAD download JSON as "+fileName);
            res.set('Content-Disposition', 'attachment; fileName='+fileName);
            res.json(session);    

        } else {
            console.log("1543 app.post NO DOWNLOAD - INVALID SESSION')");
            res.writeHead(Sheets.HTTP_OK, {"Content-Type": "text/html"});    
            res.end("\nINVALID SESSION.\n");
        }
    });



// downloads EXCEL version of current session context
    app.get('/EXCEL', (req, res) => {
        
        console.log("\n"+Server.timeSymbol());
        console.log("1600 GET EXCEL");
        let session = null;

        if(req.query.sessionId) {
            session=Server.getSession(req.query.sessionId);
            if(session) {
                console.log("1610 GET EXCEL FOR "+session.id.slice(-4));
        
                if(session.sheetName) {
                    let client = session.client;
                    let year = session.year;
                    let sheetName = session.sheetName;
                    if(debugReport) console.log("1620 /EXCEL sheetName="+sheetName); 
                    if(client && year) {

                        let sessionTime=Server.timeSymbol();
                        let nextSessionId= Server.strSymbol(sessionTime+client+year+sessionTime);

                        if(debugReport) console.log("1630 GET /EXCEL "+sheetName+ " for ("+client+","+year+")");

                        // may use same time and id because no tBuffer is given
                        let fileSig = Sheets.xlsxWrite(session.id,null,sessionTime,nextSessionId);

                        if(debugReport) console.log("1640 GET /EXCEL JSON "+JSON.stringify(fileSig));

                        sendFile(fileSig, res);
                            // close file
                        return;
                    } else console.log("1621 GET /EXCEL NO CLIENT NO YEAR"+JSON.stringify(Object.keys(session)));
                } else console.log("1623 GET /EXCEL NO SHEETNAME IN SESSION"+JSON.stringify(Object.keys(session)));
            } else console.log("1625 GET /EXCEL NO SESSION"+req.query.sessionId);
        } else console.log("1627 GET /EXCEL NO ID in QUERY");
        res.end("NO FILE.");
    } );
    // get Excel by client
    


    return processArgv(argv);
}
module.exports['init']=init;


async function sendFile(sig, response) {  
    // Check if file specified by the filePath exists
    fs.exists(sig.serverFile, function (exists) {
        if (exists) {
            // Content-type is very interesting part that guarantee that
            // Web browser will handle response in an appropriate manner.
            //response.writeHead(200, {
            //    "Content-Type": "application/octet-stream",
            //    "Content-Disposition": "attachment; filename=" + sig.serverFile
            //});
            console.log("1650 TRANSFER "+sig.serverFile);
            fs.createReadStream(sig.serverFile).pipe(response);
            console.log("1660 PIPING "+sig.serverFile);
            return;
        }
        response.writeHead(400, { "Content-Type": "text/plain" });
        response.end("ERROR File does not exist");
    });
}

// XBRL
function initBalance() {

    var balance = [];

    balance[D_Balance]={};
    balance[D_History]={};
    balance[D_Schema]= {};
    balance[D_FixAss]= {};
    balance[D_Partner_NET]= {};

    balance[D_Report]={
        xbrlTanFix : { level:3, xbrl: "de-gaap-ci_bs.ass.fixAss.tan", de_DE:'Sachanlagen'},
        xbrlFinFix : { level:3, xbrl: "de-gaap-ci_bs.ass.fixAss.fin", de_DE:'Finanzanlagen'},
        xbrlFixed  : { level:2, xbrl: "de-gaap-ci_bs.ass.fixAss", de_DE:'Anlagevermögen'},
        abrlABank: {   level:4, xbrl: "de-gaap-ci_bs.ass.currAss.cashEquiv.bank", de_DE:'Bankkonto'},
        abrlAmoney: {  level:3, xbrl: "de-gaap-ci_bs.ass.currAss.cashEquiv", de_DE:'Geldinstr.'},
        xbrlPaidTax: { level:4, xbrl: "de-gaap-ci_bs.ass.currAss.receiv.other.otherTaxRec", de_DE:'gezahlte Steuer'},      
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
        xbrlUVAVA:  {  level:3, xbrl: "de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.accumLoss", de_DE:'Verlust FA Komplem.'},
        xbrlLVAVA:  {  level:3, xbrl: "de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.accumLoss", de_DE:'Verlust FA Kommmand.'},
        xbrlEquity: {  level:2, xbrl: "de-gaap-ci_bs.eqLiab.equity", de_DE:'Eigenkapital'},
        xbrlRegFin: {  level:3, xbrl:"de-gaap-ci_is.netIncome.regular.fin", de_DE:de_DE.RegularFIN},      
        xbrlRegOTC: {  level:3, xbrl:"de-gaap-ci_is.netIncome.regular.operatingTC", de_DE:de_DE.RegularOTC},      
        xbrlRegular:{  level:2, xbrl:"de-gaap-ci_is.netIncome.regular", de_DE:'Gewinn/Verlust'},      
        xbrlEqLiab :{  level:2, xbrl: "de-gaap-ci_bs.eqLiab", de_DE:'Passiva'}, // see HGBBeginYear.html HGBRegular.html
        xbrlIncome: {  level:1, xbrl: "de-gaap-ci_bs.eqLiab.income", de_DE:'Passiva Gewinn'},
        // see sendBalance(), CloseAndSave.htmlReport.xbrlIncome.closing.split(CSEP);
        //xbrlNIP:    {  level:1, xbrl: "de-gaap-ci_bs.eqLiab.equity.netIncomePartnerships", de_DE:'Bilanzgewinn'},
        // 20220123 previous row is synthetic, from KernTax for HGBRegular
    };
    // subscribed.limitedLiablePartners.accumLoss

    return balance;
}



function compile(sessionData) {

    let addrT=sessionData.addrT;
    let logT=sessionData.logT;
    let aoaCells=sessionData.sheetCells;
    let strTimeSymbol=sessionData.strTimeSymbol;

    var result = initBalance();
    
    result[D_Muster] = logT;
 
    result[D_Adressen] = addrT;

    // digest aoaCells and write into balance object
    var firstLine=1;
    var lineCount=0;

    if(aoaCells && aoaCells.length>J_MINROW) {

        var numLines=aoaCells.length;

        let lastLine = aoaCells[numLines-1];
        console.log("0100 compile.compile() includes "+lastLine[1]+" "+lastLine[3]);

        if(numLines>J_MINROW) {

            result[D_Eigner] = {};
            result[D_Schema] = {};
            try {
                var iAssets=0;
                var iEqLiab=0;
                var iTotal=0;

                // print all lines
                aoaCells.forEach(row => {

                    lineCount++;
                    
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
                        console.dir("0114 SCHEMA N assets="+iAssets+ " eqLiab="+iEqLiab+ " Total="+iTotal);
                        
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
                        result[D_Schema].reportYear= row[2];
                        result[D_Schema].client    = row[3];
                    }
                    else if(key && key==='A') {
                        if(debugReport) console.log("compile.compile ASSET  "+row);
                        const assetInfo = row;
                        if(assetInfo.length>J_ACCT) {
                            var date = assetInfo[1];
                            var type = assetInfo[2];
                            var init = Money.moneyString(Money.setENMoney(assetInfo[3]));
                            var nmbr = assetInfo[4];
                            var idnt = assetInfo[5];
                            if(idnt && idnt.length>COLMIN && nmbr && nmbr.length>0) {
                                var rest =assetValue(assetInfo,iAssets);
                                var cost =getCost(idnt,nmbr,init);
                                result[D_FixAss][idnt]={ "date":date, "type":type, "init":init,  "nmbr":nmbr, "idnt":idnt, "rest":rest, "cost":cost };
                                if(debug>1) console.log(" BOOK  "+idnt+" = "+result[D_FixAss][idnt].init+ "for #"+nmbr+" at "+cost);
                                //if(debug>1) console.log("Assets"+JSON.stringify( result[D_FixAss][idnt] ));
                            }
                        }
                    }
                    else if(key && key==='X') {

                        // GH20220126
                        var xRow=[];
                        var column;
                        for(column=0;column<row.length;column++) xRow.push(row[column].trim());
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
                        result[D_Eigner]=row;
                    }
                    else if(key && parseInt(key)>0) {                    
                        const MINTXN=5; // elements in a TXN
                        var jHistory = result[D_History];
                        //if(debug>1) console.log("BOOK "+row.join(CSEP));
                        if(row.length>MINTXN && result[D_Schema].Names){
                            var gNames = result[D_Schema].Names;
                            var gDesc  = result[D_Schema].Desc;
                            var aLine = row;
                            
                            jHistory[lineCount]=aLine;
                            if(firstLine) {
                                // opening balance lines
                                for(var xColumn=0;xColumn<gNames.length;xColumn++) {
                                    var rawName = gNames[xColumn];
                                    var xbrl = result[D_XBRL][xColumn];
                                    var xdesc=""+xColumn; if(gDesc && gDesc[xColumn]) xdesc=gDesc[xColumn];
                                    if(rawName && rawName.length>1) {
                                        result[D_Balance][rawName] = Account.makeAccount(rawName,xbrl,xdesc,xColumn);
                                    }
                                    if(debug>1) console.log("make("+rawName+","+xbrl+","+xdesc+","+xColumn+")");
                                    
                                };
                            }

                            var column=0;
                            aLine.forEach(strAmount => {
                                if(debug>1) console.log("init "+strAmount);
                                if(column>=J_ACCT && strAmount && strAmount.length>0) {
                                    var acName = gNames[column];
                                    if(acName && acName.length>1) {
                                        if(firstLine) {
                                            // initialize the values with 0,00 if nothing is specified
                                            if(strAmount==null || strAmount.length==0) strAmount="0,00";
                                        }
                                    
                                        var account = result[D_Balance][acName];
                                        if(account && account.xbrl) {
                                            
                                            if(firstLine) {
                                                result[D_Balance][acName] = Account.openAccount(account,strAmount);
                                                if(debug>1) console.log("open "+strAmount
                                                    +" for "+gNames[column]
                                                    +"  = "+JSON.stringify(result[D_Balance][acName])
                                                );
                                            } else { 
                                                result[D_Balance][acName] = Account.addEUMoney(account,strAmount);
                                                if(debug>1) console.log("add  "+strAmount
                                                +" to  "+gNames[column]
                                                +"  = "+JSON.stringify(result[D_Balance][acName]));
                                            }
                                        }
                                    }
                                }
                                column++;
                            })
                            firstLine=null;                
                            // 2697211	2021-01-19	BAY001	INVEST	200	BAYR_1
                            

                            if(aLine[3] && aLine[3].trim()==='INVEST') {
                                var date = aLine[1].trim();
                                var type = aLine[2].trim();
                                var nmbr = aLine[4].trim();
                                var idnt = aLine[5].trim();

                                var init = assetValue(aLine,iAssets);
                                var cost =getCost(idnt,nmbr,init);
    
                                result[D_FixAss][idnt]={ "date":date, "type":type, "init":init,  "nmbr":nmbr, "idnt":idnt, "rest":init, "cost":cost};
                                if(debug>1) console.log("INVEST "+idnt+" = "+result[D_FixAss][idnt].rest+ "for #"+nmbr+" at "+cost);
                            }

                            if(aLine[3] && aLine[3].trim()==='SELL') {

                                var date = aLine[1].trim();
                                var type = aLine[2].trim();
                                var iSel = parseInt(aLine[4].trim());
                                var idnt = aLine[5].trim();
                                var amnt = assetValue(aLine,iAssets);

                                var init = result[D_FixAss][idnt].init;

                                // sales reduce number of asset C140san damount of asset value
                                var iNum = parseInt(result[D_FixAss][idnt].nmbr);
                                var nmbr = iNum-iSel;
                                var rest = result[D_FixAss][idnt].rest;
                                var  remn = Money.moneyString(Money.addEUMoney(rest,Money.setEUMoney(amnt)));

                                var cost =getCost(idnt,nmbr,init);
                                // OPEN
                                // MUST VERIFY existing identifier
                                result[D_FixAss][idnt]={ "date":date, "type":type, "init":init,  "nmbr":nmbr, "idnt":idnt, "rest":remn, "cost":cost };
                                if(debug>1) console.log("SELL "+idnt+" = "+result[D_FixAss][idnt].rest);
                            }

                            if(aLine[3] && aLine[3].trim()==='YIELD') {

                                var idnt = aLine[5].trim();
                                var amnt = assetValue(aLine,iAssets);

                                //console.log("YIELD "+amnt+" for "+idnt+" in "+aLine.join(';'));

                                if(result[D_FixAss]) {
                                    if(result[D_FixAss][idnt]) {
                                        var date = result[D_FixAss][idnt].date;
                                        var type = result[D_FixAss][idnt].type;
                                        var iVal = result[D_FixAss][idnt].init;
                                        var nmbr = result[D_FixAss][idnt].nmbr;
                                        var curr = result[D_FixAss][idnt].rest;

                                        // yield type of devidend payment reduces the INIT value
                                        // GH20220108  amount reduces the CURRent value
                                        var rest = Money.moneyString(Money.addEUMoney(curr,Money.setEUMoney(amnt)));

                                        // GH20220108 NEW cost is calculated as the INIT price per number of units
                                        var cost = getCost(idnt,nmbr,rest);

                                        // OPEN
                                        // MUST VERIFY existing identifier
                                        result[D_FixAss][idnt]={ "date":date, "type":type, "init":iVal,  "nmbr":nmbr, "idnt":idnt, "rest":rest, "cost":cost  };
                                        if(debug>1) console.log("YIELD amount="+amnt+" changes "+idnt+" from "+cuur+" to "+result[D_FixAss][idnt].rest);

                                        } else  console.log("YIELD UNKNOWN "+idnt+" ASSET");
                                } else {
                                    if(debug>1) console.log("YIELD UNKNOWN "+idnt);
                                }
                            }
                        }
                    }
                });
                if(debug>1) console.log("compile: check partners");

                // process the partners
                var partners = {};
                if(result[D_SHARES] && result[D_XBRL] && result[D_Schema] && result[D_Schema].eqliab>J_ACCT) {

                    var shares = result[D_SHARES];
                    var arrXBRL= result[D_XBRL];
                    var arrEQUI= result[D_Equity];
                    var gNames = result[D_Schema].Names;
                    var eqliab = result[D_Schema].eqliab;

                    var basis = shares[2];


    
    
/*          D_Partner_NET[i] = { }
            compile
                    id:   # 0-(N-1)
                    vk    Name 'K2xx'
                    gain: Nenner
                    denom:Zaehler
                    iVar  #Spalte K2xx
                    iCap  #Spalte Fest/Kommanditkapital
                    name  Name (Text in Spalte mit FK oder KK)

            sendBalance
                    cyLoss Laufende Verluste aus Veraesserungen VAVA
                    keso
                    kest
                    income
                    otc
                    cap

                    netIncomeFin
                    netIncomeOTC
*/

                    // create partners structure
                    var pNum=0;
                    for(col=eqliab+1;col<shares.length;col++) {
                        if(shares[col] && arrXBRL[col].includes('limitedLiablePartners.VK')) {
                            var pShare = shares[col];
                            if(isNaN(pShare)) pShare=" 0";                       
                            partners[pNum]={ 'id':pNum, 'vk':gNames[col], 'gain':pShare, 'denom':basis, 'iVar':col };
                            pNum++; // GH20220206 
                        }
                    }

                    if(arrXBRL) {
                        pNum=0;
                        for(col=eqliab+1;col<shares.length;col++) {
                            var acc = arrXBRL[col];
                            if(shares[col] && (acc.includes('limitedLiablePartners.KK') || acc.includes('limitedLiablePartners.FK'))) {
                                partners[pNum].iCap=col;
                                partners[pNum].name=shares[col];
                                pNum++;
                            }
                        }
                    } else console.dir("compile: NO arrXBRL for PARTNERS");


                    /*
                    // VAVA VKxx Verluste Verlustvortrag
                    try {
                        if(arrEQUI) {

        // CREATE SYNTHETIC VKXX accounts 

        //                    display losses as booked over the year
                            pNum=0;
                            for(col=eqliab+1;col<shares.length;col++) {
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
                        } else console.dir("compile: NO EQUITY list for partners");
                    } catch(err) { console.dir("compile: ERR EQUITY list for partners"+err); }
                    */

                    
                } else console.dir("0120 compile.compile: NO PARTNERS");


                result[D_Partner_NET]=partners;
                if(debugReport) 
                    for (let i in partners) { console.log("Server compile Partner("+i+") "+JSON.stringify(partners[i])); }

            } catch (err) {
                console.error('0125 compile.js compile:'+err);
                console.dir('0125 compile.js compile:'+err);
            }

            if(debug) console.log("0192 compile.compile.Schema="+JSON.stringify(Object.keys(result[D_Schema])));

        } else console.error('0111 compile.js compile NO BALANCE');

    } else console.error('0101 compile.js compile NO aoaCells');


    
        for(let key in result) {
            console.dir('0200 compile.js compile() -> balance['+key+']'); 
        }

    console.log("0210 COMPILED = "+JSON.stringify(Object.keys(result)));

    let balance = sendBalance(result);

    console.log("0220 COMPILED = "+JSON.stringify(Object.keys(balance)));

    return balance;

}
module.exports['compile']=compile;

function save2Server(session,client,year) {
    Sheets.save2Server(session,client,year);
}
module.exports['save2Server']=save2Server

function display(registerLink,sessionId,year,client,clientSave) {
    var vbanner=[];
    
    if(sessionId) {
        vbanner.push('<SCRIPT type="text/javascript" src="/client.js"></SCRIPT>');

        vbanner.push('<SCRIPT>localStorage.setItem("mysession",'+`"${sessionId}"`+');</SCRIPT>');

        if(!clientSave) vbanner.push('<DIV class="dosBorder">');
        
        vbanner.push('<DIV class="mTable"><DIV class="ulliTab"><DIV class="attrKeys">');

        
            let strSessionId = "'"+sessionId+"'"; 
            if(clientSave) {
                vbanner.push('<SCRIPT>setAutoJSON('+strSessionId+');</SCRIPT>');
                //  set automatic client-side JSON download
            }


            

            
            vbanner.push(buttonOpenTile(registerLink("status",    "Status.html",sessionId),'Status',3)); 

            
            vbanner.push(buttonOpenTile(registerLink("account", "AccountHistory.html",sessionId),'AcctHistory'));

            
            vbanner.push(buttonOpenTile(registerLink("openbalance","OpenBalance.html",sessionId),'AcctOpen'));

            
            vbanner.push(buttonOpenTile(registerLink("hgbregular", "HGBRegular.html",sessionId),'BalanceClose'));

            
           vbanner.push(buttonOpenTile(registerLink("dashboard",  "DashBoard.html",sessionId),'DashBoard',3));

            
            vbanner.push(buttonOpenTile(registerLink("history",   "HistoryScreen.html",sessionId),'History'));

            
            vbanner.push(buttonOpenTile(registerLink("gainloss",  "GainLoss.html",sessionId),'GainLoss'));

            vbanner.push('</DIV><DIV class="attrKeys">');            

            
            vbanner.push(buttonOpenTile(registerLink("assets", "AssetScreen.html",sessionId),'Assets'));

            
            vbanner.push(buttonOpenTile(registerLink("balance",  "BalanceTable.html",sessionId),'AcctClose'));

            
            vbanner.push(buttonOpenTile(registerLink("galshgb",  "HGB275S2OTC.html",sessionId),'GainlossHGB'));

            
            vbanner.push(buttonOpenTile(registerLink("hgbbeginyear", "HGBBeginYear.html",sessionId),'BalanceOpen'));

            if(isSameFY(year)) {
                
                vbanner.push(buttonOpenTile(registerLink("transfer","Transfer.html",sessionId),'Transfer'));
            } else console.log("compile.makeBanner "+year +" PAST YEAR ("+unixYear()+")- NO XFER command");


            
            vbanner.push(buttonOpenTile(registerLink("pattern", "PatternList.html",sessionId),'Patterns'));      

            if(clientSave) { // clientFlag===JSON
                
                vbanner.push(buttonOpenTile(registerLink("closeandsave", "CloseAndSave.html",sessionId),'Closing'));
            }
            else vbanner.push(labelText(client+" "+year));

//            registerLink("assetl", "AssetList.html"); 

            
            // fill table
            vbanner.push('</DIV><DIV class="attrKeys">');
            vbanner.push('</DIV><DIV class="attrKeys">');
            vbanner.push('</DIV><DIV class="attrKeys">');
            vbanner.push('</DIV></DIV></DIV>');

            if(!clientSave) vbanner.push('</DIV>');

        console.log("0300 makeBanner OK for "+client+","+year);
    
    } else return  '<DIV class = "mTable"><DIV class = "ulliTab"><DIV class = "attrLine">NO SESSION info</DIV></DIV></DIV>';
    return vbanner.join('');
}
module.exports['display']=display;


function isSameFY(year) 
{
    let numYear=unixYear();
    console.log("isSameFY"+numYear);
    if(parseInt(year)>numYear-1) return true;
    return (parseInt(year)==numYear) 
}
module.exports['isSameFY']=isSameFY;



function unixYear() {
    return new Date(Date.now()).getUTCFullYear();
};


function buttonOpenTile(link,command) {
    let label = de_DE[command];
    let strLink = "'"+link+"'";
    let strCommand = "'"+command+"'";
    let result =  '<DIV class="C100"><A HREF="JavaScript:newPopup('+strLink+','+strCommand+');" ><BUTTON class="largeKey">'+label+'</BUTTON></A></DIV>';
    if(debug>2) console.log(result);
    return result;
}


function buttonOpenWide(link,command,lines) {
    let label = de_DE[command];
    let strLink = "'"+link+"'";
    let strCommand = "'"+command+"'";
    let result =  '<DIV class="C100"><A HREF="JavaScript:newPopup('+strLink+','+strCommand+',1500,'+lines+');" ><BUTTON class="largeKey">'+label+'</BUTTON></A></DIV>';
    if(debug>2) console.log(result);
    return result;
}



// generate a copy of the balance, with all accounts closed 
// and GAIN LOSS being distributed to partners
function sendBalance(balance) {
    let bAccounts = balance[D_Balance];
    let bHistory = balance[D_History];
    
    
    var gResponse = {}; 
    gResponse[D_Balance]={}; 
    let gross  = gResponse[D_Balance];

    gResponse[D_History]={}; 
    let txns = gResponse[D_History];

    var arrXBRL= balance[D_XBRL];
    gResponse[D_XBRL]=balance[D_XBRL];
    
    gResponse[D_Schema]={};
    var gNames = balance[D_Schema].Names;

    let partners=balance[D_Partner_NET];
    gResponse[D_Partner_NET]=partners;


    let bReport = balance[D_Report];
    gResponse[D_Report]=JSON.parse(JSON.stringify(bReport));


    // R1 add account structures to  the copy of D_Report
    let gReport = gResponse[D_Report];
    for(let xbrl in gReport) {
        var element=gReport[xbrl];
        if(debugReport) console.log("compile.js sendBalance ACCOUNT "+JSON.stringify(element));           
        element.account = Account.openAccount(Account.makeAccount(element.de_DE,element.xbrl),"0,00");
    }

    var cTaxPaid=0;
                
    // ADD bAccounts' saldi to gReport
    for (let name in bAccounts)   {
        if(name && name.length>=COLMIN) {
            var account=bAccounts[name];
            if(account && account.xbrl && account.xbrl.length>COLMIN) {
                var axbrl = account.xbrl;

                account.yearEnd=Account.getSaldo(account); // GH20221028

                

                // GH20221028
                if(axbrl.startsWith(bReport.xbrlRegular.xbrl)) {  // clear income
                    if(debugReport) console.log("compile.js sendBalance REGULAR:"+axbrl);
                    account.next="0,00";
                }
                else if(axbrl.startsWith(bReport.xbrlPaidTax.xbrl)) { // move tax paid
                    cTaxPaid += Money.setEUMoney(account.yearEnd).cents;
                    if(debugReport) console.log("compile.js sendBalance Tax Paid="+Money.cents2EU(cTaxPaid));
                    account.next="0,00";
                }
                else account.next=account.yearEnd;




                // search, find and update corresponding SYNTHETIC report account
                for(let rxbrl in gReport) {
                    var element=gReport[rxbrl];
                    var collect=element.account;
                    if(collect && axbrl.startsWith(element.xbrl)) {
                        element.account = Account.addEUMoney(collect,Account.getSaldo(account));
                        element.account.init = Money.moneyString(Money.addEUMoney(element.account.init, Money.setEUMoney(account.init))); // GH20220103 GH20220104 wrong gross value, contains init
                        element.account.next = Money.moneyString(Money.addEUMoney(element.account.next, Money.setEUMoney(account.next))); // GH20221028
                        
                        //if(debugReport) console.log("compile.js sendBalance SYNTHETIC ("+name+"  "+axbrl+") IN "+element.de_DE + "   "+JSON.stringify(element.account));    
                    }
                }
            }
        }
    }
    distribute({ 'cents':cTaxPaid },partners,'tax');


    // find common VAVA account GH202112222 and distribute current-year changes to partners
    var all_cs;
    var all_cyloss="--";
    var all_iSale=-1;
    var assets = balance[D_Schema].assets;
    for(col=J_ACCT;col<assets;col++) {
        if( arrXBRL[col] && arrXBRL[col].includes('receiv.other.CapLoss')) {
            all_cs=gNames[col]; // Kontoname gemeinschaftl Verluste aus Verkaeufen von Aktien
            all_iSale=col;      // Spalte    gemeinschaftl Verluste aus Verkaeufen von Aktien
        }
    }
    // distribute share-sales losses to partners
    var p_cyLoss;
    if(all_cs) {
        //  distribute current-year VAVA changes to partners
        let vava = balance[D_Balance][all_cs];

        all_cyloss = Account.getChange(vava)

        if(debugReport) {
            console.log("VAVA INIT   "+vava.init);
            console.log("VAVA CREDIT "+vava.credit);
            console.log("VAVA DEBIT  "+vava.debit);
            console.log("VAVA CHANGE "+all_cyloss);
        }

        p_cyLoss = distribute(Money.setEUMoney(all_cyloss),partners,'cyLoss');
        if(debugReport) console.log("compile.js sendBalance CYLOSS  G"+p_cyLoss[0]+" E"+p_cyLoss[1]+" A"+p_cyLoss[2]+" K"+p_cyLoss[3]+" T"+p_cyLoss[4]+" L"+p_cyLoss[5]); 
    
    }
    

    //   transfer overview to report 
    let aAssets = gReport.xbrlAssets.account;
    let aEqliab = gReport.xbrlEqLiab.account;
    let aEqlreg = gReport.xbrlRegular.account;
    let aRegFin = gReport.xbrlRegFin.account;
    let aRegOTC = gReport.xbrlRegOTC.account;

    let aEqlinc = gReport.xbrlIncome.account; // should be empty at this stage


    // started addition with aEqlinc to preserve account name
    let aEqlsum=Account.addEUMoney(aEqlreg,Account.getTransient(aEqliab));
    aEqlinc=Account.addEUMoney(aEqlinc,Account.getTransient(aEqlsum));

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
        account.yearEnd=Account.getTransient(account);
        account.next = "0,00";

        if(debugReport) console.log("compile.js sendBalance send1 REPORT("+element.de_DE+") "+JSON.stringify(element.account));           
    }


 
    let netIncome = Money.setEUMoney(Account.getSaldo(aEqlreg));
    distribute(netIncome,partners,'income');
    // GH20220206


    let netIncomeFin = Money.setEUMoney(Account.getSaldo(aRegFin));
    distribute(netIncomeFin,partners,'netIncomeFin');
    // GH20220206

    let netIncomeOTC = Money.setEUMoney(Account.getSaldo(aRegOTC));
    distribute(netIncomeOTC,partners,'netIncomeOTC');
    // GH20220206




    
    // GH20220206 MODIFY K2xx accounts 
    // substract KEST
    for (let id in partners) {
        var p=partners[id];
        var varcap=bAccounts[p.vk];
        varcap.income=p.income;
        varcap.netIncomeOTC=p.netIncomeOTC;
        varcap.netIncomeFin=p.netIncomeFin;
        varcap.yearEnd=Account.getSaldo(varcap);
        
        // GH 20221028 substract paid tax
        let mYearEnd =  Money.setEUMoney(varcap.yearEnd);
        let mIncome  = Money.setEUMoney(varcap.income);
        let mTaxPaid = Money.setEUMoney(p.tax);
        varcap.next =  Money.cents2EU( mYearEnd.cents + mIncome.cents - mTaxPaid.cents ); 

        // 20221029 detailed partner account info
        p.init = varcap.init;
        p.credit = varcap.credit;
        p.debit = varcap.debit;
        p.yearEnd = varcap.yearEnd;
        p.close = Money.cents2EU( mYearEnd.cents + mIncome.cents ); 
        p.next=varcap.next;


        if(debugReport) console.log('compile sendBalance  '+JSON.stringify(p) + "\n ==>> MODIFY K2xx "+JSON.stringify(varcap));
    }




    // build gResponse[D_Balance]==gross from bAccounts:normal Accounts
    // update yearEnd result with saldo for each account
    // clear CapTax accounts
    for (let name in bAccounts)   {
        // add yearEnd saldo value
        if(name && name.length>=COLMIN) {
            var account=bAccounts[name];
            if(account && account.xbrl && account.xbrl.length>COLMIN) {
                account.yearEnd=Account.getSaldo(account);
                
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
                        element.account.next = Money.moneyString(Money.addEUMoney(element.account.next, Money.setEUMoney(account.next))); 
                        //if(debugReport) console.log("compile.js sendBalance SYNTHETIC  NEXT("+name+"  "+axbrl+") IN "+element.de_DE + "   "+JSON.stringify(element.account));    
                    }
                }
            }
        }
    }


    // reverse or nor GH20221107
    //Object.keys(bHistory).reverse().map((hash,i) => {txns[i] = bHistory[hash]});
    Object.keys(bHistory).map((hash,i) => {txns[i] = bHistory[hash]});
    
    
    // transfer all fixed assets
    gResponse[D_FixAss] = balance[D_FixAss];

    // transfer schema information
    gResponse[D_Schema] = balance[D_Schema];


    // compensating closing statement
    try {
        var iMoney;

        let year = balance[D_Schema].reportYear;

        let gAccounts = gResponse[D_Balance];
        let gReport = gResponse[D_Report]

        if(gReport.xbrlRegular.account.yearEnd) {
            var closeIncome = { 'credit':{}, 'debit':{}  };
            closeIncome['date']='31.12.'+year;
            closeIncome['sender']='System';
            closeIncome['refAcct']=de_DE['GainLoss'];
            closeIncome['svwz']=de_DE['NextYear'];
            closeIncome['svwz2']=de_DE['Closing'];

            let yearEnd = gReport.xbrlRegular.account.yearEnd;
            if(debugReport) console.log("sendBalance CLOSING income "+yearEnd);

            var aNum=0;
            for(let name in gAccounts) {
                if(gAccounts[name]) {
                    // if(debugReport) console.dir("sendBalance UPDATE CLOSING OTC "+JSON.stringify(gAccounts[name]));
                    let acc = gAccounts[name];
                    let xbrl = acc.xbrl;
                    if(xbrl.includes("netIncome.regular")) {
                        if(Money.negMoney(Money.setEUMoney(acc.yearEnd))) 
                        {
                            iMoney=closeIncome.debit[name]=Money.setEUMoney(Money.cents2EU(-1 * Money.setEUMoney(acc.yearEnd).cents));
                        }
                        else iMoney=closeIncome.credit[name]=Money.setEUMoney(acc.yearEnd);
                        iMoney.index=acc.index; 
                        if(debugReport) console.log("sendBalance CLOSING OTC "+JSON.stringify(iMoney));
                    }
                }
                aNum++;
            }

            if(partners) for (let i in partners) { 
                let p=partners[i];
                try {
                    let varcap=gAccounts[p.vk];                   
                    if(varcap) {
                        // if(debugReport) console.dir("sendBalance UPDATE CLOSING VAR "+JSON.stringify(p)+"Partner("+i+") "+JSON.stringify(varcap)); 
                        let name = varcap.name;
                        let aci = varcap.income;
                        if(Money.negMoney(Money.setEUMoney(aci))) {
                            iMoney=closeIncome.credit[name]=Money.setEUMoney(cents2EU(-1 * Money.setEUMoney(aci).cents));
                        }
                        else iMoney=closeIncome.debit[name]=Money.setEUMoney(aci);
                        iMoney.index=p.iVar; 
                        if(debugReport) console.log("sendBalance CLOSING VAR "+JSON.stringify(iMoney));
                    }
                } catch(err) { console.error("compile.js sendBalance UPDATE CLOSING  VARCAP ERROR: "+err); }
            }

            if(debugReport) console.log("sendBalance "+yearEnd+" CLOSING "+JSON.stringify(Object.keys(closeIncome.credit))+"  "+JSON.stringify(Object.keys(closeIncome.debit)));

            gReport.xbrlIncome.closing = JSON.stringify(closeIncome);
            if(debugReport) console.dir("1900 compile.js sendBalance UPDATE gReport.xbrlIncome.closing="+gReport.xbrlIncome.closing);

        } else console.dir("compile.js sendBalance UPDATE CLOSING: NO gReport.xbrlRegular.account.yearEnd");
    } catch(err) { console.error("compile.js sendBalance UPDATE CLOSING ERROR: "+err); }

    






    // transfer txn pattern information
    gResponse[D_Muster] = balance[D_Muster];
    gResponse[D_Adressen] = balance[D_Adressen];

    // transfer page header footer information
    var page = makePage(balance); // side-effect
    if(debugReport) console.log("compile.js sendBalance PAGE "+JSON.stringify(page));
    if(debugReport) console.log();
    gResponse[D_Page] = page;

    return gResponse;
}


function distribute(money,partners,target) {      
    if(debug) console.log('__________distribute()');
    var strNumber="0,00";
    if(typeof(money)=='number' && !Number.isNaN(money)) {
        strNumber=(100*money).toString();
        //console.log("compile.js distribute("+target+") format number="+money+ " string="+strNumber);
    } 
    var err="";
    if(debugReport) console.log("Sender.distribute("+target+") "+money.cents+" cents "+err); 
    if(!partners) { console.log("compile.js distribute() NO PARTNERS"); return; }

    return distributeMoney(money,partners,target);
}



function distributeMoney(money,bPartner,target) { // GH20211215
    var check=0;
    var result=[ 0, 0, 0, 0, 0, 0 ];
    var millis=0;
    var inc=-1;
    var sign=1;
    if(debug>2) console.log('Sender.distributeMoney('+JSON.stringify(money)+') CALL WITH MONEY');

    
    var amount=Money.setEUMoney(Money.moneyString(money)); 
    if(amount.cents<0) { let abs= -amount.cents; amount.cents=abs; sign=-1; }
    
    if(debug>2) console.log('Sender.distributeMoney('+JSON.stringify(amount)+') *'+sign+' ABSOLUTE VALUE ');

    if(bPartner) { 
        var pNum=0;
        for (var n in bPartner) {
            inc--;
            var p=bPartner[n];
            if(debug>2) console.log('Sender.distributeMoney for '+ p.vk);
            pNum++;
        }

        if(bPartner.length<2) console.log('Sender.distributeMoney('+JSON.stringify(amount)+') PRE-LOOP  NO PARTNERS IN BALANCE'); else
        
        while(Money.lessMoney(Money.setMoney(check),amount) 
                        && inc<999
        ){

            //if(debug>2) console.log("Sender.distribute("+amount.cents+") cents > "+check); 
            var shares=[];
            check=0;
            var fix=inc;
            for (var ndx in bPartner) {
                var p=bPartner[ndx];
                try { 
                    millis=10*parseInt(Money.iScaleMoney(amount,parseInt(p.gain),parseInt(p.denom),parseInt(fix / 2 * pNum))); 
                } catch (err) {
                    millis++; console.log('Sender.distribute  '+JSON.stringify(amount)+' amoung '+pNum+' LOOP fix='+fix+' failed;'+JSON.stringify(p));
                }
                if(debug>3) console.log('Sender.distribute('+amount.cents+')  LOOP  +'+fix+' cents at '+p.gain+'/'+p.denom+' => '+Math.trunc(millis/10));
                check=check+Math.trunc(millis/10);
                shares.push(sign * Math.trunc(millis/10));
                

                // GH20220102 
                fix--;

            }
            inc++;
            if(debug>2) console.log('Sender.distributeMoney('+amount.cents+')  POST-LOOP '+check);
            result=shares;
        }


        var index=0;
        for (let id in bPartner) {
            var p=bPartner[id];
            p[target]= Money.moneyString(Money.setMoney(result[index++]));
        }


    } else console.log('Sender.distributeMoney('+JSON.stringify(amount)+') NO PARTNERS IN BALANCE');

    if(debug && result && result.length>5) console.log('Sender.distributeMoney '+Money.moneyString(amount) + " G"+result[0]+" E"+result[1]+" A"+result[2]+" K"+result[3]+" T"+result[4]+" L"+result[5]);
    return result;
}


function makePage(balance) {

    var page = {};

    if(balance) {
        if(balance[D_Schema]) {
            gSchema  = balance[D_Schema];

            let author=gSchema.author;
            let residence=gSchema.residence;
            let iban=gSchema.iban;
            let register=gSchema.register;
            let taxnumber=gSchema.taxnumber;
            let reportYear=gSchema.reportYear;
            let client=gSchema.client;


            page['header'] = de_DE['reportYear'] + HTMLSPACE + reportYear; // de_DE:
            page['client'] = client;
            page['register'] = register+HTMLSPACE+taxnumber;
            page['reference'] = iban+HTMLSPACE+reportYear;
            page['author'] = author+HTMLSPACE+residence;
            page['footer'] = iban+HTMLSPACE+residence;

            for(let key in de_DE) {
                page[key]=  de_DE[key];  
                if(debug>1) console.log("compile makePage de_DE "+key+" -> "+de_DE[key]);
            }

            balance[D_Page] = page;
            // side-effect AND return value

            console.log();
            if(debug>1) console.log("compile makePage "+JSON.stringify(Object.keys(page)));

        } else console.error("compile makePage:  NO schema");
    } else console.error("compile makePage: NO balance");

    return page;
}


function assetValue(row,iAssets) {
    var column=J_ACCT;
    var value = row[column];
    var run=true;
    while(run && value.length<COLMIN && column<iAssets) {
        var test = row[column];
        if(test && test.length > 0 && parseInt(test)!=0) {value=test; run=false;}
        column++;
    } // shares before cash / account
 //   console.log("assetValue("+row+")="+value);
    return value;
}

function getCost(idnt,nmbr,init) {
    var units = parseInt(nmbr);
    var iCost = parseInt(Money.setEUMoney(init).cents);
    
    var uCost=iCost;
    if(units>0) {
        uCost = parseInt(iCost / units);
    }
  //  console.log(idnt+"COST("+init+"):"+iCost+" each "+units+" > "+uCost);
    return Money.moneyString({'cents':uCost});

}

function labelText(strText) {
    return  '<DIV class="C100"><BUTTON class="largeKey">'+strText+'</BUTTON></DIV>';
}



function prepareTXN(sessionId,reqBody) {

    //if(debugBook) 
    console.dir("compile.js prepareTXN("+sessionId+") book "+JSON.stringify(reqBody));

    var jFlag  = reqBody.flag; if(!jFlag) jFlag=0;
    var jDate  = reqBody.date;
    var jSender= reqBody.sender;
    var jAcct  = reqBody.refAcct;
    var jSVWZ  = reqBody.svwz;
    var jSVWZ2 = reqBody.svwz2;
    var jCredit= reqBody.credit;
    var jDebit = reqBody.debit;
    var bookingForm=null;

    let session = Server.getSession(sessionId);
    if(session) {
        console.dir("compile.js prepareTXN("+sessionId+") book "+JSON.stringify(reqBody));

        var balance = session.generated;

        if(balance && balance[D_Schema]) {

            let year = balance[D_Schema].reportYear;
    
            if(isSameFY(year) || jFlag) {

                if(debug>0) console.log("compile.js prepareTXN() "+JSON.stringify(jCredit)+"/ "+JSON.stringify(jDebit));


                var total = balance[D_Schema].total;
                var aLen = balance[D_Schema].assets;

                bookingForm = (CSEP.repeat(total)).split(CSEP);

                bookingForm[0]= 1-jFlag;
                bookingForm[1]=jDate;
                bookingForm[2]=jSender;
                bookingForm[3]=jAcct;
                bookingForm[4]=jSVWZ;
                bookingForm[5]=jSVWZ2;
                
                for(let money in jCredit) {
                    var factor=1;
                    var i=jCredit[money].index;
                    if(i>aLen) factor=-1;
                    bookingForm[i]=Money.moneyString(Money.setMoney(factor*jCredit[money].cents));
                }

                for(let money in jDebit) {
                    var factor=-1;
                    var i=jDebit[money].index;
                    if(i>aLen) factor=1;
                    bookingForm[i]=Money.moneyString(Money.setMoney(factor * jDebit[money].cents));
                }
            } else { console.dir("compile.js prepareTXN() rejects other fiscal year:"+year);
                return null;
            }
        } else console.error("compile.js prepareTXN("+sessionId+") no BALANCE table ");

    } else console.error("compile.js prepareTXN("+sessionId+") no SESSION ");
    // receiver will append this to sheetCells
    return bookingForm;

}


function processArgv(processArgv) {
    let instance=null;
    processArgv.forEach(function (val, index, array) {
        if(debug>1) console.log("0000 Starting server " + index + ': ' + val);
        let attribute=val.split('=');
        if(index>1 && attribute && attribute.length>1) {
            if(debug>1) console.log("0002 Attribute " + index + ': ' + val);
            if(attribute[0].toLowerCase()==='root') {
                Sheets.setRoot(attribute[1]);
                console.log("0004 Starting server SET ROOT TO " + Sheets.getRoot());
            }        
            else if(attribute[0].toLowerCase()==='inst') {
                instance = attribute[1];
                console.log("0006 Starting server SET INSTANCE " + instance);
            }        
            else if(attribute[0].toLowerCase()==='auto') {
                let autoSec = parseInt(attribute[1]);
                autoSave = autoSec * 1000;
                console.log("0008 Starting server SET autoSave " + autoSec+ " [sec.]");
            }        
        }
    });

    return instance;
}


function getRoot() {  return Sheets.getRoot(); }
module.exports['getRoot']=getRoot;

function getYear() {  return currentYear; }
module.exports['getYear']=getYear;



async function send(res,gResponse) {

    if(res && gResponse) {

        // send the whole result
        let payLoad = JSON.stringify(gResponse);    
        res.write(payLoad);
        res.write("\n");
        //if(debug) console.log("send4 WRITE "+JSON.stringify(gResponse));    
    } else {
        if(debug) console.log("send NO BALANCE in gResponse: "+JSON.stringify(gResponse));           
        res.write("\n");
    }
    res.end(); 
}



function fbDownload(client,year,callBack,ext,res) {
    Sheets.fbDownload(client,year,callBack,ext,res);
} 
module.exports['fbDownload']=fbDownload;

