

export default function FooterRow({left,right,prevFunc,nextFunc,miscFunc=null}) {
    return(
        <div class="attrLine">
            <div class="L120" onClick={(() => miscFunc())}>&nbsp;&nbsp;</div>
            <div class="L166 key" onClick={(() => prevFunc())}>&lt;&lt;</div>
            <div class="L280">{left}</div>
            <div class="L280">{right}</div>
            <div class="L166 key" onClick={(() => nextFunc())}>&gt;&gt;</div>
       </div>
    )
}
