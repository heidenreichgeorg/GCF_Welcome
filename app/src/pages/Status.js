

import { useEffect, useState } from 'react';
import Screen from '../modules/Screen'


import { S_COLUMN, prettyTXN, FooterRow}  from './App';


import { D_Balance, D_Report, D_History, D_Schema, X_ASSETS, X_INCOME, X_EQLIAB, SCREENLINES } from '../terms.js'

import { useSession } from '../modules/sessionmanager';



export default function Status() {
    
    const [report, setReport] = useState()

    const { session, status } = useSession()

    useEffect(() => {
        if(status !== 'success') return;
        fetch(`${process.env.REACT_APP_API_HOST}/SHOW?sessionId=${session.id}`)
        .then(data => data.json())
        .then(data => {
            setReport(makeStatusData(data))
        })
    }, [status])

    if(!report) return 'Loading...';

    return (
        <Screen>
            {
                report.map((row) => (
                    <StatusRow am1={row.gLeft} tx1={row.nLeft} am2={row.gMidl} tx2={row.nMidl} am3={row.gRite} tx3={row.nRite} d={row.dTran} n={row.nTran} l={row.lTran}/>    
                ))
            }
            <FooterRow long1A="Heidenreich Grundbesitz KG" long1B="" long1C="Fürth HRA 10564" long1D="216_162_50652" />
            <FooterRow long1A="DE46 7603 0080 0900 4976 10" long1B="2022" long1C="Dr. Georg Heidenreich" long1D="Erlangen" />
        </Screen>
    )
    
}

function makeStatusData(response) {


    var jReport = response[D_Report];
    console.log("makeStatusData from response D_Report"+JSON.stringify(Object.keys(jReport)));

    var jHistory = response[D_History];
    var gSchema = response[D_Schema];

    var jAccounts = response[D_Balance];
    // add three additional accounts: ASSETS, EQLIAB, GAINLOSS
    if(jReport["xbrlAssets"].account) { 
        let ass = jReport["xbrlAssets"].account; 
        console.log("ASSET "+JSON.stringify(ass)); 
        jAccounts["xbrlAssets"]=ass;
    }
    if(jReport["xbrlEqLiab"].account) { 
        let eql = jReport["xbrlEqLiab"].account; 
        console.log("EQLIB "+JSON.stringify(eql)); 
        jAccounts["xbrlEqLiab"]=eql;
    }
    if(jReport["xbrlRegular"].account) { 
        let gls = jReport["xbrlRegular"].account; 
        console.log("GALOS "+JSON.stringify(gls)); 
        jAccounts["xbrlRegular"]=gls;
    }
    console.log("makeStatusData from response D_Balance"+JSON.stringify(Object.keys(jAccounts)));

    
    // build three columns
    let aLeft={};
    let aMidl={};
    let aRite={};

    for (let name in jAccounts)   {
        var account=jAccounts[name];
        if(account.xbrl.length>1) {
            var xbrl = account.xbrl.split('\.').reverse();
            var xbrl_pre = xbrl.pop()+ "."+ xbrl.pop();
            if(xbrl_pre===X_ASSETS) aLeft[name]=account;
            if(xbrl_pre===X_INCOME) aMidl[name]=account;
            if(xbrl_pre===X_EQLIAB) aRite[name]=account;
        }
    }
    
    let maxCol = Object.keys(aLeft).length;
    let maxCom = Object.keys(aMidl).length;
    let maxCor = Object.keys(aRite).length;
    let maxRow= SCREENLINES;
    if(maxCol>maxRow) maxRow=maxCol;
    if(maxCom>maxRow) maxRow=maxCom;
    if(maxCor>maxRow) maxRow=maxCor;

    let statusData = Object.keys(jAccounts).map((name, i) => ({i}));
    console.log("STATUS.JS STATUSDATA INIT "+JSON.stringify(statusData))

    let iLeft=0;
    for (let name in aLeft)   {
        var account=aLeft[name];
        var gross = account.gross;
        var iName = account.name;

        console.log("STATUS.JS STATUSDATA LEFT "+iLeft+" "+name+"="+gross);

        statusData[iLeft]={"gLeft":gross,"nLeft":iName};
        iLeft++;
    }
    for (let i=iLeft;i<maxRow;i++) { statusData[i]={ "gLeft":" ", "nLeft": " " }; }


    let iMidl=0;
    for (let name in aMidl)   {
        var account=aMidl[name];
        var gross = account.gross;
        var iName = account.name;

        statusData[iMidl].gMidl = gross;
        statusData[iMidl].nMidl = iName;
        iMidl++;
    }
    for (let i=iMidl;i<maxRow;i++) { statusData[i].gMidl=' '; statusData[i].nMidl=' '; }


    let iRite=0;
    for (let name in aRite)   {
        var account=aRite[name];
        var gross = account.gross;
        var iName = account.name;

        statusData[iRite].gRite = gross;
        statusData[iRite].nRite = iName;
        iRite++;
    }
    for (let i=iRite;i<maxRow;i++) { statusData[i].gRite=' '; statusData[i].nRite=' '; }



    if(jHistory && gSchema.Names && gSchema.Names.length>0) {

        var names=gSchema.Names;
        var aLen = gSchema.assets;
        var eLen = gSchema.eqliab;
        let hLen = Object.keys(jHistory).length;
        var bLine=0;
        var iTran=0;
        console.log("Status TXN Schema "+aLen+":"+eLen);
        console.log("Status TXN Schema "+JSON.stringify(Object.keys(gSchema)))

        for (let hash in jHistory)  {

            console.log("Status TXN HASH "+bLine+":"+hash);

            if(bLine>=hLen-maxRow) {
        
                let jPrettyTXN = prettyTXN(jHistory,hash,null,null,names,aLen,eLen);
                jPrettyTXN.credit.shift();
                jPrettyTXN.debit.shift();
                jPrettyTXN.debit.shift();
                let aMount=jPrettyTXN.credit.concat(jPrettyTXN.debit);
                aMount.push("-.--"); aMount.push("-.--"); aMount.push("-.--");

                let sAmount = (aMount[0]+"  "+aMount[1]+"  "+aMount[2]+"  "+aMount[3]+ " ").slice(0,S_COLUMN);

                statusData[iTran].dTran=jPrettyTXN.entry[0].slice(2);
                statusData[iTran].nTran=jPrettyTXN.entry[1].slice(0,9);
                statusData[iTran].lTran= sAmount;                                
                iTran++;
            }
            bLine++;
        }
    }
    
   return statusData;
}

function StatusRow({ am1,tx1, am2, tx2, am3, tx3, d, n, l}) {

    return(
        <div class="attrLine">
            <div class="R90"> {am1}</div>
            <div class="L66"> {tx1}</div>
            <div class="L22"> &nbsp;</div>
            <div class="R90"> {am2}</div>
            <div class="L66"> {tx2}</div>
            <div class="L22"> &nbsp;</div>
            <div class="R90"> {am3}</div>
            <div class="L66"> {tx3}</div>
            <div class="L22"> &nbsp;</div>
            <div class="L66"> {d}</div>
            <div class="C100"> {n}</div>
            <div class="L220">{l}</div>
        </div>
    )
}