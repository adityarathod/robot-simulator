import type { NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Robot Simulation</title>
      </Head>

      <div className="w-screen h-screen flex items-center justify-center">
        Welcome to robot simulation.
      </div>
    </div>
  )
}

export default Home
