import Link from 'next/link'
import Header from '../../components/header'
import { useRouter } from 'next/router'
import { useUser } from '../../lib/hooks'
import Layout from '../../components/layout'

const Draft = () => {
  const user = useUser()
  const username = user && user.username
  
  const router = useRouter()
  const { id } = router.query
  const path = router.asPath

  if (!username) {
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
    <Layout>
      <h1>Draft: {id}</h1>
    </Layout>
  )
}

export default Draft
