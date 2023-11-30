import { useEffect, useState } from 'react';
import { getSession, storeCarryOver, useSession, REACT_APP_API_HOST } from '../modules/sessionmanager';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { cents2EU,bigUSMoney }  from '../modules/money';
import { D_Page, D_Schema } from '../modules/terms.js'
import { book,prepareTXN }  from '../modules/writeModule';
import { makeStatusData }  from '../modules/App';

// the ORIGINAL FORMAT from journal sheet is 
// columns format CSV with these columns 
// HASH DATE SENDER REFACCT REASON REFCODE GRSB EBKS CDAK COGK FSTF NKFO KEST KESO VAVA - 

/* global BigInt */

// matrix format 
// { 'date':"", 'sender':"Sender", 'refAcct':"", 'reason':"", 'refCode':"", 'debit':{'name':VALUE}, credit:{ 'name':VALUE}}

// buildTransaction will generate the 
// flow format 
// "sender":SENDER,"reason":REASON,"credit":{"COGK":{"index":10,"value":"100,00"}},"debit":{"K2TO":{"index":33,"value":"100,00"}},"balance":""}
// this format is for AccountTemplateRow and setTxnthe external book method

export default function Status() {
    

    const predefinedTXN = {
       /* 
            "Miete":{"creditEQL":{},"credit":{"COGK":"0"},"debit":{"MIET":"0","NKHA":"0"},"debitA":{},"sender":"Vau / Ferguson","refAcct":"MIET","refCode":"Eifelweg 22"},
            "Entnahme Kpl":{"creditEQL":{"K2GH":"0","K2EH":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Elke u Georg","refAcct":"K2GH K2EH","refCode":"WITHDRAW"},
            "Entnahme Alex":{"creditEQL":{"K2AL":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Alexander","refAcct":"K2AL","refCode":"WITHDRAW"},
            "Entnahme Kristina":{"creditEQL":{"K2KR":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Kristina","refAcct":"K2KR","refCode":"WITHDRAW"},
            "Entnahme Tom":{"creditEQL":{"K2TO":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Tom","refAcct":"K2TO","refCode":"WITHDRAW"},
            "Entnahme Leon":{"creditEQL":{"K2LE":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Leon","refAcct":"K2LE","refCode":"WITHDRAW"},
            "Aufwand":{"creditEQL":{"AUFW":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Verkäufer","refAcct":"AUFW","refCode":"Eifelweg22"},
            "Sacheinlage Kpl":{"creditEQL":{"AUFW":"0"},"credit":{},"debitA":{},"debit":{"K2GH":"0","K2EH":"0"},"sender":"Verkäufer","refAcct":"AUFW","refCode":"DEP_IN_KIND"},
            "Grundabgaben":{"creditEQL":{"NKHA":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Stadt Erlangen","reason":"Quartal","refAcct":"NKHA","refCode":"FEE"},
            "Versicherung":{"creditEQL":{"NKHA":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"BayernVersicherung","reason":"Jahr","refAcct":"NKHA","refCode":"FEE"},
            "Aktien-Kauf":{"creditEQL":{},"credit":{"CDAK":"0"},"debit":{},"debitA":{"COGK":"0"},"sender":"WKN","reason":"Stückzahl","refAcct":"INVEST","refCode":"Code"},
            "Bond-Kauf mit Stückzins":{"creditEQL":{},"credit":{"CDAK":"0","FSTF":"0"},"debit":{},"debitA":{"COGK":"0"},"sender":"WKN","reason":"Nominal","refAcct":"INVEST","refCode":"Code"},
            "Aktien-Dividende bar":{"creditEQL":{},"credit":{"COGK":"0","KEST":"0","KESO":"0"},"debit":{"EDIV":"0"},"debitA":{},"sender":"WKN","reason":"Stückzahl","refAcct":"EDIV","refCode":"Code"},
            "Dividende steuerfrei bar":{"creditEQL":{},"credit":{"COGK":"0"},"debit":{},"debitA":{"CDAK":"0"},"sender":"WKN","reason":"Stückzahl","refAcct":"YIELD","refCode":"Code"},
            "Dividende in Aktien steuerfrei":{"creditEQL":{},"credit":{},"debit":{},"debitA":{},"sender":"WKN","reason":"Stückzahl","refAcct":"INVEST","refCode":"Code"},
            "Dividende in Aktien steuerpflichtig":{"creditEQL":{},"credit":{"KEST":"0","KESO":"0"},"debit":{"EDIV":"0"},"debitA":{},"sender":"WKN","reason":"Stückzahl","refAcct":"INVEST","refCode":"Code"},
            "Aktien-Verkauf mit Gewinn":{"creditEQL":{},"credit":{"COGK":"0","KEST":"0","KESO":"0"},"debit":{"FSAL":"0"},"debitA":{"CDAK":"0"},"sender":"WKN","reason":"Stückzahl","refAcct":"SELL","refCode":"Code"},
            "Aktien-Verkauf mit Verlust":{"creditEQL":{},"credit":{"VAVA":"0","COGK":"0"},"debit":{},"debitA":{"CDAK":"0"},"sender":"WKN","reason":"Stückzahl","refAcct":"SELL","refCode":"Code"},
            "Ausgleich Aktien-Verluste":{"creditEQL":{"FSAL":"0"},"credit":{},"debit":{},"debitA":{"VAVA":"0"},"sender":"Ausgleich","reason":"Verluste","refAcct":"VAVA","refCode":"VK Aktien"},
            "Pfandzahlung":{"creditEQL":{},"credit":{"FSTF":"0"},"debit":{},"debitA":{"COGK":"0"},"sender":"","reason":"","refAcct":"NKHA","refCode":"AZ"},
            "Rückerstattung Pfand":{"creditEQL":{},"credit":{"COGK":"0"},"debit":{},"debitA":{"FSTF":"0"},"sender":"","reason":"","refAcct":"NKHA","refCode":"AZ"},
            "Forderung Nebenkosten":{"creditEQL":{},"credit":{"NKFO":"0"},"debit":{"NKHA":"0"},"debitA":{},"sender":"Nebenkosten","reason":"Abschluss","refAcct":"NKHA","refCode":"Abrechnung"},
            "Mieter zahlt Nebenkosten":{"creditEQL":{},"credit":{"COGK":"0"},"debitA":{"NKFO":"0"},"debit":{},"sender":"Ferguson","reason":"Vorjahr","refAcct":"NKHA","refCode":"Nachzahlung"},
            "Erstattung Nebenkosten":{"creditEQL":{"NKHA":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Nebenkosten","reason":"Vorjahr","refAcct":"NKHA","refCode":"Überschuss"},
            "nicht abzugsfäh.Aufwand":{"creditEQL":{"K2GH":"0","K2EH":"0","K2AL":"0","K2KR":"0","K2TO":"0"},"credit":{},"debit":{"NKG":"0"},"debitA":{},"sender":"Abschluss","reason":"Jahr","refAcct":"K2LE","refCode":"WITHDRAW"},
            "Abschreibung Haus":{"creditEQL":{"ABSC":"0"},"credit":{},"debitA":{"GRSB":"0"},"debit":{},"sender":"Abschluss","reason":"Jahr","refAcct":"GRSB","refCode":"Afa Haus"},
            "Abschreibung EBKS":{"creditEQL":{"ABSC":"0"},"credit":{},"debitA":{"EBKS":"0"},"debit":{},"sender":"Abschluss","reason":"Jahr","refAcct":"EBKS","refCode":"AfA Spülmaschine"},
            "Abschreibung Dach":{"creditEQL":{"ABSC":"0"},"credit":{},"debitA":{"DACH":"0"},"debit":{},"sender":"Abschluss","reason":"Jahr","refAcct":"DACH","refCode":"AfA Dach"},
            "Einlage Kpl":{"creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"K2GH":"0","K2EH":"0"},"sender":"Elke u Georg","refAcct":"K2GH K2EH","refCode":"DEPOSIT"},
            "Einlage Alex":{"creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"K2AL":"0"},"sender":"Alexander","refAcct":"K2AL","refCode":"DEPOSIT"},
            "Einlage Kristina":{"creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"K2KR":"0"},"sender":"Kristina","refAcct":"Einlage","refCode":"DEPOSIT"},
            "Einlage Tom":{"creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"K2TO":"0"},"sender":"Tom","refAcct":"K2TO","refCode":"DEPOSIT"},
            "Einlage Leon":{"creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"K2LE":"0"},"sender":"Leon","refAcct":"K2LE","refCode":"DEPOSIT"}
        */
        };
            

    const [sheet, setSheet]  = useState()
    const [ year, setYear]   = useState()
    const [client,setClient] = useState()
    const { session, status } = useSession()
    const [displayRecord,setDisplayRecord] = useState({ creditEQL:{}, credit:{}, debitA:{}, debit:{}})
    const [matrix,setMatrix] = useState(predefinedTXN )

    
    useEffect(() => {
        if(status !== 'success') return;
        setYear(session.year);
        setClient(session.client);
        setMatrix(session.txnPattern);
        let state=getSession();
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
        }
        // reset all stored carryOver sums
        storeCarryOver({});
    }, [status])


    function login() {
        let params = new URLSearchParams(window.location.search);
        console.log("PARAMS "+JSON.stringify(params));
        let cAuth=document.getElementById('auth');
        if(cAuth) {
            let url = "/Status?client="+params.get("client")+"&year="+params.get("year")+"&auth="+cAuth.value;
            console.log("OPEN "+url);
            window.open(url);
        }
    }

    if(!sheet) return (    
            <div className = "attrLine">
                <div className="FIELD XFER">Authenticate:...</div>
                <div className="FIELD"><input key="auth" id="auth" type="edit"></input></div>
                <div className="FIELD"><div key="go" className="key" onClick={login}>&nbsp;LOGIN &nbsp;</div>
                </div>
            </div>        
    );



    
    function noFunc() {  console.log("CLICK NO");  }
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/Partner?client="+client+"&year="+year; } 
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/Accounts?client="+client+"&year="+year; }

    function handleXLSave() {
        
        const rqHeaders = {  'Accept': 'application/octet-stream',
                             'Access-Control-Allow-Origin':'*',
                             'Access-Control-Allow-Headers':'Origin, X-Requested-With, Content-Type, Accept, Authorization' };

        console.log("1110 Status.handleXLSave sessionId = "+session.id);
        
        const rqOptions = { method: 'GET', headers: rqHeaders, mode:'cors'};
        try {                
            fetch(`${REACT_APP_API_HOST}/EXCEL?client=${client}&year=${year}`, rqOptions)
            .then((response) => response.blob())
            .then((blob) => URL.createObjectURL(blob))
            .then((url) => console.log("1120 handleXLSave URL= "+ makeXLSButton(url,session.client,session.year)))
            .catch((err) => console.error("1127 handleXLSave ERR "+err));           
        } catch(err) { console.log("1117 GET /EXCEL handleXLSave:"+err);}
        console.log("1140 Status.handleXLSave EXIT");
    }



    function handleReview() {        
        book({'client':session.client,'year':session.year},session)
    }

    function makeXLSButton(url,client,year) { 
        console.log("1196 makeXLSButton XLSX "+url);
        if(client) {
            if(year) {
                let a = document.createElement('a');
                a.href = url
                a.download = "REPORT"+client+year+".XLSX";
                a.style.display = 'block'; // was none
                a.className = "key";
                a.innerHTML = "Download";
                document.body.appendChild(a); 
                console.log("1198 downloadButton make button");
            } else console.log("1197 makeXLSButton XLSX client("+client+"), NO year");
        } else console.log("1195 makeXLSButton XLSX NO client");
        return url;
    };

    /**************************************************************************************** */

    function list(side,factor) { 
        return Object.keys(side).map((acct)=>({'name':acct, 'value':(side[acct]&&side[acct].length>0 ? cents2EU(bigUSMoney(side[acct],factor)):"0")}));
    }

    function buildTransaction(simpleTXN) {
        let flow = { 'date':simpleTXN.date, 
                     'sender':simpleTXN.sender,
                     'refAcct':simpleTXN.refAcct, 
                     'reason':simpleTXN.reason, 
                     'refCode':simpleTXN.refCode,
                     'credit':{}, 'debit':{} };

        var arrCreditEQLInfo=list(simpleTXN.creditEQL,-1);        
        var arrCreditInfo=list(simpleTXN.credit,1);        
        var arrDebitAInfo=list(simpleTXN.debitA,-1);
        var arrDebitInfo=list(simpleTXN.debit,1);

        console.log("creditEQL "+JSON.stringify(arrCreditEQLInfo));
        console.log("credit "+JSON.stringify(arrCreditInfo));
        console.log("debitA "+JSON.stringify(arrDebitAInfo));
        console.log("debit "+JSON.stringify(arrDebitInfo));

        arrCreditEQLInfo.forEach((acct)=>{flow=prepareTXN(sheet[D_Schema],flow,acct.name,acct.value);});
        arrCreditInfo.forEach((acct)=>{flow=prepareTXN(sheet[D_Schema],flow,acct.name,acct.value);});
        arrDebitAInfo.forEach((acct) =>{flow=prepareTXN(sheet[D_Schema],flow,acct.name,acct.value);});
        arrDebitInfo.forEach((acct) =>{flow=prepareTXN(sheet[D_Schema],flow,acct.name,acct.value);});

        return flow;
    }


    const BOOK_NOW  = '0';
    const PRE_CLAIM = '1';

    function bookTemplate(jTXN) {   


        jTXN.year=session.year;
        jTXN.client=session.client;

        jTXN.sessionId = session.id; // won't book otherwise        
        jTXN.flag='1'; // flag that a pre-claim is being entered
        jTXN.flag=BOOK_NOW;

        console.log("bookTemplate build : "+JSON.stringify(jTXN));


        book(jTXN,session); 

        //resetSession();
        // invalidate current session

        console.log("bookTemplate:  booked.");  
    }

    
    function preBook(strKey) {
        let record = matrix[strKey];
        record.title=strKey;
        let jTXN = buildTransaction(record);
        matrix[strKey].balance=jTXN.balance;
        setDisplayRecord(JSON.parse(JSON.stringify(record)));
        console.log("preBook "+JSON.stringify(jTXN));
    }

    
    function doBook(strKey) {
        console.log("Book "+strKey);
        if(matrix[strKey]) {
            let txn = matrix[strKey];

            console.log("Book FORM "+JSON.stringify());

            let jTXN = buildTransaction(txn);


            if(!jTXN.balance || jTXN.balance=='') {

                if(     jTXN.sender //&& jTXN.sender.length>0
                     && jTXN.date //&& jTXN.date.length>0
                     && jTXN.refAcct //&& jTXN.refAcct.length>0
                     && jTXN.refCode //&& jTXN.refCode.length>0
                     && jTXN.reason //&& jTXN.reason.length>0
                     ) {
                    bookTemplate(jTXN);

                    console.log("doBook() booked "+JSON.stringify(jTXN));
                }
                else console.log("doBook() REJECTS "+JSON.stringify(jTXN));

            } else console.log("doBook() UNBALANCED "+JSON.stringify(jTXN));
        }
    }




    
    
    // side debit or credit   or    debitA or creditEQL
    function bufferAmount(strKey,field,value,side) {

       // console.log("ENTER bufferAmount: in "+strKey+ " change amount "+field+" to "+value+" at "+side);    
        let record = matrix[strKey];
        record[side][field]=value;

        console.log("EXIT bufferAmount: in "+JSON.stringify(record));  
    }

    function bufferField(strKey,field,value) {
        // console.log("in "+strKey+ " change field "+field+" to "+value);    
        let record = matrix[strKey];
        record[field]=value;

        console.log("EXIT bufferField: in "+JSON.stringify(record));  
    }



    function BookingForm({ strKey, form, preBook}) {

        let arrCreditEQL = Object.keys(form.creditEQL);
        let arrCredit = Object.keys(form.credit);
        let arrDebitA = Object.keys(form.debitA);
        let arrDebit = Object.keys(form.debit);
    
        return( <div><div className="attrLine"></div>
            <div className="attrLine">
            <div className="FIELD FLEX"> {matrix[strKey].text}</div>
            </div>
            <div className="attrLine">
                <div className="FIELD L280"> {strKey}</div>
    
                <div className="FIELD NAME">
                    <input  className="key SNAM" id="dateBooked" type="date" defaultValue={form.date} onChange={((e) => bufferField(strKey,'date',e.target.value))}/>
                </div>
    
                        
                <div className="FIELD SYMB" >Sender</div>
                <input type ="text" className="key MOAM" defaultValue={form.sender} onChange={((e) => bufferField(strKey,'sender',e.target.value))}/>
                <div className="FIELD SEP" ></div>
    
                <div className="FIELD SYMB" >Zeitraum</div>
                <input type ="text" className="key MOAM" defaultValue={form.reason} onChange={((e) => bufferField(strKey,'reason',e.target.value))}/>
                <div className="FIELD SEP" ></div>
    
                <div className="FIELD SYMB" >Grund</div>
                <input type ="text" className="key MOAM" defaultValue={form.refCode} onChange={((e) => bufferField(strKey,'refCode',e.target.value))}/>
                <div className="FIELD SEP" ></div>
                
            </div>
            <div className="attrLine">
      
                {arrCredit.map((acct)=>(
                    (<div>
                        <div className="FIELD TAG" > {acct}</div>
                        <input type ="number" className="key MOAM" defaultValue={form.credit[acct]} onChange={((e) => bufferAmount(strKey,acct,e.target.value,'credit'))} />    
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                 {arrCreditEQL.map((acct)=>(
                    (<div>
                        <div className="FIELD TAG" > {acct}</div>
                        <input type ="number" className="key MOAM" defaultValue={form.creditEQL[acct]} onChange={((e) => bufferAmount(strKey,acct,e.target.value,'creditEQL'))} />    
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                <div className="FIELD TAG" >AN</div>
                {arrDebit.map((acct)=>(
                    (<div>
                        <div className="FIELD TAG" > {acct}</div>
                        <input type ="number" className="key MOAM" defaultValue={form.debit[acct]} onChange={((e) => bufferAmount(strKey,acct,e.target.value,'debit'))} />    
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                {arrDebitA.map((acct)=>(
                    (<div>
                        <div className="FIELD TAG" > {acct}</div>
                        <input type ="number" className="key MOAM" defaultValue={form.debitA[acct]} onChange={((e) => bufferAmount(strKey,acct,e.target.value,'debitA'))} />    
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                
                
                <div className="FIELD TAG" ></div>
                <button className="key" onClick={(() => preBook(strKey))}>Anzeigen</button>
            
            </div>
        </div>);
    }
    
    
    function BookingDisplay({ strKey, form, doBook}) {

        let arrCreditEQL = Object.keys(form.creditEQL);
        let arrCredit = Object.keys(form.credit);
        let arrDebitA = Object.keys(form.debitA);
        let arrDebit = Object.keys(form.debit);
    
        return( <div><div className="attrLine"></div>
            <div className="attrLine">
                <div className="FIELD L280"> {form.title}</div>
    
                <div className="FIELD NAME">
                <div className="FIELD DATE" >{form.date}</div>
                </div>
                        
                <div className="FIELD SYMB" >Sender</div>
                <div className="FIELD TEAM" >{form.sender}</div>
                <div className="FIELD SEP" ></div>
    
                <div className="FIELD SYMB" >Zeitraum</div>
                <div className="FIELD TEAM" >{form.reason}</div>
                <div className="FIELD SEP" ></div>
    
                <div className="FIELD SYMB" >Grund</div>
                <div className="FIELD TEAM" >{form.refCode}</div>
                <div className="FIELD SEP" ></div>
                
                <div className="FIELD SYMB" >Balance</div>
                <div className="FIELD TEAM" >{form.balance}</div>
                <div className="FIELD SEP" ></div>
            </div>
            <div className="attrLine">
      
                {arrCredit.map((acct)=>(
                    (<div>
                        <div className="FIELD TAG" > {acct}</div>
                        <div className="FIELD MOAM" >{form.credit[acct]}</div>
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                {arrCreditEQL.map((acct)=>(
                    (<div>
                        <div className="FIELD TAG" > {acct}</div>
                        <div className="FIELD MOAM" >{form.creditEQL[acct]}</div>
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                <div className="FIELD TAG" > AN </div>
                {arrDebit.map((acct)=>(
                    (<div>
                        <div className="FIELD TAG" > {acct}</div>
                        <div className="FIELD MOAM" >{form.debit[acct]}</div>
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                {arrDebitA.map((acct)=>(
                    (<div>
                        <div className="FIELD TAG" > {acct}</div>
                        <div className="FIELD MOAM" >{form.debitA[acct]}</div>
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                                
                <div className="FIELD TAG" ></div>
                <button className="key" onClick={(() => doBook(strKey))}>Buchen</button>            
            </div>
        </div>);
    }
      
    let page = sheet[D_Page];
    let sheet_status = makeStatusData(sheet);
    let report = sheet_status.report;


    let tabHeaders = matrix ? Object.keys(matrix) : [];
    tabHeaders.unshift('Dashboard');
    let aPages = ['block'];
    for(let p=1;p<tabHeaders.length;p++) aPages[p]='none'; 

    const tabName = "Overview";
    
    return (
        <Screen prevFunc={noFunc} nextFunc={noFunc} tabSelector={tabHeaders}  tabName={tabName}> 
           

            <div className="FIELD" key={"Dashboard"} id={'Overview0'} style= {{ 'display': aPages[0]}} >
                <StatusRow am1={page.Assets} am2={page.Gain}  am3={page.eqliab}/>
                {
                    report.map((row,l) => (
                        <StatusRow  key={"Status"+l}  
                                            am1={row.gLeft} tx1={row.nLeft} 
                                            am2={row.gMidl} tx2={row.nMidl} 
                                            am3={row.gRite} tx3={row.nRite} 
                                            d={row.dTran} n={row.nTran} l={row.lTran}
                                            click={(l==0)?handleReview:null}/>                       
                    ))
                }
            </div>


            {matrix ? Object.keys(matrix).map((strKey,index)=>( 
                <div className="FIELD" key={"Form"+index} id={'Overview'+(index+1)} style= {{ 'display': aPages[index+1]}} > 
                    <div className="attrLine"/>
                    
                    <BookingForm    strKey={strKey}  form={matrix[strKey]} preBook={preBook} />
                    <BookingDisplay strKey={strKey}  form={displayRecord}  doBook={doBook} /> 
                </div>
            )) : ""}
        
            
            <div className="attrLine"/>
            <div className="attrLine"/>

            <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc} miscFunc={handleXLSave}/>
            <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc} miscFunc={handleXLSave}/>
        </Screen>
    )   
}


function showAccount(shrtName) { console.log("SHOW ACCOUNT "+shrtName); window.open("/History?client=HGKG&year=2023&APATTERN="+shrtName+"&SELECTALL=1"); }

function StatusRow({ am1,tx1, am2, tx2, am3, tx3, d, n, l, click}) {
    return(
        <div className="attrLine">
            <div className="FIELD MOAM"> {cents2EU(am1)}</div>
            <div className="FIELD SYMB" onClick={(e)=>showAccount(tx1)}> {tx1}</div>
            <div className="FIELD SEP"> &nbsp;</div>
            <div className="FIELD MOAM"> {cents2EU(am2)}</div>
            <div className="FIELD SYMB" onClick={(e)=>showAccount(tx2)}> {tx2}</div>
            <div className="FIELD SEP"> &nbsp;</div>
            <div className="FIELD MOAM"> {cents2EU(am3)}</div>
            <div className="FIELD SYMB" onClick={(e)=>showAccount(tx3)}> {tx3}</div>
            <div className="FIELD DASH"> &nbsp;</div>
            <div className="FIELD SEP"> &nbsp;</div>
            <div className="FIELD SYMB"> {d}</div>
            <div className="FIELD NAME"> {n}</div>
            <div className="FIELD">{l}</div>
            {click==null ? (<div className="FIELD SEP"> &nbsp;</div>) : (
            <div className="FIELD"  onClick={(() => click())}>&nbsp;.&nbsp;</div>
            ) }
        </div>
    )
}


