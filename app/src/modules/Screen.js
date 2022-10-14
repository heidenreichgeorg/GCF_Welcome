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

        // eHistory is the tab to be displayed
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
    
    return (
        <div class="mTable">
            
            <div class="attrRow">
                <div class="key" onClick={((e) => select('PageContent',-1))}>Print</div>
                {tabSelector.map((row,i) => (
                    <div class="key" onClick={((e) => select('PageContent',{i}))}><label class="form-control"><input type="radio" autoFocus="" />{row}</label></div>
                ))}
            </div>

            <div class="ulliTab" id="PageContent0" style={{ display: 'block' }}>
                {children}
            </div>
        </div>
    )
}


