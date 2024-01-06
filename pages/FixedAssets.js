/* global BigInt */

import { useEffect, useState, useRef  } from 'react';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { getSession,useSession } from '../modules/sessionmanager';
import { cents2EU } from '../modules/money';
import { D_FixAss, D_Report, D_Page, SCREENLINES }  from '../modules/terms.js';

export default function FixedAssets() {

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

    
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/DashBoard?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/HaloBoard?client="+session.client+"&year="+session.year; }

    let page = sheet[D_Page];
    var jReport = sheet[D_Report];
    var jAssets = sheet[D_FixAss];

    console.log("X_ASSETS = "+JSON.stringify(jAssets));

    let aPages = [];

    
    let jLength = Object.keys(jAssets).length  + 3;
    let  filler=[];
    for(let p=jLength;p<=SCREENLINES+1;p++) {
        filler.push({});
    }
    
    var iRest = 0n;

    return (
        <Screen  aFunc={[prevFunc, nextFunc]} aText={["PREV","NEXT"]} tabSelector={aPages} >
            
            <div className="FIELD" id={"faPageContent1"} style= {{ 'display': 'block' }} >
            <FixedAssetsRow p={ {'idnt':'Name', 'type':'WKN/Typ', 
                        'date':page.AcquisitionDate,
                        'init':page.AcquisitionPrice, 
                        'nmbr':page.AssetNumber, // 'Anzahl',
                        'rest':page.AssetRemain, //'Zeitwert',
                        'cost':page.AssetPrice, // 'Stückpreis',
                        'gain':page.AssetGain  // 'Ertrag'} } />
                        }} /> 


                {Object.keys(jAssets).map(function(key,n) {
                    var row = jAssets[key];
                    iRest+=BigInt(row.rest);
                    return (
                        <FixedAssetsRow  key={"Fixed0"+n}  p={{idnt:row.idnt,type:row.type,date:row.date,
                            init:cents2EU(row.orig),
                            nmbr:row.nmbr,
                            rest:cents2EU(row.rest),
                            cost:cents2EU(row.cost),
                            gain:cents2EU(row.gain)
                            }} />
                    )
                    })
                }

                <FixedAssetsRow p={{ 'idnt':jReport.xbrlFixed.de_DE, 'type':' ', 'date':session.year+"-12-31",
                        'init':' ', 
                        'nmbr':' ',
                        'rest':cents2EU(iRest),
                        'current':' ',
                        'cost':' ' } }
                />

                { filler.map((row,n) =>
                    (
                        <FixedAssetsRow  key={"Fixed2"+n} p={row} />
                    )                    
                )}    
                
                <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
            </div>            
        </Screen>
    )
    
}
    function FixedAssetsRow(mRow) {
        console.log("FixedAssetsRow mRow="+JSON.stringify(mRow));
        return (
            <div className="attrLine">
                <div className="FIELD LNAM">{mRow.p.idnt}</div>
                <div className="FIELD NAME">{mRow.p.type}</div>
                <div className="FIELD NAME">{mRow.p.date}</div>
                <div className="FIELD MOAM">{mRow.p.init}</div>
                <div className="FIELD MOAM">{mRow.p.nmbr}</div>
                <div className="FIELD MOAM">{mRow.p.rest}</div>
                <div className="FIELD MOAM">{mRow.p.cost}</div>
                <div className="FIELD MOAM">{mRow.p.gain}</div>
            </div>        
        )
    }
