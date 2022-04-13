import dist from '../util/distance'
import {
  LocationLabel,
  PathHash,
  SimLocation,
  SimPath,
  SimPathToAdd,
} from './types'

export const MAP_SIZE: [number, number] = [100, 100]

export default class SimMap {
  size: [number, number] = [...MAP_SIZE]
  locations: { [key: LocationLabel]: SimLocation } = {}
  locationsByCoord: { [hash: string]: LocationLabel } = {}
  paths: { [key: PathHash]: SimPath } = {}
  // locationsInPaths: Set<LocationLabel> = new Set()
  inUse: Set<PathHash> = new Set()

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
    return Object.values(this.paths).some(
      (path) => path.from === label || path.to === label,
    )
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
  }

  removeLocationByLabel(label: string) {
    if (!(label in this.locations)) {
      throw new Error('Location not found in possible locations')
    } else if (this.isInAnyPath(label)) {
      throw new Error('Cannot remove location that is part of path')
    }
    const locationHash = this.hashLocation(this.locations[label])
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
    if (!(newPath.from in this.locations) || !(newPath.to in this.locations)) {
      throw new Error(
        'Path cannot be made since one of {from, to} is non-existent',
      )
    }

    const pathHash = this.hashPath(newPath.from, newPath.to)
    if (pathHash in this.paths) {
      throw new Error(
        `Path between ${newPath.from} and ${newPath.to} already exists`,
      )
    }

    const fromCoords = this.locations[newPath.from]
    const toCoords = this.locations[newPath.to]

    const distance = dist(fromCoords.x, fromCoords.y, toCoords.x, toCoords.y)
    const path: SimPath = { ...newPath, length: distance }
    this.paths[pathHash] = path
  }

  removePathByHash(hash: PathHash) {
    if (hash in this.inUse) {
      throw new Error(`Cannot remove path ${hash} that is in use`)
    }

    if (hash in this.paths) {
      delete this.paths[hash]
    } else {
      throw new Error('Path does not exist in paths')
    }
  }
}
