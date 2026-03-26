const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()
const DATA_PATH = path.join(ROOT, 'public', 'data', 'fh5-locations-enhanced.json')
const MAP_COMPONENT_PATH = path.join(ROOT, 'app', 'location-finder', 'ProfessionalMap.tsx')

const KNOWN_TYPES = [
  'Expedition',
  'Festival Site',
  'Landmark',
  'Player House',
  'Playground Game',
  'Showcase',
  'Barn Find',
  'Fast Travel Board',
  'Treasure',
  'XP Board',
  'Cross Country Event',
  'Dirt Racing Event',
  'Drag Racing Event',
  'Road Racing Event',
  'Street Racing Event',
  'Born Fast',
  'El Camino',
  'Lucha de Carreteras',
  'Test Driver',
  'V10',
  'Vocho',
  'Danger Sign',
  'Drift Zone',
  'Speed Trap',
  'Speed Zone',
  'Trailblazer',
  'Expedition Accolade',
  'Miscellaneous',
  'Trailblazer Finish',
  'Vehicle',
]

const TYPE_TO_CATEGORY = {
  Expedition: 'LOCATIONS',
  'Festival Site': 'LOCATIONS',
  Landmark: 'LOCATIONS',
  'Player House': 'LOCATIONS',
  'Playground Game': 'LOCATIONS',
  Showcase: 'LOCATIONS',
  'Barn Find': 'COLLECTIBLES',
  'Fast Travel Board': 'COLLECTIBLES',
  Treasure: 'COLLECTIBLES',
  'XP Board': 'COLLECTIBLES',
  'Cross Country Event': 'RACE EVENTS',
  'Dirt Racing Event': 'RACE EVENTS',
  'Drag Racing Event': 'RACE EVENTS',
  'Road Racing Event': 'RACE EVENTS',
  'Street Racing Event': 'RACE EVENTS',
  'Born Fast': 'HORIZON STORIES',
  'El Camino': 'HORIZON STORIES',
  'Lucha de Carreteras': 'HORIZON STORIES',
  'Test Driver': 'HORIZON STORIES',
  V10: 'HORIZON STORIES',
  Vocho: 'HORIZON STORIES',
  'Danger Sign': 'PR STUNTS',
  'Drift Zone': 'PR STUNTS',
  'Speed Trap': 'PR STUNTS',
  'Speed Zone': 'PR STUNTS',
  Trailblazer: 'PR STUNTS',
  'Expedition Accolade': 'OTHER',
  Miscellaneous: 'OTHER',
  'Trailblazer Finish': 'OTHER',
  Vehicle: 'OTHER',
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function getMarkerTypes(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  return new Set([...text.matchAll(/'([^']+)'\s*:\s*'#[0-9a-fA-F]{6}'/g)].map(m => m[1]))
}

function validate() {
  const data = loadJson(DATA_PATH)
  const locations = data.locations || []
  const markerTypes = getMarkerTypes(MAP_COMPONENT_PATH)

  const ids = new Set()
  const duplicateIds = []
  const duplicateCoords = new Map()
  const outOfRange = []
  const categoryMismatches = []
  const unknownTypes = new Set()
  const presentTypes = new Set()

  for (const location of locations) {
    if (ids.has(location.id)) duplicateIds.push(location.id)
    ids.add(location.id)

    presentTypes.add(location.type)

    const expectedCategory = TYPE_TO_CATEGORY[location.type]
    if (!expectedCategory) unknownTypes.add(location.type)
    else if (location.category !== expectedCategory) {
      categoryMismatches.push({
        id: location.id,
        type: location.type,
        category: location.category,
        expectedCategory,
      })
    }

    const x = Number(location.coordinates?.x)
    const y = Number(location.coordinates?.y)

    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 100 || y < 0 || y > 100) {
      outOfRange.push({ id: location.id, coordinates: location.coordinates })
    }

    const coordKey = `${x.toFixed(4)},${y.toFixed(4)}`
    if (!duplicateCoords.has(coordKey)) duplicateCoords.set(coordKey, [])
    duplicateCoords.get(coordKey).push(location.id)
  }

  const duplicateCoordinateGroups = [...duplicateCoords.entries()]
    .filter(([, idsAtCoord]) => idsAtCoord.length > 1)
    .map(([coordinate, idsAtCoord]) => ({ coordinate, ids: idsAtCoord }))

  const missingKnownTypes = KNOWN_TYPES.filter(type => !presentTypes.has(type))
  const presentTypesWithoutUniqueMarker = [...presentTypes].filter(type => !markerTypes.has(type))

  const errors = []
  const warnings = []

  if (duplicateIds.length) errors.push(`Duplicate IDs: ${duplicateIds.join(', ')}`)
  if (duplicateCoordinateGroups.length)
    warnings.push(`Duplicate coordinates: ${duplicateCoordinateGroups.length} groups`)
  if (outOfRange.length) errors.push(`Out-of-range coordinates: ${outOfRange.length}`)
  if (categoryMismatches.length) errors.push(`Category mismatches: ${categoryMismatches.length}`)
  if (unknownTypes.size) errors.push(`Unknown types: ${[...unknownTypes].join(', ')}`)
  if (presentTypesWithoutUniqueMarker.length)
    warnings.push(`Present types without unique marker color: ${presentTypesWithoutUniqueMarker.join(', ')}`)
  if (missingKnownTypes.length)
    warnings.push(`Known types missing from dataset: ${missingKnownTypes.length}`)

  const report = {
    totals: {
      locations: locations.length,
      uniqueTypes: presentTypes.size,
      markerTypes: markerTypes.size,
    },
    duplicateIds,
    duplicateCoordinateGroups,
    outOfRange,
    categoryMismatches,
    unknownTypes: [...unknownTypes],
    presentTypesWithoutUniqueMarker,
    missingKnownTypes,
    status: {
      errors,
      warnings,
    },
  }

  console.log(JSON.stringify(report, null, 2))

  if (errors.length > 0) {
    process.exit(1)
  }
}

validate()
