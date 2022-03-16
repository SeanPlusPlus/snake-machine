import Header from './header'
import Nav from './nav'

const Layout = (props) => (
  <div className="min-h-screen grid-bg">
    <Header />
    <Nav />

    <main className="flex text-center">
      <div className="m-auto">{props.children}</div>
    </main>

  </div>
)

export default Layout
