

export default function FooterRow({left,right,prevFunc,nextFunc,miscFunc=null}) {
    return(
        <div className="attrLine">
            <div className="L120" onClick={(() => miscFunc())}>&nbsp;&nbsp;</div>
            <div className="L166 key" onClick={(() => prevFunc())}>&lt;&lt;</div>
            <div className="L280">{left}</div>
            <div className="L280">{right}</div>
            <div className="L166 key" onClick={(() => nextFunc())}>&gt;&gt;</div>
       </div>
    )
}
