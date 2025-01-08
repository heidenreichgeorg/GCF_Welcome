import { useEffect, useState } from 'react';
import { getSession, useSession, REACT_APP_API_HOST } from '../modules/sessionmanager';
import Screen from './Screen'

export default function Schedule() {
        
    const {session, status } = useSession()
    
    const [year,   setYear]    = useState()
    const [client, setClient]  = useState()
    const [partner,setPartner] = useState(false);
    
    const [today, onChange] = useState(new Date());

    useEffect(() => {
        if(status !== 'success') return;

        setYear(session.year);
        setClient(session.client);
        setPartner(session.partner);
    }, [status])

    function book(e,p) {
        console.log("BOOK "+e+":{"+p+"}");
    }

    // <div className="FIELD"><input key="auth" id="auth" type="edit"></input></div>

    const monat = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"]

    function isLeapYear(year) {
        return (year%4==0) && ((year%100==0) ? (year%400==0) : true )
    }
    function getDaysInMonth(year, month) {
        if (month === 1) { // Februar
            return isLeapYear(year) ? 29 : 28;
        }
        return [31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 30, 31][month % 12];
    }

    let dayOfWeek=0;
    try {
        dayOfWeek = parseInt(today.getDay());
    } catch(e) {}

    let dayOfMonth=0;
    try {
        dayOfMonth = parseInt(today.getDate());
    } catch(e) {}

    let iYear=0;
    try {
        iYear = parseInt(today.getFullYear());
    } catch(e) {}

    let wochentag=["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
    let row=[]
    let cls=[]
    let dat=[]

    let iMonth=today.getMonth();


    var offset = dayOfWeek-dayOfMonth+1;

    var cOffset=offset;
    var cMonth = iMonth;
    var cMonthLen=1+getDaysInMonth(iYear,cMonth);

    for(let count=1;count<103;count++) {
        if((count+offset)>=cMonthLen) {
            cMonth++;
            offset-=cMonthLen-1;            
            cMonthLen=1+getDaysInMonth(iYear,cMonth);  
        }
        row.push( (count+offset)>0   ? ((""+ (count+offset)+".")+monat[cMonth%12].substring(0,3)) : "-" )
        cls.push( (count+cOffset>=dayOfMonth) ?  "key" : " " )
        dat.push( (count+cOffset>=dayOfMonth) ?  ""+year+"-"+((cMonth%12)+1)+"-"+(count+offset) : "0-0-0-0" )
    }
    
    return (<Screen tabSelector={[]} tabName={[]} aFunc={[]} aText={[]}>
         <div className = "mTable">
            <div className = "attrLine">                
                <div className="FIELD NAME">&nbsp;{dayOfMonth}&nbsp;{monat[iMonth]}&nbsp;{iYear}</div>
                <div className="FIELD SNAM">&nbsp;{partner}&nbsp;{year}&nbsp;;{client}</div>
                <div className="FIELD SNAM">&nbsp;{cOffset}</div>
            </div>        
            <div className = "attrLine">                
                <div className="FIELD DATE">&nbsp;</div>
            </div>
            <div className = "attrLine">                
                <div className="FIELD DATE">&nbsp;Sonntag&nbsp;</div>
                <div className="FIELD DATE">&nbsp;Montag &nbsp;</div>
                <div className="FIELD DATE">&nbsp;Dienstag&nbsp;</div>
                <div className="FIELD DATE">&nbsp;Mittwoch&nbsp;</div>
                <div className="FIELD DATE">&nbsp;Donnerstag&nbsp;</div>
                <div className="FIELD DATE">&nbsp;Freitag&nbsp;</div>
                <div className="FIELD DATE">&nbsp;Samstag&nbsp;</div>
            </div>        
            <div className = "attrLine">                
                <div className="FIELD DATE">&nbsp;</div>
            </div>
            <div className = "attrLine">                
                { [1,2,3,4,5,6,7].map((i) => ( 
                    <div className="FIELD DATE" onClick={()=>{book(dat[i],partner)}}><div className={cls[i]}>&nbsp;{row[i]}&nbsp;</div></div>
                )) }
            </div>        

            <div className = "attrLine">                
                <div className="FIELD DATE">&nbsp;</div>
            </div>
            <div className = "attrLine">                
                { [8,9,10,11,12,13,14].map((i) => ( 
                    <div className="FIELD DATE" onClick={()=>{book(dat[i],partner)}}><div className={cls[i]}>&nbsp;{row[i]}&nbsp;</div></div>
                )) }
            </div>     

            <div className = "attrLine">                
                <div className="FIELD DATE">&nbsp;</div>
            </div>
            <div className = "attrLine">                
                { [15,16,17,18,19,20,21].map((i) => ( 
                    <div className="FIELD DATE" onClick={()=>{book(dat[i],partner)}}><div className={cls[i]}>&nbsp;{row[i]}&nbsp;</div></div>
                )) }
            </div>        

            <div className = "attrLine">                
                <div className="FIELD DATE">&nbsp;</div>
            </div>
            <div className = "attrLine">                
                { [22,23,24,25,26,27,28].map((i) => ( 
                    <div className="FIELD DATE" onClick={()=>{book(dat[i],partner)}}><div className={cls[i]}>&nbsp;{row[i]}&nbsp;</div></div>
                )) }
            </div>        

            <div className = "attrLine">                
                <div className="FIELD DATE">&nbsp;</div>
            </div>
            <div className = "attrLine">                
                { [29,30,31,32,33,34,35].map((i) => ( 
                    <div className="FIELD DATE" onClick={()=>{book(dat[i],partner)}}><div className={cls[i]}>&nbsp;{row[i]}&nbsp;</div></div>
                )) }
            </div>                       

            <div className = "attrLine">                
                <div className="FIELD DATE">&nbsp;</div>
            </div>
            <div className = "attrLine">                
                { [36,37,38,39,40,41,42].map((i) => ( 
                    <div className="FIELD DATE" onClick={()=>{book(dat[i],partner)}}><div className={cls[i]}>&nbsp;{row[i]}&nbsp;</div></div>
                )) }
            </div>                       

            <div className = "attrLine">                
                <div className="FIELD DATE">&nbsp;</div>
            </div>
            <div className = "attrLine">                
                { [43,44,45,46,47,48,49].map((i) => ( 
                    <div className="FIELD DATE" onClick={()=>{book(dat[i],partner)}}><div className={cls[i]}>&nbsp;{row[i]}&nbsp;</div></div>
                )) }
            </div>                       

            <div className = "attrLine">                
                <div className="FIELD DATE">&nbsp;</div>
            </div>
            <div className = "attrLine">                
                { [50,51,52,53,54,55,56].map((i) => ( 
                    <div className="FIELD DATE" onClick={()=>{book(dat[i],partner)}}><div className={cls[i]}>&nbsp;{row[i]}&nbsp;</div></div>
                )) }
            </div>                     

            <div className = "attrLine">                
                <div className="FIELD DATE">&nbsp;</div>
            </div>
            <div className = "attrLine">                
                { [57,58,59,60,61,62,63].map((i) => ( 
                    <div className="FIELD DATE" onClick={()=>{book(dat[i],partner)}}><div className={cls[i]}>&nbsp;{row[i]}&nbsp;</div></div>
                )) }
            </div>                       

            <div className = "attrLine">                
                <div className="FIELD DATE">&nbsp;</div>
            </div>
            <div className = "attrLine">                
                { [64,65,66,67,68,69,70].map((i) => ( 
                    <div className="FIELD DATE" onClick={()=>{book(dat[i],partner)}}><div className={cls[i]}>&nbsp;{row[i]}&nbsp;</div></div>
                )) }
            </div>                       

            <div className = "attrLine">                
                <div className="FIELD DATE">&nbsp;</div>
            </div>
            <div className = "attrLine">                
                {  [71,72,73,74,75,76,77].map((i) => ( 
                    <div className="FIELD DATE" onClick={()=>{book(dat[i],partner)}}><div className={cls[i]}>&nbsp;{row[i]}&nbsp;</div></div>
                )) }
            </div>                       

            <div className = "attrLine">                
                <div className="FIELD DATE">&nbsp;</div>
            </div>
            <div className = "attrLine">                
                { [78,79,80,81,82,83,84].map((i) => ( 
                    <div className="FIELD DATE" onClick={()=>{book(dat[i],partner)}}><div className={cls[i]}>&nbsp;{row[i]}&nbsp;</div></div>
                )) }
            </div>     

            <div className = "attrLine">                
                <div className="FIELD DATE">&nbsp;</div>
            </div>
            <div className = "attrLine">                
                { [85,86,87,88,89,100,101].map((i) => ( 
                    <div className="FIELD DATE" onClick={()=>{book(dat[i],partner)}}><div className={cls[i]}>&nbsp;{row[i]}&nbsp;</div></div>
                )) }
            </div>        

                    </div>        
        </Screen>)
}

 
