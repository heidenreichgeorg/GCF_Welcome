import { useRouter } from 'next/router'
// PUT REAL IP ADDR or DNS NAME OF BACKEND INTO .env file

import { ParsedUrlQuery,stringify } from "querystring";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type Session = { }

export const REACT_APP_API_HOST="/api"

const SessionContext = createContext<Session>({})

const SX_SESSION = 'session';
const SX_CARRYOVER = 'carryOver';

export function useSession() {
    return useContext(SessionContext)
}

export function getSession() {
    let state = null;
    let strSession=sessionStorage.getItem(SX_SESSION);
    if(strSession) try { state=JSON.parse(strSession); } catch(err) {}
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
            sessionStorage.setItem(SX_CARRYOVER,strCarryOver);
            console.log("sessionStorage.setItem('carryOver',"+strCarryOver+")");
        }
        catch(e) {}
    }
}

export function getCarryOver() {
    let strCarryOver = sessionStorage.getItem(SX_CARRYOVER);
    let jCarryOver={};
    if(strCarryOver) try { 
        jCarryOver=JSON.parse(strCarryOver);
        console.log("sessionStorage.getItem('carryOver')="+JSON.stringify(jCarryOver));
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
    console.log("0001 Sessionprovider "+stringify(router.query)+"  host="+REACT_APP_API_HOST+"  query="+strSearch);


    useEffect(() => {      

        setStatus('loading')
        let browserItem = sessionStorage.getItem(SX_SESSION);
        if(browserItem!=null && browserItem.length>256) {
            try {
                let len=0;
                let data = JSON.parse(browserItem);
                setSession(data);               

                setStatus('success');

                console.log("0002 Sessionprovider WARM SUCCESS");
            }
            catch(err) {
                setStatus('error')
                console.log("0003 Sessionprovider WARM ERROR");
            }
        } else { 

            // PUT REAL IP ADDR or DNS NAME OF BACKEND INTO .env file
            fetch(`${REACT_APP_API_HOST}/SESSION?${strSearch}`,  
            {mode:'cors'}) // CORS 20230114
            .then(data => data.json())
            .then(data => {
                let len=0;
                setSession(data);
                sessionStorage.setItem(SX_SESSION,JSON.stringify(data));
                console.log("COLD data.sheetCells.length="+data.sheetCells.length);
                setStatus('success');

                console.log("0004 Sessionprovider COLD SUCCESS");
            })
            .catch(() => {
                setStatus('error')
                console.log("0003 Sessionprovider COLD ERROR");
            })
        }
    
    }, [])

    return (
        <SessionContext.Provider
            value={{
                session,
                status
            }}
        >
            {onLoading && status === 'loading'
                ? onLoading
            : onError && status === 'error'
                ? onError
                : children
            }

        </SessionContext.Provider>
    )
}