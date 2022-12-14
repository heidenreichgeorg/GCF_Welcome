/*

bookingpages-a0a7c

storage.rules: Konjunktion: ALLE REGELN WERDEN AUSGEWERTET, EINE EINZIGE SPERRE BLOCKIERT
>> firebase deploy   updates the rules

config=PROJECT must use latest root\PROJECT.JSON as firebase  

CONSOLE Cloud Storage settings -> UID , GID
https://console.cloud.google.com/welcome?project=bookingpages-a0a7c

DOWNLOAD EXCEL (pay per use)
UPLOAD JSON (Admin only)

*/

const debug=null;

// SETTING THIS WILL VIOLATE PRIVACY AT ADMIN CONSOLE
const debugReport=null;

const utf8 = require('utf8');

const fbS = "/";
const MAIN = "main.json";

const fbApp = require("firebase/app");
const fbStorage = require("firebase/storage");
const fbAuth = require("firebase/auth");
const FS = require('firebase/firestore'); 

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

const sessionKeys = ["client","year","remote","time","sheetCells","sheetName","id","addrT","sheetFile","sessionId","generated","ext","clientFunction","strTimeSymbol","fireBase"]

let bpApp = null;

// FB.accessFirebase(FB.bucketDownload,fbConfig,client,year,null,startSessionCB);
// FB.accessFirebase(FB.bucketUpload,fbConfig,client,year,session,startSessionCB)
function accessFirebase(accessMethod,firebaseConfig,client,year,jData,startSessionCB,res) {

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
      if(debug) console.log("\n0028 FB.bucketInit LOGGED IN "+JSON.stringify(user));
      url = accessMethod(bpStorage,client,year,jData,startSessionCB,res);
      if(jData) jData.firebase = url;    
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      if(debug) console.log("0027 FB.bucketInit ("+errorCode+") LOGIN FAILED "+errorMessage)
    });
  


}
module.exports['accessFirebase']=accessFirebase;


// ONLY FOR BROWSERS gsutil cors set cors.json gs://bookingpapages-a0a7c -


async function bucketDownload(bpStorage,client,year,jData,startSessionCB,callRes) {
  let sClient = client.replace('.','_');
  let iYear = parseInt(year);


  const strChild = fbS+sClient+fbS+iYear+fbS+MAIN;  
  const fileRef = fbStorage.ref(bpStorage, strChild);
  if(debug) console.log('Firebase.download fileRef='+JSON.stringify(fileRef));

  fbStorage.getDownloadURL(fileRef)
  .then(
    
    function(url) {

      if(debug) console.log('Firebase.download fetch '+url)
          const decoder = new TextDecoder('UTF-8');
          const toString = (bytes) => {
              const array = new Uint8Array(bytes);
              return decoder.decode(array);
          };          
        let session = {};
        https.get(url, res => {
          let body = '';
          res.on('data', chunk => {
            body=body+chunk;
          });
          res.on('end', () => {
            try {
              if(debugReport) console.dir("Firebase.download body "+body);
              let buf = toString(body);
              session = JSON.parse(body);
            }
            catch(err) {
              console.error("Firebase.download ERR "+err.toString());
            }

            if(debug) console.log("0016 Firebase.download session "+JSON.stringify(Object.keys(session)));

            if(debugReport) console.dir("Firebase.download session "+JSON.stringify(session));
            // AVOID double HEADERS 
            startSessionCB(session,callRes);
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
  /*
storage/unknown	Ein unbekannter Fehler ist aufgetreten.
storage/object-not-found	An der gew??nschten Referenz existiert kein Objekt.
storage/bucket-not-found	F??r Cloud Storage ist kein Bucket konfiguriert
storage/project-not-found	F??r Cloud Storage ist kein Projekt konfiguriert
storage/quota-exceeded	Das Kontingent f??r Ihren Cloud Storage-Bucket wurde ??berschritten. Wenn Sie sich auf der kostenlosen Stufe befinden, f??hren Sie ein Upgrade auf einen kostenpflichtigen Plan durch. Wenn Sie einen kostenpflichtigen Plan haben, wenden Sie sich an den Firebase-Support.
storage/unauthenticated	Der Benutzer ist nicht authentifiziert. Bitte authentifizieren Sie sich und versuchen Sie es erneut.
storage/unauthorized	Der Benutzer ist nicht berechtigt, die gew??nschte Aktion auszuf??hren. ??berpr??fen Sie Ihre Sicherheitsregeln, um sicherzustellen, dass sie korrekt sind.
storage/retry-limit-exceeded	Das maximale Zeitlimit f??r einen Vorgang (Hochladen, Herunterladen, L??schen usw.) wurde ??berschritten. Versuchen Sie erneut, hochzuladen.
storage/invalid-checksum	Datei auf dem Client stimmt nicht mit der Pr??fsumme der vom Server empfangenen Datei ??berein. Versuchen Sie erneut, hochzuladen.
storage/canceled	Der Benutzer hat den Vorgang abgebrochen.
storage/invalid-event-name	Ung??ltiger Ereignisname angegeben. Muss eines von [ `running` , `progress` , `pause` ] sein
storage/invalid-url	Ung??ltige URL f??r refFromURL() . Muss folgende Form haben: gs://bucket/object oder https://firebasestorage.googleapis.com/v0/b/bucket/o/object?token=<TOKEN>
storage/invalid-argument	Das an put() ??bergebene Argument muss `File`, `Blob` oder `UInt8` Array sein. Das an putString() ??bergebene Argument muss ein Raw-, `Base64`- oder `Base64URL`-String sein.
storage/no-default-bucket	In der Eigenschaft storageBucket Ihrer Konfiguration wurde kein Bucket festgelegt.
storage/cannot-slice-blob	Tritt h??ufig auf, wenn sich die lokale Datei ge??ndert hat (gel??scht, erneut gespeichert usw.). Versuchen Sie erneut, hochzuladen, nachdem Sie sich vergewissert haben, dass sich die Datei nicht ge??ndert hat.
storage/server-file-wrong-size
  */

  return null; // synch caller gets null value
}
module.exports['bucketDownload']=bucketDownload;

const jMetadata = {
    contentType: 'application/json',
  };

async function bucketUpload(bpStorage,client,year,jData,startSessionCB,callRes) {

  let downloadUrl = "no Firebase Storage";
  if(fbStorage) {
    if(bpStorage) {

      // sanitize input
        let sClient = client.replace('.','_');
        let iYear = parseInt(year);

        const strChild = fbS+sClient+fbS+iYear+fbS+MAIN;
        const fileRef = fbStorage.ref(bpStorage, strChild);
        if(fileRef) {

          var jsonString = JSON.stringify(jData);
          const buffer = Buffer.from(jsonString, 'utf8');     
          
          const uploadTask = fbStorage.uploadBytesResumable(fileRef, buffer.buffer);
          
          uploadTask.on("state_changed", // params are: EVENT NEXT ERROR COMPLETE
          (snapshot) => { // NEXT
              const progress =
                Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              //setProgresspercent(progress);
              
              if(debug) console.log("Firebase fbWriteJSON "+progress+"%");

            },
          (error) => { // ERROR
          // A full list of error codes is available at
              // https://firebase.google.com/docs/storage/web/handle-errors
              if(debug) console.log(error.name +" "+error.code+" "+error._baseMessage);
              /*
              switch (error.code) {
                case 'storage/unauthorized':
                  break;
                case 'storage/canceled':
                  // User canceled the upload
                  break;

                // ...

                case 'storage/unknown':
                  // Unknown error occurred, inspect error.serverResponse
                  break;          },
                  */
              },



              // COMPLETE
          () => { 
            if(uploadTask.snapshot && uploadTask.snapshot.ref && uploadTask.snapshot.ref._location) {
              const loc = uploadTask.snapshot.ref._location;
              downloadUrl = loc.bucket+fbS+loc.path_;
              if(debug) console.log("Firebase fbWriteJSON to: "+downloadUrl);          
              
              // 20221127
              startSessionCB(jData,callRes);
              }
            }
          );
          
/*

{allPaths=**}
if request.auth != null

{"code":"storage/unauthorized",
"customData":{"serverResponse":""},
"name":"FirebaseError",
"status_":403,"_baseMessage":
"Firebase Storage: User does not have permission to access 'HGKG/2022/main.json'. 
(storage/unauthorized)"
}`
*/
        } else downloadUrl = "no Firebase Storage Ref for"+strChild;
    } else downloadUrl = "no Firebase Storage";
  }
  return downloadUrl;
}
module.exports['bucketUpload']=bucketUpload;











    
function fireWrite(session) {
  
  if(session && session.client && session.year) {
    // Add a new document in collection "sessions"
    let name = "C"+session.client+"Y0"+session.year;

    markActive(name);

      if(debug) console.log("Firebase fireWrite setDoc"+name);

  } else console.error("Firebase fireWrite SKIP");
}
module.exports['fireWrite']=fireWrite;


async function markActive(client) {
  const datastore = new Datastore();
  const query = datastore
    .createQuery('session')
    .filter('client', '=', client);

  datastore
  .runQuery(query)
  .then(results => {
    const matchingSet = results[0];
    console.log('Results found:', JSON.stringify(matchingSet[0]));

    let session = matchingSet[0];
    console.log('Session found:', JSON.stringify(session));

    //let client = session[datastore.client].id;
    let year  =  session[datastore.year].id;
    console.log('year found2:', JSON.stringify(session[datastore.year]));

    return parseInt(year,10);
  })
  .then((client) => {
    console.log('Calling markDone with task Key ID', taskKeyId);
    markDone(taskKeyId); // From the original function in the sample
    console.log('Updated task');
  })
  .catch(err => {
    console.error('ERROR:', err);
  });
}
