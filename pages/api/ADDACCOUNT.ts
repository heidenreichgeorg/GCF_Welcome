// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import  { getRoot, init, signIn, Slash, strSymbol, timeSymbol } from '../../modules/session'
import  { sendFile, writeFile } from '../../modules/writeModule'
import { J_ACCT } from '@/modules/terms';

let config:string|null;

const debug=true;

// data that can be computed synchronously
let reqBody:String[] | null;
var client:string|string[]|undefined;
var year:string|string[]|undefined;

let sessionTime="";
let nextSessionId= "";


// left free lower lane is a white button
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if(debug) console.log("ADDACCOUNT.handler "+JSON.stringify(req.query));
  sessionTime=timeSymbol();
  nextSessionId= strSymbol(sessionTime+client+year+sessionTime);


  if(req && req.query && req.socket) {       


    let bucket = init(process.argv) as String
    let jConfig = { 'bucket':bucket } as any;
      

    jConfig.column=req.query.column; 
    // trick to use config as carrier from client req.query into jData input to the callback
    // DOES NOT WORK REPEATEDLY
    

    client =  req.query.client;
    year = req.query.year;
    const query = { "ext":"JSON", "client":client, "year":year  };
    if(debug) console.log("0001 ADDACCOUNT.handler "+JSON.stringify(query));

      signIn(jConfig,query,req.socket.remoteAddress,res,downloadPlusAcct); 
  }
  else res.json({ id: '0123', code : "NO VALID QUERY"})
}

function downloadPlusAcct(session:any, res:NextApiResponse<any>, jData:any) {
  
    if(debug) console.log("1700 app.post ADDACCOUNT");
    if(session) {
        let sessionId = session.id; 
        if(sessionId && jData.column) {
        
            let iColumn = parseInt(jData.column);
            console.log("1710 GET ADDACCOUNT ("+JSON.stringify(jData)+") INTO "+iColumn+" FOR "+session.id);
    

            // 20230816
            if(iColumn>J_ACCT && session.sheetCells) {
                if(debug) console.log("1720 /ADDACCOUNT map addAccount"); 
                let sheetCells = session.sheetCells.map((row:any,line:number)=>( addAccount(row,line,iColumn)));
                session.sheetCells = sheetCells;
            } else console.log("1721 /ADDACCOUNT no columns"); 


            if(session.sheetName) {
                let client = session.client;
                let year = session.year;
                let sheetName = session.sheetName;
                if(debug) console.log("1730 /ADDACCOUNT sheetName="+sheetName); 
                if(client && year) {

                    console.log("1740 GET /ADDACCOUNT "+sheetName+ " for ("+client+","+year+")");
                    session.serverFile = getRoot()+ session.client + Slash+ "NACT" + session.year + timeSymbol() + ".json"
                    writeFile(session);

                    try {
                        if(debug) console.log("1760 GET /ADDACCOUNT JSON "+JSON.stringify(session.serverFile));

                        // check file and send response to client
                        sendFile(session, res);
                        
                    } catch(e) { console.dir("ADDACCOUNT.ts sendFile "+e)}
                    return;
                } else console.log("1741 GET /ADDACCOUNT NO CLIENT NO YEAR"+JSON.stringify(Object.keys(session)));
            } else console.log("1743 GET /ADDACCOUNT NO SHEETNAME IN SESSION"+JSON.stringify(Object.keys(session)));
        } else console.log("1745 GET /ADDACCOUNT NO sessionId");
    } else { console.log("1715 app.post ADDACCOUNT NO session"); }        
}



// insert account into <row> after <column> in <line>
function addAccount(row:any,line:number,column:number) {
    let result = (column<row.length) ? row.slice(0,column+1) : row;
    if(line<10) {
        result.push("NACC");
        if(debug) console.log("+"+column+" #"+line+":"+JSON.stringify(result));
    }  else result.push("");
    return (column<row.length) ? result.concat(row.slice(column+1)) : result;    
}


