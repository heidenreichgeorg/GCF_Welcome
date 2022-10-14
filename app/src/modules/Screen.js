import { useState, useEffect } from "react";

// overall Screen frame for the React-based booking UI 

export default function Screen({ children, prevFunc, nextFunc }) {

    const downHandler = ({ key }) => {
        
          //console.log("Screen.downHandler keyCode "+key.keyCode)
          console.log("Screen.downHandler key "+JSON.stringify(key))

          if(key==='ArrowRight') {
            console.log("Screen.downHandler key NEXT ")
            nextFunc(key);
          }
          else if(key==='ArrowLeft') {
            console.log("Screen.downHandler key PREV")
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

        let eHistory = document.getElementById(target+num);
        var screen=eHistory;
        var style="none";
        
        if(!eHistory) { 
            screen=document.getElementById(target+'0'); 
            style="block"; 
            document.getElementById('windowBorder').className="witBorder"; 
        } 
        
        for(var i=0;screen;i++) {
            screen.style.display=style;
            screen=document.getElementById(target+i);
        }
        if(eHistory) {
            eHistory.style.display="block";
            document.getElementById('windowBorder').className="dosBorder"; 
        }
    }
    
    
    return (
        <div class="mTable">

            <div class="attrRow">
                <div class="key" onClick={((e) => select('PageContent',-1))}>Print</div>
                <div class="key" onClick={((e) => select('PageContent',0))}><label class="form-control"><input type="radio" autoFocus="" />0</label></div>
            </div>

            <div class="ulliTab" id="PageContent0" style={{ display: 'block' }}>
                {children}
            </div>
        </div>
    )
}


