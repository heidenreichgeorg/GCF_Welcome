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
                        <line x1={20+14*i} y1={140} x2={20+14*i} y2={(140-140*parseInt(jValue[key])/max)} stroke={colArray[i] }
                            strokeDasharray={dashArray} strokeLinecap="round" strokeWidth={strokeWidth} />
                    ))}

                    <text x={10+7*num} y="160" text-anchor="middle"><tspan>{legend}</tspan></text>
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