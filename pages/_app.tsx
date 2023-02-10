
import '@/styles/index.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { SessionProvider } from '../modules/sessionmanager'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  return (
  <div id="windowBorder" className="dosBorder">
    <SessionProvider onLoading={'Loading session...'} >
      <Component {...pageProps} />
    </SessionProvider>
  </div>)
}
