import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import { useUser } from '../../lib/hooks'
import { GlobalContext } from '../../context/GlobalState'
import { useInterval } from '../../utils/useInterval'
import Header from '../../components/header'
import Layout from '../../components/layout'
import Warning from '../../components/warning'
import Selection from '../../components/selection'
import Fetching from '../../components/fetching'

const myPick = (draft_order, current_pick, username) => {
  return draft_order[current_pick.draft_order_idx].username === username
}

const currentPick = (status, draft_order, current_pick, username) => {
  if (status === 'closed') {
    return false
  }
 
  return draft_order[current_pick.draft_order_idx].username === username
}

const League = () => {
  const {
    user: {
      authenticated
    },
    league,
    opponents,
    setLeague,
    setSelection,
    setOpponents,
  } = useContext(GlobalContext)

  const user = useUser()
  const username = user && user.username

  const [warning, setWarning] = useState(null)
  const [adminModal, setAdminModal] = useState(null)
  
  const router = useRouter()
  const { id } = router.query
  const path = router.asPath

  async function getLeague() {
    const res = await fetch(`/api/leagues/${id}`)
    const json = await res.json()
    if (res.status !== 200) {
      throw new Error(json.message)
    } else {
      return json
    }
  }

  useEffect(() => {
    if (username) {
      getLeague().then((data) => {
        setLeague(data.league)
        setOpponents({names: data.league.picks})
      }).catch((e) => {
        setWarning(e.message)
      })
    }
  }, [username]);

  useInterval(() => {
    if (!username) {
      return
    } else {
      getLeague().then((data) => {
        const server = data.league.items.filter((i) => i.drafted).length
        const client = league.items.filter((i) => i.drafted).length
        if (server !== client) {
          setLeague(data.league)
          setOpponents({picks: data.league.picks})
        }

        const actual_status = data.league.status
        const local_status = league.status
        if (actual_status !== local_status) {
          setLeague(data.league)
          setOpponents({picks: data.league.picks})
        }
      })
    }
  }, 1000 * 3);

  const handleChange = async (e) => {
    e.preventDefault()
    setSelection(e.target.name)
  }

  const handleDraftExpand = (e) => {
    e.preventDefault()
    const name = e.target.name
    const opponent = opponents[name] || { draft: {display: false }}
    const display = !opponent.draft.display

    setOpponents({name: e.target.name, display, picks: league.picks})
  }

  const handleAdminModal = () => {
    setAdminModal('modal-open')
  }

  const handleAdminModalCancel = () => {
    setAdminModal('')
  }

  const handleCloseDraft = async () => {
    const options = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ closed: true })
    }
    const res = await fetch(`/api/leagues/${id}`, options)
    const json = await res.json()
    setLeague(json.league)
    setAdminModal('')
  }

  if (warning) {
    return (
      <Layout>
        <Warning message={warning} />
      </Layout>
    )
  }

  if (authenticated === null) {
    <div className="min-h-screen grid-bg">
      <Header />
      <main className="flex text-center">
        <div className="m-auto">
          <div className="card bg-base-100 shadow-xl mt-20">
            <div className="card-body w-[360px] h-[120px]">
            </div>
          </div>
        </div>
      </main>
    </div>
  }

  if (authenticated === false) {
    return (
      <div className="min-h-screen grid-bg">
        <Header />
        <main className="flex text-center">
          <div className="m-auto">
            <div className="card bg-base-100 shadow-xl mt-20">
              <div className="card-body w-[360px] h-[120px]">
                <Link href={`/login?path=${path}`}>
                  <a className="btn btn-outline">Login</a>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    username ? (
      <Layout>
        {!league && <Fetching />}

        {league && (
          <>
            <h1 className="text-3xl text-left bottom-2 border-b-2 border-sky-500 flex">
              <div>
                {league.name}
              </div>
              {league.admin.username === username && (league.status === 'open') && (
                <div>
                  <svg onClick={handleAdminModal} xmlns="http://www.w3.org/2000/svg" className="mt-2 ml-2 h-6 w-6 hover:text-sky-500 hover:cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              )}
              {myPick(league.draft_order, league.current_pick, username) && (!league.status === 'closed') && (
                <div className="badge badge-warning badge-lg gap-2 mt-2 ml-auto">
                  Your Pick
                </div>
              )}
            </h1>

            <div className="w-[340px] lg:grid lg:grid-cols-3 lg:gap-3 lg:w-[1000px]">
 
            <div className="card bg-base-100 shadow-xl mt-4">
              <div className="card-body">
                <h4 className="text-2xl text-left">My Picks</h4>
                <div className="divider mb-0 mt-1" />
                <ul className="list-disc text-left text-md">
                  {league.picks[username] && league.picks[username].items.map((item, idx) => (
                    <li key={idx} className="pt-1">
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl mt-4">
              <div className="card-body">
                <h4 className="text-2xl text-left flex">
                  <div className="title">
                    Items
                  </div>
                </h4>
                <div className="divider mb-0 mt-1" />
                <div className="form-control">
                  <ul className="list-disc text-left text-md">
                    {league.items.map((item, idx) => (
                      <li
                        key={idx}
                        className={`pt-1 list-none ${myPick(league.draft_order, league.current_pick, username) && !item.drafted && 'hover:bg-sky-700 lg:hover:rounded-md'}`}
                      >
                        <label
                          className={`label h-[30px] pt-1 pb-2 ${myPick(league.draft_order, league.current_pick, username) && !item.drafted && 'cursor-pointer'}`}
                        >
                          <span className={`text-sm ${item.drafted && 'line-through'}`}>
                            {item.name}
                          </span> 
                          {!item.drafted && myPick(league.draft_order, league.current_pick, username) && (
                            <input
                              name={item.name}
                              onChange={handleChange}
                              type="checkbox"
                              checked={item.drafted ? 'checked' : ''}
                              className="checkbox"
                            />
                          )}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl mt-4">
              <div className="card-body">
                <h4 className="text-2xl text-left">
                  Draft 
                </h4>
                <div className="divider mb-0 mt-1" />
                <ul className="list-disc text-left text-md">
                  {league.draft_order.map((user, idx) => (
                    <li
                      key={idx}
                      className={`pt-1 ${currentPick(league.status, league.draft_order, league.current_pick, user.username) ? 'list-disc' : 'list-none'}`}
                    >
                      {league.status === 'open' && (
                        <span className="pr-1">
                          {idx + 1}.
                        </span>
                      )}
                      <span>
                        <span>
                          <a className="link text-sky-500 no-underline" onClick={handleDraftExpand} name={user.username}>
                            {user.username}
                          </a>
                        </span>
                        <ul>
                          {opponents[user.username] && opponents[user.username].draft.display && (
                            opponents[user.username].draft.items.map((i) => (
                              <li key={i.name} className="pl-4 text-xs">
                                {i.name}
                              </li>
                            ))
                          )}
                        </ul>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            </div>
            
            <div className={`modal ${adminModal}`}>
              <div className="modal-box">
                <h3 className="font-bold text-xl flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="ml-1">
                    Admin
                  </span>
                </h3>
                <p className="text-left">
                  <button onClick={handleCloseDraft} className="mt-8 btn btn-warning link-outline">Close Draft</button>
                </p>
                <div className="modal-action pt-5">
                  <label htmlFor="my-modal" className="btn" onClick={handleAdminModalCancel}>Cancel</label>
                </div>
              </div>
            </div>

          </>
        )}
        <Selection />
      </Layout>
    ) : (
      <></>
    )
  )
}

export default League
