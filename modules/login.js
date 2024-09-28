// PURE FUNCTIONS

export function timeSymbol() { 
    var u = new Date(Date.now()); 
    return ''+ u.getUTCFullYear()+
      ('0' + (1+u.getUTCMonth())).slice(-2) +
      ('0' + u.getUTCDate()).slice(-2) + 
      ('0' + u.getUTCHours()).slice(-2) +
      ('0' + u.getUTCMinutes()).slice(-2) +
      ('0' + u.getUTCSeconds()).slice(-2) +
      (u.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5);
}


export function strSymbol(pat) {
    let cypher = "abcdefghhijklmnopqratuvweyzobcdofghhajklmneopqritovwuyz";
    let base=cypher.length;
    var res = 0;
    var out = [];
    if(!pat) pat = timeSymbol();
    {
        let factor = 23;
        var sequence = ' '+pat+pat+pat;
        for(let p=0;p<sequence.length && p<80;p++) {
            res = ((res*factor + sequence.charCodeAt(p)) & 0x1FFFFFFF);
            let index = res % base;
            out.push(cypher.charAt(index))
        }
    }
    return out.join('');
}

export function currentHash(client,year) {
    let strTime=(timeSymbol().slice(4,10)).slice(-6);

    let token=strSymbol(strTime+client+year+strTime).slice(-6);

    console.log("LOGIN with "+token);

    return token;
}

