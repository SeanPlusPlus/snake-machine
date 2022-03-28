const faunadb = require('faunadb')
const _find = require('lodash/find')

require('dotenv').config()

const FAUNA_SECRET = process.env.FAUNA_SECRET
const q = faunadb.query
const client = new faunadb.Client({
  secret: FAUNA_SECRET,
  domain: "db.us.fauna.com",
  port: 443,
  scheme: 'https',
})

const {
  Collection,
  Ref,
  Get,
  Select,
  Paginate,
  Match,
  Index,
  Create,
} = q

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

async function createLeague({ name, usernames, items }) {
  const userLookups = usernames.map((user) => (findUser({ username: user.name })))
  const users = []
  for (const lookup of userLookups) {
    const result = await lookup 
    users.push(result)
  }

  const userRefs = users.map((user) => ({
    name: user.data.username,
    userRef: user.ref,
  }))

  const draft_order = usernames.map((u) => (
    _find(userRefs, {name: u.name}).userRef
  ))

  const admin = await findUser({ username: 'sean' })

  const current_pick = {
    draft_order_idx: 0,
    direction: 'Right',
  }

  const league = {
    name,
    draft_order,
    items: items.map((name) => ({ name })),
    admin: admin.ref.id,
    current_pick,
    closed: false,
  }

  const collection = 'leagues'
  const new_league = await client.query(
    Create(
      Collection(collection),
      { data: league }
    )
  )

  return {
    league: new_league
  }
}

const name = 'The Masters 2022'
const usernames = [
  {
    name: 'sean',
  },
  {
    name: 'alice',
  },
  {
    name: 'bob',
  },
]
const items = [
  'Fred Couples',
  'Sergio Garcia',
  'Hideki Matsuyama',
  'Bubba Watson',
  'Tiger Woods',
  'Jordan Spieth',
  'Bryson DeChambeau',
  'Brooks Koepka',
]

createLeague({name, usernames, items}).then((data) => {
  console.log(data);
})