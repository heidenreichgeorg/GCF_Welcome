import { useEffect, useState } from 'react';
import { getSession, useSession, REACT_APP_API_HOST,getCarryOver,storeCarryOver } from '../modules/sessionmanager';
import Screen from './Screen'
import { cents2EU,bigUSMoney,cents20EU,bigEUMoney }  from '../modules/money';
import { CSEP, D_Account, D_Balance, D_Carry, D_CarryOver, D_Page, D_Partner, D_FixAss, D_History, D_Report, D_Schema, J_ACCT, SCREENLINES, X_ASSET_CAPTAX, X_ASSET_UNPCAP, X_ASSETS, X_EQLIAB } from '../modules/terms.js'
import { book,prepareTXN,makeHistory, symbolic }  from '../modules/writeModule';
import { makeBalance, makeHGBReport,makeStatusData }  from '../modules/App';

// the ORIGINAL FORMAT from journal sheet is 
// columns format CSV with these columns 
// HASH DATE SENDER REFACCT REASON REFCODE GRSB EBKS CDAK COGK FSTF NKFO KEST KESO VAVA - MIET AUFW NKG EZIN AZIN FSAL - NKHA KAUT D586 

/* global BigInt */

// matrix format 
// { 'date':"", 'sender':"Sender", 'refAcct':"", 'reason':"", 'refCode':"", 'debit':{'name':VALUE}, credit:{ 'name':VALUE},'txt2':"Absender",'txt3':"Zeit",'txt4':"Objekt"}

// buildTransaction will generate the 
// flow format 
// "sender":SENDER,"reason":REASON,"credit":{"COGK":{"index":10,"value":"100,00"}},"debit":{"K2TO":{"index":33,"value":"100,00"}},"balance":""}
// this format is for AccountTemplateRow and setTxn - the external book method
export default function Schedule() {
        
    const {session, status } = useSession()
    
    const [year, setYear]   = useState()
    const [client,setClient] = useState()
    const [partner, setPartner] = useState(false);
    
    
    useEffect(() => {
        if(status !== 'success') return;

        setYear(session.year);
        setClient(session.client);
        setPartner(session.partner);
    }, [status])

    return (<Screen tabSelector={[]} tabName={[]} aFunc={aFunc} aText="Maya Schedule">
        <div>Monday  Tuesday  Wednesday  Thursday  Friday  Saturday  Sunday</div>
        </Screen>)
}

 
