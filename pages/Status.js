import { useEffect, useState } from 'react';
import { getSession, storeCarryOver, useSession, REACT_APP_API_HOST } from '../modules/sessionmanager';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { cents2EU,bigEUMoney }  from '../modules/money';
import { D_Page } from '../modules/terms.js'
import { book,prepareTXN }  from '../modules/writeModule';
import { makeStatusData }  from '../modules/App';

// the ORIGINAL FORMAT from journal sheet is 
// columns format CSV with these columns 
// HASH DATE SENDER REFACCT REASON REFCODE GRSB EBKS CDAK COGK FSTF NKFO KEST KESO VAVA - 


// addDebit,addCredit,makeTxnFormat(jTemplates[index],names,aLen,eLen) will generate the 
// txn format 
// { 'date':"", 'sender':"Sender", 'refAcct':"", 'reason':"", 'refCode':"", 'debit':{'name':VALUE}, credit:{ 'name':VALUE}}

// onkeep/buildTransaction will generate the 
// flow format 
// "sender":SENDER,"reason":REASON,"credit":{"COGK":{"index":10,"value":"100,00"}},"debit":{"K2TO":{"index":33,"value":"100,00"}},"balance":""}
// this format is for AccountTemplateRow and the external book method

export default function Status() {
    
    const [sheet, setSheet]  = useState()
    const [ year, setYear]   = useState()
    const [client,setClient] = useState()
    const { session, status } = useSession()
    const [txn,setTxn] = useState({ 'date':"", 'sender':"Sender", 'refAcct':"", 'reason':"", 'refCode':"", 'credit':{},'debit':{}  })
    const [claims,setClaims] = useState([])

    function update() {
        if(txn) {
            let bigSum=0n;
            let cKeys=Object.keys(txn.credit);
            let dKeys=Object.keys(txn.debit);
            cKeys.forEach((acct)=>{bigSum+=bigEUMoney(txn.credit[acct]); console.log("+"+txn.credit[acct])})
            dKeys.forEach((acct)=>{bigSum-=bigEUMoney(txn.debit[acct]); console.log("+"+txn.debit[acct])})
            txn.balance=cents2EU(bigSum);
            setTxn(JSON.parse(JSON.stringify(txn))); // render full page
            console.log("update "+JSON.stringify(txn)+" = "+cents2EU(bigSum));
        }
    }
    
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

    
    function addDebit(attribute) {                
        if(attribute && attribute.name && attribute.value) {
            txn.debit[attribute.name]=attribute.value;
            delete txn.credit[attribute.name];
            update();
        }
    }

    function addCredit(attribute) {       
        if(attribute && attribute.name && attribute.value) {
            txn.credit[attribute.name]=attribute.value;
            delete txn.debit[attribute.name];
            update();
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
    
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/Partner?client="+client+"&year="+year; } 
    //function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/Transfer?client="+client+"&year="+year; }
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
      
    let page = sheet[D_Page];
    let sheet_status = makeStatusData(sheet);
    let report = sheet_status.report;


    const tabName = "Overview";
    let pageText =  ['DashBoard', 'Patterns'].map((name) =>( page[name] ));
    let aPages = ['block'];
    for(let p=1;p<pageText.length;p++) aPages[p]='none'; 

    let bigSum = bigEUMoney(txn.balance);



    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={pageText}  tabName={tabName}> 
           
           <div className="FIELD" key={"Status"} id={'Overview0'} style= {{ 'display': aPages[0]}} >

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

            <div className="FIELD" key={"Einlage"} id={'Overview1'} style= {{ 'display': aPages[1]}} >
                <BookingRow  key={"EinlageGE"}  
                                            am1={0} tx1="K2GH" 
                                            am2={0} tx2="K2EH" 
                                            am3={0} tx3="COGK" 
                                            d="Einlage" refe="Komplementäre" sender="Elke u Georg"
                    />                       
                <BookingRow  key={"EinlageAL"}  
                                            am1={0} tx1="K2AL" 
                                            am2={0} tx2="COGK" 
                                            d="Einlage" sender="Alexander"
                    />                       
                <BookingRow  key={"EinlageKR"}  
                                            am1={0} tx1="K2KR" 
                                            am2={0} tx2="COGK" 
                                            d="Einlage" sender="Kristina"
                    />                       
                <BookingRow  key={"EinlageTO"}  
                                            am1={0} tx1="K2TO" 
                                            am2={0} tx2="COGK" 
                                            d="Einlage" sender="Tom"
                    />                       
                <BookingRow  key={"EinlageLE"}  
                                            am1={0} tx1="K2LE" 
                                            am2={0} tx2="COGK" 
                                            d="Einlage" sender="Leon"
                    />                       
                <BookingRow  key={"Miete"}  
                                            am1={0} tx1="MIET" 
                                            am2={0} tx2="COGK" 
                                            am3={0} tx3="NKHA" 
                                            d="Miete" refe="Nebenkosten"
                    />                       
                <BookingRow  key={"EntnahmeGE"}  
                                            d="Entnahme" refe="Komplementäre" sender="Elke u Georg"
                                            am5={0} tx5="K2GH" 
                                            am6={0} tx6="K2EH" 
                                            am7={0} tx7="COGK" 
                    />                       
                <BookingRow  key={"EntnahmeAL"}  
                                            d="Entnahme" sender="Alexander"
                                            am5={0} tx5="K2AL" 
                                            am6={0} tx6="COGK" 
                    />                       
                <BookingRow  key={"EntnahmeKR"}  
                                            d="Entnahme" sender="Kristina"
                                            am5={0} tx5="K2KR" 
                                            am6={0} tx6="COGK" 
                    />                       
                <BookingRow  key={"EntnahmeTO"}  
                                            d="Entnahme" sender="Tom"
                                            am5={0} tx5="K2TO" 
                                            am6={0} tx6="COGK" 
                    />                       
                <BookingRow  key={"EntnahmeLE"}  
                                            d="Entnahme" sender="Leon"
                                            am5={0} tx5="K2LE" 
                                            am6={0} tx6="COGK" 
                    />                       
                <BookingRow  key={"Aufwand"}  
                                            d="Aufwand" refe="Sofort" sender="Verkäufer"
                                            am5={0} tx5="AUFW" 
                                            am6={0} tx6="COGK" 
                    />                       
                <BookingRow  key={"Sacheinlage"}  
                                            am1={0} tx1="K2GH" 
                                            am2={0} tx2="K2EH" 
                                            d="Sacheinlage" refe="Elke u Georg" sender="Verkäufer"
                                            am5={0} tx5="AUFW" 
                    />                       
                <BookingRow  key={"Grundabgaben"}  
                                            d="Grundabgaben" refe="Quartal" sender="Stadt Erlangen"
                                            am5={0} tx5="NKHA" 
                                            am6={0} tx6="COGK" 
                    />                       
                <BookingRow  key={"Versicherung"}  
                                            d="Grundabgaben" refe="Jahr" sender="BayernVersicherung"
                                            am5={0} tx5="NKHA" 
                                            am6={0} tx6="COGK" 
                    />                       
                <BookingRow  key={"Aktien-Kauf"}  
                                            am1={0} tx1="CDAK" 
                                            d="INVEST" refe="Stückzahl" sender="WKN"
                                            am5={0} tx5="COGK" 
                    />                       
                <BookingRow  key={"Aktien-Dividende"}  
                                            am1={0} tx1="EDIV" 
                                            am2={0} tx2="COGK" 
                                            am3={0} tx3="KEST" 
                                            am4={0} tx4="KESO" 
                                            d="YIELD" refe="Stückzahl" sender="WKN"
                    />                       
                <BookingRow  key={"Aktien-Verkauf Gewinn"}  
                                            am1={0} tx1="FSAL" 
                                            am2={0} tx2="COGK" 
                                            am3={0} tx3="KEST" 
                                            am4={0} tx4="KESO" 
                                            d="SELL" refe="Stückzahl" sender="WKN"
                                            am5={0} tx5="CDAK" 
                    />                       
                <BookingRow  key={"Aktien-Verkauf Verlust"}  
                                            am1={0} tx1="VAVA" 
                                            am2={0} tx2="COGK" 
                                            d="SELL" refe="Stückzahl" sender="WKN"
                                            am5={0} tx5="CDAK" 
                    />                       
                <BookingRow  key={"Abschreibung Haus"}  
                                            d="AfA Haus" refe="Jahr" sender="Haus"
                                            am5={0} tx5="GRSB" 
                                            am6={0} tx6="ABSC" 
                    />                       
                <BookingRow  key={"Abschreibung EBKS"}  
                                            d="AfA Spülmaschine" refe="Jahr" sender="EBKS"
                                            am5={0} tx5="EBKS" 
                                            am6={0} tx6="ABSC" 
                    />                       
                <BookingRow  key={"Abschreibung Dach"}  
                                            d="AfA Dach" refe="Jahr" sender="DACH"
                                            am5={0} tx5="DACH" 
                                            am6={0} tx6="ABSC" 
                    />                       
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

function BookingRow({ am1,tx1, am2, tx2, am3, tx3, am4, tx4, am5, tx5, am6, tx6, am7, tx7,  d, refe, sender, click}) {
    return( 
        <div className="attrLine">
            <div className="FIELD SNAM"> {d}</div>
            <div className="FIELD TAG" > {tx1}</div>
            <div className="key MOAM"> {cents2EU(am1)}</div>
            <div className="FIELD TAG" > {tx2}</div>
            <div className="key MOAM"> {cents2EU(am2)}</div>
            <div className="FIELD TAG" > {tx3}</div>
            <div className="key MOAM"> {cents2EU(am3)}</div>
            <div className="FIELD TAG" > {tx4}</div>
            <div className="key MOAM"> {cents2EU(am4)}</div>
            <div className="key SNAM"> {sender}</div>
            <div className="key SNAM"> {refe}</div>
            <div className="FIELD TAG" > {tx5}</div>
            <div className="key MOAM"> {cents2EU(am5)}</div>
            <div className="FIELD TAG" > {tx6}</div>
            <div className="key MOAM"> {cents2EU(am6)}</div>
            <div className="FIELD TAG" > {tx7}</div>
            <div className="key MOAM"> {cents2EU(am7)}</div>
            <div className="SEP"></div>
            <div className="key">&nbsp;X&nbsp;</div>
        </div>
    )
}



