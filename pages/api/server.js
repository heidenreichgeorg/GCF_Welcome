// JS client routes UP
// GET
// WelcomeDrop.html allows upload to server
// POST
// /UPLOAD with JSON data


const debug=1;
const debugReport = 1; // will violate data privacy of reporting subject
const debugUpload = 2; // will violate data privacy of reporting subject

import { getRoot, setRoot } from "./sheets"

import { init, compile } from "./compile"


// local fileSystem
const fs = require('fs');

// Google Firebase
const FB = require('./fireBaseBucket.js');

const { networkInterfaces } = require('os');

const nets = networkInterfaces();

// HTTP Server Port
const PORT = 81;
const ReactPort = 3000;


const config = init(/*app,*/ process.argv); // GH20221003 do that per module


// session management
var allSession = null; // LIFO
export function setSession(aSession) {  
    aSession.server = localhost();
    allSession=aSession;
    let prev="";
    if(aSession && aSession.sheetCells) {

        let len=aSession.sheetCells.length;
        let aPrev=aSession.sheetCells[len-1];
        prev= aSession.server + " "+aPrev[1];
        aPrev.map((field,i)=>((i>5 && field.length>2) ? (prev=prev+" "+field):""));
    }
    if(debug>4) console.log("\n0580  setSession("+showRecent(aSession)+") "+aSession.id); }



function clearSessions() {  allSession = null; 
    console.log("\n0590  clearSessions() ");
}
module.exports['clearSessions']=clearSessions;

function showRecent(aSession) {
    // show recent transaction
    let prev="";
    if(aSession && aSession.sheetCells) {
        let len=aSession.sheetCells.length;
        let aPrev=aSession.sheetCells[len-1];
        prev= aPrev[1];
        aPrev.map((field,i)=>((i>5 && field.length>2) ? (prev=prev+" "+field):""));
    }
    return prev;
}

// FIND most recent SESSION in list of known sessions
function getSession(id) { 
    let result=null;
    let arrSession= [ allSession ]; // 20221127
    arrSession.forEach(session => {
        if(session && session.id===id) result=session;
    });
    if(result) {        
        console.log("\n0600  getSession("+result.client+","+result.year+") => (SESSION  "+showRecent(result)+"  id "+result.id);
    }

    return result; 
}
module.exports['getSession']=getSession;


function sy_findSessionId(client,year) {
    var result=null;
    console.log("\n0802  FIND => ( client="+client+"  year="+year+")");
    let arrSession= [ allSession ]; // 20221127
    arrSession.forEach(session => {
        if(session) {
            console.log("0804  CHECK => (SESSION  client="+session.client+"  year="+session.year+")");
            if(session.year===year && session.client===client) {
                result=session;
                let fb=session.fireBase?session.fireBase:" no entry";
                console.log("0806  FOUND => (SESSION  "+showRecent(session)+" client="+session.client+","+session.year+")");
            }
        }
        else    console.log("0805  FOUND EMPTY SESSION   (client="+client+",year="+year+")");
    });
    if(result) return result.id;
    else return null;
}
module.exports['sy_findSessionId']=sy_findSessionId;











/*


// PROVIDES UI TO SERVER CONSOLE 
// WITH THAT SERVER HOSTING THE ClientYear.JSON  file
//start session with loading the latest session file in a given base directory for a known client
app.get("/LATEST", (req, res) => { 

    if(req && req.query && req.socket) {        
        signIn(req.query,req.socket.remoteAddress,res,startSessionDisplay);
        // exit via startSession and sendDisplay
    }
    else {
        res.write("\n<HTML><HEAD><link rel='stylesheet' href='./FBA/mobile_green.css'/></HEAD><TITLE>LATEST</TITLE>INVALID SESSION FILE 'client' and/or 'base' and/or 'ext' missing</HTML>\n\n"); 
        res.end();
    }
});


app.get("/STATUS",  (req, res) => { res.sendFile(__dirname + "/status.html")});


// responds with session contxt object  
// uses buffered session context if one exists for that client/year
// does not refresh buffered session context if external session context has changed
app.get('/SESSION', (req, res) => {   // CORS 20230114
    res.set('Access-Control-Allow-Origin', '*');

    if(req && req.query && req.socket) {       
        
        let query = req.query;
        query.ext="JSON";

        let sessionId=null;
        let session=null;

        //COLD START: LOAD FROM LATEST FILE
        if(!(sessionId=sy_findSessionId(query.client,query.year))) {
            signIn(query,req.socket.remoteAddress,res,startSessionJSON); 
            // exit via startSession and res.JSON
            
        // WARM START : FOUND EXISTING ID
        } else {
            session = getSession(sessionId);
            if(session && debugReport>3) console.log("\n0830 GET /SESSION FOUND LOADED "+JSON.stringify(session));
            else console.error("\n0831 GET /SESSION NOT FOUND => FOR EXISTING #"+sessionId);

            
            if(session && session.id) res.json(session);
            else req.query.code = "Could not signIn()";
        }
    }
    else res.json({ id: '0123', code : "NO VALID QUERY"})
});





// LOGIN clientSave=JSON -> admin console with OCR and auto-saving JSON
// LOGIN                 -> user console 
app.get("/LOGIN", (req, res) => { 

    console.log("\n\n");
    console.log(timeSymbol());
    console.log("0024 app.get LOGIN "+JSON.stringify(req.query));


    let remote  =  req.socket.remoteAddress;
    let client  =  req.query.client;
    let year    =  req.query.year;
    //let clientFlag=req.query.clientSave; // 'JSON' to save JSON on client-side, for the client admin console
    
    // 20220731
    let mainSid =req.query.mainSid;
    let postFix = req.query.postFix; 
    let sessionId= mainSid+postFix; 

    console.dir("0026 app.get "+remote+" LOGIN with client="+client+",year="+year+",postFix="+postFix); 

    if(!sessionId) sessionId=sy_findSessionId(client,year);

    let banner = "NO LOGIN with client="+client+",year="+year;
    if(sessionId)  {

        let session = getSession(sessionId);
        console.log("0028 login() with sessionId="+sessionId);

        if(session) sendDisplay(session,res);
    }
    console.dir("0030 app.get LOGIN responded: "+banner);

});

*/

function sendDisplay(session,res) {
    let sessionId= session.id;
    let client  =  session.client;
    let year    =  session.year;
    let clientSave = (session.ext==='JSON') ? true:false;


    //let banner = Compiler.display(registerLink,sessionId,year,client,clientSave);

    //console.dir("5000 sendDisplay() builds banner#"+banner.length);
    
    // 20220728
    if(sessionId) {

        let localHost = localhost();
        /*
        let loginInfo = jLoginURL(session);
        let usrLogin = loginInfo.url;
        let postFix = loginInfo.postFix;
         OLD SERVER let url = localHost.addr + ":" + localHost.port + usrLogin;
         */
        let url = "https://"+localHost.addr + ":" + ReactPort + "/status?client="+client+"&year="+year;

        
        console.dir("5010 sendDisplay() rendering url="+url);

        if(res) {
            qr.toDataURL(url, (err, qrCodeDataUrl) => {
                if (err) res.send("Error occured");

                res.header('Content-Type', 'text/html');
            
                // Let us return the QR code image as our response and set it to be the source used in the webpage
                const html = ejs.render('<DIV class="attrRow"><img src="<%= qrCodeDataUrl %>" /></DIV>', { qrCodeDataUrl });

                console.dir("5020 sendDisplay() rendering QR code with #"+html.length+ "chars");

                res.writeHead(HTTP_OK);
                res.write(
                    "<HTML>"+clientHead+"<BODY>"
                    +html
                    +'<DIV class="attrRow"><H1>'+year+'&nbsp;'+client+'&nbsp;</H1>'
                    +"<A HREF="+url+">STATUS</A>"
                    +'</DIV></BODY></HTML>'
                );
                res.end();
            });
        }

    } else {
        res.writeHead(HTTP_OK);
        res.end("\n<HTML>"+clientHead+"<BODY>"+banner+"</BODY></HTML>\n");
        console.dir("5021 sendDisplay: no sessionId");

    }
}


/*
//   req.body contains key-value pairs of data submitted in the request body. 
//   By default, it is undefined, and is populated when you use body-parsing middleware such as body-parser.



// USER SELECTS MATCHING FILE
app.get('/welcomedrop', (req, res) => {
    console.log("\nWelcomeDrop\n");
    console.log(timeSymbol());
    res.sendFile('./WelcomeDrop.html', { root: __dirname })
})


*/





export function localhost() {
    let instance="127.0.0.1";
    var results = [];
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                if(debug) console.dir ( "OS["+name+"] net info "+net.address);
                results.push({ 'type':name, 'addr':net.address});
            }
            if(debug) console.log ( "OS["+name+"]  other  "+JSON.stringify(net));
        }
    }
    instance = results[0] ? results[0].addr : "127.0.0.1";
    if(debug) console.dir ( "OS.address  "+instance);
    
    return { 'addr':instance, 'port':PORT };
}




// PURE FUNCTIONS

export function strSymbol(pat) {
    let cypher = "BC0DF1GH2JK3LM4NP5QR6ST7VW8XZ9A";
    let base=31;
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



export function timeSymbol() { 
    var u = new Date(Date.now()); 
    return ''+ u.getUTCFullYear()+
      ('0' + (1+u.getUTCMonth())).slice(-2) +
      ('0' + u.getUTCDate()).slice(-2) + 
      ('0' + u.getUTCHours()).slice(-2) +
      ('0' + u.getUTCMinutes()).slice(-2) +
      ('0' + u.getUTCSeconds()).slice(-2) +
      (u.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5);
};     



function jLoginURL(session) {

    let year=session.year;
    let client=session.client;
    let sessionId=session.id;
    return {'url':"/STATUS?year="+year+"&client="+client+"&sessionId="+sessionId };
}
module.exports['jLoginURL']=jLoginURL;


 
 
 // READ DIR functions
 
//gets the last file in a directory
function getMostRecentFile(dir,ext) {
    const files = orderRecentFiles(dir,ext);
    if(files.length) console.log("getMostRecentFile "+JSON.stringify(files[0])); 
    return files.length ? files[0].file : undefined;
};

//orders files according to date of creation
function orderRecentFiles(dir,ext) {
    return fs
        .readdirSync(dir)
        .filter((file) => fs.lstatSync(dir+file).isFile())
        .filter((file) => file && file.toLowerCase().endsWith(ext.toLowerCase()))
        .filter((file) => { console.log("orderRecentFiles "+dir+file); return true; })
        .map((file) => ({ file, mtime: fs.lstatSync(dir+file).mtime }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
};


let fbConfig=null;

function loadFBConfig() {
    var fbConfig=null;
    if(config!=null) {
        const dir = getRoot(); 
        //let fileName = getMostRecentFile(dir,"json");
        let fileName = config+".json";
        if(fileName) {
            console.log("0022 loadFBConfig from "+fileName);
            fbConfig = JSON.parse(fs.readFileSync(dir+fileName, 'utf8'));
        } else {
            console.log("0023 loadFBConfig NO JSON in "+dir);
            return null;
        }
    }
    return fbConfig;
} 



export function fbDownload(client,year,callBack,res) {
    if(config) {
        // FIREBASE
        const fbConfig = loadFBConfig();
        if(fbConfig) {        
            FB.accessFirebase(FB.bucketDownload,fbConfig,client,year,null,callBack,res);
            return "fbDownload";
        } else {
            console.log("0033 server.fbDownload NO FIREBASE CONFIG")
            return null;
        }
    } else return null;
}



async function save2Bucket(session,client,year) {

    if(config) {
        console.log("0032 save2Bucket Start saving("+JSON.stringify(Object.keys(session))+") to FB for "+client+","+year);        

        // FIREBASE
        const fbConfig = loadFBConfig();
        if(fbConfig) {
            // 20221206
            // session.fireBase = fbConfig.storageBucket;

            // async, setSession and compile
            FB.accessFirebase(FB.bucketUpload,fbConfig,client,year,session,startSessionDisplay,null);
                
            if(debug) {
                console.log("0034 save2Bucket session.sheetcells keys="+JSON.stringify(Object.keys(session.sheetCells).map((i)=>(session.sheetCells[i][0]))));
            }

            return "save2Bucket OK";

        } else {
            console.error("0033 save2Bucket NO FIREBASE CONFIG");
            return "save2Bucket NO FIREBASE CONFIG";
        }
    } else return "save2Bucket NO CONFIG PARAMETER";
}
module.exports['save2Bucket']=save2Bucket;

/*
// use WELCOMEDROP instead !!!
// HIDDEN start session with uploading a session file for a known client
app.post("/UPLOAD", (req, res) => { 
    let strTimeSymbol = timeSymbol();
    if(debugUpload) console.log("\n\n0800 UPLOAD at "+strTimeSymbol);

    // client sends yearclient.JSON file
    // this json has to be stored in heap
    //var signup = "NO SESSION";

    let remote = req.socket.remoteAddress;
    if(debug) console.log("0810 app.post UPLOAD from "+remote);

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
            if(debugUpload) console.dir("0811 app.post UPLOAD  client="+client+",year="+year+",time="+time+",r="+remote+"  ---> "+computed);
            rawData.id=computed;
            sessionId=computed;
        }


        if(sessionId!=null && computed!=null && year!=null && client!=null) {
            // save file on server, not on client and forward to LOGIN page
            if(debugUpload) console.dir("0812 app.post UPLOAD with function="+clientFunction+",client="+client+",year="+year+",time="+time+",r="+remote+"  ---> "+computed);
         
            let sessionData = rawData;
            sessionData.strTimeSymbol=strTimeSymbol;
            sessionData.clientFunction = clientFunction;

            // CHOOSE COMPILER based on clientFunction
            // SERVER FUNCTION COMPILE GH20220918
            sessionData.generated = Compiler.compile(sessionData);


            // INSTEAD OF LOCAL FILE STORAGE
            //  setSession(sessionData);


            // PERSISTENT FB CLOUD FILE STORAGE
            // SETS SESSION AFTER WRITE
            save2Bucket(sessionData,client,year);

            
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
});
*/

// load JSON file from Firebase storage
export function signIn(query,remote,res,startSessionCB) {
    let base =  getRoot();
    //console.log("0010 signIn at base "+base+"  for "+JSON.stringify(query));

    if(query && query.client && query.client.length>2 ) { // && (query.client == "[a-zA-Z0-9]")) {

        // Security sanitize input client
        let client = query.client;
        
        if(query && query.year && query.year.length>2 && (parseInt(query.year)>1)) {

            // Security sanitize input year
            let year   = parseInt(query.year); // Security sanitize input year
            console.log("0010 signIn for client "+client+"  year "+year);

            let id=null;
            if(id=sy_findSessionId(client,''+year)) {
                console.log ( "0012 signIn FOUND WARM id ="+id);
                sendDisplay( getSession(id), res);
            }
            else {
                console.log ( "0014 signIn READ BUCKET FOR COLD id ="+id);
                fbDownload(client,year,startSessionCB,res); // avoid double response
            }
                        
        } else console.log ( "0027 signIn file no valid year for query="+JSON.stringify(query)+",addr="+remote);

    } else console.log ( "0029 signIn file no valid client for query="+JSON.stringify(query)+",addr="+remote);

    return null;
}


function startSessionDisplay(session,res) {

    console.log("0018 startSessionDisplay="+JSON.stringify(Object.keys(session))); 

    // START A NEW SESSION
    let time = timeSymbol();
    let year=session.year;
    let client = session.client;
    let sessionId = strSymbol(time+client+year+time);
    session.id=sessionId;
    session.generated = compile(session);

    setSession(session);

    console.log("0020 startSessionDisplay("+client+","+year+") SUCCESS sessionId="+sessionId); 

    // 20221207
    if(res) {
        console.log("0022 startSessionDisplay("+client+","+year+") sendDisplay"); 
        sendDisplay(session,res);
    }
}

export function startSessionJSON(session,res) {

    console.log("0018 startSessionJSON="+JSON.stringify(Object.keys(session))); 

    // START A NEW SESSION
    let time = timeSymbol();
    let year=session.year;
    let client = session.client;
    let sessionId = strSymbol(time+client+year+time);
    session.id=sessionId;
    session.generated = compile(session);

    setSession(session);

    console.log("0020 startSessionJSON("+client+","+year+") SUCCESS sessionId="+sessionId); 

    // 20221207
    if(res) {
        console.log("0022 startSessionJSON("+client+","+year+")  res.JSON"); 
        res.json(session);
    }
}

// LOCAL START
// node server.js root=d:\Privat\ config=PROJECT root\PROJECT.JSON as firebase config 
// node server.js root=d:\Privat\ config=bookingpages
// node server.js root=c:\Privat config=bookingpage

// npm run dev
/*
 React routes SESSION BOOK EXCEL
 /SESSION takes buffered session, otherwise loads from file
 /BOOK appends session context and then stores it as JSON on server-side storage
 /EXCEL stores EXCEL on server-side storage and then downloads it
*/
/*

// JS client routes DOWN
// GET
// localhost:81/LATEST?client=HGKG&year=2022&ext=JSON 
// ABSCHLUSS downloads a JSON file
// generates global-IP QR (but only local-IP QR-code if network off)
//
// JS client routes UP
// GET
// WelcomeDrop.html allows upload to server
// POST
// /UPLOAD with JSON data


const debug=1;
const debugReport = 1; // will violate data privacy of reporting subject
const debugUpload = 2; // will violate data privacy of reporting subject


const HTTP_OK = 200;
const HTTP_WRONG = 400;

// Modules
const https = require('https');


const express = require('express');
const app = express();

const qr = require('qrcode');
const ejs = require("ejs");
const path = require('path');



const bodyParser = require("body-parser");
const cors = require('cors');

app.use(bodyParser.json({limit: '900kb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({origin: true}))

const { networkInterfaces } = require('os');


//const results = Object.create(null); // Or just '{}', an empty object


// IMPORTS
const Compiler = require('./compile');


const clientHead= "<HEAD><meta http-equiv='content-type' content='text/html; charset=utf-8'><LINK REL='stylesheet' HREF='./FBA/mobile_green.css'/><TITLE>Welcome</TITLE></HEAD>";






// react app
app.use(express.static(path.join(__dirname, 'app', 'build')))

// serve your css and index.html as static
app.use(express.static(__dirname));




BACKEND HTTPS for OLD nodeJS

-------------------------------
A) INSTALL MKCERT 
npm install mkcert

B) GENERATE A CERTIFICATE-AUTHORITY
node .\node_modules\mkcert/src/cli.js create-ca

C) CREATE A CERTIFICATE
node .\node_modules\mkcert/src/cli.js create-cert

D) 


let secureServer = https.createServer(
        {  key:fs.readFileSync("../sec/test-cert.key"),
          cert:fs.readFileSync("../sec/test-cert.crt") },
          app
          
          //(req, res) => {
          //  res.statusCode = 200;
          //  res.setHeader('Content-Type', 'text/plain');
          //  res.end('Hello Secure World\n');
          //}
          
          );


              
let secPort=8080;
let secHostname="localhost";

secureServer.listen(secPort, secHostname, (req,res) => {
            console.log(`Secure server receives at https://${secHostname}:${secPort}/`);
          });





// show convenience link to create and load a new browser window
app.listen(PORT, () => { 
    console.log("\n\n");
    console.log(timeSymbol());
    console.log(`Server    started from ${PORT} using files in `+__dirname); 
    console.log(`Local     http://localhost:${PORT}/LATEST`); 
    console.log(`Global    http://${localhost().addr}:${PORT}/LATEST`); 
    console.log(`Local     http://localhost:${PORT}/welcomedrop`); 
})

*/