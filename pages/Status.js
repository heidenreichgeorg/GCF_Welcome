import { useEffect, useState } from 'react';

import { useSession, REACT_APP_API_HOST } from '../modules/sessionmanager';

import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { makeStatusData }  from '../modules/App';
import { cents2EU }  from '../modules/money';

import { D_Page } from '../modules/terms.js'
import { useRouter } from 'next/router';

export default function Status() {
    
    const [sheet, setSheet]  = useState()
    const [ year, setYear]   = useState()
    const [client,setClient] = useState()

    const { session, status } = useSession()

    useEffect(() => {
        if(status !== 'success') return;
        setYear(session.year);
        setClient(session.client);
        let state = null;
        try { state=JSON.parse(sessionStorage.getItem('session')); } catch(err) {}
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
        }
    }, [status])

    if(!sheet) return 'Loading Status...';
    
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/Partner?client="+client+"&year="+year; } 
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/Transfer?client="+client+"&year="+year; }
//    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="https://"+session.server.addr+":3000/partner?client="+client+"&year="+year; }
//    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="https://"+session.server.addr+":3000/transfer?client="+client+"&year="+year; }

    function handleXLSave() {
        console.log("1110 Status.handleXLSave sessionId = "+session.id);
        const rqOptions = { method: 'GET', headers: {  'Accept': 'application/octet-stream'}, mode:'cors'};
        try {            
            fetch(`${process.env.REACT_APP_API_HOST}/EXCEL?sessionId=${session.id}`, rqOptions)
            .then((response) => response.blob())
            .then((blob) => URL.createObjectURL(blob))
            .then((url) => console.log("1120 handleXLSave URL= "+ makeXLSButton(url,session.client,session.year)))
            .catch((err) => console.error("1127 handleXLSave ERR "+err));           
        } catch(err) { console.log("1117 GET /EXCEL handleXLSave:"+err);}
        console.log("1140 Status.handleXLSave EXIT");
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
            } console.log("1197 makeXLSButton XLSX client("+client+"), NO year");
        } console.log("1195 makeXLSButton XLSX NO client");
        return url;
    };
      
    let page = sheet[D_Page];
    let sheet_status = makeStatusData(sheet);
    let report = sheet_status.report;

    const aNums = [0];
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aNums} >
            <StatusRow am1={page.Assets} am2={page.GainLoss}  am3={page.eqliab}/>
            {
                report.map((row,l) => (
                    <StatusRow am1={row.gLeft} tx1={row.nLeft} am2={row.gMidl} tx2={row.nMidl} am3={row.gRite} tx3={row.nRite} d={row.dTran} n={row.nTran} l={row.lTran}/>                       
                ))
            }
            <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc} miscFunc={handleXLSave}/>
            <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
        </Screen>
    )   
}

function showAccount(shrtName) { console.log("SHOW ACCOUNT "+shrtName); window.open("/History?client=HGKG&year=2023&APATTERN="+shrtName+"&SELECTALL=1"); }

function StatusRow({ am1,tx1, am2, tx2, am3, tx3, d, n, l}) {
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
            <div className="FIELD SYMB"> {d}</div>
            <div className="FIELD SNAM"> {n}</div>
            <div className="FIELD LTXT">{l}</div>
        </div>
    )
}



