import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import { useUser } from '../../lib/hooks'
import { GlobalContext } from '../../context/GlobalState'
import Header from '../../components/header'
import Layout from '../../components/layout'
import Warning from '../../components/warning'

const Draft = () => {
  const { user: {authenticated} } = useContext(GlobalContext)
  const user = useUser()
  const username = user && user.username

  const [warning, setWarning] = useState(null)
  const [draft, setDraft] = useState(null)
  
  const router = useRouter()
  const { id } = router.query
  const path = router.asPath

  async function getDraft() {
    const res = await fetch(`/api/drafts?id=${id}`)
    const json = await res.json()
    if (res.status === 403) {
      throw new Error(json.message)
    } else {
      return json
    }
  }

  useEffect(() => {
    if (username) {
      getDraft().then((data) => {
        setDraft(data.draft)
      }).catch((e) => {
        console.log(e.message);
        setWarning(e.message)
      })
    }
  }, [username]);

  if (warning) {
    return (
      <Layout>
        <Warning message={warning} />
      </Layout>
    )
  }

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
          <>
            <h1 className="text-4xl text-left bottom-2 border-b-2 border-indigo-500">{draft.name}</h1>
            <div className="card bg-base-100 shadow-xl mt-4">
              <div className="card-body w-[360px]">
                <h4 className="text-2xl text-left">My Draft</h4>
                <div className="divider mb-0 mt-1" />
                <ul className="list-disc text-left text-md">
                  {draft.items.map((item, idx) => (
                    <li key={idx} className="pt-1">
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </Layout>
    ) : (
      <></>
    )
  )
}

export default Draft
