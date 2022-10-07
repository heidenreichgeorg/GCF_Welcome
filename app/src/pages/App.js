import { useEffect, useState } from 'react'

import { J_ACCT, COLMIN, DOUBLE } from '../terms.js'


export const S_COLUMN = 15;
export const iCpField = 16;

export default function App() {

    const [clicked, setClicked] = useState(0)

    const [data, setData] = useState()

    useEffect(() => {
        // nur erster render
        setTimeout(() => setData('123'), 1000)
    }, [])

    function handleClick() {
        setClicked(clicked + 1)
    }

    if(!data) return 'Loading...'

    return (
        <div className="App">
            <header className="App-header">
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <Component text={'Learn React' + data} />
                <button onClick={handleClick}>Clicked: {clicked}</button>
            </header>
        </div>
    );
}

function Component({ text }) {
    return (
        <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
        >
            {text}
        </a>
    )
}

// account.html
export function AccountRow({lineNum, date, sender, reason, ref1, ref2, amount, saldo}) {
    return (
        <div class="attrLine">
            <div class="L40">{lineNum}</div>
            <div class="C100">{date}</div>
            <div class="L110">{sender}</div>
            <div class="L110">{reason}</div>
            <div class="L110">{ref1}</div>
            <div class="L110">{ref2}</div>
            <div class="R105">{amount}</div>
            <div class="R105">{saldo}</div>
        </div>
    )
}

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


export function FooterRow({long1A,long1B,long1C,long1D}) {
    return(
        <div class="attrLine">
            <div class="L120">&nbsp;</div>
            <div class="L280">{long1A}&nbsp;{long1B}</div>
            <div class="L280">{long1C}&nbsp;{long1D}</div>
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
    var credit = ['&nbsp;'];
    var debit = ['','AN'];
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
                if(parts[i] && parts[i].length>0) { 
                    
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
                        console.dir("ADD "+parts[i]+ " --> "+value.cents+"  --> "+iBalance);
                    }

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

    return result;
}

function setMoney(iCents) {
    var currency=new Object();
    currency.cents=iCents;
    return currency;
}

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

/*

// from Transfer.html

<div class="attrLine" id="PageContenttermLine1"> <div class="C100">
        <div class="key" onclick="doCommand('1')">1</div></div> <div class="C100">
        <div class="key" onclick="doCommand('2')">2</div></div> <div class="C100">
        <div class="key" onclick="doCommand('3')">3</div></div><div class="C100" id="selGRSB">
        
        <div class="key" oncontextmenu="accountMenu(event,'GRSB')" onclick="listCreditAccount(6,'GRSB')">GRSB</div></div><div class="C100" id="selEBKS">
        <div class="key" oncontextmenu="accountMenu(event,'EBKS')" onclick="listCreditAccount(7,'EBKS')">EBKS</div></div><div class="C100" id="selCDAK">
        <div class="key" oncontextmenu="accountMenu(event,'CDAK')" onclick="listCreditAccount(8,'CDAK')">CDAK</div></div><div class="C100" id="selFSTF">
        <div class="key" oncontextmenu="accountMenu(event,'FSTF')" onclick="listCreditAccount(9,'FSTF')">FSTF</div></div><div class="C100" id="selCOGK">
        <div class="key" oncontextmenu="accountMenu(event,'COGK')" onclick="listCreditAccount(10,'COGK')">COGK</div>
    </div>
</div>


*/