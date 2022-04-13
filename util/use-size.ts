import { RefObject, useLayoutEffect, useState } from 'react'
import useResizeObserver from '@react-hook/resize-observer'

const useSize = (target: RefObject<HTMLElement>) => {
  const [size, setSize] = useState<DOMRect>()

  useLayoutEffect(() => {
    if (!target || !target.current) return
    setSize(target.current.getBoundingClientRect())
  }, [target])

  useResizeObserver(target, (entry) => setSize(entry.contentRect))
  return size
}

export default useSize
