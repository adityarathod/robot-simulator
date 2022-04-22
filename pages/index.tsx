import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'

import Console from '../components/console'
import MapView from '../components/map-view'

import SimMap from '../sim/map'
import runCommand from '../sim/interpreter'
import SimRobot from '../sim/robot'
import { SimLocation } from '../sim/types'

const ABOUT_MESSAGE = `robot sim 1.0.0 [cs3354.004]
by aditya rathod
==============
`

const m = new SimMap()
const loc: SimLocation = { label: 'A', x: 50, y: 50 }
const loc2: SimLocation = { label: 'B', x: 10, y: 10 }
const loc3: SimLocation = { label: 'D', x: 50, y: 10 }
const robo = new SimRobot('bob', loc)
const robo2 = new SimRobot('bob2', loc)
m.addLocation(loc)
m.addLocation(loc2)
m.addLocation(loc3)
m.addPath({ from: 'A', to: 'B' })
m.addPath({ from: 'B', to: 'D' })
m.addRobot(robo)
m.addRobot(robo2)
m.addRobotDestination('bob', 'D')
m.addRobotDestination('bob2', 'D')

const Home: NextPage = () => {
  const [logs, setLogs] = useState<string[]>([ABOUT_MESSAGE])
  const [map, setMap] = useState<SimMap>(m)

  const processInput = (text: string) => {
    const { output, newMap } = runCommand(text.trim(), map)
    if (newMap) setMap(newMap)
    const log = `> ${text}\n${output}`
    setLogs([...logs, log])
  }

  const onStep = () => {
    setMap(map.clone())
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
