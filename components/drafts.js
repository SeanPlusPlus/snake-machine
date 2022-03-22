import { useContext, useState } from 'react'
import { GlobalContext } from '../context/GlobalState'

const Drafts = () => {
  const [ drafts, setDrafts ] = useState([])
  const { user } = useContext(GlobalContext)
  const { username, fetching, authenticated } = user

  async function getDrafts() {
    const res = await fetch('/api/draft')
    const json = await res.json()
    return json
  }

  getDrafts().then((data) => {
    setDrafts(data.drafts)
  })

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
