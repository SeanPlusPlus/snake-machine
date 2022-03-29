import { getLoginSession } from '../../../lib/auth'
import faunadb from 'faunadb'
import _find from 'lodash/find'
import _some from 'lodash/some'
import { data } from 'autoprefixer'

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

async function getDraft(id) {
  const collection = 'drafts'
  try {
    const draft = await client.query(
      Get(Ref(Collection(collection), id))
    )

    return draft
  } catch {
    throw new Error()
  }
}

async function getUser(id) {
  const collection = 'users'
  try {
    const user = await client.query(
      Get(Ref(Collection(collection), id))
    )

    return user 
  } catch {
    throw new Error()
  }
}

async function getLeague(id) {
  const collection = 'leagues'
  try {
    const league = await client.query(
      Get(Ref(Collection(collection), id))
    )

    const { ref, data: { name, items, draft_order, current_pick, admin, picks }} = league
    const userLookups = draft_order.map((d) => (getUser(d.value.id)))
    const users = []
    for (const lookup of userLookups) {
      const result = await lookup
      users.push(result)
    }

    const draft_user_order = draft_order.map((u) => {
      const { value: { id }} = u
      const { data: { username }} = _find(users, (user) => user.ref.id === id)
      return {
        username
      }
    })

    const admin_user = await getUser(admin)
    const admin_user_name = { username: admin_user.data.username }

    return {
      id:ref.id,
      draft_order: draft_user_order,
      name,
      items,
      current_pick,
      admin: admin_user_name,
      picks,
    }
  } catch {
    throw new Error()
  }
}

export default async function draft(req, res) {
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

  let draft
  try {
    draft = await getDraft(id)
  } catch {
    res.status(404).json(({
      message: 'Draft not found'
    }))
    return
  }

  const { data: {items, name} } = draft
  const user_ref = user.ref.id
  const draft_user_ref = draft.data.userRef.value.id

  const league_id = draft.data.leagueRef.id
  const league = await getLeague(league_id)
  
  const method = req.method
  const selected = method === 'PUT' ? (req.body) : undefined

  if (selected) {
    
    // only you can update your draft
    if (user_ref !== draft_user_ref) {
      res.status(403).json({
        message: 'Not your draft'
      })
      return
    }
    
    const draft_updated = {
      ...data,
      items: [...items, selected]
    }

    const collection = 'drafts'
    const updated_draft = await client.query(
      Update(
        Ref(Collection(collection), id),
        { data: draft_updated },
      )
    )

    const league_to_update = await client.query(
      Get(Ref(Collection('leagues'), league.id))
    )

    // calculate current pick
    let updated_direction = null
    let updated_draft_order_idx = null

    const previous_draft_order_idx = league_to_update.data.current_pick.draft_order_idx
    const previous_direction = league_to_update.data.current_pick.direction

    if (previous_direction === 'Right') {
      updated_draft_order_idx = previous_draft_order_idx + 1

      // are we at the end of the array
      if ((updated_draft_order_idx + 1) === league_to_update.data.draft_order.length) {
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
            items: [{name: selected}]
          }
        }
      }
      return {
        ...picks,
        [username]: {
          items: [...picks[username].items, {name: selected}]
        }
      }
    }

    const picks = getPicks(league_to_update.data.picks, username, selected) 

    const league_updated = {
      ...league_to_update.data,
      current_pick,
      items: league_to_update.data.items.map((i) => {
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
        { data: league_updated },
      )
    )
    
    res.status(200).json({
      username,
      draft: { items: updated_draft.data.items, name },
      league: {
        ...league,
        items: updated_league.data.items,
        current_pick: updated_league.data.current_pick,
        picks: updated_league.data.picks,
      },
      selected,
    })
    return
  } else {

    // you can only see drafts if you are in the league
    const my_league = _some(league.draft_order, { username })
    if (!my_league) {
      res.status(403).json({
        message: 'Not your draft'
      })
      return
    } else {
      res.status(200).json({
        username,
        draft: { items, name },
        league,
      })
    }
  }
}
