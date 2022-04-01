import Layout from "../../components/layout"

const LeagueCreate = () => {
  return (
    <Layout>
      <div className="w-[340px]">
        <h1 className="text-4xl text-left bottom-2 border-b-2 border-sky-500">New League</h1>
        <div className="form pt-5">
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">League Name</span>
            </label>
            <input type="text" className="input input-bordered w-full max-w-xs" />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default LeagueCreate
