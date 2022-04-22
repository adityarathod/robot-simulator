import { FC, useLayoutEffect, useRef, useState } from 'react'
import SimMap from '../sim/map'
import useSize from '../util/use-size'

import { Img, Pt } from 'pts'
import { HandleAnimateFn, HandleStartFn, PtsCanvas } from 'react-pts-canvas'

interface MapViewProps {
  map: SimMap
  className?: string
  play?: boolean
}

const MapView: FC<MapViewProps> = ({ map, className = '', play = true }) => {
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

  let image: Img | null = null

  const start: HandleStartFn = (bound, space, form) => {
    space.background = '#fff'
    image = Img.load('/arrow.svg', true, space.pixelScale)
  }

  const worldSpaceToScreenSpace = (
    worldPoint: Pt,
    worldSize: Pt,
    screenSize: Pt,
  ) => {
    return worldPoint.$divide(worldSize).$multiply(screenSize)
  }

  const screenSpaceToWorldSpace = (
    screenPoint: Pt,
    worldSize: Pt,
    screenSize: Pt,
  ) => {
    return screenPoint.$divide(screenSize).$multiply(worldSize)
  }

  const animate: HandleAnimateFn = (space, form, time, ftime) => {
    const worldSize = new Pt(map.size)
    const screenSize = new Pt(space.width, space.height)

    form.stroke('black')
    for (const [fromLbl, toMap] of Object.entries(map.paths)) {
      for (const toLbl of Object.keys(toMap)) {
        const from = map.locations[fromLbl]
        const to = map.locations[toLbl]
        const p1 = worldSpaceToScreenSpace(
          new Pt(from.x, from.y),
          worldSize,
          screenSize,
        )
        const p2 = worldSpaceToScreenSpace(
          new Pt(to.x, to.y),
          worldSize,
          screenSize,
        )
        form.stroke(from.label < to.label ? '#32a852ff' : 'black')
        form.line([p1, p2])
      }
    }
    form.stroke(false)
    form.fill('#f00')
    Object.values(map.locations).forEach((location) => {
      const p = worldSpaceToScreenSpace(
        new Pt(location.x, location.y),
        worldSize,
        screenSize,
      )
      form.point(p, 5, 'circle')
      form.text(p.$add(7, -5), `${location.label}`)
    })

    form.fill('#32a852')
    const sp = screenSpaceToWorldSpace(space.pointer, worldSize, screenSize)
    for (const [_, robot] of Object.entries(map.robots)) {
      const p = worldSpaceToScreenSpace(
        new Pt(robot.currentX, robot.currentY),
        worldSize,
        screenSize,
      )
      form.fill(robot.color)
      form.text(p.$add(7, -5), `${robot.name}`)
      form.point(p, 4)
    }

    if (play) {
      map.simulationStep()
    }
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
