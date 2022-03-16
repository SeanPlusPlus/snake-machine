import { useEffect, useContext } from 'react'
import { GlobalContext } from '../context/GlobalState'
import Router from 'next/router'
import useSWR from 'swr'

const fetcher = (url) =>
  fetch(url)
    .then((r) => r.json())
    .then((data) => {
      return { user: data?.user || null }
    })

export function useUser({ redirectTo, redirectIfFound } = {}) {
  const { setUser } = useContext(GlobalContext)
  const { data, error } = useSWR('/api/user', fetcher)
  const user = data?.user
  const finished = Boolean(data)
  const hasUser = Boolean(user)

  useEffect(() => {
    if (!redirectTo || !finished) return
    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !hasUser) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && hasUser)
    ) {
      Router.push(redirectTo)
    }
  }, [redirectTo, redirectIfFound, finished, hasUser])

  useEffect(() => {
    if (user) {
      const { username } = user
      setUser({ username })
    }
  }, [user])

  return error ? null : user
}
