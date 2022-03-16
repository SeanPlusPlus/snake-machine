import Link from 'next/link'
import { useContext } from 'react'
import { GlobalContext } from '../context/GlobalState'

const Login = () => {
  const { user } = useContext(GlobalContext)
  const { username, fetching } = user

  if (fetching || username) { 
    return <></>
  }
  
  return (
    <Link href="/login">
      <a className="btn btn-default">Login</a>
    </Link>
  )
}

export default Login
