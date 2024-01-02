import { useEffect, useState } from 'react';
import { getSession, storeCarryOver, useSession, REACT_APP_API_HOST } from '../modules/sessionmanager';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { cents2EU,bigUSMoney }  from '../modules/money';
import { D_Balance, D_Page, D_Partner, D_Schema, X_ASSET_CAPTAX } from '../modules/terms.js'
import { book,prepareTXN }  from '../modules/writeModule';
import { makeStatusData }  from '../modules/App';

// the ORIGINAL FORMAT from journal sheet is 
// columns format CSV with these columns 
// HASH DATE SENDER REFACCT REASON REFCODE GRSB EBKS CDAK COGK FSTF NKFO KEST KESO VAVA - 

/* global BigInt */

// matrix format 
// { 'date':"", 'sender':"Sender", 'refAcct':"", 'reason':"", 'refCode':"", 'debit':{'name':VALUE}, credit:{ 'name':VALUE},'txt2':"Absender",'txt3':"Zeit",'txt4':"Objekt"}

// buildTransaction will generate the 
// flow format 
// "sender":SENDER,"reason":REASON,"credit":{"COGK":{"index":10,"value":"100,00"}},"debit":{"K2TO":{"index":33,"value":"100,00"}},"balance":""}
// this format is for AccountTemplateRow and setTxnthe external book method

export default function Status() {
    

    const predefinedTXN = {
       /* 
    "Miete E22":{"text":"Mieter* überweist Miete mit Nebenkosten auf das Firmenkonto","creditEQL":{},"credit":{"COGK":"1390"},"debit":{"MIET":"1290","NKHA":"100"},"debitA":{},"sender":"Ferguson","refAcct":"MIET","refCode":"Eifelweg 22","txt2":"Mieter","txt3":"M 2023","txt4","Objekt"},
    "Miete Gar":{"text":"Mieter* überweist Miete auf das Firmenkonto","creditEQL":{},"credit":{"COGK":"52"},"debit":{"MIET":"52"},"debitA":{},"sender":"Vau","refAcct":"MIET","refCode":"Garage"},
    "Entnahme Kpl":{"text":"Elke u Georg bekommen Geld vom Firmenkonto","creditEQL":{"K2GH":"0","K2EH":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Elke u Georg","refAcct":"K2GH K2EH","refCode":"WITHDRAW"},
    "Entnahme Alex":{"text":"Alex bekommt Geld vom Firmenkonto","creditEQL":{"K2AL":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Alexander","refAcct":"K2AL","refCode":"WITHDRAW"},
    "Entnahme Kristina":{"text":"Tina bekommt Geld vom Firmenkonto","creditEQL":{"K2KR":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Kristina","refAcct":"K2KR","refCode":"WITHDRAW"},
    "Entnahme Tom":{"text":"Tom bekommt Geld vom Firmenkonto","creditEQL":{"K2TO":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Tom","refAcct":"K2TO","refCode":"WITHDRAW"},
    "Entnahme Leon":{"text":"Leon bekommt Geld vom Firmenkonto","creditEQL":{"K2LE":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Leon","refAcct":"K2LE","refCode":"WITHDRAW"},
    "Bildung Rücklage":{"text":"Die Gesellschafter bilden eine Rücklage","creditEQL":{"K2GH":"1000","K2EH":"1000","K2AL":"1000","K2KR":"1000","K2TO":"1000"},"credit":{},"debit":{"REGH":"1000","REEH":"1000","REAL":"1000","REKR":"1000","RETO":"1000"},"debitA":{},"sender":"Rücklage","refAcct":"RExx","refCode":"WITHDRAW"},
    "Aufwand":{"text":"Kleinerer Aufwand zur Instandhaltung der Mietsache (Ersatzteil,Reparatur,Dienstleistung) wird vom Firmenkonto bezahlt","creditEQL":{"AUFW":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Verkäufer","refAcct":"AUFW","refCode":"Eifelweg22"},
    "Kontogebühren":{"text":"nicht-umlagefähige Gebühren werden vom Firmenkonto bezahlt","creditEQL":{"AUFW":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Consorsbank","refAcct":"AUFW","refCode":"Eifelweg22"},
    "Gebühren Kapitalverkehr":{"text":"Gebühren die sich auf Finanzkapital beziehen, werden vom Firmenkonto bezahlt","creditEQL":{"NKG":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Bundesanzeiger-Verlag","refAcct":"NKG","refCode":"Kosten Kap."},
    "Sacheinlage Komplementäre":{"text":"Mietaufwand wird als Sacheinlage geleistet, z.B. Teile vom Baumarkt","creditEQL":{"AUFW":"0"},"credit":{},"debitA":{},"debit":{"K2GH":"0","K2EH":"0"},"sender":"Verkäufer","refAcct":"AUFW","refCode":"DEP_IN_KIND"},
    "Grundabgaben":{"text":"Stadt Erlangen zieht Grundabgaben ein","creditEQL":{"NKHA":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Stadt Erlangen","reason":"Quartal","refAcct":"NKHA","refCode":"FEE"},
    "Versicherung":{"text":"Versicherung zieht Beitrag ein","creditEQL":{"NKHA":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"BayernVersicherung","reason":"Jahr","refAcct":"NKHA","refCode":"FEE"},
    "IHK-Beitrag":{"text":"IHK-Erlangen bekommt Jahresbeitrag","creditEQL":{"AUFW":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"IHK Nürnberg","reason":"Quartal","refAcct":"NKHA","refCode":"FEE"},
    "Aktien-Kauf":{"text":"Aktien mit Kaufkosten werden gekauft und bezahlt; der Kurswert und alle Gebühren werden aktiviert.","creditEQL":{},"credit":{"CDAK":"0"},"debit":{},"debitA":{"COGK":"0"},"sender":"WKN","reason":"Stückzahl","refAcct":"INVEST","refCode":"Code"},
    "Bond-Kauf mit Stückzins":{"text":"Bonds mit Kaufkosten und Stückzins werden gekauft und bezahlt","creditEQL":{},"credit":{"CDAK":"0","FSTF":"0"},"debit":{},"debitA":{"COGK":"0"},"sender":"WKN","reason":"Nominal","refAcct":"INVEST","refCode":"Code"},
    "Aktien-Dividende bar":{"text":"Dividende wird versteuert und auf das Firmenkonto überwiesen","creditEQL":{},"credit":{"COGK":"0","KEST":"0","KESO":"0"},"debit":{"EDIV":"0"},"debitA":{},"sender":"WKN","reason":"Stückzahl","refAcct":"YIELD","refCode":"Code"},
    "Dividende steuerfrei bar":{"text":"steuerfreie Dividende reduziert Anschaffungskosten","creditEQL":{},"credit":{"COGK":"0"},"debit":{},"debitA":{"CDAK":"0"},"sender":"WKN","reason":"Stückzahl","refAcct":"YIELD","refCode":"Code"},
    "Dividende in Aktien steuerfrei":{"text":"steuerfreie Gratisaktien reduzieren Anschaffungskosten","creditEQL":{},"credit":{},"debit":{},"debitA":{},"sender":"WKN","reason":"Stückzahl","refAcct":"INVEST","refCode":"Code"},
    "Zins auf Bonds steuerpflichtig":{"text":"Zins auf Festgeld wird versteuert","creditEQL":{},"credit":{"COGK":"0","KEST":"0","KESO":"0"},"debit":{"EZIN":"0"},"debitA":{},"sender":"WKN","reason":"Stückzahl","refAcct":"YIELD","refCode":"Code"},
    "Bond-Zins verr mit Stückzins":{"text":"Forderung aus Stückzins bei Bondkauf wird mit Zins auf Festgeld verrechnet","creditEQL":{"EZIN":"0"},"credit":{},"debit":{},"debitA":{"FSTF":"0"},"sender":"WKN","reason":"Stückzahl","refAcct":"EZIN","refCode":"Code"},
    "Dividende in Aktien steuerpflichtig":{"text":"Gratisaktien werden versteuert","creditEQL":{},"credit":{"KEST":"0","KESO":"0"},"debit":{"EDIV":"0"},"debitA":{},"sender":"WKN","reason":"Stückzahl","refAcct":"INVEST","refCode":"Code"},
    "Aktien-Verkauf mit Gewinn":{"text":"Aktien werden mit Gewinn verkauft","creditEQL":{},"credit":{"COGK":"0","KEST":"0","KESO":"0"},"debit":{"FSAL":"0"},"debitA":{"CDAK":"0"},"sender":"WKN","reason":"Stückzahl","refAcct":"SELL","refCode":"Code"},
    "Aktien-Verkauf mit Verlust":{"text":"Aktien werden mit Verlust verkauft; der Kurswert abzgl Gebühren geht auf das Firmenkonto","creditEQL":{},"credit":{"VAVA":"0","COGK":"0"},"debit":{},"debitA":{"CDAK":"0"},"sender":"WKN","reason":"Stückzahl","refAcct":"SELL","refCode":"Code"},
    "Ausgleich Aktien-Verluste":{"text":"Für Aktienverkäufe im selben Jahr gilt: Gewinne tilgen Verluste","creditEQL":{"FSAL":"0"},"credit":{},"debit":{},"debitA":{"VAVA":"0"},"sender":"Ausgleich","reason":"Verluste","refAcct":"VAVA","refCode":"VK Aktien"},
    "Pfandzahlung":{"text":"Die KG zahlt vom Firmenkonto eine Sicherheit","creditEQL":{},"credit":{"FSTF":"0"},"debit":{},"debitA":{"COGK":"0"},"sender":"","reason":"","refAcct":"NKHA","refCode":"AZ"},
    "Rückerstattung Pfand":{"text":"Die KG erhält die Sicherheit auf das Firmenkonto zurück","creditEQL":{},"credit":{"COGK":"0"},"debit":{},"debitA":{"FSTF":"0"},"sender":"","reason":"","refAcct":"NKHA","refCode":"AZ"},
    "Nicht-umlagefähige NK":{"text":"Eröffnung: Nebenkosten werden um nicht-umlagefähige Teile reduziert zB Versicherungsanteil f Garage","creditEQL":{"AUFW":"0"},"credit":{},"debit":{"NKHA":"0"},"debitA":{},"sender":"Ferguson","reason":"Abschluss","refAcct":"NKHA","refCode":"Versicherung Garage"},
    "Zins auf Kaution":{"text":"Eröffnung: Zins wird auf die Kaution gutgeschrieben","creditEQL":{"AUFW":"0"},"credit":{},"debit":{"NKHA":"0"},"debitA":{},"sender":"Ferguson","reason":"Abschluss","refAcct":"NKHA","refCode":"Zins auf Kaution"},
    "Forderung Nebenkosten":{"text":"Abschluss: Unbezahlte Nebenkosten werden als Forderung an Mieter* gebucht","creditEQL":{},"credit":{"NKFO":"0"},"debit":{"NKHA":"0"},"debitA":{},"sender":"Nebenkosten","reason":"Abschluss","refAcct":"NKHA","refCode":"Abrechnung"},
    "Mieter zahlt Nebenkosten":{"text":"Mieter* überweist Nebenkosten auf das Firmenkonto","creditEQL":{},"credit":{"COGK":"0"},"debitA":{"NKFO":"0"},"debit":{},"sender":"Ferguson","reason":"Vorjahr","refAcct":"NKHA","refCode":"Nachzahlung"},
    "Erstattung Nebenkosten":{"text":"KG erstattet überzahlte Nebenkosten an Mieter*","creditEQL":{"NKHA":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Nebenkosten","reason":"Vorjahr","refAcct":"NKHA","refCode":"Überschuss"},
    "nicht abzugsfäh.Aufwand":{"text":"Abschluss: nicht abzugsfähige Aufwände werden anteilig den Gesellschaftern abgezogen","creditEQL":{"K2GH":"0","K2EH":"0","K2AL":"0","K2KR":"0","K2TO":"0"},"credit":{},"debit":{"NKG":"0"},"debitA":{},"sender":"Abschluss","reason":"Jahr","refAcct":"K2LE","refCode":"WITHDRAW"},
    "Abschreibung Haus":{"text":"Abschluss: Abschreibung des Hauses im Eifelweg 22 -2%","creditEQL":{"ABSC":"2430"},"credit":{},"debitA":{"GRSB":"0"},"debit":{},      "sender":"Haus",       "reason":"1","refAcct":"YIELD","refCode":"Eifelweg22"},
    "Abschreibung Dach":{"text":"Abschluss: Abschreibung des Dachs im Eifelweg 22 -4%","creditEQL":{"ABSC":"666.40"},"credit":{},"debitA":{"DACH":"0"},"debit":{},     "sender":"Gebäudeteil","reason":"1","refAcct":"YIELD","refCode":"Dacheindeckung"},
    "Abschreibung Spülm":{"text":"Abschluss: Abschreibung der Spülmaschine im Eifelweg 22 -10%","creditEQL":{"ABSC":"47"},"credit":{},"debitA":{"EBKS":"0"},"debit":{},"sender":"Gebäudeteil","reason":"1","refAcct":"YIELD","refCode":"Spülmaschine2018"},
    "Einlage Kpl":{"text":"Elke u Georg zahlen auf Firmenkonto ein","creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"K2GH":"0","K2EH":"0"},"sender":"Elke u Georg","refAcct":"K2GH K2EH","refCode":"DEPOSIT"},
    "Einlage Alex":{"text":"Alex zahlt auf Firmenkonto ein","creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"K2AL":"0"},"sender":"Alexander","refAcct":"K2AL","refCode":"DEPOSIT"},
    "Einlage Kristina":{"text":"Tina zahlt auf Firmenkonto ein","creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"K2KR":"0"},"sender":"Kristina","refAcct":"K2KR","refCode":"DEPOSIT"},
    "Einlage Tom":{"text":"Tom zahlt auf Firmenkonto ein","creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"K2TO":"0"},"sender":"Tom","refAcct":"K2TO","refCode":"DEPOSIT"},
    "Einlage Leon":{"text":"Leon zahlt auf Firmenkonto ein","creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"K2LE":"0"},"sender":"Leon","refAcct":"K2LE","refCode":"DEPOSIT"},
    "Sach-Entnahme Kpl":{"text":"Elke u Georg entnehmen Sache","creditEQL":{"K2GH":"0","K2EH":"0"},"credit":{},"debit":{},"debitA":{"FSTF":"0"},"sender":"Elke u Georg","refAcct":"K2GH K2EH","refCode":"WITHDRAW"},
    "Sach-Entnahme Alex":{"text":"Alex entnimmt Sache","creditEQL":{"K2AL":"0"},"credit":{},"debit":{},"debitA":{"FSTF":"0"},"sender":"Alexander","refAcct":"K2AL","refCode":"WITHDRAW"},
    "Sach-Entnahme Kristina":{"text":"Tina entnimmt Sache","creditEQL":{"K2KR":"0"},"credit":{},"debit":{},"debitA":{"FSTF":"0"},"sender":"Kristina","refAcct":"K2KR","refCode":"WITHDRAW"},
    "Sach-Entnahme Tom":{"text":"Tom entnimmt Sache","creditEQL":{"K2TO":"0"},"credit":{},"debit":{},"debitA":{"FSTF":"0"},"sender":"Tom","refAcct":"K2TO","refCode":"WITHDRAW"},
    "Sach-Entnahme Leon":{"text":"Leon entnimmt Sache","creditEQL":{"K2LE":"0"},"credit":{},"debit":{},"debitA":{"FSTF":"0"},"sender":"Leon","refAcct":"K2LE","refCode":"WITHDRAW"},
    "Sicherheit Kpl":{"text":"Elke u Georg stellen Sicherheit gg Dritte","creditEQL":{},"credit":{"FSTF":"0"},"debitA":{},"debit":{"K2GH":"0","K2EH":"0"},"sender":"Ext","refAcct":"K2GH K2EH","refCode":"DEPOSIT"},
    "Sicherheit Alex":{"text":"Alex stellt Sicherheit bei Drittem","creditEQL":{},"credit":{"FSTF":"0"},"debitA":{},"debit":{"K2AL":"0"},"sender":"Ext","refAcct":"K2AL","refCode":"DEPOSIT"},
    "Sicherheit Kristina":{"text":"Tina stellt Sicherheit bei Drittem","creditEQL":{},"credit":{"FSTF":"0"},"debitA":{},"debit":{"K2KR":"0"},"sender":"Ext","refAcct":"K2KR","refCode":"DEPOSIT"},
    "Sicherheit Tom":{"text":"Tom stellt Sicherheit bei Drittem","creditEQL":{},"credit":{"FSTF":"0"},"debitA":{},"debit":{"K2TO":"0"},"sender":"Ext","refAcct":"K2TO","refCode":"DEPOSIT"},
    "Sicherheit Leon":{"text":"Leon stellt Sicherheit bei Drittem","creditEQL":{},"credit":{"FSTF":"0"},"debitA":{},"debit":{"K2LE":"0"},"sender":"Ext","refAcct":"K2LE","refCode":"DEPOSIT"}   
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
        <div className = "mTable">
            <div className = "attrLine">
                <div className="FIELD XFER">Authenticate:...</div>
                <div className="FIELD"><input key="auth" id="auth" type="edit"></input></div>
                <div className="FIELD"><div key="go" className="key" onClick={login}>&nbsp;LOGIN &nbsp;</div>
                </div>
            </div>        
        </div>        
    );



    
    function noFunc() {  console.log("CLICK NO");  }
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/HGB275S2Page?client="+client+"&year="+year; } 
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

    // generate FLOW FORMAT for booking
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

        book(jTXN,session); // reloads page

        console.log("bookTemplate:  booked.");  
    }

    function getLastAccount(form) {
        let arrCreditEQL = Object.keys(form.creditEQL);
        let arrCredit = Object.keys(form.credit);
        let arrDebitA = Object.keys(form.debitA);
        let arrDebit = Object.keys(form.debit);
    
        return (arrCreditEQL.concat( arrCredit.concat( arrDebit.concat( arrDebitA)))).pop();

    }
    
    function preBook(strKey) {
        
        console.log("preBook ENTER strKey="+strKey);

        let record = matrix[strKey];
        record.title=strKey;
        
        let autoAcct = getLastAccount(record);
        
        Object.keys(record.debit).forEach((acct)=>{if(acct==autoAcct) record.debit[acct]="0"})
        Object.keys(record.debitA).forEach((acct)=>{if(acct==autoAcct) record.debitA[acct]="0"})
        Object.keys(record.credit).forEach((acct)=>{if(acct==autoAcct) record.credit[acct]="0"})
        Object.keys(record.creditEQL).forEach((acct)=>{if(acct==autoAcct) record.creditEQL[acct]="0"})
        
        let jTXN = buildTransaction(record);
        console.log("preBook jTXN="+JSON.stringify(jTXN));

        Object.keys(record.debit).forEach((acct)=>{if(acct==autoAcct) record.debit[acct]=jTXN.usBalance})
        Object.keys(record.debitA).forEach((acct)=>{if(acct==autoAcct) record.debitA[acct]=jTXN.usBalance})
        Object.keys(record.credit).forEach((acct)=>{if(acct==autoAcct) record.credit[acct]=jTXN.usBalance})
        Object.keys(record.creditEQL).forEach((acct)=>{if(acct==autoAcct) record.creditEQL[acct]=jTXN.usBalance})


        setDisplayRecord(JSON.parse(JSON.stringify(record)));
        console.log("preBook record="+JSON.stringify(record));
    }

    
    function doBook(strKey) {
        console.log("Book "+strKey);
        if(matrix[strKey]) {
            let txn = matrix[strKey];

            console.log("Book FORM "+JSON.stringify());

            let jTXN = buildTransaction(txn);


            if(!jTXN.euBalance || jTXN.euBalance=='') {

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



    function BookingForm({ strKey, form, preBook }) {

        let arrCreditEQL = Object.keys(form.creditEQL);
        let arrCredit = Object.keys(form.credit);
        let arrDebitA = Object.keys(form.debitA);
        let arrDebit = Object.keys(form.debit);

        let autoAcct = getLastAccount(form);
 
        let txt2='Sender'; if(form.txt2) txt2=form.txt2;
        let txt3='Zeit'; if(form.txt3) txt3=form.txt3;
        let txt4='Grund'; if(form.txt4) txt4=form.txt4;
        

        console.log("FORM = "+JSON.stringify(form));

        return( <div><div className="attrLine"></div>
            <div className="attrLine">
                <div className="FIELD L280"> {strKey}</div>
            </div>
            
            
            <div className="attrLine">
                <div className="FIELD FLEX"> {matrix[strKey].text}</div>
            </div>

            
            <div className="attrLine">
            {(autoAcct && autoAcct.length>0) ? 
                (<div className="FIELD L280"> Der Betrag in {autoAcct} wird berechnet.</div>)
                :
                (<div className="FIELD L280"> Sachbuchung</div>)
            }
            </div>
            

            <div className="attrLine">
                
    
                <div className="FIELD TAG" >Datum</div>
                <div className="FIELD NAME">
                    <input  className="key SNAM" id="dateBooked" type="date" defaultValue={form.date} onChange={((e) => bufferField(strKey,'date',e.target.value))}/>
                </div>
    
                        
                <div className="FIELD SYMB" >{txt2}</div>
                <input type ="text" className="key MOAM" defaultValue={form.sender} onChange={((e) => bufferField(strKey,'sender',e.target.value))}/>
                <div className="FIELD SEP" ></div>
    
                <div className="FIELD SYMB" >{txt3}</div>
                <input type ="text" className="key MOAM" defaultValue={form.reason} onChange={((e) => bufferField(strKey,'reason',e.target.value))}/>
                <div className="FIELD SEP" ></div>
    
                <div className="FIELD SYMB" >{txt4}</div>
                <input type ="text" className="key MOAM" defaultValue={form.refCode} onChange={((e) => bufferField(strKey,'refCode',e.target.value))}/>
                <div className="FIELD SEP" ></div>
                
            </div>
            <div className="attrLine">
      
                {arrCredit.map((acct,line)=>(
                    (<div key={"credit"+line}  >
                        <div className="FIELD TAG" > {acct}</div>
                        { acct!=autoAcct ? (<input type ="number" className="key MOAM" defaultValue={form.credit[acct]} onChange={((e) => bufferAmount(strKey,acct,e.target.value,'credit'))} /> ):''}
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                 {arrCreditEQL.map((acct,line)=>(
                    (<div key={"creditEqL"+line}  >
                        <div className="FIELD TAG" > {acct}</div>
                        { acct!=autoAcct ? (<input type ="number" className="key MOAM" defaultValue={form.creditEQL[acct]} onChange={((e) => bufferAmount(strKey,acct,e.target.value,'creditEQL'))} /> ):''} 
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                <div className="FIELD TAG" >AN</div>
                {arrDebit.map((acct,line)=>(
                    (<div key={"debit"+line}  >
                        <div className="FIELD TAG" > {acct}</div>
                        { acct!=autoAcct ? (<input type ="number" className="key MOAM" defaultValue={form.debit[acct]} onChange={((e) => bufferAmount(strKey,acct,e.target.value,'debit'))} /> ):''}  
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                {arrDebitA.map((acct,line)=>(
                    (<div key={"debitA"+line}  >
                        <div className="FIELD TAG" > {acct}</div>
                        { acct!=autoAcct ? (<input type ="number" className="key MOAM" defaultValue={form.debitA[acct]} onChange={((e) => bufferAmount(strKey,acct,e.target.value,'debitA'))} /> ):''}
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

        let autoAcct = getLastAccount(form);

        let txt2='Sender'; if(form.txt2) txt2=form.txt2;
        let txt3='Zeit'; if(form.txt3) txt3=form.txt3;
        let txt4='Grund'; if(form.txt4) txt4=form.txt4;


        return( <div><div className="attrLine"></div>
            <div className="attrLine">
                <div className="FIELD L280"> {form.title}</div>
    
                <div className="FIELD NAME">
                <div className="FIELD DATE" >{form.date}</div>
                </div>
                        
                <div className="FIELD SYMB" >{txt2}</div>
                <div className="FIELD TEAM" >{form.sender}</div>
                <div className="FIELD SEP" ></div>
    
                <div className="FIELD SYMB" >{txt3}</div>
                <div className="FIELD TEAM" >{form.reason}</div>
                <div className="FIELD SEP" ></div>
    
                <div className="FIELD SYMB" >{txt4}</div>
                <div className="FIELD TEAM" >{form.refCode}</div>
                <div className="FIELD SEP" ></div>
                
                <div className="FIELD SYMB" >Balance</div>
                <div className="FIELD TEAM" >{form.euBalance}</div>
                <div className="FIELD SEP" ></div>
            </div>
            <div className="attrLine">
      
                {arrCredit.map((acct,line)=>(
                    (<div key={"disp_credit"+line}  >
                        <div className="FIELD TAG" > {acct}</div>
                        <div className="FIELD MOAM" >{form.credit[acct]}</div>
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                {arrCreditEQL.map((acct,line)=>(
                    (<div key={"disp_creditEqL"+line}  >
                        <div className="FIELD TAG" > {acct}</div>
                        <div className="FIELD MOAM" >{form.creditEQL[acct]}</div>
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                <div className="FIELD TAG" > AN </div>
                {arrDebit.map((acct,line)=>(
                    (<div key={"disp_debit"+line}  >
                        <div className="FIELD TAG" > {acct}</div>
                        <div className="FIELD MOAM" >{form.debit[acct]}</div>
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                {arrDebitA.map((acct,line)=>(
                    (<div key={"disp_debitA"+line}  >
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
      

    /*
     compute Partner capital and tax data
    */

     var jBalance = sheet[D_Balance];

    function makeTax(partner,index) {
        var ifix=0n; // ifix are cents to compensate for rounding when tax is shared among partners
        let igain=BigInt(partner.gain);
        let ideno=BigInt(partner.denom);               
        let taxID = partner.taxID;
        let result= { 'name': partner.name, 'SteuerID':taxID,  };

        let taxPaid = BigInt(partner.tax);
        var iSum=0n;
        while(iSum<taxPaid && ifix<20n) {
            iSum=0n;
            var cFix=ifix;
            let taxAccounts = Object.keys(jBalance).filter((name)=>jBalance[name].xbrl==X_ASSET_CAPTAX); // GH20230124
            taxAccounts.map(function(name) { 
                    let iPosition = 4n + BigInt(jBalance[name].yearEnd+"0");
                    if(iSum+cFix>=taxPaid) cFix=0n;
                    let iShare = cFix+(iPosition*igain/ideno/10n);
                    if(cFix>0) cFix--;
                    iSum = iSum + iShare;
                    result[name] = cents2EU(iShare)})
            ifix++;
        } 

        console.log("Partner("+index+") with "+igain+"/"+ideno+" from gain ="+iSum+" % "+taxPaid);
        return result;
    }

    function reduceCapital(partner,deficit,index) {
        var ifix=0n; // ifix are cents to compensate for rounding when capital deficit is shared among partners
        let igain=BigInt(partner.gain);
        let ideno=BigInt(partner.denom);               

        let cyLoss =partner.cyLoss;
        var iSum=0n;
        while(iSum<cyLoss && ifix<20n) {
            iSum=0n;
            var cFix=ifix;
            let deficitAccounts = Object.keys(jBalance).filter((name)=>jBalance[name].xbrl==X_ASSET_UNPCAP); // GH20230124
            deficitAccounts.map(function(name) { 
                    let iPosition = 4n + BigInt(jBalance[name].yearEnd+"0");
                    if(iSum+cFix>=cyLoss) cFix=0n;
                    let iShare = cFix+(iPosition*igain/ideno/10n);
                    if(cFix>0) cFix--;
                    iSum = iSum + iShare;
                    deficit[name] = cents2EU(iShare)})
            ifix++;
        } 

        console.log("Partner("+index+") with "+igain+"/"+ideno+" from deficit ="+iSum+" % "+cyLoss);
        return deficit;
    }



    var jPartnerReport = JSON.parse(JSON.stringify(sheet[D_Partner]));
    let  taxDetails=[];
    Object.keys(jPartnerReport).map((index) => (taxDetails.push(reduceCapital(jPartnerReport[index],makeTax(jPartnerReport[index],index)))));
    let  taxHeaders=[];
    let hKeys=Object.keys(taxDetails[0]);
    taxHeaders.push(  hKeys );

/*
   build main page
*/

    let page = sheet[D_Page];
    let sheet_status = makeStatusData(sheet);
    let report = sheet_status.report;


    let fixPages=0;

    // portal page
    let tabHeaders=['Dashboard']; fixPages++;

    // partner pages
    Object.keys(jPartnerReport).forEach((p,i)=>{
        tabHeaders.push('Steuer '+jPartnerReport[i].name); 
        fixPages++; // partner page
    })

    // form pages
    if(matrix)  Object.keys(matrix).forEach((form)=>{tabHeaders.push(form)});



    let aPages = [];
    aPages[0] = 'block';
    let numPages = fixPages+tabHeaders.length; 
    for(let p=1;p<numPages;p++) aPages[p]='none'; 


    const tabName = "Overview";
    
    return (
        <Screen prevFunc={noFunc} nextFunc={noFunc} tabSelector={tabHeaders}  tabName={tabName}> 
           

            
            <div className="FIELD" key={"Dashboard"} id={'Overview0'} style= {{ 'display': aPages[0]}} >
                <StatusRow am1={page.Assets} am2={page.Gain}  am3={page.eqliab}/>
                {
                    report.map((row,line) => (
                        <StatusRow  key={"Status"+line}  
                                            am1={row.gLeft} tx1={row.nLeft} 
                                            am2={row.gMidl} tx2={row.nMidl} 
                                            am3={row.gRite} tx3={row.nRite} 
                                            d={row.dTran} n={row.nTran} l={row.lTran}
                                            click={(line==0)?handleReview:null}/>                       
                    ))
                }
            </div>




            {Object.keys(jPartnerReport).map((jPartner,partnerNo) => ( 

                <div className="FIELD" key={"Partner"+partnerNo} id={'Overview'+(1+partnerNo)} style= {{ 'display': aPages[partnerNo+1]}} >
                        
                        <div className="attrLine"></div>

                        <PartnerTitleRow p={ {'name':page.Name, 
                            'init':page.Init, 
                            'credit':page.Credit,
                            'debit':page.Debit,
                            'yearEnd':page.YearEnd,
                            'netIncomeOTC':page.RegularOTC,
                            'netIncomeFin':page.RegularFIN,
                            'close':page.Close,
                            'tax':page.PaidTax,
                            'cyLoss':page.SecLosses,
                            'next':page.NextYear} } />     

                        <PartnerRow p={jPartnerReport[partnerNo]}/>    
    
                </div>

            ))}


            {matrix ? Object.keys(matrix).map((strKey,index)=>( 
                <div className="FIELD" key={"Form"+index} id={'Overview'+(index+fixPages)} style= {{ 'display': aPages[index+fixPages+6]}} > 
                    <div className="attrLine"/>
                    
                    <BookingForm    strKey={strKey}  form={matrix[strKey]} preBook={preBook} />
                    <BookingDisplay strKey={strKey}  form={displayRecord}  doBook={doBook} /> 
                </div>
            )) : ""}
        
            
            <div className="attrLine"/>
            <div className="attrLine"/>

            <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc} miscFunc={handleXLSave} miscText="Get XLSX"/>
            <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc} miscFunc={handleXLSave} miscText="Get XLSX"/>
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

function PartnerRow(mRow) {
    console.log("PartnerRow mRow="+JSON.stringify(mRow));
    return (
        <div className="attrLine">
            <div className="FIELD NAME">{mRow.p.name}</div>
            <div className="FIELD MOAM">{cents2EU(mRow.p.init)}</div>
            <div className="FIELD MOAM">{cents2EU(mRow.p.credit)}</div>
            <div className="FIELD MOAM">{cents2EU(mRow.p.debit)}</div>
            <div className="FIELD MOAM">{cents2EU(mRow.p.yearEnd)}</div>
            <div className="FIELD MONY">{cents2EU(mRow.p.netIncomeOTC)}</div>
            <div className="FIELD MONY">{cents2EU(mRow.p.netIncomeFin)}</div>
            <div className="FIELD MOAM">{cents2EU(mRow.p.close)}</div>
            <div className="FIELD MONY">{cents2EU(mRow.p.tax)}</div>
            <div className="FIELD MOAM">{cents2EU(mRow.p.cyLoss)}</div>
            <div className="FIELD MOAM">{cents2EU(mRow.p.next)}</div>
        </div>
    )
}


function PartnerTitleRow(mRow) {
    console.log("PartnerTitleRow mRow="+JSON.stringify(mRow));
    return (
        <div className="attrLine">
            <div className="FIELD NAME">{mRow.p.name}</div>
            <div className="FIELD TEAM">{cents2EU(mRow.p.init)}</div>
            <div className="FIELD TEAM">{cents2EU(mRow.p.credit)}</div>
            <div className="FIELD TEAM">{cents2EU(mRow.p.debit)}</div>
            <div className="FIELD TEAM">{cents2EU(mRow.p.yearEnd)}</div>
            <div className="FIELD TENY">{cents2EU(mRow.p.netIncomeOTC)}</div>
            <div className="FIELD TENY">{cents2EU(mRow.p.netIncomeFin)}</div>
            <div className="FIELD TEAM">{cents2EU(mRow.p.close)}</div>
            <div className="FIELD TENY">{cents2EU(mRow.p.tax)}</div>
            <div className="FIELD TEAM">{cents2EU(mRow.p.cyLoss)}</div>
            <div className="FIELD TEAM">{cents2EU(mRow.p.next)}</div>
        </div>
    )
}

