import { useEffect, useState } from 'react';

import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { makeStatusData }  from '../modules/App';
import { cents2EU }  from '../modules/money';

import { D_Page } from '../terms.js'
import { useSession } from '../modules/sessionmanager';

export default function Operations() {
    
    const [sheet, setSheet]  = useState()
    const [ year, setYear]   = useState()
    const [client,setClient] = useState()

    const { session, status } = useSession()

    const [txn,setTxn] = useState()
    const [amount,setAmount] = useState()

    useEffect(() => {
        setTxn({});
        setAmount("0");
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
   
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="https://"+session.server.addr+":3000/history?client="+client+"&year="+year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="https://"+session.server.addr+":3000/partner?client="+client+"&year="+year; }
      
    let page = sheet[D_Page];
    let sheet_status = makeStatusData(sheet);
    let report = sheet_status.report;

    const aNums = [0];
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aNums} >
            {
                report.map((row,l) => (
                    <StatusRow am1={row.gLeft} tx1={row.nLeft} tt1={row.tLeft} 
                               am2={row.gMidl} tx2={row.nMidl} tt2={row.tMidl} 
                               am3={row.gRite} tx3={row.nRite} tt3={row.tRite} /> 
                ))
            }
            <div className="attrLine">
                <form onSubmit={(e)=>(console.log("SEARCH "+JSON.stringify(e.target)))} >                
                    <div className="FIELD MOAM"></div>                
                    <div className="FIELD LTXT">Amount:<input type='edit' name='AMOUNT' onClick={(event)=>setAmount(event.target.value)}/>&nbsp;</div> 
                </form>
            </div>

            <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
            <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
        </Screen>
    )   

    function StatusRow({ am1,tx1,tt1, am2, tx2,tt2, am3, tx3,tt3, d, n, l}) {
        return(
            <div className="attrLine">
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM">{tt1}</div>
                <div className="FIELD SYMB" onClick={(e)=>showAccount(tx1,amount)}> {tx1}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM">{tt2}</div>
                <div className="FIELD SYMB" onClick={(e)=>showAccount(tx2,amount)}> {tx2}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM">{tt3}</div>
                <div className="FIELD SYMB" onClick={(e)=>showAccount(tx3,amount)}> {tx3}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SYMB"> {d}</div>
                <div className="FIELD SNAM"> {n}</div>
                <div className="FIELD LTXT">{l}</div>
            </div>
        )
    }

    function addAccount(shrtName,a) { txn[shrtName]=a; return txn; }
    function showAccount(shrtName,a) { setTxn(addAccount(shrtName,a)); console.log("NOTIFY("+amount+") "+JSON.stringify(txn)); }
    
}




