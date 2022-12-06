
function AccountRow({lineNum, date, sender, reason, ref1, ref2, amount, saldo}) {
    return (
        <div classNameName="attrLine">
            <div className="TAG">{lineNum}</div>
            <div className="C100">{date}</div>
            <div className="SNAM">{sender}</div>
            <div className="SNAM">{reason}</div>
            <div className="SNAM">{ref1}</div>
            <div className="SNAM">{ref2}</div>
            <div className="R105">{amount}</div>
            <div className="R105">{saldo}</div>
        </div>
    )
}
