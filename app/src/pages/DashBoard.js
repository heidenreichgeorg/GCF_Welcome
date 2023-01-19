/* global BigInt */


import { useEffect, useState  } from 'react';
import Screen from '../pages/Screen'
import { useSession } from '../modules/sessionmanager';
import { makeStatusData }  from '../modules/App';

import Gauge from '../components/Gauge'


export default function DashBoard({value}) {
    const { session, status } = useSession()   
    const [ sheet,  setSheet] = useState(null)
    useEffect(() => {
        if(status !== 'success') return;
        let state = null;
        try { state=JSON.parse(sessionStorage.getItem('session')); } catch(err) {}
        if(state && Object.keys(state).length>5) {
            setSheet(state.generated);
        }
    }, [status])

    if(!sheet) return null; //'Loading...';

    function prevFunc() {console.log("CLICK PREVIOUS"); window.location.href="https://"+session.server.addr+":3000/balance?client="+session.client+"&year="+session.year; }
    function nextFunc() {  console.log("CLICK NEXT");   window.location.href="https://"+session.server.addr+":3000/fixedAssets?client="+session.client+"&year="+session.year; }
    

    let sheet_status = makeStatusData(sheet);
    let report = sheet_status.report;

    let ass = sheet_status.ass;
    let fix = sheet_status.fix;
    let tan = sheet_status.tan;

    let eql = sheet_status.ass;
    let eqt = sheet_status.equity;

    let gls = sheet_status.gls;

    console.dir("ass="+ass+"   fix="+fix);
//            <Gauge percent={parseInt((100n*BigInt(fix))/BigInt(eqt))} radius={90} strDim={"fix/eqt"} color={"#33CCCC"}/> 

    return (
        <Screen prevFunc={prevFunc} nextFunc={nextFunc} >

           
            <Gauge percent={parseInt((100n*BigInt(fix))/BigInt(ass))} radius={90} strDim={"%fixed"}  color={"#0020FF"}/>
            <Gauge percent={parseInt((100n*BigInt(tan))/BigInt(fix))} radius={90} strDim={"tan/fix"}  color={"#333344"}/>
            <Gauge percent={parseInt((100n*BigInt(gls))/BigInt(ass))} radius={90} strDim={"%gain"}  color={"#22CC22"}/>
            <Gauge percent={parseInt((100n*BigInt(eqt))/BigInt(ass))} radius={90} strDim={"%equity"} color={"#EE3311"}/> 
 

            
        </Screen>
        )
/*
<div id="ins1_wrapper">
                <svg id="ins1_meter">
                    <circle id="ins1_outline_curves" className="circle outline" cx="50%" cy="50%"></circle>                    
                    <circle id="ins1_low" className="circle range" cx="50%" cy="50%" stroke="#FDE47F"></circle>                    
                    <circle id="ins1_avg" className="circle range" cx="50%" cy="50%" stroke="#7CCCE5"></circle>                    
                    <circle id="ins1_high" className="circle range" cx="50%" cy="50%" stroke="#E04644"></circle>                    
                    <circle id="ins1_mask" className="circle" cx="50%" cy="50%" ></circle>                    
                    <circle id="ins1_outline_ends" className="circle outline"
                    cx="50%" cy="50%"></circle>
                </svg>
                <img id="ins1_meter_needle" src="gauge-needle.svg" alt=""></img>
                <input id="ins1_slider" type="range" min="0" max="100" defaultValue="0" />
                <label id="ins1_lbl" value="id" htmlFor="">0</label>
            </div>
        // slider
    function init() {
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