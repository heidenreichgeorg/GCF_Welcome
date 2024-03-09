import { timeSymbol } from '../modules/login'
import { J_ACCT } from '../modules/terms.js'
import { HTTP_OK, HTTP_WRONG } from '../modules/serverSession'
import { REACT_APP_API_HOST } from '../modules/sessionmanager';

const CSV_RS = '\n';
const CSV_FS = ';';

export default function Welcome() {

    function dragOverHandler(ev) {
        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();
        console.log('File(s) in drop zone'); //+JSON.stringify(ev.dataTransfer.items[0]));
    }


    function dropHandler(ev) {
        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();
        console.log('File(s) dropped');        

            if (ev.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
                
                // If dropped items aren't files, reject them
                if (ev.dataTransfer.items[0].kind === 'file') {
                    let file = ev.dataTransfer.files[0];

                    console.log('File '+file.name+'  dropped' );

                    var fr = new FileReader();
                    fr.onload = function () {

                        let fileBuffer = this.result;            
                            
                        let jData={};
                        try {
                            jData = JSON.parse(fileBuffer);
                            jData.clientFunction="Booking"; // GH20220926

                        } catch(err) { 
                            //console.dir("WELCOMEDROP CANNOT PARSE "+fileBuffer); 
                            let sheetLines = fileBuffer.split(CSV_RS);
                            if(sheetLines.length>J_ACCT) {
                                console.error("0820 UPLOAD CSV WITH "+sheetLines.length+" lines");                  
                                console.dir("\n0822 UPLOAD CSV N-line "+JSON.stringify(sheetLines[0])); 
                                console.dir("\n0824 UPLOAD CSV K-line "+JSON.stringify(sheetLines[4]));                   


                                // indices depend on Sheets.makeXLTabs
                                let arrKLine = sheetLines[3].split(CSV_FS);
                                let year  = arrKLine[2];
                                let client= arrKLine[4];
                                console.dir("\n0826 UPLOAD CSV client:"+client+"  year:"+year);                   

                                let aoaSheet = sheetLines.map((strRow)=>(strRow.split(CSV_FS)));

                                jData.year  = year;
                                jData.client= client;
                                jData.sheetCells = JSON.parse(JSON.stringify(aoaSheet));
                                jData.sheetName = ""+client+year;
                                jData.clientFunction= "BeginYear";

                            }
                        }
                        callServer('POST',"UPLOAD","application/json",JSON.stringify(jData),showResponse);


                    }
                    fr.readAsText(file);
                }
    
            }
            console.log('MANAGED');
        }
    

    function showResponse(response) {
        let display = document.getElementById('mainPage');
        if(display)
        if(response) display.innerHTML=response;
    }

    function callServer(cmd,strTarget,applicationType,strParams,callBack) {
        // cmd = GET or POST
        //let strServerDNS = 'http://'+self.location.hostname+':'+PORT+'/';     
        let strServerDNS = REACT_APP_API_HOST+'/';
        if(strTarget) {
            var request = new XMLHttpRequest();       
            console.log('\n'+cmd+' '+strServerDNS+strTarget+"?"+strParams+"\n");			
            request.onreadystatechange = function() {
                if (this.readyState == 4 && this.status>=HTTP_OK) {
                    if(callBack) {                   
                        if(this.status==HTTP_WRONG) callBack( ""+this.status+" ERROR " );
                        else {
                            callBack( request.responseText );
                            console.log("callServer callback(responseText)");
                        }
                    }
                }
            };
            request.open(cmd,strServerDNS+strTarget, true);						
            request.addEventListener('error', handleEvent);
            request.setRequestHeader('Cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
            request.setRequestHeader('Cache-control', 'max-age=0');
            request.setRequestHeader( 'Content-Type', applicationType+';charset=UTF-8'); //("Content-type", "text/json");			
            request.send(strParams);
        } else alert('callServer: no target:  '+cmd+' '+strServerDNS+strTarget+"?"+strParams+"\n");
    }

    function handleEvent(event) { 
        if(event) console.log(timeSymbol()+'--'+event.type+': '+event.message+' '+event.filename+'\n'); 
        else console.log(timeSymbol()+'--EMPTY');
    }

    return (        
        <div id='mainPage' className="mTable">
            <div className="attrRow">
                Sign Up
                CSV/JSON in UTF-8
            </div>
            <div className="BIGCELL">
                <div className="FLEX box" onDragOver={dragOverHandler} onDrop={dropHandler}> </div>                
                
            </div>
            <div className="FIELD box" id="fileupload">Upload</div>            
        </div>
         
        
        
    )
}
