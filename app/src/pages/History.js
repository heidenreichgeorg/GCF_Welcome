
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

   // const [ year,  setYear] = useState()
   // const [ client,  setClient] = useState()

   useEffect(() => {
        if(status !== 'success') return;
        //setYear(session.year);
        //setClient(session.client);
        let state = null;
        try { state=JSON.parse(sessionStorage.getItem('session')); } catch(err) {}
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
        }
    }, [status])

    if(!sheet) return null; //'Loading...';

    function token() { return { client:session.client, year:session.year }}

    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="http://localhost:3000/balance?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="http://localhost:3000/partner?client="+session.client+"&year="+session.year; }

    let page = sheet[D_Page];
    let sHistory=makeHistory(sheet);
    let sPages = sHistory.length / SCREEN_TXNS;    
    let strToken=token();
    console.log("strToken="+strToken);

    let aPages = [];
    for(let p=1;p<sPages-1;p++) aPages[p]='none'; 
    aPages[0]='block';
   
    var search = ((e) => console.log(JSON.stringify(e.target)));

    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aPages} >
            <SearchForm handleSearch={search} token={strToken} ></SearchForm>
            
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

    let saldo="";
    if(isNaN(row.row.saldo)) saldo="-,--";
    else saldo = cents2EU(row.row.saldo);

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
                <div class="C100">{mRow[7]}</div>
                <div class="C100">{saldo}</div>
            </div>
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
        
        arrHistory.push({sig:CSEP+CSEP+pageGlobal["History"]+CSEP+pageGlobal["header"]+CSEP+CSEP,money:CSEP+CSEP+CSEP+CSEP+CSEP});
        
        // 20220701
        var lPattern = getParam("LPATTERN");
        if(lPattern && lPattern.length<2) lPattern=null;

        var aPattern = getParam("APATTERN");
        if(aPattern && aPattern.length<2) aPattern=null;


        if(gSchema.Names && gSchema.Names.length>0) {
            var names=gSchema.Names;
            var cSaldo=0;

            for (let hash in jHistory)  {

                let jPrettyTXN = prettyTXN(jHistory,hash,lPattern,aPattern,names,aLen,eLen);

                // GH 20220703
                if(jPrettyTXN.txnAcct) {

                    let deltaText = "'"+jPrettyTXN.delta.join(CSEP)+"'";
                    let boxNote = "'"+pageGlobal["author"].replace('&nbsp',' ')+"'";                 
                    
                    let iBalance= jPrettyTXN.iBalance;
                    let balCheck= '<DIV class="L66">'+cents2EU(iBalance)+'</DIV>';

                    let data = (
                        jPrettyTXN.entry.join(CSEP)
                        +CSEP+jPrettyTXN.credit.join(CSEP)
                        +CSEP+jPrettyTXN.debit.join(CSEP)+CSEP+CSEP+CSEP
                        ).split(CSEP);
                   
                    var i=0;
                    var sigLine=[];
                    for (i=0;i< 6;i++) { sigLine.push(data[i]); }  
                    
                    var moneyLine=[];
                    for (i=6;i<14;i++) { moneyLine.push(data[i]); }  

                    cSaldo += jPrettyTXN.cSaldo;
                    
                    arrHistory.push({'sig':sigLine.join(CSEP),'money':moneyLine.join(CSEP), 'saldo':cSaldo});                                        
                }
            }
            let rHistory=arrHistory.reverse();

            for (let i=1;i<SCREEN_TXNS;i++) arrHistory.push({sig:CSEP+CSEP+CSEP+CSEP+CSEP,money:CSEP+CSEP+CSEP+CSEP+CSEP+CSEP});
        }
    }
    //console.log("makeHistory="+JSON.stringify(arrHistory))
    return arrHistory;
}  

function SearchForm(token) {
    return (
        <div class="attrLine">
            <form onSubmit={(e)=>(console.log("SEARCH "+JSON.stringify(e.target)))} >                
                <div class='R90'></div>                
                <div class='L280'>Line:<input type='edit' name='LPATTERN'/>&nbsp;</div>                
                <div class='L280'>Acct:<input type='edit' name='APATTERN'/></div>                
                <input type='hidden' name='client' defaultValue={token.token.client}/>
                <input type='hidden' name='year' defaultValue={token.token.year}/>
                <div class='R90'><button autoFocus class='L66 key'>Search</button></div>
            </form>
        </div>
    )
}
