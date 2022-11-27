
import { useEffect, useState, useRef  } from 'react';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { useSession } from '../modules/sessionmanager';

import { D_Balance, D_Partner_NET, D_Page, D_Report, D_Schema, X_ASSETS, X_EQLIAB, X_INCOME, SCREENLINES }  from '../terms.js';

export default function Partner() {

    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
 
    useEffect(() => {
        if(status !== 'success') return;
        //setYear(session.year);
        //setClient(session.client);
        let state = null;
        try { state=JSON.parse(sessionStorage.getItem('session')); } catch(err) {}
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
        }
    }, [status])

    if(!sheet) return null; //'Loading...';

    
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="http://localhost:3000/history?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="http://localhost:3000/status?client="+session.client+"&year="+session.year; }
    
    let page = sheet[D_Page];
    
    var jReport = JSON.parse(JSON.stringify(sheet[D_Partner_NET]));
    console.log("Partner() with response D_Report"+JSON.stringify(jReport));

    let aPages = [];

    let jLength = Object.keys(jReport).length;
    let  filler=[];
    for(let p=jLength;p<SCREENLINES;p++) {
        filler.push({});
    }

    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aPages} >
            
            <div class="ulliTab" id={"PageContent1"} style= {{ 'display': 'block'}} >
            <PartnerRow p={ {'name':'name', 'init':'init', 'credit':'credit', 'debit':'debit', 'yearEnd':'yearEnd', 'netIncomeOTC':'netIncomeOTC', 'netIncomeFin':'netIncomeFin', 'close':'close', 'tax':'tax', 'next':'next'} } />
                {Object.keys(jReport).map((id) => (
                    <PartnerRow p={jReport[id]}/>    
                ))}           

                { filler.map((row) => (
                    <PartnerRow p={row}/>    
                ))}    
                
                <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc} miscFunc={handleJSONSave}/>
                <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
            </div>
            
        </Screen>
    )
    
    function handleJSONSave() {
        console.log("1110 Status.handleJSONSave sessionId = "+session.id);
        const rqOptions = { method: 'GET', headers: {  'Accept': 'application/json'}};
        try {
            
            fetch(`${process.env.REACT_APP_API_HOST}/DOWNLOAD?sessionId=${session.id}`, rqOptions)
            .then((response) => response.blob())
            .then((blob) => URL.createObjectURL(blob))
            .then((url) => console.log("1120 handleJSONSave URL= "+ makeJSONButton(url)))
            .catch((err) => console.error("1127 handleJSONSave ERR "+err));
            
        } catch(err) { console.log("1117 GET /JSON handleJSONSave:"+err);}
        console.log("1140 Status.handleJSONSave EXIT");
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
}


function PartnerRow(mRow) {

    console.log("PartnerRow mRow="+JSON.stringify(mRow));

    

    return (

        <div class="attrLine">
            <div class="SYMB">{mRow.p.name}</div>
            <div class="MOAM">{mRow.p.init}</div>
            <div class="MOAM">{mRow.p.credit}</div>
            <div class="MOAM">{mRow.p.debit}</div>
            <div class="MOAM">{mRow.p.yearEnd}</div>
            <div class="MOAM">{mRow.p.netIncomeOTC}</div>
            <div class="MOAM">{mRow.p.netIncomeFin}</div>
            <div class="MOAM">{mRow.p.close}</div>
            <div class="TAX" >{mRow.p.tax}</div>
            <div class="MOAM">{mRow.p.next}</div>
        </div>
    
    )
}
