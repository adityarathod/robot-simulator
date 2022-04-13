export interface SimMap {
  size: [number, number]
  locations: { [key: LocationLabel]: SimLocation }
  paths: { [key: PathHash]: SimPath }
  inUse: Set<PathHash>
}

export type LocationLabel = string

export interface SimLocation {
  label: LocationLabel
  x: number
  y: number
}

export type PathHash = string

export interface SimPath {
  length: number
  from: LocationLabel
  to: LocationLabel
}

export type SimPathToAdd = Omit<SimPath, 'length'>
