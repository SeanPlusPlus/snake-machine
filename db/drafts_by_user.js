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
  Lambda,
  Var,
  Map,
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

async function getDrafts({ username }) {
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

const username = 'sean'
const drafts = getDrafts({ username })
drafts.then((ret) => {
  const { data } = ret
  const entries = data.map((el) => el.data.items)
  console.log(entries);
})

