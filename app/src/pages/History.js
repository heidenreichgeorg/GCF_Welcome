/* global BigInt */

import { useEffect, useState } from 'react';

import { D_History, D_Page, D_Schema }  from '../terms.js';
import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { cents2EU }  from '../modules/money';
import { CSEP, getParam, prettyTXN, symbolic }  from '../modules/App';
import { useSession } from '../modules/sessionmanager';

/* REACT-BOOTSTRAP
Accordion, AccordionButton, AccordionCollapse, AccordionContext, Alert, Anchor, Badge, Breadcrumb, BreadcrumbItem,
Button,ButtonGroup, ButtonToolbar, Card, CardGroup, CardImg, Carousel, CarouselItem, CloseButton, Col, Collapse, 
Container, Dropdown,DropdownButton, Fade, Figure, FloatingLabel, Form, FormCheck, FormControl, FormFloating, FormGroup, 
FormLabel, FormSelect, FormText, Image, InputGroup, ListGroup, ListGroupItem, Modal, ModalBody, ModalDialog, ModalFooter,
ModalHeader, ModalTitle, Nav, NavDropdown, NavItem, NavLink, Navbar, NavbarBrand, Offcanvas, OffcanvasBody, OffcanvasHeader,
OffcanvasTitle, Overlay, OverlayTrigger, PageItem,Pagination, Placeholder, PlaceholderButton, Popover, PopoverBody, PopoverHeader,
ProgressBar, Ratio, Row, SSRProvider, Spinner, SplitButton, Stack, Tab, TabContainer, TabContent, TabPane, Table, Tabs,
 ThemeProvider, Toast, ToastBody, ToastContainer, ToastHeader, ToggleButton, ToggleButtonGroup, Tooltip, useAccordionButton)
*/

const SCREEN_TXNS=8;

var funcShowReceipt=null;
var funcHideReceipt=null;
var aSelText = {};
var aSelMoney = {};


export default function History() {

    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
    const [isOpen, setIsOpen] = useState(false);
 
    funcShowReceipt = (() => setIsOpen(true));
    funcHideReceipt = (() => setIsOpen(false));

    useEffect(() => {
    // run each rendering and re-rendering
        aSelText = {};
        aSelMoney = {};
        if(status !== 'success') return;
            let state = null;
            try { state=JSON.parse(sessionStorage.getItem('session')); } catch(err) {}
            if(state && Object.keys(state).length>5) {
                setSheet(state.generated);
            }
    }, [status])

    if(!sheet) return null; //'Loading...';

    function token() { return { client:session.client, year:session.year }}

    console.log("session.server="+JSON.stringify(session.server));

    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="https://"+session.server.addr+":3000/hgb275s?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="https://"+session.server.addr+":3000/partner?client="+session.client+"&year="+session.year; }

    let page = sheet[D_Page];
    let sHistory=makeHistory(sheet);
    let sPages = sHistory.length / SCREEN_TXNS;    
    let strToken=token();
    console.log("strToken="+JSON.stringify(strToken));

    let aPages = [];
    for(let p=1;p<sPages-1;p++) aPages[p]='none'; 
    aPages[0]='block';
   
     return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={isOpen ? [] : aPages } >

            {isOpen && (
                <div>                    
                    <button onClick={() => funcHideReceipt()}>Belege</button>
                    { Object.keys(aSelText).map((sym,i) => ( aSelText[sym] ? TXNReceipt(sym,i) : "")) }
                </div>
            )}

            { !isOpen && (<SearchForm token={strToken} ></SearchForm>) }
            
            {aPages.map((m,n) => ( 
                <div className="ulliTab" id={"PageContent"+n} style= {{ 'display': m}} >
                    { !isOpen && (sHistory.slice(n*SCREEN_TXNS,(n+1)*SCREEN_TXNS).map((row) => (  <SigRow row={row}/>  )))}
                    <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                    <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
                </div>
                )
            )}
        </Screen>
    )
}


function handleChange(target,aRow,mRow) {
    
    let id= ((aRow[0].substring(4).replace(/\D/g, ""))+symbolic(aRow.join('')+mRow.join('')));
    console.log("click "+id+"="+JSON.stringify(aRow));
    
    if(aSelText) {    
        if(aSelText && aSelText[id] && aSelText[id].length>0) {
            console.log("DESELECT "+id);
            aSelText[id]=null;
            aSelMoney[id]=null;
            target.value='';
        } else  {
            console.log("SELECT "+id);
            aSelText[id]=aRow;
            aSelMoney[id]=mRow;
        }
    }
}

function SigRow(row) {
    //console.log("SigRow "+JSON.stringify(row.row))  

    let aRow = [0n,0n,0n,0n,0n,0n]
    try { let saRow = row.row.sig;
        aRow = saRow.split(CSEP);
     } catch(err) {}
    
    let mRow =  [0n,0n,0n,0n,0n,0n]
    try { let smRow = row.row.money;
        mRow = smRow.split(CSEP);
    } catch(err) {}

    let saldo="";
    if(isNaN(row.row.saldo)) saldo="-,--";
    else saldo = cents2EU(row.row.saldo); // cents2EU

    return (
        <div className="attrPair">
            <div className="attrLine" id="{id}">
                <div className="SYMB"><label><input TYPE="CHECKBOX" onChange={event => handleChange(event.target,aRow,mRow)}/></label></div>
                <div className="SYMB">{aRow[0]}</div>
                <div className="SEP">&nbsp;</div>
                <div className="LNAM">{aRow[1]}</div>
                <div className="LNAM">{aRow[2]}</div>
                <div className="LNAM">{aRow[3]}</div>
                <div className="LNAM">{aRow[4]}</div>
                <div className="LNAM">{aRow[5]}</div>
            </div>
            <div className="attrLine">
                <div className="SEP">&nbsp;</div>
                <div className="C100">{mRow[0]}</div>
                <div className="C100">{mRow[1]}</div>
                <div className="C100">{mRow[2]}</div>
                <div className="C100">{mRow[3]}</div>
                <div className="C100">{mRow[4]}</div>
                <div className="C100">{mRow[5]}</div>
                <div className="C100">{mRow[6]}</div>
                <div className="C100">{mRow[7]}</div>
                <div className="C100">{saldo}</div>
            </div>
        </div>
    )
}

function makeHistory(sheet) {       

    console.log("makeHistory sheet="+Object.keys(sheet));
 

    const arrHistory = [];                
    //const response = JSON.parse(strText);
    const jHistory  = sheet[D_History];
    let aLen = parseInt(sheet[D_Schema].assets);
    let eLen = parseInt(sheet[D_Schema].eqliab);
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
            var iSaldo=0n;

            for (let hash in jHistory)  {

                let jPrettyTXN = prettyTXN(jHistory,hash,lPattern,aPattern,names,aLen,eLen);

                // GH 20220703
                if(jPrettyTXN.txnAcct) {
                   
                    // GH20221228 see ['','AN'] in App.js turened to ['AN'] 
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

                    iSaldo += BigInt(jPrettyTXN.strSaldo);
                    
                    arrHistory.push({'sig':sigLine.join(CSEP),'money':moneyLine.join(CSEP), 'saldo':""+(iSaldo) });
                                 
                }
            }
//            let rHistory=arrHistory.reverse();

            for (let i=1;i<SCREEN_TXNS;i++) arrHistory.push({sig:CSEP+CSEP+CSEP+CSEP+CSEP,money:CSEP+CSEP+CSEP+CSEP+CSEP+CSEP});
        }
    }
    return arrHistory;
}  


function SearchForm(token) {
    return (
        <div className="attrLine">
            <form onSubmit={(e)=>(console.log("SEARCH "+JSON.stringify(e.target)))} >                
                <div className='MOAM'></div>                
                <div className='LTXT'>Line:<input type='edit' name='LPATTERN'/>&nbsp;</div>                
                <div className='LTXT'>Acct:<input type='edit' name='APATTERN'/></div>                
                <input type='hidden' name='client' defaultValue={token.client}/>
                <input type='hidden' name='year' defaultValue={token.year}/>
                <div className='MOAM'><button autoFocus className='SYMB key'>Search</button></div>
                <div className='MOAM'><input type='button' name='SELECT' value='SELECT' onClick={(event) => (funcShowReceipt())}/></div>                
            </form>
        </div>
    )
}

function TXNReceipt(sym,i) {
    let amounts = aSelMoney[sym];
    let level6="";
    let level5="";
    let level4="";
    let level3="";
    let level2="";
    let level1="";
    let level0="";
    if(amounts) { 
        if(amounts.length>0) { level6=amounts[0];
            if(amounts.length>0) { level5=amounts[1];
                if(amounts.length>0) { level4=amounts[2];
                    if(amounts.length>1) { level3=amounts[3];
                        if(amounts.length>2) { level2=amounts[4];
                            if(amounts.length>3) { level1=amounts[5];
                                if(amounts.length>4) { level0=amounts[6];
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return(
        <div className="ulliTab" id="PageContentReceipt">
            <div className="attrPair">
                <BalanceRow text={aSelText[sym].join(' ')} level6={level6} level5={level5} level4={level4} level3={level3} level2={level2} level1={level1} level0={level0}/>
            </div>
        </div>
)}      

function BalanceRow({text,level6,level5,level4,level3,level2,level1,level0}) { 
    return (
        <div className="attrLine">
            <div className="L280">{text}</div>
            <div className="MOAM">{level6}</div>
            <div className="MOAM">{level5}</div>
            <div className="MOAM">{level4}</div>
            <div className="MOAM">{level3}</div>
            <div className="MOAM">{level2}</div>
            <div className="MOAM">{level1}</div>
            <div className="MOAM">{level0}</div>
        </div>
    )
}

