

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
        if(!money) money = { 'cents': 0 };        
        money.cents = money.cents + factor * cents;
        return money;
    }

export function addEUMoney(strAdd,money) {
        return toMoney(strAdd,1,money); }

export function setEUMoney(strSet) {
    return toMoney(strSet,1,null); }

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


 // from money.js
export  function moneyString(money) { cents2EU(money.cents); }
/*
    var prefix = "";
    var value=money.cents;
    if(value<0) {
        prefix='-';
        value=-1 * money.cents;
    } 
    var kilos=parseInt(value / 100000);
    var coins=value - (100000*kilos);
    
    var euros=parseInt(coins / 100);	
    var cents=coins - (100*euros);
    
    var strEuros = ''+euros;
    var strCent = '00'+cents;
    var lenCent = strCent.length;
    if(kilos>0) {
        prefix = prefix + kilos+'.';
        strEuros = '000'+strEuros;
        var lenEuros = strEuros.length;
        strEuros = strEuros.slice(lenEuros-3);
    }
    return prefix + strEuros + ',' + strCent.slice(lenCent-2);	
}
*/
