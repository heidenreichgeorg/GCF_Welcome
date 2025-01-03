import { useRouter } from 'next/router'
// PUT REAL IP ADDR or DNS NAME OF BACKEND INTO .env file

import { ParsedUrlQuery,stringify } from "querystring";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";


type Session = { }

export const REACT_APP_API_HOST="/api"

const SessionContext = createContext<Session>({})

const SX_SESSION = 'session';
const LX_CARRYOVER = 'carryOver';

export function useSession() {
    return useContext(SessionContext)
}

export function getSession() {
    let state:JSON = JSON.parse('{}');
    let strSession=sessionStorage.getItem(SX_SESSION);
    //console.log("getSession = "strSession)
    if(strSession) try { state=JSON.parse(strSession); } catch(err) {}
    var sessionKeys:string[]=Object.keys(state);
    console.log("7020 getSession = "+sessionKeys);
    
    return state;
}

export function resetSession() {
    // invalidate current session
    sessionStorage.setItem(SX_SESSION,"");
}

export function storeCarryOver(jCarryOver:string) {
    if(jCarryOver) {
        try { 
            let strCarryOver = JSON.stringify(jCarryOver);
            localStorage.setItem(LX_CARRYOVER,strCarryOver);
            console.log("7040 localStorage.setItem('carryOver',"+strCarryOver+")");
        }
        catch(e) {}
    }
}

export function getCarryOver() {
    let strCarryOver = localStorage.getItem(LX_CARRYOVER);
    let jCarryOver={};
    if(strCarryOver) try { 
        jCarryOver=JSON.parse(strCarryOver);
        console.log("7060 localStorage.getItem('carryOver')="+JSON.stringify(jCarryOver));
    }
    catch(e) {}
    return jCarryOver;
}

export function SessionProvider({ children,  default_value, onLoading, onError }:
     { children: ReactNode, default_value?:Session, onLoading?: string, onError?: string }) {

    const [session, setSession] = useState(default_value)

    const [status, setStatus] = useState('loading')

    const router = useRouter()

    
    let strSearch = router.asPath.split('?')[1];
    console.log("\n7001 SessionProvider "+stringify(router.query)+"  host="+REACT_APP_API_HOST+"  query="+strSearch+" argv="+process.argv);


    useEffect(() => {      

        setStatus('loading')
        let browserItem = sessionStorage.getItem(SX_SESSION);
        /*if(browserItem!=null && browserItem.length>256) GH20240104
        {
            try {
                let len=0;
                let data = JSON.parse(browserItem);
                setSession(data);               

                setStatus('success');

                console.log("7002 SessionProvider WARM SUCCESS");

            }
            catch(err) {
                setStatus('error')
                console.log("7003 SessionProvider WARM ERROR");
            }
        } else { GH20240104 */

            // PUT REAL IP ADDR or DNS NAME OF BACKEND INTO .env file
            fetch(`${REACT_APP_API_HOST}/SESSION?${strSearch}`,  
            {mode:'cors'}) // CORS 20230114
            .then(data => data.json())
            .then(data => {
                let len=0;                
                setSession(data);
                sessionStorage.setItem(SX_SESSION,JSON.stringify(data));
                console.log("COLD data.root="+data.root+"  data.sheetCells.length="+data.sheetCells.length);
                setStatus('success');

                console.log("7004 SessionProvider COLD SUCCESS");

            })
            .catch((e) => {
                console.log("7005 SessionProvider COLD ERROR ");
                setStatus('error')
                console.log("7007 SessionProvider COLD ERROR "+e.toString());
            })
        // 20240104 }
    
    }, [])

    console.log("7006 sessionmanager.SessionProvider returns session and status");


    return (
        <SessionContext.Provider
            value={{
                session,
                status
            }}
        >
            
            {onLoading && status === 'loading'
                ? (
                
                    <div className="mTable">
                        {onLoading}
                    </div>
                
                )
            : onError && status === 'error'
                ? onError
                : children
            }
            

        </SessionContext.Provider>
    )
}