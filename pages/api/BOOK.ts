// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import  { formatTXN } from './compile'
import  {  localhost, save2Bucket, signIn, strSymbol, timeSymbol } from './server'
import  { symbolic } from './sheets'


// data that can be computed synchronously
let reqBody:String[] | null;
let sessionTime="";
let nextSessionId= "";
let client = "";
let year="";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  //res.set('Access-Control-Allow-Origin', '*');
  console.log("BOOK.handler "+JSON.stringify(req.query));

  if(req && req.query && req.socket) {       
      
      reqBody = req.body;
      client =  req.body.client;
      year = req.body.year;
      const query:JSON = <JSON><unknown> { "ext":"JSON", "client":client, "year":year  };
      console.log("    BOOK.handler "+JSON.stringify(query));
      sessionTime=timeSymbol();
      nextSessionId= strSymbol(sessionTime+client+year+sessionTime);

      signIn(query,req.socket.remoteAddress,res,bookTransaction); 
  }
  else res.json({ id: '0123', code : "NO VALID QUERY"})
}


function bookTransaction(session:any, res:NextApiResponse<any>) {
  
    let sessionId = session.id; 
    let arrTransaction = formatTXN(session,reqBody);
  
    console.log("0610 app.post BOOK jTXN('"+(arrTransaction?JSON.stringify(arrTransaction.join(';')):"---")+"')");

    var result="SERVER BOOKED";
    
    let year =session.year;
    let client = session.client;
    
    if(client && year) {
        
        if(sessionId ) {

          console.log("0612 app.post BOOK jTXN('"+(arrTransaction?JSON.stringify(arrTransaction.join(';')):"---")+"')");

          // modifies session object and stores it under new sessionId
          session = bookSheet(session,arrTransaction,sessionTime,nextSessionId);
          // 20220516 Sheets.xlsxWrite(req.body.sessionId,tBuffer,sessionTime,nextSessionId); 
          // state change in YYYYCCCC.json


          /* PROTOTYPE DOES  NOT  BOOK
          let serverAddr = localhost();
          // async
          save2Bucket(session,client,year)
              .then(result => { if(res) res.json({url:serverAddr+'/LATEST', client, year, 'result':result  })
              });
                */

        } else {
            result="NO SESSION ID";
            console.log("0615 app.post BOOK NO sessionId");
        }        
    } else {
        result="NO EXISTING SESSION";
        console.log("0617 app.post BOOK NO EXISTING session for "+sessionId);
    }        
  
    return session;
}


const debug=true;
const debugWrite=true;

function bookSheet(session:any,tBuffer:String[],sessionTime:String,nextSessionId:String) {

  if(session) {
      if(session.sheetName) {
          let client = session.client;
          let year = session.year;

          if(client && year && session.sheetCells) {

              var numLines = session.sheetCells.length;
              if(debugWrite) console.dir("1450 sheets.bookSheet ENTER "+JSON.stringify(tBuffer)+" into "+session.sheetName+ " for ("+client+","+year+") with "+numLines+" lines in sheet ");
              
              if(tBuffer) {
                  // add hash
                  if(parseInt(tBuffer[0])>0) tBuffer[0]=symbolic(tBuffer.join('')); 

                  numLines = session.sheetCells.push(tBuffer); 

                  session.time=sessionTime;
                  session.id=nextSessionId;

                  if(debugWrite) console.dir("1452 sheets.bookSheet APPEND  "+JSON.stringify(tBuffer)+" to ("+client+","+year+") #"+numLines);

                          
                  if(debug) {
                      console.log("1454 sheets.bookSheet NEW keys="+JSON.stringify(Object.keys(session.sheetCells).map((i)=>(session.sheetCells[i][0]))));
                  }

                  Server.setSession(session);

                  if(debugWrite) console.dir("1456 sheets.bookSheet SET SESSION  "+session.id + " "+session.client + " "+session.year + " --> "+JSON.stringify(Object.keys(session)));
                  
              }
              else if(debugWrite) console.dir("1451 sheets.bookSheet SAVE NO booking statement tBuffer ("+client+","+year+") #"+numLines);
          }
          else if(debugWrite) console.dir("1453 sheets.bookSheet SAVE NO DATA ("+client+","+year+")") ;
      }
      else if(debug) console.log("1455 sheets.bookSheet SAVE NO sheetName"+sessionId);
  }
  else if(debug) console.log("1457 sheets.bookSheet SAVE NO session"+sessionId);

  return session;
}
