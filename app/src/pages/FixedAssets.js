



import { useEffect, useState, useRef  } from 'react';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { useSession } from '../modules/sessionmanager';
import { cents2EU } from '../modules/money';
import { D_FixAss, D_Partner_NET, D_Page, SCREENLINES }  from '../terms.js';

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
    for(let p=jLength;p<=SCREENLINES+1;p++) {
        filler.push({});
    }
    

    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aPages} >
            
            <div className="ulliTab" id={"PageContent1"} style= {{ 'display': 'block'}} >
            <FixedTitleRow p={ {'idnt':'Name', 'type':'WKN/Typ', 'date':"Anschaffung",
                        'init':'Anschaffungsk', 
                        'nmbr':'Anzahl',
                        'rest':'Zeitwert',
                        'current':'Anzahl',
                        'cost':'Stückpreis'} } />
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
    



    function FixedTitleRow(mRow) {
        console.log("FixedAssetsRow mRow="+JSON.stringify(mRow));
        //let unitPrice = (mRow.p.nmbr && mRow.p.nmbr>0)?cents2EU(bigEUMoney(mRow.p.cost).cents/parseInt(mRow.p.nmbr)):"--";
        return (
            <div className="attrLine">
                <div className="LNAM">{mRow.p.idnt}</div>
                <div className="SNAM">{mRow.p.type}</div>
                <div className="SNAM">{mRow.p.date}</div>
                <div className="MOAM">{(mRow.p.init)}</div>
                <div className="MOAM">{mRow.p.nmbr}</div>
                <div className="MOAM">{(mRow.p.rest)}</div>
                <div className="MOAM">{(mRow.p.cost)}</div>
            </div>        
        )
    }



    function FixedAssetsRow(mRow) {
        console.log("FixedAssetsRow mRow="+JSON.stringify(mRow));
        //let unitPrice = (mRow.p.nmbr && mRow.p.nmbr>0)?cents2EU(bigEUMoney(mRow.p.cost).cents/parseInt(mRow.p.nmbr)):"--";
        return (
            <div className="attrLine">
                <div className="LNAM">{mRow.p.idnt}</div>
                <div className="SNAM">{mRow.p.type}</div>
                <div className="SNAM">{mRow.p.date}</div>
                <div className="MOAM">{cents2EU(mRow.p.init)}</div>
                <div className="MOAM">{mRow.p.nmbr}</div>
                <div className="MOAM">{cents2EU(mRow.p.rest)}</div>
                <div className="MOAM">{cents2EU(mRow.p.cost)}</div>
            </div>        
        )
    }
