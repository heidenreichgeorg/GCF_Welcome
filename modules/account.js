// manages an account with BigInt for cents
const debug=null;

function makeAccount(n,x,d,c) { return { "name":n, "index":c, "xbrl":x, "desc":(d?d:n), "init":"0", "min":"00", "credit":"000", "debit":"0000", "next":"000000" , "interest":"" }; }
module.exports['makeAccount']=makeAccount;


function openAccount(a,openVal) { 
    if(debug) console.log("OPEN "+a+":"+openVal);
    return { "name":a.name, "index":a.index, "desc":a.desc, "xbrl":a.xbrl, "init":""+BigInt(openVal), "min":""+BigInt(openVal), "credit":"0", "debit":"00", "next":"000", "interest":""  }; }
module.exports['openAccount']=openAccount;


function add(account,strCents) { 
    if(debug) console.log("add "+account+":"+strCents);
    if(!strCents || strCents.length<2) return account;
    
    var iCents=BigInt(strCents);
    
    var iSum=BigInt(account.debit)+BigInt(account.credit)+BigInt(account.init)+iCents;
    
    var iMin=BigInt(account.min);    
    if(iSum<iMin) iMin=iSum;

    var sCredit = ""+(BigInt(account.credit)+iCents);
    var sDebit  = ""+(BigInt(account.debit) +iCents);

    return{ 
        "name":account.name,
        "index":account.index, 
        "desc":account.desc, 
        "xbrl":account.xbrl, 

        "credit":(iCents>0n) ? sCredit : account.credit, 
        "debit" :(iCents<0n) ? sDebit  : account.debit,

        "init":account.init, 
        "min":""+iMin,

        "next":"00000000",

        "interest":account.interest
    }; 
}
module.exports['add']=add;


function getNextYear(account) {
    var init=BigInt(account.init);    
    var credit=BigInt(account.credit)+init;    
    var sum=BigInt(account.debit)+credit;    
    var next=sum;
    if(account.income && parseInt(account.income)!=0) {
        next=BigInt(account.income)+sum;
    }
    if(debug) console.log("getNextYear("+account.name+") = "+next);
    return ""+next;
}
module.exports['getNextYear']=getNextYear;


function bigChange(account) { return BigInt(account.debit)+BigInt(account.credit);}
module.exports['bigChange']=bigChange;


function bigSaldo(account) { return BigInt(account.init)+BigInt(account.debit)+BigInt(account.credit); }
module.exports['bigSaldo']=bigSaldo;

