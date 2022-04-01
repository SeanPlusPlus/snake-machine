import { useState } from 'react'
import Layout from "../../components/layout"

const LeagueCreate = () => {
  const [values, setValues] = useState({
    league_name: '',
    draft_order: '',
    items: '',
  })
  
  const handleLeagueName = (e) => {
    e.persist()
    setValues((values) => ({
      ...values,
      league_name: e.target.value,
    }))
  }

  const handleDraftOrder = (e) => {
    e.persist()
    setValues((values) => ({
      ...values,
      draft_order: e.target.value,
    }))
  }

  const handleItems = (e) => {
    e.persist()
    setValues((values) => ({
      ...values,
      items: e.target.value,
    }))
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(values)
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
              <span className="label-text">Draft Order</span>
            </label>
            <textarea name="draft_order" value={values.draft_order} onChange={handleDraftOrder} className="textarea textarea-bordered" spellCheck="false"></textarea>
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
