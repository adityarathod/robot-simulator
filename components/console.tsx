import { FC, useEffect, useRef } from 'react'

interface ConsoleProps {
  logs: string[]
  onInput: (input: string) => unknown
  className?: string
}

const Console: FC<ConsoleProps> = ({ logs, onInput, className = '' }) => {
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (el.current) {
      el.current.scrollTop = el.current.scrollHeight
    }
  }, [logs])

  return (
    <section
      className={`w-full h-full flex flex-col items-center justify-end p-8 overflow-auto ${className}`}
    >
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
              if (e.currentTarget.value.trim().length === 0) {
                return
              }
              onInput(e.currentTarget.value)
              e.currentTarget.value = ''
            }
          }}
          placeholder="command"
        />
      </div>
    </section>
  )
}

export default Console
