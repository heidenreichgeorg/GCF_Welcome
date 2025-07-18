
// local fileSystem
import * as fs from 'fs';


// debug level violates admin confidentiality
const debug=8;

// SETTING THIS WILL VIOLATE PRIVACY AT ADMIN CONSOLE
const debugReport=7;

const MAIN = "main.json";

import { Slash, Backslash } from './serverSession'


//const { MongoClient, ServerApiVersion } = require('mongodb');


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

function makeSession(strBody,partner,client,year,txnPattern) {

      let session = {}

      try {
        // build session object
          session = JSON.parse(strBody);
      } catch(err) {}
        
      // GH202501
      session.partner = partner;
      session.client = client;
      session.year = year;

      // GH202311
      // in case entity/CLIENT/YEAR/txnPattern.txt JSON file exists
      // session.txnPattern will be overwritten with that file
      if(txnPattern) {
        try {
          // GH20231127 using jConfig, add local txnPattern data
          session.txnPattern = JSON.parse(txnPattern);
          console.log("0050 plainFileIO.makeSession set txnPattern keys="+JSON.stringify(Object.keys(session)));
        } catch(err) {
          console.error("0053 plainFileIO.makeSession txnPattern="+txnPattern+" ERR "+err.toString());
        }
      }
      else console.log("0058 plainFileIO.makeSession by reading these keys="+JSON.stringify(Object.keys(session)));

      return session;
}


async function bucketDownload(bpStorage,partner,client,year,jData,startSessionCB,callRes) {

    if(debug) console.log('0038 plainFileIO.bucketDownload jData '+JSON.stringify(jData))
        let sClient = client.replace('.','_');
    let iYear = 0
    try {
        iYear = parseInt(year);
    } catch(e) {}

    if (process && process.env) {
      
      let slash = Slash; 
      if(process.env.slash) slash = process.env.slash;

        if(process.env.localPath) {


            // read from NEXTCLOUD Documents from localPath folder
            let localPath = process.env.localPath;

            
            let txnFileName = process.env.localPath+client+"/"+year+"/txnPattern.txt";
            let txnPattern = null;
            try { txnPattern = await getFileContents(txnFileName);
            } catch(e) {}


            if(debug>1) console.log('0040 plainFileIO.bucketDownload read '+txnFileName+' --> '+txnPattern)



            // GH20250212 read local main.json from a file
            const dataFilePath = localPath+client+slash+year+slash+MAIN;
            if(debug>1) console.log('0042 plainFileIO.bucketDownload read root/entity/client/year/txnPattern.txt; '+txnPattern)

            try {


                let dbcred = process.env.dbcred;
                let dbinst = process.env.dbinst;
                if(dbcred && dbinst) {
                  let strMongoDB = "mongodb+srv://"+dbcred+"@"+dbinst+"?retryWrites=true&w=majority&appName=Sampling"
                  console.log(strMongoDB);
                }


                let session = {};

                //Read data from the JSON file
                let strBody = await fs.promises.readFile(dataFilePath,  'utf8');
                //  fs.readFileSync(fileName, 'utf8');

                if(debug) console.log("0044 plainFileIO.bucketDownload plain local file read "+dataFilePath+" DONE");
                // GH20250714
                // console.log("0046 plainFileIO.bucketDownload plain  file read "+strBody);

                session = makeSession(strBody,partner,client,year,txnPattern)

                if(debugReport) console.dir("0046 plainFileIO.bucketDownload session "+JSON.stringify(session));

                // AVOID double HEADERS 
                startSessionCB(session,callRes,jData); 
                // 3rd param to startSessionCB JData is from config = 1st arg on calling plainFileIO.js
    

                if(debugReport) console.dir("0048 plainFileIO.bucketDownload returned from startSessionCB ");

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
/*
                let dbcred = process.env.dbcred;
                let dbinst = process.env.dbinst;
                if(dbcred && dbinst) {
                  
                  const uri = "mongodb+srv://"+dbcred+"@"+dbinst+"?retryWrites=true&w=majority&appName=Sampling"



                  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
                  const client = new MongoClient(uri, {
                    serverApi: {
                      version: ServerApiVersion.v1,
                      strict: true,
                      deprecationErrors: true,
                    }
                  });

                  async function run() {
                    try {
                      // Connect the client to the server	(optional starting in v4.7)
                      await client.connect();
                      // Send a ping to confirm a successful connection
                      await client.db("admin").command({ ping: 1 });
                      console.log("Pinged your deployment. You successfully connected to MongoDB!");
                    } finally {
                      // Ensures that the client will close when you finish/error
                      await client.close();
                    }
                  }
                  run().catch(console.dir);

                }

*/









            // must be terminated with a slash
            let localPath = process.env.localPath;

            // GH20250212 write local main.json

            // write to NEXTCLOUD Documents Privat
            const dataFilePath = localPath+strFile;
            try {


	            // Write the updated data to the JSON file
    	        let writeResult = await fs.promises.writeFile(dataFilePath, JSON.stringify(jData));

              if(debug) console.log("0072 plainFileIO.bucketUpload plain local file write DONE: "+dataFilePath);


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
        
        
            console.log("0054 loadFBConfig from "+fileName);
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

