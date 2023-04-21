import React from "react";
import { bigEUMoney } from "../modules/money.mjs";


const cArcBlue  ="#66AADD";
const cScaleBlue="#5588CC";


// JSON of named features each feature is an array with 
export default function Halo (args) {

    const radius = 100;
    const max = 360000;

    console.log("HALO "+JSON.stringify(args.jFeatures));

    //const logMax = Math.floor(Math.log10(max)-2);
    //let step = 1; for(let i=0;i<logMax;i++) step=10*step;
    //console.log("max= "+max+"   logMax="+logMax+" and step is "+step);
    const step=1000;

    


    const lineRadius = radius-10;
    const outerRadius = radius+3;
    const xcenter=outerRadius+15;
    const ycenter=outerRadius+15;

    let jFeatures = {
      //  f1 : [10,20,30,40,50,60,70],
//        f2 : [10,20,30,40,50,60,70],
        //f3 : [10,20,30,40,50,60,70]
    }


    Object.keys(args.jFeatures).forEach(title=>
        {
            jFeatures[title] = args.jFeatures[title].map((value)=>parseInt(""+(bigEUMoney(value)/2000000n)))
        })


//============================================================        

    let aWork = [];
    const strokeWidth = 5;
    var featureRad = radius-strokeWidth;
    //let externalRad=makeGroup(aWork,jFeatures.fixedCap,   xcenter,ycenter,radius+20,strokeWidth,step,140,"EE4411"); 


    let angle=0; 
    Object.keys(jFeatures).forEach(title=>
    {
        featureRad=makeGroup(aWork, jFeatures[title], xcenter,ycenter, featureRad, strokeWidth,step,  angle)-3 
        angle+=20;
    })


    let aScales=[];
    makeScales(aScales,aWork,130,11,xcenter,ycenter,radius);
    makeScales(aScales,aWork,310,11,xcenter,ycenter,radius);

    // aWork,aScales are the output of the make operations

//                 <g key={"circleDiv"+i} id="tooltip" display="none" style="position: absolute; display: none;">


    return (
        <div>
        <svg height={30+outerRadius*2} width={30+outerRadius*2} >
            
            {
            aWork.map((jTask,i)=>(
            (
                    <circle
                        className="gauge_base"
                        cx={jTask.xcenter}
                        cy={jTask.ycenter}                
                        r={jTask.radius}
                        stroke={jTask.color}
                        strokeDasharray={jTask.dash}
                        strokeWidth={jTask.width}
                        transform={jTask.transform}
                        fill="transparent"
                    /> 
                   
            )))
            }



            {
                
                aScales.map((scale)=>(
                     scale.jTask.map((j,i)=>
                    (
                        <line key={"Line"+i}
                            x1={xcenter+(lineRadius*Math.cos(j*Math.PI/180))} 
                            y1={ycenter+(lineRadius*Math.sin(j*Math.PI/180))} 
                            x2={xcenter+(radius*Math.cos(j*Math.PI/180))} 
                            y2={ycenter+(radius*Math.sin(j*Math.PI/180))} 
                            stroke={cArcBlue}
                            strokeWidth={1}
                            />
                    )))                
                )}
            
            {
                 <line
                 x1={-10} 
                 y1={ycenter} 
                 x2={2*xcenter+10} 
                 y2={ycenter} 
                 stroke={cArcBlue}
                 strokeWidth={1}
                 />
            }

            {
                 <line
                 x1={xcenter} 
                 y1={-10} 
                 x2={xcenter} 
                 y2={2*ycenter+10} 
                 stroke={cArcBlue}
                 strokeWidth={1}
                 />
            }
        </svg>
        

        </div>
    );
    // <div id="tooltip" display="none">...</div>
}

const allColors = ["#2255BB","#2299BB","#4499BB","#6699BB","#2255DD","#2299DD","#3399CC","#9999CC"];
   
function showTooltip(evt, text) {
    let tooltip = document.getElementById("tooltip");
    if(tooltip) {
        tooltip.innerHTML = text;
        tooltip.style.display = "block";
        tooltip.style.left = evt.pageX + 10 + 'px';
        tooltip.style.top  = evt.pageY + 10 + 'px';
    }
  }
  
  function hideTooltip() {
    var tooltip = document.getElementById("tooltip");
    if(tooltip) tooltip.style.display = "none";
  }
 
function makeGroup(aWork,arrValues,xcenter,ycenter,radius,width,step,start) {
    radius-=width;
    var toggle=0;
    const circumference = radius * 2 * Math.PI;
    let base=start / step * circumference;
    arrValues.forEach(value=>{
        const arc = (circumference * value) / step;
        const dash = `${arc} ${circumference}`;   
        //console.log("ARC   base="+base+" dash "+dash);
        aWork.push({ transform: `rotate(${base}, ${xcenter}, ${ycenter})`, 
                    xcenter:xcenter, ycenter:ycenter, 
                    radius:radius, 
                    dash:dash, 
                    width:width+toggle, color:toggle==0?cArcBlue:cScaleBlue});
        base+=(value / step)*radius*4;        
        toggle=5-toggle;
    });
    return radius-3;
}

function makeScales(aScales,aWork,begin,iter,xcenter,ycenter,radius) {
    let angles=[];
    for(let i=0;i<iter;i++) angles.push((begin+i*40)%360);
    aScales.push({jTask:angles});
    const strokeWidth=1;
    const innerRadius = radius - 1;
    const circumference = innerRadius * 2 * Math.PI;
    const arc = circumference * 0.281; // 100 degrees = 11 dashes
    const dash = `${arc} ${circumference}`;    
    aWork.push({ transform: `rotate(${begin}, ${xcenter}, ${ycenter})`, 
                    xcenter:xcenter, ycenter:ycenter, 
                    radius:radius, dash:dash, width:strokeWidth, color:cScaleBlue});
}

/*
 <rect 
                        width="15"
                        height="15"
                        onMouseMove={(e)=>{showTooltip(e, 'Account'+i)}} 
                        onMouseOut={hideTooltip}
                        style="fill:rgb(0,0,0);"
                    /> 
                </g>
*/
