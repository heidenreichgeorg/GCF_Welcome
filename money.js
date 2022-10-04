

    function initMoney() {
        var currency=new Object();
        currency.cents=0;
        return currency;
    }
    module.exports['initMoney'] = initMoney;


    function lessMoney(small,great) {
        return small.cents<great.cents;
    }
    module.exports['lessMoney'] = lessMoney;

    function setMoney(iCents) {
        var currency=new Object();
        currency.cents=iCents;
        return currency;
    }
   module.exports['setMoney'] = setMoney;


    function addEUMoney(strAdd,money) {

        var euros=0;
        var cents=0;
        var factor=1;
        if(strAdd) {

            
            var amount = strAdd.split(',');
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
        
        if(money) {
            money.cents = money.cents + factor * cents;
        } else {
            money=initMoney();
            money.cents = money.cents + factor * cents;
        }
            
        return money;
    }
   module.exports['addEUMoney'] = addEUMoney;


   function show(money,strCredit) {
        if(!money) money={'cents':0 };
        if(!strCredit || (strCredit.length==0) || (parseInt(strCredit)==0)) return money;
        var factor=1; 
        if(parseInt(strCredit)<0) { 
            factor=-1;  //console.log(strCredit); 
        }
        var saldo = money.cents
            + parseInt( strCredit.replace('.','').replace(',',''));

        return { 'cents': saldo };
    }
    module.exports['show'] = show;


    function setEUMoney(strSet) {
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
        
        money=setMoney(factor * cents);
            
        return money;
    }
    module.exports['setEUMoney'] = setEUMoney;


    

    function setENMoney(strSet) {
        var euros=0;
        var cents=0;
        var factor=1;
        if(strSet && strSet.length>0) {

            var amount = strSet.split('.');
            var plain = amount[0].replace(',', '').trim(); 
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
        
        money=setMoney(factor * cents);
            
        return money;
    }
   module.exports['setENMoney'] = setENMoney;

    
    function negMoney(money) {
        return money.cents < 0;
    } 
    module.exports['negMoney'] = negMoney;


    function absMoney(money) {
        var currency=new Object();
        currency.cents=money.cents;
        if(money.cents < 0) currency.cents= -money.cents;
        else currency.cents=money.cents;
        return currency;
    } 

    function subEUMoney(strSub,money) {
        var euros=0;
        var cents=0;
        var factor=1.0;
        if(strSub) {

            var amount = strSub.split(',');
            var plain = amount[0].replace('.', '').trim(); 
            if(amount[0].startsWith('-')) { factor=-1.0; plain=plain.slice(1); }
            euros = parseInt(('0'+plain),10);
            if(amount.length>1) { // GH 20201117
                if(euros<0) { euros=Math.abs(euros); factor=-1; }
                const digits=amount[1]+"00";
                const strDigits=digits[0]+digits[1];
                cents=parseInt(strDigits,10);
            }
        }
        cents=euros*100+cents;
        
        if(money) {
            money.cents = money.cents - factor * cents;
        } else {
            money=initMoney();
            money.cents = money.cents - factor * cents;
        }
            
        return money;
    }
   module.exports['subEUMoney'] = subEUMoney;



    function addENMoney(factor,strAddEN,money) {
    // can do minus as first input
    // string form input as second input
        var euros=0;
        var cents=0;
        if(strAddEN) {

            var amount = strAddEN.split('.');
            var plain = amount[0].replace(',', '').trim(); 
            if(plain.startsWith('-')) { factor=-1 * factor; plain=plain.slice(1); }
            euros = parseInt(('0'+plain),10);
            if(amount.length>1) { // GH 20201117
    
                const digits=amount[1]+"00";
                const strDigits=digits[0]+digits[1];
                cents=parseInt(strDigits,10);
            }
        }
        cents=euros*100+cents;
        
        if(money) {
            
        } else {
            money=initMoney();
            
        }
        money.cents = money.cents + factor * cents;

        return money;
    }

    function iScaleMoney(money,intFactor,intScale,fix) {
        if(isNaN(intFactor)) return money;
        if(isNaN(intScale)) return money;
        if(isNaN(fix)) return money;
        if(intFactor==0) return 0;

        var cents= (fix + (intFactor * money.cents)) / intScale;
        return cents;
    }
   module.exports['iScaleMoney'] = iScaleMoney;


    function moneyString(money) {
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
            lenEuros = strEuros.length;
            strEuros = strEuros.slice(lenEuros-3);
        }
        return prefix + strEuros + ',' + strCent.slice(lenCent-2);	
    }
   module.exports['moneyString'] = moneyString;

   

    // GH20220123
   // needed in doBook - may well walk into sender.js sendBalance()
   function cents2EU(cents) {
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
module.exports['cents2EU'] = cents2EU;


function cents2Excel(cents) {
    var sign=""; if(cents<0) { sign="-"; cents=-cents; }

    var euroNum = parseInt(cents/100);
    var euroStr = euroNum.toString();
    cents-=(euroNum*100);

    return sign + euroStr+"."+(parseInt(cents%100).toString().padStart(2,'0'));
}
module.exports['cents2Excel'] = cents2Excel;

