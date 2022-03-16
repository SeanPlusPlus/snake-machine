import { GlobalProvider } from '../context/GlobalState';
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <GlobalProvider>
      <Component {...pageProps} />
    </GlobalProvider>
  )
}

export default MyApp
