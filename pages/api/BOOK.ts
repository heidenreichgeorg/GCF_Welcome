// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const debug=1;
const debugWrite=1;

import type { NextApiRequest, NextApiResponse } from 'next'
import  { formatTXN  } from '../../modules/compile'
import  { getRoot,init,localhost,setSession,signIn, strSymbol, symbolic, timeSymbol } from '../../modules/session'
import  { save2Bucket } from '../../modules/writeModule'


let config:string|null;


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
  if(req) {
    //res.set('Access-Control-Allow-Origin', '*');

    if(req.query) {       
      console.log("0060 BOOK.handler query="+JSON.stringify(req.query));

      config =  init(/*app,*/ process.argv); // GH20221003 do that per module

      console.log("0062 BOOK.handler config="+config);

      if(req.body) {       
        reqBody = req.body;
        client =  req.body.client;
        year = req.body.year;
        const query:JSON = <JSON><unknown> { "ext":"JSON", "client":client, "year":year  };
        console.log("0064 BOOK.handler "+JSON.stringify(query));
        sessionTime=timeSymbol();
        nextSessionId= strSymbol(sessionTime+client+year+sessionTime);

        signIn(config,query,req.socket.remoteAddress,res,bookTransaction); 

        
      }
      else {
        console.log("0065 BOOK.handler  NO VALID req.body");
        res.json({ id: '0123', code : "NO VALID req.body"});
      }
    }
    else {
      console.log("0063 BOOK.handler  NO VALID req.query");
      res.json({ id: '0123', code : "NO VALID req.query"});
    }
  
  }
  else {
    console.log("0061 BOOK.handler  NO VALID req");
    res.json({ id: '0123', code : "NO VALID req"});
  }
}


function bookTransaction(session:any, res:NextApiResponse<any>) {
  
    let sessionId = session.id; 
    let arrTransaction = formatTXN(session,reqBody);
  
    console.log("0610 app.post BOOK config("+config+")");

    var result="SERVER BOOKED";
    
    let year =session.year;
    let client = session.client;
    
    if(client && year) {
        
        if(sessionId ) {

          console.log("0612 app.post BOOK jTXN('"+(arrTransaction?JSON.stringify(arrTransaction.join(';')):"---")+"')");

          // modifies session object and stores it under new sessionId
          session = bookSheet(session,arrTransaction,sessionTime,nextSessionId);

          
          let serverAddr = localhost();
          // async
          save2Bucket(config,session,client,year,getRoot())
              .then(result => { 
                if(res) {
                    res.setHeader("Access-Control-Allow-Origin", "*");
                    res.setHeader("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");            
                    res.json({url:serverAddr+'/LATEST', client, year, 'result':result  })
                }
              });
                

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


function bookSheet(session:any,tBuffer:string[]|null,sessionTime:String,nextSessionId:String) {

  if(session) {
      if(session.sheetName) {
          let client = session.client;
          let year = session.year;

          if(client && year && session.sheetCells) {

              var numLines = session.sheetCells.length;
              if(debugWrite) console.dir("1450 sheets.bookSheet ENTER "+JSON.stringify(tBuffer)+" into "+session.sheetName+ " for ("+client+","+year+") with "+numLines+" lines in sheet ");
              
              // GH20230401
              if(!tBuffer || tBuffer.length==0) {
                if(debugWrite) console.dir("1451 sheets.bookSheet SAVE NO booking statement tBuffer ("+client+","+year+") #"+numLines);
                session.sheetCells.pop();
              } else {
                  // add hash
                  if(parseInt(tBuffer[0])>0) tBuffer[0]=(""+symbolic(tBuffer.join(''))); 

                  numLines = session.sheetCells.push(tBuffer); 

                  session.time=sessionTime;
                  session.id=nextSessionId;

                  if(debugWrite) console.dir("1452 sheets.bookSheet APPEND  "+JSON.stringify(tBuffer)+" to ("+client+","+year+") #"+numLines);

                          
                  if(debug) {
                      console.log("1454 sheets.bookSheet NEW keys="+JSON.stringify(Object.keys(session.sheetCells).map((i)=>(session.sheetCells[i][0]))));
                  }

                  setSession(session);

                  if(debugWrite) console.dir("1456 sheets.bookSheet SET SESSION  "+session.id + " "+session.client + " "+session.year + " --> "+JSON.stringify(Object.keys(session)));
                  
              }
              
          }
          else if(debugWrite) console.dir("1453 sheets.bookSheet SAVE NO DATA ("+client+","+year+")") ;
      }
      else if(debug) console.log("1455 sheets.bookSheet SAVE NO sheetName"+session.id);
  }
  else if(debug) console.log("1457 sheets.bookSheet SAVE NO session");

  return session;
}

