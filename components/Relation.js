import React from "react";

export default function Relation({scale, left, right, legend}) {
    const strokeWidth = 10;
    const palette = ["33","77","BB","FF","11","55","99","DD","22","66","AA","EE","44","88"];
    
    let iLeft = parseInt(left);
    let iScale =parseInt(scale);
    let iRight =parseInt(right);

    let color=parseInt((50*(iLeft+iRight))/iScale);
    let lText = (""+(100*iLeft)/iScale).substring(0,3)+"%";
    let rText = (""+(100*iRight)/iScale).substring(0,3)+"%";

    var colArray=[];
    for(let i=0;i<100;i++) {
        let r=i%11;
        let g=(i+3)%5;
        let b=(i+7)%14;
        colArray.push("#"+palette[r]+palette[g]+palette[b]);
    }

    return (
                <svg id="ins1_relation" width={160} height="180">
                    <line x1={20} y1={140-(120*iLeft)/iScale} x2={150} y2={140-(120*iRight)/iScale}
                        stroke={colArray[color]} strokeLinecap="round" strokeWidth={strokeWidth} />
                    <text x={ 20} y="15" text-anchor="middle"><tspan>{lText}</tspan></text>
                    <text x={ 80} y="160" text-anchor="middle"><tspan>{legend}</tspan></text>
                    <text x={150} y="15" text-anchor="middle"><tspan>{""+rText}</tspan></text>
                </svg>    
            
    );
}
    