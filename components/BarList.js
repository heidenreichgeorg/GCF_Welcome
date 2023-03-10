import React from "react";

export default function BarList({partners, legend}) {
    const strokeWidth = 10;
    const innerRadius = 20;
    const circumference = innerRadius * 2 * Math.PI;
    const arc = circumference * 0.75;
    const dashArray = `${arc} ${circumference}`;
    
 // x in 40 170
 // y in 5 101
    return (
        <svg id="ins1_meter" width="180" height="160">

            {partners.map((jPartner,index) => (                
                 <g key={legend+"group"+index}>
                    <line x1= {40+20*index} y1={ 5} x2={ 40+20*index} y2={110-jPartner[0]-jPartner[1]-jPartner[2]} stroke="#777777"
                        strokeDasharray={dashArray} strokeLinecap="round" strokeWidth={strokeWidth} key={legend+"line0"+index}/>

                    <line x1= {40+20*index} y1={110} x2={ 40+20*index} y2={110-jPartner[0]} stroke="#EE1111"
                        strokeDasharray={dashArray}  strokeWidth={strokeWidth}  key={legend+"line1"+index}/>

                    <line x1= {40+20*index} y1={  110-jPartner[0]} x2={ 40+20*index} y2={110-jPartner[0]-jPartner[1]} stroke="#EEEE11"
                        strokeDasharray={dashArray} strokeWidth={strokeWidth}  key={legend+"line2"+index}/>

                    <line x1= {40+20*index} y1={  110-jPartner[0]-jPartner[1]} x2={ 40+20*index} y2={110-jPartner[0]-jPartner[1]-jPartner[2]} stroke="#11EE11"
                        strokeDasharray={dashArray} strokeWidth={strokeWidth}  key={legend+"line2"+index}/>
                </g>                
            ))}
            <text x="90" y="140" text-anchor="middle"><tspan>{legend}</tspan></text>
        </svg>    
            
    );
}