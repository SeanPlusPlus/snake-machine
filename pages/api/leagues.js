import { getLoginSession } from '../../lib/auth'
import faunadb from 'faunadb'

require('dotenv').config()

const FAUNA_SECRET = process.env.FAUNA_SECRET
const q = faunadb.query
const {
  Collection,
  Documents,
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
    q.Select([0],
      q.Paginate(
        q.Match(
          q.Index(index),
          username
        )
      )
    )
  )
  const ref = item[1].value.id
  const collection = 'users'
  const user = await client.query(
    q.Get(
      q.Ref(
        q.Collection(collection),
        ref
      )
    )
  )

  return user
}

async function getLeagues() {
  const collection = 'leagues'
  const leagues = await client.query(
    q.Map(
      q.Paginate(Documents(Collection(collection))),
      q.Lambda(x => q.Get(x))
    )
  )

  return leagues
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

  const { data: {role} } = user
  if (role !== 'admin') {
    res.status(403).json({
      message: 'Not allowed',
    })
  }

  const leagues = await getLeagues()
  const { data } = leagues 

  res.status(200).json({
    username,
    leagues: data.map((el) => ({
      id: el.ref.id,
      name: el.data.name,
      draft_order: el.data.draft_order.map((user) => ({ userRef: user.value.id })),
      items: el.data.items,
    }))
  })
  return
}
