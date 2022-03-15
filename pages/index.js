import Link from 'next/link'
import { useUser } from '../lib/hooks'
import Layout from '../components/layout'

const Home = () => {
  const user = useUser()

  return (
    <Layout>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {user ? (
            <pre className="text-left text-xs">{JSON.stringify(user, null, 2)}</pre>
          ) : (
            <Link href="/login">
              <a className="btn btn-outline w-[300px]">Login</a>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Home
