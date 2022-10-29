
import { useEffect, useState, useRef  } from 'react';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { useSession } from '../modules/sessionmanager';

import { D_Balance, D_Partner_NET, D_Page, D_Report, D_Schema, X_ASSETS, X_EQLIAB, X_INCOME, SCREENLINES }  from '../terms.js';

export default function Partner() {

    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
    useEffect(() => {
        if(status !== 'success') return;
        fetch(`${process.env.REACT_APP_API_HOST}/SHOW?sessionId=${session.id}`)
        .then(data => data.json())
        .then(data => { setSheet(data);})
    }, [status]) 

    if(!sheet) return null; //'Loading...';

    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="http://localhost:3000/transfer" }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="http://localhost:3000/history"}
    
    let page = sheet[D_Page];
    
    var jReport = JSON.parse(JSON.stringify(sheet[D_Partner_NET]));
    console.log("Partner() with response D_Report"+JSON.stringify(jReport));

    let aPages = [];
/*
    let numPages = 1+jReport.length/SCREENLINES;

    for(let p=1;p<numPages;p++) aPages[p]='none'; 
    aPages[0]='block';
*/
    let jLength = Object.keys(jReport).length;
    let  filler=[];
    for(let p=jLength;p<SCREENLINES;p++) {
        filler.push({});
    }

    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aPages} >
            
            <div class="ulliTab" id={"PageContent1"} style= {{ 'display': 'block'}} >
            <PartnerRow p={ {'name':'name', 'init':'init', 'credit':'credit', 'debit':'debit', 'gross':'gross', 'income':'income', 'tax':'tax', 'next':'next'} } />
                {Object.keys(jReport).map((id) => (
                    <PartnerRow p={jReport[id]}/>    
                ))}           

                { filler.map((row) => (
                    <PartnerRow p={row}/>    
                ))}    
                       
                <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
            </div>
            
        </Screen>
    )
}


function PartnerRow(mRow) {

    console.log("PartnerRow mRow="+JSON.stringify(mRow));

    return (

        <div class="attrLine">
            <div class="L22">&nbsp;</div>
            <div class="L66">{mRow.p.name}</div>
            <div class="L22">&nbsp;</div>
            <div class="R90">{mRow.p.init}</div>
            <div class="R90">{mRow.p.credit}</div>
            <div class="R90">{mRow.p.debit}</div>
            <div class="R90">{mRow.p.gross}</div>
            <div class="R90">{mRow.p.income}</div>
            <div class="R90">{mRow.p.tax}</div>
            <div class="R90">{mRow.p.next}</div>
        </div>
    
    )
}
