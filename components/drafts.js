import { useState } from 'react'
import Fetching from './fetching'

const Drafts = () => {
  const [ drafts, setDrafts ] = useState([])

  async function getDrafts() {
    const res = await fetch('/api/draft')
    const json = await res.json()
    return json
  }

  getDrafts().then((data) => {
    setDrafts(data.drafts)
  })

  if (drafts.length === 0) {
    return (
      <Fetching />
    )
  }

  return (
    <>
      <h3 className="text-4xl text-left">My Drafts</h3>
      <div className="divider mb-0" />
      <ul className="list-disc text-left text-xl">
        {drafts.map((d, i) => (
          <li key={i} className="pt-3">
            <a href="/" className="link link-secondary">
              {d.name}
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}

export default Drafts
