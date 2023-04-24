import React from "react";
import { bigEUMoney } from "../modules/money.mjs";


const cSkyBlue  ="#77CCEE";
const cArcBlue  ="#66AADD";
const cScaleBlue="#5588CC";
const cDarkBlue ="#223388";


// JSON of named features each feature is an array with 
export default function Halo (args) {

    const radius = 110;

    console.log("HALO "+JSON.stringify(args.arrPartners));

    const step=1000;

    const lineRadius = radius-10;
    const outerRadius = radius+3;
    const xcenter=outerRadius+15;
    const ycenter=outerRadius+15;

    // named arrays of values { type:[] }
    let jFeatures = { }

    let jNames = {}


    Object.keys(args.jFeatures).forEach(title=>
        {
            jFeatures[title] = args.jFeatures[title].map((value)=>parseInt(""+(bigEUMoney(value)/2000000n)))


            let related = args.arrPartners.map((_,i)=>((args.arrPartners[i])[title]));
            console.log("TYPE="+title+ " finds "+JSON.stringify(jFeatures[title])+" into "+JSON.stringify(related));

            jNames[title]=related;
        })


//============================================================        

    let aWork = [];
    const strokeWidth = 5;
    var featureRad = radius-strokeWidth;


    let aScales=[];
    makeScales(aScales,aWork,130,11,xcenter,ycenter,radius);
    makeScales(aScales,aWork,310,11,xcenter,ycenter,radius);


    let angle=0; 
    Object.keys(jFeatures).forEach(title=>
    {
        featureRad=makeGroup(aWork, jFeatures[title], jNames[title],xcenter,ycenter, featureRad, strokeWidth,step,  angle)-3 
        angle+=20;
    })


    // aWork,aScales are the output of the make operations

    return (
        <svg viewBox="0 0 230 250" height="720" width="760" >
        <g>
            {   aScales.map((scale)=>(
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
                <line x1={-10}  y1={ycenter}  x2={2*xcenter+10}  y2={ycenter}  stroke={cArcBlue} strokeWidth={1} />
                <line  x1={xcenter} y1={-10}  x2={xcenter}  y2={2*ycenter+10} stroke={cArcBlue} strokeWidth={1} />
            
            {
            aWork.map((jTask,i)=>(
            (
                <g fill={cDarkBlue} >
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
                    <text x={jTask.xstart} y={jTask.ystart} font-size="4" transform={jTask.transform}>{jTask.text}</text>
                </g>                   
            )))
            }



            
        </g>
        </svg>
        

    );
    // <div id="tooltip" display="none">...</div>
}

const allColors = ["#2255BB","#2299BB","#4499BB","#6699BB","#2255DD","#2299DD","#3399CC","#9999CC"];
    
function makeGroup(aWork,arrValues,names,xcenter,ycenter,radius,width,step,start) {
    radius-=width;
    var toggle=0;
    const circumference = radius * 2 * Math.PI;
    let base=start / step * circumference;
    let begin=start;
    var index=0;
    arrValues.forEach(value=>{
        const arc = (circumference * value) / step;
        const dash = `${arc} ${circumference}`;   
        const angle=2*Math.PI*begin/step;
        const xstart=0;Math.cos(angle)*radius;
        const ystart=0;Math.sin(angle)*radius;
        aWork.push({ transform: `rotate(${base}, ${xcenter}, ${ycenter})`, 
                    xcenter:xcenter, ycenter:ycenter, 
                    xstart:xstart+xcenter+radius,ystart:ystart+ycenter,
                    radius:radius,                     
                    dash:dash, text:names[index++],
                    width:width+toggle, color:toggle==0?cArcBlue:cSkyBlue});
        base+=(value / step)*radius*4;      
        begin+=value;  
        toggle=5-toggle;
    });
    return radius-5;
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

