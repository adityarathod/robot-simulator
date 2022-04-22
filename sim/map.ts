import clone from '../util/clone'
import cloneUtil from '../util/clone'
import dist from '../util/distance'
import SimRobot, { DIST_THRESHOLD } from './robot'
import { LocationLabel, PathHash, SimLocation, SimPathToAdd } from './types'

export const MAP_SIZE: [number, number] = [100, 100]

export default class SimMap {
  size: [number, number] = [...MAP_SIZE]
  locations: { [key: LocationLabel]: SimLocation } = {}
  locationsByCoord: { [hash: string]: LocationLabel } = {}
  paths: { [key: LocationLabel]: { [key: LocationLabel]: number } } = {}
  inUse: { [key: PathHash]: string } = {}
  robots: { [name: string]: SimRobot } = {}

  private hashLocation(loc: SimLocation) {
    return this.produceCoordHash(loc.x, loc.y)
  }

  hashPath(from: LocationLabel, to: LocationLabel) {
    return `${from},${to}`
  }

  private produceCoordHash(x: number, y: number) {
    return `${x},${y}`
  }

  private isInAnyPath(label: string) {
    for (const [fromLbl, toMap] of Object.entries(this.paths)) {
      if (fromLbl === label && Object.values(toMap).length > 0) return true
      if (Object.keys(toMap).includes(label)) return true
    }
  }

  private robotsHere(loc: SimLocation) {
    for (const robot of Object.values(this.robots)) {
      if (
        dist(loc.x, loc.y, robot.currentX, robot.currentY) <= DIST_THRESHOLD
      ) {
        return true
      }
      const path = robot.currentPath()
      if (path && loc.x === path.x && loc.y === path.y) {
        return true
      }
    }
  }

  private shortestDistanceNode(
    distances: { [key: LocationLabel]: number },
    visited: LocationLabel[],
  ) {
    let shortest = null
    for (let node in distances) {
      let currentIsShortest =
        shortest === null || distances[node] < distances[shortest]
      if (currentIsShortest && !visited.includes(node)) {
        shortest = node
      }
    }
    return shortest
  }

  private nearestPoint(x: number, y: number) {
    let closestDist = 1 / 0
    let closestLabel: string | null = null
    for (const [label, location] of Object.entries(this.locations)) {
      const d = dist(x, y, location.x, location.y)
      if (d < closestDist) {
        closestDist = d
        closestLabel = label
      }
    }
    return closestLabel
  }

  findShortestPath(start: LocationLabel, end: LocationLabel) {
    let distances: { [key: LocationLabel]: number } = {
      [end]: 1 / 0,
      ...this.paths[start],
    }
    let parents: { [key: LocationLabel]: LocationLabel } = {}
    for (let child in this.paths[start]) {
      parents[child] = start
    }

    let visited: LocationLabel[] = []
    let node = this.shortestDistanceNode(distances, visited)

    while (node) {
      let distance = distances[node]
      let children = this.paths[node]

      for (let child in children) {
        if (child === start) continue
        let newdistance = distance + children[child]
        if (!distances[child] || distances[child] > newdistance) {
          distances[child] = newdistance
          parents[child] = node
        }
      }
      visited.push(node)
      node = this.shortestDistanceNode(distances, visited)
    }

    let shortestPath = [end]
    let parent = parents[end]
    while (parent) {
      shortestPath.push(parent)
      parent = parents[parent]
    }
    shortestPath.reverse()

    let results = {
      distance: distances[end],
      path: shortestPath,
    }
    return results
  }

  addLocation(newLocation: SimLocation) {
    if (
      newLocation.x < 0 ||
      newLocation.x > this.size[0] ||
      newLocation.y < 0 ||
      newLocation.y > this.size[1]
    ) {
      throw new Error('Location outside bounds of map')
    }
    const hash = this.hashLocation(newLocation)
    const label = newLocation.label
    if (hash in this.locationsByCoord || label in this.locations) {
      throw new Error('Location already exists')
    }
    this.locationsByCoord[hash] = label
    this.locations[label] = newLocation
    this.paths[label] = {}
  }

  removeLocationByLabel(label: string) {
    if (!(label in this.locations)) {
      throw new Error('Location not found in possible locations')
    } else if (this.isInAnyPath(label)) {
      throw new Error('Cannot remove location that is part of path')
    }
    const loc = this.locations[label]
    if (this.robotsHere(loc)) {
      throw new Error('Cannot remove location with robots at/coming towards it')
    }
    const locationHash = this.hashLocation(loc)
    delete this.locations[label]
    delete this.locationsByCoord[locationHash]
  }

  removeLocationByCoords(x: number, y: number) {
    const locationHash = this.produceCoordHash(x, y)
    if (!(locationHash in this.locationsByCoord)) {
      throw new Error('Location not found in existing locations by coordinate')
    }
    const label = this.locationsByCoord[locationHash]
    this.removeLocationByLabel(label)
  }

  addPath(newPath: SimPathToAdd) {
    const { from, to } = newPath
    if (!(from in this.locations) || !(to in this.locations)) {
      throw new Error(
        'Path cannot be made since one of {from, to} is non-existent',
      )
    }
    if (from in this.paths && to in this.paths[from]) {
      throw new Error(
        `Path between ${newPath.from} and ${newPath.to} already exists`,
      )
    }
    const fromCoords = this.locations[newPath.from]
    const toCoords = this.locations[newPath.to]
    const distance = dist(fromCoords.x, fromCoords.y, toCoords.x, toCoords.y)
    this.paths[newPath.from][newPath.to] = distance
    return distance
  }

  removePath(from: string, to: string) {
    const hash = this.hashPath(from, to)
    if (hash in this.inUse) {
      throw new Error(`Cannot remove path ${hash} that is in use`)
    }

    if (from in this.paths && to in this.paths[from]) {
      delete this.paths[from][to]
    } else {
      throw new Error('Path does not exist in paths')
    }
  }

  addRobot(robot: SimRobot) {
    if (Object.keys(this.robots).some((key) => key === robot.name)) {
      throw new Error('Cannot have robot with the same name as an existing one')
    }
    this.robots[robot.name] = robot
  }

  removeRobot(name: string) {
    if (!(name in this.robots)) {
      throw new Error('Robot by that name does not exist')
    }
  }

  addRobotDestination(name: string, destination: LocationLabel | string) {
    if (!(destination in this.locations)) {
      throw new Error('Given destination does not exist')
    }
    if (!(name in this.robots)) {
      throw new Error('Robot is not in list of registered robots')
    }
    const robot = this.robots[name]
    // if (!robot.atDestination()) {
    //   throw new Error('Robot is still in transit')
    // }
    const lbl = this.nearestPoint(robot.currentX, robot.currentY)
    if (!lbl) {
      throw new Error('Cannot find nearest point to robot')
    }
    const { path, distance } = this.findShortestPath(lbl, destination)
    console.log(distance)
    if (distance === null || distance === Infinity) {
      throw new Error('Unable to find path to point')
    }
    const pathHash = this.hashPath(lbl, destination)

    let curArea = lbl
    let pathing: { from: string; to: string; x: number; y: number }[] = []
    for (const dest of path) {
      if (dest === curArea) continue
      pathing.push({
        from: curArea,
        to: dest,
        x: this.locations[dest].x,
        y: this.locations[dest].y,
      })
      curArea = dest
    }

    robot.addPathing(pathing)
    // robot.source = lbl
    // if (path.length > 0) {
    //   robot.headingTo = this.locations[path[0]]
    //   robot.popPath()
    //   if (!(pathHash in this.inUse)) {
    //     this.inUse[pathHash] = robot.name
    //   }
    // }
  }

  simulationStep() {
    Object.values(this.robots).forEach((robot) => {
      // console.log(this.inUse)
      const path = robot.currentPath()
      const prevPathIdx = robot.pathIdx
      if (!path) return
      const pathHash = this.hashPath(path.from, path.to)
      const reversePathHash = this.hashPath(path.to, path.from)
      const hashInUse = pathHash in this.inUse || reversePathHash in this.inUse
      const robotMatchesUser = this.inUse[pathHash] === robot.name

      if (!hashInUse) {
        this.inUse[pathHash] = robot.name
      } else if (robotMatchesUser) {
        robot.step(0.1)
      }

      if (robot.pathIdx !== prevPathIdx) {
        // console.log('moved')
        for (const key of Object.keys(this.inUse)) {
          if (this.inUse[key] === robot.name) {
            delete this.inUse[key]
          }
        }
        // console.log(this.inUse)
      }
    })
  }

  clone() {
    return cloneUtil(this)
  }
}
