import Head from 'next/head'
import Header from './header'

const Layout = (props) => (
  <div className="min-h-screen grid-bg">
    <Head>
      <title>Snake Machine</title>
    </Head>

    <Header />

    <main className="flex text-center">
      <div className="m-auto">{props.children}</div>
    </main>

  </div>
)

export default Layout
