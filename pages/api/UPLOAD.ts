
import { networkInterfaces } from 'os';
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import { getRoot,init,localhost,strSymbol,timeSymbol } from '../../modules/sessionModule'
import { startSessionDisplay,save2Bucket } from '../../modules/writeModule'
import { compile } from '../../modules/compile'

const debugUpload = false;

let config:string|null;
var nets;

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
  ) {
    let strTimeSymbol = timeSymbol();
    console.log("\n\n0800 UPLOAD at "+strTimeSymbol);

    config =  init(/*app,*/ process.argv); // GH20221003 do that per module

    nets = networkInterfaces();


    // client sends yearclient.JSON file
    // this json has to be stored in heap
    //var signup = "NO SESSION";

    let remote = req.socket.remoteAddress;
    console.log("0810 app.post UPLOAD from "+remote);

    let rawData = req.body;
    if(debugUpload) console.dir("0810 app.post UPLOAD from "+rawData);


    if(rawData && rawData.client && rawData.year) {

        let client = rawData.client;
        let year   = rawData.year;
        let time   = rawData.time;    
        let clientFunction=rawData.clientFunction.split('_')[0];    
        let sessionId = rawData.id;
        let computed = strSymbol(time+client+year+time);

        if(sessionId===computed) { } 
        else {
            rawData.id=computed;
            sessionId=computed;
        }
        if(debugUpload) console.dir("0811 app.post UPLOAD  client="+client+",year="+year+",time="+time+",r="+remote+"  ---> "+computed);


        if(sessionId!=null && computed!=null && year!=null && client!=null) {
            // save file on server, not on client and forward to LOGIN page
            if(debugUpload) console.dir("0812 app.post UPLOAD with function="+clientFunction+",client="+client+",year="+year+",time="+time+",r="+remote+"  ---> "+computed);
         
            let sessionData = rawData;
            sessionData.strTimeSymbol=strTimeSymbol;
            sessionData.clientFunction = clientFunction;

            // CHOOSE COMPILER based on clientFunction
            // SERVER FUNCTION COMPILE GH20220918
            sessionData.generated = compile(sessionData);


            // INSTEAD OF LOCAL FILE STORAGE
            //  setSession(sessionData);


            // PERSISTENT FB CLOUD FILE STORAGE
            // SETS SESSION AFTER WRITE
            save2Bucket(config,sessionData,client,year,getRoot());

            
            // 20221202 what if config==null and no bucket shall be used?
            // shortcut for OFFLINE start  
            // 20221207 DO NOT call sendDisplay              
            startSessionDisplay(sessionData,null); 
            if(debugUpload) console.dir("0818 app.post UPLOAD starts offline");
            

            
            let cmdLogin = "http://"+localhost().addr+":81/LATEST?client="+client+"&year="+year+"&ext=JSON&clientSave=JSON";
            // should not set a sesssion.id because id not known while async save2bucket is not finished       

            if(debugUpload) console.dir("0822 app.post UPLOAD rendering QR code");
            res.write('<DIV class="attrRow"><H1>'+year+'&nbsp;'+client+'&nbsp;</H1>'
                +'<DIV class="attrRow"><DIV class="FIELD C100"><A HREF="'+cmdLogin+'"><BUTTON class="largeKey">LOGIN</BUTTON></A></DIV></DIV>'
                +'</DIV>'
                );
            res.end();
            

        } else if(debugUpload) console.log ( "0813 UPLOAD VOID client="+client+",year="+year+",time="+time+",addr="+remote+"  ---> "+computed);

        return;
    } else {
        console.error ( "0809 UPLOAD EMPTY JSON "+JSON.stringify(Object.keys(rawData)) +" from addr="+remote);

    }
    // send back sessionId to client browser or file
    //res.writeHead(HTTP_WRONG, {"Content-Type": "text/html"});
    res.write("\n<HTML><HEAD><link rel='stylesheet' href='./FBA/mobile_green.css'/></HEAD><TITLE>UPLOAD Welcome</TITLE>INVALID SESSION FILE 'client' and/or 'year' missing</HTML>\n\n"); 
    res.end();
}


