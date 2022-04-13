import type { NextPage } from 'next'
import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import SimMap from '../sim/map'
import parse from '../util/parser'
import mutationReducer from '../util/parsed-map-mutations'

const Console: NextPage = () => {
  const el = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<SimMap>(new SimMap())
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    if (el.current) {
      el.current.scrollTop = el.current.scrollHeight
    }
  }, [logs])

  const processInput = (text: string) => {
    let resultStr: string
    let newMap: SimMap | null = null
    try {
      const result = parse(text)

      resultStr =
        result === null ? `i don't understand that :(` : JSON.stringify(result)

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
      <main className="w-screen h-screen flex flex-col items-center justify-end p-8 overflow-auto">
        <div
          className="w-full flex-1 basis-auto overflow-y-auto min-h-0"
          ref={el}
        >
          {logs.map((log, idx) => (
            <pre key={idx} className="py-2 px-1 font-mono min-h-fit">
              {log}
            </pre>
          ))}
        </div>
        <div className="w-full mt-2 flex flex-row">
          <input
            type="text"
            className="flex-1 outline-none font-mono text-md"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                processInput(e.currentTarget.value)
                e.currentTarget.value = ''
              }
            }}
            placeholder="command"
          />
        </div>
      </main>
    </div>
  )
}

export default Console
