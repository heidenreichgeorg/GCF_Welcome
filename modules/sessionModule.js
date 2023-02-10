
import { networkInterfaces } from 'os';




import { strSymbol,timeSymbol } from './writeModule.js'
import { fbDownload } from './fireBaseBucket.js'
import { compile } from './compile.js'
import { PORT } from './terms.js'

const debug=null;

export const HTTP_OK = 200;

var nets;

// load JSON file from Firebase storage
export function signIn(config,query,remote,res,startSessionCB) {
    
    nets = networkInterfaces();

    let base =  getRoot();
    console.log("0010  signIn at base "+base+"  for "+JSON.stringify(query));

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
                fbDownload(config,client,year,startSessionCB,res,getRoot()); // avoid double response
            }
                        
        } else console.log ( "0027 signIn file no valid year for query="+JSON.stringify(query)+",addr="+remote);

    } else console.log ( "0029 signIn file no valid client for query="+JSON.stringify(query)+",addr="+remote);

    return null;
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
    } else console.log("0021 startSessionJSON("+client+","+year+") NO res object"); 
}


var SERVEROOT= '/data/sessions/';
const Slash = '/';
export function setRoot(root) {  
    if(root.slice(-1)==='/' || root.slice(-1)==='\\') {
        SERVEROOT=root; 
    } else {
        SERVEROOT=root+'/';
    }

    console.log("App.setRoot = "+SERVEROOT);
}

export function getRoot() {  return SERVEROOT; }

export function init(/*app,*/ argv) {

    console.log(JSON.stringify(argv));

    return processArgv(argv);
}



function processArgv(processArgv) {
    let config=null;
    processArgv.forEach(function (val, index, array) {
        if(debug>1) console.log("0000 Starting server " + index + ': ' + val);
        let attribute=val.split('=');
        if(index>1 && attribute && attribute.length>1) {
            if(debug>1) console.log("0002 Attribute " + index + ': ' + val);
            if(attribute[0].toLowerCase()==='root') {
                setRoot(attribute[1]);
                console.log("0004 Starting server SET ROOT TO " + getRoot());
            }        
            else if(attribute[0].toLowerCase()==='config') {
                config = attribute[1];
                console.log("0006 Starting server SET FIREBASE CONFIG " + config);
            }        
            else if(attribute[0].toLowerCase()==='auto') {
                let autoSec = parseInt(attribute[1]);
                autoSave = autoSec * 1000;
                console.log("0008 Starting server SET autoSave " + autoSec+ " [sec.]");
            }        
        }
    });

    return config;
}



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
