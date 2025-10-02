// TuneForge Type Definitions and Constants (JavaScript)

export const FORZA_LIMITS = {
    'tire-pressure-front': { min: 1.0, max: 3.5 },
    'tire-pressure-rear': { min: 1.0, max: 3.5 },
    'camber-front': { min: 0.0, max: 5.0 },
    'camber-rear': { min: 0.0, max: 5.0 },
    'toe-front': { min: -3.0, max: 3.0 },
    'toe-rear': { min: -3.0, max: 3.0 },
    'anti-roll-bar-front': { min: 1, max: 65 },
    'anti-roll-bar-rear': { min: 1, max: 65 },
    'spring-rate-front': { min: 50, max: 300 },
    'spring-rate-rear': { min: 50, max: 300 },
    'ride-height-front': { min: 4.0, max: 15.0 },
    'ride-height-rear': { min: 4.0, max: 15.0 },
    'rebound-stiffness-front': { min: 1, max: 20 },
    'rebound-stiffness-rear': { min: 1, max: 20 },
    'bump-stiffness-front': { min: 1, max: 20 },
    'bump-stiffness-rear': { min: 1, max: 20 },
    'final-drive': { min: 2.0, max: 5.0 },
    'gear-1': { min: 1.0, max: 5.0 },
    'gear-2': { min: 0.5, max: 3.5 },
    'gear-3': { min: 0.5, max: 2.5 },
    'gear-4': { min: 0.5, max: 2.0 },
    'gear-5': { min: 0.5, max: 1.8 },
    'gear-6': { min: 0.5, max: 1.5 },
    'differential-front-accel': { min: 0, max: 100 },
    'differential-rear-accel': { min: 0, max: 100 },
    'differential-center': { min: 0, max: 100 },
    'brake-balance': { min: 40, max: 60 },
    'brake-pressure': { min: 50, max: 150 },
    'aero-front': { min: 0, max: 10 },
    'aero-rear': { min: 0, max: 10 }
};

export const CAR_TYPE_DEFAULTS = {
    'Sports Car': {
        'tire-pressure-front': 2.0, 'tire-pressure-rear': 2.0,
        'camber-front': 1.5, 'camber-rear': 1.2, 'toe-front': 0.0, 'toe-rear': 0.0,
        'rollbar-front': 20, 'rollbar-rear': 18, 'springs-front': 150, 'springs-rear': 140,
        'final-drive': 3.5, 'brake-balance': 50, 'brake-pressure': 100
    },
    'Supercar': {
        'tire-pressure-front': 1.8, 'tire-pressure-rear': 1.7,
        'camber-front': 2.0, 'camber-rear': 1.5, 'toe-front': -0.1, 'toe-rear': 0.1,
        'rollbar-front': 25, 'rollbar-rear': 23, 'springs-front': 180, 'springs-rear': 170,
        'final-drive': 3.2, 'brake-balance': 48, 'brake-pressure': 105
    },
    'Truck': {
        'tire-pressure-front': 2.2, 'tire-pressure-rear': 2.1,
        'camber-front': 0.8, 'camber-rear': 0.5, 'toe-front': 0.1, 'toe-rear': 0.2,
        'rollbar-front': 15, 'rollbar-rear': 13, 'springs-front': 120, 'springs-rear': 110,
        'final-drive': 4.1, 'brake-balance': 55, 'brake-pressure': 95
    },
    'SUV': {
        'tire-pressure-front': 2.1, 'tire-pressure-rear': 2.0,
        'camber-front': 1.0, 'camber-rear': 0.8, 'toe-front': 0.0, 'toe-rear': 0.1,
        'rollbar-front': 18, 'rollbar-rear': 16, 'springs-front': 130, 'springs-rear': 120,
        'final-drive': 3.8, 'brake-balance': 53, 'brake-pressure': 98
    }
};

export const DRIVETRAIN_MODIFIERS = {
    'FWD': { 'brake-balance': 58, 'diff-front': 25, 'diff-rear': 15, 'toe-front': -0.1 },
    'RWD': { 'brake-balance': 48, 'diff-front': 0, 'diff-rear': 30, 'toe-rear': 0.2 },
    'AWD': { 'brake-balance': 52, 'diff-front': 20, 'diff-rear': 25, 'diff-center': 60 }
};

export const PI_CLASS_MODIFIERS = {
    'D': { springs: 0.7, damping: 0.8, pressure: 1.1 },
    'C': { springs: 0.8, damping: 0.85, pressure: 1.05 },
    'B': { springs: 0.9, damping: 0.9, pressure: 1.0 },
    'A': { springs: 1.0, damping: 1.0, pressure: 0.95 },
    'S1': { springs: 1.1, damping: 1.1, pressure: 0.9 },
    'S2': { springs: 1.2, damping: 1.2, pressure: 0.85 },
    'X': { springs: 1.3, damping: 1.3, pressure: 0.8 }
};

export const GEAR_RATIO_BLUEPRINTS = {
    'Road Race': [3.20, 2.10, 1.60, 1.25, 1.05, 0.90, 0.80, 0.72, 0.65, 0.60],
    'Drag Race': [2.80, 1.90, 1.45, 1.15, 0.95, 0.80, 0.70, 0.62, 0.55, 0.50],
    'Drift': [3.50, 2.30, 1.75, 1.35, 1.10, 0.95, 0.85, 0.78, 0.70, 0.65],
    'Offroad': [3.80, 2.50, 1.80, 1.30, 1.00, 0.80, 0.65, 0.55, 0.48, 0.42],
    'Rally': [3.60, 2.40, 1.70, 1.28, 1.00, 0.82, 0.68, 0.58, 0.50, 0.45]
};

export function validateCarData(car) {
    return car && 
           car.year && 
           car.manufacturer && 
           car.model && 
           car.stats && 
           car.pi && 
           car.drivetrain;
}

export function validateTuneData(tuneData) {
    const errors = [];
    
    Object.keys(tuneData).forEach(key => {
        if (FORZA_LIMITS[key]) {
            const value = parseFloat(tuneData[key]);
            const limits = FORZA_LIMITS[key];
            
            if (isNaN(value) || value < limits.min || value > limits.max) {
                errors.push(`${key}: ${value} (must be ${limits.min}-${limits.max})`);
            }
        }
    });
    
    return {
        valid: errors.length === 0,
        errors
    };
}