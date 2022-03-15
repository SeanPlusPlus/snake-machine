import Link from 'next/link'
import { useUser } from '../lib/hooks'

const Header = () => {
  const user = useUser()

  return (
    <div className="navbar mb-8 shadow-lg bg-neutral text-neutral-content">
      <div className="flex-1">
        <Link href="/">
          <a className="btn btn-ghost normal-case text-xl">
            <span role="img" aria-label="snake" className="mr-2">🐍</span>Machine
          </a>
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal p-0">
          <li>
            <Link href="/">
              <a>Home</a>
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link href="/profile">
                  <a>Profile</a>
                </Link>
              </li>
              <li>
                <a href="/api/logout">Logout</a>
              </li>
            </>
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

export default Header
