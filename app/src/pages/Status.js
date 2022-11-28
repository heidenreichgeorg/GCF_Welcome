
import { useEffect, useState } from 'react';

import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { iCpField, prettyTXN}  from '../modules/App';

import { D_Balance, D_Page, D_Report, D_History, D_Schema, X_ASSETS, X_INCOME, X_EQLIAB, SCREENLINES } from '../terms.js'
import { useSession } from '../modules/sessionmanager';


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

    if(!sheet) return null; // 'Loading...';

    
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="http://"+session.server.addr+":3000/partner?client="+client+"&year="+year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="http://"+session.server.addr+":3000/transfer?client="+client+"&year="+year; }


    function handleXLSave() {
        console.log("1110 Status.handleXLSave sessionId = "+session.id);
        const rqOptions = { method: 'GET', headers: {  'Accept': 'application/octet-stream'}};
        // for the POST body : , 'Content-Type': 'application/octet-stream'
        try {
            
            fetch(`${process.env.REACT_APP_API_HOST}/EXCEL?sessionId=${session.id}`, rqOptions)
            .then((response) => response.blob())
            .then((blob) => URL.createObjectURL(blob))
            .then((url) => console.log("1120 handleXLSave URL= "+ makeXLSButton(url)))
            .catch((err) => console.error("1127 handleXLSave ERR "+err));
            
        } catch(err) { console.log("1117 GET /ECEL handleXLSave:"+err);}
        console.log("1140 Status.handleXLSave EXIT");
    }

    function makeXLSButton(url) { 

        console.log("1196 makeXLSButton XLSX "+url);
        
        let a = document.createElement('a');
        a.href = url
        a.download = "CLIENT.XLSX";
        a.style.display = 'block'; // was none
        a.className = "key";
        a.innerHTML = "Download";
        document.body.appendChild(a); 
        console.log("1198 downloadButton make button");
        
        return url;
    };
      


    let page = sheet[D_Page];
    let report = makeStatusData(sheet);

    const aNums = [0];
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aNums} >
            {
                report.map((row,l) => (
                    <StatusRow am1={row.gLeft} tx1={row.nLeft} am2={row.gMidl} tx2={row.nMidl} am3={row.gRite} tx3={row.nRite} d={row.dTran} n={row.nTran} l={row.lTran}/>                       
                ))
            }
            <div className="attrLine"><div className="key" onClick={handleXLSave}>SAVE</div></div>
            <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
            <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
        </Screen>
    )
    
}

function makeStatusData(response) {


    var jReport = response[D_Report];
    console.log("makeStatusData from response D_Report"+JSON.stringify(Object.keys(jReport)));

    var jHistory = response[D_History];
    var gSchema = response[D_Schema];

    var jAccounts = response[D_Balance];
    // add three additional accounts: ASSETS, EQLIAB, GAINLOSS
    if(jReport["xbrlAssets"].account) { 
        let ass = jReport["xbrlAssets"].account; 
        console.log("ASSET "+JSON.stringify(ass)); 
        jAccounts["xbrlAssets"]=ass;
    }
    if(jReport["xbrlEqLiab"].account) { 
        let eql = jReport["xbrlEqLiab"].account; 
        console.log("EQLIB "+JSON.stringify(eql)); 
        jAccounts["xbrlEqLiab"]=eql;
    }
    if(jReport["xbrlRegular"].account) { 
        let gls = jReport["xbrlRegular"].account; 
        console.log("GALOS "+JSON.stringify(gls)); 
        jAccounts["xbrlRegular"]=gls;
    }
    console.log("makeStatusData from response D_Balance"+JSON.stringify(Object.keys(jAccounts)));

    
    // build three columns
    let aLeft={};
    let aMidl={};
    let aRite={};

    for (let name in jAccounts)   {
        var account=jAccounts[name];
        if(account.xbrl.length>1) {
            var xbrl = account.xbrl.split('\.').reverse();
            var xbrl_pre = xbrl.pop()+ "."+ xbrl.pop();
            if(xbrl_pre===X_ASSETS) aLeft[name]=account;
            if(xbrl_pre===X_INCOME) aMidl[name]=account;
            if(xbrl_pre===X_EQLIAB) aRite[name]=account;
        }
    }
    
    let maxCol = Object.keys(aLeft).length;
    let maxCom = Object.keys(aMidl).length;
    let maxCor = Object.keys(aRite).length;
    let maxRow= SCREENLINES;
    if(maxCol>maxRow) maxRow=maxCol;
    if(maxCom>maxRow) maxRow=maxCom;
    if(maxCor>maxRow) maxRow=maxCor;

    let statusData = []; for(let i=0;i<=maxRow && i<SCREENLINES;i++) statusData[i]={};
    
    let iLeft=0;
    statusData[iLeft++].nLeft= "Assets";

    for (let name in aLeft)   {
        var account=aLeft[name];
        var yearEnd = account.yearEnd;
        var iName = account.name;

        console.log("STATUS.JS STATUSDATA LEFT "+iLeft+" "+name+"="+yearEnd);

        if(iLeft<SCREENLINES) {
            statusData[iLeft]={"gLeft":yearEnd,"nLeft":iName};
        }
        iLeft++;
    }
    for (let i=iLeft;i<maxRow && i<SCREENLINES;i++) { statusData[i]={ "gLeft":" ", "nLeft": " " }; }


    let iMidl=0;
    statusData[iMidl++].nMidl= "Gain/Loss";

    for (let name in aMidl)   {
        var account=aMidl[name];
        var yearEnd = account.yearEnd;
        var iName = account.name;

        statusData[iMidl].gMidl = yearEnd;
        statusData[iMidl].nMidl = iName;
        iMidl++;
    }
    for (let i=iMidl;i<maxRow && i<SCREENLINES;i++) { statusData[i].gMidl=' '; statusData[i].nMidl=' '; }


    let iRite=0;
    statusData[iRite++].nRite= "Equity/Liab";

    for (let name in aRite)   {
        var account=aRite[name];
        var yearEnd = account.yearEnd;
        var iName = account.name;

        if(iRite<SCREENLINES) {
            statusData[iRite].gRite = yearEnd;
            statusData[iRite].nRite = iName;
            iRite++;
        }
        
    }
    for (let i=iRite;i<maxRow && i<SCREENLINES;i++) { statusData[i].gRite=' '; statusData[i].nRite=' '; }

    // build fourth column with recent transactions

    let iHistory=Object.keys(jHistory).map((x) => (x));

    if(jHistory && gSchema.Names && gSchema.Names.length>0) {
        var names=gSchema.Names;
        var aLen = gSchema.assets;
        var eLen = gSchema.eqliab;

        let hLen = Object.keys(jHistory).length;
        var bLine=hLen;
        var iTran=maxRow;

        statusData[0].lTran= "Recent Transactions";

        for (let hash in jHistory)  {

            if(bLine<maxRow && iTran>0) {
        
                let jPrettyTXN = prettyTXN(jHistory,hash,null,null,names,aLen,eLen);
                jPrettyTXN.credit.shift();
                jPrettyTXN.debit.shift();
                jPrettyTXN.debit.shift();
                let aMount=jPrettyTXN.credit.concat(jPrettyTXN.debit);
                aMount.push("-.--"); aMount.push("-.--"); aMount.push("-.--");

                let sAmount = (aMount[0]+"  "+aMount[1]+"  "+aMount[2]+"  "+aMount[3]+ " ").slice(0,iCpField);

                iTran--;
                statusData[iTran].dTran=jPrettyTXN.entry[0].slice(2);
                statusData[iTran].nTran=jPrettyTXN.entry[1].slice(0,9);
                statusData[iTran].lTran= sAmount;                                
            }
            bLine--;
        }
    }
    
   return statusData;
}

function StatusRow({ am1,tx1, am2, tx2, am3, tx3, d, n, l}) {

    return(
        <div className="attrLine">
            <div className="MOAM"> {am1}</div>
            <div className="SYMB"> {tx1}</div>
            <div className="SEP"> &nbsp;</div>
            <div className="MOAM"> {am2}</div>
            <div className="SYMB"> {tx2}</div>
            <div className="SEP"> &nbsp;</div>
            <div className="MOAM"> {am3}</div>
            <div className="SYMB"> {tx3}</div>
            <div className="SEP"> &nbsp;</div>
            <div className="SYMB"> {d}</div>
            <div className="SYMB"> {n}</div>
            <div className="LTXT">{l}</div>
        </div>
        
    )
}



