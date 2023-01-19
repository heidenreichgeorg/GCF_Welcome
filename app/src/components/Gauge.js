import React from "react";

export default function Gauge ({ percent = 0, radius, strDim, color }) {
    const strokeWidth = radius * 0.2;
    const innerRadius = radius - strokeWidth;
    const circumference = innerRadius * 2 * Math.PI;
    const arc = circumference * 0.75;
    const dashArray = `${arc} ${circumference}`;
    const transform = `rotate(135, ${radius}, ${radius})`;
    const offset = arc - (percent / 100) * arc;
    return (
        <svg height={radius*2} width={radius*2} >
            <lineargradient id="grad" x1="0" y1="0" x2="1" y2="1"></lineargradient>
            <stop offset="15%" stopColor="#1267ff" stopOpacity="1"></stop>
            <stop offset="85%" stopColor="#98c0ff" stopOpacity="1"></stop>
            <text x={radius*0.85} y={2*radius-20}>{strDim}</text>
            <text x={radius*0.70} y={radius+10} font-size={48} class={"caption"}>{percent}</text>
            <circle
                className="gauge_base"
                cx={radius}
                cy={radius}
                fill="transparent"
                r={innerRadius}
                stroke="gray"
                strokeDasharray={dashArray}
                strokeLinecap="round"
                strokeWidth={strokeWidth}
                transform={transform}
            />
            <circle
                className="gauge_percent"
                cx={radius}
                cy={radius}
                fill="transparent"
                r={innerRadius}
                stroke={color} //url(#grad)"
                strokeDasharray={dashArray}
                strokeDashoffset={offset}
                strokeLinecap="round"
                strokeWidth={strokeWidth}
                style={{ transition: "stroke-dashoffset 0.3s" }}
                transform={transform}
            />
        </svg>
    );
}   




