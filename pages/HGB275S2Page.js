
import { useEffect, useState  } from 'react';
import { getSession,useSession } from '../modules/sessionmanager';
import {  makeHGBReport } from '../modules/App'
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { D_Page }  from '../modules/terms.js';


export default function HGB275S2Page() {

const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
    useEffect(() => {
        if(status !== 'success') return;
        let state=getSession();
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
        }
    }, [status])

    if(!sheet) return null; //'Loading...';

    
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/FixedAssets?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="Status?client="+session.client+"&year="+session.year; }

    let page = sheet[D_Page];
    
    let report = []; report.push(makeHGBReport(sheet));


    let aPages = [];
    for(let p=1;p<report.length;p++) aPages[p]='none'; 
    aPages[0]='block';

    const tabName = 'HGBContent';
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aPages}  tabName={tabName}>
            {report.map((balance,n) => ( 
                <div className="attrLine"  key={"HGB0"+n}  id={tabName+n} style= {{ 'display': aPages[n]}} > 
                    <div className="FIELD">
                        <div className="FIELD LNAM">&nbsp;</div>
                        <div className="FIELD LNAM">{page.GainLoss + ' ' + session.year}</div>
                    </div>
                    {balance.map((row,i) => (
                        <HGB275Row  key={"HGB1"+i}  jArgs={row} id={"Args"+i} />    
                    ))}
                    <FooterRow  id={"F1"}  left={page["client"]}   right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                    <FooterRow  id={"F2"}  left={page["reference"]}  right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                </div>
            ))}
        </Screen>
    )
}


function HGB275Row({ jArgs, id }) {
    return(
        <div className={"attrLine line"+id} >
            <div className="FIELD C100"></div>
            <div className="FIELD SEP">&nbsp;</div>
            <div className="FIELD SEP">|&nbsp;</div>
            <div className="FIELD LNAM"> {jArgs.tx1}</div>
            <div className="FIELD MOAM"> {(jArgs.an3)}</div>
            <div className="FIELD MOAM"> {(jArgs.an2)}</div>
            <div className="FIELD MOAM"> {(jArgs.an1)}</div>
            <div className="FIELD SEP">|&nbsp;</div>
        </div>
    )
}

