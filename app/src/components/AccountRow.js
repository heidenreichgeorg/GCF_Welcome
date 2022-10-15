
function AccountRow({lineNum, date, sender, reason, ref1, ref2, amount, saldo}) {
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
