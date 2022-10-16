
import { useEffect, useState, useRef  } from 'react';


import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { D_History, D_Page, D_Schema }  from '../terms.js';
import { cents2EU, CSEP, getParam, prettyTXN}  from '../modules/App';
import { useSession } from '../modules/sessionmanager';


const SCREEN_TXNS=8;

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


    let sPages = sHistory.length / SCREEN_TXNS;    
    for(let p=1;p<sPages-1;p++) aPages[p]='none'; 
    aPages[0]='block';
   

    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aPages} >
            {aPages.map((m,n) => ( 
                <div class="ulliTab" id={"PageContent"+n} style= {{ 'display': m}} >
                    { sHistory.slice(n*SCREEN_TXNS,(n+1)*SCREEN_TXNS).map((row) => (  <SigRow row={row}/>  ))}
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

function SigRow(row) {
    {  console.log("SigRow "+JSON.stringify(row.row))  } 

    let aRow = [0,0,0,0,0,0]
    try { let saRow = row.row.sig;
        aRow = saRow.split(CSEP);
     } catch(err) {}
    
    let mRow =  [0,0,0,0,0,0]
    try { let smRow = row.row.money;
        mRow = smRow.split(CSEP);
    } catch(err) {}

    return (
        <div class="attrPair">
            <div class="attrLine">
                <div class="L66">{aRow[0]}</div>
                <div class="L22">&nbsp;</div>
                <div class="L175">{aRow[1]}</div>
                <div class="L175">{aRow[2]}</div>
                <div class="L175">{aRow[3]}</div>
                <div class="L175">{aRow[4]}</div>
                <div class="L175">{aRow[5]}</div>
            </div>
            <div class="attrLine">
                <div class="L22">&nbsp;</div>
                <div class="C100">{mRow[0]}</div>
                <div class="C100">{mRow[1]}</div>
                <div class="C100">{mRow[2]}</div>
                <div class="C100">{mRow[3]}</div>
                <div class="C100">{mRow[4]}</div>
                <div class="C100">{mRow[5]}</div>
                <div class="C100">{mRow[6]}</div>
            </div>
        </div>
    )
}

function makeHistory(sheet) {       

    console.log("makeHistory sheet="+Object.keys(sheet));
 //   console.log("makeHistory sheet="+JSON.stringify(sheet));


    const arrHistory = [];                
    //const response = JSON.parse(strText);
    const jHistory  = sheet[D_History];
    const aLen = sheet[D_Schema].assets;
    const eLen = sheet[D_Schema].eqliab;
    const gSchema = sheet[D_Schema];
    const pageGlobal = sheet[D_Page];


     if(pageGlobal) {
        
        arrHistory.push({sig:CSEP+CSEP+pageGlobal["History"]+CSEP+pageGlobal["header"]+CSEP+CSEP,money:CSEP+CSEP+CSEP+CSEP+CSEP});
        
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
                    let boxNote = "'"+pageGlobal["author"].replace('&nbsp',' ')+"'";                 
                    
                    let iBalance= jPrettyTXN.iBalance;
                    let balCheck= '<DIV class="L66">'+cents2EU(iBalance)+'</DIV>';
                    //console.dir("LINE "+bLine+" --> "+iBalance);
                    //console.dir();

                    let data = (
                        jPrettyTXN.entry.join(CSEP)
                        +CSEP+jPrettyTXN.credit.join(CSEP)
                        +CSEP+jPrettyTXN.debit.join(CSEP)+CSEP+CSEP+CSEP
                        ).split(CSEP);

                    
                    
                    var i=0;
                    var sigLine=[];
                    for (i=0;i< 6;i++) { sigLine.push(data[i]); }  
                    
                    var moneyLine=[];
                    for (i=6;i<13;i++) { moneyLine.push(data[i]); }  
                    
                    arrHistory.push({'sig':sigLine.join(CSEP),'money':moneyLine.join(CSEP)});
                    
                    
                }
            }


            for (let i=1;i<SCREEN_TXNS;i++) arrHistory.push({sig:CSEP+CSEP+CSEP+CSEP+CSEP,money:CSEP+CSEP+CSEP+CSEP+CSEP+CSEP});


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
