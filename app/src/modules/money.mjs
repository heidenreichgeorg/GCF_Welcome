/* global BigInt */

function bigMoney(strAdd,factor,money) {
    if(money==null) money = 0n;
    money=BigInt(money);
    factor=BigInt(factor);
    var euros=0n;
    var cents=0n;
    if(strAdd && strAdd.length>0) {          
        var amount = strAdd.split(',');
        var plain = amount[0].replace('.', '').trim(); 
        if(plain.startsWith('-')) { factor=-1n * factor; plain=plain.slice(1); }
        euros = BigInt(('0'+plain));
        if(amount.length>1) { // GH 20201117
            const digits=amount[1]+"00";
            const strDigits=digits[0]+digits[1];
            cents=BigInt(strDigits);
        }
    }
    cents=(euros*100n)+cents;
    money = money + (factor * cents);
    return money;
}

function toMoney(strAdd,factor,money) {
    var euros=0;
    var cents=0;
    if(strAdd) {          
        var amount = strAdd.split(',');
        var plain = amount[0].replace('.', '').trim(); 
        if(plain.startsWith('-')) { factor=-1*factor; plain=plain.slice(1); }
        euros = parseInt(('0'+plain),10);
        if(amount.length>1) { // GH 20201117
            const digits=amount[1]+"00";
            const strDigits=digits[0]+digits[1];
            cents=parseInt(strDigits,10);
        }
    }
    cents=euros*100+cents;
    if(!money) money = 0;        
    money = money + (factor * cents);
    return money;
}

export function addEUMoney(strAdd,money) {
        return bigMoney(strAdd,1n,money); }

export function bigEUMoney(strSet) {
    return bigMoney(strSet,1n,null); }

    

export function cents2EU(amount) { 
    let cents=amount; 
    
    if(!cents) return "";
    let result=cents;
    
    try {
        if(typeof(cents)==="string") {
            cents=BigInt(cents); 
        } // fixedAssets: some cents are strings with plain int format

        var sign=""; if(cents<0n) { sign="-"; cents= -cents; }
        var kiloNum = BigInt(cents/100000n);

        var megaNum = BigInt(kiloNum/1000n);
        var megaStr = (megaNum>0n) ? megaNum.toString()+"." : "";

        var milleNum = kiloNum-(1000n*megaNum); 
        var milleStr = (milleNum>0n) ? milleNum.toString()+"." : "";
        cents = cents - (kiloNum*100000n);

        var euroNum = BigInt(cents/100n);
        var euroStr = (milleNum>0n)  ? euroNum.toString().padStart(3,'0') : euroNum.toString();
        cents = cents - (euroNum*100n);

        result =  sign + megaStr + milleStr + euroStr+"," +(BigInt(cents%100n).toString().padStart(2,'0'));
    } catch(err) { /*result=typeof(cents);*/ }
    return result;
}

