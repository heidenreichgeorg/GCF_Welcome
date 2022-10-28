const debug=null;

const Money = require('./money.js');

function makeAccount(n,x,d,c) { return { "name":n, "index":c, "xbrl":x, "desc":(d?d:n), "init":"0,00", "min":"0,00",  "credit":"0,00", "debit":"0,00", "next":"0,00" }; }
module.exports['makeAccount']=makeAccount;


function openAccount(a,openVal) { 
    if(debug) console.log("OPEN "+a+":"+openVal);

    return { "name":a.name, "index":a.index, "desc":a.desc, "xbrl":a.xbrl, "init":openVal, "min":openVal, "credit":"0,00", "debit":"0,00" }; }
module.exports['openAccount']=openAccount;


function addEUMoney(account,strEuro) { 
    if(debug) console.log("addEUMoney "+account+":"+strEuro);
    var monEuro=Money.setEUMoney(strEuro);
 

    // GH20220410
    var cMin=Money.setEUMoney(account.min).cents;    
    var init=Money.setEUMoney(account.init);    
    var sum=Money.addEUMoney(account.credit,init);    
    var cSum=Money.addEUMoney(account.debit,sum).cents; 
    if(cSum<cMin) cMin=cSum;
 

    return{ 
        "name":account.name,
        "index":account.index, 
        "desc":account.desc, 
        "xbrl":account.xbrl, 

        "credit":(monEuro.cents>0)?Money.moneyString(Money.addEUMoney(account.credit,monEuro)):account.credit, 
        "debit" :(monEuro.cents<0)?Money.moneyString(Money.addEUMoney( account.debit,monEuro)):account.debit,

        "init":account.init, 
        "min":Money.moneyString({'cents':cMin})
    }; 
}
module.exports['addEUMoney']=addEUMoney;


function getNextYear(account) {
    var init=Money.setEUMoney(account.init);    
    var credit=Money.addEUMoney(account.credit,init);    
    var sum=Money.addEUMoney(account.debit,credit);    
    var next=sum;
    if(account.income && parseFloat(account.income)!=0.0) {
        next=Money.addEUMoney(account.income,sum);
        console.log("getNexYear("+account.name+") = "+next);
    }
    return Money.moneyString(next);
}
module.exports['getNextYear']=getNextYear;


function getChange(account) {
    var credit=Money.setEUMoney(account.credit);    
    var sum=Money.addEUMoney(account.debit,credit);    
    return Money.moneyString(sum);
}
module.exports['getChange']=getChange;


function getSaldo(account) {
    var init=Money.setEUMoney(account.init);    
    var credit=Money.addEUMoney(account.credit,init);    
    var sum=Money.addEUMoney(account.debit,credit);    
    return Money.moneyString(sum);
}
module.exports['getSaldo']=getSaldo;

function getTransient(account) {
    var credit=Money.setEUMoney(account.credit);    
    var sum=Money.addEUMoney(account.debit,credit);    
    return Money.moneyString(sum);
}
module.exports['getTransient']=getTransient;
