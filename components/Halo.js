import React from "react";
import { bigEUMoney } from "../modules/money.mjs";


const cSkyBlue  ="#77CCEE";
const cArcBlue  ="#66AADD";
const cScaleBlue="#5588CC";
const cDarkBlue ="#223388";
const cTextBlue ="#9944CC";


// JSON of named features each feature is an array with 
export default function Halo (args) {
    const radius = args.radius;

    console.log("HALO jFeatures   "+JSON.stringify(args.jFeatures));
    console.log("HALO arrPartners "+JSON.stringify(args.arrPartners));

    let step=1000; if (args.step && args.step>0) step=args.step;

    const lineRadius = radius-10;
    const outerRadius = radius+3;
    const xcenter=args.x;
    const ycenter=args.y;

    let jFeatures = {}
    let jNames = {}

    let aWork = [];
    const strokeWidth = 5;
    var featureRad = radius-strokeWidth;


    let aScales=[];
    if(args.jFeatures) {
        Object.keys(args.jFeatures).forEach(title=>
            {
                jFeatures[title] = args.jFeatures[title].map((value)=>parseInt(""+(bigEUMoney(value)/2000000n)))
                jNames[title]=args.arrPartners.map((_,i)=>((args.arrPartners[i])[title]));
            })    
    } else {
        makeScales(aScales,aWork,130,11,xcenter,ycenter,radius); // left outer ring
        makeScales(aScales,aWork,310,11,xcenter,ycenter,radius); // right outer ring
    }
    
    var featureBegin=0;
    Object.keys(jFeatures).forEach(title=>
    {
        featureBegin=makeGroup(aWork, jFeatures[title], jNames[title], xcenter,ycenter, featureRad, strokeWidth, step, featureBegin);        
    })


    // aWork,aScales are the output of the make operations

    return (
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
            
            {
            aWork.map((jTask,i)=>(
            (
                <g key={"gCircle"+i} fill={cTextBlue} >
                    <circle
                        key={"circle"+i} 
                        className="gauge_base"
                        cx={jTask.xcenter}
                        cy={jTask.ycenter}                
                        r={jTask.radius}
                        stroke={jTask.color}
                        strokeDasharray={jTask.dash}
                        strokeWidth={jTask.width}
                        transform={jTask.arctransform}
                        fill="transparent"
                    /> 
                    <text x={jTask.xTip} y={jTask.yTip} font-size="4" transform={jTask.txttransform}>{jTask.text}</text>
                </g>                   
            )))
            }



            
        </g>
        
        

    );
    // <div id="tooltip" display="none">...</div>
}

const allColors = ["#2255BB","#2299BB","#4499BB","#6699BB","#2255DD","#2299DD","#3399CC","#9999CC"];
    
function makeGroup(aWork,arrValues,names,xcenter,ycenter,radius,width,step,start) {
    let pos=start;
    radius-=width;
    var shift=0;
    const circumference = radius * 2 * Math.PI;
    let base=(pos * circumference) / step;
    var index=0;
    arrValues.forEach(value=>{
        const absValue = Math.abs(value);
        const arc = (circumference * absValue) / step;
        shift++;        
        let toggle=(shift%2);
        if(arc) {
            const dash = `${arc} ${circumference}`;   
            const angle=2*Math.PI*pos/step;
            const degrees=360*pos/step;
            const xTip=xcenter+((shift%3)+6)+(Math.cos(angle)*radius)-7;
            const yTip=ycenter-((shift%3)-6)+(Math.sin(angle)*radius)-3;
            aWork.push({
                        arctransform: `rotate(${degrees}, ${xcenter}, ${ycenter})`, 
                        xcenter:xcenter, ycenter:ycenter, 
                        xTip:xTip,yTip:yTip,
                        radius:radius,                     
                        dash:dash, 
                        text:names[index],
                        //txttransform: `rotate(${-degrees}, ${0}, ${0})`, 
                        //txttransform: `rotate(${degrees}, ${xcenter}, ${ycenter})`, 
                        // ,rotate(${-degrees}, ${xTip}, ${yTip})
                        width:width+toggle*5, 
                        color:toggle==0?cArcBlue:cSkyBlue});
                        
                
        }
        
        index++;
        pos+=absValue;  
        base=(pos *circumference) / step;      
        toggle=5-toggle;
    });
    return pos;
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

