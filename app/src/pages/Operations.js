import { useEffect, useState } from 'react';

import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { makeOperationsForm }  from '../modules/App';
import { cents2EU, bigEUMoney }  from '../modules/money';

import { D_Page } from '../terms.js'
import { useSession } from '../modules/sessionmanager';

export default function Operations() {
    
    const [sheet, setSheet]  = useState()
    const [ year, setYear]   = useState()
    const [client,setClient] = useState()

    const { session, status } = useSession()

    const [txn,setTxn] = useState()

    useEffect(() => {
        setTxn({'add':{},'sub':{},'diff':"0"});
        
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
    let sheet_status = makeOperationsForm(sheet,txn);
    let report = sheet_status.report;

    const aNums = [0];
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aNums} >
            {
                report.map((row,l) => (
                    <StatusRow am1={row.gAsset}  tx1={row.nAsset}  tt1={row.tAsset} 
                               am2={row.gLiab}   tx2={row.nLiab}   tt2={row.tLiab} 
                               am3={row.gGain}   tx3={row.nGain}   tt3={row.tGain}
                               am4={row.gEquity} tx4={row.nEquity} tt4={row.tEquity} /> 
                ))
            }
            <div className="attrLine">
                <form onSubmit={(e)=>(console.log("SEARCH "+JSON.stringify(e.target)))} >                
                    <div className="FIELD MOAM"></div>                
                    
                </form>
            </div>

            <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
            <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
        </Screen>
    )   

    function StatusRow({ am1,tx1,tt1, am2, tx2,tt2, am3, tx3,tt3, am4, tx4, tt4}) {
        return(
            <div className="attrLine">
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM">{(tt1=='A')?(<input style={{'textAlign':'right'}} defaultValue={cents2EU(am1)} onChange={(e)=>addAccount(tx1,e.target.value)}/>):""}</div>
                <div className="FIELD SYMB">{tx1}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM">{(tt2=='L')?(<input style={{'textAlign':'right'}} defaultValue={cents2EU(am2)} onChange={(e)=>subAccount(tx2,e.target.value)}/>):""}</div>
                <div className="FIELD SYMB">{tx2}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM">{(tt3=='G')?(<text style={{'textAlign':'right'}} defaultValue={cents2EU(am3)}/>):""}</div>
                <div className="FIELD SYMB" onClick={(e)=>setsubAccount(tx3,cents2EU(txn.diff))}>{tx3}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM">{(tt4=='E')?(<text style={{'textAlign':'right'}} defaultValue={cents2EU(am4)}/>):""}</div>
                <div className="FIELD SYMB" onClick={(e)=>setsubAccount(tx4,cents2EU(txn.diff))}>{tx4}</div>
                <div className="FIELD SEP">.</div>
            </div>
        )
    }

    
    function setDiff(txn) {
        var iValue=0n; 
        Object.keys(txn.add).map((name)=>(iValue=iValue+bigEUMoney(txn.add[name]))); 
        Object.keys(txn.sub).map((name)=>(iValue=iValue-bigEUMoney(txn.sub[name]))); 
        txn.diff=""+iValue;
        return txn;
    }

    function plusAccount(shrtName,a) { txn.add[shrtName]=a; return txn; }
    function addAccount(shrtName,a) { setTxn(setDiff(plusAccount(shrtName,a))); console.log("ADD("+a+") "+JSON.stringify(txn)); }
    
    function minusAccount(shrtName,a) { txn.sub[shrtName]=a; return txn; }
    function subAccount(shrtName,a) { setTxn(setDiff(minusAccount(shrtName,a))); console.log("SUB("+a+") "+JSON.stringify(txn)); }

    function setsubAccount(shrtName,a) { setTxn(setDiff(minusAccount(shrtName,a))); console.log("SET("+a+") "+JSON.stringify(txn)); sheet_status = makeOperationsForm(sheet,txn); }
    
}




