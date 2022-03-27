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

const {
  Collection,
  Ref,
  Get,
  Select,
  Paginate,
  Match,
  Index,
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

async function createLeague({ usernames }) {
  const userLookups = usernames.map((username) => (findUser({username})))
  const users = []
  for (const user of userLookups) {
    const result = await user
    users.push(result)
  }
  return {
    users
  }
}

const usernames = [
  'sean',
  'test',
] 

createLeague({usernames}).then((data) => {
  console.log(data);
})