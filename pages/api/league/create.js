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

async function findUser({ username }) {
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

export default async function create(req, res) {
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

  const method = req.method
  if (method !== 'POST') {
    res.status(405).json({
      username,
      message: 'Method not allowed'
    })
    return
  }

  const league = req.body

  //
  // draft order
  //
  const { members } = league
  
  if (!Array.isArray(members)) {
    res.status(400).json({
      message: 'Members list can not be empty'
    })
    return
  }

  if (members.length === 0) {
    res.status(400).json({
      message: 'No members found to draft'
    })
    return
  }

  const userLookups = members.map((m) => (findUser({username: m})))
  const draft_order = []

  try {
    for (const lookup of userLookups) {
      const result = await lookup
      draft_order.push(result)
    }
  } catch (e) {
    res.status(400).json({
      message: 'One or more of your member usernames does not exist'
    })
    return
  }

  //
  // items
  //
  const { items } = league

  if (!Array.isArray(items)) {
    res.status(400).json({
      message: 'Items list can not be empty'
    })
    return
  }

  if (items.length === 0) {
    res.status(400).json({
      message: 'No items found to draft'
    })
    return
  }

  res.status(200).json({
    draft_order,
    username,
    league,
  })
  return
}
