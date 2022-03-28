import { getLoginSession } from '../../../lib/auth'
import faunadb from 'faunadb'
import _find from 'lodash/find'
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

    const { ref, data: { name, items, draft_order, current_turn, admin }} = league
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

    const current_turn_user = await getUser(current_turn.ref.id)
    const current_turn_user_name = { name: current_turn_user.data.username }

    const admin_user = await getUser(admin.ref.id)
    const admin_user_name = { name: admin_user.data.username }

    return {
      id:ref.id,
      draft_order: draft_user_order,
      name,
      items,
      current_turn: current_turn_user_name,
      admin: admin_user_name,
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

  
  if (user_ref !== draft_user_ref) {
    res.status(403).json({
      message: 'Not your draft'
    })
    return
  }
  
  const method = req.method
  const selected = method === 'PUT' ? (req.body) : undefined

  if (selected) {
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

    const league_updated = {
      ...league_to_update.data,
      items: league_to_update.data.items.map((i) => {
        if (i.name === selected.name)  {
          return {
            ...i,
            drafted: true,
          }
        }
        return i
      })
    }

    console.log(league_updated);

    const updated_league = await client.query(
      Update(
        Ref(Collection('leagues'), league.id),
        { data: league_updated},
      )
    )
    
    res.status(200).json({
      username,
      draft: { items: updated_draft.data.items, name },
      league: {
        ...league,
        items: updated_league.data.items,
      },
      selected,
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
