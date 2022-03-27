const faunadb = require('faunadb')

require('dotenv').config()

const FAUNA_SECRET = process.env.FAUNA_SECRET
const q = faunadb.query

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

const client = new faunadb.Client({
  secret: FAUNA_SECRET,
  domain: "db.us.fauna.com",
  port: 443,
  scheme: 'https',
})

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
          name,
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

const name = 'The Masters 2022'
const drafts = [
  {
    username: 'sean',
    name,
  },
  {
    username: 'test',
    name,
  },
]

drafts.forEach((draft) => {
  createDraft(draft).then((res) => {
    console.log(res);
  }).catch((e) => {
    console.log(e)
  })
})

