import { getLoginSession } from '../../lib/auth'
import { findUser } from '../../lib/user'

export default async function user(req, res) {
  try {
    const session = await getLoginSession(req)
    const user = (session && (await findUser(session))) ?? null

    if (user === null) {
      res.status(200).json({ user })
      return
    }

    const {
      username,
      email,
    } = user

    res.status(200).json({ user: { username, email } })

  } catch (error) {
    console.error(error)
    res.status(500).end('Authentication token is invalid, please log in')
  }
}
