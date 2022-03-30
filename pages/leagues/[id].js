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

const currentPick = (draft_order, current_pick, username) => {
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
          setOpponents(data.league.picks)
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
            <h1 className="text-4xl text-left bottom-2 border-b-2 border-indigo-500">{league.name}</h1>

            <div className="w-[340px] lg:grid lg:grid-cols-3 lg:gap-3 lg:w-[1000px]">
 
            <div className="card bg-base-100 shadow-xl mt-4">
              <div className="card-body">
                <h4 className="text-2xl text-left">My Draft</h4>
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
                <h4 className="text-2xl text-left">Items</h4>
                <div className="divider mb-0 mt-1" />
                <div className="form-control">
                  <ul className="list-disc text-left text-md">
                    {league.items.map((item, idx) => (
                      <li
                        key={idx}
                        className={`pt-1 list-none ${myPick(league.draft_order, league.current_pick, username) && !item.drafted && 'hover:bg-sky-700 hover:rounded-md'}`}
                      >
                        <label
                          className={`label h-[40px] ${myPick(league.draft_order, league.current_pick, username) && !item.drafted && 'cursor-pointer'}`}
                        >
                          <span className={`label-text ${item.drafted && 'line-through'}`}>
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
                <h4 className="text-2xl text-left">Draft Order</h4>
                <div className="divider mb-0 mt-1" />
                <ul className="list-disc text-left text-md">
                  {league.draft_order.map((user, idx) => (
                    <li
                      key={idx}
                      className={`pt-1 ${currentPick(league.draft_order, league.current_pick, user.username) !== user.username && 'list-none'}`}
                    >
                    
                      <span className="pr-1">
                        {idx + 1}.
                      </span>
                      <span>
                        <span className={currentPick(league.draft_order, league.current_pick, user.username) ? 'underline' : ''}>
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
