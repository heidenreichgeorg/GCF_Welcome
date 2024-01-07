// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { strSymbol,timeSymbol } from '../../modules/login'
import  { HTTP_OK, init, signIn  } from '../../modules/serverSession'

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
  console.log("DOWNLOAD.handler "+JSON.stringify(req.query));
  sessionTime=timeSymbol();
  nextSessionId= strSymbol(sessionTime+client+year+sessionTime);

  let jConfig =  init(process.argv) as any; // GH20221003 need to init for each module

  if(req && req.query && req.socket) {       
  
    client =  req.query.client;
    year = req.query.year;
    const query:JSON = <JSON><unknown> { "ext":"JSON", "client":client, "year":year  };
    console.log("    DOWNLOAD.handler "+JSON.stringify(query));

      signIn(jConfig,query,req.socket.remoteAddress,res,downloadJSON); 
  }
  else res.json({ id: '0123', code : "NO VALID QUERY"})
}


function downloadJSON(session:any, res:NextApiResponse<any>) {
  
    let sessionId = session.id; 
  
    console.log("0610 app.post JSON");

    var result="SERVER LOADS DOWN JSON";
    
    let year =session.year;
    let client = session.client;
    
        
    if(sessionId ) {
        
        if(session) {
           // DOWNLOAD JSON to client     

        console.log("\n\n");
        console.log(timeSymbol());
        
        console.log("1500 DOWNLOAD JSON for with session id=("+sessionId+")");

        

        if(year && client) {

            // 20220520 server-side XLSX
            console.log("1510 app.post DOWNLOAD JSON for year"+year);

            let sessionTime=timeSymbol();
            let monthYearHour = sessionTime.slice(4,10);

            // download JSON
            let fileName = session.year+session.client+monthYearHour+'.json';
            console.log("1540 app.post DOWNLOAD download JSON as "+fileName);
            res.setHeader('status',HTTP_OK);
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Content-Disposition','attachment fileName="'+fileName+'"');  
            res.json(session);    

        } else {
            console.log("1543 app.post NO DOWNLOAD - INVALID SESSION')");
            res.writeHead(HTTP_OK, {"Content-Type": "text/html"});    
            res.end("\nINVALID SESSION.\n");
        }
        } else console.log("1625 GET /DOWNLOAD NO SESSION");
            

    } else {
        
        console.log("0615 app.post DOWNLOAD NO sessionId");
    }        
}


