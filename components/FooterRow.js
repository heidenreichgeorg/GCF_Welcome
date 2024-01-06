

export default function FooterRow({left,midleft,midright,right,miscFunc=null,miscText=null}) {
    return(
        <div>
            <div className="attrRow">
                <div className="FIELD L280">{left}</div>
                <div className="FIELD L280">{midleft}</div>
                <div className="FIELD L280">{midright}</div>
                <div className="FIELD L280">{right}</div>
            </div>
            <div className="attrRow">
                <div className="FIELD IDNT" onClick={(() => {if(miscFunc) return miscFunc(); else return "";})}>{miscText?(<div className="CNAM key">{miscText}</div>): " "}</div>
            </div>
        </div>
            )
}
