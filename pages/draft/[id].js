import { useRouter } from 'next/router'
import Layout from '../../components/layout'

const Draft = () => {
  const router = useRouter()
  const { id } = router.query

  return (
    <Layout>
      <h1>Draft: {id}</h1>
    </Layout>
  )
}

export default Draft
