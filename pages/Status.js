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

// buildTransaction will generate the 
// flow format 
// "sender":SENDER,"reason":REASON,"credit":{"COGK":{"index":10,"value":"100,00"}},"debit":{"K2TO":{"index":33,"value":"100,00"}},"balance":""}
// this format is for AccountTemplateRow and the external book method

export default function Status() {
    
    const [sheet, setSheet]  = useState()
    const [ year, setYear]   = useState()
    const [client,setClient] = useState()
    const { session, status } = useSession()
    const [txn,setTxn] = useState({ 'date':"", 'sender':"Sender", 'refAcct':"", 'reason':"", 'refCode':"", 'credit':{},'debit':{}  })

    
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
      
    let page = sheet[D_Page];
    let sheet_status = makeStatusData(sheet);
    let report = sheet_status.report;


    const tabName = "Overview";
    let pageText =  ['Patterns', 'DashBoard'].map((name) =>( page[name] ));
    let aPages = ['block'];
    for(let p=1;p<pageText.length;p++) aPages[p]='none'; 


    return (
        <Screen prevFunc={noFunc} nextFunc={noFunc} tabSelector={pageText}  tabName={tabName}> 
           
            <div className="FIELD" key="Einlage" id={'Overview0'} style= {{ 'display': aPages[0]}} >
                <BookingRow  strKey="Miete"  
                                             tx1="MIET" 
                                             tx2="COGK" 
                                             tx3="NKHA" 
                                            sender="Vau / Ferguson" refAcct="MIET" refCode="Eifelweg 22"
                    />                       
                <BookingRow  strKey="Entnahme Kpl"  
                                            sender="Elke u Georg" refAcct="K2GH K2EH" refCode="WITHDRAW"
                                             tx5="K2GH" 
                                             tx6="K2EH" 
                                             tx7="COGK" 
                    />                       
                <BookingRow  strKey="Entnahme Alex"  
                                            sender="Alexander" refAcct="K2AL"  refCode="WITHDRAW"
                                             tx5="K2AL" 
                                             tx6="COGK" 
                    />                       
                <BookingRow  strKey="Entnahme Kristina"  
                                            sender="Kristina" refAcct="K2KR"  refCode="WITHDRAW"
                                             tx5="K2KR" 
                                             tx6="COGK" 
                    />                       
                <BookingRow  strKey="Entnahme Tom"  
                                            sender="Tom" refAcct="K2TO"  refCode="WITHDRAW"
                                             tx5="K2TO" 
                                             tx6="COGK" 
                    />                       
                <BookingRow  strKey="Entnahme Leon"  
                                            sender="Leon" refAcct="K2LE"  refCode="WITHDRAW"
                                             tx5="K2LE" 
                                             tx6="COGK" 
                    />                       
                <BookingRow  strKey="Aufwand"  
                                            sender="Verkäufer" refAcct="AUFW" refCode="Eifelweg22" 
                                             tx5="AUFW" 
                                             tx6="COGK" 
                    />                       
                <BookingRow  strKey="Sacheinlage Kpl"  
                                             tx1="K2GH" 
                                             tx2="K2EH" 
                                            sender="Verkäufer" refAcct="AUFW" refCode="DEP_IN_KIND" 
                                             tx5="AUFW" 
                    />                       
                <BookingRow  strKey="Grundabgaben"  
                                            sender="Stadt Erlangen" refAcct="NKHA" reason="Quartal" refCode="FEE"
                                             tx5="NKHA" 
                                             tx6="COGK" 
                    />                       
                <BookingRow  strKey="Versicherung"  
                                            sender="BayernVersicherung" refAcct="NKHA" reason="Jahr" refCode="FEE"
                                             tx5="NKHA" 
                                             tx6="COGK" 
                    />                       
                <BookingRow  strKey="Aktien-Kauf"  
                                             tx1="CDAK" 
                                            sender="WKN" refAcct="INVEST" reason="Stückzahl" refCode="Code"
                                             tx5="COGK" 
                    />                       
                <BookingRow  strKey="Bond-Kauf mit Stückzins"  
                                             tx1="CDAK" 
                                             tx2="FSTF" 
                                            sender="WKN" refAcct="INVEST" reason="Nominal" refCode="Code"
                                             tx5="COGK" 
                    />                       
                <BookingRow  strKey="Aktien-Dividende bar"  
                                             tx1="EDIV" 
                                             tx2="COGK" 
                                             tx3="KEST" 
                                             tx4="KESO" 
                                            sender="WKN" refAcct="EDIV" reason="Stückzahl" refCode="Code"
                    />                       
                <BookingRow  strKey="Dividende steuerfrei bar"  
                                             tx1="COGK" 
                                            sender="WKN" refAcct="YIELD" reason="Stückzahl" refCode="Code"
                                             tx5="CDAK" 
                    />                       
                <BookingRow  strKey="Dividende in Aktien steuerfrei"  
                                            sender="WKN" refAcct="INVEST" reason="Stückzahl" refCode="Code"
                    />                       
                <BookingRow  strKey="Dividende in Aktien steuerpflichtig"  
                                             tx1="EDIV" 
                                             tx2="KEST" 
                                             tx3="KESO" 
                                            sender="WKN" refAcct="INVEST" reason="Stückzahl" refCode="Code"
                    />                       
                <BookingRow  strKey="Aktien-Verkauf Gewinn"  
                                             tx1="FSAL" 
                                             tx2="COGK" 
                                             tx3="KEST" 
                                             tx4="KESO" 
                                            sender="WKN" refAcct="SELL" reason="Stückzahl" refCode="Code"
                                             tx5="CDAK" 
                    />                       
                <BookingRow  strKey="Aktien-Verkauf Verlust"  
                                             tx1="VAVA" 
                                             tx2="COGK" 
                                            sender="WKN" refAcct="SELL" reason="Stückzahl" refCode="Code"
                                             tx5="CDAK" 
                    />                       
                <BookingRow  strKey="Abschreibung Haus"  
                                            sender="Abschluss" refAcct="GRSB" reason="Jahr" refCode="Afa Haus"
                                             tx5="GRSB" 
                                             tx6="ABSC" 
                    />                       
                <BookingRow  strKey="Abschreibung EBKS"  
                                            sender="Abschluss" refAcct="EBKS"  reason="Jahr" refCode="AfA Spülmaschine"
                                             tx5="EBKS" 
                                             tx6="ABSC" 
                    />                       
                <BookingRow  strKey="Abschreibung Dach"  
                                            sender="Abschluss" refAcct="DACH"  reason="Jahr" refCode="AfA Dach" 
                                             tx5="DACH" 
                                             tx6="ABSC" 
                    />                       
                <BookingRow  strKey="Einlage Kpl"  
                                             tx1="K2GH" 
                                             tx2="K2EH" 
                                             tx3="COGK" 
                                            sender="Elke u Georg" refAcct="K2GH K2EH" refCode="DEPOSIT" 
                    />                       
                <BookingRow  strKey="Einlage Alex"  
                                             tx1="K2AL" 
                                             tx2="COGK" 
                                            sender="Alexander" refAcct="K2AL" refCode="DEPOSIT" 
                    />                       
                <BookingRow  strKey="Einlage Kristina"  
                                             tx1="K2KR" 
                                             tx2="COGK" 
                                            sender="Kristina" refAcct="Einlage" refCode="DEPOSIT" 
                    />                       
                <BookingRow  strKey="Einlage Tom"  
                                             tx1="K2TO" 
                                             tx2="COGK" 
                                            sender="Tom" refAcct="K2TO" refCode="DEPOSIT" 
                    />                       
                <BookingRow  strKey="Einlage Leon"  
                                             tx1="K2LE" 
                                             tx2="COGK" 
                                            sender="Leon" refAcct="K2LE" refCode="DEPOSIT" 
                    />                       
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






function BookingRow({ strKey, tx1,  tx2, tx3,  tx4, tx5, tx6, tx7, reason, refAcct, sender, refCode}) {

    // FILL FORM INITIALLY !!  -- no change event if values already exist from previous booking
    if(!form[strKey]) form[strKey]={ 'CREDIT':{},'DEBIT':{} };
    let record=form[strKey];
    record.sender=sender;
    record.reason=reason;
    record.refAcct=refAcct;
    record.refCode=refCode;



    return( <div><div className="attrLine"></div>
        <div className="attrLine">
            <div className="FIELD LTXT"> {strKey}</div>

            <div className="FIELD NAME">
                <input id="dateBooked" type="date" defaultValue={record.date} onChange={((e) => bufferField(strKey,'date',e.target.value))}/>
            </div>

            <div className="FIELD SYMB" >Sender</div>
            <input type ="text" className="key MOAM" defaultValue={record.sender} onChange={((e) => bufferField(strKey,'sender',e.target.value))}/>
            <div className="FIELD TAG" ></div>

            <div className="FIELD SYMB" >Zeitraum</div>
            <input type ="text" className="key MOAM" defaultValue={record.reason} onChange={((e) => bufferField(strKey,'reason',e.target.value))}/>
            <div className="FIELD TAG" ></div>

            <div className="FIELD SYMB" >Grund</div>
            <input type ="text" className="key MOAM" defaultValue={record.refCode} onChange={((e) => bufferField(strKey,'refCode',e.target.value))}/>
            <div className="FIELD TAG" ></div>
        </div>


        <div className="attrLine">

        {(tx1) ? ( <div>
            <div className="FIELD TAG" > {tx1}</div>
            <input type ="number" className="key MOAM" onChange={((e) => bufferAmount(strKey,tx1,e.target.value,'CREDIT'))}/>
            <div className="FIELD TAG" ></div>
        </div>):''}
            
        {(tx2) ? ( <div>
            <div className="FIELD TAG" > {tx2}</div>
            <input type ="number" className="key MOAM" onChange={((e) => bufferAmount(strKey,tx2,e.target.value,'CREDIT'))}/>
            <div className="FIELD TAG" ></div>
        </div>):''}

        {(tx3) ? ( <div>
            <div className="FIELD TAG" > {tx3}</div>
            <input type ="number" className="key MOAM" onChange={((e) => bufferAmount(strKey,tx3,e.target.value,'CREDIT'))}/>
            <div className="FIELD TAG" ></div>
        </div>):''}

        {(tx4) ? ( <div>
            <div className="FIELD TAG" > {tx4}</div>
            <input type ="number" className="key MOAM" onChange={((e) => bufferAmount(strKey,tx4,e.target.value,'CREDIT'))}/>
            <div className="FIELD TAG" ></div>
        </div>):''}

        <div className="FIELD TAG" >AN</div>
            
        {(tx5) ? ( <div>
            <div className="FIELD TAG"> {tx5}</div>
            <input type ="number" className="key MOAM" onChange={((e) => bufferAmount(strKey,tx5,e.target.value,'DEBIT'))}/>
            <div className="FIELD TAG" ></div>
        </div>):''}

        {(tx6) ? ( <div>
            <div className="FIELD TAG"> {tx6}</div>
            <input type ="number" className="key MOAM" onChange={((e) => bufferAmount(strKey,tx6,e.target.value,'DEBIT'))}/>
            <div className="FIELD TAG" ></div>
        </div>):''}

        {(tx7) ? ( <div>
            <div className="FIELD TAG"> {tx7}</div>
            <input type ="number" className="key MOAM" onChange={((e) => bufferAmount(strKey,tx7,e.target.value,'DEBIT'))}/>
        </div>):''}

        <div className="FIELD TAG" ></div>
            <button className="key" onClick={(() => doBook(strKey))}>Buchen</button>
        </div>
    </div>)
}


let form={};
// side = DEBIT or CREDIT
function bufferAmount(strKey,field,value,side) {
    console.log("in "+strKey+ " change amount "+field+" to "+value+" at "+side);    
    let record = form[strKey];
    record[side][field]=value;
}

function bufferField(strKey,field,value) {
    console.log("in "+strKey+ " change field "+field+" to "+value);    
    let record = form[strKey];
    record[field]=value;
}


function doBook(strKey) {
    console.log("Book "+strKey);
    if(form[strKey]) {
        console.log("Book "+JSON.stringify(form[strKey]))
    }
}

