import { useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { GlobalContext } from '../context/GlobalState'
import Fetching from './fetching'

const Selection = () => {
  const [submitting, setSubmitting] = useState(null)
  const {
    selection,
    setSelection,
    setLeague,
  } = useContext(GlobalContext)

  const handleClose = () => {
    setSelection(null)
  }

  const router = useRouter()
  const { id } = router.query

  const handleSubmit = async () => {
    setSubmitting(true)
 
    const options = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: selection })
    }
    const res = await fetch(`/api/leagues/${id}`, options)
    const json = await res.json()
    setLeague(json.league)
    setSubmitting(false)
    setSelection(null) 
  }
  
  return (
    <div className={`modal ${selection && 'modal-open'}`}>
      <div className="modal-box">
        <h3 className="font-bold text-2xl flex">
          Confirm Selection 
        </h3>
        <p className="pt-3 text-left flex">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="ml-1">
            <code className="font-semibold">{selection}</code>
          </span>
        </p>
        <div className="modal-action pt-5 h-[74px]">
          {submitting ? (
              <div className="border-2 rounded-md pl-8 pr-8 pt-2 pb-1">
                <Fetching />
              </div>
          ) : (
            <>
              <label htmlFor="my-modal" className="btn" onClick={handleClose}>Cancel</label>
              <label htmlFor="my-modal" className="btn btn-outline btn-info" onClick={handleSubmit}>Submit</label>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Selection
