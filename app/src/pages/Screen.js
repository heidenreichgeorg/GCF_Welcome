
/*
https://www.misterpki.com/netsh-http-add-sslcert/

run POWERSHELL as ADMIN

A) check existing certicates    ls cert:\LocalMachine\My
B) show installed certtificates

The following commands in PowerShell (run as admin) will create a root certificate and its associated trusted certificate:

1. We create a new root trusted cert:
$rootCert = New-SelfSignedCertificate -Subject 'CN=TestRootCA,O=TestRootCA,OU=TestRootCA' -KeyExportPolicy Exportable -KeyUsage CertSign,CRLSign,DigitalSignature -KeyLength 2048 -KeyUsageProperty All -KeyAlgorithm 'RSA' -HashAlgorithm 'SHA256'  -Provider 'Microsoft Enhanced RSA and AES Cryptographic Provider'

2. We create the cert from the root trusted cert chain:
New-SelfSignedCertificate -DnsName "localhost" -FriendlyName "MyCert" -CertStoreLocation "cert:\LocalMachine\My" -Signer $rootCert -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1") -Provider "Microsoft Strong Cryptographic Provider" -HashAlgorithm "SHA256" -NotAfter (Get-Date).AddYears(10)

3. We copy the thumbprint returned by the last command, or alternatively   ls cert:\LocalMachine\My
(www.bexar.de)

4. (If neccesary) We remove the last association ip/port/cert:
netsh http delete sslcert ipport=0.0.0.0:3000

5. We associate the new certificate with any ip and your port, 3000 for example (the appid value does not matter, is any valid guid):
netsh http add sslcert ipport=0.0.0.0:3000 appid='{214124cd-d05b-4309-9af9-9caa44b2b74a}' certhash=E2924D13A1D0EEDDBD28B741FAA4F80539E46D77


6. Now, you must drag and drop the TestRootCA from the Personal/Certificates folder to Trusted Root Certification Authorities/Certificates.
These commands also resolve the error ERR_CERT_WEAK_SIGNATURE_ALGORITHM returned later by Google Chrome because the certificate is created with SHA256 instead of SHA1

7. In app/package.json  DEFINE "scripts": { "start": "set HTTPS=true&&react-scripts start", ...


FOR BACKEND SERVER (Jan 31, 2023)

8. create a new certificate in c:\workspace\sec for www.cashtop.de
New-SelfSignedCertificate -Subject "www.cashtop.de" -CertStoreLocation c:\workspace\sec


9. remove old certificate for backend port 81
netsh http delete sslcert ipport=0.0.0.0:81


10. bind new cert to Port 81 for backend, invent an app-id to bind it later, use the cert hash optained from   ls cert:\LocalMachine\My
netsh http add sslcert ipport=0.0.0.0:81   appid='{214524cd-d65b-4309-9af7-9caa48b2b79a}' certhash=20747ED182AA326887E674B41ACA78557484FF78


*/
import { useState, useEffect } from "react";

// overall Screen frame for the React-based booking UI 

export default function Screen({ children, prevFunc, nextFunc, tabSelector, tabName }) {

    
    let isControl=false;
    function setIsControl(pressed) { isControl=pressed; }

    const downHandler = ({ key }) => {                  
          if(key==='Control') {
            setIsControl(true);
            console.log("Screen.downHandler key CONTROL")

          } else if(key==='ArrowRight') {
            
            console.log("Screen.downHandler key NEXT ")
            if(isControl) 
            nextFunc(key);

          } else if(key==='ArrowLeft') {
            
            console.log("Screen.downHandler key PREV")
            if(isControl) 
            prevFunc(key);
          }        
    };

    useEffect(() => {
        window.addEventListener("keydown", downHandler);
        /*
        // Remove event listeners on cleanup

        return () => {
          window.removeEventListener("keydown", downHandler);
        };
        */
    }, []); // Empty array ensures that effect is only run on mount and unmount

    function select(target,num) {

        console.log("Screen select "+target+JSON.stringify(num));

        // eHistory is the tab to be displayed
        //let eHistory = document.getElementById(target+num.tabNum);
        let eHistory = document.getElementById(target+num);
        var screen=eHistory;
        var style="none";
        
        if(!eHistory) { 
            screen=document.getElementById(target+'0'); 
            style="block"; 
            document.getElementById('windowBorder').className="witBorder"; 
        } 
        
        // switch OFF each tab
        for(var i=0;screen;i++) {
            screen.style.display=style;
            screen=document.getElementById(target+i);
        }

        // switch ON the selected tab
        if(eHistory) {
            eHistory.style.display="block";
            document.getElementById('windowBorder').className="dosBorder"; 
        }
    }
     
// remove () from onload="updateScreen()", added {} instead of "",
// there is no onLoad={updateScreen} and no     <div className="attrLine" onLoad="updateScreen()">
    if(!tabSelector) return (
        <div className="mTable">           
            <div>              
                {children}                
            </div>
        </div>
    ); 
    
    function makeTab(tabName,tabNum) { return (e) => { console.log("onClick("+tabName+","+tabNum+")"); select(tabName,tabNum)}}

    return (
        <div className="mTable">           
            <div className="attrLine">                     
                <select type="radio" name={tabName}>                          
                    {tabSelector.map((row,tabNum) => (
                        <option value={row} onClick={makeTab(tabName,tabNum)}>{row}</option>
                    ))}
                </select>
            </div>
            <div>              
                {children}                
            </div>
        </div>
    )
}


