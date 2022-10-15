

export default function FooterRow({left,right,prevFunc,nextFunc}) {
    return(
        <div class="attrLine">
            <div class="L120">&nbsp;</div>
            <div class="L166 key" onClick={(() => prevFunc())}>&lt;&lt;</div>
            <div class="L280">{left}</div>
            <div class="L280">{right}</div>
            <div class="L166 key" onClick={(() => nextFunc())}>&gt;&gt;</div>
       </div>
    )
}
