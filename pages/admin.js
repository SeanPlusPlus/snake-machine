import { useEffect, useContext } from 'react'
import Link from 'next/link'
import { GlobalContext } from '../context/GlobalState'
import Layout from '../components/layout'
import Fetching from '../components/fetching'

const Drafts = () => {
  const { drafts, setDrafts } = useContext(GlobalContext)

  async function getDrafts() {
    const res = await fetch('/api/drafts')
    const json = await res.json()
    return json
  }

  useEffect(() => {
    getDrafts().then((data) => {
      setDrafts(data.drafts)
    })
  }, []);

  if (drafts === null) {
    return (
      <Fetching />
    )
  }

  return (
    <Layout>
      <h1 className="text-4xl text-left bottom-2 border-b-2 border-indigo-500">
        Admin
      </h1>
      <div className="card bg-base-100 shadow-xl mt-4 w-[340px]">
        <div className="card-body">
          <h4 className="text-2xl text-left">
            <Link href="/">
              <a className="link link-secondary">
                Leagues
              </a>
            </Link>
          </h4>
        </div>
      </div>
      <div className="card bg-base-100 shadow-xl mt-4 w-[340px]">
        <div className="card-body">
          <h4 className="text-2xl text-left">
            <Link href="/">
              <a className="link link-secondary">
                Users
              </a>
            </Link>
          </h4>
        </div>
      </div>
    </Layout>
  )
}

export default Drafts
