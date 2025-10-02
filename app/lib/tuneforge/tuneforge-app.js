// TuneForge Main Application Class (JavaScript)
import { FORZA_LIMITS, validateTuneData } from './types.js';
import { TuningAlgorithms } from './tuning-algorithms.js';
import { CarDataManager, SAMPLE_CARS } from './car-data.js';

export class ForzaTunerApp {
    constructor() {
        this.cars = [];
        this.selectedCar = null;
        this.currentTuneData = null;
        this.savedTunes = [];
        this.favoriteCars = new Set();
        this.isMobile = window.innerWidth <= 768;
        
        this.init();
    }

    async init() {
        this.cars = await CarDataManager.loadCars();
        this.loadSavedData();
        this.setupEventListeners();
        
        if (this.cars.length > 0) {
            this.selectedCar = this.cars[0];
            this.renderCarDetails();
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
        });
    }

    loadSavedData() {
        try {
            const savedTunes = localStorage.getItem('forzaSavedTunes');
            if (savedTunes) this.savedTunes = JSON.parse(savedTunes);
            
            const savedFavorites = localStorage.getItem('forzaFavorites');
            if (savedFavorites) this.favoriteCars = new Set(JSON.parse(savedFavorites));
        } catch (error) {
            console.warn('Failed to load saved data:', error);
        }
    }

    calculateBaseTune() {
        if (!this.selectedCar) return null;
        
        const baseTune = TuningAlgorithms.calculateBaseTune(this.selectedCar);
        this.currentTuneData = baseTune;
        return baseTune;
    }

    applyTemplate(templateName) {
        if (!this.selectedCar) return null;
        
        let template;
        const metaTemplates = ['S2-Meta', 'A-Class-Meta', 'Rivals-Meta'];
        
        if (metaTemplates.includes(templateName)) {
            template = TuningAlgorithms.getMetaTemplate(templateName, this.selectedCar);
        } else {
            template = TuningAlgorithms.getMetaTune(templateName, this.selectedCar);
        }
        
        this.currentTuneData = template;
        return template;
    }

    validateCurrentTune() {
        if (!this.currentTuneData) return { valid: true, errors: [] };
        return validateTuneData(this.currentTuneData);
    }

    saveTune(tuneName) {
        if (!this.selectedCar || !this.currentTuneData || !tuneName) return false;
        
        const savedTune = {
            name: tuneName,
            carFullName: this.selectedCar.fullName,
            tune: { ...this.currentTuneData },
            timestamp: Date.now()
        };
        
        this.savedTunes.push(savedTune);
        localStorage.setItem('forzaSavedTunes', JSON.stringify(this.savedTunes));
        return true;
    }

    loadTune(index) {
        if (index < 0 || index >= this.savedTunes.length) return null;
        
        const tune = this.savedTunes[index];
        this.currentTuneData = { ...tune.tune };
        return tune;
    }

    deleteTune(index) {
        if (index < 0 || index >= this.savedTunes.length) return false;
        
        this.savedTunes.splice(index, 1);
        localStorage.setItem('forzaSavedTunes', JSON.stringify(this.savedTunes));
        return true;
    }

    toggleFavorite(carFullName) {
        if (this.favoriteCars.has(carFullName)) {
            this.favoriteCars.delete(carFullName);
        } else {
            this.favoriteCars.add(carFullName);
        }
        
        localStorage.setItem('forzaFavorites', JSON.stringify([...this.favoriteCars]));
        return this.favoriteCars.has(carFullName);
    }

    searchCars(query, typeFilter) {
        return CarDataManager.filterCars(this.cars, query, typeFilter);
    }

    sortCars(sortValue) {
        return CarDataManager.sortCars([...this.cars], sortValue);
    }

    selectCar(carFullName) {
        const car = this.cars.find(c => c.fullName === carFullName);
        if (car) {
            this.selectedCar = car;
            this.renderCarDetails();
            return true;
        }
        return false;
    }

    renderCarDetails() {
        if (!this.selectedCar) return;
        
        // This would be implemented by the UI layer
        console.log('Selected car:', this.selectedCar);
    }

    getCarStats() {
        if (!this.selectedCar) return null;
        
        return {
            car: this.selectedCar,
            powerToWeight: this.selectedCar.engine.horsepower / this.selectedCar.weight,
            weightDistribution: {
                front: this.selectedCar.drivetrain === 'FWD' ? 0.65 : 
                       this.selectedCar.drivetrain === 'RWD' ? 0.45 : 0.55,
                rear: this.selectedCar.drivetrain === 'FWD' ? 0.35 : 
                      this.selectedCar.drivetrain === 'RWD' ? 0.55 : 0.45
            }
        };
    }

    exportTune() {
        if (!this.currentTuneData || !this.selectedCar) return null;
        
        return {
            car: this.selectedCar.fullName,
            tune: this.currentTuneData,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
    }

    importTune(tuneData) {
        try {
            if (tuneData.car && tuneData.tune) {
                this.currentTuneData = tuneData.tune;
                return true;
            }
        } catch (error) {
            console.error('Failed to import tune:', error);
        }
        return false;
    }

    // Utility methods
    formatValue(key, value) {
        if (key.includes('pressure')) return `${value} bar`;
        if (key.includes('camber') || key.includes('toe')) return `${value}°`;
        if (key.includes('gear')) return value.toFixed(2);
        if (key.includes('balance')) return `${value}%`;
        return value.toString();
    }

    getSettingName(key) {
        return key.replace(/-/g, ' ')
                 .replace(/\b\w/g, l => l.toUpperCase());
    }

    clampValue(key, value) {
        const limits = FORZA_LIMITS[key];
        if (!limits) return value;
        
        return Math.max(limits.min, Math.min(limits.max, value));
    }
}