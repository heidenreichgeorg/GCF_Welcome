import { useEffect, useState } from 'react';

import Screen from '../modules/Screen'
import { iCpField, prettyTXN, FooterRow}  from './App';
import { D_Balance, D_Report, D_History, D_Schema, SCREENLINES } from '../terms.js'
import { useSession } from '../modules/sessionmanager';

export default function Transfer() {
    
    const { session, status } = useSession()

    const [ sheet,  setSheet] = useState()

    const [iRow, setIRow] = useState(0)
    function upClick() {setIRow(iRow + 1); if(iRow>=getMax(sheet)) setIRow(1);}
    function downClick() {setIRow(iRow - 1); if(iRow<=0) setIRow(getMax(sheet));}

    useEffect(() => {
        if(status !== 'success') return;
        fetch(`${process.env.REACT_APP_API_HOST}/SHOW?sessionId=${session.id}`)
        .then(data => data.json())
        .then(data => { setSheet(data);})
    }, [status])

    if(!sheet) return 'Loading...';

    let report = makeTransferData(sheet,iRow)

    return (
        <Screen>
            <TransferRow date={report.date} sender={report.sender} reason={report.reason} ref1={report.ref1} ref2={report.ref2} />    
            <TransferRow date={report.lTran[0]} sender={report.lTran[1]} reason={report.lTran[2]} ref1={report.lTran[3]} ref2={report.lTran[4]} />    
            <TransferRow/> 
            { /*
                report.map((row) => (
                    <TransferRow am1={row.gLeft} tx1={row.nLeft} am2={row.gMidl} tx2={row.nMidl} am3={row.gRite} tx3={row.nRite} d={row.dTran} n={row.nTran} l={row.lTran}/>    
                ))
                */   }
            <div class="attrLine">
                <div class="R90"> {iRow}</div>
                <div class="L22"> &nbsp;</div>
                <div class="L66"><div class="key" onClick={upClick}>+ </div></div>
                <div class="L22"> &nbsp;</div>
                <div class="R90"> &nbsp;</div>
                <div class="L22"> &nbsp;</div>
                <div class="L66"><div class="key" onClick={downClick}>-</div></div>
            </div>
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


function getMax(response) {
    var jHistory = response[D_History];
    if(jHistory) return Object.keys(jHistory).length-1;
    return 0;
}


function makeTransferData(response,iSelected) {

    var jReport = response[D_Report];
    console.log("makeTransferData from response D_Report"+JSON.stringify(Object.keys(jReport)));

    var jHistory = response[D_History];
    var gSchema = response[D_Schema];

    let transferData={};
    let debitData=[];
    let creditData=[];

    if(jHistory && gSchema.Names && gSchema.Names.length>0) {

        var names=gSchema.Names;
        var aLen = gSchema.assets;
        var eLen = gSchema.eqliab;
        let hLen = Object.keys(jHistory).length;
        var bLine=0;
        var iTran=0;
        console.log("TXN Schema "+aLen+":"+eLen);
        console.log("TXN Schema "+JSON.stringify(Object.keys(gSchema)))

        for (let hash in jHistory)  {

            console.log("Status TXN HASH "+bLine+":"+hash);

            if(bLine==iSelected) {
        
                let txn = jHistory[hash];

                console.log("TXN "+JSON.stringify(txn));

                transferData.date   = txn[1];
                transferData.sender = txn[2];
                transferData.reason = txn[3];
                transferData.ref1  =  txn[4];
                transferData.ref2  =  txn[5];
                
                let jPrettyTXN = prettyTXN(jHistory,hash,null,null,names,aLen,eLen);
                jPrettyTXN.credit.shift();
                jPrettyTXN.debit.shift();
                jPrettyTXN.debit.shift();

                let aMount=jPrettyTXN.credit.concat(jPrettyTXN.debit);
                aMount.push("-.--"); aMount.push("-.--"); aMount.push("-.--");  aMount.push("-.--");  aMount.push("-.--");  aMount.push("-.--"); 

                transferData.lTran= aMount;                                
                iTran++;
                
            }
            bLine++;
        }
    }
    
   return transferData;
}
