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
  Create,
} = q

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

const name = 'Glofers Test'

const names = [
  'alice',
  'bob',
  'carlos'
]

const usernames = names.map((name) => ({ username: name }))

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
]

createLeague({name, usernames, items}).then((data) => {
  console.log(data);
})