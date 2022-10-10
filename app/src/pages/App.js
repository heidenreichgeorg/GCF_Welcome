import { useEffect, useState } from 'react'

import { J_ACCT, COLMIN, DOUBLE, D_History, D_Page, D_Schema } from '../terms.js'

export const CSEP = ';';
export const S_COLUMN = 15;
export const iCpField = 35;

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


export function FooterRow({left,right,prevFunc,nextFunc}) {
    return(
        <div class="attrLine">
            <div class="L120">&nbsp;</div>
            <div class="L166 key" onClick={(() => prevFunc())}>&lt;&lt;</div>
            <div class="L280">{left}</div>
            <div class="L280">{right}</div>
            <div class="L166 key" onClick={(() => nextFunc())}>&gt;&gt;</div>
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

export function makeHistory(sheet) {       

    console.log("makeHistory sheet="+Object.keys(sheet));


    const arrHistory = [];                
    //const response = JSON.parse(strText);
    const jHistory  = sheet[D_History];
    const aLen = sheet[D_Schema].assets;
    const eLen = sheet[D_Schema].eqliab;
    const gSchema = sheet[D_Schema];
    const pageGlobal = sheet[D_Page];


     if(pageGlobal) {
        
        arrHistory.push(CSEP+CSEP+pageGlobal["History"]+CSEP+pageGlobal["header"]+CSEP+CSEP);

        
        // 20220701
        var lPattern = getParam("LPATTERN");
        if(lPattern && lPattern.length<2) lPattern=null;

        var aPattern = getParam("APATTERN");
        if(aPattern && aPattern.length<2) aPattern=null;


        if(gSchema.Names && gSchema.Names.length>0) {
            var names=gSchema.Names;

            var bLine=0;
            for (let hash in jHistory)  {
                bLine++;

                let jPrettyTXN = prettyTXN(jHistory,hash,lPattern,aPattern,names,aLen,eLen);

                // GH 20220703
                if(jPrettyTXN.txnAcct) {

                    let deltaText = "'"+jPrettyTXN.delta.join(CSEP)+"'";
                    let boxHead = "'"+jPrettyTXN.entry.join(CSEP)+"'";   
                    let boxText = "'"+jPrettyTXN.credit.join(CSEP)+CSEP+jPrettyTXN.debit.join(CSEP)+"'";   
                    let boxNote = "'"+pageGlobal["author"].replace('&nbsp;',CSEP)+"'";                 
                    let iBalance= jPrettyTXN.iBalance;
                    


                    let balCheck= '<DIV class="L66">'+cents2EU(iBalance)+'</DIV>';
                    console.dir("LINE "+bLine+" --> "+iBalance);
                    console.dir();

                    let data = (
                        jPrettyTXN.entry.join(CSEP)
                        +CSEP+jPrettyTXN.credit.join(CSEP)
                        +CSEP+jPrettyTXN.debit.join(CSEP)+CSEP+CSEP
                        ).split(CSEP);

                    
                    
                    var i=0;
                    var htmlLine=[];
                    for (i=0;i< 6;i++) { htmlLine.push(data[i]); }  arrHistory.push(htmlLine.join(CSEP));
                    
                    var htmlLine=[];
                    for (i=6;i<12;i++) { htmlLine.push(data[i]); }  arrHistory.push(htmlLine.join(CSEP));
                    
                }
            }


            /*
            // 20220701 search pattern 
            let sessionId = getId();
            let searchForm = "<FORM><DIV class='L280'>"
                +"<BUTTON autoFocus class='L66'>Search</BUTTON>"
                +"Line:<INPUT TYPE='edit' NAME='LPATTERN'/>&nbsp;"
            +"</DIV><DIV class='L280'>"
                +"Acct:<INPUT TYPE='edit' NAME='APATTERN'/>"
            +"</DIV><INPUT TYPE='hidden' NAME='sessionId' VALUE='"+sessionId+"'/></FORM>";
            cursor=printHTML(cursor,searchForm);

            setTrailer(pageGlobal, cursor);
            setScreen(document,htmlPage);
            */
        }
    }
    console.log("makeHistory="+JSON.stringify(arrHistory))

    return arrHistory;
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

function getParam(strParam) {
    
    var searchParams = new URL(window.location.href).searchParams;
    return searchParams.get(strParam);
}
