
/* global BigInt */


import { useEffect, useState  } from 'react';
import Screen from './Screen'
import { getSession,useSession } from '../modules/sessionmanager';
import { D_FixAss,  D_Balance, D_Page, D_Partner, D_Report }  from '../modules/terms.js';
import FooterRow from '../components/FooterRow';

import BarList from '../components/BarList'
import Chart from '../components/Chart'
import Gauge from '../components/Gauge'
import Halo from '../components/Halo'
import Relation from '../components/Relation'
import Slider from '../components/Slider'


import { makeStatusData }  from '../modules/App';


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
//console.log(JSON.stringify(jAccounts));

    let jPartners = sheet[D_Partner];
    let nPartners = Object.keys(jPartners);
    let accPartners = nPartners.map((partner) => ({varCap:jPartners[partner].varCap,resCap:jPartners[partner].resCap,fixCap:jPartners[partner].fixCap,income:jPartners[partner].income}));
    let arrAccounts = accPartners.map((partner) => ([jAccounts[partner.varCap].yearEnd,partner.resCap?jAccounts[partner.resCap].yearEnd:"0",jAccounts[partner.fixCap].yearEnd,partner.income]));
    let arrNumbers = arrAccounts.map((partner) => (partner.map((strNum)=>(BigInt(strNum)).toString())));
    let namPartners = nPartners.map((partner) => ({varCap:jPartners[partner].varCap,resCap:jPartners[partner].resCap,fixCap:jPartners[partner].fixCap,income:jPartners[partner].varCap}));


    let aVarCap = accPartners.map((partner) => (jAccounts[partner.varCap].yearEnd));
    let aFixCap = accPartners.map((partner) => (jAccounts[partner.fixCap].yearEnd));
    let aResCap = accPartners.map((partner) => (jAccounts[partner.resCap]?jAccounts[partner.resCap].yearEnd:"0"));
    let aIncome = accPartners.map((partner) => (partner.income));
    let haloFeatures = { income:aIncome, fixCap:aFixCap, varCap:aVarCap,  resCap:aResCap };

    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} >
            <div classname="attrLine">
                <Halo jFeatures={haloFeatures} arrPartners={namPartners}/>
            </div>
            <FooterRow  id={"F1"}  left={page["client"]}   right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
            <FooterRow  id={"F2"}  left={page["reference"]}  right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
        </Screen>
        )
   
}
