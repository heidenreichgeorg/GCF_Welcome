import { useEffect, useState } from 'react';
import { getSession, storeCarryOver, useSession, REACT_APP_API_HOST } from '../modules/sessionmanager';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { cents2EU }  from '../modules/money';
import { D_Page,D_Balance,T_CREDIT,T_DEBIT,X_ASS_FIXTAN,X_ASS_FIXFIN,X_ASS_RECEIV,X_ASS_CASH,X_INCOME_REGULAR,X_LIABILITY,X_EQUITY_VAR_UNL,X_EQUITY_VAR_LIM } from '../modules/terms.js'
import { book }  from '../modules/writeModule';




import { makeStatusData }  from '../modules/App';



export default function Status() {
    
    const [sheet, setSheet]  = useState()
    const [ year, setYear]   = useState()
    const [client,setClient] = useState()
    const { session, status } = useSession()
    const [txn,setTxn] = useState({ 'date':"", 'sender':"", 'refAcct':"", 'reason':"", 'refCode':"", 'credit':[],'debit':[]  })

    function addDebit(attribute) {        
        if(attribute && attribute.name && attribute.value) 
            {txn.debit.push(attribute);}
    }
    function addCredit(attribute) { 
        if(attribute && attribute.name && attribute.value) 
            {txn.credit.push(attribute);}
    }

    useEffect(() => {
        if(status !== 'success') return;
        setYear(session.year);
        setClient(session.client);
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
        
            <div className = "attrLine">
                <div className="FIELD XFER">Authenticate:...</div>
                <div className="FIELD"><input key="auth" id="auth" type="edit"></input></div>
                <div className="FIELD MOAM"><div key="go" className="KEY" onClick={login}>AUTH</div>
                </div>
            </div>
        
    );
    
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/Partner?client="+client+"&year="+year; } 
    //function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/Transfer?client="+client+"&year="+year; }
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


    function trackValue(slider,label) {
        let display=document.getElementById(label);
        display.innerHTML=slider.value;
    }
    
    function takeValue(accButton) {
        let ctlAccount=document.getElementById(accButton.id);
        const name=accButton.id.split('_')[0];
        console.log("takeValue id="+accButton.id+"  value="+ctlAccount.value);

        let ctlTotal=document.getElementById(VAL_ID_TOTAL);
        let ctlEuros=document.getElementById(VAL_ID_FIRST);
        let ctlCents=document.getElementById(VAL_ID_SECND);
        const euros=ctlEuros.innerHTML;
        const cents=ctlCents.innerHTML;
        const bigEuros = BigInt(euros)*100n;
        const bigCents = BigInt(cents);
        let strAmount = cents2EU(bigEuros+bigCents);
    
        ctlTotal.innerHTML = strAmount;
    
        let attribute = { 'name':name, 'value':strAmount };
        addCredit(attribute);
        setTxn(JSON.parse(JSON.stringify(txn))); // render full page
    }
    
    function Slider({ start, end, label }) {
        return(
            <div>
                <div className="attrRow"></div>
                <input className="coinSlider"  type="range" min={start} end={end} id="coinRange" onChange={((ev)=>trackValue(ev.target,label))}></input>                            
                <div className="attrLine">{label} <div className="FIELD SYMB" id={label}>0</div></div>
                <div className="attrRow"></div>
            </div>
        )
    }

    function AccountSelectRow({ gName, arrInfo }) {
        return(
            <div className="attrLine">
                <div className="FIELD LNAM">{gName}</div>
                { arrInfo?arrInfo.map((aInfo)=>(
                    <div>
                        <div className="FIELD SEP"> &nbsp;</div>
                        <div className="FIELD SYMB" id={strAccountButtonId(gName,aInfo.name)} onClick={((ev)=>takeValue(ev.target))}> {aInfo.name}</div>
                    </div>
                )):""}
            </div>
        )
    }

    function AccountDragRow({ gName, arrInfo }) {
        return(
            <div className="attrLine">
                <div className="FIELD LNAM">{gName}</div>
                { arrInfo?arrInfo.map((aInfo)=>(
                    <div>
                        <div className="FIELD SEP"> &nbsp;</div>
                        <div className="CNAM key" id={strAccountButtonId(gName,aInfo.name)} > {aInfo.name+':'+aInfo.value}</div>
                    </div>
                )):""}
            </div>
        )
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
      
    let page = sheet[D_Page];
    let sheet_status = makeStatusData(sheet);
    let report = sheet_status.report;


    // GH20230926
    const arrAccounts = listAccounts(sheet[D_Balance]);

    const tabName = "Overview";
    let pageText =  ['DashBoard',  'Transaction'].map((name) =>( page[name] ));
    let aPages = ['block'];
    for(let p=1;p<pageText.length;p++) aPages[p]='none'; 

    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={pageText}  tabName={tabName}> 
           
           <div className="FIELD" key={"Status"} id={'Overview0'} style= {{ 'display': aPages[0]}} >

                <StatusRow am1={page.Assets} am2={page.Gain}  am3={page.eqliab}/>
                {
                    report.map((row,l) => (
                        <StatusRow  key={"Status"+l}  
                                            am1={row.gLeft} tx1={row.nLeft} 
                                            am2={row.gMidl} tx2={row.nMidl} 
                                            am3={row.gRite} tx3={row.nRite} 
                                            d={row.dTran} n={row.nTran} l={row.lTran}
                                            click={(l==0)?handleReview:null}/>                       
                    ))
                }
            </div>

            <div className="FIELD" key={"Eingabe"} id={'Overview1'} style= {{ 'display': aPages[1]}} >
                <AccountSelectRow gName={page['Transaction']}  />
                <AccountSelectRow gName={page['tanfix']} 
                    arrInfo={ arrAccounts.filter((acct)=>(acct.xbrl.startsWith(X_ASS_FIXTAN)))} />
                <AccountSelectRow gName={page['finfix']} 
                    arrInfo={ arrAccounts.filter((acct)=>(acct.xbrl.startsWith(X_ASS_FIXFIN)))}  />
                <AccountSelectRow gName={page['cash']}  
                    arrInfo={ arrAccounts.filter((acct)=>(acct.xbrl.startsWith(X_ASS_CASH)))}  />
                <AccountSelectRow gName={page['rec']}  
                    arrInfo={ arrAccounts.filter((acct)=>(acct.xbrl.startsWith(X_ASS_RECEIV)))}  />
                <AccountSelectRow gName={page['liab']}  
                    arrInfo={ arrAccounts.filter((acct)=>(acct.xbrl.startsWith(X_LIABILITY)))}  />
                <AccountSelectRow gName={page['RegularOTC']}  
                    arrInfo={ arrAccounts.filter((acct)=>(acct.xbrl.startsWith(X_INCOME_REGULAR)))}  />
                <AccountSelectRow gName={page['veulip']}  
                    arrInfo={ arrAccounts.filter((acct)=>(acct.xbrl.startsWith(X_EQUITY_VAR_UNL)))}  />
                <AccountSelectRow gName={page['velimp']}  
                    arrInfo={ arrAccounts.filter((acct)=>(acct.xbrl.startsWith(X_EQUITY_VAR_LIM)))}  />
                <AccountSelectRow gName=''  />
                <div className="attrLine">Total<div className="FIELD SYMB" id={VAL_ID_TOTAL}>0</div></div>
                <Slider start='0' end='99' label={VAL_ID_FIRST} />
                <Slider start='0' end='99' label={VAL_ID_SECND} />
                <AccountSelectRow gName=''  />
                <AccountDragRow gName={T_CREDIT} arrInfo={txn.credit}/>
                <AccountDragRow gName={T_DEBIT} arrInfo={txn.debit}/>
            </div>
            


            <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc} miscFunc={handleXLSave}/>
            <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc} miscFunc={handleXLSave}/>
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
            <div className="FIELD SEP"> &nbsp;</div>
            <div className="FIELD SEP"> &nbsp;</div>
            <div className="FIELD SYMB"> {d}</div>
            <div className="FIELD SNAM"> {n}</div>
            <div className="FIELD">{l}</div>
            {click==null ? (<div className="FIELD SEP"> &nbsp;</div>) : (
            <div className="FIELD"  onClick={(() => click())}>&nbsp;.&nbsp;</div>
            ) }
        </div>
    )
}

const VAL_ID_FIRST = 'Euros';
const VAL_ID_SECND = 'Cents';
const VAL_ID_TOTAL = 'Total';

function strAccountButtonId(gName,aName) {
return  aName+'_'+gName;
}


function listAccounts(jAccounts) {
    var result = [];
    for (let name in jAccounts)   {
        var account=jAccounts[name];
        if(account.xbrl.length>1) {
            
            result.push({'name':account.name, 'xbrl':account.xbrl });
        }
    }
    console.log("listAccounts returns "+JSON.stringify(result))
    return result;
}
