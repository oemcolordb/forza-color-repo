const fs=require('fs');
const p=require('path');
const data=JSON.parse(fs.readFileSync(p.join(process.cwd(),'public/data/fh5-locations-enhanced.json'),'utf8'));
const locations=data.locations||[];
const typesInData=new Set(locations.map(l=>l.type));
const allKnownTypes=[
'Expedition','Festival Site','Landmark','Player House','Playground Game','Showcase',
'Barn Find','Fast Travel Board','Treasure','XP Board',
'Cross Country Event','Dirt Racing Event','Drag Racing Event','Road Racing Event','Street Racing Event',
'Born Fast','El Camino','Lucha de Carreteras','Test Driver','V10','Vocho',
'Danger Sign','Drift Zone','Speed Trap','Speed Zone','Trailblazer',
'Expedition Accolade','Miscellaneous','Trailblazer Finish','Vehicle'
];
const missing=allKnownTypes.filter(t=>!typesInData.has(t));
const byType={}; for(const l of locations){byType[l.type]=(byType[l.type]||0)+1}
console.log(JSON.stringify({present:[...typesInData].sort(), missingCount:missing.length, missingTypes:missing, byType},null,2));
