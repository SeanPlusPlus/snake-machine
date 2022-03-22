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

async function createDraft({ items, ref }) {
 
  const collection = 'drafts'
  const new_draft = await client.query(
    q.Create(
      q.Collection(collection),
      { data: { items } }
    )
  )

  return {
    new_draft,
  }
}

const draft = { 
  items: [
    {
      title: 'foo'
    },
    {
      title: 'bar'
    }
  ]
}

createDraft(draft).then((res) => {
  console.log(res);
}).catch((e) => {
  console.log(e)
})

