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
  try {
    const league = await client.query(
      Get(Ref(Collection('leagues'), id))
    )

    const { ref, data: { name, items, draft_order, current_pick, admin, picks }} = league

    return {
      id:ref.id,
      draft_order,
      name,
      items,
      current_pick,
      admin,
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

  let league 
  try {
    league = await getLeague(id)
  } catch {
    res.status(404).json(({
      message: 'League not found'
    }))
    return
  }

  res.status(200).json({
    username,
    league,
  })
  return
}
