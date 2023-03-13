import React from "react";

export default function BarList({partners, legend}) {
    const strokeWidth = 10;
    const innerRadius = 20;
    const circumference = innerRadius * 2 * Math.PI;
    const arc = circumference * 0.75;
    const dashArray = `${arc} ${circumference}`;
    

    let top=128;
 // x in 40 170
 // y in 5 101
    return (
        <svg id="ins1_meter" width="180" height="160">

            {partners.map((jPartner,index) => (                
                 <g key={legend+"group"+index}>
                    <line x1= {40+20*index} y1={top-jPartner[0]-jPartner[1]-jPartner[2]} x2={ 40+20*index} y2={top-jPartner[0]-jPartner[1]-jPartner[2]-jPartner[3]} stroke="#1111EE"
                        strokeDasharray={dashArray} strokeWidth={strokeWidth} key={legend+index+"line0"+index}/>
                
                    <line x1= {40+20*index} y1={  top-jPartner[0]-jPartner[1]} x2={ 40+20*index} y2={top-jPartner[0]-jPartner[1]-jPartner[2]} stroke="#11EE11"
                        strokeDasharray={dashArray} strokeWidth={strokeWidth}  key={legend+index+"line3"+index}/>

                    <line x1= {40+20*index} y1={  top-jPartner[0]} x2={ 40+20*index} y2={top-jPartner[0]-jPartner[1]} stroke="#EEEE11"
                        strokeDasharray={dashArray} strokeWidth={strokeWidth}  key={legend+index+"line2"+index}/>

                    <line x1= {40+20*index} y1={top} x2={ 40+20*index} y2={top-jPartner[0]} stroke="#EE1111"
                        strokeDasharray={dashArray}  strokeWidth={strokeWidth}  key={legend+index+"line1"+index}/>

                </g>                
            ))}
            <text x="90" y="140" text-anchor="middle"><tspan>{legend}</tspan></text>
        </svg>    
            
    );
}