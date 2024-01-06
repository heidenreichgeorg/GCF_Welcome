
/* global BigInt */


import { useEffect, useState  } from 'react';
import Screen from './Screen.js'
import { getSession,useSession } from '../modules/sessionmanager';
import { D_FixAss,  D_Balance, D_Page, D_Partner }  from '../modules/terms.js';
import FooterRow from '../components/FooterRow.js';

import Halo from '../components/Halo.js'


import { makeStatusData }  from '../modules/App.js';


export default function DashBoard({value}) {
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
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/HGB275S2Page?client="+session.client+"&year="+session.year; }
    
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
    
    let page = sheet[D_Page];


    var jAccounts = sheet[D_Balance];
    let aAccounts = Object.keys(jAccounts);
    let aYearEnd = aAccounts.map((name)=>((jAccounts[name].xbrl.startsWith("de-gaap-ci_is.netIncome.regular"))?jAccounts[name].yearEnd:"0"))
    let aAssets  = aAccounts.map((name)=>((jAccounts[name].xbrl.startsWith("de-gaap-ci_bs.ass"))?jAccounts[name].yearEnd:"0"))
    let nYearEnd = aAccounts.map((name)=>({'yearEnd':name}));
    console.log("jAccounts "+JSON.stringify(jAccounts));
    aAssets.pop(); aAssets.pop(); aAssets.pop();
    aYearEnd.pop();

    let jPartners = sheet[D_Partner];
    let nPartners = Object.keys(jPartners);
    let accPartners = nPartners.map((partner) => ({varCap:jPartners[partner].varCap,resCap:jPartners[partner].resCap,fixCap:jPartners[partner].fixCap,income:jPartners[partner].income}));
    let namPartners = nPartners.map((partner) => ({varCap:jPartners[partner].varCap,resCap:jPartners[partner].resCap,fixCap:jPartners[partner].fixCap,income:jPartners[partner].varCap}));

    let aVarCap = accPartners.map((partner) => (jAccounts[partner.varCap].yearEnd));
    let aFixCap = accPartners.map((partner) => (jAccounts[partner.fixCap].yearEnd));
    let aResCap = accPartners.map((partner) => (jAccounts[partner.resCap]?jAccounts[partner.resCap].yearEnd:"0"));
    let aIncome = accPartners.map((partner) => (partner.income));
    let haloFeatures = { income:aIncome, fixCap:aFixCap, varCap:aVarCap,  resCap:aResCap };

    let xcenter=120;
    let ycenter=120;

    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} >
            <div classname="attrLine">
            <svg viewBox="0 0 230 250" height="720" width="760" background-color="#000000">
                <defs>
                    <radialGradient id="bgGradient">
                        <stop offset="10%" stop-color="#081177" />
                        <stop offset="95%" stop-color="#000022" />
                    </radialGradient>
                </defs>
                <circle cx={xcenter} cy={ycenter} r="140" fill="url('#bgGradient')" />
                <line x1={-10}  y1={ycenter}  x2={2*xcenter+10}  y2={ycenter}      stroke="#000033" strokeWidth={1} />
                <line  x1={xcenter} y1={-10}  x2={xcenter}       y2={2*ycenter+10} stroke="#000033" strokeWidth={1} />

                <Halo                                                    radius={110} x={xcenter} y={ycenter}/>

                <Halo jFeatures={{"yearEnd":aAssets}} arrPartners={nYearEnd}   radius={110} x={xcenter} y={ycenter} />

                <Halo jFeatures={haloFeatures} arrPartners={namPartners}      radius={90} x={xcenter} y={ycenter}/>

                <Halo jFeatures={{"yearEnd":aYearEnd}} arrPartners={nYearEnd} radius={70} x={xcenter} y={ycenter} />

            </svg>
            </div>
            <FooterRow  id={"F1"}  left={page["client"]}   right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
            <FooterRow  id={"F2"}  left={page["reference"]}  right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
        </Screen>
        )
   
}
