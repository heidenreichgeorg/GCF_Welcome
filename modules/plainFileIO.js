
// local fileSystem
import * as fs from 'fs';


// debug level violates admin confidentiality
const debug=8;

// SETTING THIS WILL VIOLATE PRIVACY AT ADMIN CONSOLE
const debugReport=7;

const MAIN = "main.json";

import { Slash, Backslash } from './serverSession'


const https = require('https');
const bpStorage=null;

const sessionKeys = ["partner","client","year","remote","time","sheetCells","sheetName","id","creditorsT","sheetFile","sessionId","generated","ext","clientFunction","strTimeSymbol","fireBase"]


function accessFirebase(accessMethod,filebaseConfig,partner,client,year,jData,startSessionCB,res) { 
    let url = accessMethod(bpStorage,partner,client,year,jData,startSessionCB,res);
    if(jData) {
      jData.firebase = url;    
    }
}
module.exports['accessFirebase']=accessFirebase;




function getFileContents(fileName) {
  return new Promise((resolve, reject) => {
    let contents = ""
    fs.readFile(fileName, (err, data) => {
      
      //if(!data) { console.log("0033 getFileContents FILE NOT FOUND ");reject(null);  }
      if (err) { console.log("0033 getFileContents FAILED "+JSON.stringify(err));reject(null);  }


      //if(debug) console.log("0030 getFileContents  "+JSON.stringify(data));
      resolve(data ? data.toString() : null)
    });
  })
}

// ONLY FOR BROWSERS gsutil cors set cors.json gs://bookingpapages-a0a7c -

function makeSession(body,partner,client,year,txnPattern) {

      let session = {}

      try {
        // build session object
          session = JSON.parse(body);
      } catch(err) {}
        
      // GH202501
      session.partner = partner;
      session.client = client;
      session.year = year;

      // GH202311
      // in case entity/CLIENT/YEAR/txnPattern.txt JSON file exists
      // session.txnPattern will be overwritten with that file
      if(txnPattern) try {
        // GH20231127 using jConfig, add local txnPattern data
        session.txnPattern = JSON.parse(txnPattern);
        console.log("0036 plainFileIO.makeSession "+JSON.stringify(Object.keys(session)));
      } catch(err) {
        console.error("0037 plainFileIO.makeSession txnPattern="+txnPattern+" ERR "+err.toString());
      }

      return session;
}


async function bucketDownload(bpStorage,partner,client,year,jData,startSessionCB,callRes) {

    if(debug) console.log('0030 plainFileIO.bucketDownload jData '+JSON.stringify(jData))
        let sClient = client.replace('.','_');
    let iYear = 0
    try {
        iYear = parseInt(year);
    } catch(e) {}

    const strChild = Slash+sClient+Slash+iYear+Slash+MAIN;  
    if(debug) console.log('0030 plainFileIO.bucketDownload strChild='+strChild);

    
    let txnPattern = null;
    try { txnPattern = await getFileContents(jData.root+"entity/"+client+"/"+year+"/txnPattern.txt");
    } catch(e) {}
    if(debug>1) console.log('0030 plainFileIO.bucketDownload read root/entity/client/year/txnPattern.txt; '+txnPattern)

    if (process && process.env) {
      let slash = Slash; if(process.env.slash) slash = process.env.slash;
      if(process.env.localPath) {

            let localPath = process.env.localPath;

            // GH20250212 read local main.json from a file

            // read from NEXTCLOUD Documents from localPath folder
            const dataFilePath = localPath+client+slash+year+slash+MAIN;
            try {
                let session = {};

                //Read data from the JSON file
                let strBody = await fs.promises.readFile(dataFilePath,  'utf8');
                //  fs.readFileSync(fileName, 'utf8');

                if(debug) console.log("0032 plainFileIO.bucketDownload plain local file read DONE");

                session = makeSession(strBody,partner,client,year,txnPattern)

                if(debugReport) console.dir("0034 plainFileIO.download session "+JSON.stringify(session));

                // AVOID double HEADERS 
                startSessionCB(session,callRes,jData); 
                // 3rd param to startSessionCB JData is from config = 1st arg on calling plainFileIO.js
    

                if(debugReport) console.dir("0034 plainFileIO.download returned from startSessionCB ");

                return null;
            } catch(e) {

              if(debug) console.log("0033 plainFileIO.bucketDownload plain local file "+dataFilePath+" read FAILED");
            }
        }
      }    
      return null; // synch caller gets null value
}
module.exports['bucketDownload']=bucketDownload;


const jMetadata = { contentType: 'application/json' };

async function bucketUpload(bpStorage,partner,client,year,jData,startSessionCB,callRes) {

  let downloadUrl = "no bpStorage";

  console.log("0070 plainFileIO.bucketUpload plain local file write ENTER");


    // sanitize input
    let sClient = client.replace('.','_');

    downloadUrl = "plainFileIO.bucketUpload sClient="+sClient;

    let iYear = parseInt(year);

    downloadUrl = "plainFileIO.bucketUpload sClient="+sClient+"   iYear="+iYear;

    if (process && process.env) {
      
      let slash = Slash; 
      if(process.env.slash) slash = process.env.slash;
      const strFile = sClient+slash+iYear+slash+MAIN;

      if(process.env.localPath) {

            // must be termineated with a slash
            let localPath = process.env.localPath;

            // GH20250212 write local main.json

            // write to NEXTCLOUD Documents Privat
            const dataFilePath = localPath+strFile;
            try {


	            // Write the updated data to the JSON file
    	        let writeResult = await fs.promises.writeFile(dataFilePath, JSON.stringify(jData));

              if(debug) console.log("0072 plainFileIO.bucketUpload plain local file write DONE");


            } catch(e) {

              if(debug) console.log("0073 plainFileIO.bucketUpload plain local file "+dataFilePath+" write FAILED");
            }      
      }
    }
    return downloadUrl;
}
module.exports['bucketUpload']=bucketUpload;







export function loadFBConfig(dir,config) {
    var fbConfig=null;
    if(dir && dir.length>0 && config && config.length>0) {
        
        let fileName = dir+config+".json";
        // mount volume in docker-compose.yml
        //     volumes:      
        //      - sec:/usr/sec 
        //   volumes:      
        //    sec:
        
        
            console.log("0050 loadFBConfig from "+fileName);
            try {
              let configStr = fs.readFileSync(fileName, 'utf8');
              if(configStr) {
                try {
                  fbConfig = JSON.parse(configStr);
                } catch(err) { console.dir("0055 FAILED PARSING CONFIG "+fileName); }
              } else console.log("0057 READ SEC FILE  - EMPTY");
          } catch(err) { console.dir("0055 FAILED READING CONFIG "+fileName); }
           if(!fbConfig) console.log("0059 loadFBConfig CWD="+process.cwd()+" ROOT="+dir+" NO/INVALID CONFIG FILE "+fileName);
       
    } else {
      console.log("0051 loadFBConfig NO CONFIG ");
      fbConfig={
        'projectId':process.env.projectId,
        'authDomain':process.env.authDomain,
        'storageBucket':process.env.storageBucket,
        'apiKey':process.env.apiKey,
        'appId':process.env.appId,
        'messagingSenderId':process.env.messagingSenderId,
        'usermail':process.env.usermail,
        'userpassword':process.env.userpassword
      }
      console.log("0052 READ SET fbConfig from env(.local)");              
    }
    return fbConfig;
} 



export function fbDownload(jConfig,partner,client,year,callBack,res) {
    if(jConfig) {
        console.log("0016 plainFileIO.fbDownload with jConfig="+JSON.stringify(jConfig))
        // FILEBASE
        const fbConfig = loadFBConfig(jConfig.root,jConfig.bucket);
        if(fbConfig) {        
            console.log("0016 plainFileIO.fbDownload FILEBASE CONFIG fbConfig="+JSON.stringify(fbConfig))
            accessFirebase(bucketDownload,fbConfig,partner,client,year,jConfig,callBack,res);
            return "fbDownload";
        } else {
            console.log("0033 plainFileIO.fbDownload NO FILEBASE CONFIG but jConfig="+JSON.stringify(jConfig))
            return null;
        }
    } else {
      let fbConfig={

      }
      console.log("0031 server.fbDownload NO jConfig FROM SERVER")
    }
    
    return null;
    
}

