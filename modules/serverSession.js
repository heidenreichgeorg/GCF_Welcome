/* global BigInt */

import { networkInterfaces } from 'os';
import { strSymbol,timeSymbol } from './login'
import { fbDownload } from './fireBaseBucket.js'
import { compile } from './compile.js'
import { PORT } from './terms.js'

const debug=false;

export const HTTP_OK = 200;
export const HTTP_WRONG = 400;

export const Slash = '/';

var nets;

// load JSON file from Firebase storage
// query = { client:CLIENT, year:YEAR }
// GH20230816 bucket from string to { 'bucket':bucket }
export function signIn(jConfig,query,remote,res,startSessionCB) {
    
    nets = networkInterfaces();

    
    console.log("0010  signIn at root "+jConfig.root+"  for "+JSON.stringify(query));

    if(query && query.client && query.client.length>2 ) { // && (query.client == "[a-zA-Z0-9]")) {

        // Security sanitize input client
        let client = query.client;
        
        if(query && query.year && query.year.length>2 && (parseInt(query.year)>1)) {

            // Security sanitize input year
            let year   = parseInt(query.year); // Security sanitize input year
            console.log("0012 signIn for client "+client+"  year "+year);

            let id=null;
            {
                console.log ( "0014 signIn READ BUCKET FOR COLD id ="+id);
                fbDownload(jConfig,client,year,startSessionCB,res); // avoid double response
            }
                        
        } else console.log ( "0027 signIn file no valid year for query="+JSON.stringify(query)+",addr="+remote);

    } else {
        console.log ( "0029 signIn file no valid client for query="+JSON.stringify(query)+",addr="+remote);

        res.end("FORWARD FILE"); // GH20230708 was res.send
    }

    return null;
}


export function startSessionJSON(session,res) {

    if(debug) console.log("0040 startSessionJSON="+JSON.stringify(Object.keys(session))); 

    let newSession = createSession(session,res);

    console.log("0042 startSessionJSON("+newSession.client+","+newSession.year+") SUCCESS sessionId="+newSession.id); 

    // 20221207
    if(res) {
        console.log("0046 startSessionJSON("+newSession.client+","+newSession.year+")");         
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");
        res.json(session);
    } else console.log("0045 startSessionJSON("+newSession.client+","+newSession.year+") NO res object"); 

}


export function init(/*app,*/ argv) {

    console.log("0000 ARGV= "+JSON.stringify(argv));
   
    return processArgv(argv);
}



function processArgv(processArgv) {
    let bucket="";
    let root="";
    processArgv.forEach(function (val, index, array) {
        if(debug>1) console.log("0002 Starting server " + index + ': ' + val);
        let attribute=val.split('=');
        if(index>1 && attribute && attribute.length>1) {
            //if(debug>1) 
            console.log("0006 Attribute " + index + ': ' + val);
            if(attribute[0].toLowerCase()==='root') {
                let rawRoot=attribute[1];
                if(rawRoot.slice(-1)==='/' || rawRoot.slice(-1)==='\\') {
                    root=rawRoot; 
                } else {
                    root=rawRoot+'/';
                }
                console.log("0008A Starting server SET ROOT TO " + root);
            }        
            else if(attribute[0].toLowerCase()==='bucket') {
                bucket = attribute[1]; // bucket configuration file under root
                console.log("0008B Starting server SET FIREBASE BUCKET " + bucket);
            }        
            else if(attribute[0].toLowerCase()==='auto') {
                let autoSec = parseInt(attribute[1]); // auto save time-interval
                let autoSave = autoSec * 1000;
                console.log("0008C Starting server SET autoSave " + autoSec+ " [sec.]");
            }        
        }
    });

    return { 'root':root, 'bucket':bucket };
}



// session management
var allSession = null; // LIFO
export function setSession(aSession) {  
    aSession.server = localhost();
    allSession=aSession;



    
/*

    let prev="";
    if(aSession && aSession.sheetCells) {
        let len=aSession.sheetCells.length;
        let aPrev=aSession.sheetCells[len-1];
        prev= aSession.server + "  " +aPrev[1];
        aPrev.map((field,i)=>((i>5 && field && field.length>1) ? (prev=prev+" "+field):""));
    }
*/        
    if(debug>4) console.log("\n0580  setSession("+showRecent(aSession)+") "+aSession.id); 
}


export function createSession(session) {
    
    // START A NEW SESSION

    // purge data from old session
    let generated = compile(session);
    let year=session.year;
    let client = session.client;
    let sheetCells = session.sheetCells;
    let txnPattern = session.txnPattern;
    let sheetName = session.sheetName;

    let time = timeSymbol();
    let id = strSymbol(time+client+year+time);
/*
    // START A NEW SESSION
    let result = {
        'client':client,
        'year':year,
        'sheetName':sheetName,
        'server':localhost(),
        'time':time,
        'sheetCells':sheetCells,
        'id':id,
        'txnPattern':txnPattern,
        'generated': generated,
    }    
*/
    let result = session;
    session.id=id;

    // 20240107 WHY WORK WITH OLD SESSION INSTANCE ??
    session.generated= generated;

    setSession(result);

    return result;
}



// FIND most recent SESSION in list of known sessions
export function getSession(id) { 
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

function showRecent(aSession) {
    // show recent transaction - wothout server number
    let prev="";
    if(aSession && aSession.sheetCells) {
        let len=aSession.sheetCells.length;
        let aPrev=aSession.sheetCells[len-1];
        prev= aPrev[1];
        aPrev.map((field,i)=>((i>5 && field && field.length>2) ? (prev=prev+" "+field):""));
    }
    return prev;
}

export function localhost() {
    let instance="127.0.0.1";
    var results = [];
    nets = networkInterfaces();

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

export function sendDisplay(session,res) {
    let sessionId= session.id;
    let client  =  session.client;
    let year    =  session.year;
    let clientSave = (session.ext==='JSON') ? true:false;

    // 20220728
    if(sessionId) {

        let localHost = localhost();
        
        let url = localHost.addr + ":" + PORT + "/Status?client="+client+"&year="+year;

        const clientHead = "Login";

        if(debug) console.dir("5010 sendDisplay() rendering url="+url);

        if(res) {
           // qr.toDataURL(url, (err, qrCodeDataUrl) => {
           //     if (err) res.send("Error occured");

                //res.header('Content-Type', 'text/html');
            
                // Let us return the QR code image as our response and set it to be the source used in the webpage
           //     const html = ejs.render('<DIV class="attrRow"><img src="<%= qrCodeDataUrl %>" /></DIV>', { qrCodeDataUrl });
                const html = "nbsp;";


                if(debug) console.dir("5020 sendDisplay() rendering QR code with #"+html.length+ "chars");
                
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");        
                res.json({client, year, sessionId});

            // )};
        }

    } else {
        res.writeHead(HTTP_OK);
        res.end("\n<HTML>"+clientHead+"<BODY>"+banner+"</BODY></HTML>\n");
        if(debug) console.dir("5021 sendDisplay: no sessionId");

    }
}
