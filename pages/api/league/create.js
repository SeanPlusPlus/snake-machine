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
  Create,
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

async function createLeague({ name, usernames, items, admin }) {
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
  // name
  //
  const { name } = league
 
  if (!name) {
    res.status(400).json({
      message: 'League name required'
    })
    return
  }

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
  const draft_users = []

  try {
    for (const lookup of userLookups) {
      const result = await lookup
      draft_users.push(result)
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

  //
  // create league
  //
  //
  const usernames = members.map((name) => ({ username: name }))
  const admin = { username }

  createLeague({name, usernames, items, admin}).then(async (data) => {

    const draftPromises = members.map((username) => (
      createDraft({ username: username, name: name })
    ))

    const drafts = []
    for (const draft of draftPromises) {
      const result = await draft
      drafts.push(result)
    }

    res.status(200).json({
      id: data.league.ref.id,
    })
    return
  })
}
