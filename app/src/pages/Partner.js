/*

HTTPS

download JSON function

for each account in D_Balance with XBRL=de-gaap-ci_bs.ass.currAss.receiv.other.otherTaxRec.CapTax

    for each partner in D_Partner_NET take gain/denom
*/

import { useEffect, useState, useRef  } from 'react';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { useSession } from '../modules/sessionmanager';
import { cents2EU, setEUMoney } from  '../modules/money'

import { D_Balance, D_Partner_NET, D_Page, D_Report, D_Schema, X_ASSETS, X_EQLIAB, X_INCOME, SCREENLINES }  from '../terms.js';

export default function Partner() {

    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
 
    useEffect(() => {
        if(status !== 'success') return;
        let state = null;
        try { state=JSON.parse(sessionStorage.getItem('session')); } catch(err) {}
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
        }
    }, [status])

    if(!sheet) return null; //'Loading...';

    
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="https://"+session.server.addr+":3000/history?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="https://"+session.server.addr+":3000/status?client="+session.client+"&year="+session.year; }
    
    let page = sheet[D_Page];
    
    var jReport = JSON.parse(JSON.stringify(sheet[D_Partner_NET]));
    var jBalance = sheet[D_Balance];

    

    let aPages = [];

    function makeTax(partner,index,fix) {
        let gain=parseInt(partner.gain);
        let deno=parseInt(partner.denom);               
        let result= { 'name': partner.name };
        Object.keys(jBalance).map((name,index) => (jBalance[name].xbrl==='de-gaap-ci_bs.ass.currAss.receiv.other.otherTaxRec.CapTax'?
                                                    (result[name]=cents2EU(((fix+setEUMoney(jBalance[name].yearEnd).cents)*gain)/deno))
                                                    :{}));

        console.log("Partner("+index+") with "+gain+"/"+deno+"response D_Report"+JSON.stringify(result));
        return result;
    }
    
    let  taxHeaders=[];
    let  taxDetails=[];

    // fix are cents to compensate for rounding when tax is shared among partners
    let fix = Object.keys(jReport).length-1;
    let aTax = Object.keys(jReport).map((index) => (taxDetails.push(makeTax(jReport[index],index,fix))));
    

    let hKeys=Object.keys(taxDetails[0]);
    taxHeaders.push(  hKeys );
    

    let jLength = Object.keys(jReport).length  + 2 + Object.keys(aTax).length;

    let  filler=[];
    for(let p=jLength;p<SCREENLINES;p++) {
        filler.push({});
    }
    


    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aPages} >
            
            <div className="ulliTab" id={"PageContent1"} style= {{ 'display': 'block'}} >
            <PartnerRow p={ {'name':'name', 
                        'init':'init', 
                        'credit':'credit',
                        'debit':'debit',
                        'yearEnd':'yearEnd',
                        'netIncomeOTC':'netIncomeOTC',
                        'netIncomeFin':'netIncomeFin',
                        'close':'close',
                        'tax':'tax',
                        'next':'next'} } />
                {Object.keys(jReport).map((id) => (
                    <PartnerRow p={jReport[id]}/>    
                ))}           

                <FlexRow p={[]}/>    

                { taxHeaders.map((row) => (
                    <FlexRow p={row}/>    
                ))}    
                { taxDetails.map((row) => (
                    <FlexRow p={row}/>    
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


function FlexRow(mRow) {
    let keys = Object.keys(mRow.p);

    let sPairs = keys.map((kn) => ("  "+mRow.p[kn])).join("");

    return (
        <div className="attrLine">
            <div className="LFUL">{sPairs}</div>
        </div>    
    )
}


function PartnerRow(mRow) {

    // console.log("PartnerRow mRow="+JSON.stringify(mRow));

    return (

        <div className="attrLine">
            <div className="SYMB">{mRow.p.name}</div>
            <div className="MOAM">{mRow.p.init}</div>
            <div className="MOAM">{mRow.p.credit}</div>
            <div className="MOAM">{mRow.p.debit}</div>
            <div className="MOAM">{mRow.p.yearEnd}</div>
            <div className="MOAM">{mRow.p.netIncomeOTC}</div>
            <div className="MOAM">{mRow.p.netIncomeFin}</div>
            <div className="MOAM">{mRow.p.close}</div>
            <div className="TAX" >{mRow.p.tax}</div>
            <div className="MOAM">{mRow.p.next}</div>
        </div>
    
    )
}
