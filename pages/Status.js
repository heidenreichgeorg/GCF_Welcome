import { useEffect, useState } from 'react';
import { getSession, storeCarryOver, useSession, REACT_APP_API_HOST } from '../modules/sessionmanager';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { cents2EU,bigEUMoney }  from '../modules/money';
import { D_Page,D_Balance,T_CREDIT,T_DEBIT,X_ASS_FIXTAN,X_ASS_FIXFIN,X_ASS_RECEIV,X_ASS_CASH,X_INCOME_REGULAR,X_LIABILITY,X_EQUITY_VAR_UNL,X_EQUITY_VAR_LIM } from '../modules/terms.js'
import { book }  from '../modules/writeModule';




import { makeStatusData }  from '../modules/App';




export default function Status() {
    
    const [sheet, setSheet]  = useState()
    const [ year, setYear]   = useState()
    const [client,setClient] = useState()
    const { session, status } = useSession()
    const [txn,setTxn] = useState({ 'date':"", 'sender':"Sender", 'refAcct':"", 'reason':"", 'refCode':"", 'credit':{},'debit':{}  })

    function update() {
        let bigSum=0n;
        let cKeys=Object.keys(txn.credit);
        let dKeys=Object.keys(txn.debit);
        cKeys.forEach((acct)=>{bigSum+=bigEUMoney(txn.credit[acct]); console.log("+"+txn.credit[acct])})
        dKeys.forEach((acct)=>{bigSum-=bigEUMoney(txn.debit[acct]); console.log("+"+txn.debit[acct])})
        txn.balance=cents2EU(bigSum);
        setTxn(JSON.parse(JSON.stringify(txn))); // render full page
        console.log("update "+JSON.stringify(txn)+" = "+cents2EU(bigSum));
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


    function addDebit(attribute) {                
        if(attribute && attribute.name && attribute.value) {
            txn.debit[attribute.name]=attribute.value;
            delete txn.credit[attribute.name];
            update();
        }
    }

    function addCredit(attribute) {       
        if(attribute && attribute.name && attribute.value) {
            txn.credit[attribute.name]=attribute.value;
            delete txn.debit[attribute.name];
            update();
        }
    }

    
    function onBook(target) {       
        console.log("KEEP1 "+JSON.stringify(txn));
        let ctlSender=document.getElementById(VAL_ID_SENDR);
        let sender=ctlSender.value;
        if(sender && sender.length>2) {
            txn.sender=sender;
            update();
            console.log("KEEP2 "+JSON.stringify(txn));
        }
    }



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
        txn[label]=slider.value;
    }


    
    function takeValue(accButton) {
        let ctlAccount=document.getElementById(accButton.id);
        const name=accButton.id.split(SYM_ACCOUNT_DRAG)[0];
        console.log("takeValue id="+accButton.id+"  value="+ctlAccount.value);

        //let ctlSender=document.getElementById(VAL_ID_SENDR);
        let ctlTotal=document.getElementById(VAL_ID_TOTAL);
        let ctlMajor=document.getElementById(VAL_ID_MAJOR);
        let ctlEuros=document.getElementById(VAL_ID_FIRST);
        let ctlCents=document.getElementById(VAL_ID_SECND);
        const major=ctlMajor.innerHTML;
        const euros=ctlEuros.innerHTML;
        const cents=ctlCents.innerHTML;
        const bigEuros = (BigInt(major)*100n+BigInt(euros))*100n;
        const bigCents = BigInt(cents);
        let strAmount = cents2EU(bigEuros+bigCents);
    
        ctlTotal.innerHTML = strAmount;
    
        let attribute = { 'name':name, 'value':strAmount };
        addCredit(attribute);
        update(); // render full page
    }
    
    function Slider({ min, max, label, value }) {
        let strValue = value.toString();
        // value={strValue} 
        return(
            <div>
                <div className="attrRow"></div>
                <input className="coinSlider" type="range" min={min} max={max} id={"slider"+label} onChange={((ev)=>trackValue(ev.target,label))}></input>                            
                <div className="attrLine">{label} <div className="FIELD SYMB" id={label}>{strValue}</div></div>
                <div className="attrRow"></div>
            </div>
        )
    }

    function AccountSelectRow({ gName, arrInfo }) {
        return(
            <div className="attrLine">
                <div className="FIELD LNAM">{gName}</div>
                { arrInfo?arrInfo.map((aInfo,n)=>(
                    <div key={gName+n}>
                        <div className="FIELD SEP"> &nbsp;</div>
                        <div className="FIELD SYMB" id={strAccountSelectId(gName,aInfo.name)} onClick={((ev)=>takeValue(ev.target))}> {aInfo.name}</div>
                    </div>
                )):""}
            </div>
        )
    }

    function allowDrop(ev) {
        ev.preventDefault();
    }

    function drag(ev,group,aInfo) {
        ev.dataTransfer.setData("text", ev.target.id);
        ev.dataTransfer.setData("html", ev.target.innerHTML);
        ev.dataTransfer.setData("attr", JSON.stringify(aInfo));
        ev.dataTransfer.setData("group",group);        
        console.log("drag "+ev.target.id+"  "+JSON.stringify(aInfo));
    }


    function drop(ev) {
        ev.preventDefault();
        var name = ev.dataTransfer.getData("text");
        var attr = ev.dataTransfer.getData("attr");
        var data = ev.dataTransfer.getData("html");
        var group= ev.dataTransfer.getData("group");
        console.log("drop "+JSON.stringify(name)+" from "+group+" as "+JSON.stringify(data));
        
        if(group==T_DEBIT) addCredit(JSON.parse(attr));
        if(group==T_CREDIT) addDebit(JSON.parse(attr));        
    }

    function removeAcct(ev) {
        ev.preventDefault();
        var name = ev.dataTransfer.getData("text").split(SYM_ACCOUNT_DRAG)[0];
        var attr = ev.dataTransfer.getData("attr");
        var group= ev.dataTransfer.getData("group");
        console.log("removeAcct "+name+"  attr:"+attr+ " from "+group);
        
        if(group==T_DEBIT) delete txn.debit[name];
        if(group==T_CREDIT) delete txn.credit[name];
        update();
    }

    function AccountDragRow({ gName, jInfo }) {
        var keys = Object.keys(jInfo);
        var arrInfo=keys.map((a)=>({'name':a, 'value':jInfo[a]}));
        console.log("showing "+JSON.stringify(arrInfo));
        return(
            <div className="attrRow" id={gName}  onDragOver={((ev)=>allowDrop(ev))} onDrop={((ev)=>drop(ev))} >
                <div className="FIELD LNAM" >{gName}</div>
                { arrInfo?arrInfo.map((aInfo,n)=>(
                    <div key={gName+n} draggable="true"  onDragStart={((ev)=>drag(ev,gName,aInfo))} id={strAccountButtonId(gName,aInfo.name)}>
                        <div className="FIELD SEP"> &nbsp;</div>
                        <div className="CNAM key" > {aInfo.name+':'+aInfo.value}</div>
                    </div>
                )):""}
            </div>
        )
    }

    function AccountTemplateRow({ gName, jInfo }) {
        var creditKeys = Object.keys(jInfo.credit);
        var arrCreditInfo=creditKeys.map((a)=>({'name':a, 'value':jInfo[a]}));
        var debitKeys = Object.keys(jInfo.debit);
        var arrDebitInfo=debitKeys.map((a)=>({'name':a, 'value':jInfo[a]}));
        console.log("AccountTemplateRow+"+JSON.stringify(arrCreditInfo)+"  "+JSON.stringify(arrDebitInfo));
        return(
            <div className="attrRow" id={gName}  >
                <div className="FIELD SNAM" >BOOK</div>
                <div className="FIELD SNAM" >{txn.sender}</div>
                { arrCreditInfo?arrCreditInfo.map((aInfo,n)=>(
                    <div key={gName+n} draggable="true" id={strAccountTemplateId(gName,aInfo.name)}>
                        <div className="FIELD SEP"> &nbsp;</div>
                        <div className="CNAM key" > {aInfo.name+':'+aInfo.value}</div>
                    </div>
                )):""}
                <div className="FIELD SNAM" >AN</div>
                { arrDebitInfo?arrDebitInfo.map((aInfo,n)=>(
                    <div key={gName+n} draggable="true" id={strAccountTemplateId(gName,aInfo.name)}>
                        <div className="FIELD SEP"> &nbsp;</div>
                        <div className="CNAM key" > {aInfo.name+':'+aInfo.value}</div>
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
      

    function onBook() {        
        // KKEP transaction in template storage
        txn.year=session.year;
        txn.client=session.client;

        txn.sessionId = session.id; // won't book otherwise        
        txn.flag='1'; // flag that a pre-claim is being entered

        console.log("onBook build claim: "+JSON.stringify(txn));

        
        book(txn,session); 

        //resetSession();
        // invalidate current session

        console.log("onBook: claim booked.");  
    }



    let page = sheet[D_Page];
    let sheet_status = makeStatusData(sheet);
    let report = sheet_status.report;


    // GH20230926
    const arrAccounts = listAccounts(sheet[D_Balance]);

    const tabName = "Overview";
    let pageText =  ['DashBoard',  'Transaction', 'Templates'].map((name) =>( page[name] ));
    let aPages = ['block'];
    for(let p=1;p<pageText.length;p++) aPages[p]='none'; 

    let bigSum = bigEUMoney(txn.balance);

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
                
                <div className="attrLine" onDragOver={((ev)=>allowDrop(ev))}><div className="FIELD SNAM" id={VAL_ID_TOTAL}>{cents2EU(bigSum)+'  Total'}</div>
                    <div className="FIELD TRASH" id={VAL_ID_TRASH}  
                         
                        onDrop={(ev)=>(removeAcct(ev))}>&#128465;</div>
                </div>

                <Slider  min='0'  max='99' label={VAL_ID_MAJOR} value={bigSum/10000n}/>
                <Slider  min='0'  max='99' label={VAL_ID_FIRST} value={bigSum/100n%100n}/>
                <Slider  min='0'  max='99' label={VAL_ID_SECND} value={bigSum%100n}/>                
                
                <div className="attrLine">
                    <input className="FIELD SYMB" id={VAL_ID_SENDR}/>
                    <div className="FIELD CNAM" id={VAL_ID_DIFF}>{txn.balance==''?
                        (<div className="CNAM key" onClick={onBook}>KEEP</div>)
                        :txn.balance}
                        Sender</div>
                    </div>
                        
                <AccountSelectRow gName=''  />

                <AccountDragRow gName={T_CREDIT} jInfo={txn.credit} />
                <AccountDragRow gName={T_DEBIT}  jInfo={txn.debit} />
            </div>            

            <div className="FIELD" key={"Vorlagen"} id={'Overview2'} style= {{ 'display': aPages[2]}} >
                <AccountTemplateRow gName={page['Templates']} jInfo={txn}   />
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

const VAL_ID_MAJOR = '100EU';
const VAL_ID_FIRST = 'Euros';
const VAL_ID_SECND = 'Cents';
const VAL_ID_TOTAL = 'Total';
const VAL_ID_DIFF  = 'Diff';
const VAL_ID_SENDR = 'Sender';
const VAL_ID_TRASH = 'Trash';

const SYM_ACCOUNT_SELECT = '_';
const SYM_ACCOUNT_DRAG = '_';

function strAccountSelectId(gName,aName) { return  aName+SYM_ACCOUNT_SELECT+gName; }
function strAccountButtonId(gName,aName) { return  aName+SYM_ACCOUNT_DRAG+gName; }
function strAccountTemplateId(gName,aName) { return  aName+'T'+gName; }


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
