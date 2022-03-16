import Link from 'next/link'
import { useUser } from '../lib/hooks'

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
        { username ? (
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
        ) : (
          <Link href="/login">
            <a className="btn btn-default">Login</a>
          </Link>
        )}
      </div>
    </div>
  )

  return (
    <div className="navbar mb-8 shadow-lg bg-neutral text-neutral-content">
      <div className="flex-1">
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal p-0">
          {user ? (
            <li tabIndex="0" className="dropdown">
              <a className="btn btn-outline">
                {user.username}
                <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/></svg>
              </a>
              <ul className="p-2 bg-base-100">
                <li><a href="/api/logout">Logout</a></li>
              </ul>
            </li>
          ) : (
            <li>
              <Link href="/login">
                <a>Login</a>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default Nav 
