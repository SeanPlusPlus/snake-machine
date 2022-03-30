import { useEffect, useContext } from 'react'
import Link from 'next/link'
import { GlobalContext } from '../context/GlobalState'
import Fetching from './fetching'

const Drafts = () => {
  const { user: {username}, drafts, setDrafts } = useContext(GlobalContext)

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
      {drafts.length === 0 && (
        <p className="mt-3 text-2xl">No drafts yet</p>
      )}
      <ul className="list-disc text-left text-xl">
        {drafts.map((d, i) => (
          <li key={i} className="pt-1 pb-1">
            <Link href={`/leagues/${d.league.id}`}>
              <a className="link link-secondary">
                {d.league.name}
              </a>
            </Link>
            <ul className="list-disc text-left ml-4 text-sm">
              {d.league.picks[username] && d.league.picks[username].items.map((item, idx) => (
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
