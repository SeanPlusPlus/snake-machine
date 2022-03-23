import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import { useUser } from '../../lib/hooks'
import { GlobalContext } from '../../context/GlobalState'
import Header from '../../components/header'
import Layout from '../../components/layout'

const Draft = () => {
  const { user: {authenticated} } = useContext(GlobalContext)
  const user = useUser()
  const username = user && user.username

  const [draft, setDraft] = useState(null)
  
  const router = useRouter()
  const { id } = router.query
  const path = router.asPath

  async function getDraft() {
    const res = await fetch(`/api/draft?id=${id}`)
    const json = await res.json()
    return json
  }

  useEffect(() => {
    if (username) {
      getDraft().then((data) => {
        setDraft(data.draft)
      }).catch((e) => console.log(e))
    }
  }, [username]);

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
        {draft && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body w-[360px]">
              <h3 className="text-4xl text-left">My Draft: {draft.name}</h3>
              <div className="divider mb-0" />
              <ul className="list-disc text-left text-xl">
                {draft.items.map((item, idx) => (
                  <li key={idx} className="pt-1">
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Layout>
    ) : (
      <></>
    )
  )
}

export default Draft
