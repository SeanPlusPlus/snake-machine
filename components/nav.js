import Link from 'next/link'
import { useUser } from '../lib/hooks'
import Login from './login'

const Nav = () => {
  const user = useUser()
  const username = user && user.username
  
  return (
    <div className="navbar mb-8 shadow-lg bg-neutral text-neutral-content">
      <div className="flex-1">
        <Link href="/">
          <a className="btn btn-ghost normal-case text-xl">
            <span role="img" aria-label="snake" className="mr-2">🐍</span>Machine
          </a>
        </Link>
      </div>
      <div className="flex-none gap-2">
        { username && (
          <div className="dropdown dropdown-end">
            <label tabIndex="0" className="btn btn-outline">
              {username}
            </label>
            <ul tabIndex="0" className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
              <li>
                <a href="/api/logout" className="justify-between">
                  Logout
                </a>
              </li>
            </ul>
          </div>
        )}
        <Login />
      </div>
    </div>
  )
}

export default Nav 
