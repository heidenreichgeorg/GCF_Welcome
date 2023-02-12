

export default function FooterRow({left,right,prevFunc,nextFunc,miscFunc=null}) {
    return(
        <div className="attrRow">
            <div className="FIELD IDNT" onClick={(() => miscFunc())}>&nbsp;&nbsp;</div>
            <div className="key" onClick={(() => prevFunc())}>&nbsp;&lt;&nbsp;</div>
            <div className="FIELD L280">{left}</div>
            <div className="FIELD L280">{right}</div>
            <div className="key" onClick={(() => nextFunc())}>&nbsp;&gt;&nbsp;</div>
       </div>
    )
}
