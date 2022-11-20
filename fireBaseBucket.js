/*

bookingpages-a0a7c
storage.rules: ALLE REGELN WERDEN AUSGEWERTET
CONSOLE Cloud Storage settings -> UID , GID
https://console.cloud.google.com/welcome?project=bookingpages-a0a7c

DOWNLOAD EXCEL (pay per use)
UPLOAD JSON (Admin only)

*/

const utf8 = require('utf8');

const fbS = "/";
const MAIN = "main.json";

const fbApp = require("firebase/app");
const fbStorage = require("firebase/storage");

const https = require('https');
//import Fetch from 'node-fetch'
/*
function ab2str(buffer) {
  return String.fromCharCode.apply(null, Array.from(new Uint16Array(buffer)))
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) { bufView[i] = str.charCodeAt(i); }
  return buf;
}
*/

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "bookingpages-a0a7c",
  authDomain: "bookingpages-a0a7c.firebaseapp.com",
  storageBucket: "bookingpages-a0a7c.appspot.com",
  messagingSenderId: "82673479353",
  apiKey: "AIzaSyCd9Gk9SNgDx4jagm8A5HO__9-uleUBPTw",
  appId: "1:82673479353:web:e14098f5dd219252a1f568"
};


function bucketInit() {

  // Initialize Firebase app
  const bpApp = fbApp.initializeApp(firebaseConfig);
  
  // Initialize Cloud Storage and get a reference to the service
  return  fbStorage.getStorage(bpApp);

}
module.exports['bucketInit']=bucketInit;


// ONLY FOR BROWSERS gsutil cors set cors.json gs://bookingpapages-a0a7c -


async function bucketDownload(bpStorage,client,year,startSession,ext,userRes) {
  let sClient = client.replace('.','_');
  let iYear = parseInt(year);


  const strChild = fbS+sClient+fbS+iYear+fbS+MAIN;  
  const fileRef = fbStorage.ref(bpStorage, strChild);
  console.log('Firebase.download fileRef='+JSON.stringify(fileRef));

  fbStorage.getDownloadURL(fileRef)
  .then(
    
    function(url) {

        console.log('Firebase.download fetch '+url)

        /*
        fetch(url)
        .then(data => data.json())
        .then(session => {startSession(session,ext,userRes)})
        .catch(function(error) {
         */ 
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
              
              console.dir("Firebase.download body "+body);

              let buf = toString(body);

              console.dir("Firebase.download buf "+buf);

              session = JSON.parse(body);
            }
            catch(err) {
              console.dir("Firebase.download ERR "+err.toString());
            }

            console.dir("Firebase.download session "+JSON.stringify(session));
            // AVOID double HEADERS 
            startSession(session,ext,userRes);
          })
        }).on('error', function(error) {     

          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case 'storage/object-not-found':
              console.dir('Firebase.download storage/object-not-found')
            break;

            case 'storage/bucket-not-found':
              console.dir('Firebase.download storage/bucket-not-found')
            break;

            case 'storage/project-not-found':
              console.dir('Firebase.download storage/project-not-found')
            break;
      
            case 'storage/unauthorized':
              console.dir('Firebase.download storage/unauthorized')
            break;

            case 'storage/quota-exceeded':
              console.dir('Firebase.download storage/quota-exceeded')
              break;

            case 'storage/unauthenticated':
              console.dir('Firebase.download storage/unauthenticated')
              break;

            case 'storage/canceled':
              console.dir('Firebase.download storage/canceled')
              break;

            case 'storage/invalid-checksum':
              console.dir('Firebase.download storage/invalid-checksum')
              break;

            case 'storage/unknown':
              console.dir('Firebase.download storage/unknown')
              break;

            default:
              console.dir("Firebase.download ERROR "+JSON.stringify(error));
          }  
      })
    })
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

async function bucketUpload(bpStorage,client,year,jData) {

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
              
                console.log("fbWriteJSON "+progress);

            },
          (error) => { // ERROR
          // A full list of error codes is available at
              // https://firebase.google.com/docs/storage/web/handle-errors
              console.log(error.name +" "+error.code+" "+error._baseMessage);
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
              console.log("Firebase fbWriteJSON to: "+downloadUrl);          
              //uploadTask.snapshot.ref.getDownloadURL().then((url) => { downloadUrl=url;}); 
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


    


