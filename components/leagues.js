import { useEffect, useContext } from 'react'
import Link from 'next/link'
import { GlobalContext } from '../context/GlobalState'
import Fetching from './fetching'

const Leagues = () => {
  const { leagues, setLeagues } = useContext(GlobalContext)

  async function getLeagues() {
    const res = await fetch('/api/leagues')
    const json = await res.json()
    return json
  }

  useEffect(() => {
    getLeagues().then((data) => {
      setLeagues(data.leagues)
    })
  }, []);


  if (leagues.length === 0) {
    return (
      <Fetching />
    )
  }

  return (
    <>
      <h3 className="text-4xl text-left">Upcoming</h3>
      <div className="divider mb-0" />
      <ul className="list-disc text-left text-xl">
        {leagues.map((d, i) => (
          <li key={i} className="pt-4">
            <Link href={`/league/${d.id}`}>
              <a className="link link-secondary">
                {d.name}
              </a>
            </Link>
            <ul className="list-disc text-left ml-4 text-sm">
              {d.members && d.members.map((m, idx) => (
                <li key={idx} className="pt-1">
                  {m.name}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  )
}

export default Leagues
