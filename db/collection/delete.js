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
  Delete,
  Collection,
} = q


const names = [
  'drafts',
  'leagues',
  'users',
]

names.forEach((name) => {
  client.query(
    Delete(Collection(name))
  )
})
