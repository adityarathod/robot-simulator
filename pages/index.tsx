import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'

import Console from '../components/console'
import MapView from '../components/map-view'

import SimMap from '../sim/map'
import mutationReducer from '../util/parsed-map-mutations'
import parse from '../util/parser'

const ABOUT_MESSAGE = `robot sim 0.0.1 (fuck this class) [incomplete]
by aditya r.
==============
`

const Home: NextPage = () => {
  const [logs, setLogs] = useState<string[]>([ABOUT_MESSAGE])
  const [map, setMap] = useState<SimMap>(new SimMap())

  const processInput = (text: string) => {
    let resultStr: string
    let newMap: SimMap | null = null
    try {
      const result = parse(text)

      resultStr = result === null ? `i don't understand that :(` : 'done.'

      if (result !== null) {
        newMap = mutationReducer(map, result)
      }
    } catch (err: any) {
      resultStr = `i got an error :((\n${err.message?.toLowerCase() || err}`
    }

    if (newMap) {
      setMap(newMap)
    }

    const log = `> ${text}\n${resultStr}`
    setLogs([...logs, log])
  }

  return (
    <div>
      <Head>
        <title>Robot Simulation</title>
      </Head>

      <main className="w-screen h-screen grid grid-cols-2 gap-0">
        <MapView map={map} className="col-span-1" />

        <Console logs={logs} onInput={processInput} className="col-span-1" />
      </main>
    </div>
  )
}

export default Home
