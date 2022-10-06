import { createContext, useContext, useEffect, useState } from "react";

const SessionContext = createContext()

export function useSession() {
    return useContext(SessionContext)
}

export function SessionProvider({ children, createSession=true, default_value, onLoading, onError }) {

    const [session, setSession] = useState(default_value)

    const [status, setStatus] = useState('loading')

    useEffect(() => {
        if(createSession) {
            setStatus('loading')
            fetch(`${process.env.REACT_APP_API_HOST}/SESSION`)
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