
import { useEffect, useState, useRef  } from 'react';

import Screen from '../modules/Screen'
import { CSEP, makeHistory, FooterRow}  from './App';
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

    if(!sheet) return 'Loading...';

    return (
        <Screen>
            { makeHistory(sheet).map((row) => (  
                <SigRow aRow={row.split(CSEP)} />
            ))}
            <FooterRow long1A="Heidenreich Grundbesitz KG" long1B="" long1C="Fürth HRA 10564" long1D="216_162_50652" />
            <FooterRow long1A="DE46 7603 0080 0900 4976 10" long1B="2022" long1C="Dr. Georg Heidenreich" long1D="Erlangen" />
        </Screen>
    )
}

function SigRow(jRow) {
    { console.log("SigRow "+JSON.stringify(jRow.aRow)) }
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

