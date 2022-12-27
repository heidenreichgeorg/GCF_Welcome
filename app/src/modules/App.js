/* global BigInt */

import { J_ACCT, COLMIN, DOUBLE } from '../terms.js'

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
    var debit = ['','AN'];
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
                if(parts[j] && parts[j].length>0 && j!=aLen && j!=eLen) { 
                    
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

export function prepareTXN(schema,flow,name,amount) {
    
    var balanceNames=schema.Names;
    var aLen =       schema.assets;
    var eLen =       schema.eqliab;


    let credit=flow.credit;
    let debit = flow.debit;


    if(balanceNames && balanceNames.length>2) {
        for(var i=J_ACCT;i<balanceNames.length;i++) {
            if(balanceNames[i] && balanceNames[i].length>0 && i!=aLen && i!=eLen && balanceNames[i]===name) { 
                
                let iValue = bigEUMoney(amount);
                let entry = { index:i, value: cents2EU(iValue) }
                if(i<aLen && i!=eLen) credit[name]=entry;
                if(i>aLen && i!=eLen) debit[name]= entry;
            }
        }
    }
    
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
