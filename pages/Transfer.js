import { useEffect, useState, useRef  } from 'react';

import FooterRow from '../components/FooterRow.js'
import Screen from './Screen.js'
import { addTXNData, getSelect, getValue, InputRow, setSelect }  from '../modules/App.js';
import { book, prettyTXN, prepareTXN }  from '../modules/writeModule.js';
import {CSEP, D_Adressen, D_Balance, D_FixAss, D_Page, D_History, D_Schema,  X_ASS_CASH, X_EQLIAB, X_INCOME, X_LIABILITY } from '../modules/terms.js'
import { getSession, resetSession, useSession } from '../modules/sessionmanager';
import { cents2EU, bigEUMoney }  from '../modules/money';

export default function Transfer() {

    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
    const [ creditor, setCreditor ] = useState({'sender':'','acct0':'','acct1':'','acct2':'','iAmount0':'','iAmount1':'','iAmount2':''});
    const [txn,setTxn] = useState({ 'date':"", 'sender':"", 'refAcct':"", 'reason':"", 'refCode':"", 'credit':{},'debit':{}  })

    useEffect(() => {
        if(status !== 'success') return;
        let state=getSession();
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
        }
    }, [status])

    function ignore(e) { e.preventDefault(); }


    function addPreData(shrtName,acctRef) { 
        let name = getSelect(shrtName);
        let amount=getValue(acctRef);
        creditor[shrtName]=name; 
        creditor[acctRef]=amount; 
        console.log("Transfer.addPreData ACCOUNT("+name+"):= VALUE("+amount+") "+JSON.stringify(creditor)); 
        return creditor; } // avoid update

    
    function onPreBook(e,sender) {
        e.preventDefault();
        creditor.sender = sender;

        addPreData('acct0','iAmount0');
        addPreData('acct1','iAmount1');
        addPreData('acct2','iAmount2');

        txn.sender = sender;
        txn.refAcct = creditor.acct0;

        console.log("Transfer.addPreData "+sender+" WITH "+txn.refAcct+" AS CRED "+JSON.stringify(creditor));
    
        let controlRefAcct1 = document.getElementById("acct1");
        let controlRefAcct2 = document.getElementById("acct2");

        let flow = { 'credit':{}, 'debit':{} };
        
        let iam0 = bigEUMoney(creditor.iAmount0);
        if(iam0 && iam0!=0n) flow=prepareTXN(sheet[D_Schema],flow,creditor.acct0,cents2EU(iam0));
        
        let iam1 = bigEUMoney(creditor.iAmount1);
        if(iam1 && iam1!=0n) {
            flow=prepareTXN(sheet[D_Schema],flow,creditor.acct1,cents2EU(iam1));
            if(controlRefAcct1) {
                console.log("Transfer.addPreData SET SELECT1 "+controlRefAcct1.id+" WITH "+creditor.acct1);
                setSelect("cReason",creditor.acct1);
            } 
        }

        let iam2 = bigEUMoney(creditor.iAmount2);
        if(iam2 && iam2!=0n) {
            flow=prepareTXN(sheet[D_Schema],flow,creditor.acct2,cents2EU(iam2));
            if(controlRefAcct2) {
                console.log("Transfer.addPreData SET SELECT2 "+controlRefAcct2.id+" WITH "+creditor.acct2);
                setSelect("cReason",creditor.acct2);
            }
        }




        txn.credit = flow.credit;
        txn.debit=flow.debit;
        //console.log("Transfer.addPreData SET FLOW "+JSON.stringify(flow));

        // renders complete page, because txn is a controlled variable
        setTxn(JSON.parse(JSON.stringify(txn)))

    }    
   
    function onBook() {
        
        // refAcct reason refCode missing


        // GH20230205
        // WITH SERVER-SIDE SESSION MANAGEMENT
        txn.sessionId = session.id; // won't book otherwise
        // WITH CLIENT-SIDE CLIENT/YEAR as PRIM KEY
        txn.year=session.year;
        txn.client=session.client;

        console.log("Transfer.onBook BOOK B "+JSON.stringify(txn));

        book(txn,session); 

        resetSession();
        // invalidate current session

        console.log("Transfer.onBook BOOK txn booked."+JSON.stringify(txn));
  
    }


    if(!sheet) return null; // 'Loading...';

    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/Status?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/Accounts?client="+session.client+"&year="+session.year; }

    let page = sheet[D_Page];

    let names = sheet[D_Schema].Names;

    let aLen = where(names,"ASSETS");
    let eLen = where(names,"EQLIAB");
    
    const aNums = [0];
    

    var jAccounts = sheet[D_Balance];

    let arrAcct=[];
    let arrLiab=[];
    let arrAsst=[];
    for (let name in jAccounts)   {
        var account=jAccounts[name];
        if(account.xbrl.length>1) {
            var xbrl = account.xbrl.split('\.').reverse();
            var xbrl_pre = account.xbrl;//xbrl.pop()+ "."+ xbrl.pop()+ "."+ xbrl.pop()+ "."+ xbrl.pop();
            //console.log("Transfer.onBook Pattern "+xbrl_pre);
            if(xbrl.length>2) { 
                if(xbrl_pre.startsWith(X_INCOME) || xbrl_pre.startsWith(X_EQLIAB)) arrAcct.push(name);
                if(xbrl_pre.startsWith(X_LIABILITY)) arrLiab.push(name);
                if(xbrl_pre.startsWith(X_ASS_CASH)) arrAsst.push(name);
            }
        }
    }
    
    
    // build cRef2 = refCode list with assets codes
    var jAssets = sheet[D_FixAss];
    let arrCode=["FEE","WITHDRAW","ADJUST",'DEP_MONEY',"DEP_IN_KIND"];
    Object.keys(jAssets).map(function(key,n) {
        var row = jAssets[key];
        arrCode.push(row.idnt);
    });
    addTXNData(txn,'refCode',arrCode[0]);


    let creditorsT = sheet[D_Adressen];
    if(!creditorsT || creditorsT.length<1) {
        creditorsT =[
            {'given':'Bayerische','surname':'Versicherungskammer','address':'Postfach','zip':'80430','city':'München','country':'DE'},
            {'given':'BNP Paribas','surname':'S.A.','address':'Bahnhofstraße 55','zip':'90402','city':'Nürnberg','country':'DE'},
            {'given':'Bundesanzeiger','surname':'Verlag','address':'Postfach 100534','zip':'50445','city':'Köln','country':'DE'},
            {'given':'CosmosDirekt','surname':'Versicherung AG','address':'Halbergstr 50-60','zip':'66121','city':'Saarbrücken','country':'DE'},
            {'given':'Entwässerungsbetrieb Erlangen','surname':'Stadt','address':'Schuhstraße 30','zip':'91052','city':'Erlangen','country':'DE'},
            {'given':'Erlangen','surname':'Stadt','address':'Rathausplatz 1','zip':'91052','city':'Erlangen','country':'DE'},
            {'given':'Nürnberg','surname':'Ind.u.Handelskammer','address':'Hauptmarkt 25-27','zip':'90403','city':'Nürnberg','country':'DE'},
            {'given':'Reichel','surname':'Schornsteinfeger','address':'Bamberger Str. 10','zip':'96172','city':'Mühlhausen','country':'DE'}];

            session.creditorsT=creditorsT;
        }
    console.log("REFRESH PAGE "+JSON.stringify(creditor));
    console.log("Transfer.onBook REFRESH TXN "+JSON.stringify(txn));

        // Buchungssatz
    let arrICred = Object.keys(txn.credit).map((accVal) => (bigEUMoney(txn.credit[accVal].value)))
    let arrIDebt = Object.keys(txn.debit).map((accVal)  => (bigEUMoney(txn.debit[accVal].value)))
    let arrCred = [];
    let arrDebt = [];
    Object.keys(txn.credit).map((accVal,i) => 
        (arrICred[i]<0n ? 
            arrDebt.push(accVal+":"+cents2EU(arrICred[i]*-1n)) :
            arrCred.push(accVal+":"+cents2EU(arrICred[i]*-1n))))

     Object.keys(txn.debit).map((accVal,i)  => 
        (arrIDebt[i]<0n ? 
            arrCred.push(accVal+":"+cents2EU(arrIDebt[i]*-1n)) :
            arrDebt.push(accVal+":"+cents2EU(arrIDebt[i]*-1n))))


    const tabName = 'TXNContent';
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aNums} tabName={tabName}>
            <CreditorRow/> 
            <div className="attrLine">
                <div className="FIELD XFER">{page.Expenses}</div>
            </div>
            <div className="attrLine">
            <div className="FIELD XFER"></div>
            <div className="FIELD MOAM"><input id="iAmount0"></input></div>
            <div className="FIELD XFER">
                        <select type="radio" key="acct0" id="acct0" name="acct0" onDrop={ignore} >
                            {arrAsst.map((reason,i) => (
                                <option key={"reason0"+i} id={"reason0"+i} value={reason}>{reason}</option>
                            ))}
                        </select>
                </div>
            <div className="SEP"></div>
                <div className="FIELD MOAM"><input id="iAmount1"></input></div>
                <div className="FIELD XFER">
                        <select type="radio" key="acct1" id="acct1" name="acct1" onDrop={ignore} >
                            {arrLiab.map((reason,i) => (
                                <option key={"reason1"+i} id={"reason1"+i} value={reason}>{reason}</option>
                            ))}
                        </select>
                </div>
                <div className="FIELD MOAM"></div>
                <div className="FIELD MOAM"><input id="iAmount2"></input></div>
                <div className="FIELD XFER">
                        <select type="radio" key="acct2" id="acct2" name="acct2" onDrop={ignore} >
                            {arrAcct.map((reason,i) => (
                                <option key={"reason2"+i} id={"reason2"+i} value={reason}>{reason}</option>
                            ))}
                        </select>
                </div>
            </div>
            <CreditorRow/>             
            { creditorsT.map((report,i) => 
                (<CreditorRow given={report.given} surname={report.surname} 
                            address={report.address} 
                            zip={report.zip} 
                            city={report.city} 
                            country={report.country}
                            sender = {report.given+" "+report.surname} 
                            onPreBook={onPreBook}
                            key={i} />)
            )}
            <CreditorRow/> 
            <CreditorRow/>
            <CreditorRow/>
            <CreditorRow/>
            <CreditorRow/>
            <CreditorRow/> 
            <CreditorRow/> 
            <InputRow arrAcct={arrAcct} arrCode={arrCode} txn={txn}/>  
            <CreditorRow/>
            <div className="attrLine">
                <div className="FIELD SEP"></div><div className="FIELD SEP"></div><div className="FIELD SEP"></div>
                <div className="FIELD MOAM"><input type="submit" className="key" value="BOOK" onClick={(e)=>onBook(e)}/></div>
                <div className="FIELD SEP"></div>
                <div className="FIELD LNAM" key="aCredit">{arrCred.join()}</div>
                <div className="FIELD SEP">AN</div>
                <div className="FIELD LNAM" key="aDebit">{arrDebt.join()}</div>
            </div>
            <CreditorRow/> 
            <CreditorRow/>
            <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
            <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
        </Screen>
    )
    
}
// <select type="radio" key="cReason2" id="acct2" name="cReason2" onChange={(e)=>addPreData('acct2',getSelect(e.target.id),'iAmount2',getValue('iAmount2'))} onDrop={ignore} >

function where(array,key) {
    for(let i=0;i<array.length;i++) if((array[i]+CSEP).startsWith(key)) return i;
}


/*
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
*/

function CreditorRow({ given,surname,address,zip,city,country,sender,onPreBook,key }) {
    return(
        <div className="attrLine" key={"Creditor"+key}>
            {   (sender && sender.length>2) ?
                (<div className="FIELD MOAM" id={"pre"+sender}><input type="submit" className="key" value="SELECT" onClick={(e)=>onPreBook(e,sender)}/></div>
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