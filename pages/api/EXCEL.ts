// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import  { init, signIn, strSymbol, timeSymbol   } from '../../modules/session'
import  { sendFile} from '../../modules/writeModule'
import  { xlsxWrite  } from '../../modules/sheets'


// data that can be computed synchronously
var client:string|string[]|undefined;
var year:string|string[]|undefined;
let sessionTime="";
let nextSessionId= "";


export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  console.log("EXCEL.handler "+JSON.stringify(req.query));
  sessionTime=timeSymbol();
  nextSessionId= strSymbol(sessionTime+client+year+sessionTime);

  let jConfig =  init(process.argv) as any; // GH20221003 need to init for each module

  if(req && req.query && req.socket) {       
  
    client =  req.query.client;
    year = req.query.year;
    const query:JSON = <JSON><unknown> { "ext":"JSON", "client":client, "year":year  };
    console.log("    EXCEL.handler "+JSON.stringify(query));

      signIn(jConfig,query,req.socket.remoteAddress,res,downloadExcel); 
  }
  else res.json({ id: '0123', code : "NO VALID QUERY"})
}


function downloadExcel(session:any, res:NextApiResponse<any>, jData:any) {
  
    console.log("1600 app.post EXCEL");
    if(session) {
        let sessionId = session.id; 
        if(sessionId ) {
        
            console.log("1610 GET EXCEL FOR "+session.id.slice(-4));
    
            if(session.sheetName) {
                let client = session.client;
                let year = session.year;
                let sheetName = session.sheetName;
                console.log("1620 /EXCEL sheetName="+sheetName); 
                if(client && year) {

                    console.log("1640 GET /EXCEL "+sheetName+ " for ("+client+","+year+")");

                    // may use same time and id because no tBuffer is given
                    let fileSig = xlsxWrite(session,jData.root);
                    try {
                        console.log("1660 GET /EXCEL JSON "+JSON.stringify(fileSig));

                        sendFile(fileSig, res);
                        // close file
                    } catch(e) { console.dir("EXCEL.ts sendFile "+e)}
                    return;
                } else console.log("1641 GET /EXCEL NO CLIENT NO YEAR"+JSON.stringify(Object.keys(session)));
            } else console.log("1643 GET /EXCEL NO SHEETNAME IN SESSION"+JSON.stringify(Object.keys(session)));
        } else console.log("1645 GET /EXCEL NO sessionId");
    } else { console.log("1615 app.post EXCEL NO session"); }        
}


