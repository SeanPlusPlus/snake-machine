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
  const admin = { username: 'alice' }

  const current_pick = {
    draft_order_idx: 0,
    direction: 'Right',
  }

  const league = {
    name,
    draft_order: usernames,
    picks: {},
    items: items.map((name) => ({ name })),
    admin,
    current_pick,
    status: 'open'
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


async function findLeague(name) {
  const index = 'leagues_by_name'
  const item = await client.query(
    Select([0],
      Paginate(
        Match(
          Index(index),
          name
        )
      )
    )
  )
  const ref = item[1].value.id
  const collection = 'leagues'
  const league = await client.query(
    Get(
      Ref(
        Collection(collection),
        ref
      )
    )
  )

  return league
}

async function createDraft({ name, username }) {
  let user = null

  // check for username
  try {
    user = await findUser({ username })
  } catch {
    user = false
  }

  if (user === false) {
    return false
  }

  const league = await findLeague(name)

  const collection = 'drafts'
  const new_draft = await client.query(
    Create(
      Collection(collection),
      {
        data: {
          userRef: user.ref,
          leagueRef: league.ref,
        }
      }
    )
  )

  return {
    new_draft,
  }
}

const name = 'Masters 2022'

// TODO:
const names = [
  'alice',
  'bob',
  'carlos'
]

const usernames = names.map((name) => ({ username: name }))

// TODO:
const items = [
  'Fred Couples',
  'Sergio Garcia',
  'Hideki Matsuyama',
  'Bubba Watson',
  'Tiger Woods',
  'Jordan Spieth',
  'Bryson DeChambeau',
  'Brooks Koepka',
  'Si-woo Kim',
  'Sam Burns',
  'Paul Casey',
]

createLeague({name, usernames, items}).then((data) => {
  console.log(data);

  const drafts = names.map((username) => ({ username: username, name: name }))

  drafts.forEach((draft) => {
    createDraft(draft).then((res) => {
      console.log(res);
    }).catch((e) => {
      console.log(e)
    })
  })
})