import { useState } from 'react'

const Fetching = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 rotate" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
  </svg>
)

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
    drafts.map((d, i) => (
      <div key={i} className="card bg-base-100 shadow-xl m-2">
        <div className="card-body">
            <div className="m-auto text-left">
              <span className="text-xl">{d.name}</span>
              <div className="divider" />
              <ul>
                {d.items.map((item, idx) => <li key={idx}>{item.title}</li>)}
              </ul>
            </div>
        </div>
      </div>
    ))
  )
}

export default Drafts
