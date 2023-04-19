// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import  { init, signIn, strSymbol, timeSymbol   } from '../../modules/session'
import  { sendFile} from '../../modules/writeModule'
import  { xlsxWrite  } from '../../modules/sheets'

let config:string|null;


// data that can be computed synchronously
let reqBody:String[] | null;
var client:string|string[]|undefined;
var year:string|string[]|undefined;
let sessionTime="";
let nextSessionId= "";


export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  //res.set('Access-Control-Allow-Origin', '*');
  console.log("EXCEL.handler "+JSON.stringify(req.query));
  sessionTime=timeSymbol();
  nextSessionId= strSymbol(sessionTime+client+year+sessionTime);

  config =  init(/*app,*/ process.argv); // GH20221003 do that per module

  if(req && req.query && req.socket) {       


    
    client =  req.query.client;
    year = req.query.year;
    const query:JSON = <JSON><unknown> { "ext":"JSON", "client":client, "year":year  };
    console.log("    EXCEL.handler "+JSON.stringify(query));

      signIn(config,query,req.socket.remoteAddress,res,downloadExcel); 
  }
  else res.json({ id: '0123', code : "NO VALID QUERY"})
}


function downloadExcel(session:any, res:NextApiResponse<any>) {
  
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

                    console.log("1630 GET /EXCEL "+sheetName+ " for ("+client+","+year+")");

                    // may use same time and id because no tBuffer is given
                    let fileSig = xlsxWrite(session);

                    console.log("1640 GET /EXCEL JSON "+JSON.stringify(fileSig));

                    sendFile(fileSig, res);
                        // close file
                    return;
                } else console.log("1621 GET /EXCEL NO CLIENT NO YEAR"+JSON.stringify(Object.keys(session)));
            } else console.log("1623 GET /EXCEL NO SHEETNAME IN SESSION"+JSON.stringify(Object.keys(session)));
        } else console.log("1625 GET /EXCEL NO sessionId");
    } else { console.log("0615 app.post EXCEL NO session"); }        
}


