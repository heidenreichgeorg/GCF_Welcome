/* global BigInt */

import * as fs from 'fs';

import { accessFirebase,bucketUpload,loadFBConfig } from './fireBaseBucket'
import {  J_ACCT, COLMIN, DOUBLE } from './terms.js'
import { REACT_APP_API_HOST } from "./sessionmanager"
import { bigEUMoney, cents2EU,cents20EU } from './money'
import { setSession,strSymbol,timeSymbol } from './session'
import { compile } from './compile'

const debug=1;

const HTMLSPACE=" "; 

export const CSEP = ';';
export const S_COLUMN = 15;
export const iCpField = 75;


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
                      //console.log("strCents="+strCents);
                    let item = 0;
                    
                    try { item = BigInt(strCents) } catch(e) { console.error("Malformed TXN "+txnLine); }

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

    result.raw=parts;
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

// puts one name/amount apri into the flow structure
export function prepareTXN(schema,flow, name,amount) {
    
    var balanceNames=schema.Names;
    var aLen =       schema.assets;
    var eLen =       schema.eqliab;

    let iBalance=0n;
    if(flow.balance) iBalance=bigEUMoney(flow.balance);
    var newCredit=flow.credit;
    var newDebit=flow.debit;

    if(balanceNames && balanceNames.length>2) {
        for(var i=J_ACCT;i<balanceNames.length;i++) {
            if(balanceNames[i] && balanceNames[i].length>0 && i!=aLen && i!=eLen && balanceNames[i]===name 
                && amount && amount !='0') { 
                
                let iValue = bigEUMoney(amount);
                let entry = { index:i, value: cents20EU(iValue) }
                if(i<aLen && i!=eLen) {newCredit[name]=entry; iBalance+=iValue; }
                if(i>aLen && i!=eLen) {newDebit[name]= entry; iBalance-=iValue; }
            }
        }
    }

    flow.credit=newCredit;
    flow.debit=newDebit;
    flow.balance=cents2EU(iBalance);
    
    if(debug) console.dir("prepareTXN "+JSON.stringify(flow));
    return flow;
}


export function book(jTXN,session) {

    const requestOptions = {
        method: 'POST',
        headers: {  'Accept': 'application/json'
                    ,'Content-Type': 'application/json'
                    ,'withCredentials':'true' // GH20230226
                    ,'Access-Control-Allow-Origin': '*' // GH20230226
                    ,'Access-Control-Allow-Headers':'Origin, X-Requested-With, Content-Type, Accept,withCredentials' // GH20230226
                    ,'mode':'cors'
                  },
        body: JSON.stringify(jTXN)
    };

    fetch(`${REACT_APP_API_HOST}/BOOK?sessionId=${session.id}`, requestOptions)
    .then(data => data.json())
    .then(body => { console.log("BOOK RESULT "+JSON.stringify(body));
    
            let urlCommand = REACT_APP_API_HOST+"/LATEST?client="+body.client+"&year="+body.year+"&ext=JSON";
            console.log("BOOK RELOAD "+urlCommand);
            fetch(urlCommand, requestOptions) // GH20230226
            .then(res => {console.log("BOOK REFRESH "+JSON.stringify(res.body))})
        });
}


export async function writeFile(session) {  //GH20230815
    // write to filePath exists
    try {
                
                
                var writeStream = fs.createWriteStream(session.serverFile);
                if(debug) console.log("1670 CREATED "+session.serverFile);

                writeStream.write(JSON.stringify(session),'UTF8');
                if(debug) console.log("1680 WRITTEN "+session.serverFile);

                writeStream.end();
                if(debug) console.log("1690 CLOSED "+session.serverFile);

                writeStream.on('finish',function(){ console.log("1690 writeFile finished"); });

                writeStream.on('error',function(err){ console.log("1681 writeFile error: "+err.stack); });

                return;
         
        
    } catch(e) { console.dir("1655 WRONG/MISSING "+session.serverFile); }
}

export async function sendFile(sig, response) {  // was fs.exists() GH20230401
    // Check if file specified by the filePath exists
    try {
        fs.access(sig.serverFile, function (exists) {
            if (exists) {
                
                response.writeHead(200, {
                    "Content-Type": "application/octet-stream",
                    "Content-Disposition": "attachment; filename=" + sig.serverFile
                });
                if(debug) console.log("1670 TRANSFER "+sig.serverFile);
                fs.createReadStream(sig.serverFile).pipe(response);
                if(debug) console.log("1680 PIPING "+sig.serverFile);
                fs.close();
                if(debug) console.log("1690 CLOSING "+sig.serverFile);
                return;
            }
            else console.dir("1665 FILE EXISTS OR WRONG PATH OR MISSING ACCESS "+sig.serverFile);

            response.writeHead(400, {
                "Content-Type": "text/plain"
            });
            response.end("ERROR- CANNOT CREATE FILE");
        });
    } catch(e) { console.dir("1655 WRONG/MISSING "+sig.serverFile); }
}



export async function save2Bucket(config,session,client,year,root) {

    if(config) {
        console.log("0032 save2Bucket Start saving("+JSON.stringify(Object.keys(session))+") to FB for "+client+","+year);        

        // FIREBASE
        const fbConfig = loadFBConfig(root,config);
        if(fbConfig) {
            // 20221206
            // session.fireBase = fbConfig.storageBucket;

            // async, setSession and compile
            accessFirebase(bucketUpload,fbConfig,client,year,session,startSessionDisplay,null);
                
            if(debug) {
                console.log("0034 save2Bucket session.sheetcells keys="+JSON.stringify(Object.keys(session.sheetCells).map((i)=>(session.sheetCells[i][0]))));
            }

            return "save2Bucket OK";

        } else {
            console.error("0033 save2Bucket NO FIREBASE CONFIG");
            return "save2Bucket NO FIREBASE CONFIG";
        }
    } else return "save2Bucket NO CONFIG PARAMETER";
}



export function startSessionDisplay(session,res) {

    console.log("0018 startSessionDisplay="+JSON.stringify(Object.keys(session))); 

    // START A NEW SESSION
    let time = timeSymbol();
    let year=session.year;
    let client = session.client;
    let sessionId = strSymbol(time+client+year+time);
    session.id=sessionId;
    session.generated = compile(session);

    setSession(session);

    console.log("0020 startSessionDisplay("+client+","+year+") SUCCESS sessionId="+sessionId); 

    // 20221207
    if(res) {
        console.log("0022 startSessionDisplay("+client+","+year+") sendDisplay"); 
        sendDisplay(session,res);
    }
}


export function makeHistory(sheet,aPattern,lPattern,jHistory,aLen,eLen,gSchema,pageGlobal,screen_txns) {       

    console.log("makeHistory sheet="+Object.keys(sheet));
 
    const arrHistory = [];                    

    if(pageGlobal) {
        
        arrHistory.push({entry:CSEP+CSEP+pageGlobal["History"]+CSEP+pageGlobal["header"]+CSEP+CSEP});
        
  
        if(gSchema.Names && gSchema.Names.length>0) {
            var names=gSchema.Names;
            var iSaldo=0n;

            for (let index in jHistory)  {

                let jPrettyTXN = prettyTXN(jHistory,index,lPattern,aPattern,names,aLen,eLen);

                // GH 20220703
                if(jPrettyTXN.txnAcct) {
                    let txn = jPrettyTXN.raw;
                   
                    // GH20221228 see ['','AN'] in App.js turned to ['AN'] 
                        //jPrettyTXN.credit.join(CSEP)
                        //jPrettyTXN.debit.join(CSEP)+CSEP+CSEP+CSEP
                                           
                    var i=0;                    
                    var lMoney = {};
                    for (i=J_ACCT;i<txn.length;i++) { if(i!=aLen && i!=eLen && txn[i] && txn[i].length>1) lMoney[names[i]]=txn[i]; }  

                    console.log("makeHistory("+index+") for txn="+JSON.stringify(jHistory[index]).substring(14,60));

                    iSaldo += BigInt(jPrettyTXN.strSaldo);
                    
                    arrHistory.push({'entry':jPrettyTXN.entry.join(CSEP), 'jMoney':lMoney,  'saldo':""+(iSaldo) });                    
                                 
                }
            }

            for (let i=1;i<screen_txns;i++) arrHistory.push({entry:CSEP+CSEP+CSEP+CSEP+CSEP});
        }
    }
    return arrHistory;
}  
