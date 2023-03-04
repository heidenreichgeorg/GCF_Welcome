
function AccountRow({lineNum, date, sender, refAcct, reason, refCode, amount, saldo}) {
    return (
        <div classNameName="attrLine">
            <div className="FIELD TAG">{lineNum}</div>
            <div className="FIELD C100">{date}</div>
            <div className="FIELD SNAM">{sender}</div>
            <div className="FIELD SNAM">{refAcct}</div>
            <div className="FIELD SNAM">{reason}</div>
            <div className="FIELD SNAM">{refCode}</div>
            <div className="FIELD R105">{amount}</div>
            <div className="FIELD R105">{saldo}</div>
        </div>
    )
}
