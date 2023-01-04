const debug=null;


// setting this will violate privacy 
const debugWrite=1;


const HTTP_OK = 200;
module.exports['HTTP_OK']=HTTP_OK;


const HTTP_WRONG = 400;
module.exports['HTTP_WRONG']=HTTP_WRONG;

// EXCEL interface

// ASSETS BEFORE OTHER ACCOUNTS
// NO NEGATIVE RESULTS in distribute()
// EXTEND sy_purge ;EXCEL if needed
// N defines number of columns, balance[D_Schema].total 


//const { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } = require('constants');
//const { FORMERR } = require('dns');
// File system


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

    console.log("Sheets.setRoot = "+SERVEROOT);
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
        console.log("***************************************"); 
        console.log("*           SECURITY                  *"); 
        console.log("***************************************"); 
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






function bookSheet(sessionId,tBuffer,sessionTime,nextSessionId) {

    var session = Server.getSession(sessionId);

    if(session) {
        if(session.sheetName) {
            let client = session.client;
            let year = session.year;

            if(client && year && session.sheetCells) {

                var numLines = session.sheetCells.length;
                if(debugWrite) console.dir("1450 sheets.bookSheet ENTER "+session.sheetName+ " for ("+client+","+year+") with "+numLines+" lines in sheet ");
                
                if(tBuffer) {
                    // add hash
                    if(tBuffer[0]>0) tBuffer[0]=symbolic(tBuffer.join('')); 

                    numLines = session.sheetCells.push(tBuffer); 

                    session.time=sessionTime;
                    session.id=nextSessionId;

                    if(debugWrite) console.dir("1452 sheets.bookSheet APPEND  "+JSON.stringify(tBuffer)+" to ("+client+","+year+") #"+numLines);

                    // GH20221120 write to firestore
                    //fireWrite(session);

                    Server.setSession(session);

                    if(debugWrite) console.dir("1454 sheets.bookSheet SET SESSION  "+session.id + " "+session.client + " "+session.year + " --> "+JSON.stringify(Object.keys(session)));
                    
                }
                else if(debugWrite) console.dir("1451 sheets.bookSheet SAVE NO booking statement tBuffer ("+client+","+year+") #"+numLines);
            }
            else if(debugWrite) console.dir("1453 sheets.bookSheet SAVE NO DATA ("+client+","+year+")") ;
        }
        else if(debug) console.log("1455 sheets.bookSheet SAVE NO sheetName"+sessionId);
    }
    else if(debug) console.log("1457 sheets.bookSheet SAVE NO session"+sessionId);

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
        if(debug) console.log("1490 sheets.getNLine() LAST TXN at "+lastLine[1]+' for '+lastLine[3]);

        if(numLines>J_MINROW) {

            try {
                var iAssets=0;
                var iEqLiab=0;
                var iTotal=0;

                // print all lines
                aoaCells.forEach(row => {

                    lineCount++;
                    
                    if(debug>3) console.log("1492 sheets.getNLine "+JSON.stringify(row));
                        
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
            } catch (err) {console.error('1455 sheets.js getNLine:'+err);}
        }
    }
    return result;
}





function makeWorkBook(jExcel,sheetName,year,aLen,eLen) {

    var  workBook = null;
    if(jExcel) {
/*
        try{  
            workBook = XLSX.readFile(sheetFile);
            if(debugWrite) console.dir("1478 sheets.makeWorkBook READ workbook for ("+sheetName+")");
    
        } catch(err) { console.error("1477 sheets.makeWorkBook FAILED to OPEN sheetFile "+sheetFile+" for ("+sheetName+")");}
*/    
        if(workBook==null) {
            workBook = XLSX.utils.book_new();
            if(debug) console.log("1480 sheets.makeWorkBook CREATE new workbook for ("+sheetName+")");
        }
    
        for(tabName in jExcel) {
            let jSheet = jExcel[tabName];
            let formulae;
            let rows=0;
            let cols=0;
            if(jSheet) {
                let numLines = jSheet.length;
                if(numLines>0 && jSheet.forEach!=null) {  

                    if(tabName=='TXN') {
                        let prefix = [' ',year+'-12-31','CLOSE','ACCOUNTS','WITH','GAIN/LOSS'];
                        let dummy = jSheet[0]; // first row
                        formulae=dummy.map((_,i)=>i>=J_ACCT?0.0:prefix[i]);                        
                        cols= formulae.length;
                        jSheet.push(formulae);
                        rows = jSheet.length;
                    }
                    try {
                        if(debugWrite>2) console.dir("JSON2SHEET "+JSON.stringify(jSheet));

                        var  xSheet = XLSX.utils.aoa_to_sheet(jSheet,{skipHeader:true });
                        //var  xSheet = XLSX.utils.json_to_sheet(jSheet,{skipHeader:true });
                        if(xSheet) {

                            if(tabName=='TXN') {
                                try {
                                    var colNames=[];                                
                                    for(let j=J_ACCT;j<cols;j++) { colNames.push(getA1(j)); }
                                    console.dir("1482 sheets.makeWorkBook TXN sums ("+JSON.stringify(colNames)+") #"+cols);
                                    
                                    // account-column sums
                                    colNames.map(function(col) {
                                        makeSum(xSheet, col+rows, col+1, col+(rows-1));
                                    })
                                } catch(err) { console.error("1473 sheets.makeWorkBook TXN sums "+err);}
                                    
                                try {
                                    // horizontal asset sum
                                    makeSum(xSheet, getA1(aLen)+rows, getA1(J_ACCT)+rows, getA1(aLen-1)+rows );
                                } catch(err) { console.error("1475 sheets.makeWorkBook ASSET("+aLen+") sum "+err);}

                                try {
                                    // horizontal eqLiab sum
                                    makeSum(xSheet, getA1(eLen)+rows, getA1(eLen+1)+rows, getA1(cols-1)+rows );
                                } catch(err) { console.error("1475 sheets.makeWorkBook EQLIAB("+eLen+") sum "+err);}

                            }

                            if(workBook.Sheets && workBook.Sheets[sheetName]) {
                                workBook.Sheets[sheetName]=xSheet;   
                                if(debugWrite) console.dir("1484 sheets.makeWorkBook UPDATE SHEET ("+tabName+") #"+numLines);

                            } else {
                                // append did not work, so make a new one
                                XLSX.utils.book_append_sheet(workBook, xSheet, tabName);
                                if(debugWrite) console.dir("1486 sheets.makeWorkBook CREATE SHEET "+sheetName+" for ("+tabName+") #"+numLines);
                            }
                            if(debugWrite) console.dir("1488 sheets.makeWorkBook SHEET ("+tabName+")  OK ");
                        } else console.dir("1489 sheets.makeWorkBook SHEET ("+tabName+") BULDING X-SHEET FAILED");
                    } catch(err) { console.error("1491 sheets.makeWorkBook SHEET ("+tabName+") BULDING X-SHEET FAILED "+err); }
                } else console.dir("1487 sheets.makeWorkBook SHEET ("+tabName+") NO DATA IN PARAMETER");
            } else console.dir("1485 sheets.makeWorkBook SHEET ("+tabName+") NO TAB");
        } // for
    } else console.log("1481 sheets.makeWorkBook NO JSON INPUT");

    return workBook;
}
module.exports['makeWorkBook']=makeWorkBook;


// generate all the tabs for Excel
function makeXLTabs(sheetCells,jAssets,jHistory,jSchema,jPartner,jBalance,jXBRL,addrT) {

    var excelAssetT=[];            
    var excelAddrT=[];            
    var excelPartnerT=[];  
    var excelTransactionT=[];          
    var tempStartT=[];

    function pushClose(arr,name,xbrl,m3,m4) {
        let account = [ name, xbrl, parseFloat(m3)/100.0, parseFloat(m4)/100.0 ]
        arr.map(function(row,line){ if(line>0 && line<account.length) row.push(account[line])});
    }
    
    function pushAsset(arr,line){
        arr.push([line[0],line[1],parseFloat(line[2])/100.0,parseInt(line[3]),line[4],parseFloat(line[5])/100.0,parseFloat(line[6])/100.0]);
    }

    function pushAssetStart(arr,line){
        arr.push(['A',line[0],line[1],parseFloat(line[2]),parseInt(line[3]),line[4],parseFloat(line[5])]);
    }
    
    function pushNET(arr,line){
        arr.push(Object.keys(line).map((key,i)=>(i>J_ACCT?parseFloat(line[key])/100.0:line[key])));
    }
    
    function transpose(aoa) {
        var result=null;
        if(aoa) {
            result=[];
            let cols = aoa[0].length;
            if(cols>0) {
                for(let c=0;c<cols && c<result.length;c++) result[c]=[];
                aoa.map(function(line) {line.map(function(cell,c){if(result[c]) result[c].push(cell)})})
            }
        }
        return result;
    }
    
    var nLine=null;
    var cLine=null;
    var iLine=null;
    var kLine=null;
    var sLine=null;
    var rLine=null;
    var eLine=null;
    var cLine=null;
    var pLine=null;
    for(let r=0;r<20;r++) {
        let line = sheetCells[r];
        if(line.length>6) {
            let linec = line[0];
            if(linec=='N') { nLine = line; } 
            if(linec=='C') { cLine = line; } 
            if(linec=='I') { iLine = line; } 
            if(linec=='K') { kLine = line; } 
            if(linec=='S') { sLine = line; } 
            if(linec=='R') { rLine = line; } 
            if(linec=='E') { eLine = line; } 
            if(linec=='C') { cLine = line; }
            if(linec=='P') { pLine = line; } 
        }
    }

    tempStartT.push(nLine);
    tempStartT.push([]); // X
    tempStartT.push([]); // close
    tempStartT.push([]); // next

    const strStart = JSON.stringify(tempStartT);
    if(debugWrite) console.dir("EXCELSTART= "+strStart);

    // make a TAB-structure
    let excelTabs = {   'START':tempStartT, //20230103
                        'TXN':excelTransactionT,  //20230101
                        'ASSETS':excelAssetT,  
                        'PARTNER':excelPartnerT,  
                        'ADDR':excelAddrT                        
                    };

    var schemaLen = 0;
    


    // puts an array for each account into an array EXCEL-formatted tabs



    try {
        if(jAssets) {
            excelAssetT.push ( Object.keys(jAssets[Object.keys(jAssets)[0]])); // title row            
            let assets = Object.keys(jAssets).map((p) => ( Object.keys(jAssets[p]).map((key,i)=>(jAssets[p][key]))));           
            assets.forEach(line => pushAsset(excelAssetT,line));         
        } else console.log("1427 sheets.makeXLTabs NO ASSETS");
    } catch(err) {console.error("1429 sheets.makeXLTabs ASSETS: "+err);}






    // partner tax tab
    var jReport = JSON.parse(JSON.stringify(jPartner));
    let partner = [];
    let  taxHeaders=[];
    let  taxDetails=[];

    // fix are cents to compensate for rounding when tax is shared among partners
    let fix = BigInt(Object.keys(jReport).length-1);
    let aTax = Object.keys(jReport).map((index) => (taxDetails.push(makeTax(jBalance,jReport[index],index,fix))));
    let hKeys=Object.keys(taxDetails[0]);
    taxHeaders.push(  hKeys );
    
    partner.push( { 'count':'count', 
                    'name':'name', 
                    'share':'share',
                    'denom':'denom',
                    'cap2':'cap2',
                    'equity':'equity',
                    'partner':'partner',
                    'tax':'tax',
                    'loss':'loss',
                    'gain':'gain',
                    'netOTC':'netOTC',
                    'netFIN':'netFIN',
                    'init':'init', 
                    'credit':'credit',
                    'debit':'debit',
                    'yearEnd':'yearEnd',
                    'close':'close',
                    'next':'next'} );

    Object.keys(jReport).map((id) => (pushNET( partner, jReport[id] )))

    partner.push({});

    if(debugWrite) taxDetails.map((row) =>(console.dir(JSON.stringify(taxDetails))));
                
    taxDetails.map((row) => (                
        Object.keys(row).map((fieldName) => (partner.push({'name':fieldName==='name'?'':fieldName,'amnt':row[fieldName]})))));


    partner.map((row) => (excelPartnerT.push(Object.keys(row).map((k) => (row[k])))));
                
 



    var numAddrs = 0;
    try {
        if(addrT) {
            for(let id in addrT) {
                let title = [ numAddrs, id ];
                let arrLine = title.concat(addrT[id]);
                excelAddrT.push(arrLine);
                numAddrs++;
            }                       
        } else console.dir("1433 sheets.makeXLTabs NO ADDR tab");
    } catch(err) {console.dir("1431 sheets.makeXLTabs ADDR tab: "+err);}



    if(sheetCells) {        
        let strXBRL = [];
        let strCLOS = [];
        let strNEXT = [];
        try {        
            
            //20230101
            let allTXN = sheetCells.filter(function(booking) {
                let indicator = booking[0]; 
                return (parseInt(indicator)>0); });
            allTXN.map(function(txn) { let numericTXN = txn.map((cell,i) =>((i>=J_ACCT)?parseFloat(bigEUMoney(cell))/100.0:cell)); 
                                        excelTransactionT.push(numericTXN) });


            let response = getNLine(sheetCells);
            let arrSchema = response[Compiler.D_Schema];
            let arrXBRL = jXBRL;
            let aLen = parseInt(arrSchema.assets);
            let eLen = parseInt(arrSchema.eqliab);
            if(debugWrite) console.dir("1420 sheets.makeXLTabs using schemaLen "+schemaLen+"("+aLen+","+eLen+")");
            if(debugWrite) console.dir("     Schema = "+JSON.stringify(arrSchema));
            if(debugWrite) console.dir("     XBRL = "+JSON.stringify(arrXBRL));

            if(jHistory) {

                let aNames = jSchema.Names;
                if(debugWrite) console.dir("1422 sheets.makeXLTabs ACCOUNT NAMES("+aLen+"-"+eLen+") "+aNames.join(",  "));

                let txns = Object.keys(jHistory).map((p) => ( Object.keys(jHistory[p]).map((key,i)=>(jHistory[p][key])))); 

               

                if(jBalance) nLine.map(function(name,c) {
                    if(c>=J_ACCT) {
                        
                        let account = jBalance[name];
                        if(account) {
                            if(debugWrite) console.dir("pushClose A="+JSON.stringify(account));
                            pushClose(tempStartT,name,account.xbrl,account.yearEnd,account.next);
                        } else pushClose(tempStartT,name,".","0","0");
                    } else pushClose(tempStartT,name,".","0","0");

                    strXBRL = tempStartT[1];
                    strCLOS = tempStartT[2];
                    strNEXT = tempStartT[3];
                    strNEXT[0]='1'; // flag as active opeining txn

                    if(debugWrite) console.dir("pushClose X="+JSON.stringify(strXBRL));
                    if(debugWrite) console.dir("pushClose C="+JSON.stringify(strCLOS));
                    if(debugWrite) console.dir("pushClose N="+JSON.stringify(strNEXT));
                });

            } else console.log("1425 sheets.makeXLTabs NO AUX");
        } catch(err) {console.error("1423 sheets.makeXLTabs AUX "+err);}


        let excelStartT=[];
        try {
            excelStartT.push(nLine);
            excelStartT.push(cLine);
            excelStartT.push(iLine);
            excelStartT.push(kLine);
            excelStartT.push(sLine);
            excelStartT.push(rLine);
            excelStartT.push(eLine);
            excelStartT.push(strXBRL);
            excelStartT.push(pLine);
            excelStartT.push(strCLOS);
            excelStartT.push(strNEXT);

            excelAssetT.map(function(asset) { 
                pushAssetStart(excelStartT,asset);
            })

            excelTabs.START = excelStartT;

            //excelTabs.CLOSE = transpose(tempStartT);

         } catch(err) { console.error("transpose failed "+err);}
    
    
    } else console.error("1421 sheets.makeXLTabs NO sheetCells");

    
    if(debugWrite) console.dir("1460 sheets.makeXLTabs RESULT  "+JSON.stringify(Object.keys(excelTabs)));
    return excelTabs;
}
module.exports['makeXLTabs']=makeXLTabs;




function xlsxWrite(sessionId) {

    let sheetFile = "BOOKING.xlsx"
    let client="client";
    let year="YYYY";
    var session = Server.getSession(sessionId);
    if(session) {
       
        // return 'serverFile':sheetFile
        sheetFile = getClientDir(session.client) + session.year + session.client + ".xlsx"
        if(sheetFile) {
            if(session.sheetName) {
                client = session.client;
                year = session.year;
                let sheetName = session.sheetName;
                if(client && year) {
                        if(debugWrite) console.dir("1400 sheets.xlsxWrite ENTER "+sheetName+ " for ("+client+","+year+") in file "+sheetFile);

                        if(debugWrite) console.dir("1402 sheets.xlsxWrite session "+sheetName+ " = "+Object.keys(session).join(", "));

                        let balance = session.generated;
                        if(debugWrite) console.dir("1404 sheets.xlsxWrite balance "+sheetName+ " = "+Object.keys(balance).join(", "));

                        var jAssets = balance.Anlagen; // balance[Compiler.D_FixAss];
                        if(debugWrite) console.dir("1406 sheets.xlsxWrite jAssets "+sheetName+ " = "+JSON.stringify(jAssets));
                        
                        var strHistory = JSON.stringify(balance.Historie); // balance[Compiler.D_History];
                        if(debugWrite) console.dir("1408 sheets.xlsxWrite jHistory "+sheetName+ " = "+strHistory);

                        var jSchema = balance.Schema;
                        if(debugWrite) console.dir("1410 sheets.xlsxWrite jHistory "+sheetName+ " = "+JSON.stringify(jSchema));

                        var jPartner = balance.PartnerR;
                        if(debugWrite) console.dir("1412 sheets.xlsxWrite jPartner "+sheetName+ " = "+JSON.stringify(jPartner));


                        var jBalance = balance.Bilanz;
                        if(debug) console.log("1414 sheets.xlsxWrite jBalance "+sheetName+ " = "+JSON.stringify(jBalance));

                        var jXBRL = balance.XBRL;
                        if(debug) console.log("1416 sheets.xlsxWrite jXBRL "+sheetName+ " = "+JSON.stringify(jXBRL));


                        let jExcel = makeXLTabs(                            
                            session.sheetCells,
                            jAssets,
                            JSON.parse(strHistory), // all bookings of a year
                            jSchema,        // account schema
                            jPartner, // NET results
                            jBalance,  // account values
                            jXBRL,
                            session.addrT);
                        

                        let workBook = makeWorkBook(jExcel,
                                                    sheetName,
                                                    year,
                                                    parseInt(jSchema.assets),
                                                    parseInt(jSchema.eqliab));

                        XLSX.writeFile(workBook, sheetFile);
                        
                        if(debugWrite)  console.dir("1409 sheets.xlsxWrite WRITE FILE "+sheetFile);
                        
                    } else {
                        if(debugWrite) console.dir("1407 sheets.xlsxWrite() NO client / year "+JSON.stringify(session));
                        console.log("1407 sheets.xlsxWrite() NO client / year "+JSON.stringify(session));
                    }   
                } else {
                    if(debugWrite) console.dir("1405 sheets.xlsxWrite() NO sheetName and NOT writing "+JSON.stringify(session));
                    console.log("1405 sheets.xlsxWrite() NO sheetName and NOT writing");
                }
            } else {
                if(debugWrite) console.dir("1403 sheets.xlsxWrite NO sheetFile and NOT writing "+JSON.stringify(session));
                console.log("1403 sheets.xlsxWrite NO sheetFile and NOT writing");
            }
        } else {
            console.log("1401 sheets.xlsxWrite NO SESSION "+sessionId);
        }

        // return csv;
        return {'serverFile':sheetFile, 'localFile': (client+year+".xlsx"),'id':sessionId};
    }
module.exports['xlsxWrite']=xlsxWrite;





function makeTax(jBalance,partner,index,fix) {
    let igain=BigInt(partner.gain);
    let ideno=BigInt(partner.denom);               
    let result= { 'name': partner.name };
    Object.keys(jBalance).map((name,index) => (jBalance[name].xbrl==='de-gaap-ci_bs.ass.currAss.receiv.other.otherTaxRec.CapTax'?
                                                (result[name]=parseFloat(fix+(BigInt(jBalance[name].yearEnd)*igain)/ideno)/100.0)
                                                :0.0));

    if(debugWrite) console.dir("Partner("+index+") with "+igain+"/"+ideno+"response D_Report"+JSON.stringify(result));
    return result;
}


function bigEUMoney(strSet) {
    var euros=0n;
    var cents=0n;
    var factor=1n;
    var result=0n;

    if(strSet && strSet.length>0) {
        try {
            var amount = strSet.split(',');
            var plain = amount[0].replace('.', '').trim(); 
            if(plain.startsWith('-')) { factor=-1n; plain=plain.slice(1); }
            try {
                euros = BigInt(('0'+plain));
                if(amount.length>1) {                 
                    const digits=amount[1]+"00";
                    const strDigits=digits[0]+digits[1];
                    cents=BigInt(strDigits);
                }
            } catch(err) { console.error("0475 bigEUMoney("+plain+"=>"+factor+"*("+euros+",$"+srDigits+")"); }
            try {
                result = factor * ( euros * 100n + cents );
            } catch(err) { console.error("0477 bigEUMoney("+plain+"=>"+factor+"*("+euros+",$"+srDigits+")"); }
        } catch(err) { console.error("0479 bigEUMoney("+strSet+"=>"+factor+"*("+euros+","+cents+")"); }
    }
    return result;        
}
module.exports['bigEUMoney']=bigEUMoney;



const alpha=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
function getA1(j) {
    let primo = (j<26)?'':alpha[parseInt(j/26)-1];
    let secundo = alpha[j%26];
    return primo+secundo;       
}

function makeSum(xSheet,a1Cell,a1From,a1To) {
    let cell = xSheet[a1Cell]; // A1 access index
    cell.v=null;
    cell.t='n';
    cell.f='sum('+a1From+':'+a1To+')';
}



function getClientDir(client) {
    return getRoot()+client+Slash; 
}
module.exports['getClientDir']=getClientDir;



function symbolic(pat) {
    var res = 0;
    if(pat) {
        var sequence = ' '+pat+pat+pat;
        var base=71
        for(let p=0;p<sequence.length && p<80;p++) {
            res = (res + sequence.charCodeAt(p) & 0x1FFFFFEF)*base;  
        }
    }
    return res & 0x3FFFFFF;
}
module.exports['symbolic']=symbolic;

