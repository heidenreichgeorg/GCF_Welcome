
// local fileSystem
import * as fs from 'fs';


// GH20250212
//import fsPromises from 'fs/promises';

/*

bookingpages-a0a7c

storage.rules: Konjunktion: ALLE REGELN WERDEN AUSGEWERTET, EINE EINZIGE SPERRE BLOCKIERT
>> firebase deploy   updates the rules

config=PROJECT must use latest root\PROJECT.JSON as firebase  

root/client/bookingpages.json
root/client/year/txnPattern for typical transactions

CONSOLE Cloud Storage settings -> UID , GID
https://console.cloud.google.com/welcome?project=bookingpages-a0a7c

DOWNLOAD EXCEL (pay per use)
UPLOAD JSON (Admin only)

*/

const debug=7;

// SETTING THIS WILL VIOLATE PRIVACY AT ADMIN CONSOLE
const debugReport=7;

//import * as utf8 from 'utf8'

const MAIN = "main.json";

import { Slash, Backslash } from './serverSession'

import * as fbApp from 'firebase/app'
import * as fbStorage from 'firebase/storage'
import * as fbAuth  from "firebase/auth"
//import * as FS from 'firebase/firestore'; 

//const {Datastore} = require('@google-cloud/datastore');

const https = require('https');



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

/*
NETWORK REQUEST FAILED
Firebase: Error (auth/network-request-failed).
--> fix internet connection, fix server address 


CONFIGURATION NOT FOUND
0027 FB.bucketInit (auth/configuration-not-found) LOGIN FAILED Firebase: Error  (auth/configuration-not-found)
--> enable email/pwd authentication in the console.firebase.google.com/project/PROJECT


USER NOT FOUND
0027 FB.bucketInit (auth/user-not-found) LOGIN FAILED Firebase: Error (auth/user-not-found)
--> edit users and allow storage.rules with UID from console.firebase.google.com/project/bookingpages-a0a7c/authentication/users

UNAUTHORIZED
Firebase Storage: User does not have permission to access 'HGKG/2022/main.json'. (storage/unauthorized)"
*/

const sessionKeys = ["partner","client","year","remote","time","sheetCells","sheetName","id","creditorsT","sheetFile","sessionId","generated","ext","clientFunction","strTimeSymbol","fireBase"]

let bpApp = null;

// FB.accessFirebase(FB.bucketDownload,fbConfig,client,year,null,startSessionCB);
// FB.accessFirebase(FB.bucketUpload,fbConfig,client,year,session,startSessionCB)
function accessFirebase(accessMethod,firebaseConfig,partner,client,year,jData,startSessionCB,res) {

  let url = "sync";

  // Initialize Firebase app
  if(bpApp==null) {
    bpApp = fbApp.initializeApp(firebaseConfig);
  }
  // Initialize Cloud Storage and get a reference to the service
  let bpStorage = fbStorage.getStorage(bpApp);

  // LOGIN user 
  const auth = fbAuth.getAuth();
  if(debug) console.log("\nFB.bucketInit");
  fbAuth.signInWithEmailAndPassword(auth, firebaseConfig.usermail, firebaseConfig.userpassword)
    .then((userCredential) => {


      // Signed in 
      const user = userCredential.user;
      // compare user===partner ??
      if(debug) console.log("\n0028 FB.bucketInit LOGGED IN FROM "+jData.root+jData.bucket);


      url = accessMethod(bpStorage,partner,client,year,jData,startSessionCB,res);
      if(jData) {
        jData.firebase = url;    
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      if(debug) console.log("0027 FB.bucketInit ("+errorCode+") LOGIN FAILED "+errorMessage)
    });
  


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
        console.log("0036 getFileContents "+JSON.stringify(Object.keys(session)));
      } catch(err) {
        console.error("0037 Firebase.download txnPattern="+txnPattern+" ERR "+err.toString());
      }

      return session;
}


async function bucketDownload(bpStorage,partner,client,year,jData,startSessionCB,callRes) {
    let sClient = client.replace('.','_');
    let iYear = parseInt(year);

    if(debug) console.log('0030 firebaseBucket.bucketDownload jData '+JSON.stringify(jData))





    const strChild = Slash+sClient+Slash+iYear+Slash+MAIN;  
    const fileRef = fbStorage.ref(bpStorage, strChild);
    if(debug) console.log('0030 firebaseBucket.bucketDownload fileRef='+JSON.stringify(fileRef._service.app._options.projectId));

    
    let txnPattern = null;
    try { txnPattern = await getFileContents(jData.root+"entity/"+client+"/"+year+"/txnPattern.txt");
    } catch(e) {}
    if(debug>1) console.log('0030 firebaseBucket.bucketDownload read root/entity/client/year/txnPattern.txt; '+txnPattern)




            // GH20250212 read local main.json

            // read from NEXTCLOUD Documents Privat
            const dataFilePath = process.env.localPath+client+Backslash+year+Backslash+MAIN;
            try {
                let session = {};

                //Read data from the JSON file
                let strBody = await fs.promises.readFile(dataFilePath,  'utf8');
                //  fs.readFileSync(fileName, 'utf8');

                if(debug) console.log("0032A firebaseBucket.bucketDownload plain local file read DONE");

                session = makeSession(strBody,partner,client,year,txnPattern)

                if(debugReport) console.dir("0034A Firebase.download session "+JSON.stringify(session));

                // AVOID double HEADERS 
                startSessionCB(session,callRes,jData); 
                // 3rd param to startSessionCB JData is from config = 1st arg on calling fireBaseBucket.js
    

                if(debugReport) console.dir("0034A Firebase.download startSessionCB ");

                return null;
            } catch(e) {

              if(debug) console.log("0033A firebaseBucket.bucketDownload plain local file "+dataFilePath+" read FAILED");
            }
 


            // GH 2025

            // GH2025

            // TURNED OFF GOOGLE CLOUD - FILE BASE - BUCKET

/*
  fbStorage.getDownloadURL(fileRef)
  .then(
    
    function(url) {


      if(debug) console.log('0032 Firebase.download url '+url)

        let session = {};
        https.get(url, res => {
          let body = '';
          res.on('data', chunk => {
            body=body+chunk;
          });
          res.on('end', () => {
            try {
               if(debugReport) console.dir("0034 Firebase.download body "+body);

               session = makeSession(body,partner,client,year,txnPattern)
  
            }
            catch(err) {
               console.error("0035 Firebase.download ERR "+err.toString());
            }

            if(debug) console.log("0038 Firebase.download session "+JSON.stringify(Object.keys(session)));

            if(debugReport) console.dir("0039 Firebase.download session "+JSON.stringify(session));
            // AVOID double HEADERS 
            startSessionCB(session,callRes,jData); 
            // 3rd param to startSessionCB JData is from config = 1st arg on calling fireBaseBucket.js

          })
        }).on('error', function(error) {     

          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case 'storage/object-not-found':
              console.error('Firebase.download storage/object-not-found')
            break;

            case 'storage/bucket-not-found':
              console.error('Firebase.download storage/bucket-not-found')
            break;

            case 'storage/project-not-found':
              console.error('Firebase.download storage/project-not-found')
            break;
      
            case 'storage/unauthorized':
              console.error('Firebase.download storage/unauthorized')
            break;

            case 'storage/quota-exceeded':
              console.error('Firebase.download storage/quota-exceeded')
              break;

            case 'storage/unauthenticated':
              console.error('Firebase.download storage/unauthenticated')
              break;

            case 'storage/canceled':
              console.error('Firebase.download storage/canceled')
              break;

            case 'storage/invalid-checksum':
              console.error('Firebase.download storage/invalid-checksum')
              break;

            case 'storage/unknown':
              console.error('Firebase.download storage/unknown')
              break;

            default:
              console.error("Firebase.download ERROR "+JSON.stringify(error));
          }  
      })
    })


*/

  /*
storage/unknown	Ein unbekannter Fehler ist aufgetreten.
storage/object-not-found	An der gewünschten Referenz existiert kein Objekt.
storage/bucket-not-found	Für Cloud Storage ist kein Bucket konfiguriert
storage/project-not-found	Für Cloud Storage ist kein Projekt konfiguriert
storage/quota-exceeded	Das Kontingent für Ihren Cloud Storage-Bucket wurde überschritten. Wenn Sie sich auf der kostenlosen Stufe befinden, führen Sie ein Upgrade auf einen kostenpflichtigen Plan durch. Wenn Sie einen kostenpflichtigen Plan haben, wenden Sie sich an den Firebase-Support.
storage/unauthenticated	Der Benutzer ist nicht authentifiziert. Bitte authentifizieren Sie sich und versuchen Sie es erneut.
storage/unauthorized	Der Benutzer ist nicht berechtigt, die gewünschte Aktion auszuführen. Überprüfen Sie Ihre Sicherheitsregeln, um sicherzustellen, dass sie korrekt sind.
storage/retry-limit-exceeded	Das maximale Zeitlimit für einen Vorgang (Hochladen, Herunterladen, Löschen usw.) wurde überschritten. Versuchen Sie erneut, hochzuladen.
storage/invalid-checksum	Datei auf dem Client stimmt nicht mit der Prüfsumme der vom Server empfangenen Datei überein. Versuchen Sie erneut, hochzuladen.
storage/canceled	Der Benutzer hat den Vorgang abgebrochen.
storage/invalid-event-name	Ungültiger Ereignisname angegeben. Muss eines von [ `running` , `progress` , `pause` ] sein
storage/invalid-url	Ungültige URL für refFromURL() . Muss folgende Form haben: gs://bucket/object oder https://firebasestorage.googleapis.com/v0/b/bucket/o/object?token=<TOKEN>
storage/invalid-argument	Das an put() übergebene Argument muss `File`, `Blob` oder `UInt8` Array sein. Das an putString() übergebene Argument muss ein Raw-, `Base64`- oder `Base64URL`-String sein.
storage/no-default-bucket	In der Eigenschaft storageBucket Ihrer Konfiguration wurde kein Bucket festgelegt.
storage/cannot-slice-blob	Tritt häufig auf, wenn sich die lokale Datei geändert hat (gelöscht, erneut gespeichert usw.). Versuchen Sie erneut, hochzuladen, nachdem Sie sich vergewissert haben, dass sich die Datei nicht geändert hat.
storage/server-file-wrong-size
  */

  return null; // synch caller gets null value
}
module.exports['bucketDownload']=bucketDownload;

const jMetadata = {
    contentType: 'application/json',
  };

async function bucketUpload(bpStorage,partner,client,year,jData,startSessionCB,callRes) {

  let downloadUrl = "no Firebase Storage";
  if(fbStorage) {
    if(bpStorage) {

      // sanitize input
        let sClient = client.replace('.','_');
        let iYear = parseInt(year);

        const strChild = Slash+sClient+Slash+iYear+Slash+MAIN;


            // GH20250212 write local main.json

            // write to NEXTCLOUD Documents Privat
            const dataFilePath = process.env.localPath+client+Backslash+year+Backslash+MAIN;
            try {


	            // Write the updated data to the JSON file
    	        let writeResult = await fs.promises.writeFile(dataFilePath, JSON.stringify(jData));

              if(debug) console.log("0072 bucketUpload plain local file write DONE");


            } catch(e) {

              if(debug) console.log("0073 bucketUpload plain local file "+dataFilePath+" write FAILED");
            }



            // GH 2025

            // GH2025

            // TURNED OFF GOOGLE CLOUD - FILE BASE - BUCKET
/*

        // FireBase UPload
        const fileRef = fbStorage.ref(bpStorage, strChild);
        if(fileRef) {
          if(debug) console.log("0074 bucketUpload fileRef for "+strChild);

          var jsonString = JSON.stringify(jData);
          const buffer = Buffer.from(jsonString, 'utf8');     
          
          const uploadTask = fbStorage.uploadBytesResumable(fileRef, buffer.buffer);


          
          uploadTask.on("state_changed", // params are: EVENT NEXT ERROR COMPLETE
          (snapshot) => { // NEXT
              let total = 1000;
              if(snapshot.totalBytes>0) total=snapshot.totalBytes;
              const progress =
                Math.round((snapshot.bytesTransferred / total) * 100);
              //setProgresspercent(progress);
              
              if(debug) console.log("0076 bucketUpload "+progress+"%");

            },
          (error) => { 
            console.log("0077 bucketUpload  ");                      
            console.log(error.toString());          

            // ERROR
          // A full list of error codes is available at
              // https://firebase.google.com/docs/storage/web/handle-errors
              if(debug) console.log(error.name +" "+error.code+" "+error._baseMessage);
              

              switch (error.code) {
                case 'storage/unauthorized':
                  break;
                case 'storage/canceled':
                  // User canceled the upload
                  break;

                // ...

                case 'storage/unknown':
                  // Unknown error occurred, inspect error.serverResponse
                  break;          
                },
                  
              },



              // COMPLETE
          () => { 
            if(uploadTask.snapshot && uploadTask.snapshot.ref && uploadTask.snapshot.ref._location) {
              const loc = uploadTask.snapshot.ref._location;
              downloadUrl = loc.bucket+Slash+loc.path_;
              if(debug) console.log("0078 Firebase fbWriteJSON to: "+downloadUrl);          
              
              // 20221127
              startSessionCB(jData,callRes,{});
              // GH202311 jConfig ??
              }
            }
          );
  



    //{allPaths=**}
    //if request.auth != null) {}
          let errResponse = 
          {"code":"storage/unauthorized",
          "customData":{"serverResponse":""},
          "name":"FirebaseError",
          "status_":403,"_baseMessage":"Firebase Storage: User does not have permission to access 'HGKG/2022/main.json'. (storage/unauthorized)"
          }

        } else downloadUrl = "no Firebase Storage Ref for"+strChild;
    */

      } else downloadUrl = "no Firebase Storage";
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
        // FIREBASE
        const fbConfig = loadFBConfig(jConfig.root,jConfig.bucket);
        if(fbConfig) {        
            accessFirebase(bucketDownload,fbConfig,partner,client,year,jConfig,callBack,res);
            return "fbDownload";
        } else {
            console.log("0033 server.fbDownload NO FIREBASE CONFIG jConfig="+JSON.stringify(jConfig))
            return null;
        }
    } else {
      let fbConfig={

      }
      console.log("0031 server.fbDownload NO jConfig FROM SERVER")
    }
    
    return null;
    
}

