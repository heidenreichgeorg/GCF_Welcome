import { useRouter } from 'next/router'
// PUT REAL IP ADDR or DNS NAME OF BACKEND INTO .env file

import { ParsedUrlQuery,stringify } from "querystring";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import { currentHash } from './session.js'

type Session = { }

export const REACT_APP_API_HOST="http://192.168.178.28:3000/api"

const SessionContext = createContext<Session>({})

export function useSession() {
    return useContext(SessionContext)
}



export function SessionProvider({ children,  default_value, onLoading, onError }:
     { children: ReactNode, default_value?:Session, onLoading?: string, onError?: string }) {

    const [session, setSession] = useState(default_value)

    const [status, setStatus] = useState('loading')

    const router = useRouter()

  
    async function startTimer() {
        for (;1>0;) {
            let symTime = currentHash();
            console.log(symTime+"   Hash="+symTime);
            await delay(80000);
        }
    }
    
  
    
    function delay(delay: number) {
      return new Promise(r => {
          setTimeout(r, delay);
      })
    }
  

    
    let symTime = currentHash();
    console.log("0000 "+symTime+"   Hash  "+symTime);
    console.log("0001 Sessionprovider "+stringify(router.query));
    let strSearch = router.asPath.split('?')[1];
    console.log("0002 SessionProvider host="+REACT_APP_API_HOST);
    console.log("0003 SessionProvider query="+strSearch)

    useEffect(() => {      
        startTimer();
        setStatus('loading')
        let browserItem = sessionStorage.getItem('session');
        if(browserItem!=null && browserItem.length>256) {
            try {
                let len=0;
                let data = JSON.parse(browserItem);
                setSession(data);               
                //console.log("*   COLD      "+(data && data.sheetCells && (len=data.sheetCells.length)>2)?(data.sheetCells[len-1].join(" ")):".");
                setStatus('success');
            }
            catch(err) {
                setStatus('error')
            }
        } else { 

            // PUT REAL IP ADDR or DNS NAME OF BACKEND INTO .env file
            //fetch(`${process.env.REACT_APP_API_HOST}/SESSION${strSearch}`,  
            fetch(`${REACT_APP_API_HOST}/SESSION?${strSearch}`,  
            {mode:'cors'}) // CORS 20230114
            .then(data => data.json())
            .then(data => {
                let len=0;
                setSession(data);
                sessionStorage.setItem('session',JSON.stringify(data));
                console.log("*   WARM       "+(data && data.sheetCells && (len=data.sheetCells.length)>2)?(data.sheetCells[len-1].join(" ")):".");
                setStatus('success');
            })
            .catch(() => {
                setStatus('error')
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