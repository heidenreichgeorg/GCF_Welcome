import { useEffect, useState } from 'react';
import { getSession, useSession, REACT_APP_API_HOST,getCarryOver,storeCarryOver } from '../modules/sessionmanager';
import Screen from './Screen'
import { cents2EU,bigUSMoney,cents20EU,bigEUMoney }  from '../modules/money';
import { CSEP, D_INITIAL, D_Account, D_Balance, D_Carry, D_CarryOver, D_Page, D_Partner, D_FixAss, D_History, D_Report, D_Schema, J_ACCT, SCREENLINES, X_ASSET_CAPTAX, X_ASSET_UNPCAP, X_ASSETS, X_EQLIAB } from '../modules/terms.js'
import { book,prepareTXN,makeHistory, symbolic }  from '../modules/writeModule';
import { makeBalance, makeHGBReport,makeStatusData }  from '../modules/App';

// the ORIGINAL FORMAT from journal sheet is 
// columns format CSV with these columns 
// HASH DATE SENDER REFACCT REASON REFCODE GRSB EBKS CDAK COGK FSTF NKFO KEST KESO VAVA - MIET AUFW NKG EZIN AZIN FSAL - NKHA KAUT D586 

/* global BigInt */

// matrix format 
// { 'date':"", 'sender':"Sender", 'refAcct':"", 'reason':"", 'refCode':"", 'debit':{'name':VALUE}, credit:{ 'name':VALUE},'txt2':"Absender",'txt3':"Zeit",'txt4':"Objekt"}

// buildTransaction will generate the 
// flow format 
// "sender":SENDER,"reason":REASON,"credit":{"COGK":{"index":10,"value":"100,00"}},"debit":{"K2TO":{"index":33,"value":"100,00"}},"balance":""}
// this format is for AccountTemplateRow and setTxn - the external book method
export default function Status() {
    

    // 65 Buchungsfälle
    const predefinedTXN = {
       /* 
 {
       "Miete E22":{"text":"Mieter* überweist Miete mit Nebenkosten auf das Firmenkonto","creditEQL":{},"credit":{"COGK":"1390"},"debit":{"MIET":"1290","NKHA":"100"},"debitA":{},"sender":"Ferguson","refAcct":"MIET","refCode":"Eifelweg 22","txt2":"Mieter","txt3":"Monat","txt4":"Objekt"
        "Miete Gar":{"text":"Mieter* überweist Miete auf das Firmenkonto","creditEQL":{},"credit":{"COGK":"52"},"debit":{"MIET":"52"},"debitA":{},"sender":"Vau","refAcct":"MIET","refCode":"Garage","txt2":"Mieter","txt3":"Monat","txt4":"Objekt"},
        "Entnahme Kpl":{"text":"Elke u Georg bekommen Geld vom Firmenkonto","creditEQL":{"K2GH":"0","K2EH":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Elke u Georg","refAcct":"K2GH K2EH","refCode":"WITHDRAW","txt2":"Partner"},
        "Entnahme Alex":{"text":"Alex bekommt Geld vom Firmenkonto","creditEQL":{"K2AL":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Alexander","refAcct":"K2AL","refCode":"WITHDRAW","txt2":"Partner"},
        "Entnahme Kristina":{"text":"Tina bekommt Geld vom Firmenkonto","creditEQL":{"K2KR":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Kristina","refAcct":"K2KR","refCode":"WITHDRAW","txt2":"Partner"},
        "Entnahme Tom":{"text":"Tom bekommt Geld vom Firmenkonto","creditEQL":{"K2TO":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Tom","refAcct":"K2TO","refCode":"WITHDRAW","txt2":"Partner"},
        "Entnahme Leon":{"text":"Leon bekommt Geld vom Firmenkonto","creditEQL":{"K2LE":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Leon","refAcct":"K2LE","refCode":"WITHDRAW","txt2":"Partner"},
        "Bildung Rücklage":{"text":"Die Gesellschafter bilden eine Rücklage","creditEQL":{"K2GH":"1000","K2EH":"1000","K2AL":"1000","K2KR":"1000","K2TO":"1000"},"credit":{},"debit":{"REGH":"1000","REEH":"1000","REAL":"1000","REKR":"1000","RETO":"1000"},"debitA":{},"sender":"R��cklage","refAcct":"RExx","refCode":"WITHDRAW","txt2":"Ziel"},
        "Aufwand":{"text":"Kleinerer Aufwand zur Instandhaltung der Mietsache (Ersatzteil,Reparatur,Dienstleistung) wird vom Firmenkonto bezahlt","creditEQL":{"AUFW":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Verkäufer","refAcct":"AUFW","refCode":"Eifelweg22"},
        "Kontogebühren":{"text":"abzugsfähige Gebühren werden vom Firmenkonto bezahlt","creditEQL":{"AUFW":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Consorsbank","refAcct":"AUFW","refCode":"Eifelweg22"},
        "Gebühren Kapitalverkehr":{"text":"Gebühren die sich auf Finanzkapital beziehen, werden vom Firmenkonto bezahlt","creditEQL":{"NKG":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Bundesanzeiger-Verlag","refAcct":"NKG","refCode":"Kosten Kap."},
        "Sacheinlage Komplementäre":{"text":"Mietaufwand wird als Sacheinlage geleistet, z.B. Teile vom Baumarkt","creditEQL":{"AUFW":"0"},"credit":{},"debitA":{},"debit":{"K2GH":"0","K2EH":"0"},"sender":"Verkäufer","refAcct":"AUFW","refCode":"DEP_IN_KIND","txt2":"Partner"},
        "Grundabgaben":{"text":"Stadt Erlangen zieht Grundabgaben ein","creditEQL":{"NKHA":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Stadt Erlangen","reason":"Quartal","refAcct":"NKHA","refCode":"FEE","txt2":"Empf��nger"},
        "Kaminkehrer":{"text":"Feuerstätten-Prüfung","creditEQL":{"NKHA":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Gunter Reichel","reason":"Jahr","refAcct":"NKHA","refCode":"FEE","txt2":"Empfänger"},
        "Versicherung":{"text":"Versicherung zieht Beitrag ein","creditEQL":{"NKHA":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"BayernVersicherung","reason":"Jahr","refAcct":"NKHA","refCode":"FEE","txt2":"Empfänger"},
        "IHK-Beitrag":{"text":"IHK-Erlangen bekommt Jahresbeitrag","creditEQL":{"AUFW":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"IHK Nürnberg","reason":"Quartal","refAcct":"NKHA","refCode":"FEE","txt2":"Empfänger"},
        "AK Garten":{"text":"Anschaffungskosten GP","creditEQL":{},"credit":{"GPET":"0"},"debit":{},"debitA":{"COGK":"0"},"sender":"Garten","reason":"0","refAcct":"INVEST","refCode":"G7772025","txt2":"WKN","txt3":"Empfänger","txt4":"Code"},
        "Aktien-Kauf":{"text":"Aktien mit Kaufkosten werden gekauft und bezahlt; der Kurswert und alle Gebühren werden aktiviert.","creditEQL":{},"credit":{"CDAK":"0"},"debit":{},"debitA":{"COGK":"0"},"sender":"WKN","reason":"Stückzahl","refAcct":"INVEST","refCode":"Code","txt2":"WKN","txt3":"Anzahl","txt4":"Code"},
        "Bond-Kauf mit Stückzins":{"text":"Bonds mit Kaufkosten und Stückzins werden gekauft und bezahlt","creditEQL":{},"credit":{"CDAK":"0","FSTF":"0"},"debit":{},"debitA":{"COGK":"0"},"sender":"WKN","reason":"Nominal","refAcct":"INVEST","refCode":"Code","txt2":"WKN","txt3":"Anzahl","txt4":"Code"},
        "Aktien-Dividende bar":{"text":"Dividende wird versteuert und auf das Firmenkonto überwiesen","creditEQL":{},"credit":{"COGK":"0","KEST":"0","KESO":"0"},"debit":{"EDIV":"0"},"debitA":{},"sender":"WKN","reason":"Stückzahl","refAcct":"YIELD","refCode":"Code","txt2":"WKN","txt3":"Anzahl","txt4":"Code"},
        "Dividende steuerfrei bar":{"text":"steuerfreie Dividende reduziert Anschaffungskosten","creditEQL":{},"credit":{"COGK":"0"},"debit":{},"debitA":{"CDAK":"0"},"sender":"WKN","reason":"Stückzahl","refAcct":"YIELD","refCode":"Code","txt2":"WKN","txt3":"Anzahl","txt4":"Code"},
        "Dividende in Aktien steuerfrei":{"text":"steuerfreie Gratisaktien reduzieren Anschaffungskosten","creditEQL":{},"credit":{},"debit":{},"debitA":{},"sender":"WKN","reason":"Stückzahl","refAcct":"INVEST","refCode":"Code","txt2":"WKN","txt3":"Anzahl","txt4":"Code"},
        "Zins auf Bonds steuerpflichtig":{"text":"Zins auf Festgeld wird versteuert","creditEQL":{},"credit":{"COGK":"0","KEST":"0","KESO":"0"},"debit":{"EZIN":"0"},"debitA":{},"sender":"WKN","reason":"Stückzahl","refAcct":"YIELD","refCode":"Code","txt2":"WKN","txt3":"Anzahl","txt4":"Code"},
        "Bond-Zins verr mit Stückzins":{"text":"Forderung aus Stückzins bei Bondkauf wird mit Zins auf Festgeld verrechnet","creditEQL":{"EZIN":"0"},"credit":{},"debit":{},"debitA":{"FSTF":"0"},"sender":"WKN","reason":"Stückzahl","refAcct":"EZIN","refCode":"Code","txt2":"WKN","txt3":"Anzahl","txt4":"Code"},
        "Dividende in Aktien steuerpflichtig":{"text":"Gratisaktien werden versteuert","creditEQL":{},"credit":{"KEST":"0","KESO":"0"},"debit":{"EDIV":"0"},"debitA":{},"sender":"WKN","reason":"Stückzahl","refAcct":"INVEST","refCode":"Code","txt2":"WKN","txt3":"Anzahl","txt4":"Code"},
        "Aktien-Verkauf mit Gewinn":{"text":"Aktien werden mit Gewinn verkauft","creditEQL":{},"credit":{"COGK":"0","KEST":"0","KESO":"0","TXNE":"0","HAPG":"0","GRGB":"0","PROV":"0"},"debit":{"FSAL":"0"},"debitA":{"CDAK":"0"},"sender":"WKN","reason":"Stückzahl","refAcct":"SELL","refCode":"Code","txt2":"WKN","txt3":"Anzahl","txt4":"Code"},
        "Aktien-Verkauf mit Verlust":{"text":"Aktien werden mit Verlust verkauft; der Kurswert abzgl Gebühren geht auf das Firmenkonto","creditEQL":{},"credit":{"VAVA":"0","COGK":"0"},"debit":{},"debitA":{"CDAK":"0"},"sender":"WKN","reason":"Stückzahl","refAcct":"SELL","refCode":"Code","txt2":"WKN","txt3":"Anzahl","txt4":"Code"},
        "Ausgleich Aktien-Verluste":{"text":"F���r Aktienverkäufe im selben Jahr gilt: Gewinne tilgen Verluste","creditEQL":{"FSAL":"0"},"credit":{},"debit":{},"debitA":{"VAVA":"0"},"sender":"Ausgleich","reason":"Verluste","refAcct":"VAVA","refCode":"VK Aktien","txt2":"WKN","txt3":"Anzahl","txt4":"Code"},
        "Pfandzahlung":{"text":"Die KG zahlt vom Firmenkonto eine Sicherheit","creditEQL":{},"credit":{"FSTF":"0"},"debit":{},"debitA":{"COGK":"0"},"sender":"","reason":"","refAcct":"NKHA","refCode":"AZ","txt2":"Empfänger"},
        "Rückerstattung Pfand":{"text":"Die KG erhält die Sicherheit auf das Firmenkonto zurück","creditEQL":{},"credit":{"COGK":"0"},"debit":{},"debitA":{"FSTF":"0"},"sender":"","reason":"","refAcct":"NKHA","refCode":"AZ"},
        "Aktien-Wertaufholung":{"text":"Aktien-Depot hat pauschalen Anstieg des Kurswerts","creditEQL":{},"credit":{"CDAK":"0"},"debit":{"NKG":"0"},"debitA":{},"sender":"Depot","reason":"Wertaufholung","refAcct":"INVEST","refCode":"Code","txt2":"Ziel","txt3":"Grund","txt4":"Code"},
        "Umlage Wertzuwachs":{"text":"Die Gesellschafter erhalten Kapital aus Wertzuwachs","creditEQL":{"NKG":"0"},"credit":{},"debit":{"K2GH":"0","K2EH":"0","K2AL":"0","K2KR":"0","K2TO":"0"},"debitA":{},"sender":"Wertzuwachs","refAcct":"NKG","refCode":"DEPOSIT","txt2":"Ziel"},
        "Nicht-umlagefähige NK":{"text":"Er��ffnung: Nebenkosten werden um nicht-umlagefähige Teile reduziert zB Versicherungsanteil f Garage","creditEQL":{"AUFW":"0"},"credit":{},"debit":{"NKHA":"0"},"debitA":{},"sender":"Ferguson","reason":"Abschluss","refAcct":"NKHA","refCode":"Versicherung Garage","txt2":"Empfänger","txt4":"Objekt"},
        "Zins auf Kaution":{"text":"Eröffnung: Zins wird auf die Kaution gutgeschrieben","creditEQL":{"AUFW":"0"},"credit":{},"debit":{"NKHA":"0"},"debitA":{},"sender":"Ferguson","reason":"Abschluss","refAcct":"NKHA","refCode":"Zins auf Kaution","txt2":"Empf��nger"},
        "Forderung Nebenkosten":{"text":"Abschluss: Unbezahlte Nebenkosten werden als Forderung an Mieter* gebucht","creditEQL":{},"credit":{"NKFO":"0"},"debit":{"NKHA":"0"},"debitA":{},"sender":"Nebenkosten","reason":"Abschluss","refAcct":"NKHA","refCode":"Abrechnung","txt2":"Empfänger"},
        "Mieter zahlt Nebenkosten":{"text":"Mieter* überweist Nebenkosten auf das Firmenkonto","creditEQL":{},"credit":{"COGK":"0"},"debitA":{"NKFO":"0"},"debit":{},"sender":"Ferguson","reason":"Vorjahr","refAcct":"NKHA","refCode":"Nachzahlung","txt2":"Schuldner"},
        "Erstattung Nebenkosten":{"text":"KG erstattet überzahlte Nebenkosten an Mieter*","creditEQL":{"NKHA":"0"},"credit":{},"debit":{},"debitA":{"COGK":"0"},"sender":"Nebenkosten","reason":"Vorjahr","refAcct":"NKHA","refCode":"Überschuss","txt2":"Empf��nger"},
        "nicht abzugsfäh.Aufwand":{"text":"Abschluss: nicht abzugsf��hige Aufw��nde werden anteilig den Gesellschaftern abgezogen","creditEQL":{"K2GH":"0","K2EH":"0","K2AL":"0","K2KR":"0","K2TO":"0"},"credit":{},"debit":{"NKG":"0"},"debitA":{},"sender":"Abschluss","reason":"Jahr","refAcct":"K2LE","refCode":"WITHDRAW","txt2":"Partner"},
        "Abschreibung Haus":{"text":"Abschluss: Abschreibung des Hauses im Eifelweg 22 -2%","creditEQL":{"ABSC":"2430"},"credit":{},"debitA":{"GRSB":"0"},"debit":{},"sender":"Haus","reason":"1","refAcct":"WRITEOFF","refCode":"Eifelweg22","txt2":"Objekt","txt3":"Jahr","txt4":"Code"},
        "Abschreibung Dach":{"text":"Abschluss: Abschreibung des Dachs im Eifelweg 22 -4%","creditEQL":{"ABSC":"666.40"},"credit":{},"debitA":{"DACH":"0"},"debit":{},"sender":"Gebäudeteil","reason":"1","refAcct":"WRITEOFF","refCode":"Dacheindeckung","txt2":"Objekt","txt3":"Jahr","txt4":"Code"},
        "Abschreibung Spülm":{"text":"Abschluss: Abschreibung der Spülmaschine im Eifelweg 22 -10%","creditEQL":{"ABSC":"47"},"credit":{},"debitA":{"EBKS":"0"},"debit":{},"sender":"Gebäudeteil","reason":"1","refAcct":"WRITEOFF","refCode":"EBSM2018","txt2":"Objekt","txt3":"Jahr","txt4":"Code"},
        "Einlage Kpl":{"text":"Elke u Georg zahlen auf Firmenkonto ein","creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"K2GH":"0","K2EH":"0"},"sender":"Elke u Georg","refAcct":"K2GH K2EH","refCode":"DEPOSIT","txt2":"Partner"},
        "Einlage Alex":{"text":"Alex zahlt auf Firmenkonto ein","creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"K2AL":"0"},"sender":"Alexander","refAcct":"K2AL","refCode":"DEPOSIT","txt2":"Partner"},
        "Einlage Kristina":{"text":"Tina zahlt auf Firmenkonto ein","creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"K2KR":"0"},"sender":"Kristina","refAcct":"K2KR","refCode":"DEPOSIT","txt2":"Partner"},
        "Einlage Tom":{"text":"Tom zahlt auf Firmenkonto ein","creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"K2TO":"0"},"sender":"Tom","refAcct":"K2TO","refCode":"DEPOSIT","txt2":"Partner"},
        "Einlage Leon":{"text":"Leon zahlt auf Firmenkonto ein","creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"K2LE":"0"},"sender":"Leon","refAcct":"K2LE","refCode":"DEPOSIT","txt2":"Partner"},
        "Rücklage Georg":{"text":"Georg bildet Rücklage","creditEQL":{},"credit":{"REGH":"0"},"debitA":{},"debit":{"K2GH":"0"},"sender":"Georg","refAcct":"K2GH","refCode":"DEPOSIT","txt2":"Georg"},
        "Rücklage Elke":{"text":"Elke bildet Rücklage","creditEQL":{},"credit":{"REEH":"0"},"debitA":{},"debit":{"K2EH":"0"},"sender":"Elke","refAcct":"K2EH","refCode":"DEPOSIT","txt2":"Partner"},
        "Aufl Rücklage Georg":{"text":"Georg löst Rücklage auf","creditEQL":{},"credit":{"K2GH":"0"},"debitA":{},"debit":{"REGH":"0"},"sender":"Georg","refAcct":"REGH","refCode":"DEPOSIT","txt2":"Georg"},
        "Aufl Rücklage Elke":{"text":"Elke löst Rücklage auf","creditEQL":{},"credit":{"K2EH":"0"},"debitA":{},"debit":{"REEH":"0"},"sender":"Elke","refAcct":"REEH","refCode":"DEPOSIT","txt2":"Partner"},
        "ZufRück Kpl":{"text":"Elke u Georg zahlen Rücklage auf Firmenkonto ein","creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"REGH":"0","REEH":"0"},"sender":"Elke u Georg","refAcct":"REGH REEH","refCode":"DEPOSIT","txt2":"Partner"},
        "ZufRück Alex":{"text":"Alex zahlt Rücklage auf Firmenkonto ein","creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"REAL":"0"},"sender":"Alexander","refAcct":"REAL","refCode":"DEPOSIT","txt2":"Partner"},
        "ZufRück Kristina":{"text":"Tina zahlt Rücklage auf Firmenkonto ein","creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"REKR":"0"},"sender":"Kristina","refAcct":"REKR","refCode":"DEPOSIT","txt2":"Partner"},
        "ZufRück Tom":{"text":"Tom zahlt Rücklage auf Firmenkonto ein","creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"RETO":"0"},"sender":"Tom","refAcct":"RETO","refCode":"DEPOSIT","txt2":"Partner"},
        "ZufRück Leon":{"text":"Leon zahlt Rücklage auf Firmenkonto ein","creditEQL":{},"credit":{"COGK":"0"},"debitA":{},"debit":{"RELE":"0"},"sender":"Leon","refAcct":"RELE","refCode":"DEPOSIT","txt2":"Partner"},
        "Sach-Entnahme Kpl":{"text":"Elke u Georg entnehmen Sache","creditEQL":{"K2GH":"0","K2EH":"0"},"credit":{},"debit":{},"debitA":{"FSTF":"0"},"sender":"Elke u Georg","refAcct":"K2GH K2EH","refCode":"WITHDRAW","txt2":"Partner"},
        "Sach-Entnahme Alex":{"text":"Alex entnimmt Sache","creditEQL":{"K2AL":"0"},"credit":{},"debit":{},"debitA":{"FSTF":"0"},"sender":"Alexander","refAcct":"K2AL","refCode":"WITHDRAW","txt2":"Partner"},
        "Sach-Entnahme Kristina":{"text":"Tina entnimmt Sache","creditEQL":{"K2KR":"0"},"credit":{},"debit":{},"debitA":{"FSTF":"0"},"sender":"Kristina","refAcct":"K2KR","refCode":"WITHDRAW","txt2":"Partner"},
        "Sach-Entnahme Tom":{"text":"Tom entnimmt Sache","creditEQL":{"K2TO":"0"},"credit":{},"debit":{},"debitA":{"FSTF":"0"},"sender":"Tom","refAcct":"K2TO","refCode":"WITHDRAW","txt2":"Partner"},
        "Sach-Entnahme Leon":{"text":"Leon entnimmt Sache","creditEQL":{"K2LE":"0"},"credit":{},"debit":{},"debitA":{"FSTF":"0"},"sender":"Leon","refAcct":"K2LE","refCode":"WITHDRAW","txt2":"Partner"},
        "Sicherheit Kpl":{"text":"Elke u Georg stellen Sicherheit gg Dritte","creditEQL":{},"credit":{"FSTF":"0"},"debitA":{},"debit":{"K2GH":"0","K2EH":"0"},"sender":"Ext","refAcct":"K2GH K2EH","refCode":"DEPOSIT","txt2":"Empfänger"},
        "Sicherheit Alex":{"text":"Alex stellt Sicherheit bei Drittem","creditEQL":{},"credit":{"FSTF":"0"},"debitA":{},"debit":{"K2AL":"0"},"sender":"Ext","refAcct":"K2AL","refCode":"DEPOSIT","txt2":"Empfänger"},
        "Sicherheit Kristina":{"text":"Tina stellt Sicherheit bei Drittem","creditEQL":{},"credit":{"FSTF":"0"},"debitA":{},"debit":{"K2KR":"0"},"sender":"Ext","refAcct":"K2KR","refCode":"DEPOSIT","txt2":"Empfänger"},
        "Sicherheit Tom":{"text":"Tom stellt Sicherheit bei Drittem","creditEQL":{},"credit":{"FSTF":"0"},"debitA":{},"debit":{"K2TO":"0"},"sender":"Ext","refAcct":"K2TO","refCode":"DEPOSIT","txt2":"Empfänger"},
        "Sicherheit Leon":{"text":"Leon stellt Sicherheit bei Drittem","creditEQL":{},"credit":{"FSTF":"0"},"debitA":{},"debit":{"K2LE":"0"},"sender":"Ext","refAcct":"K2LE","refCode":"DEPOSIT","txt2":"Empfänger"},
        "Zuordnung Nebenkosten":{"text":"Auslagen werden als Nebenkosten umgebucht","creditEQL":{},"credit":{"FSTF":"0"},"debit":{"NKHA":"0"},"debitA":{},"sender":"Nebenkosten","reason":"Zuordnung","refAcct":"NKHA","refCode":"Abrechnung"}
            */
        };
            

    const [sheet, setSheet]  = useState()
    const [year, setYear]   = useState()
    const [client,setClient] = useState()
    const [partner,setPartner] = useState()
    const {session, status } = useSession()
    const [displayRecord, setDisplayRecord] = useState({ creditEQL:{}, credit:{}, debitA:{}, debit:{}})
    const [matrix, setMatrix] = useState(predefinedTXN )
    const [showAccount, setShowAccount] = useState(false);
    const [jHeads, setJHeads] = useState({});
    const [currLine,setCurrLine] = useState(0);
    
    const VOID ="-,--";

    var funcShowReceipt=null;
    var funcKeepReceipt=null;
    var funcHideReceipt=null;
    var funcCleaReceipt=null;
    var aSelText = {};
    var aToken   = {};
    var aReason  = {};
    var aJMoney  = {};
    var aSelSaldo= {};
    var jPageSum = {};
    var arrNames=[];

    useEffect(() => {

        aSelText = {};
        aToken   = {};
        aReason  = {};
        aJMoney = {};        
        
        if(status !== 'success') return;
        setYear(session.year);
        setClient(session.client);
        setPartner(session.partner);
        setMatrix(session.txnPattern);
        let state=getSession();
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
            if(state.generated) {
                // history layout methods                
                let jInitialHeads={}; 
                arrNames=state.generated[D_Schema].Names;
                arrNames.slice(J_ACCT).forEach(acct => { if(acct.length>2) jInitialHeads[acct]='1'; });
                console.log("useEffect jinitialHeads="+JSON.stringify(jInitialHeads));
                setJHeads(jInitialHeads);   
                resetJSum(jInitialHeads);         
                console.log("STATUS useEffect jPageSum="+JSON.stringify(jPageSum));
            }

        }
        // reset all stored carryOver sums
        storeCarryOver({});
    }, [status])


    function computeRow(row,index,client,year,nLine) {

        if(row) {
            console.log("computeRow ENTER("+nLine+") "+JSON.stringify(row));
    
            let aRow = [0n,0n,0n,0n,0n,0n]
            try { let saRow = row.entry;
                aRow = saRow.split(CSEP);
            } catch(err) {  aRow=[""+index+client+year,""+year+index+client] }    
    
            let tRow =  {};
            try { let moneyRow = row.jMoney;
                tRow = moneyRow; //  name-value pairs with sign
            } catch(err) {}
    
            let saldo="";
            if(isNaN(row.saldo)) saldo="0";
            else saldo = cents20EU(row.saldo); // cents2EU with 0 digit
            
            let id = symbolic(''+nLine+aRow.join('')+nLine+JSON.stringify(tRow));
    
            if(index>0 || nLine>0) { 
                
                    console.log("computeRow ADDING("+id+") "+JSON.stringify(aRow));
    
                aSelText[id]=aRow; 
                aReason[id]=row.entry;
                aJMoney[id]=tRow;
                aSelSaldo[id]=""+saldo;

                 // 20250402 encode token - e.g. to identity opening line
                if(row.token) aToken[id]=row.token;         
            }

           
        }
    }
    


    // TXNReceipt history layout methods
    function removeCol(name) { console.log("REMOVE "+name); jHeads[name]='0'; setJHeads(JSON.parse(JSON.stringify(jHeads)));  }
    funcCleaReceipt = (() => { storeCarryOver({}); resetJSum(jHeads); });
    funcKeepReceipt = (() => { storeCarryOver(purgeCarryOver(jSum));  });  
    funcHideReceipt = (() => setShowAccount(null)); 
    funcShowReceipt = ((acct) => setShowAccount(acct));

    function purgeCarryOver(jSum) {
        let result={}; 
        Object.keys(jSum).forEach(name => {if(bigEUMoney(jSum[name])!=0n) 
            result[name]=jSum[name];});
        return result;
    }
    

    function resetJSum(jColumnHeads) { 
        let jCarryOver=getCarryOver();
        console.log("INIT PAGE#3 "+JSON.stringify(jCarryOver))
        if(jCarryOver && Object.keys(jCarryOver).length>0) {
            jPageSum=jCarryOver;
            console.log("STATUS PAGE#3A "+JSON.stringify(jPageSum))
        } else  { 
            jPageSum={}; 
            Object.keys(jColumnHeads).forEach(acct=>{jPageSum[acct]="0,00";}); 
            console.log("STATUS PAGE#3B "+JSON.stringify(jPageSum))
        }
    }

        

    function makeLabel(index,aPattern) { let p= (aPattern && aPattern.length>0) ? aPattern: "p"; return session.client+session.year+p+index }


    // main functions

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


    console.log("010 STATUS ("+showAccount+") START ");

    // restore transient variable from state variable
    resetJSum(jHeads);         

    
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
            fetch(`${REACT_APP_API_HOST}/EXCEL?partner=${partner}&client=${client}&year=${year}`, rqOptions)
            .then((response) => response.blob())
            .then((blob) => URL.createObjectURL(blob))
            .then((url) => console.log("1120 handleXLSave URL= "+ makeXLSButton(url,session.client,session.year)))
            .catch((err) => console.error("1127 handleXLSave ERR "+err));           
        } catch(err) { console.log("1117 GET /EXCEL handleXLSave:"+err);}
        console.log("1130 Status.handleXLSave EXIT");
    }



    function handleReview() {        
        book({'partner':session.partner,'client':session.client,'year':session.year},session)
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
    }

    /**************************************************************************************** */


    function handleJSONSave() {
        console.log("1110 Partner.handleJSONSave sessionId = "+session.id);
        const rqOptions = { method: 'GET', headers: {  'Accept': 'application/json'}, mode:'cors'};
        try {
            
            fetch(`${REACT_APP_API_HOST}/DOWNLOAD?partner=${partner}&client=${session.client}&year=${session.year}`, rqOptions)
            .then((response) => response.blob())
            .then((blob) => URL.createObjectURL(blob))
            .then((url) => console.log("1120 handleJSONSave URL= "+ makeJSONButton(url)))
            .catch((err) => console.error("1127 handleJSONSave ERR "+err));
            
        } catch(err) { console.log("1117 GET /JSON handleJSONSave:"+err);}
        console.log("1140 Partner.handleJSONSave EXIT");
    }

    
    function makeJSONButton(url) { 

        console.log("1196 makeJSONButton XLSX "+url);
        
        let a = document.createElement('a');
        a.href = url
        a.download = "main.json";
        a.style.display = 'block'; // was none
        a.className = "key";
        a.innerHTML = "Download";
        document.body.appendChild(a); 
        console.log("1198 downloadButton make button");
        
        return url;
    };



    /**************************************************************************************** */
    // dashboard portal page

    function displayAccount(shrtName) { 

        funcShowReceipt(shrtName); 


        
        console.log("SHOW ACCOUNT "+shrtName); 
        //window.open("/History?client=HGKG&year=2023&APATTERN="+shrtName+"&SELECTALL=1"); 
    }
    
    function StatusRow({ am1,tx1, am2, tx2, am3, tx3, d, n, r, l, t, click}) {
        return(
            <div className="attrLine">
                <div className="FIELD MOAM"> {cents2EU(am1)}</div>
                <div className="FIELD SYMB" onClick={(e)=>displayAccount(tx1)}> {tx1}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM"> {cents2EU(am2)}</div>
                <div className="FIELD SYMB" onClick={(e)=>displayAccount(tx2)}> {tx2}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM"> {cents2EU(am3)}</div>
                <div className="FIELD SYMB" onClick={(e)=>displayAccount(tx3)}> {tx3}</div>
                <div className="FIELD DASH"> &nbsp;</div>
                <div className="FIELD DATE"> {d}</div>
                <div className="FIELD NAME"> {n}</div>
                <div className="FIELD SNAM"> {r}</div>
                <div className="FIELD NAME"> {t}</div>
                <div className="FIELD">{l}</div>
                {click==null ? (<div className="FIELD SEP"> &nbsp;</div>) : (
                <div className="FIELD"  onClick={(() => click())}>&nbsp;.&nbsp;</div>
                ) }
            </div>
        )
    }
    
 /**************************************************************************************** */
//  account changes overview

    
    function AccountHistoryRow({ am1, tx1, am2, am3, am4, tx2, am5, am6, am7, am8, am9, amA, showAssets, showEqLiab }) {
        return(
            <div className="attrLine">
                { showAssets ? 
                (<div>
                    <div className="FIELD MOAM"> {cents2EU(am1)}</div>
                    <div className="FIELD SYMB" onClick={(e)=>displayAccount(tx1)}> {tx1}</div>
                    <div className="FIELD SEP">+&nbsp;</div>
                    <div className="FIELD MOAM"> {cents2EU(am2)}</div>
                    <div className="FIELD SEP">-&nbsp;</div>
                    <div className="FIELD MOAM"> {cents2EU(am3)}</div>
                    <div className="FIELD SEP">=&nbsp;</div>
                    <div className="FIELD MOAM"> {cents2EU(am4)}</div>
                    <div className="FIELD SEP"> &nbsp;</div>
                </div>):"" }
                <div className="FIELD SEP">|&nbsp;</div>
                { showEqLiab ? 
                (<div>
                    <div className="FIELD MOAM"> {cents2EU(am5)}</div>
                    <div className="FIELD SYMB" onClick={(e)=>displayAccount(tx2)}> {tx2}</div>
                    <div className="FIELD SEP">+&nbsp;</div>
                    <div className="FIELD MOAM"> {cents2EU(am6)}</div>
                    <div className="FIELD SEP">-&nbsp;</div>
                    <div className="FIELD MOAM"> {cents2EU(am7)}</div>
                    <div className="FIELD SEP">+&nbsp;</div>
                    <div className="FIELD MOAM"> {cents2EU(am8)}</div>
                    <div className="FIELD SEP">-&nbsp;</div>
                    <div className="FIELD MOAM"> {cents2EU(am9)}</div>
                    <div className="FIELD SEP">=&nbsp;</div>
                    <div className="FIELD MOAM"> {cents2EU(amA)}</div>
                </div>):"" }
            </div>
        )
    }
    

 /**************************************************************************************** */
    //  income used overview
   
    
    
    function IncomeUsedRow({ am1,tx1, am2, tx2, am3, tx3, am4, am5, am6}) {
        return(
            <div className="attrLine">
                <div className="FIELD MOAM"> {cents2EU(am1)}</div>
                <div className="FIELD SYMB" onClick={(e)=>displayAccount(tx1)}> {tx1}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM"> {cents2EU(am2)}</div>
                <div className="FIELD SYMB" onClick={(e)=>displayAccount(tx2)}> {tx2}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM"> {cents2EU(am3)}</div>
                <div className="FIELD SYMB" onClick={(e)=>displayAccount(tx3)}> {tx3}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM"> {cents2EU(am4)}</div>
                <div className="FIELD SYMB" onClick={(e)=>displayAccount(tx3)}> {tx3}</div>
                <div className="FIELD MOAM"> {cents2EU(am5)}</div>
                <div className="FIELD SYMB" onClick={(e)=>displayAccount(tx3)}> {tx3}</div>
                <div className="FIELD MOAM"> {cents2EU(am6)}</div>
                <div className="FIELD SEP"> &nbsp;</div>
            </div>
        )
    }
    
    

 /**************************************************************************************** */
    //  closing overview
   
    
    
    function ClosingRow({ am1,tx1, am2, tx2, am3, tx3, am4, tx4, am5, tx5, am6, tx6}) {
        return(
            <div className="attrLine">
                <div className="FIELD MOAM"> {cents2EU(am1)}</div>
                <div className="FIELD SYMB" onClick={(e)=>displayAccount(tx1)}> {tx1}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM"> {cents2EU(am2)}</div>
                <div className="FIELD SYMB" onClick={(e)=>displayAccount(tx2)}> {tx2}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SEP"> &nbsp;|</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM"> {cents2EU(am3)}</div>
                <div className="FIELD SYMB" onClick={(e)=>displayAccount(tx3)}> {tx3}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM"> {cents2EU(am4)}</div>
                <div className="FIELD SYMB" onClick={(e)=>displayAccount(tx4)}> {tx4}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM"> {cents2EU(am5)}</div>
                <div className="FIELD SYMB" onClick={(e)=>displayAccount(tx5)}> {tx5}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM"> {cents2EU(am6)}</div>
                <div className="FIELD SYMB" onClick={(e)=>displayAccount(tx6)}> {tx6}</div>
                <div className="FIELD SEP"> &nbsp;</div>
            </div>
        )
    }
    
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
        jTXN.partner=session.partner; // 20250112

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

        console.log("EXIT bufferAmount("+field+"="+value+"): in "+JSON.stringify(record));  
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
                <div className="FIELD" ><input type ="text" className="key" defaultValue={form.sender} onChange={((e) => bufferField(strKey,'sender',e.target.value))}/></div>
                <div className="FIELD SEP" ></div>
    
                <div className="FIELD SYMB" >{txt3}</div>
                <div className="FIELD "><input type ="text" className="key" defaultValue={form.reason} onChange={((e) => bufferField(strKey,'reason',e.target.value))}/></div>
                <div className="FIELD SEP" ></div>
    
                <div className="FIELD SYMB" >{txt4}</div>
                <div className="FIELD "><input type ="text" className="key" defaultValue={form.refCode} onChange={((e) => bufferField(strKey,'refCode',e.target.value))}/></div>
                <div className="FIELD SEP" ></div>
                
            </div>
            <div className="attrLine">
      
                {arrCredit.map((acct,line)=>(
                    (<div key={"credit"+line}  >
                        <div className="FIELD TAG" > {acct}</div>
                        { acct!=autoAcct ? (<div className="FIELD "><input type ="number" className="key MOAM" defaultValue={form.credit[acct]} onChange={((e) => bufferAmount(strKey,acct,e.target.value,'credit'))} /></div>):''}
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                 {arrCreditEQL.map((acct,line)=>(
                    (<div key={"creditEqL"+line}  >
                        <div className="FIELD TAG" > {acct}</div>
                        { acct!=autoAcct ? (<div className="FIELD "><input type ="number" className="key MOAM" defaultValue={form.creditEQL[acct]} onChange={((e) => bufferAmount(strKey,acct,e.target.value,'creditEQL'))} /></div>):''} 
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                <div className="FIELD TAG" >AN</div>
                {arrDebit.map((acct,line)=>(
                    (<div key={"debit"+line}  >
                        <div className="FIELD TAG" > {acct}</div>
                        { acct!=autoAcct ? (<div className="FIELD "><input type ="number" className="key MOAM" defaultValue={form.debit[acct]} onChange={((e) => bufferAmount(strKey,acct,e.target.value,'debit'))} /></div>):''}  
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                {arrDebitA.map((acct,line)=>(
                    (<div key={"debitA"+line}  >
                        <div className="FIELD TAG" > {acct}</div>
                        { acct!=autoAcct ? (<div className="FIELD "><input type ="number" className="key MOAM" defaultValue={form.debitA[acct]} onChange={((e) => bufferAmount(strKey,acct,e.target.value,'debitA'))} /></div>):''}
                        <div className="FIELD SEP" ></div>
                    </div>)
                ))}
                
            </div>    
            <div className="attrLine">
                <div className="FIELD MOAM" >
                    <button className="key" onClick={(() => preBook(strKey))}> {page.Display}</button>
                </div>
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
                                
            </div>


            <div className="attrLine">
                <div className="FIELD MOAM" >
                    <button className="key" onClick={(() => doBook(strKey))}>&nbsp;{page.Book}&nbsp;</button>            
                </div>
            </div>
        </div>);
    }

    /*
     HGB §275 Satz2 Gewinnermittlung
    */



    /*
     compute Partner capital and tax data
    */

    var jBalance = sheet[D_Balance];
    var jReport = sheet[D_Report];


    function makeTax(taxPartner,index) {
        var ifix=0n; // ifix are cents to compensate for rounding when tax is shared among partners
        let igain=BigInt(taxPartner.gain);
        let ideno=BigInt(taxPartner.denom);               
        let taxID = taxPartner.taxID;
        let result= { 'name': taxPartner.name, 'SteuerID':taxID,  };

        let taxPaid = BigInt(taxPartner.tax);
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

        console.log("makeTax Partner("+index+") with "+igain+"/"+ideno+" from gain ="+iSum+" % "+taxPaid);
        return result;
    }

    function reduceCapital(taxPartner,deficit,index) {
        var ifix=0n; // ifix are cents to compensate for rounding when capital deficit is shared among partners
        let igain=BigInt(taxPartner.gain);
        let ideno=BigInt(taxPartner.denom);               

        let cyLoss =taxPartner.cyLoss;
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

    console.log("020 STATUS make makeTax "+JSON.stringify(hKeys));

/*
   build main page
*/
    let fixPages=0;


    // dashboard page
    let page = sheet[D_Page];
    let sheet_status = makeStatusData(sheet);
    let statusReport = sheet_status.report;
    let tabHeaders=[page.DashBoard]; fixPages++;


    // Verlauf Vermögen
    // account history page for assets
    tabHeaders.push(page.AccountHistoryAssets); fixPages++;

    // Kapital Verlauf
    // account history page for equity/liability
    tabHeaders.push(page.AccountHistoryEqLiab); fixPages++;

    // income used page
    tabHeaders.push(page.IncomeUsed); fixPages++;

    // closing Overview page
    tabHeaders.push(page.Closing); fixPages++;

    

    // history page
    const jHistory  = sheet[D_History];
    let aLen = parseInt(sheet[D_Schema].assets);
    let eLen = parseInt(sheet[D_Schema].eqliab);
    const gSchema = sheet[D_Schema];    
    var pattern = null; // extra content query pattern 
    if(showAccount) {
        let sHistory=makeHistory(sheet,showAccount,pattern,jHistory,aLen,eLen,gSchema,page,SCREENLINES); // accumulates jSum

        sHistory.forEach((row,k) => {
            computeRow( row,1, session.client, session.year, k )
        })
    }
    
    console.log("030 STATUS make history "+JSON.stringify(aSelSaldo));




    // gain/loss page
    let hgbReport = makeHGBReport(jBalance,page,jReport);
    tabHeaders.push(page.GainlossHGB); fixPages++;


    // balances
    let balanceBase=fixPages;
    let pageNames = [ 'init',  'yearEnd','next'];    
    let arrBalance = pageNames.map((name) =>( makeBalance(jBalance,jReport,name)  ));
    [page.BalanceOpen,page.BalanceClose,page.BalanceNext].forEach((name) => { 
        tabHeaders.push(name); 
        fixPages++;
    })
    console.log("040 STATUS make balances "+JSON.stringify(tabHeaders));



    // fixed assets page
    let assetsBase=fixPages;
    var jAssets = sheet[D_FixAss];
    let iRest=0n;
    tabHeaders.push(page.fixed); 
    fixPages++; 
    


    // taxPartner pages
    let partnerBase=fixPages;
    Object.keys(jPartnerReport).forEach((p,i)=>{
        tabHeaders.push(page.Tax+' '+jPartnerReport[i].name); 
        fixPages++; // taxPartner page
    })



    // form pages
    if(matrix)  Object.keys(matrix).forEach((form)=>{tabHeaders.push('* '+form)});

    console.log("060 STATUS make ("+showAccount+") tabHeaders "+JSON.stringify(tabHeaders));


    let aPages = [];
    aPages[0] = 'block';
    let numPages = fixPages+tabHeaders.length; 
    for(let p=1;p<numPages;p++) aPages[p]='none'; 
    const tabName = "Overview";

    

    // show account history (showAccount)
    let jColumnHeads=jHeads; // state variable, do not touch
    let jSum=JSON.parse(JSON.stringify(jPageSum));
    console.log("070 STATUS UNIFY ("+showAccount+") jSum "+JSON.stringify(jSum));

    if(showAccount && gSchema) {
        Object.keys(aSelText).forEach(sym => 
            {if(aJMoney[sym])  (gSchema.Names.forEach(acct => { 
                if(acct.length>2 && jColumnHeads[acct]=='1') {   
                    let value=aJMoney[sym][acct]; 
                    let carry=jSum[acct];
                    if(bigEUMoney(value)!=0n) { 
                        try { jColumnHeads[acct]=acct; } catch(e) {}
                        
                        // GH 20240103 if(!carry || carry.length==0) {
                            jSum[acct]="0"; jPageSum[acct]="0";
                        //}
                    }

                    if(carry && carry.length>0) { 
                        try { jColumnHeads[acct]=acct; } catch(e) {}
                    }
            } }))
        })
        console.log("086 STATUS jColumnHeads "+JSON.stringify(jColumnHeads));
        console.log("087 STATUS jSum "+JSON.stringify(jSum));
        console.log("088 STATUS jPageSum "+JSON.stringify(jPageSum));
        console.log("089 STATUS showAccount "+showAccount);
     }


    // extra footer buttons
    let aFunc=[handleXLSave,handleJSONSave];
    let aText=["Get XLSX","Get JSON"];
    if(showAccount) {
        aFunc.push(funcKeepReceipt); aText.push(D_CarryOver);
        aFunc.push(funcHideReceipt); aText.push(page.DashBoard);
    }

    iInitial=BigInt(0);
    iSumLeft=BigInt(0);
    iSumRite=BigInt(0);
    
    let strInterest = (jBalance[showAccount] && jBalance[showAccount].interest) ? jBalance[showAccount].interest : "";
    

    return (
        <Screen tabSelector={showAccount ? [] : tabHeaders} tabName={tabName} aFunc={aFunc} aText={aText}  > 
           
           {showAccount &&             
                (
                <div className="mTable">                     
                    { TXNReceipt("",D_Account+' '+showAccount, jColumnHeads, jColumnHeads, null, session.year, removeCol, D_History,-1,currLine,setCurrLine) }
                    <TXNReceiptSum text={D_Carry} jAmounts={jPageSum} jColumnHeads={jColumnHeads} id="(SELECT)" />                   
                    { console.log("096 aSelText() keys = "+Object.keys(aSelText).join('+')) ||
                    Object.keys(aSelText).map((sym,i) => ( (sym && aSelText[sym] && aJMoney[sym] ) ? // && i>1
                                                
                                                            TXNReceipt(
                                                                aToken[sym],
                                                                aReason[sym],
                                                                aJMoney[sym],
                                                                jColumnHeads,
                                                                jSum,
                                                                makeLabel(i,showAccount),
                                                                null,
                                                                showAccount,
                                                                i,
                                                                currLine,
                                                                setCurrLine)
                                                                    :""
                                                                    )) }
                    { TXNReceiptTotal(page.Sum + ' ',showAccount,strInterest,year,page.YearEnd )  }   
                    <TXNReceiptSum   text="" jAmounts={jSum} jColumnHeads={jColumnHeads} id="" removeCol={removeCol}/>                                                                                       

                </div>
            )}

        {!showAccount &&                                                                     
            (<div>
                { console.log("100 STATUS show history") }
                <div className="FIELD" key={"Dashboard"} id={'Overview0'} style= {{ 'display': aPages[0]}} >
                    <div className="FIELD LNAM">&nbsp;</div>
                    <div className="attrLine">{page.Closing}&nbsp;{parseInt(session.year)}</div>
                    <StatusRow am1={page.Assets} am2={page.Gain}  am3={page.eqliab} d={page.Date} n={page.Recipient} r={page.Reason} l={page.TXNType} />
                    {
                        statusReport.map((row,line) => (
                            <StatusRow  key={"Status"+line}  
                                                am1={row.assets.yearEnd} tx1={row.assets.name} 
                                                am2={row.gals.yearEnd} tx2={row.gals.name} 
                                                am3={row.eqLiab.yearEnd} tx3={row.eqLiab.name} 
                                                d={row.dTran} n={row.nTran} r={row.rTran} l={row.lTran} t={row.tTran}
                                                click={(line==0)?handleReview:null}/>                       
                        ))
                    }
                </div>


                { console.log("102 ACCOUNTHISTORY show results ASSETS") }
                <div className="FIELD" key={"AccountHistory"} id={'Overview1'} style= {{ 'display': aPages[1]}} >
                    
                    <div className="FIELD LNAM">&nbsp;</div>
                    <div className="attrLine">{page.AccountHistoryAssets}&nbsp;{parseInt(session.year)}</div>

                    <AccountHistoryRow  key={"AcctHistoryAssets"}  
                                                    am1={page.Init} tx1={page.Name} am2={page.Credit} am3={page.Debit} am4={page.YearEnd} 
                                                    showAssets={true}
                                                />                       
                        
                        
                        {
                            statusReport.map((row,line) => (
                                <AccountHistoryRow  key={"AcctHistoryAssets"+line}  
                                                    am1={row.assets.init} tx1={row.assets.name} 
                                                    am2={row.assets.credit} 
                                                    am3={row.assets.debit} 
                                                    am4={row.assets.yearEnd} 
                                                    showAssets={true}
                                                />                       
                            ))
                        }
                </div>


                { console.log("104 ACCOUNTHISTORY show results EQLIAB") }
                <div className="FIELD" key={"AccountHistoryEqLiab"} id={'Overview2'} style= {{ 'display': aPages[2]}} >

                    <div className="FIELD LNAM">&nbsp;</div>
                    <div className="attrLine">{page.AccountHistoryEqLiab}&nbsp;{parseInt(session.year)}</div>
                        
                    <AccountHistoryRow  key={"AcctHistoryEqLiab"}  
                                                    showEqLiab={true}
                                                    am5={page.Init} tx2={page.Name} am6={page.Credit} am7={page.Debit} am8={page.income} am9={page.Tax} amA={page.NextYear} 
                                                />                       
                        
                        
                        {
                            statusReport.map((row,line) => (
                                <AccountHistoryRow  key={"AcctHistoryEqLiab"+line}  
                                                    showEqLiab={true}


                                                    am5={row.eqLiab.init} tx2={row.eqLiab.name} 
                                                    am6={row.eqLiab.credit} 
                                                    am7={row.eqLiab.debit} 
                                                    am8={row.eqLiab.income} 
                                                    am9={row.eqLiab.tax} 
                                                    amA={row.eqLiab.next} 
                                                />                       
                            ))
                        }
                </div>



                { console.log("106 INCOMEUSED show results") }
                <div className="FIELD" key={"IncomeUsed"} id={'Overview3'} style= {{ 'display': aPages[3]}} >

                    <div className="FIELD LNAM">&nbsp;</div>
                    <div className="attrLine">{page.IncomeUsed}&nbsp;{parseInt(session.year)}</div>


                    <IncomeUsedRow am1={page.Assets} am2={page.Gain}  am3={page.eqliab} am4={page.eq_income} am5={page.eq_tax} am6={page.eq_next}/>
                    {
                        statusReport.map((row,line) => (
                            <IncomeUsedRow  key={"Status"+line}  
                                                am1={row.assets.yearEnd} tx1={row.assets.name} 
                                                am2={row.gals.yearEnd}   tx2={row.gals.name} 
                                                am3={row.eqLiab.yearEnd} tx3={row.eqLiab.name} 
                                                am4={row.eqLiab.income} // 20230218 income used
                                                am5={row.eqLiab.tax} // 20230218 tax paid
                                                am6={row.eqLiab.next} // 20230218 next year
                                               />                       
                        ))
                    }
                </div>



                { console.log("108 OVERVIEW show results") }
                <div className="FIELD" key={"Closing"} id={'Overview4'} style= {{ 'display': aPages[4]}} >

                    <div className="FIELD LNAM">&nbsp;</div>
                    <div className="attrLine">{page.Closing}&nbsp;{parseInt(session.year)}</div>


                    <ClosingRow  am1={page.Assets}  am2={page.Init}  am3={page.YearEnd}  am4={page.income}  am5={page.Tax}  am6={page.Next}    /> 
                    {
                        statusReport.map((row,line) => (
                            <ClosingRow  key={"Status"+line}  
                                                am1={row.assets.init}     tx1={row.assets.name} 
                                                am2={row.eqLiab.init}     tx2={row.eqLiab.name} 
                                                am3={row.eqLiab.yearEnd}  tx3={row.eqLiab.name}  
                                                am4={row.eqLiab.income}   tx4={row.eqLiab.name}
                                                am5={row.eqLiab.tax}      tx5={row.eqLiab.name} 
                                                am6={row.eqLiab.next}     tx6={row.eqLiab.name}
                                               />                       
                        ))
                    }
                </div>



                <div className="FIELD"  key={"HGB"}  id={'Overview5'} style= {{ 'display': aPages[5]}} > 
                { console.log("110 STATUS show HBG275 S1") }
                    <div className="attrLine">
                        <div className="FIELD LNAM">&nbsp;</div>
                        <div className="FIELD LNAM">{page.GainLoss + ' ' + session.year}</div>
                    </div>
                    {hgbReport.map((row,i) => (
                        <HGB275Row  key={"HGB1"+i}  jArgs={row}  id={"Args"+i} />    
                    ))}
                </div>




                {arrBalance.map((balance,n) => (
                <div className="FIELD" key={"Balance0"+n} id={tabName+(balanceBase+n)} style= {{ 'display': aPages[balanceBase+n]}} >
                        { console.log("120 STATUS showbalance "+n) }
                        <div className="FIELD LNAM">&nbsp;</div>
                        <div className="attrLine">{[page.BalanceOpen,page.BalanceClose,page.BalanceNext][n] + ' ' + (parseInt(session.year))}</div>
                        {JSON.parse(balance).map((row,i) => ( 
                            <BalanceRow  key={"Balance"+n+"1"+i} jArgs={row} id={i} />    
                            
                        ))}
                    </div>
                ))}



                <div className="FIELD"  key={"FixedAssets"}  id={tabName+(assetsBase)}  style={{'display':aPages[assetsBase]}} >

                    <div className="FIELD LNAM">&nbsp;</div>
                    <div className="attrLine">{page.fixed}&nbsp;{parseInt(session.year)}</div>


                    { console.log("130 STATUS show fixed assets ") }

                    <FixedAssetsRow p={ {'idnt':'Name', 'type':'WKN/Typ', 
                            'date':page.AcquisitionDate,
                            'init':page.AcquisitionPrice, 
                            'nmbr':page.AssetNumber, // 'Anzahl',
                            'rest':page.AssetRemain, //'Zeitwert',
                            'cost':page.AssetPrice, // 'Stückpreis',
                            'gain':page.AssetGain  // 'Ertrag'} } />
                            }} /> 


                    {Object.keys(jAssets).map(function(key,n) {
                        var row = jAssets[key];
                        iRest+=BigInt(row.rest);
                        return (
                            <FixedAssetsRow  key={"Fixed0"+n}  p={{idnt:row.idnt,type:row.type,date:row.date,
                                init:cents2EU(row.orig),
                                nmbr:row.nmbr,
                                rest:cents2EU(row.rest),
                                cost:cents2EU(row.cost),
                                gain:cents2EU(row.gain)
                                }} />
                        )
                        })
                    }

                    <FixedAssetsRow p={{ 'idnt':jReport.xbrlFixed.de_DE, 'type':' ', 'date':session.year+"-12-31",
                            'init':' ', 
                            'nmbr':' ',
                            'rest':cents2EU(iRest),
                            'current':' ',
                            'cost':' ' } }
                    />
                </div>



                {Object.keys(jPartnerReport).map((jPartner,partnerNo) => ( 

                    <div className="FIELD" key={"Partner"+partnerNo} id={tabName+(partnerBase+partnerNo)} style= {{ 'display': aPages[partnerBase+partnerNo]}} >
                    { console.log("140 STATUS show taxPartner "+partnerNo) }
                            
                            <div className="attrLine"></div>
                            <div className="attrLine">{page.Tax}&nbsp;{parseInt(session.year)}</div>

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
                    <div className="FIELD" key={"Form"+index} id={tabName+(index+fixPages)} style= {{ 'display': aPages[index+fixPages+6]}} > 
                        { console.log("150 STATUS show txn pattern "+index) }
                        <div className="attrLine"/>
                        
                        <BookingForm    strKey={strKey}  form={matrix[strKey]} preBook={preBook} />
                        <BookingDisplay strKey={strKey}  form={displayRecord}  doBook={doBook} /> 
                    </div>
                )) : ""}
            
                
                <div className="attrLine"/>
                <div className="attrLine"/>

            </div>
            )}

            <FooterRow left={page.client}  midleft={page.author}  midright={page.register} right={page.reference}/>

        </Screen>
    )   
}


let iInitial=BigInt(0);
let iSumLeft=BigInt(0);
let iSumRite=BigInt(0);


function TXNReceiptSum(args) {
    return TXNReceipt("",args.text,args.jAmounts,args.jColumnHeads,null,args.id,args.removeCol,D_History,-1,0,null);
}


function TXNReceipt(token,text,jAmounts,jColumnHeads,jSum,id,removeCol,name,index,currLine,setCurrLine) {
    
    Object.keys(jAmounts).forEach(acct=>{
        let value = jAmounts[acct];        
        if(jSum && value && value.length>2) {   
            console.log("TXNReceipt "+acct+" add "+value);        
            if(jSum[acct]) {
                jSum[acct] = cents20EU(bigEUMoney(jSum[acct]) + bigEUMoney(value));
            }
        }
    })
    if(jSum) console.log("TXNReceipt ("+token+") jSum "+JSON.stringify(jSum));
    

    let comps = text.split(CSEP)
    let left = ""; 
    let rite = ""; 
    let iAmount = (name && name.length>1) ? bigEUMoney(jAmounts[name]) :BigInt(0);

    // detect first opening line, does not recognize D_INITIAL
    if(token==="1")     { left= cents2EU( iAmount);  iInitial=iAmount; } 
    else {
        if(iAmount>0) { left= cents2EU( iAmount);  iSumLeft+=iAmount; }
        if(iAmount<0) { rite= cents2EU(-iAmount);  iSumRite-=iAmount; }
    }

    // 20241228 move currLine by clicking on the receipt number in the rightmost column
    let bDrag = (index==currLine) ? "true":"false";

    return( // FIELD
        <div id="TXNReceipt">
            <div className="attrLine"> <div className="FIELD LNAM">&nbsp;</div></div>
            <div className={index==currLine?"attrLine key":"attrLine"}> 
                    <div className="FIELD DATE" draggable={bDrag} >{comps[0]}</div>
                    <div className="FIELD NAME" draggable={bDrag}>{comps[1]}</div>                                        
                    <div className="FIELD NAME" draggable={bDrag}>{comps[3]}</div>
                    <div className="FIELD NAME" draggable={bDrag}>{comps[4]}</div>
                    {(name && name.length>1) ? ( <div className="FIELD MOAM" draggable={bDrag}>{left}</div>  ):""}
                    {(name && name.length>1) ? ( <div className="FIELD MOAM" draggable={bDrag}>{rite}</div>  ):""}
                    <div className="FIELD SEP" >&nbsp;</div>
                    <div className="FIELD LNAM" draggable={bDrag}>{comps[2]}</div>                                        
                    <div className="FIELD LNAM" draggable={bDrag} onClick={()=>{if(setCurrLine) setCurrLine(index)}}>{id}</div>
            </div>
        </div>
        
)}      

function TXNReceiptTotal(textSum,name,strInterest,year,textYearEnd) {
    return( // FIELD
        <div id="TXNReceiptTotal">
            <div className="attrLine"> <div className="FIELD LNAM">&nbsp;</div></div>
            <div className="attrLine">  <div className="FIELD DATE">{year}-12-31</div>
                                        <div className="FIELD NAME">{textSum+' '+name}</div>
                                        <div className="FIELD MOAM" draggable="true">={(strInterest && strInterest.length)? '('+cents20EU(strInterest)+')':''}</div> 
                                        <div className="FIELD TAG">&nbsp;</div>
                                        <div className="FIELD MOAM" draggable="true">{cents20EU(iInitial)}</div>
                                        <div className="FIELD MOAM" draggable="true">+{cents20EU(iSumLeft)}</div> 
                                        <div className="FIELD MOAM" draggable="true">-{cents20EU(iSumRite)}</div> 
                                        <div className="FIELD MOAM" draggable="true">={cents20EU(iInitial+iSumLeft-iSumRite)}</div> 
                                        <div className="FIELD SEP" >&nbsp;</div>
                                        <div className="FIELD NAME">{textYearEnd}</div>
            </div>
        </div>
    )
}
function nop() {}

/*
function HistoryRow(args) { 
    let amounts =[]; let cols=[];  let count=0;
    let off = args.removeCol ? args.removeCol : nop;
    Object.keys(args.jColumnHeads).forEach(c=>
        {if(args.jColumnHeads[c] && args.jColumnHeads[c].length>1 && count++<12 ) { cols.push(c); amounts.push(args.jValues[c]?args.jValues[c]:"-,--")}});
    return (
        <div className="attrLine">
            { amounts.map((value,i)=>(
                <div className="FIELD MOAM" key={'sel'+i} onClick={()=>{off(cols[i])}}>{value}</div>
            )) }
        </div>
    )
    
}
*/

function HGB275Row({ jArgs, id }) {
    return(
        <div className={"attrLine line"+id} >
            <div className="FIELD C100"></div>
            <div className="FIELD SEP">&nbsp;</div>
            <div className="FIELD SEP">|&nbsp;</div>
            <div className="FIELD LNAM"> {jArgs.tx1}</div>
            <div className="FIELD MOAM"> {(jArgs.an3)}</div>
            <div className="FIELD MOAM"> {(jArgs.an2)}</div>
            <div className="FIELD MOAM"> {(jArgs.an1)}</div>
            <div className="FIELD SEP">|&nbsp;</div>
        </div>
    )
}


function BalanceRow({ jArgs, id }) {
    if(jArgs)
    return(
        <div className={"attrLine"} >
            <div className="FIELD LNAM"> {jArgs.tw1}</div>
            <div className="FIELD MOAM"> {jArgs.am4}</div>
            <div className="FIELD MOAM"> {jArgs.am3}</div>
            <div className="FIELD MOAM"> {jArgs.am2}</div>
            <div className="FIELD MOAM"> {jArgs.am1}</div>
            <div className="FIELD SEP">|&nbsp;</div>
            <div className="FIELD LNAM"> {jArgs.tx1}</div>
            <div className="FIELD MOAM"> {jArgs.an4}</div>
            <div className="FIELD MOAM"> {jArgs.an3}</div>
            <div className="FIELD MOAM"> {jArgs.an2}</div>
            <div className="FIELD MOAM"> {jArgs.an1}</div>
        </div>
    )
}


function FixedAssetsRow(mRow) {
    console.log("FixedAssetsRow mRow="+JSON.stringify(mRow));
    return (
        <div className="attrLine">
            <div className="FIELD LNAM">{mRow.p.idnt}</div>
            <div className="FIELD NAME">{mRow.p.type}</div>
            <div className="FIELD NAME">{mRow.p.date}</div>
            <div className="FIELD MOAM">{mRow.p.init}</div>
            <div className="FIELD MOAM">{mRow.p.nmbr}</div>
            <div className="FIELD MOAM">{mRow.p.rest}</div>
            <div className="FIELD MOAM">{mRow.p.cost}</div>
            <div className="FIELD MOAM">{mRow.p.gain}</div>
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

function FooterRow({left,midleft,midright,right}) {
    return(
            <div className="attrLine">
                <div className="FIELD XFER">{left},&nbsp;</div>
                <div className="FIELD XFER">{midleft},&nbsp;</div>
                <div className="FIELD L280">{midright}</div>
                <div className="FIELD L280">{right}</div>
            </div>
    )
}

