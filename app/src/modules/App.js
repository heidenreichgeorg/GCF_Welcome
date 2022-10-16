
import { J_ACCT, COLMIN, DOUBLE, D_History, D_Page, D_Schema } from '../terms.js'

const HTMLSPACE=" "; 

export const CSEP = ';';
export const S_COLUMN = 15;
export const iCpField = 35;


// openbalance.html
export function OverviewRow({acct, amount, name1, name2}) { // 
    return (
        <div class="attrLine">
            <div class="L175">{acct}</div>
            <div class="R105">{amount}</div>
            <div class="L22">{name1}</div>
            <div class="L280">{name2}</div>
        </div>
    )
}

// hgbregular.html
export function BalanceRow({text,level4,level3,level2,level1}) { 
    return (
        <div class="attrLine">
            <div class="L280">{text}</div>
            <div class="R105">{level4}</div>
            <div class="R105">{level3}</div>
            <div class="R105">{level2}</div>
            <div class="R105">{level1}</div>
        </div>
    )
}

export function GainLossRow({section,type,acct,xbrl,amount}) {
    return(
        <div class="attrLine">
            <div class="C100">{section}</div>
            <div class="L175">{type}</div>
            <div class="C140">{acct}</div>
            <div class="L175">{xbrl}</div>
            <div class="R105">{amount}</div>
        </div>
    )
}


export function prettyTXN(jHistory,hash,lPattern,aPattern,names,aLen,eLen) {

    var iBalance=0;

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
            for(var i=J_ACCT;i<parts.length;i++) {
                if(parts[i] && parts[i].length>0 && i!=aLen && i!=eLen) { 
                    
                    // GH20220307 EU-style numbers
                    let item = parseInt(parts[i]);

                    
                    // GH20220703
                    if(    !txnAcct
                        && names[i] && names[i].length>1 
                        && aPattern && aPattern.length>1 
                        && names[i].toLowerCase().includes(aPattern.toLowerCase())) txnAcct=true;


                    if(item!=0) {
                        delta.push(names[i]+DOUBLE+parts[i]); 

                        // GH20220307
                        let value = setEUMoney(parts[i]);
                        if(i<aLen) iBalance += value.cents;
                        else if(i!=aLen && i!=eLen) iBalance -= value.cents;
                        //console.dir("ADD "+parts[i]+ " --> "+value.cents+"  --> "+iBalance);
                    }

                    aNames.push(names[i]);   
                    aAmount.push(parts[i]);   

                    // POS ASSET
                    if(item>0 && i<aLen && i!=eLen) credit.push(names[i]+DOUBLE+parts[i]);                                        
                
                    // NEG EQLIAB
                    if(item<0 && i>aLen && i!=eLen) credit.push(names[i]+DOUBLE+parts[i].replace('-',''));
                
                    // NEG ASSET
                    if(item<0 && i<aLen && i!=eLen) debit.push(names[i]+DOUBLE+parts[i].replace('-',''));
                
                    // POS EQLIAB
                    if(item>0 && i>aLen && i!=eLen) debit.push(names[i]+DOUBLE+parts[i]);
                }
            }
        }
    }
    
    let result={};

    result.txnAcct=txnAcct;
    result.entry=entry;
    result.delta=delta;
    result.credit=credit;
    result.debit=debit;
    result.iBalance=iBalance;
    result.aNames=aNames;
    result.aAmount=aAmount;

    return result;
}

export function buildTXN(schema,flow,name,amount) {
    
    var balanceNames =schema.Names;
    var aLen = schema.assets;
    var eLen =  schema.eqliab;


    let credit=flow.credit;
    let debit = flow.debit;


    if(balanceNames && balanceNames.length>2) {
        for(var i=J_ACCT;i<balanceNames.length;i++) {
            if(balanceNames[i] && balanceNames[i].length>0 && i!=aLen && i!=eLen && balanceNames[i]===name) { 
                
                let entry = { index:i, cents:setEUMoney(amount).cents}

                if(i<aLen && i!=eLen) credit[name]=entry;
            
                if(i>aLen && i!=eLen) debit[name]= entry;
            }
        }
    }
    
    return flow;
}

function setMoney(iCents) { return { 'cents':iCents }; }

export function setEUMoney(strSet) {
    var euros=0;
    var cents=0;
    var factor=1;
    if(strSet && strSet.length>0) {

        var amount = strSet.split(',');
        var plain = amount[0].replace('.', '').trim(); 
        if(plain.startsWith('-')) { factor=-1; plain=plain.slice(1); }
        euros = parseInt(('0'+plain),10);
        if(amount.length>1) { // GH 20201117
            if(euros<0) { euros=Math.abs(euros); factor=-1; }
            const digits=amount[1]+"00";
            const strDigits=digits[0]+digits[1];
            cents=parseInt(strDigits,10);
        }
    }
    cents=euros*100+cents;
    
    return setMoney(factor * cents);
}


export function cents2EU(cents) {
    var sign=""; if(cents<0) { sign="-"; cents=-cents; }

    

    var kiloNum = parseInt(cents/100000);
    var megaNum = parseInt(kiloNum/1000);
    var megaStr = megaNum>0 ? megaNum.toString()+"." : "";

    var milleNum = kiloNum-(1000*megaNum); 
    var milleStr = milleNum>0 ? milleNum.toString()+"." : "";
    cents-=(kiloNum*100000);

    var euroNum = parseInt(cents/100);
    var euroStr = milleNum>0  ? euroNum.toString().padStart(3,'0') : euroNum.toString();
    cents-=(euroNum*100);

    return sign + megaStr + milleStr + euroStr+","+(parseInt(cents%100).toString().padStart(2,'0'));
}


export function getParam(strParam) {
    
    var searchParams = new URL(window.location.href).searchParams;
    return searchParams.get(strParam);
}
