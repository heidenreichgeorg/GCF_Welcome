import { useEffect, useState } from 'react';
import { getSession, storeCarryOver, useSession, REACT_APP_API_HOST } from '../modules/sessionmanager';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { cents2EU,bigEUMoney }  from '../modules/money';
import { D_Page, D_Schema } from '../modules/terms.js'
import { book,prepareTXN }  from '../modules/writeModule';
import { makeStatusData }  from '../modules/App';

// the ORIGINAL FORMAT from journal sheet is 
// columns format CSV with these columns 
// HASH DATE SENDER REFACCT REASON REFCODE GRSB EBKS CDAK COGK FSTF NKFO KEST KESO VAVA - 


// addDebit,addCredit,makeTxnFormat(jTemplates[index],names,aLen,eLen) will generate the 
// matrix format 
// { 'date':"", 'sender':"Sender", 'refAcct':"", 'reason':"", 'refCode':"", 'debit':{'name':VALUE}, credit:{ 'name':VALUE}}

// buildTransaction will generate the 
// flow format 
// "sender":SENDER,"reason":REASON,"credit":{"COGK":{"index":10,"value":"100,00"}},"debit":{"K2TO":{"index":33,"value":"100,00"}},"balance":""}
// this format is for AccountTemplateRow and setTxnthe external book method

export default function Status() {
    
    const [sheet, setSheet]  = useState()
    const [ year, setYear]   = useState()
    const [client,setClient] = useState()
    const { session, status } = useSession()
    const [matrix,setMatrix] = useState({
        "Miete":{"credit":{"MIET":"0","COGK":"0","NKHA":"0"},"debit":{},"sender":"Vau / Ferguson","refAcct":"MIET","refCode":"Eifelweg 22"},
        "Entnahme Kpl":{"credit":{},"debit":{"K2GH":"-0","K2EH":"-0","COGK":"-0"},"sender":"Elke u Georg","refAcct":"K2GH K2EH","refCode":"WITHDRAW"},
        "Entnahme Alex":{"credit":{},"debit":{"K2AL":"-0","COGK":"-0"},"sender":"Alexander","refAcct":"K2AL","refCode":"WITHDRAW"},
        "Entnahme Kristina":{"credit":{},"debit":{"K2KR":"-0","COGK":"-0"},"sender":"Kristina","refAcct":"K2KR","refCode":"WITHDRAW"},
        "Entnahme Tom":{"credit":{},"debit":{"K2TO":"-0","COGK":"-0"},"sender":"Tom","refAcct":"K2TO","refCode":"WITHDRAW"},
        "Entnahme Leon":{"credit":{},"debit":{"K2LE":"-0","COGK":"-0"},"sender":"Leon","refAcct":"K2LE","refCode":"WITHDRAW"},
        "Aufwand":{"credit":{},"debit":{"AUFW":"-0","COGK":"-0"},"sender":"Verkäufer","refAcct":"AUFW","refCode":"Eifelweg22"},
        "Sacheinlage Kpl":{"credit":{"K2GH":"0","K2EH":"0"},"debit":{"AUFW":"-0"},"sender":"Verkäufer","refAcct":"AUFW","refCode":"DEP_IN_KIND"},
        "Grundabgaben":{"credit":{},"debit":{"NKHA":"-0","COGK":"-0"},"sender":"Stadt Erlangen","reason":"Quartal","refAcct":"NKHA","refCode":"FEE"},
        "Versicherung":{"credit":{},"debit":{"NKHA":"-0","COGK":"-0"},"sender":"BayernVersicherung","reason":"Jahr","refAcct":"NKHA","refCode":"FEE"},
        "Aktien-Kauf":{"credit":{"CDAK":"0"},"debit":{"COGK":"-0"},"sender":"WKN","reason":"Stückzahl","refAcct":"INVEST","refCode":"Code"},
        "Bond-Kauf mit Stückzins":{"credit":{"CDAK":"0","FSTF":"0"},"debit":{"COGK":"-0"},"sender":"WKN","reason":"Nominal","refAcct":"INVEST","refCode":"Code"},
        "Aktien-Dividende bar":{"credit":{"EDIV":"0","COGK":"0","KEST":"0","KESO":"0"},"debit":{},"sender":"WKN","reason":"Stückzahl","refAcct":"EDIV","refCode":"Code"},
        "Dividende steuerfrei bar":{"credit":{"COGK":"0"},"debit":{"CDAK":"-0"},"sender":"WKN","reason":"Stückzahl","refAcct":"YIELD","refCode":"Code"},
        "Dividende in Aktien steuerfrei":{"credit":{},"debit":{},"sender":"WKN","reason":"Stückzahl","refAcct":"INVEST","refCode":"Code"},
        "Dividende in Aktien steuerpflichtig":{"credit":{"EDIV":"0","KEST":"0","KESO":"0"},"debit":{},"sender":"WKN","reason":"Stückzahl","refAcct":"INVEST","refCode":"Code"},
        "Aktien-Verkauf Gewinn":{"credit":{"FSAL":"0","COGK":"0","KEST":"0","KESO":"0"},"debit":{"CDAK":"-0"},"sender":"WKN","reason":"Stückzahl","refAcct":"SELL","refCode":"Code"},
        "Aktien-Verkauf Verlust":{"credit":{"VAVA":"0","COGK":"0"},"debit":{"CDAK":"-0"},"sender":"WKN","reason":"Stückzahl","refAcct":"SELL","refCode":"Code"},
        "Abschreibung Haus":{"credit":{},"debit":{"GRSB":"-0","ABSC":"-0"},"sender":"Abschluss","reason":"Jahr","refAcct":"GRSB","refCode":"Afa Haus"},
        "Abschreibung EBKS":{"credit":{},"debit":{"EBKS":"-0","ABSC":"-0"},"sender":"Abschluss","reason":"Jahr","refAcct":"EBKS","refCode":"AfA Spülmaschine"},
        "Abschreibung Dach":{"credit":{},"debit":{"DACH":"-0","ABSC":"-0"},"sender":"Abschluss","reason":"Jahr","refAcct":"DACH","refCode":"AfA Dach"},
        "Einlage Kpl":{"credit":{"K2GH":"0","K2EH":"0","COGK":"0"},"debit":{},"sender":"Elke u Georg","refAcct":"K2GH K2EH","refCode":"DEPOSIT"},
        "Einlage Alex":{"credit":{"K2AL":"0","COGK":"0"},"debit":{},"sender":"Alexander","refAcct":"K2AL","refCode":"DEPOSIT"},
        "Einlage Kristina":{"credit":{"K2KR":"0","COGK":"0"},"debit":{},"sender":"Kristina","refAcct":"Einlage","refCode":"DEPOSIT"},
        "Einlage Tom":{"credit":{"K2TO":"0","COGK":"0"},"debit":{},"sender":"Tom","refAcct":"K2TO","refCode":"DEPOSIT"},
        "Einlage Leon":{"credit":{"K2LE":"0","COGK":"0"},"debit":{},"sender":"Leon","refAcct":"K2LE","refCode":"DEPOSIT"}}  )

    
    useEffect(() => {
        if(status !== 'success') return;
        setYear(session.year);
        setClient(session.client);
        let state=getSession();
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
        }
        // reset all stored carryOver sums
        storeCarryOver({});
    }, [status])

    function list(side) { 
        return Object.keys(side).map((acct)=>({'name':acct, 'value':side[acct]}));
    }

    function buildTransaction(simpleTXN) {
        let flow = { 'date':simpleTXN.date, 
                     'sender':simpleTXN.sender,
                     'refAcct':simpleTXN.refAcct, 
                     'reason':simpleTXN.reason, 
                     'refCode':simpleTXN.refCode,
                     'credit':{}, 'debit':{} };

        var arrCreditInfo=list(simpleTXN.credit);        
        var arrDebitInfo=list(simpleTXN.debit);

        console.log("KEEP1 "+JSON.stringify(arrCreditInfo));
        console.log("KEEP2 "+JSON.stringify(arrDebitInfo));

        arrCreditInfo.forEach((acct)=>{flow=prepareTXN(sheet[D_Schema],flow,acct.name,acct.value);});
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
            }
        }
    }




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

    
    //let form={};
    // side = debit or credit
    function bufferAmount(strKey,field,value,side,setMatrix) {


        console.log("in "+strKey+ " change amount "+field+" to "+value+" at "+side);    
        let record = matrix[strKey];
        if(side=='debit') record[side][field]="-"+value;
        else record[side][field]=value;


        setMatrix(JSON.parse(JSON.stringify(matrix)));
    }

    function bufferField(strKey,field,value,setMatrix) {
        console.log("in "+strKey+ " change field "+field+" to "+value);    
        let record = matrix[strKey];
        record[field]=value;

        setMatrix(JSON.parse(JSON.stringify(matrix)));
    }



    function BookingForm({ strKey, form, doBook, setMatrix}) {

        let arrCredit = Object.keys(form.credit);
        let arrDebit = Object.keys(form.debit);
    
        return( <div><div className="attrLine"></div>
            <div className="attrLine">
                <div className="FIELD LTXT"> {strKey}</div>
    
                <div className="FIELD NAME">
                    <input id="dateBooked" type="date" defaultValue={form.date} onChange={((e) => bufferField(strKey,'date',e.target.value,setMatrix))}/>
                </div>
    
                        
                <div className="FIELD SYMB" >Sender</div>
                <input type ="text" className="key MOAM" defaultValue={form.sender} onChange={((e) => bufferField(strKey,'sender',e.target.value,setMatrix))}/>
                <div className="FIELD TAG" ></div>
    
                <div className="FIELD SYMB" >Zeitraum</div>
                <input type ="text" className="key MOAM" defaultValue={form.reason} onChange={((e) => bufferField(strKey,'reason',e.target.value,setMatrix))}/>
                <div className="FIELD TAG" ></div>
    
                <div className="FIELD SYMB" >Grund</div>
                <input type ="text" className="key MOAM" defaultValue={form.refCode} onChange={((e) => bufferField(strKey,'refCode',e.target.value,setMatrix))}/>
                <div className="FIELD TAG" ></div>
                
            </div>
            <div className="attrLine">
      
                {arrCredit.map((acct)=>(
                    (<div>
                        <div className="FIELD TAG" > {acct}</div>
                        <input type ="number" className="key MOAM" value={form[acct]} onChange={((e) => bufferAmount(strKey,acct,e.target.value,'credit',setMatrix))} />    
                        <div className="FIELD TAG" ></div>
                    </div>)
                ))}
                AN
                {arrDebit.map((acct)=>(
                    (<div>
                        <div className="FIELD TAG" > {acct}</div>
                        <input type ="number" className="key MOAM" value={form[acct]} onChange={((e) => bufferAmount(strKey,acct,e.target.value,'debit',setMatrix))} />    
                        <div className="FIELD TAG" ></div>
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


    const tabName = "Overview";
    let pageText =  ['Patterns', 'DashBoard'].map((name) =>( page[name] ));
    let aPages = ['block'];
    for(let p=1;p<pageText.length;p++) aPages[p]='none'; 


    return (
        <Screen prevFunc={noFunc} nextFunc={noFunc} tabSelector={pageText}  tabName={tabName}> 
           

            <div className="FIELD"  id={'Overview0'} style= {{ 'display': aPages[0]}} >
                <div className="FIELD" >{JSON.stringify(matrix)} </div>
                {Object.keys(matrix).map((strKey)=>(
                    <BookingForm  strKey={strKey}  form={matrix[strKey]} doBook={doBook} setMatrix={setMatrix} />
                ))}
            </div>


            <div className="FIELD" key={"Status"} id={'Overview1'} style= {{ 'display': aPages[1]}} >
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
            <div className="FIELD SEP"> &nbsp;</div>
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


