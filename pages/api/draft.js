import { getLoginSession } from '../../lib/auth'
import faunadb from 'faunadb'

require('dotenv').config()

const FAUNA_SECRET = process.env.FAUNA_SECRET
const q = faunadb.query
const {
  Collection,
  Ref,
  Get,
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

async function getUserRef({ username }) {
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

async function getDraft(id) {
  const collection = 'drafts'
  const draft = await client.query(
    Get(Ref(Collection(collection), id))
  )

  return draft
}

async function getDrafts(user) {
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

export default async function draft(req, res) {
  try {
    const session = await getLoginSession(req)
    const { username } = session
    const user = (session && (await getUserRef({ username }))) ?? null

    if (user === null) {
      res.status(200).json({ user })
      return
    }

    const {
      query: { id },
    } = req

    if (id) {
      const draft = await getDraft(id)
      const { data: {items, name} } = draft

      res.status(200).json({
        username,
        draft: { items, name } 
      })

    } else {
      const drafts = await getDrafts(user)
      const { data } = drafts

      res.status(200).json({
        username,
        drafts: data.map((el) => ({
          id: el.ref.id,
          name: el.data.name,
          items: el.data.items,
        }))
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).end('Authentication token is invalid, please log in')
  }
}
