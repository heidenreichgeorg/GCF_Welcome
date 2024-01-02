import React from "react";

export default function Slider({value, legend}) {
    const strokeWidth = 10;
    const innerRadius = 20;
    const circumference = innerRadius * 2 * Math.PI;
    const arc = circumference * 0.75;
    const dashArray = `${arc} ${circumference}`;
    
    value = ""+value;
    let iValue = parseInt(value.substring(0,1));

    return (
                <svg id="ins1_meter" width="180" height="160">
                    <line x1={40} y1={  5} x2={170} y2={  5} stroke={iValue>9 ? "#FF8F40" : "#777777"}
                        strokeDasharray={dashArray} strokeLinecap="round" strokeWidth={strokeWidth} />
                    <line x1={40} y1={ 17} x2={170} y2={ 17} stroke={iValue>8 ? "#FF8F40" : "#777777"}
                        strokeDasharray={dashArray} strokeLinecap="round" strokeWidth={strokeWidth} />
                    <line x1={40} y1={ 29} x2={170} y2={ 29} stroke={iValue>7 ? "#FF8F40" : "#777777"}
                        strokeDasharray={dashArray} strokeLinecap="round" strokeWidth={strokeWidth} />
                    <line x1={40} y1={ 41} x2={170} y2={ 41} stroke={iValue>6 ? "#FF8F40" : "#777777"}
                        strokeDasharray={dashArray} strokeLinecap="round" strokeWidth={strokeWidth} />
                    <line x1={40} y1={ 53} x2={170} y2={ 53} stroke={iValue>5 ? "#FF8F40" : "#777777"}
                        strokeDasharray={dashArray} strokeLinecap="round" strokeWidth={strokeWidth} />
                    <line x1={40} y1={ 65} x2={170} y2={ 65} stroke={iValue>4 ? "#FF8F40" : "#777777"}
                        strokeDasharray={dashArray} strokeLinecap="round" strokeWidth={strokeWidth} />
                    <line x1={40} y1={ 77} x2={170} y2={ 77} stroke={iValue>3 ? "#FF8F40" : "#777777"}
                        strokeDasharray={dashArray} strokeLinecap="round" strokeWidth={strokeWidth} />
                    <line x1={40} y1={ 89} x2={170} y2={ 89} stroke={iValue>2 ? "#FF8F40" : "#777777"}
                        strokeDasharray={dashArray} strokeLinecap="round" strokeWidth={strokeWidth} />
                    <line x1={40} y1={101} x2={170} y2={101} stroke={iValue>1 ? "#FF8F40" : "#777777"}
                        strokeDasharray={dashArray} strokeLinecap="round" strokeWidth={strokeWidth} />
                    <line x1={40} y1={113} x2={170} y2={113} stroke={iValue>0 ? "#FF8F40" : "#777777"}
                        strokeDasharray={dashArray} strokeLinecap="round" strokeWidth={strokeWidth} />

                    <text x="90" y="140" text-anchor="middle"><tspan>{legend}</tspan></text>
                </svg>    
            
    );
        // slider

}