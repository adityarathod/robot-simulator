import SimMap from '../sim/map'
import clone from './clone'
import { parseLocation, ParseResult } from './parser'

const mutationReducer = (oldMap: SimMap, result: ParseResult) => {
  const map = clone(oldMap)

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
      const hash = map.hashPath(
        extracted['from'].trim(),
        extracted['to'].trim(),
      )
      map.removePathByHash(hash)
      break
    default:
      throw new Error('Unknown map mutation')
  }

  return map
}

export default mutationReducer
