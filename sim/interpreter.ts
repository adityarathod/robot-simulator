import parse, { parseLocation, ParseResult } from '../util/command-parser'
import clone from '../util/clone'

import SimMap from './map'
import SimRobot from './robot'

const HELP_STR = `Usage notes:

Adding locations
    add (location|point|waypoint) <label> <coords>
Removing locations
    remove (location|point|waypoint) <label>
Adding paths
    add (path|edge) from? <waypointA> (to|>) <waypointB>
Removing paths
    remove (path|edge) from? <waypointA> (to|>) <waypointB>
Shortest path printer
    sp from? <waypointA> (to|>) <waypointB>
Add robot
    add (robot|bot) <name> at <waypoint>
Add robot destination
    move (robot|bot)? <name> to <waypoint>
Remove robot
    remove (robot|bot) <name>
`

const runCommand = (
  command: string,
  map: SimMap,
): { newMap: SimMap | null; output: string } => {
  let output: string = 'done.'
  let newMap: SimMap | null = null

  try {
    const result = parse(command)
    if (result === null) {
      output = `i don't understand that :(`
    } else if (result.type === 'HELP') {
      output = HELP_STR
    } else {
      let { map: mapN, output: reducerOutput } = mutationReducer(map, result)
      newMap = mapN
      output = reducerOutput ?? output
    }
  } catch (err: any) {
    output = `i got an error :((\n${err.message?.toLowerCase() || err}`
  }

  return { newMap, output }
}

export default runCommand

const mutationReducer = (
  oldMap: SimMap,
  result: ParseResult,
): { output: string | null; map: SimMap } => {
  const map = clone(oldMap)
  let output: string | null = null

  const { extracted, type } = result
  switch (type) {
    case 'ADD_LOCATION':
      map.addLocation({
        label: extracted['label'],
        ...parseLocation(extracted['loc']),
      })
      break
    case 'REMOVE_LOCATION_BY_COORDS':
      const { x, y } = parseLocation(extracted['loc'])
      map.removeLocationByCoords(x, y)
      break
    case 'REMOVE_LOCATION_BY_NAME':
      map.removeLocationByLabel(extracted['label'])
      break
    case 'ADD_PATH':
      map.addPath({
        from: extracted['from'].trim(),
        to: extracted['to'].trim(),
      })
      break
    case 'REMOVE_PATH':
      map.removePath(extracted['from'].trim(), extracted['from'].trim())
      break
    case 'SHORTEST_PATH':
      const shortestPath = map.findShortestPath(
        extracted['from'].trim(),
        extracted['to'].trim(),
      )
      output = JSON.stringify(shortestPath)
      break
    case 'ADD_ROBOT':
      const loc = map.locations[extracted['location'].trim()]
      const robo = new SimRobot(extracted['name'].trim(), loc)
      map.addRobot(robo)
      break
    case 'ADD_BOT_DEST':
      const location = map.locations[extracted['label'].trim()]
      const name = extracted['name'].trim()
      map.addRobotDestination(name, location.label)
      break
    case 'DELETE_BOT':
      const robot = map.robots[extracted['name'].trim()]
      if (!robot.completedPathing()) {
        throw new Error('Robot is not done with pathing. Cannot remove.')
      }
      delete map.robots[extracted['name'].trim()]
      break
    default:
      throw new Error('Unknown map mutation')
  }

  return { map, output }
}
