/* global BigInt */

// .refAcct;var jSVWZ  = reqBody.reason;var jSVWZ2 = reqBody.refTime;

import { useEffect, useState, useRef } from 'react';

import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { makeOperationsForm }  from '../modules/App';
import { cents2EU, bigEUMoney }  from '../modules/money';
import { book, prepareTXN } from '../modules/writeModule';
import { D_Page, D_Schema } from '../modules/terms.js'
import { useSession } from '../modules/sessionmanager';

export default function Operations() {
    
    const [sheet, setSheet]  = useState() // returns a pair with object-location plus setter function for that location
    const [ year, setYear]   = useState()
    const [client,setClient] = useState()
    const [txn,setTxn] = useState({'add':{},'sub':{},'diff':"0", 'date':"", 'sender':"", 'refAcct':"", 'reason':"", 'refTime':""  })

    const { session, status } = useSession()

    function ignore(e) { e.preventDefault(); }

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

    if(!sheet) {      
        return 'Loading...';
    }

  
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/History?client="+client+"&year="+year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/Partner?client="+client+"&year="+year; }
      
    let page = sheet[D_Page];
    let sheet_status = makeOperationsForm(sheet,txn.add,txn.sub);
    let report = sheet_status.report;

//<form onSubmit={(e)=>(console.log("BOOKf "+JSON.stringify(txn)))} >                
//  </form>
    function onBook() {
        let flow = { 'credit':{}, 'debit':{} };
        Object.keys(txn.add).map(function(name,i) {flow=prepareTXN(sheet[D_Schema],flow,name,cents2EU(txn.add[name]))});
        Object.keys(txn.sub).map(function(name,i) {flow=prepareTXN(sheet[D_Schema],flow,name,cents2EU(txn.sub[name]))});

        console.log("BOOK F "+JSON.stringify(flow));

        txn.credit = flow.credit;
        txn.debit = flow.debit;
        
        // refAcct reason refTime missing

        console.log("BOOK B "+JSON.stringify(txn));

        // GH20230205
        // WITH SERVER-SIDE SESSION MANAGEMENT
        txn.sessionId = session.id; // won't book otherwise
        // WITH CLIENT-SIDE CLIENT/YEAR as PRIM KEY
        txn.year=year;
        txn.client=client;


        book(txn,session); 

        // invalidate current session
        sessionStorage.setItem('session',"");

        console.log("BOOK O booked.");
   /*
   
20230127212142120
0610 app.post BOOK jTXN('{"add":{"COGK":"139000"},"sub":{"NKHA":"10000","MIET":"129000"},"diff":"0","date":"2023-02-02","sender":"Ferguson","refAcct":"MIET","reason":"Eifelweg22","refTime":"Februar2023","credit":{"COGK":{"index":10,"value":"139.000,00"}},"debit":{"NKHA":{"index":24,"value":"10.000,00"},"MIET":{"index":16,"value":"129.000,00"}}}')
0617 app.post BOOK NO OLD session MUST SET req.body.sessionId
   */
    }

    const aNums = [0];
    return (
            <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aNums} >
            
            <div className="attrRow">
            <div className="FIELD KEY" onClick={onBook}>BOOK</div>                                                   
                <div className="FIELD KEY">{cents2EU(txn.diff)}</div>                        
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SEP"> &nbsp;</div>
            </div>

            {
                report.map((row,l) => (
                    <StatusRow  key={"Operations0"+l} 
                               am1={row.gAsset}  tx1={row.nAsset}  tt1={row.tAsset} 
                               am2={row.gLiab}   tx2={row.nLiab}   tt2={row.tLiab} 
                               am3={row.gGain}   tx3={row.nGain}   tt3={row.tGain}
                               am4={row.gEquity} tx4={row.nEquity} tt4={row.tEquity} /> 
                ))
            }
            <InputRow date={txn.date} sender={txn.sender} refAcct={txn.refAcct} reason={txn.reason} refTime={txn.refTime}/>    
            
            <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
            <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
        </Screen>
    )   

    function StatusRow({ am1,tx1,tt1,   am2,tx2,tt2,  am3,tx3,tt3,  am4,tx4,tt4}) {
        return(
            <div className="attrRow">
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM">{(tt1=='A')?(<input style={{'textAlign':'right'}} defaultValue={cents2EU(am1)} onChange={(e)=>addAccount(tx1,e.target.value)}/>):""}</div>
                <div className="FIELD SYMB" onClick={(e)=>remAddAccount(tx1)} >{tx1}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM">{(tt2=='L')?(<input style={{'textAlign':'right'}} defaultValue={cents2EU(am2)} onChange={(e)=>subAccount(tx2,e.target.value)}/>):""}</div>
                <div className="FIELD SYMB" onClick={(e)=>remSubAccount(tx2)} >{tx2}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM">{cents2EU(am3)}</div>
                <div className="FIELD SYMB" onClick={(e)=>setsubAccount(tx3,cents2EU(txn.diff))}>{tx3}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM">{cents2EU(am4)}</div>
                <div className="FIELD SYMB" onClick={(e)=>setsubAccount(tx4,cents2EU(txn.diff))}>{tx4}</div>
                <div className="FIELD SEP">.</div>
            </div>
        )
    }
 
    function InputRow({ date,sender,refAcct,reason,refTime }) {
        return(
            <div className="attrRow">
                <div className="FIELD SYMB"> &nbsp;</div>
                <div className="FIELD XFER"><input type="date" id="cDate"   name="cDate"   defaultValue ={date}   onChange={(e)=>addTXNData('date',e.target.value)} onDrop={ignore} /></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD XFER"><input type="edit" id="cSender" name="cSender" defaultValue ={sender} onChange={(e)=>addTXNData('sender',e.target.value)} onDrop={ignore} /></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD XFER"><input type="edit" id="cReason" name="cReason" defaultValue ={refAcct} onChange={(e)=>addTXNData('refAcct',e.target.value)} onDrop={ignore} /></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD XFER"><input type="edit" id="cRef1"   name="cRef1"   defaultValue ={reason}   onChange={(e)=>addTXNData('reason',e.target.value)} onDrop={ignore} /></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD XFER"><input type="edit" id="cRef2"   name="cRef2"   defaultValue ={refTime}   onChange={(e)=>addTXNData('refTime',e.target.value)} onDrop={ignore} /></div>
            </div>)
    }
    
    
    function setDiff(txn) {
        var iValue=0n; 
        Object.keys(txn.add).map((name)=>(iValue=iValue+BigInt(txn.add[name]))); 
        Object.keys(txn.sub).map((name)=>(iValue=iValue-BigInt(txn.sub[name]))); 
        txn.diff=""+iValue;
        return txn;
    }

    function remAddAccount(shrtName) { delete txn.add[shrtName]; setTxn(JSON.parse(JSON.stringify(txn))); } // avoid update
    function remSubAccount(shrtName) { delete txn.sub[shrtName]; setTxn(JSON.parse(JSON.stringify(txn))); } // avoid update

    function plusAccount(shrtName,a) { txn.add[shrtName]=""+bigEUMoney(a); return txn; } // avoid update
    function addAccount(shrtName,a) { setTxn(setDiff(plusAccount(shrtName,a))); console.log("ADD("+a+") "+JSON.stringify(txn)); }
    
    function minusAccount(shrtName,a) { txn.sub[shrtName]=""+bigEUMoney(a); return txn; } // avoid update
    function subAccount(shrtName,a) { setTxn(setDiff(minusAccount(shrtName,a))); console.log("SUB("+a+") "+JSON.stringify(txn)); }

    function setsubAccount(shrtName,a) { 

        if(bigEUMoney(txn.sub[shrtName])!=0n) { 
            // remove entry
            delete txn.sub[shrtName]; 
            // re-render please
            setTxn(JSON.parse(JSON.stringify(txn)));
        }
        else {
            // re-render please
            setTxn(JSON.parse(JSON.stringify(setDiff(minusAccount(shrtName,a))))); 
        }
        console.log("SET("+a+") "+JSON.stringify(txn)); 
    }    

    function addTXNData(shrtName,a) { txn[shrtName]=a; console.log("DATA("+a+") "+JSON.stringify(txn)); return txn; } // avoid update
}



