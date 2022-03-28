import { getLoginSession } from '../../lib/auth'
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
  Lambda,
  Var,
  Map,
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

async function getDrafts(user) {
  const index = 'drafts_by_user'
  const collection = 'users'
  const drafts = await client.query(
    Map(
      Paginate(
        Match(
          Index(index),
          Ref(Collection(collection), user.ref.id)
        )
      ),
      Lambda('draftRef', Get(Var('draftRef')))
    )
  )

  return drafts
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

    // draft_order.forEach((d) => console.log(d.value.id))


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

export default async function drafts(req, res) {
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

  const drafts = await getDrafts(user)
  const { data } = drafts
  
  const leagueLookups = data.map((d) => (getLeague(d.data.leagueRef.id)))
  const leagues = []
  for (const lookup of leagueLookups) {
    const result = await lookup
    leagues.push(result)
  }

  res.status(200).json({
    username,
    drafts: data.map((el) => {
    
      const league = _find(leagues, (l) => l.id === el.data.leagueRef.id)
      return {
        id: el.ref.id,
        items: el.data.items,
        league: {
          name: league.name,
        }
      }
    })
  })
  return
}
