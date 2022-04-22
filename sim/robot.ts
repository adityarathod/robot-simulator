import { SimLocation } from './types'
import dist from '../util/distance'
import randomColor from '../util/random-color'

export const DIST_THRESHOLD = 0.1

export default class SimRobot {
  name: string
  currentX: number = 0
  currentY: number = 0
  color: string
  pathIdx: number
  path: { from: string; to: string; x: number; y: number }[]

  constructor(name: string, startingPoint: SimLocation) {
    this.name = name
    this.currentX = startingPoint.x
    this.currentY = startingPoint.y
    this.color = randomColor()
  }

  atDestination() {
    if (this.pathIdx >= this.path.length) return true
    const trueDist = dist(
      this.currentX,
      this.currentY,
      this.path[this.pathIdx].x,
      this.path[this.pathIdx].y,
    )
    // console.log(trueDist)
    return trueDist <= DIST_THRESHOLD
  }

  addPathing(path: { from: string; to: string; x: number; y: number }[]) {
    if (path.length === 0) {
      return
    }
    this.path = path
    console.log(path)
    this.pathIdx = 0
  }

  completedPathing() {
    return this.pathIdx >= this.path.length
  }

  currentPath() {
    if (this.pathIdx >= this.path.length) {
      return null
    }
    return this.path[this.pathIdx]
  }

  step(stepSize: number) {
    // set to false for acceleration :)
    const NORMALIZED = true
    if (this.atDestination()) {
      this.pathIdx += 1
      // console.log(this.path)
    }
    const path = this.currentPath()
    if (!path) return
    const d = stepSize
    let dx = path.x - this.currentX
    let dy = path.y - this.currentY
    const angle = Math.atan2(dy, dx)
    dx *= dx < 0 ? -1 : 1
    dy *= dy < 0 ? -1 : 1
    dx *= Math.cos(angle)
    dy *= Math.sin(angle)
    const dnorm = Math.sqrt(dx * dx + dy * dy)
    const divisor = NORMALIZED ? dnorm : 1
    dx = (dx * d) / divisor
    dy = (dy * d) / divisor
    this.currentX += dx
    this.currentY += dy
  }
}
