import { useEffect, useState, useRef  } from 'react';

import FooterRow from '../components/FooterRow'
import Screen from '../pages/Screen'
import { book, prettyTXN, prepareTXN }  from '../modules/writeModule';
import { J_ACCT, D_Page, D_History, D_Schema, CSEP } from '../modules/terms.js'
import { useSession } from '../modules/sessionmanager';

export default function Transfer() {

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

    const [iRow, setIRow] = useState(0)
    function upClick() {setIRow(iRow + 1); if(iRow>=getMax(sheet)) setIRow(1);}
    function downClick() {setIRow(iRow - 1); if(iRow<=0) setIRow(getMax(sheet));}
    function UpDownSubmitRow() {
        return(
            <div className="attrLine">
                <div className="FIELD MOAM"> {iRow}</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SYMB"><div className="key" onClick={upClick}>+ </div></div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM"> &nbsp;</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SYMB"><div className="key" onClick={downClick}>-</div></div>
                <div className="FIELD MOAM"> &nbsp;</div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD MOAM"><input type="submit" className="key" value="BOOK" onClick={(e)=>onBook(e)}/></div>
            </div>
        )
    }



    function InputRow({ date,sender,refAcct,reason,refCode }) {
        return(
            <div className="attrLine">
                <div className="FIELD SYMB"> &nbsp;</div>
                <div className="FIELD XFER"> <input type="edit" id="cDate"   name="cDate"   defaultValue ={date} onDrop={ignore}  ref={refDate} /></div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD XFER"> <input type="edit" id="cSender" name="cSender" defaultValue ={sender} onDrop={ignore} ref={refSender}/></div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD XFER"> <input type="edit" id="cRefAcct"   name="cRefAcct"   defaultValue ={refAcct} onDrop={ignore}  ref={refRefAcct}/></div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD XFER"> <input type="edit" id="cReason" name="cReason" defaultValue ={reason} onDrop={ignore}  ref={refReason}/></div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD XFER"> <input type="edit" id="cRefTime"   name="cRefTime"   defaultValue ={refCode} onDrop={ignore} ref={refRefTime}/></div>
            </div>)
    }
    
    function ignore(e) { e.preventDefault(); }
    function setDragging(e,name) { 
        console.log("start dragging "+name); 
        //const data = JSON.stringify({'account':name});
        e.dataTransfer.setData("text/plain",name);
    }
    function handleDrop(e) {
        console.log("drop "+e.dataTransfer.getData("text/plain"));
        e.currentTarget.value=e.dataTransfer.getData("text/plain");
        e.preventDefault();
    }
    function AccountRow({ name1,amount1, name2,amount2, name3,amount3, name4,amount4, name5,amount5, name6,amount6, name7,amount7 }) {
        return(
            <div>
            <div className="attrLine">
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SYMB"> <input type="text" id="cNam1" name="cNam1"   ref={rName1} defaultValue={name1} onDragOver={ignore}  onDrop={handleDrop}/></div>
                <div className="FIELD MOAM"> <input type="edit" id="cAmt1" name="cAmt1"  ref={rAmount1} defaultValue={amount1} onDrop={ignore}  /></div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SYMB"> <input type="text" id="cNam2" name="cNam2"   ref={rName2} defaultValue={name2} onDragOver={ignore}  onDrop={handleDrop}/></div>
                <div className="FIELD MOAM"> <input type="edit" id="cAmt2" name="cAmt2"  ref={rAmount2} defaultValue={amount2} onDrop={ignore}  /></div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SYMB"> <input type="text" id="cNam3" name="cNam3"   ref={rName3} defaultValue={name3} onDragOver={ignore}  onDrop={handleDrop}/></div>
                <div className="FIELD MOAM"> <input type="edit" id="cAmt3" name="cAmt3"  ref={rAmount3} defaultValue={amount3} onDrop={ignore}  /></div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SYMB"> <input type="text" id="cNam4" name="cNam4"   ref={rName4} defaultValue={name4} onDragOver={ignore}  onDrop={handleDrop}/></div>
                <div className="FIELD MOAM"> <input type="edit" id="cAmt4" name="cAmt4"  ref={rAmount4} defaultValue={amount4} onDrop={ignore}  /></div>
                <div className="FIELD SEP"> &nbsp;</div>
            </div>
            <div className="attrLine">
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SYMB"> <input type="text" id="cNam5" name="cNam5"   ref={rName5} defaultValue={name5} onDragOver={ignore}  onDrop={handleDrop}/></div>
                <div className="FIELD MOAM"> <input type="edit" id="cAmt5" name="cAmt5"  ref={rAmount5} defaultValue={amount5} onDrop={ignore}  /></div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SYMB"> <input type="text" id="cNam6" name="cNam6"   ref={rName6} defaultValue={name6} onDragOver={ignore}  onDrop={handleDrop}/></div>
                <div className="FIELD MOAM"> <input type="edit" id="cAmt6" name="cAmt6"  ref={rAmount6} defaultValue={amount6} onDrop={ignore}  /></div>
                <div className="FIELD SEP"> &nbsp;</div>
                <div className="FIELD SYMB"> <input type="text" id="cNam7" name="cNam7"   ref={rName7} defaultValue={name7} onDragOver={ignore}  onDrop={handleDrop}/></div>
                <div className="FIELD MOAM"> <input type="edit" id="cAmt7" name="cAmt7"  ref={rAmount7} defaultValue={amount7} onDrop={ignore}  /></div>
            </div></div>)
    }

    
    function AcctButtonRow({aGroup}) {

        let lineA = aGroup.slice(0,10);
        let lineB=[];
        if(aGroup.length>10) lineB = aGroup.slice(10,20);

        return(
            <div className="attrLine">
            <div className="attrLine">
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key" draggable="true" id="cNam0" onDragStart={(e) => (setDragging(e,lineA[0]))}>{lineA[0]} </div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key"  draggable="true" id="cNam1" onDragStart={(e) => (setDragging(e,lineA[1]))}>{lineA[1]} </div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key"  draggable="true" id="cNam2" onDragStart={(e) => (setDragging(e,lineA[2]))}>{lineA[2]} </div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key" draggable="true"  id="cNam3" onDragStart={(e) => (setDragging(e,lineA[3]))}>{lineA[3]} </div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key" draggable="true"  id="cNam4" onDragStart={(e) => (setDragging(e,lineA[4]))}>{lineA[4]}</div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key" draggable="true"  id="cNam5" onDragStart={(e) => (setDragging(e,lineA[5]))}>{lineA[5]} </div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key" draggable="true"  id="cNam6" onDragStart={(e) => (setDragging(e,lineA[6]))}>{lineA[6]} </div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key" draggable="true"  id="cNam7" onDragStart={(e) => (setDragging(e,lineA[7]))}>{lineA[7]} </div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key"  draggable="true" id="cNam8" onDragStart={(e) => (setDragging(e,lineA[8]))}>{lineA[8]} </div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key"  draggable="true" id="cNam9" onDragStart={(e) => (setDragging(e,lineA[9]))}>{lineA[9]} </div></div>
                <div className="FIELD SEP">&nbsp;</div>
            </div>
            <div className="attrLine">
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key" draggable="true" id="cNam10">{lineB[0]}</div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key"  draggable="true" id="cNam11">{lineB[1]}</div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key"  draggable="true" id="cNam12">{lineB[2]}</div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key" draggable="true"  id="cNam13">{lineB[3]}</div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key" draggable="true"  id="cNam14">{lineB[4]}</div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key" draggable="true"  id="cNam15">{lineB[5]}</div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key" draggable="true"  id="cNam16">{lineB[6]}</div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key" draggable="true"  id="cNam17">{lineB[7]}</div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key"  draggable="true" id="cNam18">{lineB[8]}</div></div>
                <div className="FIELD SEP">&nbsp;</div>
                <div className="FIELD TAG"><div className="key"  draggable="true" id="cNam19">{lineB[9]}</div></div>
                <div className="FIELD SEP">&nbsp;</div>
            </div>
            </div>
            )
    }
    
    const refDate=useRef({})
    const refSender=useRef({})
    const refRefAcct=useRef({})
    const refReason=useRef({})
    const refRefTime=useRef({})
    const rAmount1=useRef({})
    const rAmount2=useRef({})
    const rAmount3=useRef({})
    const rAmount4=useRef({})
    const rAmount5=useRef({})
    const rAmount6=useRef({})
    const rAmount7=useRef({})
    const rName1=useRef({})
    const rName2=useRef({})
    const rName3=useRef({})
    const rName4=useRef({})
    const rName5=useRef({})
    const rName6=useRef({})
    const rName7=useRef({})

    function onBook(e) {
        e.preventDefault();

        let cNames = [ 
            rName1.current.value,
            rName2.current.value,
            rName3.current.value,
            rName4.current.value,
            rName5.current.value,
            rName6.current.value,
            rName7.current.value]
   
        let cAmounts = [ 
            rAmount1.current.value,
            rAmount2.current.value,
            rAmount3.current.value,
            rAmount4.current.value,
            rAmount5.current.value,
            rAmount6.current.value,
            rAmount7.current.value]

        console.log("BOOK N "+JSON.stringify(cNames));
        console.log("BOOK A "+JSON.stringify(cAmounts));
        
        let flow = { 'credit':{}, 'debit':{} };
        for(let i=0;i<7;i++) flow=prepareTXN(sheet[D_Schema],flow,cNames[i],cAmounts[i]);

        console.log("BOOK F "+JSON.stringify(flow));
        

        let jTXN = {
            "date":     refDate.current.value,
            "sender":   refSender.current.value,
            "refAcct":  refRefAcct.current.value,
            "reason":   refReason.current.value,
            "refCode":  refRefTime.current.value,
            "sessionId":session.id,
            "credit":   flow.credit,
            "debit":    flow.debit,
        }
        console.log("BOOK B "+JSON.stringify(jTXN));

        book(jTXN,session); 

        // invalidate current session
        sessionStorage.setItem('session',"");

        console.log("BOOK O booked.");
    }    

    if(!sheet) return null; // 'Loading...';

    let report = makeTransferData(sheet,iRow)

    
//    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="https://"+session.server.addr+":3000/status?client="+session.client+"&year="+session.year; }
//    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="https://"+session.server.addr+":3000/accounts?client="+session.client+"&year="+session.year; }
    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="/Status?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="/Accounts?client="+session.client+"&year="+session.year; }

    let page = sheet[D_Page];

    let names = sheet[D_Schema].Names;

    let aLen = where(names,"ASSETS");
    let eLen = where(names,"EQLIAB");
    let aSlice = names.slice( J_ACCT, aLen)
    let gSlice = names.slice(aLen+1,eLen)
    let eSlice = names.slice(eLen+1)

    function handleKey(e) { console.log("handleKey e.key="+e.key);}

    const aNums = [0];

    const tabName = 'TXNContent';
    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aNums} tabName={tabName}>
            <TransferRow/> 
            <TransferRow/> 
            <TransferRow/> 
            <TransferRow date={report.date} sender={report.sender} refAcct={report.refAcct} reason={report.reason} refCode={report.refCode} />    
            <TransferRow date={report.lTran[0]} sender={report.lTran[1]} refAcct={report.lTran[2]} reason={report.lTran[3]} refCode={report.lTran[4]} />    
            <TransferRow/> 
            <TransferRow/> 
            <form onSubmit={(e)=>onBook(e)} >
                <InputRow date={report.date} sender={report.sender} refAcct={report.refAcct} reason={report.reason} refCode={report.refCode}/>    
                <TransferRow/> 
                <TransferRow/> 
                <AccountRow name1={report.aNames[0]} amount1={report.aAmount[0]}
                            name2={report.aNames[1]} amount2={report.aAmount[1]}
                            name3={report.aNames[2]} amount3={report.aAmount[2]}
                            name4={report.aNames[3]} amount4={report.aAmount[3]}
                            name5={report.aNames[4]} amount5={report.aAmount[4]}
                            name6={report.aNames[5]} amount6={report.aAmount[5]}
                            name7={report.aNames[6]} amount7={report.aAmount[6]}
                /> 
                <TransferRow/> 
                <TransferRow/> 
                <TransferRow/> 
            </form>
            <TransferRow/> 
            
            <AcctButtonRow aGroup={names.slice( J_ACCT, aLen)}/>
            <AcctButtonRow aGroup={names.slice(aLen+1,eLen)}/>
            <AcctButtonRow aGroup={names.slice(eLen+1)}/>
            <TransferRow/> 
            <TransferRow/> 
                <UpDownSubmitRow/>
            <TransferRow/> 
            <TransferRow/>
            <FooterRow left={page["client"]}  right={page["register"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
            <FooterRow left={page["reference"]} right={page["author"]} prevFunc={prevFunc} nextFunc={nextFunc}/>
        </Screen>
    )
    
}

function where(array,key) {
    for(let i=0;i<array.length;i++) if((array[i]+CSEP).startsWith(key)) return i;
}

function TransferRow({ date,sender,refAcct,reason,refCode }) {
    return(
        <div className="attrLine">
            <div className="SYMB"> &nbsp;</div>
            <div className="FIELD XFER"> {date}</div>
            <div className="FIELD SEP"> &nbsp;</div>
            <div className="FIELD XFER"> {sender}</div>
            <div className="FIELD SEP"> &nbsp;</div>
            <div className="FIELD XFER"> {refAcct}</div>
            <div className="FIELD SEP"> &nbsp;</div>
            <div className="FIELD XFER"> {reason}</div>
            <div className="FIELD SEP"> &nbsp;</div>
            <div className="FIELD XFER"> {refCode}</div>
        </div>)
}



function getMax(response) {
    var jHistory = response[D_History];
    if(jHistory) return Object.keys(jHistory).length-1;
    return 0;
}


function makeTransferData(response,iSelected) {

    var jHistory = response[D_History];
    var gSchema = response[D_Schema];

    let transferData={ date:'',sender:'',refAcct:'',reason:'',refCode:'',lTran:["","","","","",""]};

    if(jHistory && gSchema.Names && gSchema.Names.length>0) {
        var names=gSchema.Names;
        var aLen = gSchema.assets;
        var eLen = gSchema.eqliab;
        var bLine=0;

        for (let hash in jHistory)  {

            if(bLine===iSelected) {
                let txn = jHistory[hash];
                transferData.date   = txn[1];
                transferData.sender = txn[2];
                transferData.refAcct = txn[3];
                transferData.reason  =  txn[4];
                transferData.refCode  =  txn[5];
                
                let jPrettyTXN = prettyTXN(jHistory,hash,null,null,names,aLen,eLen);
                transferData.aNames = jPrettyTXN.aNames;                                
                transferData.aAmount= jPrettyTXN.aAmount;
                transferData.lTran=jPrettyTXN.aNames.map((n,i)=>(n+jPrettyTXN.aAmount[i]));
            }
            bLine++;
        }
    }  
   return transferData;
}
