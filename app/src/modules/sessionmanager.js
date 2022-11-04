import { createContext, useContext, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider, useParams } from 'react-router-dom'

const SessionContext = createContext()

export function useSession() {
    return useContext(SessionContext)
}

export function SessionProvider({ children, createSession=true, location, default_value, onLoading, onError }) {

    const [session, setSession] = useState(default_value)

    const [status, setStatus] = useState('loading')

    //const [ strSearch, setStrSearch ] = useState();

    let strSearch = location.search;
    console.log("SessionProvider location="+strSearch)


    useEffect(() => {
        if(createSession) {
            setStatus('loading')
            fetch(`${process.env.REACT_APP_API_HOST}/SESSION${strSearch}`)
            .then(data => data.json())
            .then(data => {
                setSession(data)
                setStatus('success')
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