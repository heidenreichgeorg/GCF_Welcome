const debug=1;
const debugWrite=null;


const HTTP_OK = 200;
module.exports['HTTP_OK']=HTTP_OK;

const HTTP_WRONG = 400;
module.exports['HTTP_WRONG']=HTTP_WRONG;

// EXCEL interface


// ASSETS BEFORE OTHER ACCOUNTS
// NO NEGATIVE RESULTS in distribute()
// EXTEND sy_purge ;EXCEL if needed
// N defines number of columns, balance[D_Schema].total 


const { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } = require('constants');
const { FORMERR } = require('dns');
// File system
//const fs = require('fs');


const Money = require('./money.js');


//const D_Schema = "Schema"; // includes .Names .total
const Compiler=require("./compile.js");

const CSEP = ';';
const CEND = '|';

const XLSX = require('xlsx');

const Server = require('./server.js');


const H_LEN  = 7; // header length
const J_MINROW = 7;
const J_ACCT = 6;
const COLMIN = 2;


var SERVEROOT= '/data/sessions/';
const Slash = '/';
function setRoot(root) {  
    if(root.slice(-1)==='/' || root.slice(-1)==='\\') {
        SERVEROOT=root; 
    } else {
        SERVEROOT=root+'/';
    }

    console.dir("Sheets.setRoot = "+SERVEROOT);
}
module.exports['setRoot']=setRoot;


function getRoot() {  return SERVEROOT; }
module.exports['getRoot']=getRoot;



const SY_MAXCEL=255;
const SY_MAXCOL=511;
const SY_MAXLINE=4190; // maximum number of characters in one row
const SY_MAXROWS=4190; // maximum number of rows in the table
function sy_purgeRow(row) {
    if(!row) return null;
    if(row.length>=(SY_MAXLINE)) {
        console.dir("***************************************"); 
        console.dir("*           SECURITY                  *"); 
        console.dir("***************************************"); 
    }
    return row.substring(0,SY_MAXLINE);
}

function sy_purgeCell(str) {     
    if(!str) return '';
    let letters = /^[A-Za-zäöüÄÖÜß]+$/;
    let digits = /^[0-9,._ ]+$/;
    var result=[];
    for(var i=0;i<str.length && i<SY_MAXCEL;i++) {
        let c=str.charAt(i);
        if(c=='-') result.push(c);
        else if(c.match(letters)) result.push(c);
        else if(c.match(digits)) result.push(c);
    }
    return result.join('');
    //return str.replace(/;\\\'\"/,'');
}





// GH20211024
function numericSheet(tBuffer,schemaLen) {
    // result:JS numeric values for XLSX

    //GH20211026 side-effect: clean tBuffer, use EU values

    // SECURITY - SANITIZE OUTPUT
  
    // function return make EN string booking values for JSON
    var result=(CSEP.repeat(schemaLen-1)+CEND).split(CSEP);
    
    result[0]=tBuffer[0];
    for(let i=1;i<schemaLen;i++) {

        if(tBuffer[i] && tBuffer[i].length>0) {

            let cell=sy_purgeCell(tBuffer[i]);

            if(i>=J_ACCT && ((tBuffer[0]=='A') || (parseInt(tBuffer[0])>0))) {
                // EU to EN
                let value=parseFloat(cell.replace('\.','').replace(',','\.'));
                
                if(typeof value === 'number' && !Number.isNaN(value)) result[i]=value;
                

                //GH20211026 side-effect: clean tBuffer
                var amount = Money.setEUMoney(cell);
                tBuffer[i]  = Money.moneyString(amount);

            } else result[i]=cell;

        } else result[i]='';
    }
    return result;
}





async function saveLogT(client,logT) {
    if(debug) console.log("sheets.saveLogT Saving(JSON)");        
    //log("saveLogT");  
    const data = JSON.stringify(logT);
    if(data) {
        var pSave = fs.writeFileSync(jsonLogf(client), data, {'encoding':'utf8'}, (err) => { // was latin1 GH20211120
            if (err) {
                console.dir("sheets.saveLogT: "+err);          
                throw err;
            }
            console.log("sheets.saveLogT Saving("+data+")");          
        });
    }
    console.log("JSON logf is saved.");
}





function bookSheet(sessionId,tBuffer,sessionTime,nextSessionId) {

    var session = Server.getSession(sessionId);

    if(session) {
        if(session.sheetName) {
            let client = session.client;
            let year = session.year;

            if(client && year && session.sheetCells) {

                var numLines = session.sheetCells.length;
                if(debugWrite) console.log("2010 sheets.bookSheet ENTER "+session.sheetName+ " for ("+client+","+year+") with "+numLines+" lines in sheet ");
                
                if(tBuffer) {
                    // add hash
                    if(tBuffer[0]>0) tBuffer[0]=symbolic(tBuffer.join('')); 

                    numLines = session.sheetCells.push(tBuffer); 

                    session.time=sessionTime;
                    session.id=nextSessionId;

                    if(debugWrite) console.log("2020 sheets.bookSheet APPEND  "+JSON.stringify(tBuffer)+" to ("+client+","+year+") #"+numLines);

                    // GH20221120 write to firestore
                    //fireWrite(session);

                    Server.setSession(session);

                    if(debugWrite) console.log("2024 sheets.bookSheet SET SESSION  "+session.id + " "+session.client + " "+session.year + " --> "+JSON.stringify(Object.keys(session)));
                    
                }
                else if(debugWrite) console.log("2021 sheets.bookSheet SAVE NO booking statement tBuffer ("+client+","+year+") #"+numLines);
            }
            else if(debugWrite) console.log("2023 sheets.bookSheet SAVE NO DATA ("+client+","+year+")") ;
        }
        else if(debugWrite) console.log("2025 sheets.bookSheet SAVE NO sheetName"+sessionId);
    }
    else if(debugWrite) console.log("2027 sheets.bookSheet SAVE NO session"+sessionId);

    return session;
}
module.exports['bookSheet']=bookSheet;



function getNLine(aoaCells) {
    // redundant, subset of Server.phaseOne, processes N line only
    var result = [];
    result[Compiler.D_Schema]= {};
    

    // digest aoaCells and write into balance object
    var lineCount=0;

    if(aoaCells && aoaCells.length>J_MINROW) {

        var numLines=aoaCells.length;

        let lastLine = aoaCells[numLines-1];
        console.log("0100 sheets.getNLine() LAST TXN at "+lastLine[1]+' for '+lastLine[3]);

        if(numLines>J_MINROW) {

            try {
                var iAssets=0;
                var iEqLiab=0;
                var iTotal=0;

                // print all lines
                aoaCells.forEach(row => {

                    lineCount++;
                    
                    if(debug>3) console.log("0110 sheets.getNLine "+JSON.stringify(row));
                        
                    var column;
                    var key=row[0];
                    if(key && key==='N') {
                        const aNames=row;
                        result[Compiler.D_Schema]["Names"]=aNames;
                        var column;
                        for(column=0;column<aNames.length && !(aNames[column].length>0 && aNames[column].length<4 && aNames[column].includes(CEND));column++) {
                            var rawName=aNames[column];
                            if(rawName && rawName.length>=COLMIN && column>=J_ACCT) {
                                var aName=rawName.trim();
                                if(debug>1) console.log("N "+aName);
                                if(aName==='ASSETS') { iAssets=column;
                                    result[Compiler.D_Schema].assets=column;
                                } else if(aName==='EQLIAB') { iEqLiab=column;
                                    result[Compiler.D_Schema].eqliab=column;
                                } 
                            }                    
                        }
                        iTotal=column;
                        result[Compiler.D_Schema].total=column;
                    }
                });
            } catch (err) {
                console.error('0125 sheets.js getNLine:'+err);
                console.dir('0125 sheets.js getNLine:'+err);
            }
        }
    }
    return result;
}







function makeWorkBook(jExcel) {

    var  workBook = null;
    if(jExcel) {
        let sheetName=jExcel.sheetName;
        let sheetFile=jExcel.sheetFile;

        try{  
            workBook = XLSX.readFile(sheetFile);
            console.dir("1478 sheets.makeWorkBook READ workbook for ("+sheetName+")");
    
        } catch(err) { console.dir("1477 sheets.makeWorkBook FAILED to OPEN sheetFile "+sheetFile+" for ("+sheetName+")");}
    
        if(workBook==null) {
            workBook = XLSX.utils.book_new();
            console.dir("1480 sheets.makeWorkBook CREATE new workbook for ("+sheetName+")");
        }
    
        for(tabName in jExcel) {
            let jSheet = jExcel[tabName];
            if(jSheet) {
                let numLines = jSheet.length;
                if(tabName==='sheetFile') {
                } else if(tabName==='sheetName') {
                } else if(numLines>0 && jSheet.forEach!=null) {                    
                    var  xSheet = XLSX.utils.json_to_sheet(jSheet,{skipHeader:true });
                    if(xSheet) {
                        if(workBook.Sheets && workBook.Sheets[sheetName]) {
                            workBook.Sheets[sheetName]=xSheet;   
                            if(debugWrite) console.log("1482 sheets.makeWorkBook UPDATE SHEET ("+tabName+") #"+numLines);

                        } else {
                            // append did not work, so make a new one
                            XLSX.utils.book_append_sheet(workBook, xSheet, tabName);
                            console.dir("1484 sheets.makeWorkBook CREATE SHEET "+sheetName+" for ("+tabName+") #"+numLines);
                        }
                        if(debugWrite) console.log("1486 sheets.makeWorkBook SHEET ("+tabName+")  OK ");
                        
                    } else console.log("1489 sheets.makeWorkBook SHEET ("+tabName+") BULDING X-SHEET FAILED");
                } else console.log("147 sheets.makeWorkBook SHEET ("+tabName+") NO DATA IN PARAMETER");
            } else console.log("1485 sheets.makeWorkBook SHEET ("+tabName+") NO TAB");
        } // for
    } else console.log("1481 sheets.makeWorkBook NO JSON INPUT");

    return workBook;
}
module.exports['makeWorkBook']=makeWorkBook;


/*

// GH20211119
// GH20221031 
function jsonMain(client,year,sid) {
    return getClientDir(client)+Slash+year+Slash+year+"main.json";
}

async function save2Server(session,client,year) {
    console.log("1560 save2Server Start saving(JSON) to "+SERVEROOT);        


    const data = JSON.stringify(session);
    let sessionId=session.id;
    let jsonFileName=jsonMain(client,year,sessionId);

    // REJECT IF FILE EXISTS
    if(checkExist(getClientDir(client),year)) {
        console.log("1561 sheets.save2Server: DETECTS COLLISION ");   
        return null;
    }


    // WRITE SESSION   1st PARAMETER
    fs.writeFileSync(jsonFileName, data, {'encoding':'utf8'}, (err) => { // was latin1 GH20211120
        if (err) {
            console.log("1563 sheets.save2Server: "+err);          
            //throw err;
        }
        
    });
    console.log("1564 save2Server: JSON main save to "+jsonFileName+" started.");

    return jsonFileName;
}
module.exports['save2Server']=save2Server;
*/





function saveSessionLog(sessionId,txn) {

    let delta = txn.delta;
    let sInfo = JSON.stringify(txn);

    let session = Server.getSession(sessionId);

    if(session) {
        if(delta) {
            if(!session.logT) session.logT = {};

            let id = symbolic(delta);

            if(id) {
                console.log("app.post saveSessionLog map("+id+")=>"+sInfo);

                session.logT[id] = txn;

                if(session.client) {
                    saveLogT( session.client, session.logT );
                    console.log("app.post saveSessionLog saved "+JSON.stringify(session.logT));

                } else console.log("app.post saveSessionLog did not save: no client!");
            } else console.log("app.post saveSessionLog did not save: no hashed id!");
        } else console.log("app.post saveSessionLog did not save: no transaction!");
    } else console.log("app.post saveSessionLog did not save: no session object!");
}
module.exports['saveSessionLog']=saveSessionLog;


function getClientDir(client) {
    return getRoot()+client+Slash; 
}
module.exports['getClientDir']=getClientDir;


function jsonLogf(client) {
    return getClientDir(client)+"logf.json";
}



function symbolic(pat) {
    var res = 0;
    if(pat) {
        var sequence = ' '+pat+pat+pat;
        var base=71;
        for(let p=0;p<sequence.length && p<80;p++) {
            res = (res + sequence.charCodeAt(p) & 0x1FFFFFEF)*base;  
        }
    }
    return res & 0x3FFFFFF;
}
module.exports['symbolic']=symbolic;


function xlsxWrite(sessionId,sessionTime,nextSessionId) {

    let sheetFile = "BOOKING.xlsx"
    let client="client";
    let year="YYYY";
    var session = Server.getSession(sessionId);
    if(session) {
       

        // ignore session.sheetFile
        sheetFile = getClientDir(session.client) + session.year + session.client + ".xlsx"
        if(sheetFile) {
            if(session.sheetName) {
                client = session.client;
                year = session.year;
                let sheetName = session.sheetName;
                if(client && year) {
                        if(debugWrite) console.log("1400 sheets.xlsxWrite ENTER "+sheetName+ " for ("+client+","+year+") in file "+sheetFile);

                        if(debug) console.log("1402 sheets.xlsxWrite jAssets "+sheetName+ " = "+Object.keys(session).join(", "));

                        let balance = session.generated;
                        if(debug) console.log("1404 sheets.xlsxWrite jAssets "+sheetName+ " = "+Object.keys(balance).join(", "));

                        var jAssets = balance.Anlagen; // balance[Compiler.D_FixAss];
                        if(debug) console.log("1406 sheets.xlsxWrite jAssets "+sheetName+ " = "+JSON.stringify(jAssets));
                        
                        var strHistory = JSON.stringify(balance.Historie); // balance[Compiler.D_History];
                        if(debug) console.log("1408 sheets.xlsxWrite jHistory "+sheetName+ " = "+strHistory);

                        var jSchema = balance.Schema;
                        if(debug) console.log("1410 sheets.xlsxWrite jHistory "+sheetName+ " = "+JSON.stringify(jSchema));


                        let jExcel = makeXLTabs(                            
                            client,year,session.sheetCells,
                            jAssets,
                            JSON.parse(strHistory), // all bookings of a year
                            jSchema,        // account schema
                            session.addrT, // address list
                            sessionTime,
                            nextSessionId);
                        // and write JSON file synchronously if there is a tBuffer

                        let workBook = makeWorkBook(jExcel);

                        XLSX.writeFile(workBook, sheetFile);
                        
                        if(debugWrite)  console.log("1530 sheets.xlsxWrite WRITE FILE "+sheetFile);
                        
                    } else {
                        console.dir("1535 sheets.xlsxWrite() NO client / year "+JSON.stringify(session));
                    }   
                } else {
                    console.dir("1545 sheets.xlsxWrite() NO sheetName and NOT writing "+JSON.stringify(session));
                }
            } else {
                console.dir("1555 sheets.xlsxWrite NO sheetFile and NOT writing "+JSON.stringify(session));
            }
        } else {
            console.dir("1565 sheets.xlsxWrite NO SESSION "+sessionId);
        }

        // return csv;
        return {'serverFile':sheetFile, 'localFile': (client+year+".xlsx"),'id':sessionId};
    }
module.exports['xlsxWrite']=xlsxWrite;


// and write JSON file synchronously if there is a tBuffer
function makeXLTabs(client,year,sheetCells,jAssets,jHistory,jSchema,addrT,sessionTime,nextSessionId) {
    // puts an array for ADDR, (ALL), and each (GAIN/LOSS) account into an array EXCEL-formatted tabs
    var excelCloseT=[];            
    var excelAssetT=[];            
    var excelAddrT=[];            
    // make a TAB-structure
    let fileName = client+year;
    let excelTabs = { 'CLOSE':excelCloseT,  'ASSETS':excelAssetT,  'ADDR':excelAddrT,  'sheetFile':fileName,  'sheetName':fileName  };
    var schemaLen = 0;



    if(sheetCells) {
        try {        
        
            let response = getNLine(sheetCells);
            let arrSchema = response[Compiler.D_Schema];
            let aLen = parseInt(response[Compiler.D_Schema].assets);
            let eLen = parseInt(response[Compiler.D_Schema].eqliab);
            console.dir("1414 sheets.makeXLTabs using schemaLen "+schemaLen+"("+aLen+","+eLen+") = "+JSON.stringify(arrSchema));

            if(jHistory) {
                let aNames = jSchema.Names;
                console.dir("1428 sheets.makeXLTabs ACCOUNT NAMES("+aLen+"-"+eLen+") "+aNames.join(",  "));

                let txns = Object.keys(jHistory).map((p) => ( Object.keys(jHistory[p]).map((key,i)=>(jHistory[p][key])))); 

                let caSaldo=0;
                let ceSaldo=0;

                // append one more sheet for ASSETS account
                for(let column=J_ACCT;column<aLen;column++) {
                    let tab = accountSheet(column,txns,caSaldo);
                    excelTabs["AS_"+aNames[column]]=tab.page;
                    caSaldo=tab.saldo;
                    excelCloseT.push([aNames[column],tab.close])
                }
                excelCloseT.push(['Assets',Money.cents2EU(caSaldo)])

                // append one more sheet for GALS account
                for(let column=aLen+1;column<eLen;column++) {
                    let tab = accountSheet(column,txns,ceSaldo);
                    excelTabs["GL_"+aNames[column]]=tab.page;
                    ceSaldo=tab.saldo;
                    excelCloseT.push([aNames[column],tab.close])
                }
                excelCloseT.push(['Gain/Loss',Money.cents2EU(ceSaldo)])

                // append one more sheet for EQ/LIAB account
                for(let column=eLen+1;column<aNames.length;column++) {
                    let tab = accountSheet(column,txns,ceSaldo);
                    excelTabs["EL_"+aNames[column]]=tab.page;
                    ceSaldo=tab.saldo;
                    excelCloseT.push([aNames[column],tab.close])
                }
                excelCloseT.push(['Equity/Liab',Money.cents2EU(ceSaldo)])


            } else console.dir("1429 sheets.makeXLTabs NO AUX");
        } catch(err) {console.dir("1431 sheets.makeXLTabs AUX "+err);}
    } else console.error("1415 sheets.makeXLTabs NO sheetCells");

    



    try {
        if(jAssets) {
            excelAssetT.push ( Object.keys(jAssets[Object.keys(jAssets)[0]])); // title row            
            let assets = Object.keys(jAssets).map((p) => ( Object.keys(jAssets[p]).map((key,i)=>(jAssets[p][key]))));           
            assets.forEach(line => excelAssetT.push(line));         
        } else console.dir("1425 sheets.makeXLTabs NO ASSETS");
    } catch(err) {console.dir("1427 sheets.makeXLTabs ASSETS "+err);}


    var numAddrs = 0;
    try {
        if(addrT) {
            for(let id in addrT) {
                let title = [ id ];
                let arrLine = title.concat(addrT[id]);
                excelAddrT.push(arrLine);
                numAddrs++;
            }                       
        } else console.dir("1435 sheets.makeXLTabs NO ADDRT");
    } catch(err) {console.dir("1437 sheets.makeXLTabs ADDRT "+err);}

    console.log("1470 sheets.makeXLTabs RESULT  "+JSON.stringify(Object.keys(excelTabs)));
    return excelTabs;
}
module.exports['makeXLTabs']=makeXLTabs;


function accountSheet(column,txns,saldo) {
    
    
    var excelaccTab=[];            
    let cSaldo=0;

    // select relevant bookings for that current account
    let aux = txns.filter(function(booking) {
            let accTabXN = booking[column]; 
            return (accTabXN && accTabXN.length>1); })

    let final="";

    // transform all bookings into eight columns
    aux.forEach(line => {
        let txn =line.filter(function(field,i) { return (i<J_ACCT || i==column); }); 
        excelaccTab.push(txn);
        cSaldo+=Money.setEUMoney(txn[J_ACCT]).cents;
        final=Money.cents2EU(cSaldo);
        txn[J_ACCT+1]=final;
    });      

    saldo += cSaldo;
    
    return { 'page':excelaccTab, 'saldo':saldo,  'close':final };
}

