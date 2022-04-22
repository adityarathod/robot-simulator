import nlp from 'compromise/two'

export interface ParseQuery {
  type: string
  query: string
  keys: string[]
}

export type ParseResult = Omit<ParseQuery, 'query'> & {
  extracted: { [key: string]: string }
}

export const queryHierarchy: ParseQuery[] = [
  {
    type: 'ADD_LOCATION',
    query: 'add (location|point|waypoint) [<label>.+] [<loc>#Value+]',
    keys: ['label', 'loc'],
  },
  {
    type: 'REMOVE_LOCATION_BY_COORDS',
    query: 'remove (location|point|waypoint) [<loc>#Value+]',
    keys: ['loc'],
  },
  {
    type: 'REMOVE_LOCATION_BY_NAME',
    query: 'remove (location|point|waypoint) [<label>.+]',
    keys: ['label'],
  },
  {
    type: 'ADD_PATH',
    query: 'add (path|edge) from? [<from>.+] (to|>) [<to>.+]',
    keys: ['from', 'to'],
  },
  {
    type: 'REMOVE_PATH',
    query: 'remove (path|edge) from? [<from>.+] (to|>) [<to>.+]',
    keys: ['from', 'to'],
  },
  {
    type: 'SHORTEST_PATH',
    query: 'sp from? [<from>.+] (to|>) [<to>.+]',
    keys: ['from', 'to'],
  },
  {
    type: 'ADD_ROBOT',
    query: 'add (robot|bot) [<name>.+] at [<location>.+]',
    keys: ['name', 'location'],
  },
  {
    type: 'ADD_BOT_DEST',
    query: 'move (robot|bot)? [<name>.+] to [<label>.+]',
    keys: ['name', 'label'],
  },
  {
    type: 'DELETE_BOT',
    query: 'remove (robot|bot) [<name>.+]',
    keys: ['name'],
  },
  {
    type: 'HELP',
    query: 'need? help me?',
    keys: [],
  },
]

export default function parse(query: string): ParseResult | null {
  const doc = nlp(query)

  for (let queryType of queryHierarchy) {
    const match = doc.match(queryType.query)
    if (match.text() === '') continue
    let groups = match.groups() as any
    if (!groups) continue
    let extracted: { [x: string]: string } = {}
    for (const queryKey of queryType.keys) {
      if (!(queryKey in groups)) {
        return null
      }
      const view = (groups as any)[queryKey]
      extracted[queryKey] = view.out('text') as string
    }

    return {
      type: queryType.type,
      keys: queryType.keys,
      extracted,
    }
  }

  return null
}

export function parseLocation(loc: string): { x: number; y: number } {
  const badChars = /[\(\)]/g
  const cleaned = loc.replace(badChars, '')
  const extracted = Array.from(cleaned.matchAll(/\d+/g)).map((x) => x[0])
  if (extracted == null || extracted.length !== 2) {
    throw new Error('Location given cannot be parsed into (x,y) pair')
  }
  return { x: parseInt(extracted[0]), y: parseInt(extracted[1]) }
}
