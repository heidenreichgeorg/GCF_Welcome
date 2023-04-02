/*

HTTPS

download JSON function

for each account in D_Balance with XBRL=de-gaap-ci_bs.ass.currAss.receiv.other.otherTaxRec.CapTax
        account.xbrl==X_ASSET_CAPTAX

    for each partner in D_Partner take gain/denom
*/

/* xglobal BigInt */


import { useEffect, useState   } from 'react';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { REACT_APP_API_HOST,useSession } from '../modules/sessionmanager';
import { cents2EU } from  '../modules/money'
import { makeHGBReport } from "../modules/App.js"
import { X_ASSET_CAPTAX, D_Balance, D_Partner, D_Page, SCREENLINES }  from '../modules/terms.js';

export default function Partner() {

    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
    const [ showState,toggle] = useState(null)
 
    useEffect(() => {
        if(status !== 'success') return;
        let state = null;
        try { state=JSON.parse(sessionStorage.getItem('session')); } catch(err) {}
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
        }
    }, [status])



    if(!sheet) return null; //'Loading...';

    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/Operations?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/Status?client="+session.client+"&year="+session.year; }
    
    let page = sheet[D_Page];
    
    var jReport = JSON.parse(JSON.stringify(sheet[D_Partner]));
    var jBalance = sheet[D_Balance];
    
    let  taxHeaders=[];
    let  taxDetails=[];

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

        console.log("Partner("+index+") with "+igain+"/"+ideno+"response ="+iSum+" % "+taxPaid);
        return result;
    }

    Object.keys(jReport).map((index) => (taxDetails.push(makeTax(jReport[index],index))));
    

    let hKeys=Object.keys(taxDetails[0]);
    taxHeaders.push(  hKeys );
    


    let jLength = 22; // Object.keys(jReport).length  + 2 + Object.keys(aTax).length;
    let  filler=[];
    for(let p=jLength;p<SCREENLINES;p++) {
        filler.push({});
    }
    
    let hgbReport = makeHGBReport(sheet) ;
    let shortReport = hgbReport.filter((line,l) => line.tx1 && l<15);

    let jPage =  {'name':'Gesamthand', 
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

    
    const tabName = 'PartnerContent';
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={Object.keys(jReport).map((i)=>(jReport[i].name))} tabName={tabName}>
            
            <div className="attrLine">{page.GainLoss + ' ' + session.year}</div>

            {Object.keys(jReport).map((_,partnerNo) => ( 

                <div  key={"Partner0"+partnerNo}  className="SWITCH" id={tabName+partnerNo} style= {(partnerNo==0?{ 'display': 'block'}:{ 'display': 'none'})} >
                    
                    { shortReport.map((row,i)=> (
                        <HGB275Row  key={"Partner1"+i}  jArgs={row} id={"Args"+i} />
                        )
                    )}

                    <FlexRow p={[' ']}/>    
                    <div className="attrLine">{ [''].map(function(){ 
                        initColumns(); 
                        Object.keys(jReport).map((id)=>(console.log("ADDCOLUMNS "+JSON.stringify(jReport[id])))); 
                        Object.keys(jReport).map((id)=>(addColumns(jReport[id]))); 
                        return page.AcctHistory + ' ' + session.year})}
                    </div>                        

                    <PartnerTitleRow p={ {'name':page.Name, 
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
                    
                    <PartnerRow p={jPage}/>    

                    <FlexRow p={['Steuerbescheinigung '+session.year]}/>    
                                        
                    { taxDetails.map((row,i) => ((i==partnerNo)?
                        
                        <div className='attrLine'  key={"Partner2"+i} >                      
                            {Object.keys(row).map((fieldName,j) => <NamedAmount  key={"PartnerA"+j}  p={{'name':fieldName==='name'?'':fieldName,'amnt':row[fieldName]}}/>
                            )}                       
                        </div>
                    :""))}    

                    { filler.map((row,k) => (
                        <PartnerRow  key={"Partner3"+k} p={row}/>    
                    ))}    

                    <div className="attrLine">
                        <label classname="key" onClick={showReport}>Report</label>
                        
                    </div>


                    <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc} miscFunc={handleJSONSave}/>
                    <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>


                </div>

            ))} 

        </Screen>
    )
   
    
    function showReport(e) { console.log("SHOW"); let report=document.getElementById("fullReport"); if(report) report.style={'display':'block'};}
    //function hideReport(e) { console.log("HIDE"); let report=document.getElementById("fullReport"); if(report) report.style={'display':'none'}; }

    function handleJSONSave() {
        console.log("1110 Partner.handleJSONSave sessionId = "+session.id);
        const rqOptions = { method: 'GET', headers: {  'Accept': 'application/json'}, mode:'cors'};
        try {
            
            fetch(`${REACT_APP_API_HOST}/DOWNLOAD?client=${session.client}&year=${session.year}`, rqOptions)
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
            <div className="FIELD FLEX">{sPairs}</div>
        </div>    
    )
}

function NamedAmount(mRow) {
    console.log("NamedRow "+JSON.stringify(mRow));
    return(
        <div>
        <div className="FIELD IDNT">{mRow.p.amnt}</div>
        <div className="FIELD SYMB">{mRow.p.name}</div>
        </div>
    )
}

function PartnerRow(mRow) {
    console.log("PartnerRow mRow="+JSON.stringify(mRow));
    return (
        <div className="attrLine">
            <div className="FIELD SNAM">{mRow.p.name}</div>
            <div className="FIELD MOAM">{cents2EU(mRow.p.init)}</div>
            <div className="FIELD MOAM">{cents2EU(mRow.p.credit)}</div>
            <div className="FIELD MOAM">{cents2EU(mRow.p.debit)}</div>
            <div className="FIELD MOAM">{cents2EU(mRow.p.yearEnd)}</div>
            <div className="FIELD MONY">{cents2EU(mRow.p.netIncomeOTC)}</div>
            <div className="FIELD MONY">{cents2EU(mRow.p.netIncomeFin)}</div>
            <div className="FIELD MOAM">{cents2EU(mRow.p.close)}</div>
            <div className="FIELD MONY">{cents2EU(mRow.p.tax)}</div>
            <div className="FIELD MOAM">{cents2EU(mRow.p.next)}</div>
        </div>
    )
}

function PartnerTitleRow(mRow) {
    console.log("PartnerTitleRow mRow="+JSON.stringify(mRow));
    return (
        <div className="attrLine">
            <div className="FIELD SNAM">{mRow.p.name}</div>
            <div className="FIELD TEAM">{cents2EU(mRow.p.init)}</div>
            <div className="FIELD TEAM">{cents2EU(mRow.p.credit)}</div>
            <div className="FIELD TEAM">{cents2EU(mRow.p.debit)}</div>
            <div className="FIELD TEAM">{cents2EU(mRow.p.yearEnd)}</div>
            <div className="FIELD TENY">{cents2EU(mRow.p.netIncomeOTC)}</div>
            <div className="FIELD TENY">{cents2EU(mRow.p.netIncomeFin)}</div>
            <div className="FIELD TEAM">{cents2EU(mRow.p.close)}</div>
            <div className="FIELD TENY">{cents2EU(mRow.p.tax)}</div>
            <div className="FIELD TEAM">{cents2EU(mRow.p.next)}</div>
        </div>
    )
}

function HGB275Row({ jArgs, id }) {
    return(
        <div className={"attrLine line"+id} >
            <div className="FIELD LNAM"> {jArgs.tx1}</div>
            <div className="FIELD MOAM"> {jArgs.an3}</div>
            <div className="FIELD MOAM"> {jArgs.an2}</div>
            <div className="FIELD MOAM"> {jArgs.an1}</div>
        </div>
    )
}

