
import { useEffect, useState, useRef  } from 'react';

import Screen from '../modules/Screen'
import { D_Page }  from '../terms.js';
import { CSEP, makeHistory, FooterRow}  from './App';
import { useSession } from '../modules/sessionmanager';

export default function History() {

    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
    useEffect(() => {
        if(status !== 'success') return;
        fetch(`${process.env.REACT_APP_API_HOST}/SHOW?sessionId=${session.id}`)
        .then(data => data.json())
        .then(data => { setSheet(data);})
    }, [status]) 

    if(!sheet) return 'Loading...';

    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="http://localhost:3000/transfer" }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="http://localhost:3000/status"}

    let page = sheet[D_Page];

    let sHistory=makeHistory(sheet);
    let sPages = sHistory.length / 20;
    let aPages = [];
    for(let p=0;p<sPages;p++) aPages[p]=p;

    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aPages} >
            {aPages.map((m,n) => (
            <div class="ulliTab" id={"PageContent"+n} style={{ display: ((n+1)==sPages) ? 'block':'none' }}>
                { sHistory.slice(n*20,(n+1)*20).map((row) => (  
                    <SigRow aRow={row.split(CSEP)} />
                ))}
                <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
            </div>
            ))}
        </Screen>
    )
    {/*long1A="Heidenreich Grundbesitz KG" long1B="" long1C="Fürth HRA 10564" long1D="216_162_50652" */}
    {/*long1A="DE46 7603 0080 0900 4976 10" long1B="2022" long1C="Dr. Georg Heidenreich" long1D="Erlangen"  */}
}

function SigRow(jRow) {
    { /* console.log("SigRow "+JSON.stringify(jRow.aRow)) */ } 
    return (
            <div class="attrLine">
                <div class="L120">{jRow.aRow[0]}</div>
                <div class="L120">{jRow.aRow[1]}</div>
                <div class="L120">{jRow.aRow[2]}</div>
                <div class="L120">{jRow.aRow[3]}</div>
                <div class="L120">{jRow.aRow[4]}</div>
                <div class="L120">{jRow.aRow[5]}</div>
            </div>
    )
}

