const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/carColors.json', 'utf8'));
const names = ["Acier", "Panthera", "Rosegold Liquid", "Dark", "Ultimate", "Gris", "Noir", "Precious", "Heavy"];
const bugged = data.filter(c => names.includes(c.colorName));
console.log(JSON.stringify(bugged.map(c => ({ name: c.colorName, make: c.make, model: c.model, c1: c.color1, c2: c.color2 })), null, 2));
