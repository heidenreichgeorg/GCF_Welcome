const debugFlag=null;


// setting this will violate privacy 
const debugFlagReport=null;




/* global BigInt */
import {  symbolic } from './writeModule'
import { cents2EU }  from './money';

const Compiler=require("./compile.js");

const CSEP = ';';
const CEND = '|';

import * as  XLSX from 'xlsx'


// EXCEL interface

// ASSETS BEFORE OTHER ACCOUNTS
// NO NEGATIVE RESULTS in distribute()
// EXTEND sy_purge ;EXCEL if needed
// N defines number of columns, balance[D_Schema].total 


// File system

const J_MINROW = 7;
const J_ACCT = 6;
const COLMIN = 2;




const eboReport = ['de-gaap-ci_bs.ass.fixAss.tan.landBuildings.buildingsOnOwnLand',
'de-gaap-ci_bs.ass.fixAss.tan.landBuildings.other',
'de-gaap-ci_bs.ass.fixAss.fin.securities',
'de-gaap-ci_bs.ass.currAss.cashEquiv.bank',
'de-gaap-ci_bs.ass.currAss.cashEquiv.bank',
'de-gaap-ci_bs.ass.currAss.cashEquiv.bank',
'de-gaap-ci_bs.ass.currAss.receiv.trade',
'de-gaap-ci_bs.ass.currAss.receiv.other.otherTaxRec.kest',
'de-gaap-ci_bs.ass.currAss.receiv.other.otherTaxRec.kest',
'de-gaap-ci_is.netIncome.regular.operatingTC.grossTradingProfit.totalOutput.netSales.grossSales.untaxable',
'de-gaap-ci_is.netIncome.regular.operatingTC.otherCost.fixingLandBuildings',
'de-gaap-ci_is.netIncome.regular.operatingTC.deprAmort.fixAss.tan',
'de-gaap-ci_is.netIncome.regular.operatingTC.otherCost.otherOrdinary',
'de-gaap-ci_is.netIncome.regular.fin.expenses.regularInterest',
'de-gaap-ci_is.netIncome.regular.fin.netInterest.income',
'de-gaap-ci_is.netIncome.regular.fin.netParticipation',
'de-gaap-ci_is.netIncome.regular.operatingTC.deprAmort.fixAss.other',
'de-gaap-ci_is.netIncome.regular.operatingTC.otherOpRevenue.disposFixAss.sale.fin.domesticCorp',
'de-gaap-ci_is.netIncome.regular.operatingTC.otherCost.leaseFix.other',
'de-gaap-ci_bs.eqLiab.liab.other.other',
'de-gaap-ci_bs.eqLiab.liab.other.profSharRights',
'de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.VK.beginYear',
'de-gaap-ci_bs.eqLiab.equity.profitLossPartnershipsHGBs264c',
'de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.VK.incomeUseDeposits',
'de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.VK.incomeUseWithdrawals',
'de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.VK.beginYear',
'de-gaap-ci_bs.eqLiab.equity.profitLossPartnershipsHGBs264c',
'de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.VK.incomeUseDeposits',
'de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.VK.incomeUseWithdrawals',
'de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.VK.beginYear',
'de-gaap-ci_bs.eqLiab.equity.profitLossPartnershipsHGBs264c',
'de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.VK.incomeUseDeposits',
'de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.VK.incomeUseWithdrawals',
'de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.VK.beginYear',
'de-gaap-ci_bs.eqLiab.equity.profitLossPartnershipsHGBs264c',
'de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.VK.incomeUseDeposits',
'de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.VK.incomeUseWithdrawals',
'de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.VK.beginYear',
'de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.VK.beginYear',
'de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.FK.beginYear',
'de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.FK.beginYear',
'de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.KK.beginYear',
'de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.KK.beginYear',
'de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.KK.beginYear',
'de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.KK.beginYear'];





const SY_MAXCEL=255;
const SY_MAXCOL=511;
const SY_MAXLINE=4190; // maximum number of characters in one row
const SY_MAXROWS=4190; // maximum number of rows in the table



function bookSheet(sessionId,tBuffer,sessionTime,nextSessionId) {

    var session = Server.getSession(sessionId);

    if(session) {
        if(session.sheetName) {
            let client = session.client;
            let year = session.year;

            if(client && year && session.sheetCells) {

                var numLines = session.sheetCells.length;
                if(debugFlagReport) console.dir("1450 sheets.bookSheet ENTER "+JSON.stringify(tBuffer)+" into "+session.sheetName+ " for ("+client+","+year+") with "+numLines+" lines in sheet ");
                
                if(tBuffer) {
                    // add hash
                    if(tBuffer[0]>0) tBuffer[0]=symbolic(tBuffer.join('')); 

                    numLines = session.sheetCells.push(tBuffer); 

                    session.time=sessionTime;
                    session.id=nextSessionId;

                    if(debugFlagReport) console.dir("1452 sheets.bookSheet APPEND  "+JSON.stringify(tBuffer)+" to ("+client+","+year+") #"+numLines);

                            
                    if(debugFlag) {
                        console.log("1454 sheets.bookSheet NEW keys="+JSON.stringify(Object.keys(session.sheetCells).map((i)=>(session.sheetCells[i][0]))));
                    }

                    Server.setSession(session);

                    if(debugFlagReport) console.dir("1456 sheets.bookSheet SET SESSION  "+session.id + " "+session.client + " "+session.year + " --> "+JSON.stringify(Object.keys(session)));
                    
                }
                else if(debugFlagReport) console.dir("1451 sheets.bookSheet SAVE NO booking statement tBuffer ("+client+","+year+") #"+numLines);
            }
            else if(debugFlagReport) console.dir("1453 sheets.bookSheet SAVE NO DATA ("+client+","+year+")") ;
        }
        else if(debugFlag) console.log("1455 sheets.bookSheet SAVE NO sheetName"+sessionId);
    }
    else if(debugFlag) console.log("1457 sheets.bookSheet SAVE NO session"+sessionId);

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
        if(debugFlag) console.log("1490 sheets.getNLine() LAST TXN at "+lastLine[1]+' for '+lastLine[3]);

        if(numLines>J_MINROW) {

            try {
                var iAssets=0;
                var iEqLiab=0;
                var iTotal=0;

                // print all lines
                aoaCells.forEach(row => {

                    lineCount++;
                    
                    if(debugFlag>3) console.log("1492 sheets.getNLine "+JSON.stringify(row));
                        
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
                                if(debugFlag>1) console.log("N "+aName);
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
 
        if(workBook==null) {
            workBook = XLSX.utils.book_new();
            if(debugFlag) console.log("1480 sheets.makeWorkBook CREATE new workbook for ("+sheetName+")");
        }
    
        for(var tabName in jExcel) {
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
                        if(debugFlagReport) console.dir("JSON2SHEET tabName:"+tabName+"  jSheet:"+JSON.stringify(jSheet));

                        var  xSheet = XLSX.utils.aoa_to_sheet(jSheet,{skipHeader:true });
                        //var  xSheet = XLSX.utils.json_to_sheet(jSheet,{skipHeader:true });
                        if(xSheet) {
                            try {
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
                                    if(debugFlagReport) console.dir("1484 sheets.makeWorkBook UPDATE SHEET ("+tabName+") #"+numLines);

                                } else {
                                    // append did not work, so make a new one
                                    XLSX.utils.book_append_sheet(workBook, xSheet, tabName);
                                    if(debugFlagReport) console.dir("1486 sheets.makeWorkBook CREATE SHEET "+sheetName+" for ("+tabName+") #"+numLines);
                                }
                            } catch(err) { console.error("1483 sheets.makeWorkBook SHEET ("+tabName+") BULDING TABS FAILED "+err); }
                            if(debugFlagReport) console.dir("1488 sheets.makeWorkBook SHEET ("+tabName+")  OK ");
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
function makeXLTabs(sheetCells,jAssets,jHistory,jSchema,jPartner,jBalance,jXBRL,creditorsT,client,year) {

    var excelAddrT=[];            
    var excelPartnerT=[];  
    var excelTransactionT=[];          
    var excelBilanzT=[];            

    function pushTAX(arr,line){
        arr.push(Object.keys(line).map((key,i)=>(i>10?(isNaN(line[key])?'0':parseFloat(line[key])/100.0):line[key])));
    }


    // partner tax tab
    var jReport = JSON.parse(JSON.stringify(jPartner));
    let partnerTable = [];
    let  taxHeaders=[];
    let  taxDetails=[];

    // fix are cents to compensate for rounding when tax is shared among partners
    let fix = BigInt(Object.keys(jReport).length-1);
    Object.keys(jReport).map((index) => (taxDetails.push(makeTax(jBalance,jReport[index],index,fix))));
    let hKeys=Object.keys(taxDetails[0]);
    taxHeaders.push(  hKeys );
    



    partnerTable.push(Object.keys(jReport[0]));
    console.log("1410 "+JSON.stringify(Object.keys(jReport[0])));

    Object.keys(jReport).map((id) => (pushTAX( partnerTable, jReport[id] )))

    partnerTable.push({});

    if(debugFlagReport) taxDetails.map((row) =>(console.dir("1414 Partner tax "+JSON.stringify(taxDetails))));
                
    taxDetails.map((row) => (                
        Object.keys(row).map((fieldName) => (partnerTable.push({'name':fieldName==='name'?'':fieldName,'amnt':row[fieldName]})))));

    partnerTable.map((row) => (excelPartnerT.push(Object.keys(row).map((k) => (row[k])))));






    var numAddrs = 0;
    try {
        if(creditorsT) {
            for(let id in creditorsT) {
                let title = [ numAddrs, id ];
                let arrLine = title.concat(creditorsT[id]);
                excelAddrT.push(arrLine);
                numAddrs++;
            }                       
        } else {
            excelAddrT.push("WRITING CREDITORS: NO CREDITORS tab");
            console.dir("1433 sheets.makeXLTabs NO CREDITORS tab");
        }
    } catch(err) {console.dir("1431 sheets.makeXLTabs CREDITORS tab: "+err);}


    if(sheetCells) {        
        try {        
            
            console.dir("1412 sheets.makeXLTabs for sheetCells");

            //20230101
            let allTXN = sheetCells.filter(function(booking) {
                let indicator = booking[0]; 
                return (parseInt(indicator)>0); });
            allTXN.map(function(txn) { let numericTXN = txn.map((cell,i) =>((i>=J_ACCT)?parseFloat(bigEUMoney(cell))/100.0:cell)); 
                                        excelTransactionT.push(numericTXN) });

        } catch(err) {console.error("1423 sheets.makeXLTabs TXN "+err);}

    
    } else console.error("1421 sheets.makeXLTabs NO sheetCells");



    // GH2025 EBO
    // GH EBIlanzOnline eBilanz-Online e-Bilanzonline
    /*
    schema = {
            String[] Names      Numbers
                assets        eqliab        total
                author        residence        Desc
                iban        register        taxnumber
                reportYear        client
         }
    */  

    let iTotal = jSchema.total;

    excelBilanzT.push(["XBRL","NAME","KONTO","NA","GUV","WERTE","SOLL/HABEN","PARTNER","FPGLM","XBRL_INCOME"])

    const profitLoss = "de-gaap-ci_bs.eqLiab.equity.profitLossPartnershipsHGBs264c";

    console.log("EBO Partners "+JSON.stringify(jPartner))

    jSchema.Names.forEach((accName,col)=>{
        if(col>=J_MINROW && col<iTotal) if(accName && accName.length>1) {

            let account = jBalance[accName];
            if(account) {
                const xbrl = account.xbrl;
                const iValue = cents2EU(account.yearEnd);
                const aNumber = account.number;
                const SH = xbrl.startsWith("de-gaap-ci_bs.ass") ? "S" : "H";


                let iPartner=0;
                Object.keys(jPartner).forEach((num,index)=>{
                    let partner=jPartner[num];
                    if(partner.iVar && parseInt(partner.iVar)==col) iPartner=index+1;
                    if(partner.iCap && parseInt(partner.iCap)==col) iPartner=index+1;
                    if(partner.iRes && parseInt(partner.iRes)==col) iPartner=index+1;
                })

                if(iPartner==0) excelBilanzT.push([xbrl,accName,aNumber,"","",iValue,SH,"0"])
                   
                else {
                    //console.log("1616 EBO PARTNER:"+JSON.stringify(jPartner[index]))

                    let pId=""+iPartner;
                    let income = (account.income) ? cents2EU(account.income) : "0"

                    
                    excelBilanzT.push([xbrl+".beginYear",           accName+"_ANFANG",  ""+aNumber+"0","","",   cents2EU(account.init),  SH,pId])
                    excelBilanzT.push([profitLoss,                  accName+"_EINK",    ""+aNumber+"1","","",   income,                  SH,pId])
                    excelBilanzT.push([xbrl+".incomeUseDeposits",   accName+"_EINLAGE", ""+aNumber+"2","","",   cents2EU(account.credit),SH,pId])
                    excelBilanzT.push([xbrl+".incomeUseWithdrawals",accName+"_ENTNAHME",""+aNumber+"3","","",   cents2EU(account.debit), SH,pId])
                    excelBilanzT.push(["",                          accName+"_EINK2",   ""+aNumber+"4","","GKV",income,                  SH,pId,income,"de-gaap-ci_fpl.netIncome"])
                    excelBilanzT.push(["",                          accName+"_VERWENDG",""+aNumber+"5","","",   income,                  SH,pId,"",    "de-gaap-ci_incomeUse.paidInCapital"])
                    excelBilanzT.push(["",                          accName+"_EINLAGE2",""+aNumber+"6","","",   "0",                     SH,pId,"",    "de-gaap-ci_incomeUse.deposits"])
                    excelBilanzT.push(["",                          accName+"_ENTNAHM2",""+aNumber+"7","","",   "0",                     SH,pId,"",    "de-gaap-ci_incomeUse.withdrawals"])
                   
                }
            }
        }
    })

    



    // make a TAB-structure
    let excelTabs = {  
                        'TXN'    : excelTransactionT,  
                        'PARTNER': excelPartnerT,  
                        'ADDR'   : excelAddrT,    
                        'EBO-BILANZ': excelBilanzT
                    };



    if(debugFlagReport) console.dir("1460 sheets.makeXLTabs RESULT  "+JSON.stringify(Object.keys(excelTabs)));
    return excelTabs;
}
module.exports['makeXLTabs']=makeXLTabs;




// generate all the tabs for Excel
function makeXLAssets(jAssets) {

    var excelAssetT=[];            


    function pushAsset(arr,line){
        arr.push([line[0],line[1],parseFloat(line[2])/100.0,parseInt(line[3]),line[4],parseFloat(line[5])/100.0,parseFloat(line[6])/100.0]);
    }

    try {
        if(jAssets) {
            excelAssetT.push ( Object.keys(jAssets[Object.keys(jAssets)[0]])); // title row            
            let assets = Object.keys(jAssets).map((p) => ( Object.keys(jAssets[p]).map((key,i)=>(jAssets[p][key]))));           
            assets.forEach(line => pushAsset(excelAssetT,line));         
        } else console.log("1427 sheets.makeXLAssets NO ASSETS");
    } catch(err) {console.error("1429 sheets.makeXLAssets ASSETS: "+err);}

    if(debugFlagReport) console.dir("1460 sheets.makeXLAssets RESULT  "+JSON.stringify(Object.keys(excelAssetT)));
    return excelAssetT;
}




// generate the START Excel tab for next year
function makeXLStart(sheetCells,jHistory,jSchema,jBalance,jXBRL,client,year,excelAssetT) {

    let excelStartT=[];
          

    function pushClose(arr,name,xbrl,m3,m4) {
        let account = [ name, xbrl, parseFloat(m3)/100.0, parseFloat(m4)/100.0 ]
        arr.map(function(row,line){ if(line>0 && line<account.length) row.push(account[line])});
    }
    
    function pushAssetTitle(arr,line){
        arr.push(['0',line[0],line[1],line[2],line[3],line[4],line[5],line[6]]);
    }


    function pushAssetStart(arr,line){
        try {
            arr.push(['A',line[0],line[1],parseFloat(line[2]),parseInt(line[3]),line[4],parseFloat(line[5])]);
        } catch(e) {}
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
            if(linec=='K') { kLine = line; kLine[2]=parseInt(year)+1; kLine[4]=client} 
            if(linec=='S') { sLine = line; } 
            if(linec=='R') { rLine = line; } 
            if(linec=='E') { eLine = line; } 
            if(linec=='C') { cLine = line; }
            if(linec=='P') { pLine = line; } 
        }
    }

    

   if(sheetCells) {        
      var schemaLen = 0;
      let strCLOS = [];
      let strXBRL = [];
      let strNEXT = [];
      try {        
            
            console.dir("1412 sheets.makeXLStart for sheetCells");

            let response = getNLine(sheetCells);
            let arrSchema = response[Compiler.D_Schema];
            let arrXBRL = jXBRL;
            let aLen = parseInt(arrSchema.assets);
            let eLen = parseInt(arrSchema.eqliab);
            console.dir("1420 sheets.makeXLStart using schemaLen "+schemaLen+"("+aLen+","+eLen+")");
            if(debugFlagReport) console.dir("     Schema = "+JSON.stringify(arrSchema));
            console.dir("     XBRL = "+JSON.stringify(arrXBRL));

            if(jHistory) {

                let aNames = jSchema.Names;
                if(debugFlagReport) console.dir("1422 sheets.makeXLStart ACCOUNT NAMES("+aLen+"-"+eLen+") "+aNames.join(",  "));

                var tempStartT=[]; 
                tempStartT.push(nLine);
                tempStartT.push([]); // X
                tempStartT.push([]); // close
                tempStartT.push([]); // next

                if(jBalance) {
                    if(debugFlagReport) console.dir("1424 sheets.makeXLStart ACCOUNT NAMES("+aLen+"-"+eLen+") "+JSON.stringify(nLine));

                    nLine.forEach((name,c) => {

                        if(debugFlagReport) console.dir("1426 makeXLStart pushClose c="+c);
                        if(c>=J_ACCT) {
                            
                            let account = jBalance[name];
                            // append one column per account
                            if(debugFlagReport) console.dir("1428 makeXLStart pushClose A="+name);
                            if(account) {
                                if(debugFlagReport) console.dir("1430 makeXLStart pushClose A="+JSON.stringify(account));
                                pushClose(tempStartT,name,account.xbrl,account.yearEnd,account.next);
                            } else pushClose(tempStartT,name,".","0","0");
                        } else if(c==0)  pushClose(tempStartT,name,"X","0","1"); 
                        else pushClose(tempStartT,name,".","0","0"); 

                        strXBRL = tempStartT[1];
                        strCLOS = tempStartT[2];
                        strNEXT = tempStartT[3];
                        strNEXT[0]='1'; // flag as active opening txn

                        if(debugFlag>1) console.dir("makeXLStart pushClose X="+JSON.stringify(strXBRL));
                        if(debugFlag>1) console.dir("makeXLStart pushClose C="+JSON.stringify(strCLOS));
                        if(debugFlag>1) console.dir("makeXLStart pushClose N="+JSON.stringify(strNEXT));
                    });
                } else console.log("1427 sheets.makeXLStart NO jBalance");
            } else console.log("1425 sheets.makeXLStart NO jHistory");
        } catch(err) {console.error("1423 sheets.makeXLStart AUX "+err);}


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


            excelAssetT.forEach((asset,i) => { 
                if(i==0) pushAssetTitle(excelStartT,asset); else pushAssetStart(excelStartT,asset);
                if(debugFlagReport) console.dir("Asset#"+i+"  "+JSON.stringify(asset));
            })

            excelStartT.push(strCLOS);
            excelStartT.push(strNEXT);
            

         } catch(err) { console.error("makeXLStart transpose failed "+err);}
    
    
    } else console.error("1421 sheets.makeXLStart NO sheetCells");


    

    if(debugFlagReport) console.dir("1460 sheets.makeXLStart RESULT  "+JSON.stringify(Object.keys(excelStartT)));
    return excelStartT;
}


function makeGALS(aName,index,sheetCells) {

    let excelTransactionT = [];


    if(sheetCells) {        
        try {        
            
            if(debugFlagReport) console.dir("1910 sheets.makeGALS "+index+" for "+aName);

            //20230101
            let allTXN = sheetCells.filter(function(booking) {
                let indicator = booking[0]; 
                return (parseInt(indicator)>0); });

            if(debugFlagReport) console.dir("1920 sheets.makeGALS "+index+" for "+JSON.stringify(allTXN));


            allTXN.map(function(txn) { 
                         
                let numericTXN = txn.map((cell,i) =>((i>=J_ACCT)?parseFloat(bigEUMoney(cell))/100.0:cell)); 
                if(debugFlagReport) console.dir("1930 sheets.makeGALS "+index+" for "+JSON.stringify(numericTXN));

                if(numericTXN[index]!=0.0) excelTransactionT.push([numericTXN[1],numericTXN[2],numericTXN[3],numericTXN[4],numericTXN[5],numericTXN[index]]) });

        } catch(err) {console.error("1931 sheets.makeGALS TXN "+err);}
    
    } else console.error("1911 sheets.makeGALS NO sheetCells");

    return excelTransactionT;
}


export function xlsxWrite(session,root) {

    let sheetFile = "BOOKING.xlsx"
    let client="client";
    let year="YYYY";
    
    if(session) {
       
        try {

            // SERVER FUNCTION COMPILE GH20251228
            session.generated = Compiler.compile(session);

        } catch(e) { console.err("1539 sheets.xlsxWrite compile() error: "+e); }


        // return 'serverFile':sheetFile
        sheetFile = root + session.year + session.client + ".xlsx"
        if(sheetFile) {
            if(debugFlagReport) console.dir("1542 sheets.xlsxWrite ENTER XLSWRITE for ("+client+","+year+") in file "+sheetFile);
            if(session.sheetName) {
                client = session.client;
                year = session.year;
                let sheetName = session.sheetName;
                if(client && year) {
                    try {
                        if(debugFlagReport) console.log("1544 sheets.xlsxWrite START "+sheetName+ " for ("+client+","+year+") in file "+sheetFile);

                        if(debugFlagReport) console.log("1546 sheets.xlsxWrite session "+sheetName+ " = "+Object.keys(session).join(", "));

                        let balance = session.generated;
                        if(debugFlagReport) console.log("1548 sheets.xlsxWrite balance "+sheetName+ " = "+Object.keys(balance).join(", "));

                        var jAssets = balance.Anlagen; // balance[Compiler.D_FixAss];
                        if(debugFlagReport) console.dir("1550 sheets.xlsxWrite jAssets "+sheetName+ " = "+JSON.stringify(jAssets));
                        
                        var strHistory = JSON.stringify(balance.Historie); // balance[Compiler.D_History];
                        if(debugFlagReport) console.dir("1552 sheets.xlsxWrite jHistory "+sheetName+ " = "+strHistory);

                        var jSchema = balance.Schema;
                        if(debugFlagReport) console.dir("1554 sheets.xlsxWrite jHistory "+sheetName+ " = "+JSON.stringify(jSchema));

                        var jPartner = balance.PartnerR;
                        if(debugFlagReport) console.dir("1556 sheets.xlsxWrite jPartner "+sheetName+ " = "+JSON.stringify(jPartner));


                        var jBalance = balance.Bilanz;
                        if(debugFlagReport) console.log("1558 sheets.xlsxWrite jBalance "+sheetName+ " = "+JSON.stringify(jBalance));

                        var jXBRL = balance.XBRL;
                        if(debugFlagReport) console.log("1560 sheets.xlsxWrite jXBRL "+sheetName+ " = "+JSON.stringify(jXBRL));

                        let jExcel = makeXLTabs(                            
                            session.sheetCells,
                            jAssets,
                            JSON.parse(strHistory), // all bookings of a year
                            jSchema,        // account schema
                            jPartner, // NET results
                            jBalance,  // account values
                            jXBRL,
                            session.creditorsT,
                            client,
                            year);
                        

                        //                         'ASSETS' : excelAssetT,  
                        jExcel.ASSETS = makeXLAssets(                            
                                jAssets);
    

                        jExcel.START = makeXLStart(session.sheetCells,
                            JSON.parse(strHistory), // all bookings of a year
                            jSchema,        // account schema
                            jBalance,  // account values
                            jXBRL,
                            client,
                            year,
                            jExcel.ASSETS); // also produce assets init lines

/*
                        jExcel.REPORT = makeXLReport(
                            JSON.parse(strHistory), // all bookings of a year
                            jSchema,        // account schema
                            jBalance,  // account values
                            jXBRL,
                            client,
                            year
                        );
*/
                        let aLen = parseInt(jSchema.assets);
                        let eLen =  parseInt(jSchema.eqliab)


                        // GainLoss tabs

                        try {
                            
                            if(debugFlagReport) console.dir("1564 sheets.xlsxWrite ("+aLen+","+eLen+") GALS "+client+year+ " = "+JSON.stringify(jSchema.Names));

                
                            let accNames = jSchema.Names;
                            accNames.forEach((aName,i)=>{
                                if(i>=J_ACCT && i>aLen && i<eLen) {
                                    
                                    console.dir("1566 sheets.xlsxWrite GALS("+i+") = "+aName);

                                    jExcel[aName]=makeGALS(aName,i,session.sheetCells);
                                }
                            })
                            
                        } catch(err) {console.error("1563 sheets.xlsxWrite ("+aLen+","+eLen+") GALS "+err);}






                        let workBook = makeWorkBook(jExcel,
                                                    sheetName,
                                                    year,
                                                    aLen,
                                                    eLen);

                        if(debugFlag) console.log("1562 WORKBOOK OK");

                        XLSX.writeFile(workBook, sheetFile);
                        // https://stackoverflow.com/questions/39825069/node-xlsx-for-write-excel-file

                        if(debugFlagReport)  console.dir("1568 sheets.xlsxWrite WRITE FILE "+sheetFile);
                        
                    } catch(e) { console.err("1567 sheets.xlsxWrite() error when writing: "+err); }

                } else {
                    if(debugFlagReport) console.dir("1563 sheets.xlsxWrite() NO client / year "+JSON.stringify(session));
                    console.log("1407 sheets.xlsxWrite() NO client / year "+JSON.stringify(session));
                }   
            } else {
                if(debugFlagReport) console.dir("1561 sheets.xlsxWrite() NO sheetName and NOT writing "+JSON.stringify(session));
                console.log("1405 sheets.xlsxWrite() NO sheetName and NOT writing");
            }
        } else {
            if(debugFlagReport) console.dir("1559 sheets.xlsxWrite NO sheetFile and NOT writing "+JSON.stringify(session));
            console.log("1557 sheets.xlsxWrite NO sheetFile and NOT writing");
        }
    } else {
        console.log("1555 sheets.xlsxWrite NO SESSION ");
    }

    // return csv;
    return {'serverFile':sheetFile, 'localFile': (client+year+".xlsx") };
}






function makeTax(jBalance,partner,index,fix) {
    let igain=BigInt(partner.gain);
    let ideno=BigInt(partner.denom);               
    let result= { 'name': partner.name };
    Object.keys(jBalance).map((name,index) => (jBalance[name].xbrl==='de-gaap-ci_bs.ass.currAss.receiv.other.otherTaxRec.CapTax'?
                                                (result[name]=parseFloat(fix+(BigInt(jBalance[name].yearEnd)*igain)/ideno)/100.0)
                                                :0.0));

    if(debugFlagReport) console.dir("Partner("+index+") with "+igain+"/"+ideno+"response D_Report"+JSON.stringify(result));
    return result;
}


export function bigEUMoney(strSet) {
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





