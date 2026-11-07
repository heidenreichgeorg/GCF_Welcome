/* global BigInt */


export function addEUMoney(strAdd,money) {
        return bigMoney(strAdd,1n,money); }


        

// this function looks up the writeOff value (Found in the related account column)
export function bigAssetValueChange(row,nFrom,nBefore) {
    var column=nFrom;
    var iValue = 0n;
    var run=true;
    try {
        while(run && iValue==0n && column<nBefore) { // was  iValue<1n  GH20230924   was value == 0 GH20261018
            var test = row[column];
            if(test && test.length > 0 && bigEUMoney(test) != 0n ) { // GH20261018
                iValue=bigEUMoney(test); 
                console.log("ASSET ("+column+") VALUE CHANGE="+iValue)
                run=false;
            }
            column++;
        } // values before cash / accounts
    } catch(err) { console.dir("asset value("+row+")="+iValue+"   ERROR "+err); }
    return iValue;
}



// this function looks up te writeOff column 
export function bigAssetValueIndex(row,nFrom,nBefore,aXBRL) {
    var column=nFrom;
    var iValue = 0n;
    var run=true;
    try {
        while(run && iValue==0n && column<nBefore) { // was  iValue<1n  GH20230924   was value == 0 GH20261018
            var test = row[column];
            if(test && test.length > 0 && Sheets.bigEUMoney(test) != 0n  ) { // GH20261018
                iValue=Sheets.bigEUMoney(test); 
                if(debugFlagAssets) console.log("ASSET ("+aXBRL[column]+") VALUE CHANGE="+iValue)
                run=false;
            }
            column++;
        } // shares before cash / account
    } catch(err) { console.dir("asset value("+row+")="+iValue+"   ERROR "+err); }
    return column;
}

export function bigUSMoney(strAdd,factor) {
    let money = 0n;
    factor=BigInt(factor);
    var euros=0n;
    var cents=0n;
    if(strAdd && strAdd.length>0) {          
        var amount = strAdd.split('.');
        var plain = amount[0].replace(',', '').trim(); 
        if(plain.startsWith('-')) { factor=-1n * factor; plain=plain.slice(1); }
        try { euros = BigInt(('0'+plain)); } catch(err) {}
        if(amount.length>1) { 
            const digits=amount[1]+"00";
            const strDigits=digits[0]+digits[1];
            cents=BigInt(strDigits);
        }
    }
    cents=(euros*100n)+cents;
    money = money + (factor * cents);
    return money;
}

export function bigEUMoney(strSet) {
    return bigMoney(strSet,1n,null); }

    
export function cents20EU(amount) { 
    if(!amount) return "0";
    else return cents2EU(amount);
}
        

export function cents2EU(amount) { 
    let result="";
    if(amount!=null) {
        try {
            let cents=BigInt(amount); //copy object

            if(cents!=0n) try {

                var sign=""; if(cents<0n) { sign="-"; cents= -cents; }
                var kiloNum = BigInt(cents/100000n);

                var megaNum = BigInt(kiloNum/1000n);
                var megaStr = (megaNum>0n) ? megaNum.toString()+"." : "";

                var milleNum = kiloNum-(1000n*megaNum); 
                var milleStr = (megaNum>0n) ? milleNum.toString().padStart(3,'0')+"." : (milleNum>0n) ? milleNum.toString()+"." : "";
                cents = cents - (kiloNum*100000n);

                var euroNum = BigInt(cents/100n);
                var euroStr = (milleNum>0n)  ? euroNum.toString().padStart(3,'0') : euroNum.toString();
                cents = cents - (euroNum*100n);

                result =  sign + megaStr + milleStr + euroStr+"," +(BigInt(cents%100n).toString().padStart(2,'0'));
            } catch(err) {  console.error("money.mjs cents2EU("+cents.toString()+") failed:"+err.toString())}

        } catch(err) {  console.error("money.mjs cents2EU() cents=BigInt("+amount.toString()+") failed:"+err.toString())}
    } // no cents 
    else { console.log("money.mjs cents2EU called with null cents");}

    return result;
}


export function cents2US(amount) { 
    let result="";
    if(amount!=null) {
        try {
            let cents=BigInt(amount); //copy object

            if(cents!=0n) try {

                var sign=""; if(cents<0n) { sign="-"; cents= -cents; }
                var kiloNum = BigInt(cents/100000n);

                var megaNum = BigInt(kiloNum/1000n);
                var megaStr = (megaNum>0n) ? megaNum.toString()+"," : "";

                var milleNum = kiloNum-(1000n*megaNum); 
                var milleStr = (megaNum>0n) ? milleNum.toString().padStart(3,'0')+"," : (milleNum>0n) ? milleNum.toString()+"," : "";
                cents = cents - (kiloNum*100000n);

                var dollarNum = BigInt(cents/100n);
                var dollarStr = (milleNum>0n)  ? dollarNum.toString().padStart(3,'0') : dollarNum.toString();
                cents = cents - (dollarNum*100n);

                result =  sign + megaStr + milleStr + dollarStr+"." +(BigInt(cents%100n).toString().padStart(2,'0'));
            } catch(err) {  console.error("money.mjs cents2US("+amount.toString()+") failed:"+err.toString())}
        } catch(err) {  console.error("money.mjs cents2US() cents=BigInt("+amount.toString()+") failed:"+err.toString())}

    } // no cents 
    else { console.log("money.mjs cents2US called with null cents");}
    return result;
}


//*********** INTERNAL ********

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
        try { euros = BigInt(('0'+plain)); } catch(err) {}
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

