

export default function FooterRow({left,right,prevFunc,nextFunc,miscFunc=null}) {
    return(
        <div className="attrLine">
            <div className="FIELD IDNT" onClick={(() => miscFunc())}>&nbsp;&nbsp;</div>
            <div className="key" onClick={(() => prevFunc())}>&lt;&lt;</div>
            <div className="FIELD L280">{left}</div>
            <div className="FIELD L280">{right}</div>
            <div className="key" onClick={(() => nextFunc())}>&gt;&gt;</div>
       </div>
    )
}
