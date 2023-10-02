import { useEffect, useState } from 'react';
import { getSession, storeCarryOver, useSession, REACT_APP_API_HOST } from '../modules/sessionmanager';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { cents2EU,bigEUMoney }  from '../modules/money';
import { J_ACCT,CSEP,D_Balance,D_Page,D_PreBook,D_Schema,T_CREDIT,T_DEBIT,X_ASS_FIXTAN,X_ASS_FIXFIN,X_ASS_RECEIV,X_ASS_CASH,X_INCOME_REGULAR,X_LIABILITY,X_EQUITY_VAR_UNL,X_EQUITY_VAR_LIM } from '../modules/terms.js'
import { book,prepareTXN }  from '../modules/writeModule';




import { makeStatusData }  from '../modules/App';

// the ORIGINAL FORMAT from journal sheet is 
// columns format CSV with these columns 
// HASH DATE SENDER REFACCT REASON REFCODE GRSB EBKS CDAK COGK FSTF NKFO KEST KESO VAVA - 


// addDebit,addCredit,makeTxnFormat(jTemplates[index],names,aLen,eLen) will generate the 
// txn format 
// { 'date':"", 'sender':"Sender", 'refAcct':"", 'reason':"", 'refCode':"", 'debit':{'name':VALUE}, credit:{ 'name':VALUE}}

// onkeep/buildTransaction will generate the 
// flow format 
// "sender":SENDER,"reason":REASON,"credit":{"COGK":{"index":10,"value":"100,00"}},"debit":{"K2TO":{"index":33,"value":"100,00"}},"balance":""}
// this format is for AccountTemplateRow and the external book method

export default function Status() {
    
    const [sheet, setSheet]  = useState()
    const [ year, setYear]   = useState()
    const [client,setClient] = useState()
    const { session, status } = useSession()
    const [txn,setTxn] = useState({ 'date':"", 'sender':"Sender", 'refAcct':"", 'reason':"", 'refCode':"", 'credit':{},'debit':{}  })
    const [claims,setClaims] = useState([])

    function update() {
        if(txn) {
            let bigSum=0n;
            let cKeys=Object.keys(txn.credit);
            let dKeys=Object.keys(txn.debit);
            cKeys.forEach((acct)=>{bigSum+=bigEUMoney(txn.credit[acct]); console.log("+"+txn.credit[acct])})
            dKeys.forEach((acct)=>{bigSum-=bigEUMoney(txn.debit[acct]); console.log("+"+txn.debit[acct])})
            txn.balance=cents2EU(bigSum);
            setTxn(JSON.parse(JSON.stringify(txn))); // render full page
            console.log("update "+JSON.stringify(txn)+" = "+cents2EU(bigSum));
        }
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

    
    function onKeep(event) {       
        console.log("onKeep ENTER "+JSON.stringify(txn));
        let ctlSender=document.getElementById(VAL_ID_SENDR);
        let sender=ctlSender.value;
        let ctlReason=document.getElementById(VAL_ID_REASN);
        let reason=ctlReason.value;
        if(sender && sender.length>2) {

            txn.sender=sender;
            txn.refAcct='RefAcct';
            txn.reason=reason;
            txn.refCode='RefCode';
            let flow = buildTransaction(txn);

            claims.push(flow);
            
            update();
            console.log("onKeep flow "+JSON.stringify(flow));

            
        }
    }

    function buildTransaction(simpleTXN) {
        let flow = { 'sender':simpleTXN.sender, 'reason':simpleTXN.reason, 'credit':{}, 'debit':{} };

        var arrCreditInfo=list(simpleTXN,'credit');        
        var arrDebitInfo=list(simpleTXN,'debit');

        console.log("KEEP1 "+JSON.stringify(arrCreditInfo));
        console.log("KEEP2 "+JSON.stringify(arrDebitInfo));
    
        arrCreditInfo.forEach((acct)=>{flow=prepareTXN(sheet[D_Schema],flow,acct.name,acct.value);});
        arrDebitInfo.forEach((acct) =>{flow=prepareTXN(sheet[D_Schema],flow,acct.name,acct.value);});
        
        return flow;
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

    function removePreTXN(ev,index) {
        ev.preventDefault();
        
        console.log("removePreTXN "+ev.target.id+"="+index);
        
        var jTemplates = sheet[D_PreBook];
        if(jTemplates && jTemplates.length>index) {
            let jHead=(index>0)?sheet[D_PreBook].slice(0,index-1):[];
            let jTail=sheet[D_PreBook].slice(index);
            sheet[D_PreBook] = jHead.concat(jTail);
            console.log("removePreTXN "+ev.target.id+" at "+index+" "+JSON.stringify(sheet[D_PreBook]));
        }
        /* EXAMPLE: modify sheetCells in session object
            if(iColumn>J_ACCT && session.sheetCells) {
                console.log("1720 /ADDACCOUNT map addAccount"); 
                let sheetCells = session.sheetCells.map((row:any,line:number)=>( addAccount(row,line,iColumn)));
                session.sheetCells = sheetCells;
            } else console.log("1721 /ADDACCOUNT no columns"); 

        */
        
        update();
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

    
    function AccountDragRow({ gName, jInfo }) {
        var keys = Object.keys(jInfo);
        var arrInfo=keys.map((a)=>({'name':a, 'value':jInfo[a]}));
        console.log("AccountDragRow "+JSON.stringify(arrInfo));
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


    function AccountTemplateRow({ gName, jInfo, index }) {        
        var arrCreditInfo=list(jInfo,'credit');        
        var arrDebitInfo=list(jInfo,'debit');
        console.log("AccountTemplateRow+"+JSON.stringify(arrCreditInfo)+"  "+JSON.stringify(arrDebitInfo)+ " from "+JSON.stringify(jInfo));
        return(
            <div className="attrLine" key={index+gName}>                    
                <div className="attrLine" id={gName}  >
                <div className="FIELD TRASH" id={VAL_ID_TRASH} onClick={(ev)=>(removePreTXN(ev,index))}>&#128465;</div>
                    <div className="FIELD SYM" ></div>
                    <div className="FIELD SYM" >BOOK</div>
                    <div className="FIELD SNAM" >{jInfo.sender}</div>
                    <div className="FIELD SYM" ></div>
                    <div className="FIELD SNAM" >{jInfo.reason}</div>
                    { arrCreditInfo?arrCreditInfo.map((aInfo,n)=>(
                        <div key={index+gName+'C'+n} draggable="true" id={strAccountTemplateId(gName,aInfo.name)}>
                            <div className="FIELD SEP"> &nbsp;</div>
                            <div className="FIELD CNAM" > {aInfo.value.index+'#'+aInfo.name+':'+aInfo.value.value}</div>
                        </div>
                    )):""}
                    <div className="FIELD SNAM" >AN</div>
                    { arrDebitInfo?arrDebitInfo.map((aInfo,n)=>(
                        <div key={index+gName+'D'+n} draggable="true" id={strAccountTemplateId(gName,aInfo.name)}>
                            <div className="FIELD SEP"> &nbsp;</div>
                            <div className="FIELD CNAM" > {aInfo.value.index+'#'+aInfo.name+':'+aInfo.value.value}</div>
                        </div>
                    )):""}
                    <div className="attrRow" ></div>
                </div>
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
      
    function makeTxnFormat(columns,names,aLen) {
        let result=[];
        columns.forEach((cell,i)=>{if(i>J_ACCT && i<aLen && cell && cell.length>0)  result.push({'name':names[i],'iValue':bigEUMoney(columns[i])})});
        columns.forEach((cell,i)=>{if(i>aLen && cell && cell.length>0)  result.push({'name':names[i],'iValue':-1n * bigEUMoney(columns[i])})});
        let credit={};
        let debit={};
        result.forEach((move)=>{if(move.iValue>0n) credit[move.name]=cents2EU(move.iValue); else debit[move.name]=cents2EU(-1n*move.iValue)});
        return {
             'hash':columns[0],
            "date":columns[1],
            "sender":columns[2],
            "refAcct":columns[3],
            "reason":columns[4],
            "refCode":columns[5],
            'credit':credit,
            'debit':debit
        }
    }

    function bookTemplate(jTXN) {   
        
        
        jTXN.year=session.year;
        jTXN.client=session.client;

        jTXN.sessionId = session.id; // won't book otherwise        
        jTXN.flag='1'; // flag that a pre-claim is being entered

        console.log("bookTemplate build : "+JSON.stringify(jTXN));

        
        book(jTXN,session); 

        //resetSession();
        // invalidate current session

        console.log("bookTemplate:  booked.");  
    }


    function getClaims() {
        
        const arrHistory = [];                            
        const jTemplates  = sheet[D_PreBook];
        console.log("getClaims CLAIM ENTER "+JSON.stringify(jTemplates));

        const gSchema = sheet[D_Schema];    
        let aLen = parseInt(gSchema.assets);
        let eLen = parseInt(gSchema.eqliab);
        var aPattern = null;//getParam("APATTERN");
        if(aPattern && aPattern.length<2) aPattern=null;
        var lPattern = null;//getParam("LPATTERN");
        if(lPattern && lPattern.length<2) lPattern=null;

        if(page) {            
            arrHistory.push({entry:CSEP+CSEP+page["History"]+CSEP+page["header"]+CSEP+CSEP});                  
            if(gSchema.Names && gSchema.Names.length>0) {
                var names=gSchema.Names;                
                for (let index in jTemplates)  {
                    let jtxn=makeTxnFormat(jTemplates[index],names,aLen,eLen);
                    console.log("getClaims txn format="+JSON.stringify(jtxn));
                    let jPreTXN=buildTransaction(jtxn);
                    console.log("getClaims preTXN="+JSON.stringify(jPreTXN));
                    arrHistory.push(jPreTXN);
                }
            }
        }
        return arrHistory;
    }

    let page = sheet[D_Page];
    let sheet_status = makeStatusData(sheet);
    let report = sheet_status.report;


    // GH20230926
    const arrAccounts = listAccounts(sheet[D_Balance]);

    const tabName = "Overview";
    let pageText =  ['DashBoard',  'Transaction', 'Patterns'].map((name) =>( page[name] ));
    let aPages = ['block'];
    for(let p=1;p<pageText.length;p++) aPages[p]='none'; 

    let bigSum = bigEUMoney(txn.balance);


    // append pending new claims to persistent template list
    let jTemplates = getClaims();
    claims.forEach((claim)=>{jTemplates.push(claim);});


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
                    <div className="FIELD TRASH" id={VAL_ID_TRASH} onDrop={(ev)=>(removeAcct(ev))}>&#128465;</div>
                </div>

                <Slider  min='0'  max='99' label={VAL_ID_MAJOR} value={bigSum/10000n}/>
                <Slider  min='0'  max='99' label={VAL_ID_FIRST} value={bigSum/100n%100n}/>
                <Slider  min='0'  max='99' label={VAL_ID_SECND} value={bigSum%100n}/>                
                
                <div className="attrLine">
                    <div className="FIELD SYMB">Sender</div>
                    <input className="FIELD SYMB" id={VAL_ID_SENDR}/>
                    <div className="FIELD SYMB">Reason</div>
                    <input className="FIELD SYMB" id={VAL_ID_REASN}/>
                    <div className="FIELD CNAMF" id={VAL_ID_DIFF}>{txn.balance==''?
                        (<div className="CNAM key" onClick={onKeep}>KEEP</div>)
                        :txn.balance}
                        Sender</div>
                    </div>
                        
                <AccountSelectRow gName=''  />

                <AccountDragRow gName={T_CREDIT} jInfo={txn.credit} />
                <AccountDragRow gName={T_DEBIT}  jInfo={txn.debit} />
            </div>            

            <div className="FIELD" key={"Vorlagen"} id={'Overview2'} style= {{ 'display': aPages[2]}} >
                {jTemplates.map((txnClaim,i)=>(                 
                    <AccountTemplateRow gName={page['Patterns']} jInfo={txnClaim} index={i} />
                    ))
                }
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
const VAL_ID_REASN = 'Reason';
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

function list(jInfo,type) {
    var json = jInfo[type]
    var keys =  json ? Object.keys(json) : [];
    return  keys.map((a)=>({'name':a, 'value':json[a]}));
}
