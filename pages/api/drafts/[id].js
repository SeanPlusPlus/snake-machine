import { getLoginSession } from '../../../lib/auth'
import faunadb from 'faunadb'
import _find from 'lodash/find'

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

    const { ref, data: { name, items, draft_order }} = league
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

    return { id:ref.id, draft_order: draft_user_order, name, items }
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
  }

  const { data: {items, name} } = draft
  const user_ref = user.ref.id
  const draft_user_ref = draft.data.userRef.value.id

  const league_id = draft.data.leagueRef.id
  const league = await getLeague(league_id)
  
  if (user_ref === draft_user_ref) {
    res.status(200).json({
      username,
      draft: { items, name},
      league,
    })
    return
  } else {
    res.status(403).json({
      message: 'Not your draft'
    })
    return
  }
}
