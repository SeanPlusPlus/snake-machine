import { useState } from 'react'
import _shuffle from 'lodash/shuffle'
import Layout from "../../components/layout"
import Fetching from '../../components/fetching'
import Warning from '../../components/warning'

const LeagueCreate = () => {
  const [ submitting, setSubmitting ] = useState(null)
  const [ warning, setWarning ] = useState(null)
  const [ league, setLeague ] = useState({})
  const [ rand, setRand ] = useState(false)
  const [ modal, setModal ] = useState('')
  const [ values, setValues ] = useState({
    league_name: '',
    members: '',
    items: '',
  })

  const handleCancel = () => {
    setModal('')
  }
  
  const handleLeagueName = (e) => {
    setWarning(false)
    setValues((values) => ({
      ...values,
      league_name: e.target.value,
    }))
  }

  const handleMembers = (e) => {
    setWarning(false)
    setValues((values) => ({
      ...values,
      members: e.target.value,
    }))
  }

  const handleItems = (e) => {
    setWarning(false)
    setValues((values) => ({
      ...values,
      items: e.target.value,
    }))
  }

  const randomize = () => {
    setLeague({
      ...league,
      members: _shuffle(league.members)
    })
    setRand(true)
  }
  
  const handleSubmit = async (e) => {
    setWarning(false)
    e.preventDefault()
    const { league_name, members, items } = values
    setLeague({
      name: league_name,
      members: members ? members.split('\n') : null,
      items: items ? items.split('\n') : null,
    })
    setModal('modal-open')
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    setRand(false)
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(league)
    }
    const res = await fetch(`/api/league/create`, options)
    const json = await res.json()
    
    if (res.status !== 200) {
      setSubmitting(false)
      setWarning(json.message)
      setModal('')
      return
    } else { // success
      console.log('*', json);
    }
  }

  return (
    <Layout>
      <div className="w-[340px]">
        <h1 className="text-4xl text-left bottom-2 border-b-2 border-sky-500">New League</h1>
        {warning && (
          <div className="mt-4">
            <Warning message={warning} />
          </div>
        )}
        <div className="form">

          <div className="form-control w-full max-w-xs pt-7">
            <label className="label">
              <span className="label-text">League Name</span>
            </label>
            <input name="league_name" value={values.league_name} onChange={handleLeagueName} type="text" className="input input-bordered w-full max-w-xs" spellCheck="false" autoComplete="off" />
          </div>

          <div className="form-control w-full max-w-xs pt-7">
            <label className="label">
              <span className="label-text">Members</span>
            </label>
            <textarea name="draft_order" value={values.members} onChange={handleMembers} className="textarea textarea-bordered" spellCheck="false"></textarea>
            <label className="label">
              <span className="label-text-alt">Separate each username with a newline</span>
            </label>
          </div>

          <div className="form-control w-full max-w-xs pt-7">
            <label className="label">
              <span className="label-text">Items to draft</span>
            </label>
            <textarea name="items" value={values.items} onChange={handleItems} className="textarea textarea-bordered" spellCheck="false"></textarea>
            <label className="label">
              <span className="label-text-alt">Separate each item with a newline</span>
            </label>
          </div>

          <button onClick={handleSubmit} className="btn btn-info shadow-lg mb-6 w-[340px] mt-7">
            Submit
          </button>

        </div>
      </div>

      <div className={`modal ${modal}`}>
        <div className="modal-box">
          <h3 className="font-bold text-2xl flex border-sky-500 border-b-2">
            {league.name}
          </h3>
  
          <div className="text-left pt-4">
            <span className="text-lg">
              Draft Order
            </span>
            <ul className="pl-4">
              {league.members && league.members.map((m) => (
                <li key={m} className="list-decimal text-sm">
                  {m}
                </li>
              ))}
            </ul>

            {!rand && league.members && (
              <div
                className="mt-1 link text-sky-500 hover:cursor-pointer hover:text-sky-600 flex text-md"
                onClick={randomize}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="pl-1">
                  Randomize
                </span>
              </div>
            )}

          </div>

          <div className="text-left pt-7">
            <span className="text-lg">
              Draft Items
            </span>
            <ul className="pl-4">
              {league.items && league.items.map((i) => (
                <li key={i} className="list-disc text-sm">
                  {i}
                </li>
              ))}
            </ul>
          </div>

          <div className="modal-action pt-5">
            {submitting ? (
              <div className="border-2 rounded-md pl-8 pr-8 pt-2 pb-1">
                <Fetching />
              </div>
            ) : (
              <>
                <label htmlFor="my-modal" className="btn" onClick={handleCancel}>Cancel</label>
                <label htmlFor="my-modal" className="btn btn-secondary" onClick={handleConfirm}>Confirm</label>
              </>
            )}
          </div>
        </div>
      </div>

    </Layout>
  )
}

export default LeagueCreate
