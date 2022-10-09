import { useEffect, useState, useRef  } from 'react';

import Screen from '../modules/Screen'
import { prettyTXN, FooterRow}  from './App';
import { D_Report, D_History, D_Schema, SCREENLINES } from '../terms.js'
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
                <div class="L150"> <input type="edit" id="cDate"   name="cDate"   value={date}   ref={refDate} /></div>
                <div class="L22"> &nbsp;</div>
                <div class="L150"> <input type="edit" id="cSender" name="cSender" value={sender} ref={refSender}/></div>
                <div class="L22"> &nbsp;</div>
                <div class="L150"> <input type="edit" id="cReason" name="cReason" value={reason} ref={refReason}/></div>
                <div class="L22"> &nbsp;</div>
                <div class="L150"> <input type="edit" id="cRef1"   name="cRef1"   value={ref1}   ref={refRef1}/></div>
                <div class="L22"> &nbsp;</div>
                <div class="L150"> <input type="edit" id="cRef2"   name="cRef2"   value={ref2}   ref={refRef2}/></div>
            </div>)
    }
    
    //const [ submit, setSubmit ] = useState(0)
    const refDate=useRef({})
    const refSender=useRef({})
    const refReason=useRef({})
    const refRef1=useRef({})
    const refRef2=useRef({})
    function onBook(e) {
        e.preventDefault();

            let jTXN = {
                "date":     refDate.current.value,
                "sender":   refSender.current.value,
                "refAcct":  refReason.current.value,
                "svwz":     refRef1.current.value,
                "svwz2":    refRef2.current.value,
                "credit":{"EBKS":{"index":7,"cents":1234}},
                "debit": {"COGK":{"index":10,"cents":1234}},
                "sessionId" : session.id
            }
            book(jTXN,session); 
            console.log("BOOK O "+JSON.stringify(jTXN));
    }    

    if(!sheet) return 'Loading...';

    let report = makeTransferData(sheet,iRow)

    return (
        <Screen>
            <TransferRow date={report.date} sender={report.sender} reason={report.reason} ref1={report.ref1} ref2={report.ref2} />    
            <TransferRow date={report.lTran[0]} sender={report.lTran[1]} reason={report.lTran[2]} ref1={report.lTran[3]} ref2={report.lTran[4]} />    
            <TransferRow/> 
            <form  onSubmit={(e)=>onBook(e)} >
            
                
                <InputRow date={report.date} sender={report.sender} reason={report.reason} ref1={report.ref1} ref2={report.ref2}/>    
                <TransferRow/> 
                <AccountRow name1={report.aNames.pop()} amount1={report.aAmount.pop()}
                            name2={report.aNames.pop()} amount2={report.aAmount.pop()}
                            name3={report.aNames.pop()} amount3={report.aAmount.pop()}
                            name4={report.aNames.pop()} amount4={report.aAmount.pop()}
                            name5={report.aNames.pop()} amount5={report.aAmount.pop()}
                /> 
                <TransferRow/> 
                <UpDownSubmitRow/>
            </form>
            
            <TransferRow/>
            <FooterRow long1A="Heidenreich Grundbesitz KG" long1B="" long1C="Fürth HRA 10564" long1D="216_162_50652" />
            <FooterRow long1A="DE46 7603 0080 0900 4976 10" long1B="2022" long1C="Dr. Georg Heidenreich" long1D="Erlangen" />
        </Screen>
    )
    
}

function TransferRow({ date,sender,reason,ref1,ref2}) {

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



function AccountRow({ name1,amount1, name2,amount2, name3,amount3, name4,amount4, name5,amount5}) {
    return(
        <div class="attrLine">
            <div class="L22"> &nbsp;</div>
            <div class="L66"> {name1}</div>
            <div class="R90"> <input type="edit" id="cAmt1" name="cAmt1" value={amount1}/></div>
            <div class="L22"> &nbsp;</div>
            <div class="L66"> {name2}</div>
            <div class="R90"> <input type="edit" id="cAmt2" name="cAmt2"  value={amount2}/></div>
            <div class="L22"> &nbsp;</div>
            <div class="L66"> {name3}</div>
            <div class="R90"> <input type="edit" id="cAmt3" name="cAmt3"  value={amount3}/></div>
            <div class="L22"> &nbsp;</div>
            <div class="L66"> {name4}</div>
            <div class="R90"> <input type="edit" id="cAmt4" name="cAmt4"  value={amount4}/></div>
            <div class="L22"> &nbsp;</div>
            <div class="L66"> {name5}</div>
            <div class="R90"> <input type="edit" id="cAmt5" name="cAmt5"  value={amount5}/></div>
        </div>)
}


function getMax(response) {
    var jHistory = response[D_History];
    if(jHistory) return Object.keys(jHistory).length-1;
    return 0;
}


function makeTransferData(response,iSelected) {

    var jReport = response[D_Report];
//    console.log("makeTransferData from response D_Report"+JSON.stringify(Object.keys(jReport)));

    var jHistory = response[D_History];
    var gSchema = response[D_Schema];

    let transferData={ date:'',sender:'',reason:'',ref1:'',ref2:'',lTran:["","","","","",""]};

    if(jHistory && gSchema.Names && gSchema.Names.length>0) {

        var names=gSchema.Names;
        var aLen = gSchema.assets;
        var eLen = gSchema.eqliab;
        var bLine=0;
//        console.log("makeTransferData Schema "+aLen+":"+eLen);
//        console.log("makeTransferData Schema "+JSON.stringify(Object.keys(gSchema)))

        for (let hash in jHistory)  {

            if(bLine===iSelected) {
                let txn = jHistory[hash];

                //console.log("makeTransferData txn="+JSON.stringify(Object.keys(txn)));

                transferData.date   = txn[1];
                transferData.sender = txn[2];
                transferData.reason = txn[3];
                transferData.ref1  =  txn[4];
                transferData.ref2  =  txn[5];
                
                let jPrettyTXN = prettyTXN(jHistory,hash,null,null,names,aLen,eLen);

                transferData.aNames = jPrettyTXN.aNames;                                
                transferData.aAmount= jPrettyTXN.aAmount;

                transferData.lTran=jPrettyTXN.aNames.map((n,i)=>(n+jPrettyTXN.aAmount[i]));
                
                //console.log("makeTransferData: lTran="+JSON.stringify(Object.keys(transferData.lTran)))
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
