import React from "react";

export default function Chart({jValue, legend}) {
    const strokeWidth = 10;
    const innerRadius = 20;
    const circumference = innerRadius * 2 * Math.PI;
    const arc = circumference * 0.75;
    const dashArray = `${arc} ${circumference}`;
    const palette = ["33","77","BB","FF","11","55","99","DD","22","66","AA","EE","44","88"]
    let max = 0;
    let valueKeys = Object.keys(jValue);

    var colArray=[];
    
    valueKeys.map(function(key,i) { let val=parseInt(jValue[key]); 
                                    if(val>max) max=val;
                                    let r=i%11;
                                    let g=(i+3)%5;
                                    let b=(i+7)%14;
                                    colArray.push("#"+palette[r]+palette[g]+palette[b])
                    });
    var num = colArray.length;
    return (
                <svg id="ins1_chart" width={20+14*num} height="180">
                    {valueKeys.map((key,i) =>
                    (
                        <line key={"Chart0"+i} x1={20+14*i} y1={140} x2={20+14*i} y2={(140-140*parseInt(jValue[key])/max)} stroke={colArray[i] }
                        strokeDasharray={dashArray} 
                            strokeLinecap="round" strokeWidth={strokeWidth} />
                    ))}

                    <text x={10+7*num} y="160" text-anchor="middle"><tspan>{legend}</tspan></text>
                </svg>    
            
    );
        // slider
    

}