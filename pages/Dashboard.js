export default function DashBoard({value}) {
    return <div/>
}


/* xglobal BigInt */
/*

import { useEffect, useState  } from 'react';
import Screen from './Screen'
import { useSession } from '../modules/sessionmanager';
import { makeStatusData }  from '../modules/App';
import { D_FixAss, D_Page }  from '../modules/terms.js';
import FooterRow from '../components/FooterRow';

import Chart from '../components/Chart'
import Gauge from '../components/Gauge'
import Relation from '../components/Relation'
import Slider from '../components/Slider'


export default function DashBoard({value}) {
    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
    useEffect(() => {
        if(status !== 'success') return;
        let state = null;
        try { state=JSON.parse(sessionStorage.getItem('session')); } catch(err) {}
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
        }
    }, [status])

    if(!sheet) return null; //'Loading...';

    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/Balance?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/FixedAssets?client="+session.client+"&year="+session.year; }
    
    let jValue={};
    let jAssets = sheet[D_FixAss];
    Object.keys(jAssets).map(function(key) {
        var row = jAssets[key];
        jValue[row.idnt]=parseInt(row.rest)
    });

    let sheet_status = makeStatusData(sheet);
    let report = sheet_status.report;

    let ass = sheet_status.ass;
    let cur = sheet_status.cur;
    let fix = sheet_status.fix;
    let tan = sheet_status.tan;

    let lia = sheet_status.lia;
    let eqt = sheet_status.equity;

    let gls = sheet_status.gls;

    // add extra bar for current assets
    let iCur = BigInt(ass)-BigInt(fix);
    jValue.currency = ""+iCur;

    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/Balance?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/FixedAssets?client="+session.client+"&year="+session.year; }
    
    let page = sheet[D_Page];

    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} >

            <div classname="attrLine">
                <Gauge percent={parseInt((100n*BigInt(fix))/BigInt(ass))} radius={90} strDim={"%fixed"}  color={"#0020FF"}/>
                <Gauge percent={parseInt((100n*BigInt(tan))/BigInt(fix))} radius={90} strDim={"tan/fix"}  color={"#333344"}/>
                <Gauge percent={parseInt((100n*BigInt(gls))/BigInt(ass))} radius={90} strDim={"%gain"}  color={"#66EEAA"}/>
                <Gauge percent={parseInt((100n*BigInt(eqt))/BigInt(ass))} radius={90} strDim={"%equity"} color={"#EE3311"}/> 
                <Gauge percent={parseInt((100n*BigInt(gls))/BigInt(fix))} radius={90} strDim={"gain/fix"}  color={"#00FF00"}/>
            </div>
            <div classname="attrLine">
                
                <Gauge percent={parseInt((100n*BigInt(gls))/BigInt(eqt))} radius={90} strDim={"gain/eqt"}  color={"#CCCC22"}/>
                <Slider value={parseInt((100n*BigInt(fix))/BigInt(eqt))} legend={"fix/eqt"}/>
                <Gauge percent={parseInt((100n*BigInt(eqt))/BigInt(fix))} radius={90} strDim={"eqt/fix"} color={"#6040E0"}/> 
                <Chart jValue={jValue} legend={"assets"}/>
                <Relation scale={ass} left={cur} right={lia} legend={"cash/debt"} />
            </div>
            <div classname="attrLine">
                <Relation scale={ass} left={fix} right={eqt} legend={"fix/eqt"} />
            </div>
            <FooterRow  id={"F1"}  left={page["client"]}   right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
            <FooterRow  id={"F2"}  left={page["reference"]}  right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>

        </Screen>
        )
   
}
*/