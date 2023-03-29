import { useEffect, useState, useRef  } from 'react';

import FooterRow from '../components/FooterRow'
import Screen from '../pages/Screen'
import { addTXNData, getSelect, getValue, InputRow }  from '../modules/App';
import { book, prettyTXN, prepareTXN }  from '../modules/writeModule';
import {CSEP, D_Adressen, D_Balance, D_FixAss, D_Page, D_History, D_Schema,  J_ACCT, X_INCOME, X_EQLIAB } from '../modules/terms.js'
import { useSession } from '../modules/sessionmanager';


export default function Transfer() {

    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
    const [ creditor, setCreditor ] = useState({'sender':'','acct0':'','acct1':'','acct2':'','iAmount0':'','iAmount1':'','iAmount2':''});
    const [txn,setTxn] = useState({'add':{},'sub':{},'diff':"0", 'date':"", 'sender':"", 'refAcct':"", 'reason':"", 'refCode':""  })

    useEffect(() => {
        if(status !== 'success') return;
        let state = null;
        try { state=JSON.parse(sessionStorage.getItem('session')); } catch(err) {}
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
        }
    }, [status])

    function ignore(e) { e.preventDefault(); }


    
    function onPreBook(e,sender) {
        e.preventDefault();
        creditor.sender = sender;
        console.log("PRE-BOOK "+sender+" AS CRED "+JSON.stringify(creditor));
    }    
    

    if(!sheet) return null; // 'Loading...';

    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/Status?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/Accounts?client="+session.client+"&year="+session.year; }

    let page = sheet[D_Page];

    let names = sheet[D_Schema].Names;

    let aLen = where(names,"ASSETS");
    let eLen = where(names,"EQLIAB");
    
    function addPreData(shrtName,a,acctRef,amount) { 
        creditor[shrtName]=a; 
        creditor[acctRef]=amount; console.log("ACCOUNT("+a+"):= VALUE("+amount+") "+JSON.stringify(creditor)); 
        return creditor; } // avoid update

    const aNums = [0];
    

    var jAccounts = sheet[D_Balance];
    let arrAcct=[];

    for (let name in jAccounts)   {
        var account=jAccounts[name];
        if(account.xbrl.length>1) {
            var xbrl = account.xbrl.split('\.').reverse();
            var xbrl_pre = xbrl.pop()+ "."+ xbrl.pop();
            if(xbrl.length>3 && ((xbrl_pre===X_INCOME) || (xbrl_pre===X_EQLIAB))) arrAcct.push(name);
        }
    }
    addTXNData(txn,'refAcct',arrAcct[0]);


    // build cRef2 = refCode list with assets codes
    var jAssets = sheet[D_FixAss];
    let arrCode=["FEE","WITHDRAW","ADJUST",'DEP_MONEY',"DEP_IN_KIND"];
    Object.keys(jAssets).map(function(key,n) {
        var row = jAssets[key];
        arrCode.push(row.idnt);
    });
    addTXNData(txn,'refCode',arrCode[0]);


    let creditorsT = sheet[D_Adressen];
    if(!creditorsT || creditorsT.length<1) 
        creditorsT =[{'given':'Bundesanzeiger','surname':'Verlag','address':'Postfach 100534','zip':'50445','city':'Köln','country':'DE'},
                {'given':'Bayerische','surname':'Versicherungskammer','address':'Postfach','zip':'80430','city':'München','country':'DE'},
                {'given':'CosmosDirekt','surname':'Versicherung AG','address':'Halbergstr 50-60','zip':'66121','city':'Saarbrücken','country':'DE'},
                {'given':'Reichel','surname':'Schornsteinfeger','address':'Bamberger Str. 10','zip':'96172','city':'Mühlhausen','country':'DE'},
                {'given':'Stadt','surname':'Erlangen','address':'Rathausplatz 1','zip':'91052','city':'Erlangen','country':'DE'},
                {'given':'Entwässerungsbetrieb','surname':'Stadt Erlangen','address':'Schuhstraße 30','zip':'91052','city':'Erlangen','country':'DE'},
                {'given':'Ind.u.Handelskammer','surname':'Nürnberg','address':'Hauptmarkt 25-27','zip':'90403','city':'Nürnberg','country':'DE'}]
    let select = creditorsT[0];

    console.log(JSON.stringify(creditorsT));

    const tabName = 'TXNContent';
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aNums} tabName={tabName}>
            <CreditorRow/> 
            <CreditorRow/> 
            <CreditorRow/> 
            { creditorsT.map((report) => 
                (<CreditorRow given={report.given} surname={report.surname} 
                            address={report.address} 
                            zip={report.zip} 
                            city={report.city} 
                            country={report.country}
                            sender = {report.given+" "+report.surname} 
                            onPreBook={onPreBook}/>)
            )}
            <CreditorRow/> 
            <CreditorRow/> 
            <div className="attrLine">
            <div className="FIELD MOAM"><input id="iAmount0"></input></div>
                <div className="FIELD XFER">
                        <select type="radio" id="cReason0" name="cReason0" onChange={(e)=>addPreData('acct0',getSelect(e.target),'iAmount0',getValue('iAmount0'))} onDrop={ignore} >
                            {arrAcct.map((reason,i) => (
                                <option key={"reason0"+i} id={"reason0"+i} value={reason}>{reason}</option>
                            ))}
                        </select>
                </div>
            </div><div className="attrLine">
                <div className="FIELD MOAM"><input id="iAmount1"></input></div>
                <div className="FIELD XFER">
                        <select type="radio" id="cReason1" name="cReason1" onChange={(e)=>addPreData('acct1',getSelect(e.target),'iAmount1',getValue('iAmount1'))} onDrop={ignore} >
                            {arrAcct.map((reason,i) => (
                                <option key={"reason1"+i} id={"reason1"+i} value={reason}>{reason}</option>
                            ))}
                        </select>
                </div>
                </div><div className="attrLine">
                <div className="FIELD MOAM"><input id="iAmount2"></input></div>
                <div className="FIELD XFER">
                        <select type="radio" id="cReason2" name="cReason2" onChange={(e)=>addPreData('acct2',getSelect(e.target),'iAmount2',getValue('iAmount2'))} onDrop={ignore} >
                            {arrAcct.map((reason,i) => (
                                <option key={"reason2"+i} id={"reason2"+i} value={reason}>{reason}</option>
                            ))}
                        </select>
                </div>
            </div>
            <CreditorRow/>             
            <InputRow date={txn.date} sender={txn.sender} arrAcct={arrAcct} reason={txn.reason} arrCode={arrCode}/>    
            <CreditorRow/> 
            <CreditorRow/>
            <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
            <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
        </Screen>
    )
    
}


function where(array,key) {
    for(let i=0;i<array.length;i++) if((array[i]+CSEP).startsWith(key)) return i;
}



function getMax(response) {
    var jHistory = response[D_History];
    if(jHistory) return Object.keys(jHistory).length-1;
    return 0;
}


function makeTransferData(response,iSelected) {

    var jHistory = response[D_History];
    var gSchema = response[D_Schema];

    let transferData={ date:'',sender:'',refAcct:'',reason:'',refCode:'',lTran:["","","","","",""]};

    if(jHistory && gSchema.Names && gSchema.Names.length>0) {
        var names=gSchema.Names;
        var aLen = gSchema.assets;
        var eLen = gSchema.eqliab;
        var bLine=0;

        for (let hash in jHistory)  {

            if(bLine===iSelected) {
                let txn = jHistory[hash];
                transferData.date   = txn[1];
                transferData.sender = txn[2];
                transferData.refAcct = txn[3];
                transferData.reason  =  txn[4];
                transferData.refCode  =  txn[5];
                
                let jPrettyTXN = prettyTXN(jHistory,hash,null,null,names,aLen,eLen);
                transferData.aNames = jPrettyTXN.aNames;                                
                transferData.aAmount= jPrettyTXN.aAmount;
                transferData.lTran=jPrettyTXN.aNames.map((n,i)=>(n+jPrettyTXN.aAmount[i]));
            }
            bLine++;
        }
    }  
   return transferData;
}


function CreditorRow({ given,surname,address,zip,city,country,sender,onPreBook }) {
    return(
        <div className="attrLine">
            {   (sender && sender.length>2) ?
                (<div className="FIELD MOAM"><input type="submit" className="key" value="PRE-BOOK" onClick={(e)=>onPreBook(e,sender)}/></div>
                ):( <div>&nbsp;</div> )}   
            <div className="FIELD SEP"> &nbsp;</div>
            <div className="FIELD XFER"> {given}</div>
            <div className="FIELD SEP"> &nbsp;</div>
            <div className="FIELD XFER"> {surname}</div>
            <div className="FIELD SEP"> &nbsp;</div>
            <div className="FIELD XFER"> {address}</div>
            <div className="FIELD SEP"> &nbsp;</div>
            <div className="FIELD XFER"> {zip}</div>
            <div className="FIELD SEP"> &nbsp;</div>
            <div className="FIELD XFER"> {city}</div>
            <div className="FIELD SEP"> &nbsp;</div>
            <div className="FIELD XFER"> {country}</div>
        </div>)
}