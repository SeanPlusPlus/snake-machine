import { useState } from 'react'
import Layout from "../../components/layout"

const LeagueCreate = () => {
  const [values, setValues] = useState({
    league_name: '',
    members: '',
    items: '',
  })
  
  const handleLeagueName = (e) => {
    e.persist()
    setValues((values) => ({
      ...values,
      league_name: e.target.value,
    }))
  }

  const handleMembers = (e) => {
    e.persist()
    setValues((values) => ({
      ...values,
      members: e.target.value,
    }))
  }

  const handleItems = (e) => {
    e.persist()
    setValues((values) => ({
      ...values,
      items: e.target.value,
    }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    const { league_name, members, items } = values
    const league = {
      name: league_name,
      members: members.split('\n'),
      items: items.split('\n'),
    }
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ league })
    }
    const res = await fetch(`/api/league/create`, options)
    const json = await res.json()
    console.log('*', json);
  }

  return (
    <Layout>
      <div className="w-[340px]">
        <h1 className="text-4xl text-left bottom-2 border-b-2 border-sky-500">New League</h1>
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
    </Layout>
  )
}

export default LeagueCreate
