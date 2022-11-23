// LOCAL START
// node server.js root=d:\Privat\ auto=900

/*
 React routes SESSION BOOK EXCEL
 /SESSION takes buffered session, otherwise loads from file
 /BOOK appends session context and then stores it as JSON on server-side storage
 /EXCEL stores EXCEL on server-side storage and then downloads it
*/


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


const debug=5;

const HTTP_OK = 200;
const HTTP_WRONG = 400;

// Modules
const express = require('express');
const app = express();
const fs = require('fs');
const qr = require('qrcode');
const ejs = require("ejs");
const path = require('path');

// Google Firebase
const FB = require('./fireBaseBucket.js');


const bodyParser = require("body-parser");
const cors = require('cors');

app.use(bodyParser.json({limit: '900kb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

const { networkInterfaces } = require('os');

const nets = networkInterfaces();
//const results = Object.create(null); // Or just '{}', an empty object


// IMPORTS
const Compiler = require('./compile');


const clientHead= "<HEAD><meta http-equiv='content-type' content='text/html; charset=utf-8'><LINK REL='stylesheet' HREF='./FBA/mobile_green.css'/><TITLE>Welcome</TITLE></HEAD>";


var instance = Compiler.init(app,process.argv); // GH20221003 do that per module

// react app
app.use(express.static(path.join(__dirname, 'app', 'build')))

// serve your css and index.html as static
app.use(express.static(__dirname));


// HTTP Server Port
const PORT = 81;





// show convenience link to create and load a new browser window
app.listen(PORT, () => { 
    console.log("\n\n");
    console.log(timeSymbol());
    console.log(`Server    started from ${PORT} using files in `+__dirname); 
    console.log(`Local     http://localhost:${PORT}/LATEST`); 
    //console.log(`Server    http://ec2-A-B-C-D.compute-1.amazonaws.com:${PORT}/welcomedrop`); 
    //console.log(`Local     http://localhost:${PORT}/welcomedrop`); 
})











// session management
var arrSession = []; // LIFO
function setSession(aSession) {  arrSession.push(aSession); }
module.exports['setSession']=setSession;

// FIND most recent SESSION in list of known sessions
function getSession(id) { 
    let result=null;
    arrSession.forEach(session => {
        if(session.id===id) result=session;
    });
    if(result) {
        console.log("\n0600  getSession() => (SESSION  time="+result.time+"  client="+result.client+"  year="+result.year+")");
    }

    return result; 
}
module.exports['getSession']=getSession;

// 20220730
function getClient(client) { 
    let result=null;
    arrSession.forEach(session => {
        if(session.client===client && session.id!=null) result=session;
    });
    if(result) {
        console.log("\n0700  => (SESSION  time="+result.time+"  client="+result.client+"  year="+result.year+")");
    }

    if(result) return result.id;
    else return null;
}
module.exports['getClient']=getClient;

function sy_findSessionId(client,year) {
    var result=null;
    console.log("\n0802  FIND => ( client="+client+"  year="+year+")");
    arrSession.forEach(session => {
        console.log("0804  CHECK => (SESSION  client="+session.client+"  year="+session.year+")");
        if(session.year===year && session.client===client) {
            result=session;
            let fb=session.fireBase?session.fireBase:" no entry";
            console.log("0806  FOUND => (SESSION  client="+session.client+"  year="+session.year+" fireBase="+fb+")");
        }
    });
    if(result) return result.id;
    else return null;
}
module.exports['sy_findSessionId']=sy_findSessionId;







// CALLBACK for function plugin, registers an ENDPOINT
function registerLink(command,htmlPage,sessionId) {
    let pattern = "/"+command;
    app.get(pattern,  (req, res) => { res.sendFile(__dirname + "/"+htmlPage); });
    return pattern+"?sessionId="+sessionId; // create a link with sessionId as parameter
}








// PROVIDES UI TO SERVER CONSOLE 
// WITH THAT SERVER HOSTING THE ClientYear.JSON  file
//start session with loading the latest session file in a given base directory for a known client
app.get("/LATEST", (req, res) => { 

    if(req && req.query && req.socket) {        
        session = signIn(req.query,req.socket.remoteAddress,res);
        if(session) console.log("\n0800 GET /LATEST FOUND => "+session.id);
        else console.log("\n0801 NO /LATEST SESSION FOUND  ");
        // exits via res.send
    }
    else {
        res.write("\n<HTML><HEAD><link rel='stylesheet' href='./FBA/mobile_green.css'/></HEAD><TITLE>LATEST</TITLE>INVALID SESSION FILE 'client' and/or 'base' and/or 'ext' missing</HTML>\n\n"); 
        res.end();
    }
});


// responds with session contxt object  
// uses buffered session context if one exists for that client/year
// does not refresh buffered session context if external session context has changed
app.get('/SESSION', (req, res) => {
    if(req && req.query && req.socket) {       
        
        let query = req.query;
        query.ext="JSON";

        let sessionId=null;
        let session=null;

        //COLD START: LOAD FROM LATEST FILE
        if(!(sessionId=sy_findSessionId(query.client,query.year))) {
            session = signIn(query,req.socket.remoteAddress,res); 
            if(session) console.log("\n0810 GET /SESSION FOUND FILE => "+session.id);
            else console.log("\n0811 GET /SESSION FILE NOT FOUND => "+JSON.stringify(query));
    

        // WARM START : FOUND EXISTING ID
        } else {
            session = getSession(sessionId);
            if(session) console.log("\n0820 GET /SESSION FOUND LOADED => "+session.id);
            else console.log("\n0821 GET /SESSION NOT FOUND => FOR EXISTING #"+sessionId);


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
    console.log("0020 app.get LOGIN "+JSON.stringify(req.query));


    let remote  =  req.socket.remoteAddress;
    let client  =  req.query.client;
    let year    =  req.query.year;
    //let clientFlag=req.query.clientSave; // 'JSON' to save JSON on client-side, for the client admin console
    
    // 20220731
    let mainSid =req.query.mainSid;
    let postFix = req.query.postFix; 
    let sessionId= mainSid+postFix; 

    console.dir("0030 app.get "+remote+" LOGIN with client="+client+",year="+year+",postFix="+postFix); 

    if(!sessionId) sessionId=sy_findSessionId(client,year);

    let banner = "NO LOGIN with client="+client+",year="+year;
    if(sessionId)  {

        let session = getSession(sessionId);
        console.log("0040 login() with sessionId="+sessionId);

        if(session) sendDisplay(session,res);
    }
    console.dir("0060 app.get LOGIN responded: "+banner);

});


function sendDisplay(session,res) {
    let sessionId= session.id;
    let client  =  session.client;
    let year    =  session.year;
    let clientSave = (session.ext==='JSON') ? true:false;


    banner = Compiler.display(registerLink,sessionId,year,client,clientSave);

    console.dir("5000 sendDisplay() builds banner#"+banner.length);
    
    // 20220728
    if(sessionId) {

        let loginInfo = jLoginURL(session);
        let usrLogin = loginInfo.url;
        let postFix = loginInfo.postFix;
        let url = localhost() + usrLogin;
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
                    +'<DIV class="attrRow"><H1>'+year+'&nbsp;'+client+'&nbsp;'+postFix+'</H1>'
                    +banner                    
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
   req.body contains key-value pairs of data submitted in the request body. 
   By default, it is undefined, and is populated when you use body-parsing middleware such as body-parser.
*/


// USER SELECTS MATCHING FILE
app.get('/welcomedrop', (req, res) => {
    console.log("\nWelcomeDrop\n");
    console.log(timeSymbol());
    res.sendFile('./WelcomeDrop.html', { root: __dirname })
})








function localhost() {
    if(!instance) {
        var results = [];
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                if (net.family === 'IPv4' && !net.internal) {
                    if (!results[name]) {
                        results[name] = [];
                    }
                    console.dir ( "OS["+name+"] net info "+net.address);
                    results.push({ 'type':name, 'addr':net.address});
                }
                if(debug) console.log ( "OS["+name+"]  other  "+JSON.stringify(net));
            }
        }
        instance = results[0] ? results[0].addr : "127.0.0.1";
        console.dir ( "OS.address  "+instance);
    }
    return instance+ ":"+ PORT ;
}
module.exports['localhost']=localhost;




// PURE FUNCTIONS


function timeSymbol() {
    var u = new Date(Date.now()); 
    return u.getUTCFullYear() +
    '-' + ('0' + (1+u.getUTCMonth())).slice(-2) +
    '-' + ('0' + u.getUTCDate()).slice(-2) + 
    ' ' + ('0' + u.getUTCHours()).slice(-2) +
    ':' + ('0' + u.getUTCMinutes()).slice(-2) +
    ':' + ('0' + u.getUTCSeconds()).slice(-2) +
    '.' + (u.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) 
};



function strSymbol(pat) {
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
module.exports['strSymbol']=strSymbol;


function timeSymbol() { // same as in client.js
    var u = new Date(Date.now()); 
    return ''+ u.getUTCFullYear()+
      ('0' + (1+u.getUTCMonth())).slice(-2) +
      ('0' + u.getUTCDate()).slice(-2) + 
      ('0' + u.getUTCHours()).slice(-2) +
      ('0' + u.getUTCMinutes()).slice(-2) +
      ('0' + u.getUTCSeconds()).slice(-2) +
      (u.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5);
};     
module.exports['timeSymbol']=timeSymbol;


function jLoginURL(session) {

    let year=session.year;
    let client=session.client;
    let sessionId=session.id;
    let cFunction=session.clientFunction;

    let postFix=sessionId.slice(-4);
    let mainSid=sessionId.slice(0,sessionId.length-4);
    // console.dir(">>> URL: "+mainSid+"."+postFix+"="+sessionId);
    return {'url':"/LOGIN?year="+year+"&client="+client+"&cFunction="+cFunction+"&mainSid="+mainSid+"&postFix="+postFix, 'mainSid':mainSid, 'postFix':postFix };
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
    var found=null;
    if(fbConfig==null) {
        const dir = Compiler.getRoot(); 
        let fileName = getMostRecentFile(dir,"json");
        if(fileName) {
            console.log("0022 loadFBConfig from "+fileName);
            fbConfig = JSON.parse(fs.readFileSync(dir+fileName, 'utf8'));
        } else console.log("0023 loadFBConfig NO JSON in "+dir);
    }
    return fbConfig;
} 



function fbDownload(client,year,callBack,ext,res) {
    const appStorage = FB.bucketInit(loadFBConfig());
    FB.bucketDownload(appStorage,client,year,callBack,ext,res);
}



async function save2Bucket(session,client,year) {
    console.log("0032 save2Bucket Start saving(JSON) to FB");        

    // FIREBASE
    const appStorage = FB.bucketInit(loadFBConfig());
    session.fireBase = fbConfig.storageBucket;

    // async
    FB.bucketUpload(appStorage,client,year,session)
        .then((url) => (session.fireBase=url));
}



// use WELCOMEDROP instead !!!
// HIDDEN start session with uploading a session file for a known client
app.post("/UPLOAD", (req, res) => { 
    let strTimeSymbol = timeSymbol();
    console.log("\n\n"+strTimeSymbol);

    // client sends yearclient.JSON file
    // this json has to be stored in heap
    //var signup = "NO SESSION";

    let remote = req.socket.remoteAddress;
    console.log("0010 app.post UPLOAD from "+remote);

    let rawData = req.body;

    if(rawData && rawData.client && rawData.year) {

        let client = rawData.client;
        let year   = rawData.year;
        let time   = rawData.time;    
        let clientFunction=rawData.clientFunction.split('_')[0];    
        let sessionId = rawData.id;
        let computed = strSymbol(time+client+year+time);

        if(sessionId===computed) { } 
        else {
            console.dir("0011 app.post UPLOAD  client="+client+",year="+year+",time="+time+",r="+remote+"  ---> "+computed);
            rawData.id=computed;
            sessionId=computed;
        }


        if(sessionId!=null && computed!=null && year!=null && client!=null) {
            // save file on server, not on client and forward to LOGIN page
            console.dir("0012 app.post UPLOAD with function="+clientFunction+",client="+client+",year="+year+",time="+time+",r="+remote+"  ---> "+computed);
         
            let sessionData = rawData;
            sessionData.strTimeSymbol=strTimeSymbol;
            sessionData.clientFunction = clientFunction;

            // CHOOSE COMPILER based on clientFunction
            // SERVER FUNCTION COMPILE GH20220918
            sessionData.generated = Compiler.compile(sessionData);


            // INSTEAD OF LOCAL FILE STORAGE
            setSession(sessionData);


            // PERSISTENT FB CLOUD FILE STORAGE
            save2Bucket(sessionData,client,year);

            let usrLogin = jLoginURL(sessionData).url;
            let cmdLogin = usrLogin+"&clientSave=JSON";


            console.dir("0070 app.post UPLOAD rendering QR code");
            res.write('<DIV class="attrRow"><H1>'+year+'&nbsp;'+client+'&nbsp;</H1>'
            +'<DIV class="attrRow"><DIV class="C100"><A HREF="'+cmdLogin+'"><BUTTON class="largeKey">LOGIN</BUTTON></A></DIV></DIV>'
            +'</DIV>'
            );
            res.end();

        } else console.log ( "0013 UPLOAD VOID client="+client+",year="+year+",time="+time+",addr="+remote+"  ---> "+computed);

        return;
    } else console.log ( "0009 UPLOAD EMPTY  addr="+remote);

    // send back sessionId to client browser or file
    //res.writeHead(HTTP_WRONG, {"Content-Type": "text/html"});
    res.write("\n<HTML><HEAD><link rel='stylesheet' href='./FBA/mobile_green.css'/></HEAD><TITLE>UPLOAD Welcome</TITLE>INVALID SESSION FILE 'client' and/or 'year' missing</HTML>\n\n"); 
    res.end();
});


// load JSON file from Firebase storage
function signIn(query,remote,res) {
    let base =  Compiler.getRoot();
    console.log("0010 signDown at base "+base+"  for "+JSON.stringify(query));

    if(query && query.client && query.client.length>2 ) { // && (query.client == "[a-zA-Z0-9]")) {

        // Security sanitize input client
        let client = query.client;
        
        if(query && query.year && query.year.length>2 && (parseInt(query.year)>1)) {

            // Security sanitize input year
            let year   = parseInt(query.year); // Security sanitize input year
            console.log("0014 signDown for client "+client+"  year "+year);

            let id=null;
            if(id=sy_findSessionId(client,''+year)) {
                console.log ( "0016 signDown FOUND WARM id ="+id);
                sendDisplay( getSession(id), res);
            }
            else fbDownload(client,year,startSession,query.ext,res); // avoid double response
                        
        } else console.log ( "0027 signDown file no valid year for query="+JSON.stringify(query)+",addr="+remote);

    } else console.log ( "0029 signDown file no valid client for query="+JSON.stringify(query)+",addr="+remote);

    return null;
}


function startSession(session, ext, res) {

    console.log("0024 startSession="+JSON.stringify(Object.keys(session))); 

    // START A NEW SESSION
    let time = timeSymbol();
    let year=session.year;
    let client = session.client;
    let sessionId = strSymbol(time+client+year+time);
    session.id=sessionId;
    session.generated = Compiler.compile(session);
    session.ext=ext;

    setSession(session);

    console.log("0026 startSession("+client+","+year+") SUCCESS sessionId="+sessionId); 

    /*
    if(res) {
        console.log("0028 startSession("+client+","+year+") send RESPONSE="+sessionId); 
        res.json(session);
        res.end();
    }
    */
}

