import React from "react";

export default function Halo (aFeatures) {

    const radius = 100;
    const max = 360000;


    const logMax = Math.floor(Math.log10(max)-2);
    let step = 1; for(let i=0;i<logMax;i++) step=10*step;
    console.log("max= "+max+"   logMax="+logMax+" and step is "+step);


    //{ percent = 0, radius, strDim, color }
    const strokeWidth = 3;
    const lineRadius = radius-10;
    const outerRadius = radius + strokeWidth;
    const xcenter=outerRadius;
    const ycenter=outerRadius;


    let aWork = [];
    makeGroup(aWork,[10,20,30,40,50,60,70],xcenter,ycenter,radius-15,step,  0)
    makeGroup(aWork,[10,20,30,40,50,60,70],xcenter,ycenter,radius-25,step, 40)
    makeGroup(aWork,[10,20,30,40,50,60,70],xcenter,ycenter,radius-35,step,300)



    let aScales=[];
    makeScales(aScales,aWork,130,xcenter,ycenter,radius);
    makeScales(aScales,aWork,310,xcenter,ycenter,radius);


    return (
        <svg height={20+outerRadius*2} width={20+outerRadius*2} >
            
            // payload values
            {
            aWork.map((jTask)=>(
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



            // scales
            {
                
                aScales.map((scale)=>(
                     scale.jTask.map((j)=>
                    (
                        <line
                            x1={xcenter+(lineRadius*Math.cos(j*Math.PI/180))} 
                            y1={ycenter+(lineRadius*Math.sin(j*Math.PI/180))} 
                            x2={xcenter+(radius*Math.cos(j*Math.PI/180))} 
                            y2={ycenter+(radius*Math.sin(j*Math.PI/180))} 
                            stroke="#6699CC"
                            strokeWidth={1}
                            />
                    )))                
                )}
            
            // horizontal coordinate axis
            {
                 <line
                 x1={-10} 
                 y1={ycenter} 
                 x2={2*xcenter+10} 
                 y2={ycenter} 
                 stroke="#6699CC"
                 strokeWidth={1}
                 />
            }

            // vertical coordinate axis
            {
                 <line
                 x1={xcenter} 
                 y1={-10} 
                 x2={xcenter} 
                 y2={2*ycenter+10} 
                 stroke="#6699CC"
                 strokeWidth={1}
                 />
            }
        </svg>
    );
}


function makeGroup(aWork,arrValues,xcenter,ycenter,radius,step,start) {
    const circumference = radius * 2 * Math.PI;
    let base=start / step * circumference;
    arrValues.forEach(value=>{
        const arc = (circumference * value) / step;
        const dash = `${arc} ${circumference}`;   
        console.log("ARC   base="+base+" dash "+dash);
        aWork.push({ transform: `rotate(${base}, ${xcenter}, ${ycenter})`, 
                    xcenter:xcenter, ycenter:ycenter, 
                    radius:radius, 
                    dash:dash, 
                    width:5, color:"#77AADD"});
        base+=((value / step) * circumference);        
    });
}

function makeScales(aScales,aWork,begin,xcenter,ycenter,radius) {
    let angles=[];
    for(let i=0;i<=10;i++) angles.push((begin+i*10)%360);
    aScales.push({jTask:angles});
    const strokeWidth=1;
    const innerRadius = radius - 1;
    const circumference = innerRadius * 2 * Math.PI;
    const arc = circumference * 0.281; // 100 degrees = 11 dashes
    const dash = `${arc} ${circumference}`;    
    aWork.push({ transform: `rotate(${begin}, ${xcenter}, ${ycenter})`, 
                    xcenter:xcenter, ycenter:ycenter, 
                    radius:radius, dash:dash, width:strokeWidth, color:"#6699CC"});
}
