const faunadb = require('faunadb')

require('dotenv').config()

const FAUNA_SECRET = process.env.FAUNA_SECRET
const q = faunadb.query
const client = new faunadb.Client({
  secret: FAUNA_SECRET,
  domain: "db.us.fauna.com",
  port: 443,
  scheme: 'https',
})

async function findUser({ username }) {
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

async function createDraft({ items, name, username }) {
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

  const collection = 'drafts'
  const new_draft = await client.query(
    q.Create(
      q.Collection(collection),
      { data: { items, name, userRef: user.ref } }
    )
  )

  return {
    new_draft,
  }
}

const drafts = [
  {
    username: 'sean',
    name: 'colors',
    items: [
      {
        name: 'red'
      },
      {
        name: 'yellow'
      },
      {
        name: 'green'
      }
    ]
  },
  {
    username: 'sean',
    name: 'cities',
    items: [
      {
        name: 'LA'
      },
      {
        name: 'NY'
      },
      {
        name: 'SF'
      }
    ]
  },
]

drafts.forEach((draft) => {
  createDraft(draft).then((res) => {
    console.log(res);
  }).catch((e) => {
    console.log(e)
  })
})

