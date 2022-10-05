//import App from './App';

import Screen from '../modules/Screen'

export default function Status() {
    return (
        <Screen>
            <StatusRow am1="17,34" tx1="Assets" am2="406,27" tx2="AUFW" am3="12.000,00" tx3="EKGH" da4="30.12.2020" tx4="Miete" ln4="COGK 900,00 MIET 900,00" />
        </Screen>
    )
}

// Status.html
function StatusRow({ am1,tx1, am2, tx2, am3, tx3, da4,tx4,ln4}) {

    return(
        <div class="attrLine">
            <div class="R90">{am1}</div>
            <div class="L66">{tx1}</div>
            <div class="R90">{am2}</div>
            <div class="L66">{tx2}</div>
            <div class="R90">{am3}</div>
            <div class="L66">{tx3}</div>
            <div class="L110">{da4}</div>
            <div class="L66">{tx4}</div>
            <div class="L175">{ln4}</div>
        </div>
    )
}