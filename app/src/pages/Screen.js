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
        <div class="mTable">    
            <script  type="text/javascript"  src="/client.js" />
            <div class="attrLine" onLoad="updateScreen()">
                
                {tabSelector.map((row,tabNum) => (
                    <div class="L66" onClick={((e) => select('PageContent',{tabNum}))}>
                        <label class="L66">
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


