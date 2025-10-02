// Convert Forza car data to tuneforge format
const fs = require('fs');
const path = require('path');

const CARS = [
  { id: 'abarth-124-spider-2017', make: 'Abarth', model: '124 Spider', year: 2017, weightLbs: 2337, distribution: 52, drivetrain: 'RWD', class: 'Modern Sports Cars' },
  { id: 'abarth-695-biposto-2016', make: 'Abarth', model: '695 Biposto', year: 2016, weightLbs: 2198, distribution: 64, drivetrain: 'FWD', class: 'Hot Hatch' },
  { id: 'abarth-fiat-131-1980', make: 'Abarth', model: 'Fiat 131', year: 1980, weightLbs: 2183, distribution: 53, drivetrain: 'RWD', class: 'Classic Rally' },
  { id: 'abarth-595-esseesse-1968', make: 'Abarth', model: '595 esseesse', year: 1968, weightLbs: 1102, distribution: 39, drivetrain: 'RWD', class: 'Cult Cars' },
  { id: 'acura-nsx-2017', make: 'Acura', model: 'NSX', year: 2017, weightLbs: 3878, distribution: 42, drivetrain: 'AWD', class: 'Modern Supercars' },
  { id: 'acura-rsx-type-s-2002', make: 'Acura', model: 'RSX Type-S', year: 2002, weightLbs: 2776, distribution: 61, drivetrain: 'FWD', class: 'Retro Hot Hatch' },
  { id: 'acura-integra-type-r-2001', make: 'Acura', model: 'Integra Type-R', year: 2001, weightLbs: 2639, distribution: 61, drivetrain: 'FWD', class: 'Retro Hot Hatch' },
  { id: 'alfa-romeo-giulia-quadrifoglio-2017', make: 'Alfa Romeo', model: 'Giulia Quadrifoglio', year: 2017, weightLbs: 3360, distribution: 50, drivetrain: 'RWD', class: 'Super Saloons' },
  { id: 'alfa-romeo-4c-2014', make: 'Alfa Romeo', model: '4C', year: 2014, weightLbs: 2469, distribution: 41, drivetrain: 'RWD', class: 'Modern Sports Cars' },
  { id: 'alfa-romeo-8c-competizione-2007', make: 'Alfa Romeo', model: '8C Competizione', year: 2007, weightLbs: 3494, distribution: 49, drivetrain: 'RWD', class: 'GT Cars' },
  { id: 'alfa-romeo-155-q4-1992', make: 'Alfa Romeo', model: '155 Q4', year: 1992, weightLbs: 3086, distribution: 60, drivetrain: 'AWD', class: 'Retro Saloons' },
  { id: 'alfa-romeo-33-stradale-1968', make: 'Alfa Romeo', model: '33 Stradale', year: 1968, weightLbs: 1543, distribution: 43, drivetrain: 'RWD', class: 'Classic Racers' },
  { id: 'alfa-romeo-giulia-sprint-gta-stradale-1965', make: 'Alfa Romeo', model: 'Giulia Sprint GTA Stradale', year: 1965, weightLbs: 1642, distribution: 54, drivetrain: 'RWD', class: 'Rare Classics' },
  { id: 'alfa-romeo-giulia-tz2-1965', make: 'Alfa Romeo', model: 'Giulia TZ2', year: 1965, weightLbs: 1367, distribution: 48, drivetrain: 'RWD', class: 'Classic Racers' },
  { id: 'alpine-a110-2017', make: 'Alpine', model: 'A110', year: 2017, weightLbs: 2432, distribution: 44, drivetrain: 'RWD', class: 'Modern Sports Cars' },
  { id: 'alpine-a110-1600s-1973', make: 'Alpine', model: 'A110 1600s', year: 1973, weightLbs: 1543, distribution: 38, drivetrain: 'RWD', class: 'Classic Rally' },
  { id: 'alumicraft-6165-trick-truck-2022', make: 'Alumicraft', model: '#6165 Trick Truck', year: 2022, weightLbs: 4200, distribution: 50, drivetrain: 'RWD', class: 'Unlimited Offroad' },
  { id: 'alumicraft-122-class-1-buggy-2021', make: 'Alumicraft', model: '#122 Class 1 Buggy', year: 2021, weightLbs: 3800, distribution: 45, drivetrain: 'RWD', class: 'Unlimited Buggies' },
  { id: 'alumicraft-class-10-race-car-2015', make: 'Alumicraft', model: 'Class 10 Race Car', year: 2015, weightLbs: 2200, distribution: 40, drivetrain: 'RWD', class: 'Unlimited Buggies' },
  { id: 'amc-gremlin-x-1973', make: 'AMC', model: 'Gremlin X', year: 1973, weightLbs: 2657, distribution: 56, drivetrain: 'RWD', class: 'Cult Cars' },
  { id: 'amc-javelin-amx-1971', make: 'AMC', model: 'Javelin AMX', year: 1971, weightLbs: 3263, distribution: 55, drivetrain: 'RWD', class: 'Classic Muscle' },
  { id: 'amc-rebel-the-machine-1970', make: 'AMC', model: 'Rebel The Machine', year: 1970, weightLbs: 3360, distribution: 56, drivetrain: 'RWD', class: 'Classic Muscle' },
  { id: 'amg-transport-dynamics-m12s-warthog-cst-2554', make: 'AMG Transport Dynamics', model: 'M12S Warthog CST', year: 2554, weightLbs: 7165, distribution: 50, drivetrain: 'AWD', class: 'Unlimited Offroad' },
  { id: 'apollo-intensa-emozione-2018', make: 'Apollo', model: 'Intensa Emozione', year: 2018, weightLbs: 2756, distribution: 45, drivetrain: 'RWD', class: 'Extreme Track Toys' },
  { id: 'apollo-intensa-emozione-welcome-pack-2018', make: 'Apollo', model: 'Intensa Emozione \'Welcome Pack\'', year: 2018, weightLbs: 2756, distribution: 45, drivetrain: 'RWD', class: 'Extreme Track Toys' },
  { id: 'ariel-nomad-2016', make: 'Ariel', model: 'Nomad', year: 2016, weightLbs: 1477, distribution: 42, drivetrain: 'RWD', class: 'Unlimited Buggies' },
  { id: 'ariel-atom-500-v8-2013', make: 'Ariel', model: 'Atom 500 V8', year: 2013, weightLbs: 1213, distribution: 40, drivetrain: 'RWD', class: 'Extreme Track Toys' },
  { id: 'ascari-kz1r-2012', make: 'Ascari', model: 'KZ1R', year: 2012, weightLbs: 2866, distribution: 42, drivetrain: 'RWD', class: 'Modern Supercars' },
  { id: 'aston-martin-valkyrie-2023', make: 'Aston Martin', model: 'Valkyrie', year: 2023, weightLbs: 2271, distribution: 44, drivetrain: 'RWD', class: 'Hypercars' },
  { id: 'aston-martin-valkyrie-amr-pro-2022', make: 'Aston Martin', model: 'Valkyrie AMR Pro', year: 2022, weightLbs: 2205, distribution: 45, drivetrain: 'RWD', class: 'Extreme Track Toys' },
  { id: 'aston-martin-dbx-2021', make: 'Aston Martin', model: 'DBX', year: 2021, weightLbs: 4947, distribution: 54, drivetrain: 'AWD', class: 'Sports Utility Heroes' },
  { id: 'aston-martin-dbs-superleggera-2019', make: 'Aston Martin', model: 'DBS Superleggera', year: 2019, weightLbs: 3732, distribution: 51, drivetrain: 'RWD', class: 'Super GT' },
  { id: 'aston-martin-valhalla-concept-car-2019', make: 'Aston Martin', model: 'Valhalla Concept Car', year: 2019, weightLbs: 3417, distribution: 48, drivetrain: 'AWD', class: 'Hypercars' },
  { id: 'aston-martin-vantage-2019', make: 'Aston Martin', model: 'Vantage', year: 2019, weightLbs: 3373, distribution: 50, drivetrain: 'RWD', class: 'GT Cars' },
  { id: 'aston-martin-db11-2017', make: 'Aston Martin', model: 'DB11', year: 2017, weightLbs: 3902, distribution: 51, drivetrain: 'RWD', class: 'Super GT' },
  { id: 'aston-martin-vanquish-zagato-coupe-2017', make: 'Aston Martin', model: 'Vanquish Zagato Coupe', year: 2017, weightLbs: 3845, distribution: 51, drivetrain: 'RWD', class: 'Super GT' },
  { id: 'aston-martin-vulcan-amr-pro-2017', make: 'Aston Martin', model: 'Vulcan AMR Pro', year: 2017, weightLbs: 2976, distribution: 50, drivetrain: 'RWD', class: 'Extreme Track Toys' },
  { id: 'aston-martin-vantage-gt12-2016', make: 'Aston Martin', model: 'Vantage GT12', year: 2016, weightLbs: 3450, distribution: 51, drivetrain: 'RWD', class: 'Track Toys' },
  { id: 'aston-martin-v12-vantage-s-2013', make: 'Aston Martin', model: 'V12 Vantage S', year: 2013, weightLbs: 3671, distribution: 52, drivetrain: 'RWD', class: 'Super GT' },
  { id: 'aston-martin-one-77-2010', make: 'Aston Martin', model: 'One-77', year: 2010, weightLbs: 3594, distribution: 49, drivetrain: 'RWD', class: 'Super GT' },
  { id: 'aston-martin-dbs-2008', make: 'Aston Martin', model: 'DBS', year: 2008, weightLbs: 3737, distribution: 51, drivetrain: 'RWD', class: 'GT Cars' },
  { id: 'aston-martin-lagonda-1990', make: 'Aston Martin', model: 'Lagonda', year: 1990, weightLbs: 4575, distribution: 51, drivetrain: 'RWD', class: 'Retro Sports Cars' },
  { id: 'aston-martin-db5-1964', make: 'Aston Martin', model: 'DB5', year: 1964, weightLbs: 3230, distribution: 50, drivetrain: 'RWD', class: 'Rare Classics' },
  { id: 'aston-martin-dbr1-1958', make: 'Aston Martin', model: 'DBR1', year: 1958, weightLbs: 1768, distribution: 49, drivetrain: 'RWD', class: 'Classic Racers' }
];

function convertToTuneForgeFormat(cars) {
  return cars.map(car => {
    const weightKg = Math.round(car.weightLbs * 0.453592);
    const type = getCarType(car.class);
    const country = getCountry(car.make);
    const rarity = getRarity(car.class);
    const stats = generateStats(car);
    const pi = generatePI(car);
    const price = generatePrice(car, rarity, pi.class);

    return {
      year: car.year.toString(),
      manufacturer: car.make,
      model: car.model,
      type: type,
      price: price,
      rarity: rarity,
      country: country,
      drivetrain: car.drivetrain,
      weight: weightKg,
      distribution: car.distribution,
      stats: stats,
      pi: pi,
      fullName: `${car.year} ${car.make} ${car.model}`,
      tags: generateTags(car)
    };
  });
}

function getCarType(forzaClass) {
  const typeMap = {
    'Modern Sports Cars': 'Sports Car',
    'Hot Hatch': 'Sports Car',
    'Classic Rally': 'Rally Car',
    'Cult Cars': 'Classic',
    'Modern Supercars': 'Supercar',
    'Retro Hot Hatch': 'Sports Car',
    'Super Saloons': 'Sedan',
    'GT Cars': 'Sports Car',
    'Sports Utility Heroes': 'SUV',
    'Super GT': 'Supercar',
    'Extreme Track Toys': 'Track Car',
    'Track Toys': 'Track Car',
    'Rare Classics': 'Classic',
    'Classic Racers': 'Classic',
    'Unlimited Offroad': 'Offroad',
    'Unlimited Buggies': 'Offroad',
    'Classic Muscle': 'Sports Car',
    'Retro Sports Cars': 'Sports Car',
    'Hypercars': 'Hypercar',
    'Rally Monsters': 'Rally Car',
    'Retro Saloons': 'Sedan',
    'Pickups & 4x4s': 'Truck',
    'Vans & Utility': 'Van',
    'Modern Muscle': 'Sports Car',
    'Retro Muscle': 'Sports Car',
    'Drift Cars': 'Sports Car',
    'Rods and Customs': 'Classic',
    'UTV\'s': 'Offroad',
    'Vintage Racers': 'Classic'
  };
  return typeMap[forzaClass] || 'Sports Car';
}

function getCountry(make) {
  const countryMap = {
    'Abarth': 'Italy', 'Acura': 'Japan', 'Alfa Romeo': 'Italy', 'Alpine': 'France',
    'Alumicraft': 'United States', 'AMC': 'United States', 'AMG Transport Dynamics': 'United States',
    'Apollo': 'Germany', 'Ariel': 'United Kingdom', 'Ascari': 'United Kingdom',
    'Aston Martin': 'United Kingdom', 'ATS': 'Italy', 'Audi': 'Germany',
    'Austin-Healey': 'United Kingdom', 'Auto Union': 'Germany', 'Automobili Pininfarina': 'Italy',
    'Autozam': 'Japan', 'BAC': 'United Kingdom', 'Bentley': 'United Kingdom',
    'BMW': 'Germany', 'Brabham': 'Australia', 'Bugatti': 'France', 'Buick': 'United States',
    'Cadillac': 'United States', 'Can-Am': 'Canada', 'Casey Currie Motorsports': 'United States',
    'Caterham': 'United Kingdom', 'Chevrolet': 'United States', 'Citroën': 'France',
    'CUPRA': 'Spain', 'Czinger': 'United States', 'Datsun': 'Japan', 'DeBerti': 'United States',
    'DeLorean': 'United States', 'Dodge': 'United States', 'Donkervoort': 'Netherlands',
    'DS Automobiles': 'France', 'Eagle': 'United Kingdom', 'Elemental': 'United Kingdom',
    'Exomotive': 'United States', 'Extreme E': 'International', 'Fast and Furious': 'United States',
    'Ferrari': 'Italy', 'FIAT': 'Italy', 'Ford': 'United States', 'Formula Drift': 'United States',
    'Forsberg Racing': 'United States', 'Funco Motorsports': 'United States', 'GMC': 'United States',
    'Hennessey': 'United States', 'Holden': 'Australia', 'Honda': 'Japan', 'Hoonigan': 'United States',
    'Hot Wheels': 'United States', 'HSV': 'Australia', 'Hummer': 'United States', 'Hyundai': 'South Korea',
    'Infiniti': 'Japan'
  };
  return countryMap[make] || 'United States';
}

function getRarity(forzaClass) {
  const rarityMap = {
    'Cult Cars': 'Rare', 'Classic Rally': 'Epic', 'Hot Hatch': 'Common',
    'Modern Sports Cars': 'Rare', 'Modern Supercars': 'Epic', 'Retro Hot Hatch': 'Rare',
    'Super Saloons': 'Epic', 'GT Cars': 'Rare', 'Sports Utility Heroes': 'Common',
    'Super GT': 'Epic', 'Extreme Track Toys': 'Legendary', 'Track Toys': 'Epic',
    'Rare Classics': 'Legendary', 'Classic Racers': 'Legendary', 'Unlimited Offroad': 'Epic',
    'Unlimited Buggies': 'Epic', 'Classic Muscle': 'Epic', 'Retro Sports Cars': 'Rare',
    'Hypercars': 'Legendary', 'Rally Monsters': 'Epic', 'Retro Saloons': 'Rare',
    'Pickups & 4x4s': 'Common', 'Vans & Utility': 'Common', 'Modern Muscle': 'Epic',
    'Retro Muscle': 'Rare', 'Drift Cars': 'Rare', 'Rods and Customs': 'Rare',
    'UTV\'s': 'Common', 'Vintage Racers': 'Legendary'
  };
  return rarityMap[forzaClass] || 'Common';
}

function generateStats(car) {
  const baseStats = {
    speed: Math.random() * 4 + 6,
    handling: Math.random() * 4 + 6,
    acceleration: Math.random() * 4 + 6,
    launch: Math.random() * 4 + 6,
    braking: Math.random() * 4 + 6,
    offroad: Math.random() * 4 + 3
  };

  if (car.class.includes('Track') || car.class.includes('Racing')) {
    baseStats.speed += 2;
    baseStats.handling += 1.5;
  }
  if (car.class.includes('Offroad') || car.class.includes('Rally')) {
    baseStats.offroad += 3;
  }
  if (car.drivetrain === 'AWD') {
    baseStats.launch += 1;
  }

  Object.keys(baseStats).forEach(key => {
    baseStats[key] = Math.min(10, Math.max(2, Math.round(baseStats[key] * 10) / 10));
  });

  return baseStats;
}

function generatePI(car) {
  let piValue = 600;
  
  if (car.class.includes('Hypercar') || car.class.includes('Extreme')) piValue = 950;
  else if (car.class.includes('Supercar') || car.class.includes('Super')) piValue = 850;
  else if (car.class.includes('Modern') || car.class.includes('Track')) piValue = 750;
  else if (car.class.includes('Classic') || car.class.includes('Retro')) piValue = 650;
  
  piValue += Math.random() * 100 - 50;
  piValue = Math.max(500, Math.min(998, Math.round(piValue)));
  
  let piClass = 'B';
  if (piValue >= 900) piClass = 'S2';
  else if (piValue >= 800) piClass = 'S1';
  else if (piValue >= 700) piClass = 'A';
  else if (piValue >= 600) piClass = 'B';
  else if (piValue >= 500) piClass = 'C';
  else piClass = 'D';
  
  return { class: piClass, value: piValue };
}

function generatePrice(car, rarity, piClass) {
  const basePrices = { 'D': 25000, 'C': 45000, 'B': 75000, 'A': 150000, 'S1': 300000, 'S2': 800000 };
  const rarityMultipliers = { 'Common': 1.0, 'Rare': 1.5, 'Epic': 2.5, 'Legendary': 4.0 };
  
  const basePrice = basePrices[piClass] || 50000;
  const multiplier = rarityMultipliers[rarity] || 1.0;
  const yearFactor = Math.max(0.5, (car.year - 1950) / 100);
  
  return Math.round(basePrice * multiplier * yearFactor);
}

function generateTags(car) {
  const tags = [];
  
  if (car.year <= 1990) tags.push('Classic');
  else if (car.year <= 2000) tags.push('Retro');
  
  if (['Honda', 'Toyota', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Acura', 'Infiniti'].includes(car.make)) {
    tags.push('JDM');
  }
  
  if (car.class.includes('Track') || car.class.includes('Racing')) tags.push('Performance');
  if (car.class.includes('Drift')) tags.push('Drift');
  if (car.class.includes('Rally')) tags.push('Rally');
  if (car.class.includes('Muscle')) tags.push('Muscle');
  
  return tags;
}

// Convert and save
const convertedCars = convertToTuneForgeFormat(CARS);
const outputPath = path.join(__dirname, '..', 'public', 'tuneforge-cars-forza5.json');

fs.writeFileSync(outputPath, JSON.stringify(convertedCars, null, 2));
console.log(`Converted ${convertedCars.length} cars and saved to ${outputPath}`);