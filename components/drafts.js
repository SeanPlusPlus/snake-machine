import { useEffect, useContext } from 'react'
import Link from 'next/link'
import { GlobalContext } from '../context/GlobalState'
import Fetching from './fetching'

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
    <>
      <h3 className="text-4xl text-left">My Drafts</h3>
      <div className="divider mb-0" />
      {drafts.length === 0 && (<p>No drafts yet</p>)}
      <ul className="list-disc text-left text-xl">
        {drafts.map((d, i) => (
          <li key={i} className="pt-4">
            <Link href={`/draft/${d.id}`}>
              <a className="link link-secondary">
                {d.name}
              </a>
            </Link>
            <ul className="list-disc text-left ml-4 text-sm">
              {d.items.map((item, idx) => (
                <li key={idx} className="pt-1">
                  {item.name}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  )
}

export default Drafts
