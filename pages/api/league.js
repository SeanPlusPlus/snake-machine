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
  try {
    const session = await getLoginSession(req)
    const { username } = session
    const user = (session && (await getUserRef({ username }))) ?? null

    if (user === null) {
      res.status(200).json({ user })
      return
    }

    const leagues = await getLeagues()
    const { data } = leagues 

    res.status(200).json({
      username,
      leagues: data.map((el) => ({
        id: el.ref.id,
        name: el.data.name,
        members: el.data.members,
      }))
    })
    return
  } catch (error) {
    console.error(error)
    res.status(500).end('Authentication token is invalid, please log in')
  }
}
