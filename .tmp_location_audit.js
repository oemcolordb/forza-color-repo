const fs = require('fs');
const path = require('path');
const dataPath = path.join(process.cwd(), 'public', 'data', 'fh5-locations-enhanced.json');
const mapCompPath = path.join(process.cwd(), 'app', 'location-finder', 'ProfessionalMap.tsx');
const raw = JSON.parse(fs.readFileSync(dataPath,'utf8'));
const locations = raw.locations || [];
const byId = new Map();
const duplicateIds = [];
for (const l of locations){
  if(byId.has(l.id)) duplicateIds.push(l.id);
  else byId.set(l.id,l);
}
const coordKey = l => `${Number(l.coordinates?.x).toFixed(4)},${Number(l.coordinates?.y).toFixed(4)}`;
const byCoord = new Map();
for (const l of locations){
  const key = coordKey(l);
  if(!byCoord.has(key)) byCoord.set(key,[]);
  byCoord.get(key).push(l);
}
const duplicateCoordGroups = [...byCoord.entries()].filter(([,arr])=>arr.length>1);

const typeToCategory = {
  'Expedition':'LOCATIONS','Festival Site':'LOCATIONS','Landmark':'LOCATIONS','Player House':'LOCATIONS','Playground Game':'LOCATIONS','Showcase':'LOCATIONS',
  'Barn Find':'COLLECTIBLES','Fast Travel Board':'COLLECTIBLES','Treasure':'COLLECTIBLES','XP Board':'COLLECTIBLES',
  'Cross Country Event':'RACE EVENTS','Dirt Racing Event':'RACE EVENTS','Drag Racing Event':'RACE EVENTS','Road Racing Event':'RACE EVENTS','Street Racing Event':'RACE EVENTS',
  'Born Fast':'HORIZON STORIES','El Camino':'HORIZON STORIES','Lucha de Carreteras':'HORIZON STORIES','Test Driver':'HORIZON STORIES','V10':'HORIZON STORIES','Vocho':'HORIZON STORIES',
  'Danger Sign':'PR STUNTS','Drift Zone':'PR STUNTS','Speed Trap':'PR STUNTS','Speed Zone':'PR STUNTS','Trailblazer':'PR STUNTS',
  'Expedition Accolade':'OTHER','Miscellaneous':'OTHER','Trailblazer Finish':'OTHER','Vehicle':'OTHER'
};
const mismatches = [];
const unknownTypes = new Set();
for(const l of locations){
  const expectedCat = typeToCategory[l.type];
  if(!expectedCat) unknownTypes.add(l.type);
  else if(l.category !== expectedCat) mismatches.push({id:l.id,type:l.type,category:l.category,expected:expectedCat});
}

const typeCounts = new Map();
for(const l of locations){ typeCounts.set(l.type,(typeCounts.get(l.type)||0)+1); }
const categoryCounts = new Map();
for(const l of locations){ categoryCounts.set(l.category,(categoryCounts.get(l.category)||0)+1); }

const mapCompText = fs.readFileSync(mapCompPath,'utf8');
const markerColorTypes = [...mapCompText.matchAll(/'([^']+)'\s*:\s*'#[0-9a-fA-F]{6}'/g)].map(m=>m[1]);
const markerSet = new Set(markerColorTypes);
const typesInData = new Set([...typeCounts.keys()]);
const dataTypesWithoutUniqueMarker = [...typesInData].filter(t=>!markerSet.has(t)).sort();

const outOfRange = locations.filter(l=>!(Number.isFinite(l.coordinates?.x)&&Number.isFinite(l.coordinates?.y)&&l.coordinates.x>=0&&l.coordinates.x<=100&&l.coordinates.y>=0&&l.coordinates.y<=100));

const metadataTotal = raw?.metadata?.totalLocations;
const categoryMeta = raw?.categories || {};
const metaSums = {
  collectibles: Object.values(categoryMeta.collectibles||{}).reduce((a,b)=>a+Number(b||0),0),
  locations: Object.values(categoryMeta.locations||{}).reduce((a,b)=>a+Number(b||0),0),
  races: Object.values(categoryMeta.races||{}).reduce((a,b)=>a+Number(b||0),0),
  prStunts: Object.values(categoryMeta.prStunts||{}).reduce((a,b)=>a+Number(b||0),0)
};
const metaGrand = Object.values(metaSums).reduce((a,b)=>a+b,0);

console.log(JSON.stringify({
  fileTotal: locations.length,
  metadataTotal,
  metadataBreakdownSum: metaGrand,
  metaSums,
  duplicateIdCount: duplicateIds.length,
  duplicateIds: duplicateIds.slice(0,20),
  duplicateCoordinateGroupCount: duplicateCoordGroups.length,
  duplicateCoordinateExamples: duplicateCoordGroups.slice(0,15).map(([coord,arr])=>({coord,count:arr.length,ids:arr.map(x=>x.id)})),
  outOfRangeCount: outOfRange.length,
  categoryCounts: Object.fromEntries([...categoryCounts.entries()].sort((a,b)=>a[0].localeCompare(b[0]))),
  typeCount: typeCounts.size,
  topTypes: [...typeCounts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,20),
  categoryMismatchCount: mismatches.length,
  categoryMismatchExamples: mismatches.slice(0,25),
  unknownTypeCount: unknownTypes.size,
  unknownTypes: [...unknownTypes],
  markerColorTypeCount: markerSet.size,
  dataTypesWithoutUniqueMarker,
}, null, 2));
