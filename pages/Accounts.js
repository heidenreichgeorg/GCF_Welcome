
import { useEffect, useState } from 'react';

import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { cents2EU}  from '../modules/money';

import { D_Balance, D_Page, D_Report, X_ASSETS, X_INCOME, X_EQLIAB, SCREENLINES } from '../modules/terms.js'
import { useSession } from '../modules/sessionmanager';

export default function Accounts() {
    
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

    
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/Transfer?client="+client+"&year="+year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/Balance?client="+client+"&year="+year; }

    let page = sheet[D_Page];

    let  standsPages = [ 'init', 'yearEnd', 'next' ];
    let aStands = standsPages.map((currentPage)=>(makeAccountsPosition(sheet,currentPage)));
    let aPages = [];
    for(let p=1;p<standsPages.length;p++) aPages[p]='none'; 
    aPages[0]='block';
    let pageText =  ['Init', 'Close',  'Next'].map((name) =>( page[name] ));

    const tabName = 'AccountsContent';
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={pageText} tabName={tabName}>
            { aStands.map((report,n)=>
                <div className="ulliTab" id={tabName+n} style= {{ 'display': aPages[n]}} >
                    <div className="attrLine">{[
                        page.AcctOpen+' '+session.year,
                        page.AcctClose+' '+session.year,
                        page.AcctNext+' '+(parseInt(session.year)+1)][n]}</div>
                    {report.map((row) => 
                        <AccountsRow am1={row.gLeft} tx1={row.nLeft} am2={row.gMidl} tx2={row.nMidl} am3={row.gRite} tx3={row.nRite} />                       
                    )}                    
                    <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                    <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                </div>
            )}
        </Screen>
    )
    
}

function makeAccountsPosition(response,currentPage) {

    const page = response[D_Page];

    var jReport = response[D_Report];
    console.log("makeAccountsPosition from response D_Report"+JSON.stringify(Object.keys(jReport)));

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
    console.log("makeAccountsPosition from response D_Balance"+JSON.stringify(Object.keys(jAccounts)));

    console.log(JSON.stringify(response));
    
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
    let maxRow= SCREENLINES-1;
    if(maxCol>maxRow) maxRow=maxCol;
    if(maxCom>maxRow) maxRow=maxCom;
    if(maxCor>maxRow) maxRow=maxCor;

    let statusData = []; for(let i=0;i<=maxRow && i<=SCREENLINES;i++) statusData[i]={};
    if(maxRow>SCREENLINES) maxRow=SCREENLINES; // 20221201
    
    let iLeft=0;
    statusData[iLeft++].gLeft= page.Assets;

    for (let name in aLeft)   {
        var account=aLeft[name];
        var value = account[currentPage];
        var iName = account.name;

        console.log("STATUS.JS STATUSDATA LEFT "+iLeft+" "+name+"="+value);

        if(iLeft<SCREENLINES) {
            statusData[iLeft]={"gLeft":value,"nLeft":iName};
        }
        iLeft++;
    }
    for (let i=iLeft;i<maxRow && i<SCREENLINES;i++) { statusData[i]={ "gLeft":null, "nLeft": " " }; }


    let iMidl=0;
    statusData[iMidl++].gMidl= page.GainLoss;

    for (let name in aMidl)   {
        var account=aMidl[name];
        var value = account[currentPage];
        var iName = account.name;

        statusData[iMidl].gMidl = value;
        statusData[iMidl].nMidl = iName;
        iMidl++;
    }
    for (let i=iMidl;i<maxRow && i<SCREENLINES;i++) { statusData[i].gMidl=null; statusData[i].nMidl=' '; }


    let iRite=0;
    statusData[iRite++].gRite= page.eqliab;

    for (let name in aRite)   {
        var account=aRite[name];
        var value = account[currentPage];
        var iName = account.name;

        if(iRite<SCREENLINES) {
            statusData[iRite].gRite = value;
            statusData[iRite].nRite = iName;
            iRite++;
        }
        
    }
    for (let i=iRite;i<maxRow && i<SCREENLINES;i++) { statusData[i].gRite=null; statusData[i].nRite=' '; }

    
   return statusData;
}

function AccountsRow({ am1,tx1, am2, tx2, am3, tx3, d, n, l}) {

    return(
        <div className="attrLine">
            <div className="FIELD MOAM"> {cents2EU(am1)}</div>
            <div className="FIELD SYMB"> {tx1}</div>
            <div className="FIELD SEP"> &nbsp;</div>
            <div className="FIELD MOAM"> {cents2EU(am2)}</div>
            <div className="FIELD SYMB"> {tx2}</div>
            <div className="FIELD SEP"> &nbsp;</div>
            <div className="FIELD MOAM"> {cents2EU(am3)}</div>
            <div className="FIELD SYMB"> {tx3}</div>            
        </div>
        
    )
}



