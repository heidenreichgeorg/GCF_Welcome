import { createContext, useContext, useEffect, useState } from "react";

const SessionContext = createContext()

export function useSession() {
    return useContext(SessionContext)
}
export function SessionProvider({ children,  location, default_value, onLoading, onError, server }) {

    const [session, setSession] = useState(default_value)

    const [status, setStatus] = useState('loading')

    let strSearch = location.search;
    console.log("SessionProvider location="+JSON.stringify(location))
    console.log("SessionProvider server="+JSON.stringify(server));
    //console.log("SessionProvider process="+process.env.REACT_APP_API_HOST);

    useEffect(() => {
        
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
            fetch(`${process.env.REACT_APP_API_HOST}/SESSION${strSearch}`,  
            {mode:'cors'}) // CORS 20230114
            .then(data => data.json())
            .then(data => {
                let len=0;
                setSession(data);
                sessionStorage.setItem('session',JSON.stringify(data));
                //console.log("*   WARM       "+(data && data.sheetCells && (len=data.sheetCells.length)>2)?(data.sheetCells[len-1].join(" ")):".");
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