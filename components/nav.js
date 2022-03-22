import Link from 'next/link'
import { useState } from 'react'
import { useUser } from '../lib/hooks'
import Login from './login'

const Nav = () => {
  const [ modal, setModal ] = useState('')
  const user = useUser()
  const username = user && user.username
  const email = user && user.email

  const handleOpen = () => {
    setModal('modal-open')
  }

  const handleClose = () => {
    setModal('')
  }
  
  return (
    <>
  
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
                  <button onClick={handleOpen} className="justify-between">
                    Profile
                  </button>
                </li>
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

      <div className={`modal ${modal}`}>
        <div className="modal-box">
          <h3 className="font-bold text-xl flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="ml-1">
              Profile
            </span>
          </h3>
          <p className="pt-4">
            Username: <code className="font-semibold">{username}</code>
          </p>
          <p className="pt-1">
            Email: <code className="font-semibold">{email}</code>
          </p>
          <div className="modal-action pt-5">
            <label htmlFor="my-modal" className="btn" onClick={handleClose}>Close</label>
          </div>
        </div>
      </div>

    </>
  )
}

export default Nav 
