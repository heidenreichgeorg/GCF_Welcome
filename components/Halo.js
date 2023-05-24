import React from "react";
import { bigEUMoney } from "../modules/money.mjs";


const iDark =0;
const iSky = 1;
const iArc = 2;
const iScale=3;
const iText =4;

// from Coolors.co
const cPalette =[ "#8ECAE6","#219EBC","#023047","#FFB703","#FB8500" ];

function c(i) { return (i<cPalette.length&&i>=0)? cPalette[i]: cPalette[0];}


// JSON of named features each feature is an array with 
export default function Halo (args) {


    const radius = args.radius;

    console.log("HALO jFeatures   "+JSON.stringify(args.jFeatures));
    console.log("HALO arrPartners "+JSON.stringify(args.arrPartners));

    //let step=1000; if (args.step && args.step>0) step=args.step;
    


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

    
    var computeBegin=0;
    Object.keys(jFeatures).forEach(title=>
        {
            computeBegin=computeGroup( jFeatures[title], computeBegin);        
        })
    let step = Math.floor((computeBegin*11+10)/100)*10;
    console.log( "HALO ends at "+computeBegin+" with  step="+step);
    


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
                            stroke={c(iArc)}
                            strokeWidth={1}
                            />
                    )))                
                )}
            
            {
            aWork.map((jTask,i)=>(
            (
                <g key={"gCircle"+i} fill={c(iText)} >
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
}

    
function computeGroup(arrValues,start) {
    let pos=start;
    arrValues.forEach(value=>{   pos+= Math.abs(value);  });
    return pos;
}

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
            const xTip=xcenter+(Math.cos(angle))*(radius+5);
            const yTip=ycenter+(Math.sin(angle))*(radius+5);
            aWork.push({
                        arctransform: `rotate(${degrees}, ${xcenter}, ${ycenter})`, 
                        xcenter:xcenter, ycenter:ycenter, 
                        xTip:xTip,yTip:yTip,
                        radius:radius,                     
                        dash:dash, 
                        text:names[index],
                        width:width+toggle*5, 
                        color:toggle==0?c(iArc):c(iSky)});
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
                    radius:radius, dash:dash, width:strokeWidth, color:c(iScale)});
}

