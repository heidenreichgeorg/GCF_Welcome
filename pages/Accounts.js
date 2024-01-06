
import { useEffect, useState } from 'react';

import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { cents2EU}  from '../modules/money';

import { D_Balance, D_Page, D_Report, J_ACCT, X_ASSETS, X_INCOME, X_EQLIAB, SCREENLINES } from '../modules/terms.js'
import { getSession,useSession, REACT_APP_API_HOST } from '../modules/sessionmanager';

const debug=false;

export default function Accounts() {
    
    const [sheet, setSheet]  = useState()
    const [ year, setYear]   = useState()
    const [client,setClient] = useState()
    const [addAfter, setAddAfter] = useState(J_ACCT);
    const { session, status } = useSession()

    useEffect(() => {
        if(status !== 'success') return;
        setYear(session.year);
        setClient(session.client);
        let state=getSession();
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

    let aPages = ['block'];
    for(let p=1;p<standsPages.length;p++) aPages[p]='none'; 

    let pageText =  ['Init', 'Close',  'Next'].map((name) =>( page[name] ));

    const tabName = 'AccountsContent';
    


    function addAccount() {
            
        const rqHeaders = {  'Accept': 'application/octet-stream',
                            'Access-Control-Allow-Origin':'*',
                            'Access-Control-Allow-Headers':'Origin, X-Requested-With, Content-Type, Accept, Authorization' };

        if(debug) console.log("1110 Accounts.addAccount("+addAfter+") sessionId = "+session.id);
        
        const rqOptions = { method: 'GET', headers: rqHeaders, mode:'cors'};
        try {                
            fetch(`${REACT_APP_API_HOST}/ADDACCOUNT?column=${addAfter}&client=${client}&year=${year}`, rqOptions)
            .then((response) => response.blob())
            .then((blob) => URL.createObjectURL(blob))
            .then((url) => console.log("1120 Accounts.addAccount  URL= "+ makeDownloadURL(url,session.client,session.year)))
            .catch((err) => console.error("1127 Accounts.addAccount ERR "+err));           
        } catch(err) { console.log("1117 GET /ADDACCOUNT Accounts.addAccount :"+err);}
        console.log("1140 Accounts.addAccount EXIT");
    }

    function makeDownloadURL(url,client,year) { 
        if(debug) console.log("1196 makeDownloadURL JSON "+url);
        if(client) {
            if(year) {
                let a = document.createElement('a');
                a.href = url
                a.download = "ADDACCT"+client+year+".json";
                a.style.display = 'block'; 
                a.className = "key";
                a.innerHTML = "Download";
                document.body.appendChild(a); 
                if(debug) console.log("1198 makeDownloadURL make button");
            } else console.log("1197 makeDownloadURL JSON client("+client+"), NO year");
        } else console.log("1195 makeDownloadURL JSON NO client");
        return url;
    };




    return (
        <Screen  aFunc={[prevFunc, nextFunc]} aText={["PREV","NEXT"]}  tabSelector={pageText} tabName={tabName}>
            { aStands.map((report,n)=>
                <div className="FIELD" key={"Accounts0"+n} id={tabName+n} style= {{ 'display': aPages[n]}} >
                    <div className="attrLine">{[
                        page.AcctOpen+' '+session.year,
                        page.AcctClose+' '+session.year,
                        page.AcctNext+' '+(parseInt(session.year)+1)][n]}</div>
                    {report.map((row,d) => 
                        <AccountsRow  key={"Accounts"+n+""+d}  am1={row.gLeft} tx1={row.nLeft} ac1={row.iLeft}
                                                           am2={row.gMidl} tx2={row.nMidl} ac2={row.iMidl}
                                                           am3={row.gRite} tx3={row.nRite} ac3={row.iRite}
                                                           set={(args)=>{
                                                                console.log('\n'); 
                                                                console.log("ACCOUNTS setAddAfter("+JSON.stringify(args)+")"); 
                                                                return setAddAfter(args.x);}} />                       
                    )}                    
                    <FooterRow left={page["client"]+" "+addAfter}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc} miscFunc={addAccount}/>
                    <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc} miscFunc={addAccount}/>
                </div>
            )}
        </Screen>
    )
    
}
function makeAccountsPosition(response,currentPage) {

    const page = response[D_Page];

    var jReport = response[D_Report];
    if(debug) console.log("makeAccountsPosition from response D_Report"+JSON.stringify(Object.keys(jReport)));

    var jAccounts = response[D_Balance];
    // add three additional accounts: ASSETS, EQLIAB, GAINLOSS
    if(jReport["xbrlAssets"].account) { 
        let ass = jReport["xbrlAssets"].account; 
        if(debug) console.log("ASSET "+JSON.stringify(ass)); 
        jAccounts["xbrlAssets"]=ass;
    }
    if(jReport["xbrlEqLiab"].account) { 
        let eql = jReport["xbrlEqLiab"].account; 
        if(debug) console.log("EQLIB "+JSON.stringify(eql)); 
        jAccounts["xbrlEqLiab"]=eql;
    }
    if(jReport["xbrlRegular"].account) { 
        let gls = jReport["xbrlRegular"].account; 
        if(debug) console.log("GALOS "+JSON.stringify(gls)); 
        jAccounts["xbrlRegular"]=gls;
    }
    if(debug) console.log("makeAccountsPosition from response D_Balance"+JSON.stringify(Object.keys(jAccounts)));

    if(debug) console.log("makeAccountsPosition = "+JSON.stringify(response));
    
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

    let statusData = []; for(let i=0;i<=maxRow && i<=SCREENLINES;i++) statusData[i]={ };
    if(maxRow>SCREENLINES) maxRow=SCREENLINES; // 20221201
    
    let iLeft=0;
    statusData[iLeft++].gLeft= page.Assets;

    for (let name in aLeft)   {
        var account=aLeft[name];
        var value = account[currentPage];
        var iName = account.name;

        if(debug) console.log("STATUS.JS STATUSDATA LEFT "+iLeft+" "+name+"="+value);

        if(iLeft<SCREENLINES) {
            statusData[iLeft]={ "iLeft":account.index, "gLeft":value,"nLeft":iName };
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
        statusData[iMidl].iMidl = account.index;
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
            statusData[iRite].iRite = account.index;
            statusData[iRite].gRite = value;
            statusData[iRite].nRite = iName;
            iRite++;
        }
        
    }
    for (let i=iRite;i<maxRow && i<SCREENLINES;i++) { statusData[i].gRite=null; statusData[i].nRite=' '; }

    
   return statusData;
}

function AccountsRow({ am1,tx1,ac1, am2,tx2,ac2,  am3,tx3,ac3 , set}) {


    return(
            <div className="attrLine">
                <div className="FIELD MOAM"> {cents2EU(am1)}</div>
                <div className="FIELD SYMB"> {tx1} <a onClick={() => set({ x:ac1 })}>{ac1}</a></div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM"> {cents2EU(am2)}</div>
                <div className="FIELD SYMB"> {tx2} <a onClick={() => set({ x:ac2 })}>{ac2}</a></div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM"> {cents2EU(am3)}</div>
                <div className="FIELD SYMB"> {tx3} <a onClick={() => set({ x:ac3 })}>{ac3}</a></div>        
                
            </div>
    )
}



