

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

export function bigEUMoney(strSet) {
    return toMoney(strSet,1,null); }

export function cents2EU(cents) {
    var sign=""; if(cents<0) { sign="-"; cents=-cents; }
    if(isNaN(cents)) return cents;
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

