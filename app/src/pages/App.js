import { useEffect, useState } from 'react'

export default function App() {

    const [clicked, setClicked] = useState(0)

    const [data, setData] = useState()

    useEffect(() => {
        // nur erster render
        setTimeout(() => setData('123'), 1000)
    }, [])

    function handleClick() {
        setClicked(clicked + 1)
    }

    if(!data) return 'Loading...'

    return (
        <div className="App">
            <header className="App-header">
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <Component text={'Learn React' + data} />
                <button onClick={handleClick}>Clicked: {clicked}</button>
            </header>
        </div>
    );
}

function Component({ text }) {
    return (
        <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
        >
            {text}
        </a>
    )
}

// account.html
export function AccountRow({lineNum, date, sender, reason, ref1, ref2, amount, saldo}) {
    return (
        <div class="attrLine">
            <div class="L40">{lineNum}</div>
            <div class="C100">{date}</div>
            <div class="L110">{sender}</div>
            <div class="L110">{reason}</div>
            <div class="L110">{ref1}</div>
            <div class="L110">{ref2}</div>
            <div class="R105">{amount}</div>
            <div class="R105">{saldo}</div>
        </div>
    )
}

// openbalance.html
export function OverviewRow({acct, amount, name1, name2}) { // 
    return (
        <div class="attrLine">
            <div class="L175">{acct}</div>
            <div class="R105">{amount}</div>
            <div class="L22">{name1}</div>
            <div class="L280">{name2}</div>
        </div>
    )
}

// hgbregular.html
export function BalanceRow({text,level4,level3,level2,level1}) { 
    return (
        <div class="attrLine">
            <div class="L280">{text}</div>
            <div class="R105">{level4}</div>
            <div class="R105">{level3}</div>
            <div class="R105">{level2}</div>
            <div class="R105">{level1}</div>
        </div>
    )
}


export function FooterRow({long1A,long1B,long1C,long1D}) {
    return(
        <div class="attrLine">
            <div class="L120">&nbsp;</div>
            <div class="L280">{long1A}&nbsp;{long1B}</div>
            <div class="L280">{long1C}&nbsp;{long1D}</div>
       </div>
    )
}

export function GainLossRow({section,type,acct,xbrl,amount}) {
    return(
        <div class="attrLine">
            <div class="C100">{section}</div>
            <div class="L175">{type}</div>
            <div class="C140">{acct}</div>
            <div class="L175">{xbrl}</div>
            <div class="R105">{amount}</div>
        </div>
    )
}

/*
Heidenreich Grundbesitz KG
_
Fürth HRA 10564
216_162_50652

DE46 7603 0080 0900 4976 10
2022
Dr. Georg Heidenreich
Erlangen

*/


/*

// from Transfer.html

<div class="attrLine" id="PageContenttermLine1"> <div class="C100">
        <div class="key" onclick="doCommand('1')">1</div></div> <div class="C100">
        <div class="key" onclick="doCommand('2')">2</div></div> <div class="C100">
        <div class="key" onclick="doCommand('3')">3</div></div><div class="C100" id="selGRSB">
        
        <div class="key" oncontextmenu="accountMenu(event,'GRSB')" onclick="listCreditAccount(6,'GRSB')">GRSB</div></div><div class="C100" id="selEBKS">
        <div class="key" oncontextmenu="accountMenu(event,'EBKS')" onclick="listCreditAccount(7,'EBKS')">EBKS</div></div><div class="C100" id="selCDAK">
        <div class="key" oncontextmenu="accountMenu(event,'CDAK')" onclick="listCreditAccount(8,'CDAK')">CDAK</div></div><div class="C100" id="selFSTF">
        <div class="key" oncontextmenu="accountMenu(event,'FSTF')" onclick="listCreditAccount(9,'FSTF')">FSTF</div></div><div class="C100" id="selCOGK">
        <div class="key" oncontextmenu="accountMenu(event,'COGK')" onclick="listCreditAccount(10,'COGK')">COGK</div>
    </div>
</div>


*/