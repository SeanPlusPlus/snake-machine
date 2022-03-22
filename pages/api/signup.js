import { createUser } from '../../lib/user'

export default async function signup(req, res) {
  try {
    const user = await createUser(req.body)
    res.status(200).send({ done: true, user })
  } catch (error) {
    console.error(error)
    res.status(500).end(error.message)
  }
}
