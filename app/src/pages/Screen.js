
/*

The following commands in PowerShell (run as admin) will create a root certificate and its associated trusted certificate:

1. We create a new root trusted cert:
$rootCert = New-SelfSignedCertificate -Subject 'CN=TestRootCA,O=TestRootCA,OU=TestRootCA' -KeyExportPolicy Exportable -KeyUsage CertSign,CRLSign,DigitalSignature -KeyLength 2048 -KeyUsageProperty All -KeyAlgorithm 'RSA' -HashAlgorithm 'SHA256'  -Provider 'Microsoft Enhanced RSA and AES Cryptographic Provider'

2. We create the cert from the root trusted cert chain:
New-SelfSignedCertificate -DnsName "localhost" -FriendlyName "MyCert" -CertStoreLocation "cert:\LocalMachine\My" -Signer $rootCert -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1") -Provider "Microsoft Strong Cryptographic Provider" -HashAlgorithm "SHA256" -NotAfter (Get-Date).AddYears(10)

3. We copy the thumbprint returned by the last command
(www.bexar.de)

4. (If neccesary) We remove the last association ip/port/cert:
netsh http delete sslcert ipport=0.0.0.0:3000

5. We associate the new certificate with any ip and your port, 3000 for example (the appid value does not matter, is any valid guid):
netsh http add sslcert ipport=0.0.0.0:3000 appid='{214124cd-d05b-4309-9af9-9caa44b2b74a}' certhash=E2924D13A1D0EEDDBD28B741FAA4F80539E46D77

6. Now, you must drag and drop the TestRootCA from the Personal/Certificates folder to Trusted Root Certification Authorities/Certificates.
These commands also resolve the error ERR_CERT_WEAK_SIGNATURE_ALGORITHM returned later by Google Chrome because the certificate is created with SHA256 instead of SHA1

7. In app/package.json  DEFINE "scripts": { "start": "set HTTPS=true&&react-scripts start", ...
*/
import { useState, useEffect } from "react";

// overall Screen frame for the React-based booking UI 

export default function Screen({ children, prevFunc, nextFunc, tabSelector }) {

    //const [isControl, setIsControl] = useState();
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
        let eHistory = document.getElementById(target+num.tabNum);
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
     

    return (
        <div className="mTable">    
           
            <div className="attrLine" onLoad="updateScreen()">
                
                {tabSelector.map((row,tabNum) => (
                    <div className="SYMB" onClick={((e) => select('PageContent',{tabNum}))}>
                        <label className="SYMB">
                            <input type="radio" name="tabSelector" autoFocus={tabNum==0?"1":""}/>                          
                            &nbsp;{tabNum}
                        </label>
                    </div>
                ))}
            </div>
            <div>
                
                {children}
                
            </div>
        </div>
    )
}


