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
          <div className="card-body w-[340px] h-[175px]">
            <div className="pb-3">Build snake drafts for anything</div>
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
        <>
          <h1 className="text-3xl text-left bottom-2 border-b-2 border-sky-500 flex">
            Leagues
            <Link href="/league/create">
              <a className="badge badge-secondary badge-lg gap-2 mt-2 ml-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </a>
            </Link>
          </h1>
          <div className="card bg-base-100 shadow-xl mt-4">
            <div className="card-body w-[340px]">
              <Drafts />
            </div>
          </div>
        </>
      )}
      {fetching && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body w-[340px] h-[120px]">
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
