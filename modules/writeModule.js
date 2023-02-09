/* global BigInt */

import * as fs from 'fs';

import {  J_ACCT, COLMIN, DOUBLE } from './terms.js'
import { REACT_APP_API_HOST } from "./sessionmanager"
import { bigEUMoney, cents2EU } from './money'
import { accessFirebase,loadFBConfig } from './fireBaseBucket'

const debug=null;

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
                      //console.log("strCents="+strCents);
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

// puts one name/amount apri into the flow structure
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


export function book(jTXN,session) {

    const requestOptions = {
        method: 'POST',
        headers: {  'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'mode':'cors'
                  },
        body: JSON.stringify(jTXN)
    };

    fetch(`${REACT_APP_API_HOST}/BOOK?sessionId=${session.id}`, requestOptions)
    .then(data => data.json())
    .then(body => { console.log("BOOK RESULT "+JSON.stringify(body));
    
            let urlCommand = REACT_APP_API_HOST+"/LATEST?client="+body.client+"&year="+body.year+"&ext=JSON";
            console.log("BOOK RELOAD "+urlCommand);
            fetch(urlCommand)
            .then(res => {console.log("BOOK REFRESH "+JSON.stringify(res.body))})
        });
}


export async function sendFile(sig, response) {  
    // Check if file specified by the filePath exists
    fs.exists(sig.serverFile, function (exists) {
        if (exists) {
            // Content-type is very interesting part that guarantee that
            // Web browser will handle response in an appropriate manner.
            //response.writeHead(200, {
            //    "Content-Type": "application/octet-stream",
            //    "Content-Disposition": "attachment; filename=" + sig.serverFile
            //});
            if(debug) console.log("1650 TRANSFER "+sig.serverFile);
            fs.createReadStream(sig.serverFile).pipe(response);
            if(debug) console.log("1660 PIPING "+sig.serverFile);
            return;
        }
        response.writeHead(400, { "Content-Type": "text/plain" });
        response.end("ERROR File does not exist");
    });
}


// PURE FUNCTIONS

export function strSymbol(pat) {
    let cypher = "BC0DF1GH2JK3LM4NP5QR6ST7VW8XZ9A";
    let base=31;
    var res = 0;
    var out = [];
    if(!pat) pat = timeSymbol();
    {
        let factor = 23;
        var sequence = ' '+pat+pat+pat;
        for(let p=0;p<sequence.length && p<80;p++) {
            res = ((res*factor + sequence.charCodeAt(p)) & 0x1FFFFFFF);
            let index = res % base;
            out.push(cypher.charAt(index))
        }
    }
    return out.join('');
}



export function timeSymbol() { 
    var u = new Date(Date.now()); 
    return ''+ u.getUTCFullYear()+
      ('0' + (1+u.getUTCMonth())).slice(-2) +
      ('0' + u.getUTCDate()).slice(-2) + 
      ('0' + u.getUTCHours()).slice(-2) +
      ('0' + u.getUTCMinutes()).slice(-2) +
      ('0' + u.getUTCSeconds()).slice(-2) +
      (u.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5);
};     


export async function save2Bucket(config,session,client,year) {

    if(config) {
        console.log("0032 save2Bucket Start saving("+JSON.stringify(Object.keys(session))+") to FB for "+client+","+year);        

        // FIREBASE
        const fbConfig = loadFBConfig(config);
        if(fbConfig) {
            // 20221206
            // session.fireBase = fbConfig.storageBucket;

            // async, setSession and compile
            accessFirebase(FB.bucketUpload,fbConfig,client,year,session,startSessionDisplay,null);
                
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

