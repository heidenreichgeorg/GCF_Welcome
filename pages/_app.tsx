import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { SessionProvider } from '../modules/sessionmanager'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  return <>
    <SessionProvider
        onLoading={'Loading session...'}
        location={ router.query }
        >
      <Component {...pageProps} />
    </SessionProvider>
  </>
}
