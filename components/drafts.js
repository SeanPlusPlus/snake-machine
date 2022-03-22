import { useContext } from 'react'
import { GlobalContext } from '../context/GlobalState'

const Drafts = () => {
  const { user } = useContext(GlobalContext)
  const { username, fetching, authenticated } = user
  const drafts = [
    {
      name: 'foo'
    },
    {
      name: 'bar'
    }
  ]

  return (
    <div>
      {drafts.map((d, i) => (
        <div key={i} className="card bg-base-100 shadow-xl m-2">
          <div className="card-body">
              <div className="m-auto">
                {d.name}
              </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Drafts
