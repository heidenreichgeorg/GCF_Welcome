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
    
/*
<div id="ins1_wrapper">        
<svg id="ins1_meter">
                <input id="ins1_slider" type="range" min="0" max="100" defaultValue={parseInt(value)} />
                <label id="ins1_lbl" value="id" >{legend}</label>

                <circle id="ins1_outline_curves" className="circle outline" cx="50%" cy="50%"></circle>                    
                    <circle id="ins1_low" className="circle range" cx="50%" cy="50%" stroke="#FDE47F"></circle>                    
                    <circle id="ins1_avg" className="circle range" cx="50%" cy="50%" stroke="#7CCCE5"></circle>                    
                    <circle id="ins1_high" className="circle range" cx="50%" cy="50%" stroke="#E04644"></circle>                    
                    <circle id="ins1_mask" className="circle" cx="50%" cy="50%" ></circle>                    
                    <circle id="ins1_outline_ends" className="circle outline"
                    cx="50%" cy="50%"></circle>
                </svg>
                <img id="ins1_meter_needle" src="gauge-needle.svg" alt=""></img>
<div id="ins1_wrapper">        

    function show(value) {
        var r = 250;
        var circles = document.querySelectorAll('.circle');
        var total_circles = circles.length;
        for (var i = 0; i < total_circles; i++) {
            circles[i].setAttribute('r', r);
        }
        
        // Set meter's wrapper dimension 
        var meter_dimension = (r * 2) + 100;
        var wrapper = document.querySelector("#ins1_wrapper");
        if(wrapper) {
            wrapper.style.width = meter_dimension + "";
            wrapper.style.height = meter_dimension + "";
            
            // Add strokes to circles  
            var cf = 2 * Math.PI * r;
            var semi_cf = cf / 2;
            var semi_cf_1by3 = semi_cf / 3;
            var semi_cf_2by3 = semi_cf_1by3 * 2;
            document.querySelector("#ins1_outline_curves").setAttribute("stroke-dasharray", semi_cf + "," + cf);
            document.querySelector("#ins1_low").setAttribute("stroke-dasharray", semi_cf + "," + cf);
            document.querySelector("#ins1_avg").setAttribute("stroke-dasharray", semi_cf_2by3 + "," + cf);
            document.querySelector("#ins1_high").setAttribute("stroke-dasharray", semi_cf_1by3 + "," + cf);
            document.querySelector("#ins1_outline_ends").setAttribute("stroke-dasharray", 2 + "," + (semi_cf - 2));
            document.querySelector("#ins1_mask").setAttribute("stroke-dasharray", semi_cf + "," + cf);
            
            // Bind range slider event
            var slider = document.querySelector("#ins1_slider");
            var lbl = document.querySelector("#ins1_lbl");
            var mask = document.querySelector("#ins1_mask");
            var meter_needle =  document.querySelector("#ins1_meter_needle");
            
            function range_change_event() {
                var percent = slider.value;
                var meter_value = semi_cf - ((percent * semi_cf) / 100);
                mask.setAttribute("stroke-dasharray", meter_value + "," + cf);
                meter_needle.style.transform = "rotate(" + 
                    (270 + ((percent * 180) / 100)) + "deg)";
                lbl.textContent = percent + "%";
            }
            slider.addEventListener("input", range_change_event);
        } else console.dir("wrapper is null!");
    }                
*/
}