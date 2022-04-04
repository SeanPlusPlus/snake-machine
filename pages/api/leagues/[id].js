import { getLoginSession } from '../../../lib/auth'
import faunadb from 'faunadb'
import _find from 'lodash/find'
import _some from 'lodash/some'
import _includes from 'lodash/includes'

require('dotenv').config()

const FAUNA_SECRET = process.env.FAUNA_SECRET
const q = faunadb.query
const {
  Collection,
  Ref,
  Get,
  Paginate,
  Match,
  Index,
  Select,
  Update,
} = q

const client = new faunadb.Client({
  secret: FAUNA_SECRET,
  domain: "db.us.fauna.com",
  port: 443,
  scheme: 'https',
})

async function getUserRef({ username }) {
  const index = 'users_by_username'
  const item = await client.query(
    Select([0],
      Paginate(
        Match(
          Index(index),
          username
        )
      )
    )
  )
  const ref = item[1].value.id
  const collection = 'users'
  const user = await client.query(
    Get(
      Ref(
        Collection(collection),
        ref
      )
    )
  )

  return user
}

async function getLeague(id) {
  try {
    const league = await client.query(
      Get(Ref(Collection('leagues'), id))
    )

    const { ref, data: { name, items, draft_order, current_pick, admin, picks, status }} = league

    return {
      id:ref.id,
      draft_order,
      name,
      items,
      current_pick,
      admin,
      picks,
      status,
    }
  } catch {
    throw new Error()
  }
}

export default async function league(req, res) {
  const session = await getLoginSession(req)
  if (!session) {
    res.status(401).json({
      message: 'Not logged in',
    })
    return
  }
 
  const { username } = session
  if (!username) {
    res.status(400).json({
      message: 'Username not found in session, something is funky',
    })
    return
  }

  const user = (session && (await getUserRef({ username }))) ?? null

  if (user === null) {
    res.status(200).json({ user })
    return
  }

  const {
    query: { id },
  } = req

  let league 
  try {
    league = await getLeague(id)
  } catch {
    res.status(404).json(({
      message: 'League not found'
    }))
    return
  }

  const members = league.draft_order.map((m) => (m.username)).concat(league.admin.username)
  const is_member = _includes(members, username)
  if (!is_member) {
    res.status(404).json(({
      message: 'Not a member of this league'
    }))
    return
  }

  //
  // GET league success
  //
  
  const method = req.method
  if (method === 'GET') {
    res.status(200).json({
      username,
      league,
    })
    return
  }

  //
  // PUT league err handling
  //

  if (method !== 'PUT') {
    res.status(405).json({
      message: 'Only PUT and GET allowed'
    })
    return
  }

  const closed = req.body
  if (closed) {
    if (league.admin.username === username) {
      const league_data = {
        ...league,
        status: 'closed',
      }
      const updated_league = await client.query(
        Update(
          Ref(Collection('leagues'), league.id),
          { data: league_data },
        )
      )
      res.status(200).json({
        username,
        league: {
          ...league,
          status: 'closed',
        },
      })
      return
    }
  }

  const selected = req.body
  if (!selected) {
    res.status(400).json({
      message: 'Pass selected'
    })
    return
  }

  const user_ready_to_pick = league.draft_order[league.current_pick.draft_order_idx].username === username
  if (!user_ready_to_pick) {
    res.status(403).json({
      message: 'Not your pick dude'
    })
    return
  }

  const { status } = league
  if (status === 'closed') {
    res.status(403).json({
      message: 'Draft is closed'
    })
    return
  }

  //
  // handle snake 
  //
  
  let updated_direction = null
  let updated_draft_order_idx = null

  const previous_draft_order_idx = league.current_pick.draft_order_idx
  const previous_direction = league.current_pick.direction

  if (previous_direction === 'Right') {
    updated_draft_order_idx = previous_draft_order_idx + 1

    // are we at the end of the array
    if ((updated_draft_order_idx + 1) === league.draft_order.length) {
      updated_direction = 'Hold'
    } else {
      updated_direction = 'Right'
    }
  } else if (previous_direction === 'Left') {
    updated_draft_order_idx = previous_draft_order_idx - 1

    // are we at the start of the array
    if (updated_draft_order_idx === 0) {
      updated_direction = 'Hold'
    } else {
      updated_direction = 'Left'
    }
  } else { // Hold
    updated_draft_order_idx = previous_draft_order_idx

    // are we at the start of the array
    if (updated_draft_order_idx === 0) {
      updated_direction = 'Right'
    } else {
      updated_direction = 'Left'
    }
  }

  const current_pick = {
    draft_order_idx: updated_draft_order_idx,
    direction: updated_direction,
  }

  const getPicks = (picks, username, selected) => {
    if (!picks[username]) {
      return {
        ...picks,
        [username]: {
          items: [selected]
        }
      }
    }
    return {
      ...picks,
      [username]: {
        items: [...picks[username].items, selected]
      }
    }
  }

  const picks = getPicks(league.picks, username, selected) 

  const league_data = {
    ...league,
    current_pick,
    items: league.items.map((i) => {
      if (i.name === selected.name)  {
        return {
          ...i,
          drafted: true,
        }
      }
      return i
    }),
    picks,
  }

  const updated_league = await client.query(
    Update(
      Ref(Collection('leagues'), league.id),
      { data: league_data },
    )
  )

  //
  // PUT league success
  //
 
  res.status(200).json({
    username,
    league: {
      ...league,
      items: updated_league.data.items,
      current_pick: updated_league.data.current_pick,
      picks: updated_league.data.picks,
    },
    selected,
  })
  return
}
