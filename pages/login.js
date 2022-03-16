import { useState, useContext } from 'react'
import { GlobalContext } from '../context/GlobalState'
import Router from 'next/router'
import { useUser } from '../lib/hooks'
import Layout from '../components/layout'
import Form from '../components/form'

const Login = () => {
  useUser({ redirectTo: '/', redirectIfFound: true })
  const { setUser } = useContext(GlobalContext)
  
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    if (errorMsg) setErrorMsg('')

    const username = e.currentTarget.username.value
    const password = e.currentTarget.password.value
    const body = {
      username,
      password,
    }

    try {
      setUser({ logging_in: true })
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 200) {
        Router.push('/')
      } else {
        throw new Error(await res.text())
      }
    } catch (error) {
      console.error('An unexpected error happened occurred:', error)
      setErrorMsg(error.message)
    }
  }

  return (
    <Layout>
      <div className="login">
        <Form isLogin errorMessage={errorMsg} onSubmit={handleSubmit} />
      </div>
    </Layout>
  )
}

export default Login
