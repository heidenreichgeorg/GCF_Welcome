import { useState, useEffect } from "react";

// overall Screen frame for the React-based booking UI 

export default function Screen({ children, tabSelector, tabName,
                                 aFunc, aText,
                 }) {

    const [ printable, setPrintable ] = useState(0)
    
    let isControl=false;
    let windowStyle= [ "printerPaper", "goldScreen","mobile" ][printable]
    console.log("Screen.Screen windowStyle "+windowStyle);
    let border = document.getElementById('windowBorder');
    if(border) border.className=windowStyle; 

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
        let eHistory = document.getElementById(target+num);
        var screen=eHistory;
        var style="none";
        
        if(!eHistory) { 
            screen=document.getElementById(target+'0'); 
            style="block";             
            let border = document.getElementById('windowBorder');
            if(border) border.className=windowStyle; 
        } 
        
        // switch OFF each tab
        for(var i=0;screen;i++) {
            screen.style.display=style;
            screen=document.getElementById(target+i);
        }

        // switch ON the selected tab
        if(eHistory) {
            eHistory.style.display="block";
            let border = document.getElementById('windowBorder');
            if(border) border.className=windowStyle; 
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
    
    //function makeTab(tabName,tabNum) { return (e) => { console.log("onClick("+tabName+","+tabNum+")"); select(tabName,tabNum)}}

    function makeSelect(tabName,target) { 
        var elem = document.getElementById(target.id);
        if(elem) {
            let index=elem.selectedIndex;
            //var value = elem.options[index].value;
            select(tabName,index);
        }
    }

    

    return (
        <div>
            <div className="mScreen">           
                <div className="attrLine">                     
                    <select autoFocus type="radio" id={tabName} name={tabName} onChange={(e)=>makeSelect(tabName,e.target)}> 
                        {tabSelector.map((row,tabNum) => (
                            <option  id={"Screen0"+tabNum}  key={"Screen0"+tabNum}  value={row} >{row}</option>
                            // onClick={makeTab(tabName,tabNum,"")}
                        ))}
                    </select>
                </div>
                <div>              
                    {children}                
                </div>            
            </div>        
            <div className="PAGE attrLine"></div>
            <div className="attrLine">
                <div className="FIELD" onClick={() => {setPrintable((printable+1)%3)}}><div className="CNAM key">{printable?"Report":"Print"}</div></div>
                {aFunc.map((miscFunc,i) => (
                    <div key={i} className="FIELD" onClick={(() => {if(miscFunc) return miscFunc(); else return "";})}>{aText[i]?(<div className="CNAM key">{aText[i]}</div>): " "}</div>
                ))}

            </div>
            <div className="attrLine"></div>
        </div>
    )

}


