// Car Data Management (JavaScript)

export const SAMPLE_CARS = [
    {
        year: "2020",
        manufacturer: "Porsche",
        model: "911 Turbo S",
        type: "Sports Car",
        fullName: "2020 Porsche 911 Turbo S",
        country: "Germany",
        rarity: "Epic",
        stats: {
            speed: 9.2,
            handling: 8.5,
            acceleration: 9.0,
            launch: 8.8,
            braking: 8.7,
            offroad: 4.2
        },
        pi: {
            class: "S2",
            value: 998
        },
        drivetrain: "AWD",
        weight: 1640,
        engine: {
            displacement: 3.8,
            cylinders: 6,
            aspiration: "Turbo",
            horsepower: 640
        },
        tags: ["Performance", "Supercar"],
        price: 230000
    },
    {
        year: "2019",
        manufacturer: "McLaren",
        model: "720S",
        type: "Supercar",
        fullName: "2019 McLaren 720S",
        country: "United Kingdom",
        rarity: "Legendary",
        stats: {
            speed: 9.5,
            handling: 8.8,
            acceleration: 9.3,
            launch: 8.5,
            braking: 8.9,
            offroad: 3.8
        },
        pi: {
            class: "S2",
            value: 920
        },
        drivetrain: "RWD",
        weight: 1419,
        engine: {
            displacement: 4.0,
            cylinders: 8,
            aspiration: "Turbo",
            horsepower: 710
        },
        tags: ["Supercar", "Performance"],
        price: 300000
    },
    {
        year: "2021",
        manufacturer: "Toyota",
        model: "GR Supra",
        type: "Sports Car",
        fullName: "2021 Toyota GR Supra",
        country: "Japan",
        rarity: "Rare",
        stats: {
            speed: 7.8,
            handling: 7.5,
            acceleration: 7.2,
            launch: 7.0,
            braking: 7.3,
            offroad: 4.5
        },
        pi: {
            class: "A",
            value: 800
        },
        drivetrain: "RWD",
        weight: 1542,
        engine: {
            displacement: 3.0,
            cylinders: 6,
            aspiration: "Turbo",
            horsepower: 382
        },
        tags: ["JDM", "Performance"],
        price: 60000
    },
    {
        year: "2022",
        manufacturer: "Ford",
        model: "Mustang Shelby GT500",
        type: "Sports Car",
        fullName: "2022 Ford Mustang Shelby GT500",
        country: "United States",
        rarity: "Epic",
        stats: {
            speed: 8.9,
            handling: 7.2,
            acceleration: 8.5,
            launch: 8.8,
            braking: 7.8,
            offroad: 4.0
        },
        pi: {
            class: "S1",
            value: 900
        },
        drivetrain: "RWD",
        weight: 1928,
        engine: {
            displacement: 5.2,
            cylinders: 8,
            aspiration: "Supercharged",
            horsepower: 760
        },
        tags: ["Performance", "Muscle"],
        price: 85000
    },
    {
        year: "2020",
        manufacturer: "Lamborghini",
        model: "Huracán EVO",
        type: "Supercar",
        fullName: "2020 Lamborghini Huracán EVO",
        country: "Italy",
        rarity: "Legendary",
        stats: {
            speed: 9.1,
            handling: 8.6,
            acceleration: 8.9,
            launch: 8.4,
            braking: 8.8,
            offroad: 3.5
        },
        pi: {
            class: "S2",
            value: 950
        },
        drivetrain: "AWD",
        weight: 1422,
        engine: {
            displacement: 5.2,
            cylinders: 10,
            aspiration: "NA",
            horsepower: 630
        },
        tags: ["Supercar", "Performance"],
        price: 280000
    }
];

export class CarDataManager {
    static async loadCars() {
        try {
            const response = await fetch('/api/cars');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('Failed to load cars from API, using sample data');
        }
        return SAMPLE_CARS;
    }

    static getCarType(manufacturer, model) {
        const sportsCars = ['911', 'corvette', 'mustang', 'camaro', 'challenger', 'viper', 'nsx', 'supra', 'gt-r', 'rx-7', 'rx-8'];
        const supercars = ['ferrari', 'lamborghini', 'mclaren', 'aston martin', 'bugatti'];
        const trucks = ['f-150', 'silverado', 'ram', 'tacoma', 'tundra', 'ranger'];
        const suvs = ['suburban', 'tahoe', 'escalade', 'navigator', 'expedition'];
        
        const modelLower = model.toLowerCase();
        const manufacturerLower = manufacturer.toLowerCase();
        
        if (supercars.some(brand => manufacturerLower.includes(brand))) return 'Supercar';
        if (sportsCars.some(car => modelLower.includes(car))) return 'Sports Car';
        if (trucks.some(truck => modelLower.includes(truck))) return 'Truck';
        if (suvs.some(suv => modelLower.includes(suv))) return 'SUV';
        
        return 'Sports Car';
    }

    static getDrivetrain(manufacturer, model) {
        const awd = ['subaru', 'audi', 'lamborghini'];
        const fwd = ['honda', 'toyota', 'volkswagen', 'mini'];
        const manufacturerLower = manufacturer.toLowerCase();
        
        if (awd.some(brand => manufacturerLower.includes(brand))) return 'AWD';
        if (fwd.some(brand => manufacturerLower.includes(brand))) return 'FWD';
        return 'RWD';
    }

    static getWeight(manufacturer, model, year) {
        const baseWeights = { 'Sports Car': 1400, 'Supercar': 1500, 'Truck': 2200, 'SUV': 1800 };
        const type = this.getCarType(manufacturer, model);
        const baseWeight = baseWeights[type] || 1400;
        const yearNum = parseInt(year) || 2000;
        const yearFactor = Math.max(0.9, 1 + (yearNum - 2000) * 0.01);
        
        return Math.round(baseWeight * yearFactor);
    }

    static getEngineSpecs(manufacturer, model, year) {
        const type = this.getCarType(manufacturer, model);
        const manufacturerLower = manufacturer.toLowerCase();
        const modelLower = model.toLowerCase();
        
        if (type === 'Supercar') {
            return { displacement: 4.0, cylinders: 8, aspiration: 'Turbo', horsepower: 650 };
        } else if (type === 'Truck') {
            return { displacement: 5.7, cylinders: 8, aspiration: 'NA', horsepower: 400 };
        } else if (manufacturerLower.includes('subaru') && modelLower.includes('wrx')) {
            return { displacement: 2.0, cylinders: 4, aspiration: 'Turbo', horsepower: 310 };
        } else if (manufacturerLower.includes('honda') && modelLower.includes('civic')) {
            return { displacement: 2.0, cylinders: 4, aspiration: 'Turbo', horsepower: 306 };
        }
        
        return { displacement: 3.0, cylinders: 6, aspiration: 'NA', horsepower: 300 };
    }

    static getCarTags(manufacturer, model, year) {
        const tags = [];
        const manufacturerLower = manufacturer.toLowerCase();
        const modelLower = model.toLowerCase();
        const yearNum = parseInt(year) || 2000;
        
        const jdmBrands = ['honda', 'toyota', 'nissan', 'mazda', 'subaru', 'mitsubishi', 'lexus', 'acura', 'infiniti'];
        if (jdmBrands.some(brand => manufacturerLower.includes(brand))) {
            tags.push('JDM');
        }
        
        if (yearNum <= 1990) {
            tags.push('Classic');
        } else if (yearNum <= 2000) {
            tags.push('Retro');
        }
        
        const supercarBrands = ['ferrari', 'lamborghini', 'mclaren', 'bugatti', 'koenigsegg', 'pagani'];
        if (supercarBrands.some(brand => manufacturerLower.includes(brand))) {
            tags.push('Supercar');
        }
        
        const performanceModels = ['gt-r', 'nsx', 'supra', 'rx-7', 'wrx', 'sti', 'type-r', 'amg', 'm3', 'm5', 'rs'];
        if (performanceModels.some(model => modelLower.includes(model))) {
            tags.push('Performance');
        }
        
        const driftCars = ['rx-7', 'rx-8', '240sx', 'silvia', 's13', 's14', 's15', 'ae86'];
        if (driftCars.some(model => modelLower.includes(model))) {
            tags.push('Drift');
        }
        
        return tags;
    }

    static getRealisticPrice(car) {
        const basePrices = {
            'D': 25000,
            'C': 45000,
            'B': 75000,
            'A': 150000,
            'S1': 300000,
            'S2': 800000,
            'X': 2000000
        };
        
        const rarityMultipliers = {
            'Common': 1.0,
            'Rare': 1.5,
            'Epic': 2.5,
            'Legendary': 4.0
        };
        
        const basePrice = basePrices[car.pi.class] || 50000;
        const multiplier = rarityMultipliers[car.rarity] || 1.0;
        const year = parseInt(car.year) || 2000;
        const yearFactor = Math.max(0.5, (year - 1950) / 100);
        
        return Math.round(basePrice * multiplier * yearFactor);
    }

    static sortCars(cars, sortValue) {
        return cars.sort((a, b) => {
            switch (sortValue) {
                case 'manufacturer-az':
                    return a.manufacturer.localeCompare(b.manufacturer);
                case 'manufacturer-za':
                    return b.manufacturer.localeCompare(a.manufacturer);
                case 'pi-high-low':
                    return b.pi.value - a.pi.value;
                case 'pi-low-high':
                    return a.pi.value - b.pi.value;
                case 'year-new-old':
                    return parseInt(b.year) - parseInt(a.year);
                case 'year-old-new':
                    return parseInt(a.year) - parseInt(b.year);
                case 'price-high-low':
                    return b.price - a.price;
                case 'price-low-high':
                    return a.price - b.price;
                default:
                    return 0;
            }
        });
    }

    static filterCars(cars, searchQuery, typeFilter) {
        return cars.filter(car => {
            const matchesSearch = !searchQuery || 
                car.fullName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = !typeFilter || car.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }
}