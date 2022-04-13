import { FC, useLayoutEffect, useRef, useState } from 'react'
import SimMap from '../sim/map'
import useSize from '../util/use-size'

import { Pt } from 'pts'
import { HandleAnimateFn, HandleStartFn, PtsCanvas } from 'react-pts-canvas'

interface MapViewProps {
  map: SimMap
  className?: string
}

const MapView: FC<MapViewProps> = ({ map, className = '' }) => {
  const canvasColRef = useRef<HTMLDivElement>(null)
  const canvasColSize = useSize(canvasColRef)
  const [recommendedSize, setRecommendedSize] = useState<number>(300)

  useLayoutEffect(() => {
    if (typeof canvasColSize === 'undefined') return
    else {
      setRecommendedSize(
        Math.min(canvasColSize.width, canvasColSize.height) - 30,
      )
    }
  }, [canvasColSize])

  const scaleFactor = 10

  const start: HandleStartFn = (bound, space, form) => {
    space.background = '#fff'
  }

  const animate: HandleAnimateFn = (space, form, time, ftime) => {
    form.stroke('black')
    Object.values(map.paths).forEach((path) => {
      const pt1 = map.locations[path.from]
      const pt2 = map.locations[path.to]
      const x1 = space.width * (pt1.x / map.size[0])
      const y1 = space.height * (pt1.y / map.size[1])
      const x2 = space.width * (pt2.x / map.size[0])
      const y2 = space.height * (pt2.y / map.size[1])
      form.line([new Pt(x1, y1), new Pt(x2, y2)])
    })
    form.stroke(false)
    form.fill('#f00')
    Object.values(map.locations).forEach((location) => {
      const x = space.width * (location.x / map.size[0])
      const y = space.height * (location.y / map.size[1])
      const p = new Pt(x, y)
      form.point(p, 5, 'circle')
      form.text(p.$add(7, -5), `${location.label}`)
    })
    // form.point(space.pointer, 10)
    // space.add(() => form.point(space.pointer, 10))
  }

  return (
    <section
      className={`w-full h-full flex items-center justify-center bg-gray-50 ${className}`}
      ref={canvasColRef}
    >
      <PtsCanvas
        name="mainView"
        onStart={start}
        onAnimate={animate}
        style={{ width: recommendedSize, height: recommendedSize }}
      />
    </section>
  )
}

export default MapView
