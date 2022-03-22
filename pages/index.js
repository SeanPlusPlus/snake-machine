import Link from 'next/link'
import { useContext } from 'react'
import { GlobalContext } from '../context/GlobalState'
import Layout from '../components/layout'
import Drafts from '../components/drafts'

const Fetching = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 rotate" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
  </svg>
)

const Home = () => {
  const { user } = useContext(GlobalContext)
  const { fetching, username, authenticated } = user;

  if (authenticated === null) {
    return (
      <Layout>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body w-[360px] h-[120px]" />
        </div>

      </Layout>
    )
  }

  if (authenticated === false) {
    return (
      <Layout>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body w-[360px] h-[120px]">
            <Link href="/login">
              <a className="btn btn-outline">Login</a>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {username && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body w-[360px]">
              <div className="m-auto">
                <Drafts />
              </div>
            </div>
        </div>
      )}
      {fetching && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body w-[360px] h-[120px]">
              <div className="m-auto">
                <Fetching />
              </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Home
