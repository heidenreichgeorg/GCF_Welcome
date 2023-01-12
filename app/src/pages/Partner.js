/*

HTTPS

download JSON function

for each account in D_Balance with XBRL=de-gaap-ci_bs.ass.currAss.receiv.other.otherTaxRec.CapTax

    for each partner in D_Partner take gain/denom
*/

/* global BigInt */

import { useEffect, useState   } from 'react';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { useSession } from '../modules/sessionmanager';
import { cents2EU } from  '../modules/money'
import { makeHGB275S2Report } from "../modules/App.js"
import { D_Balance, D_Partner, D_Page, SCREENLINES }  from '../terms.js';


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
    
    var jReport = JSON.parse(JSON.stringify(sheet[D_Partner]));
    var jBalance = sheet[D_Balance];

    function makeTax(partner,index,ifix) {
        let igain=BigInt(partner.gain);
        let ideno=BigInt(partner.denom);               
        let taxID = partner.taxID;
        let result= { 'name': partner.name, 'SteuerID':taxID };
        Object.keys(jBalance).map((name,index) => (jBalance[name].xbrl==='de-gaap-ci_bs.ass.currAss.receiv.other.otherTaxRec.CapTax'?
 //                                                   (result[name]=cents2EU(((ifix+BigInt(jBalance[name].yearEnd))*igain)/ideno))
                                                    (result[name]=cents2EU((5n+BigInt(jBalance[name].yearEnd+"0"))*igain/ideno/10n))
                                                    :{}));

        console.log("Partner("+index+") with "+igain+"/"+ideno+"response D_Report"+JSON.stringify(result));
        return result;
    }
    
    let  taxHeaders=[];
    let  taxDetails=[];

    // fix are cents to compensate for rounding when tax is shared among partners
    let fix = Object.keys(jReport).length-1;
    Object.keys(jReport).map((index) => (taxDetails.push(makeTax(jReport[index],index,BigInt(fix)))));
    

    let hKeys=Object.keys(taxDetails[0]);
    taxHeaders.push(  hKeys );
    


    let jLength = 20; // Object.keys(jReport).length  + 2 + Object.keys(aTax).length;
    let  filler=[];
    for(let p=jLength;p<SCREENLINES+1;p++) {
        filler.push({});
    }
    
    let hgbReport = makeHGB275S2Report(sheet) ;
    let shortReport = hgbReport.filter((line,l) => line.tx1 && l<15);

    let jPage =  {'name':'Summe', 
            'init':0, 
            'credit':0,
            'debit':0,
            'yearEnd':0,
            'netIncomeOTC':0,
            'netIncomeFin':0,
            'close':0,
            'tax':0,
            'next':0 };

    // 20230109
    function initColumns() {
        Object.keys(jPage).map((key,pos)=>(pos==0?'Summe':jPage[key]="0"));
        return ""; // value walks into page
    }
    function addColumns(row) {
        Object.keys(jPage).map((key,pos)=>(pos==0?'Summe':jPage[key]=(""+(BigInt(jPage[key])+BigInt(row[key])))));
        return "."; // value walks into page
    }

    let partnerPages = Object.keys(jReport).map((_,i)=>i==0?'block':'none');
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={partnerPages} >
            
            {Object.keys(jReport).map((jPartner,partnerNo) => ( 

                <div className="ulliTab" id={"PageContent"+partnerNo} style= {(partnerNo==0?{ 'display': 'block'}:{ 'display': 'none'})} >

                    
                    { shortReport.map((row,i)=> (
                        <HGB275Row jArgs={row} id={"Args"+i} />
                        )
                    )}


<FlexRow p={[' ']}/>    

                    <PartnerRow p={ {'name':page.Name, 
                            'init':page.Init, 
                            'credit':page.Credit,
                            'debit':page.Debit,
                            'yearEnd':page.YearEnd,
                            'netIncomeOTC':page.RegularOTC,
                            'netIncomeFin':page.RegularFIN,
                            'close':page.Close,
                            'tax':page.PaidTax,
                            'next':page.NextYear} } />
                    
                    
                    <PartnerRow p={jReport[partnerNo]}/>    
                    

                    { ['nbsp;'].map(function(){ initColumns(); Object.keys(jReport).map((id)=>(addColumns(jReport[id]))); return ' '})}

                    <PartnerRow p={jPage}/>    

                    <FlexRow p={[' ']}/>    

                    { //taxDetails.map((row) =>(console.log(JSON.stringify(taxDetails)))) 
                    }
                                        

                    { taxDetails.map((row,i) => ((i==partnerNo)?
                        
                        <div className='attrLine'>                      
                            {Object.keys(row).map((fieldName) => <NamedAmount p={{'name':fieldName==='name'?'':fieldName,'amnt':row[fieldName]}}/>
                            )}                       
                        </div>
                    :""))}    

                    { filler.map((row) => (
                        <PartnerRow p={row}/>    
                    ))}    
                    
                    <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc} miscFunc={handleJSONSave}/>
                    <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                </div>

            ))} 

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

function NamedAmount(mRow) {
    console.log("NamedRow "+JSON.stringify(mRow));
    return(
        <div>
        <div className="IDNT">{mRow.p.amnt}</div>
        <div className="SYMB">{mRow.p.name}</div>
        </div>
    )
}

function PartnerRow(mRow) {

     console.log("PartnerRow mRow="+JSON.stringify(mRow));

    return (

        <div className="attrLine">
            <div className="SYMB">{mRow.p.name}</div>
            <div className="MOAM">{cents2EU(mRow.p.init)}</div>
            <div className="MOAM">{cents2EU(mRow.p.credit)}</div>
            <div className="MOAM">{cents2EU(mRow.p.debit)}</div>
            <div className="MOAM">{cents2EU(mRow.p.yearEnd)}</div>
            <div className="MOAM">{cents2EU(mRow.p.netIncomeOTC)}</div>
            <div className="MOAM">{cents2EU(mRow.p.netIncomeFin)}</div>
            <div className="MOAM">{cents2EU(mRow.p.close)}</div>
            <div className="MOAM" >{cents2EU(mRow.p.tax)}</div>
            <div className="MOAM">{cents2EU(mRow.p.next)}</div>
        </div>
    
    )
}


function HGB275Row({ jArgs, id }) {
    return(
        <div className={"attrLine line"+id} >
            <div className="LNAM"> {jArgs.tx1}</div>
            <div className="MOAM"> {jArgs.an3}</div>
            <div className="MOAM"> {jArgs.an2}</div>
            <div className="MOAM"> {jArgs.an1}</div>
        </div>
    )
}

