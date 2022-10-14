import { useEffect, useState, useRef  } from 'react';

import Screen from '../modules/Screen'
import { prettyTXN, buildTXN, FooterRow}  from './App';
import { J_ACCT, D_Page, D_History, D_Schema, CSEP } from '../terms.js'
import { useSession } from '../modules/sessionmanager';
import e from 'cors';


export default function Transfer() {

    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
    useEffect(() => {
        if(status !== 'success') return;
        fetch(`${process.env.REACT_APP_API_HOST}/SHOW?sessionId=${session.id}`)
        .then(data => data.json())
        .then(data => { setSheet(data);})
    }, [status]) 

    const [iRow, setIRow] = useState(0)
    function upClick() {setIRow(iRow + 1); if(iRow>=getMax(sheet)) setIRow(1);}
    function downClick() {setIRow(iRow - 1); if(iRow<=0) setIRow(getMax(sheet));}
    function UpDownSubmitRow() {
        return(
            <div class="attrLine">
                <div class="R90"> {iRow}</div>
                <div class="L22"> &nbsp;</div>
                <div class="L66"><div class="key" onClick={upClick}>+ </div></div>
                <div class="L22"> &nbsp;</div>
                <div class="R90"> &nbsp;</div>
                <div class="L22"> &nbsp;</div>
                <div class="L66"><div class="key" onClick={downClick}>-</div></div>
                <div class="R90"> &nbsp;</div>
                <div class="L22"> &nbsp;</div>
                <div class="L66"><input type="submit" class="key" value="BOOK" onClick={(e)=>onBook(e)}/></div>
            </div>
        )
    }



    function InputRow({ date,sender,reason,ref1,ref2 }) {
        return(
            <div class="attrLine">
                <div class="L66"> &nbsp;</div>
                <div class="L150"> <input type="edit" id="cDate"   name="cDate"   defaultValue ={date}   ref={refDate} /></div>
                <div class="L22"> &nbsp;</div>
                <div class="L150"> <input type="edit" id="cSender" name="cSender" defaultValue ={sender} ref={refSender}/></div>
                <div class="L22"> &nbsp;</div>
                <div class="L150"> <input type="edit" id="cReason" name="cReason" defaultValue ={reason} ref={refReason}/></div>
                <div class="L22"> &nbsp;</div>
                <div class="L150"> <input type="edit" id="cRef1"   name="cRef1"   defaultValue ={ref1}   ref={refRef1}/></div>
                <div class="L22"> &nbsp;</div>
                <div class="L150"> <input type="edit" id="cRef2"   name="cRef2"   defaultValue ={ref2}   ref={refRef2}/></div>
            </div>)
    }
    
    function handleDragOver(e) { e.preventDefault(); }
    function setDragging(e,name) { 
        console.log("start dragging "+name); 
        //const data = JSON.stringify({'account':name});
        e.dataTransfer.setData("text/plain",name);
    }
    function handleDrop(e) {
        console.log("drop "+e.dataTransfer.getData("text/plain"));
        e.currentTarget.value=e.dataTransfer.getData("text/plain");
    }
    function AccountRow({ name1,amount1, name2,amount2, name3,amount3, name4,amount4, name5,amount5}) {
        return(
            <div class="attrLine">
                <div class="L22"> &nbsp;</div>
                <div class="L66"> <input type="text" id="cNam1" name="cNam1"   ref={rName1} defaultValue={name1} onDragOver={handleDragOver}  onDrop={handleDrop}/></div>
                <div class="R90"> <input type="edit" id="cAmt1" name="cAmt1"  ref={rAmount1} defaultValue={amount1}/></div>
                <div class="L22"> &nbsp;</div>
                <div class="L66"> <input type="text" id="cNam2" name="cNam2"   ref={rName2} defaultValue={name2} onDragOver={handleDragOver}  onDrop={handleDrop}/></div>
                <div class="R90"> <input type="edit" id="cAmt2" name="cAmt2"  ref={rAmount2} defaultValue={amount2}/></div>
                <div class="L22"> &nbsp;</div>
                <div class="L66"> <input type="text" id="cNam3" name="cNam3"   ref={rName3} defaultValue={name3} onDragOver={handleDragOver}  onDrop={handleDrop}/></div>
                <div class="R90"> <input type="edit" id="cAmt3" name="cAmt3"  ref={rAmount3} defaultValue={amount3}/></div>
                <div class="L22"> &nbsp;</div>
                <div class="L66"> <input type="text" id="cNam4" name="cNam4"   ref={rName4} defaultValue={name4} onDragOver={handleDragOver}  onDrop={handleDrop}/></div>
                <div class="R90"> <input type="edit" id="cAmt4" name="cAmt4"  ref={rAmount4} defaultValue={amount4}/></div>
                <div class="L22"> &nbsp;</div>
                <div class="L66"> <input type="text" id="cNam5" name="cNam5"   ref={rName5} defaultValue={name5} onDragOver={handleDragOver}  onDrop={handleDrop}/></div>
                <div class="R90"> <input type="edit" id="cAmt5" name="cAmt5"  ref={rAmount5} defaultValue={amount5}/></div>
            </div>)
    }

    
    function AcctButtonRow({aGroup}) {

        let lineA = aGroup.slice(0,10);
        let lineB=[];
        if(aGroup.length>10) lineB = aGroup.slice(10,20);

        return(
            <div class="attrLine">
            <div class="attrLine">
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key" draggable="true" id="cNam0" onDragStart={(e) => (setDragging(e,lineA[0]))}>{lineA[0]} </div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key"  draggable="true" id="cNam1" onDragStart={(e) => (setDragging(e,lineA[1]))}>{lineA[1]} </div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key"  draggable="true" id="cNam2" onDragStart={(e) => (setDragging(e,lineA[2]))}>{lineA[2]} </div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key" draggable="true"  id="cNam3" onDragStart={(e) => (setDragging(e,lineA[3]))}>{lineA[3]} </div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key" draggable="true"  id="cNam4" onDragStart={(e) => (setDragging(e,lineA[4]))}>{lineA[4]}</div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key" draggable="true"  id="cNam5" onDragStart={(e) => (setDragging(e,lineA[5]))}>{lineA[5]} </div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key" draggable="true"  id="cNam6" onDragStart={(e) => (setDragging(e,lineA[6]))}>{lineA[6]} </div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key" draggable="true"  id="cNam7" onDragStart={(e) => (setDragging(e,lineA[7]))}>{lineA[7]} </div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key"  draggable="true" id="cNam8" onDragStart={(e) => (setDragging(e,lineA[8]))}>{lineA[8]} </div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key"  draggable="true" id="cNam9" onDragStart={(e) => (setDragging(e,lineA[9]))}>{lineA[9]} </div></div>
                <div class="L22">&nbsp;</div>
            </div>
            <div class="attrLine">
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key" draggable="true" id="cNam0">{lineB[0]}</div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key"  draggable="true" id="cNam1">{lineB[1]}</div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key"  draggable="true" id="cNam2">{lineB[2]}</div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key" draggable="true"  id="cNam3">{lineB[3]}</div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key" draggable="true"  id="cNam4">{lineB[4]}</div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key" draggable="true"  id="cNam5">{lineB[5]}</div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key" draggable="true"  id="cNam6">{lineB[6]}</div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key" draggable="true"  id="cNam7">{lineB[7]}</div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key"  draggable="true" id="cNam8">{lineB[8]}</div></div>
                <div class="L22">&nbsp;</div>
                <div class="C55"><div class="key"  draggable="true" id="cNam9">{lineB[9]}</div></div>
                <div class="L22">&nbsp;</div>
            </div>
            </div>
            )
    }
    
    const refDate=useRef({})
    const refSender=useRef({})
    const refReason=useRef({})
    const refRef1=useRef({})
    const refRef2=useRef({})
    const rAmount1=useRef({})
    const rAmount2=useRef({})
    const rAmount3=useRef({})
    const rAmount4=useRef({})
    const rAmount5=useRef({})
    const rName1=useRef({})
    const rName2=useRef({})
    const rName3=useRef({})
    const rName4=useRef({})
    const rName5=useRef({})

    function onBook(e) {
        e.preventDefault();

        let cNames = [ 
            rName1.current.value,
            rName2.current.value,
            rName3.current.value,
            rName4.current.value,
            rName5.current.value]
   
        let cAmounts = [ 
            rAmount1.current.value,
            rAmount2.current.value,
            rAmount3.current.value,
            rAmount4.current.value,
            rAmount5.current.value]

        console.log("BOOK N "+JSON.stringify(cNames));
        console.log("BOOK A "+JSON.stringify(cAmounts));
        
        let flow = { 'credit': {}, 'debit':{} }
        for(let i=0;i<5;i++) buildTXN(sheet[D_Schema],flow,cNames[i],cAmounts[i]);

        console.log("BOOK F "+JSON.stringify(flow));
        

        let jTXN = {
            "date":     refDate.current.value,
            "sender":   refSender.current.value,
            "refAcct":  refReason.current.value,
            "svwz":     refRef1.current.value,
            "svwz2":    refRef2.current.value,
            "sessionId":session.id,
            "credit":   flow.credit,
            "debit":    flow.debit,
        }
        console.log("BOOK B "+JSON.stringify(jTXN));

        book(jTXN,session); 

        console.log("BOOK O booked.");
    }    

    if(!sheet) return 'Loading...';

    let report = makeTransferData(sheet,iRow)

    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="http://localhost:3000/status" }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="http://localhost:3000/history"}

    let page = sheet[D_Page];

    let names = sheet[D_Schema].Names;

    let aLen = where(names,"ASSETS");
    let eLen = where(names,"EQLIAB");
    let aSlice = names.slice( J_ACCT, aLen)
    let gSlice = names.slice(aLen+1,eLen)
    let eSlice = names.slice(eLen+1)

    function handleKey(e) { console.log("handleKey e.key="+e.key);}

    const aNums = [0];

    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} tabSelector={aNums} >
            <TransferRow/> 
            <TransferRow/> 
            <TransferRow date={report.date} sender={report.sender} reason={report.reason} ref1={report.ref1} ref2={report.ref2} />    
            <TransferRow date={report.lTran[0]} sender={report.lTran[1]} reason={report.lTran[2]} ref1={report.lTran[3]} ref2={report.lTran[4]} />    
            <TransferRow/> 
            <TransferRow/> 
            <form onSubmit={(e)=>onBook(e)} >
                <InputRow date={report.date} sender={report.sender} reason={report.reason} ref1={report.ref1} ref2={report.ref2}/>    
                <TransferRow/> 
                <TransferRow/> 
                <AccountRow name1={report.aNames[0]} amount1={report.aAmount[0]}
                            name2={report.aNames[1]} amount2={report.aAmount[1]}
                            name3={report.aNames[2]} amount3={report.aAmount[2]}
                            name4={report.aNames[3]} amount4={report.aAmount[3]}
                            name5={report.aNames[4]} amount5={report.aAmount[4]}
                /> 
                <TransferRow/> 
                <TransferRow/> 
                <UpDownSubmitRow/>
            </form>
            <TransferRow/> 
            {
                // ['GRSB','EBKS','CDAK','COGK','CDAK','FSTF','KEST','KESO','NKFO']
                // ['MIET','AUFW','NKG', 'NKHA','EZIN','FSAL','AZIN','EDIV']
                // ['G195','KAUT','K2GH','K2EH','K2AL','K2KR','K2TO','K2LE','GALS']
            }
            
            <AcctButtonRow aGroup={names.slice( J_ACCT, aLen)}/>
            <AcctButtonRow aGroup={names.slice(aLen+1,eLen)}/>
            <AcctButtonRow aGroup={names.slice(eLen+1)}/>
            <TransferRow/> 
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

function TransferRow({ date,sender,reason,ref1,ref2 }) {
    return(
        <div class="attrLine">
            <div class="L66"> &nbsp;</div>
            <div class="L150"> {date}</div>
            <div class="L22"> &nbsp;</div>
            <div class="L150"> {sender}</div>
            <div class="L22"> &nbsp;</div>
            <div class="L150"> {reason}</div>
            <div class="L22"> &nbsp;</div>
            <div class="L150"> {ref1}</div>
            <div class="L22"> &nbsp;</div>
            <div class="L150"> {ref2}</div>
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

    let transferData={ date:'',sender:'',reason:'',ref1:'',ref2:'',lTran:["","","","","",""]};

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
                transferData.reason = txn[3];
                transferData.ref1  =  txn[4];
                transferData.ref2  =  txn[5];
                
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

function book(jTXN,session) {

    const requestOptions = {
        method: 'POST',
        headers: {  'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
        body: JSON.stringify(jTXN)
    };

    fetch(`${process.env.REACT_APP_API_HOST}/BOOK?sessionId=${session.id}`, requestOptions)
}
