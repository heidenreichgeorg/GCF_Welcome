import { networkInterfaces } from 'os';


import { fbDownload } from './fireBaseBucket.js'
import { compile } from './compile.js'
import { PORT } from './terms.js'

const debug=null;

export const HTTP_OK = 200;
export const HTTP_WRONG = 400;

export const Slash = '/';

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
            console.log("0012 signIn for client "+client+"  year "+year);

            let id=null;
            {
                console.log ( "0014 signIn READ BUCKET FOR COLD id ="+id);
                fbDownload(config,client,year,startSessionCB,res,getRoot()); // avoid double response
            }
                        
        } else console.log ( "0027 signIn file no valid year for query="+JSON.stringify(query)+",addr="+remote);

    } else {
        console.log ( "0029 signIn file no valid client for query="+JSON.stringify(query)+",addr="+remote);

        res.send("FORWARD FILE");
    }

    return null;
}


export function startSessionJSON(session,res) {

    console.log("0038 startSessionJSON="+JSON.stringify(Object.keys(session))); 

    // START A NEW SESSION
    let time = timeSymbol();
    let year=session.year;
    let client = session.client;
    let sessionId = strSymbol(time+client+year+time);
    session.id=sessionId;
    session.generated = compile(session);

    setSession(session);

    console.log("0040 startSessionJSON("+client+","+year+") SUCCESS sessionId="+sessionId); 

    // 20221207
    if(res) {
        console.log("0042 startSessionJSON("+client+","+year+")  res.JSON");         
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");
        res.json(session);
    } else console.log("0041 startSessionJSON("+client+","+year+") NO res object"); 
}


var SERVEROOT= '/data/sessions/';

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

    console.log("0000 ARGV= "+JSON.stringify(argv));

    return processArgv(argv);
}



function processArgv(processArgv) {
    let config=null;
    processArgv.forEach(function (val, index, array) {
        if(debug>1) console.log("0000 Starting server " + index + ': ' + val);
        let attribute=val.split('=');
        if(index>1 && attribute && attribute.length>1) {
            //if(debug>1) 
            console.log("0002 Attribute " + index + ': ' + val);
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

export function currentHash() {
    return strSymbol(timeSymbol().slice(6,10)).slice(-4);
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

        console.dir("5010 sendDisplay() rendering url="+url);

        if(res) {
           // qr.toDataURL(url, (err, qrCodeDataUrl) => {
           //     if (err) res.send("Error occured");

                //res.header('Content-Type', 'text/html');
            
                // Let us return the QR code image as our response and set it to be the source used in the webpage
           //     const html = ejs.render('<DIV class="attrRow"><img src="<%= qrCodeDataUrl %>" /></DIV>', { qrCodeDataUrl });
                const html = "nbsp;";


                console.dir("5020 sendDisplay() rendering QR code with #"+html.length+ "chars");
                
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");        
                res.json({client, year, sessionId});

            // )};
        }

    } else {
        res.writeHead(HTTP_OK);
        res.end("\n<HTML>"+clientHead+"<BODY>"+banner+"</BODY></HTML>\n");
        console.dir("5021 sendDisplay: no sessionId");

    }
}

