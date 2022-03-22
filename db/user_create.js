const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid');
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

  return user.data
}

async function createUser({ username, password }) {
  let exists = null
  try {
    exists = await findUser({ username })
  } catch {
    exists = false
  }

  if (exists) {
    return
  }

  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex')

  const user = {
    id: uuidv4(),
    createdAt: Date.now(),
    username,
    hash,
    salt,
  }
 
  const collection = 'users'
  const new_user = await client.query(
    q.Create(
      q.Collection(collection),
      { data: user }
    )
  )

  return {
    username,
    createdAt: Date.now(),
    new_user,
  }
}

const username = 'sean'
const password = 'foo'
createUser({ username, password }).then((res) => {
  console.log(res);
})

