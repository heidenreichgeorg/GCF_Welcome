



import { useEffect, useState, useRef  } from 'react';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { useSession } from '../modules/sessionmanager';
import { cents2EU, setEUMoney } from  '../modules/money'

import { D_FixAss, D_Partner_NET, D_Page, D_Report, D_Schema, X_ASSETS, X_EQLIAB, X_INCOME, SCREENLINES }  from '../terms.js';

export default function FixedAssets() {

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

    
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="https://"+session.server.addr+":3000/balance?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="https://"+session.server.addr+":3000/hgb275s?client="+session.client+"&year="+session.year; }
    
    let page = sheet[D_Page];
    
    var jReport = JSON.parse(JSON.stringify(sheet[D_Partner_NET]));
    var jAssets = sheet[D_FixAss];

    console.log("X_ASSETS = "+JSON.stringify(jAssets));

    let aPages = [];

    let jLength = Object.keys(jAssets).length  + 2;

    let  filler=[];
    for(let p=jLength;p<SCREENLINES;p++) {
        filler.push({});
    }
    


    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aPages} >
            
            <div className="ulliTab" id={"PageContent1"} style= {{ 'display': 'block'}} >
            <FixedAssetsRow p={ {'name':'name', 'wkn':'wkn', 
                        'init':'init', 
                        'number':'number',
                        'current':'current',
                        'deprec':'deprec',
                        'unitPrice':'unitPrice'} } />
                {Object.keys(jAssets).map((id) => (
                    <FixedAssetsRow p={jAssets[id]}/>    
                ))}           

                { filler.map((row) => (
                    <FixedAssetsRow p={row}/>    
                ))}    
                
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
                <div className="LNAM">{mRow.p.idnt}</div>
                <div className="SYMB">{mRow.p.date}</div>
                <div className="SYMB">{mRow.p.type}</div>
                <div className="MOAM">{mRow.p.init}</div>
                <div className="MOAM">{mRow.p.nmbr}</div>
                <div className="MOAM">{mRow.p.rest}</div>
                <div className="MOAM">{mRow.p.cost}</div>
                <div className="MOAM">{mRow.p.unitPrice}</div>
            </div>
        
        )
    }

