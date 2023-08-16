// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import  { getRoot, init, signIn, Slash, strSymbol, timeSymbol } from '../../modules/session'
import  { sendFile, writeFile } from '../../modules/writeModule'

let config:string|null;


// data that can be computed synchronously
let reqBody:String[] | null;
var client:string|string[]|undefined;
var year:string|string[]|undefined;
var column:string|undefined;
let sessionTime="";
let nextSessionId= "";


export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  console.log("ADDACCOUNT.handler "+JSON.stringify(req.query));
  sessionTime=timeSymbol();
  nextSessionId= strSymbol(sessionTime+client+year+sessionTime);


  if(req && req.query && req.socket) {       


    let bucket = init(process.argv) as String
    let jConfig = { 'bucket':bucket } as any;
      
    jConfig.column=req.query.column; 
    // trick to use config as carrier from client req.query into jData input to the callback
    
    client =  req.query.client;
    year = req.query.year;
    const query = { "ext":"JSON", "client":client, "year":year  };
    console.log("0001 ADDACCOUNT.handler "+JSON.stringify(query));

      signIn(jConfig,query,req.socket.remoteAddress,res,downloadPlusAcct); 
  }
  else res.json({ id: '0123', code : "NO VALID QUERY"})
}


function downloadPlusAcct(session:any, res:NextApiResponse<any>, jData:any) {
  
    console.log("1600 app.post ADDACCOUNT");
    if(session) {
        let sessionId = session.id; 
        if(sessionId ) {
        
            console.log("1610 GET ADDACCOUNT ("+JSON.stringify(jData)+")FOR "+session.id.slice(-4));
    
            if(session.sheetName) {
                let client = session.client;
                let year = session.year;
                let sheetName = session.sheetName;
                console.log("1620 /ADDACCOUNT sheetName="+sheetName); 
                if(client && year) {

                    console.log("1640 GET /ADDACCOUNT "+sheetName+ " for ("+client+","+year+")");
                    session.serverFile = getRoot()+ session.client + Slash+ "NACT" + session.year + session.client + ".json"
                    writeFile(session);

                    try {
                        console.log("1660 GET /ADDACCOUNT JSON "+JSON.stringify(session.serverFile));

                        // check file and send response to client
                        sendFile(session, res);
                        
                    } catch(e) { console.dir("ADDACCOUNT.ts sendFile "+e)}
                    return;
                } else console.log("1641 GET /ADDACCOUNT NO CLIENT NO YEAR"+JSON.stringify(Object.keys(session)));
            } else console.log("1643 GET /ADDACCOUNT NO SHEETNAME IN SESSION"+JSON.stringify(Object.keys(session)));
        } else console.log("1645 GET /ADDACCOUNT NO sessionId");
    } else { console.log("1615 app.post ADDACCOUNT NO session"); }        
}


