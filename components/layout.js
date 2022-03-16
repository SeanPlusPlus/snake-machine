import Head from 'next/head'
import Nav from './nav'

const Layout = (props) => (
  <div className="min-h-screen grid-bg">
    <Head>
      <title>Snake Machine</title>
    </Head>

    <Nav />

    <main className="flex text-center">
      <div className="m-auto">{props.children}</div>
    </main>

  </div>
)

export default Layout
