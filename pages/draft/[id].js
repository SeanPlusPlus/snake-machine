import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import { useUser } from '../../lib/hooks'
import { GlobalContext } from '../../context/GlobalState'
import Header from '../../components/header'
import Layout from '../../components/layout'

const Draft = () => {
  const { user: {authenticated} } = useContext(GlobalContext)
  const user = useUser()
  const username = user && user.username
  
  const router = useRouter()
  const { id } = router.query
  const path = router.asPath

  if (authenticated === null) {
    <div className="min-h-screen grid-bg">
      <Header />
      <main className="flex text-center">
        <div className="m-auto">
          <div className="card bg-base-100 shadow-xl mt-20">
            <div className="card-body w-[360px] h-[120px]">
            </div>
          </div>
        </div>
      </main>
    </div>
  }

  if (authenticated === false) {
    return (
      <div className="min-h-screen grid-bg">
        <Header />
        <main className="flex text-center">
          <div className="m-auto">
            <div className="card bg-base-100 shadow-xl mt-20">
              <div className="card-body w-[360px] h-[120px]">
                <Link href={`/login?path=${path}`}>
                  <a className="btn btn-outline">Login</a>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    username ? (
      <Layout>
        <h1>Draft: {id}</h1>
      </Layout>
    ) : (
      <></>
    )
  )
}

export default Draft
