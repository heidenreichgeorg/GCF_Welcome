/*
Um eine Datei in Cloud Storage hochzuladen, erstellen Sie zunächst einen Verweis auf den vollständigen Pfad der Datei, einschließlich des Dateinamens.
*/

//import { initializeApp, getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

//const base64 = require('Base64');
const utf8 = require('utf8');

const fbApp = require("firebase/app");
const fbStorage = require("firebase/storage");

function ab2str(buf) { return String.fromCharCode.apply(null, new Uint16Array(buf)); }

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) { bufView[i] = str.charCodeAt(i); }
  return buf;
}

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


function fbInit() {

  // Initialize Firebase app
  const bpApp = fbApp.initializeApp(firebaseConfig);
  
  // Initialize Cloud Storage and get a reference to the service
  return  fbStorage.getStorage(bpApp);

}
module.exports['fbInit']=fbInit;

/*

// Create a reference to 'mountains.jpg'
const mountainsRef = ref(storage, 'mountains.jpg');

// Create a reference to 'images/mountains.jpg'
const mountainImagesRef = ref(storage, 'images/mountains.jpg');

// While the file names are the same, the references point to different files
let compNames = (mountainsRef.name === mountainImagesRef.name);           // true
let compPath = (mountainsRef.fullPath === mountainImagesRef.fullPath);   // false 


Aus einem Blob oder einer File
Nachdem Sie eine entsprechende Referenz erstellt haben, rufen Sie die Methode uploadBytes() . uploadBytes() nimmt Dateien über die JavaScript- Datei- und Blob -APIs und lädt sie in Cloud Storage hoch.
*/
const jMetadata = {
    contentType: 'application/json',
  };

async function fbWriteJSON(bpStorage,client,year,jData) {

  let downloadUrl = "no Firebase Storage";
  if(fbStorage) {
    if(bpStorage) {
      //WRITE FB to no Firebase Storage Instance
      // instance missing
      //if(bpStorage.instance) {
          // sanitize input
        let sClient = client.replace('.','_');
        let iYear = parseInt(year);
        const strChild = sClient+"/"+iYear+"/main.json";
        const firebaseStorageRef = fbStorage.ref(bpStorage, strChild);


        //let firebaseStorageRef = bpStorage.instance.ref();
        if(firebaseStorageRef) {

          var fileRef = firebaseStorageRef; // .child(strChild);
          if(fileRef) {
            var jsonString = JSON.stringify(jData);
            var bytes = utf8.encode(jsonString);
            //var base64Str = base64.encode(bytes);
            //var arr = base64.decode(base64Str); //arr will be Uint8list
            var arr = str2ab(jsonString);

            const uploadTask = fbStorage.uploadBytesResumable(fileRef, arr);
//            let taskSnapshot = await uploadTask.onComplete;   
            //downloadUrl = await taskSnapshot.ref.getDownloadURL();
            
            uploadTask.on("state_changed",
            (snapshot) => {
              const progress =
                Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              //setProgresspercent(progress);
              console.log("fbWriteJSON "+progress);},
            
            (error) => {
              console.dir("fbWriteJSON "+JSON.stringify(error));
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                downloadUrl=url;});
            });
            

          } else downloadUrl = "no Firebase Storage Ref for"+strChild;
        } else downloadUrl = "no Firebase Storage root Ref ";
      //} else downloadUrl = "no Firebase Storage Instance";
    } else downloadUrl = "no Firebase Storage";
  }
  return downloadUrl;
}
module.exports['fbWriteJSON']=fbWriteJSON;


    
/*      

// 'file' comes from the Blob or File API
uploadBytes(storageRef, file).then((snapshot) => {
  console.log('Uploaded a blob or file!');
});




Hochladen von einem Byte-Array
Zusätzlich zu den File und Blob -Typen kann uploadBytes() auch ein Uint8Array in Cloud Storage hochladen.



const bytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21]);
uploadBytes(storageRef, bytes).then((snapshot) => {
  console.log('Uploaded an array!');
});




Hochladen aus einer Zeichenfolge
Wenn kein Blob , File oder Uint8Array verfügbar ist, können Sie die uploadString() -Methode verwenden, um eine Raw-, base64 -, base64url - oder data_url Zeichenfolge in Cloud Storage hochzuladen.


// Raw string is the default if no format is provided
const message = 'This is my message.';
uploadString(storageRef, message).then((snapshot) => {
  console.log('Uploaded a raw string!');
});


/*
// Base64 formatted string
const message2 = '5b6p5Y+344GX44G+44GX44Gf77yB44GK44KB44Gn44Go44GG77yB';
uploadString(storageRef, message2, 'base64').then((snapshot) => {
  console.log('Uploaded a base64 string!');
});

// Base64url formatted string
const message3 = '5b6p5Y-344GX44G-44GX44Gf77yB44GK44KB44Gn44Go44GG77yB';
uploadString(storageRef, message3, 'base64url').then((snapshot) => {
  console.log('Uploaded a base64url string!');
});

// Data URL string
const message4 = 'data:text/plain;base64,5b6p5Y+344GX44G+44GX44Gf77yB44GK44KB44Gn44Go44GG77yB';
uploadString(storageRef, message4, 'data_url').then((snapshot) => {
  console.log('Uploaded a data_url string!');
});


uploadString() gibt eine UploadTask zurück, die Sie als Zusage oder zur Verwaltung und Überwachung des Upload-Status verwenden können.

Da die Referenz den vollständigen Pfad zur Datei definiert, stellen Sie sicher, dass Sie in einen nicht leeren Pfad hochladen.

Dateimetadaten hinzufügen
Beim Hochladen einer Datei können Sie auch Metadaten für diese Datei angeben. Diese Metadaten enthalten typische Dateimetadateneigenschaften wie name , size und contentType (allgemein als MIME-Typ bezeichnet). Cloud Storage leitet den Inhaltstyp automatisch von der Dateierweiterung ab, in der die Datei auf der Festplatte gespeichert ist, aber wenn Sie einen contentType in den Metadaten angeben, wird der automatisch erkannte Typ überschrieben. Wenn keine contentType -Metadaten angegeben sind und die Datei keine Dateierweiterung hat, verwendet Cloud Storage standardmäßig den Typ application/octet-stream . Weitere Informationen zu Dateimetadaten finden Sie im Abschnitt Dateimetadaten verwenden .


// Create file metadata including the content type
// @type {any} 
const metadata = {
  contentType: 'image/jpeg',
};


Uploads verwalten
Zusätzlich zum Starten von Uploads können Sie Uploads mit den Methoden pause() , resume() und cancel() anhalten, fortsetzen und abbrechen. Das Aufrufen von pause() oder resume() löst pause oder running aus. Der Aufruf der Methode cancel() führt dazu, dass der Upload fehlschlägt und ein Fehler zurückgegeben wird, der darauf hinweist, dass der Upload abgebrochen wurde.


import { uploadBytesResumable } from "firebase/storage";

// Upload the file and metadata
const uploadTask = uploadBytesResumable(storageRef, file);

// Pause the upload
uploadTask.pause();

// Resume the upload
uploadTask.resume();

// Cancel the upload
uploadTask.cancel();


Überwachen Sie den Upload-Fortschritt
Während des Hochladens kann die Upload-Aufgabe Fortschrittsereignisse im state_changed Beobachter auslösen, wie zum Beispiel:

Ereignistyp	Typische Verwendung
running	Dieses Ereignis wird ausgelöst, wenn die Aufgabe mit dem Hochladen beginnt oder fortfährt, und wird häufig in Verbindung mit dem pause Ereignis verwendet. Bei größeren Uploads kann dieses Ereignis mehrmals als Fortschrittsaktualisierung ausgelöst werden.
pause	Dieses Ereignis wird jedes Mal ausgelöst, wenn der Upload angehalten wird, und wird häufig in Verbindung mit dem running Ereignis verwendet.
Wenn ein Ereignis eintritt, wird ein TaskSnapshot Objekt zurückgegeben. Dieser Snapshot ist eine unveränderliche Ansicht der Aufgabe zum Zeitpunkt des Auftretens des Ereignisses. Dieses Objekt enthält die folgenden Eigenschaften:

Eigentum	Typ	Beschreibung
bytesTransferred	Number	Die Gesamtzahl der Bytes, die übertragen wurden, als dieser Snapshot erstellt wurde.
totalBytes	Number	Die Gesamtzahl der Bytes, die hochgeladen werden sollen.
state	firebase.storage.TaskState	Aktueller Stand des Uploads.
metadata	firebaseStorage.Metadata	Vor Abschluss des Uploads werden die Metadaten an den Server gesendet. Nach Abschluss des Uploads werden die Metadaten vom Server zurückgesendet.
task	firebaseStorage.UploadTask	Die Aufgabe ist eine Momentaufnahme, die verwendet werden kann, um die Aufgabe zu „pausieren“, „fortzusetzen“ oder „abzubrechen“.
ref	firebaseStorage.Reference	Die Referenz, aus der diese Aufgabe stammt.
Diese Zustandsänderungen bieten in Kombination mit den Eigenschaften des TaskSnapshot eine einfache, aber leistungsstarke Möglichkeit, Upload-Ereignisse zu überwachen.


import {  getDownloadURL } from "firebase/storage";
import { write } from "xlsx";


// Register three observers:
// 1. 'state_changed' observer, called any time the state changes
// 2. Error observer, called on failure
// 3. Completion observer, called on successful completion
uploadTask.on('state_changed', 
  (snapshot) => {
    // Observe state change events such as progress, pause, and resume
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case 'paused':
        console.log('Upload is paused');
        break;
      case 'running':
        console.log('Upload is running');
        break;
    }
  }, 
  (error) => {
    // Handle unsuccessful uploads
  }, 
  () => {
    // Handle successful uploads on complete
    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      console.log('File available at', downloadURL);
    });
  }
);

Fehlerbehandlung
Es gibt eine Reihe von Gründen, warum beim Hochladen Fehler auftreten können, darunter die lokale Datei, die nicht vorhanden ist, oder der Benutzer, der keine Berechtigung zum Hochladen der gewünschten Datei hat. Weitere Informationen zu Fehlern finden Sie im Abschnitt Fehler behandeln der Dokumentation.

Vollständiges Beispiel
Ein vollständiges Beispiel eines Uploads mit Fortschrittsüberwachung und Fehlerbehandlung ist unten dargestellt:



// Create the file metadata

// Upload file and metadata to the object 'images/mountains.jpg'
const storageRefB = ref(storage, 'images/' + file.name);
const uploadTaskB = uploadBytesResumable(storageRefB, file, metadata);

// Listen for state changes, errors, and completion of the upload.
uploadTaskB.on('state_changed',
  (snapshot) => {
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case 'paused':
        console.log('Upload is paused');
        break;
      case 'running':
        console.log('Upload is running');
        break;
    }
  }, 
  (error) => {
    // A full list of error codes is available at
    // https://firebase.google.com/docs/storage/web/handle-errors
    switch (error.code) {
      case 'storage/unauthorized':
        // User doesn't have permission to access the object
        break;
      case 'storage/canceled':
        // User canceled the upload
        break;

      // ...

      case 'storage/unknown':
        // Unknown error occurred, inspect error.serverResponse
        break;
    }
  }, 
  () => {
    // Upload completed successfully, now we can get the download URL
    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      console.log('File available at', downloadURL);
    });
  }
);
*/