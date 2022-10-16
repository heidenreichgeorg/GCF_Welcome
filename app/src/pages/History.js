
import { useEffect, useState, useRef  } from 'react';

import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { D_History, D_Page, D_Schema }  from '../terms.js';
import { cents2EU, CSEP, getParam, prettyTXN}  from '../modules/App';
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

    if(!sheet) return null; //'Loading...';

    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="http://localhost:3000/transfer" }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="http://localhost:3000/status"}

    let page = sheet[D_Page];
    let aPages = [];
    let sHistory=makeHistory(sheet);
{

    let sPages = sHistory.length / 20;
    
    for(let p=1;p<sPages-1;p++) aPages[p]='none'; 
    aPages[0]='block';
}   

    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aPages} >
            {aPages.map((m,n) => ( 
                <div class="ulliTab" id={"PageContent"+n} style= {{ 'display': m}} >
                    { sHistory.slice(n*20,(n+1)*20).map((row) => (  
                        <SigRow aRow={row.split(CSEP)} />
                    ))}
                    <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                    <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                </div>
                )
            )}
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

function makeHistory(sheet) {       

    console.log("makeHistory sheet="+Object.keys(sheet));


    const arrHistory = [];                
    //const response = JSON.parse(strText);
    const jHistory  = sheet[D_History];
    const aLen = sheet[D_Schema].assets;
    const eLen = sheet[D_Schema].eqliab;
    const gSchema = sheet[D_Schema];
    const pageGlobal = sheet[D_Page];


     if(pageGlobal) {
        
        arrHistory.push(CSEP+CSEP+pageGlobal["History"]+CSEP+pageGlobal["header"]+CSEP+CSEP);

        arrHistory.push(CSEP+CSEP+CSEP+CSEP+CSEP);
        
        // 20220701
        var lPattern = getParam("LPATTERN");
        if(lPattern && lPattern.length<2) lPattern=null;

        var aPattern = getParam("APATTERN");
        if(aPattern && aPattern.length<2) aPattern=null;


        if(gSchema.Names && gSchema.Names.length>0) {
            var names=gSchema.Names;

            var bLine=0;
            for (let hash in jHistory)  {
                bLine++;

                let jPrettyTXN = prettyTXN(jHistory,hash,lPattern,aPattern,names,aLen,eLen);

                // GH 20220703
                if(jPrettyTXN.txnAcct) {

                    let deltaText = "'"+jPrettyTXN.delta.join(CSEP)+"'";
                    let boxHead = "'"+jPrettyTXN.entry.join(CSEP)+"'";   
                    let boxText = "'"+jPrettyTXN.credit.join(CSEP)+CSEP+jPrettyTXN.debit.join(CSEP)+"'";   
                    let boxNote = "'"+pageGlobal["author"].replace('&nbsp;',CSEP)+"'";                 
                    let iBalance= jPrettyTXN.iBalance;
                    


                    let balCheck= '<DIV class="L66">'+cents2EU(iBalance)+'</DIV>';
                    //console.dir("LINE "+bLine+" --> "+iBalance);
                    //console.dir();

                    let data = (
                        jPrettyTXN.entry.join(CSEP)
                        +CSEP+jPrettyTXN.credit.join(CSEP)
                        +CSEP+jPrettyTXN.debit.join(CSEP)+CSEP+CSEP
                        ).split(CSEP);

                    
                    
                    var i=0;
                    var htmlLine=[];
                    for (i=0;i< 6;i++) { htmlLine.push(data[i]); }  arrHistory.push(htmlLine.join(CSEP));
                    
                    var htmlLine=[];
                    for (i=6;i<12;i++) { htmlLine.push(data[i]); }  arrHistory.push(htmlLine.join(CSEP));
                    
                }
            }


            for (let i=1;i<20;i++) arrHistory.push(CSEP+CSEP+CSEP+CSEP+CSEP);


            /*
            // 20220701 search pattern 
            let sessionId = getId();
            let searchForm = "<FORM><DIV class='L280'>"
                +"<BUTTON autoFocus class='L66'>Search</BUTTON>"
                +"Line:<INPUT TYPE='edit' NAME='LPATTERN'/>&nbsp;"
            +"</DIV><DIV class='L280'>"
                +"Acct:<INPUT TYPE='edit' NAME='APATTERN'/>"
            +"</DIV><INPUT TYPE='hidden' NAME='sessionId' VALUE='"+sessionId+"'/></FORM>";
            cursor=printHTML(cursor,searchForm);

            setTrailer(pageGlobal, cursor);
            setScreen(document,htmlPage);
            */
        }
    }
    console.log("makeHistory="+JSON.stringify(arrHistory))

    return arrHistory;
}  
