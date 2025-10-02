// Advanced Tuning Algorithms (JavaScript)
import { CAR_TYPE_DEFAULTS, DRIVETRAIN_MODIFIERS, PI_CLASS_MODIFIERS, GEAR_RATIO_BLUEPRINTS } from './types.js';

export class TuningAlgorithms {
    static getCarDefaults(car) {
        const baseDefaults = { ...(CAR_TYPE_DEFAULTS[car.type] || CAR_TYPE_DEFAULTS['Sports Car']) };
        const drivetrainMods = DRIVETRAIN_MODIFIERS[car.drivetrain] || {};
        const piMods = PI_CLASS_MODIFIERS[car.pi.class] || PI_CLASS_MODIFIERS['A'];
        
        Object.entries(drivetrainMods).forEach(([key, value]) => {
            if (typeof value === 'number') baseDefaults[key] = value;
        });
        
        if (baseDefaults['springs-front']) baseDefaults['springs-front'] = Math.round(baseDefaults['springs-front'] * piMods.springs);
        if (baseDefaults['springs-rear']) baseDefaults['springs-rear'] = Math.round(baseDefaults['springs-rear'] * piMods.springs);
        if (baseDefaults['tire-pressure-front']) baseDefaults['tire-pressure-front'] = Math.round(baseDefaults['tire-pressure-front'] * piMods.pressure * 10) / 10;
        if (baseDefaults['tire-pressure-rear']) baseDefaults['tire-pressure-rear'] = Math.round(baseDefaults['tire-pressure-rear'] * piMods.pressure * 10) / 10;
        
        return baseDefaults;
    }

    static calculateBaseTune(car) {
        const baseTune = {};
        
        const powerToWeight = car.engine.horsepower / car.weight;
        const piValue = car.pi.value;
        const isHighClass = ['S1', 'S2', 'X'].includes(car.pi.class);
        
        // Professional tire pressure (26-35 PSI range, higher front for cornering)
        baseTune['tire-pressure-front'] = Math.round((30 + (car.stats.handling * 0.5)) * 10) / 10;
        baseTune['tire-pressure-rear'] = Math.round((28 + (car.stats.handling * 0.3)) * 10) / 10;
        
        // Professional camber (negative for track racing, adjusted by telemetry principles)
        baseTune['camber-front'] = Math.round((-1.5 - (car.stats.handling * 0.2)) * 10) / 10;
        baseTune['camber-rear'] = Math.round((-1.2 - (car.stats.handling * 0.15)) * 10) / 10;
        
        // Professional toe settings based on drivetrain
        if (car.drivetrain === 'FWD' || car.drivetrain === 'AWD') {
            baseTune['toe-front'] = -0.15; // Toe-out for oversteer correction
            baseTune['toe-rear'] = 0.0;
        } else { // RWD
            baseTune['toe-front'] = 0.0;
            baseTune['toe-rear'] = 0.15; // Toe-in for rear stability
        }
        
        // Professional ARB settings (critical for over/understeer balance)
        if (car.drivetrain === 'FWD' || car.drivetrain === 'AWD') {
            baseTune['anti-roll-bar-front'] = Math.round(15 + (car.stats.handling * 2)); // Softer front
            baseTune['anti-roll-bar-rear'] = Math.round(25 + (car.stats.handling * 3)); // Stiffer rear
        } else { // RWD
            baseTune['anti-roll-bar-front'] = Math.round(20 + (car.stats.handling * 2.5));
            baseTune['anti-roll-bar-rear'] = Math.round(20 + (car.stats.handling * 2.5));
        }
        
        // Professional spring rates (heavier/lower cars need stiffer springs)
        const baseSpring = 120 + (car.weight / 10) + (piValue / 10);
        if (car.drivetrain === 'FWD' || car.drivetrain === 'AWD') {
            baseTune['spring-rate-front'] = Math.round(baseSpring * 0.9); // Slightly softer front
            baseTune['spring-rate-rear'] = Math.round(baseSpring);
        } else {
            baseTune['spring-rate-front'] = Math.round(baseSpring);
            baseTune['spring-rate-rear'] = Math.round(baseSpring * 0.95);
        }
        
        // Professional ride height (2 above minimum, lower for higher classes)
        baseTune['ride-height-front'] = isHighClass ? 6.0 : 8.0;
        baseTune['ride-height-rear'] = isHighClass ? 6.5 : 8.5;
        
        // Professional damping (rebound stock, bump 50-75% of rebound)
        const rebound = Math.round(6 + (car.stats.handling * 0.8));
        baseTune['rebound-stiffness-front'] = rebound;
        baseTune['rebound-stiffness-rear'] = Math.round(rebound * 0.9);
        baseTune['bump-stiffness-front'] = Math.round(rebound * 0.65);
        baseTune['bump-stiffness-rear'] = Math.round(rebound * 0.6);
        
        // Professional caster (4-7 degrees base)
        baseTune['caster'] = Math.round((5.5 + (car.stats.handling * 0.15)) * 10) / 10;
        
        // Professional differential settings (critical for power delivery)
        if (car.drivetrain === 'FWD') {
            baseTune['differential-front-accel'] = Math.min(50, Math.round(15 + (powerToWeight * 15)));
            baseTune['differential-front-decel'] = 0;
        } else if (car.drivetrain === 'RWD') {
            baseTune['differential-rear-accel'] = Math.min(90, Math.round(50 + (powerToWeight * 20)));
            baseTune['differential-rear-decel'] = 0;
        } else { // AWD
            baseTune['differential-front-accel'] = Math.min(50, Math.round(15 + (powerToWeight * 10)));
            baseTune['differential-rear-accel'] = Math.min(90, Math.round(50 + (powerToWeight * 15)));
            baseTune['differential-center'] = Math.min(80, Math.round(70 + (car.stats.handling * 1)));
            baseTune['differential-front-decel'] = 0;
            baseTune['differential-rear-decel'] = 0;
        }
        
        // Convert tire pressure from bar to PSI (professional standard)
        baseTune['tire-pressure-front'] = Math.round(baseTune['tire-pressure-front'] * 14.5);
        baseTune['tire-pressure-rear'] = Math.round(baseTune['tire-pressure-rear'] * 14.5);
        
        // Professional gearing (final drive adjusted for optimal power band)
        const optimalFinalDrive = 3.2 + (car.stats.speed / 20) - (car.stats.acceleration / 30);
        baseTune['final-drive'] = Math.round(optimalFinalDrive * 10) / 10;
        
        // Professional gear ratios (extended 1st/2nd for RWD high power)
        if (car.drivetrain === 'RWD' && powerToWeight > 0.3) {
            baseTune['gear-1'] = 3.8;
            baseTune['gear-2'] = 2.4;
        } else {
            baseTune['gear-1'] = 3.2;
            baseTune['gear-2'] = 2.1;
        }
        baseTune['gear-3'] = 1.6;
        baseTune['gear-4'] = 1.25;
        baseTune['gear-5'] = 1.05;
        baseTune['gear-6'] = 0.9;
        
        // Professional brake settings (leave stock for base tune)
        baseTune['brake-balance'] = 50;
        baseTune['brake-pressure'] = 100;
        
        // Professional aero (only for A+ class)
        if (isHighClass) {
            baseTune['aero-front'] = Math.round(car.stats.handling * 0.5);
            baseTune['aero-rear'] = Math.round(car.stats.handling * 0.8);
        } else {
            baseTune['aero-front'] = 0;
            baseTune['aero-rear'] = 0;
        }
        
        return baseTune;
    }

    static getMetaTune(templateName, car) {
        const baseTune = this.calculateBaseTune(car);
        const powerToWeight = car.engine.horsepower / car.weight;
        const isHighPower = powerToWeight > 0.35;
        
        switch (templateName) {
            case 'Speed':
                // Higher tire pressure for responsiveness and top speed
                baseTune['tire-pressure-front'] = 35.0;
                baseTune['tire-pressure-rear'] = 33.0;
                // Less camber for straight-line stability
                baseTune['camber-front'] = -0.8;
                baseTune['camber-rear'] = -0.6;
                // Stiffer suspension for high-speed stability
                baseTune['spring-rate-front'] = Math.min(300, baseTune['spring-rate-front'] + 50);
                baseTune['spring-rate-rear'] = Math.min(300, baseTune['spring-rate-rear'] + 40);
                // Lower ride height for aerodynamics
                baseTune['ride-height-front'] = 4.5;
                baseTune['ride-height-rear'] = 5.0;
                // Longer final drive for top speed
                baseTune['final-drive'] = Math.max(2.5, baseTune['final-drive'] - 0.5);
                // Minimal aero for top speed
                baseTune['aero-front'] = 0;
                baseTune['aero-rear'] = 2;
                break;
                
            case 'Grip':
                // Lower tire pressure for maximum contact patch
                baseTune['tire-pressure-front'] = 26.0;
                baseTune['tire-pressure-rear'] = 24.0;
                // More negative camber for cornering grip
                baseTune['camber-front'] = -2.5;
                baseTune['camber-rear'] = -2.0;
                // Stiffer ARBs for cornering
                baseTune['anti-roll-bar-front'] = Math.min(65, baseTune['anti-roll-bar-front'] + 15);
                baseTune['anti-roll-bar-rear'] = Math.min(65, baseTune['anti-roll-bar-rear'] + 20);
                // Maximum downforce for grip
                baseTune['aero-front'] = 10;
                baseTune['aero-rear'] = 10;
                // Shorter gearing for acceleration out of corners
                baseTune['final-drive'] = baseTune['final-drive'] + 0.3;
                break;
                
            case 'Drift':
                // Professional drift setup (keep front around 30, adjust rear for grip)
                baseTune['tire-pressure-front'] = 30.0;
                baseTune['tire-pressure-rear'] = isHighPower ? 35.0 : 25.0; // Lower rear for more grip on low power
                // Max front camber for steering angle, moderate rear
                baseTune['camber-front'] = -5.0;
                baseTune['camber-rear'] = -1.5;
                // Toe-out front for steering angle, toe-out rear for control
                baseTune['toe-front'] = -2.0;
                baseTune['toe-rear'] = -1.0;
                // Stiffer front, softer rear for oversteer
                baseTune['anti-roll-bar-front'] = Math.min(65, baseTune['anti-roll-bar-front'] + 20);
                baseTune['anti-roll-bar-rear'] = Math.max(1, baseTune['anti-roll-bar-rear'] - 15);
                baseTune['spring-rate-front'] = Math.min(300, baseTune['spring-rate-front'] + 30);
                baseTune['spring-rate-rear'] = Math.max(50, baseTune['spring-rate-rear'] - 40);
                // Minimum ride height
                baseTune['ride-height-front'] = 4.0;
                baseTune['ride-height-rear'] = 4.0;
                // Drift differential settings (85-95% accel, 0-40% decel)
                if (car.drivetrain === 'RWD') {
                    baseTune['differential-rear-accel'] = 90;
                    baseTune['differential-rear-decel'] = 20;
                }
                // No aero for drift
                baseTune['aero-front'] = 0;
                baseTune['aero-rear'] = 0;
                // Rear brake bias for control
                baseTune['brake-balance'] = 30; // More rear bias (Horizon is reversed)
                break;
                
            case 'Drag':
                // Drag racing setup (higher front, very low rear for launch)
                baseTune['tire-pressure-front'] = 32.0;
                baseTune['tire-pressure-rear'] = 18.0; // Very low for maximum launch grip
                // Minimal camber for straight line
                baseTune['camber-front'] = -0.5;
                baseTune['camber-rear'] = 0.0;
                // Soft suspension for weight transfer
                baseTune['spring-rate-front'] = Math.max(50, baseTune['spring-rate-front'] - 60);
                baseTune['spring-rate-rear'] = Math.max(50, baseTune['spring-rate-rear'] - 80);
                baseTune['anti-roll-bar-front'] = Math.max(1, baseTune['anti-roll-bar-front'] - 15);
                baseTune['anti-roll-bar-rear'] = Math.max(1, baseTune['anti-roll-bar-rear'] - 20);
                // Raise front for weight transfer
                baseTune['ride-height-front'] = 10.0;
                baseTune['ride-height-rear'] = 6.0;
                // Soft damping for launch
                baseTune['bump-stiffness-front'] = Math.max(1, baseTune['bump-stiffness-front'] - 3);
                baseTune['bump-stiffness-rear'] = Math.max(1, baseTune['bump-stiffness-rear'] - 4);
                // Lock differentials for traction
                if (car.drivetrain === 'RWD') {
                    baseTune['differential-rear-accel'] = 100;
                } else if (car.drivetrain === 'AWD') {
                    baseTune['differential-front-accel'] = 80;
                    baseTune['differential-rear-accel'] = 100;
                    baseTune['differential-center'] = 20; // More power to rear
                }
                // Shorter gearing for acceleration
                baseTune['final-drive'] = Math.max(2.0, baseTune['final-drive'] - 0.8);
                break;
                
            case 'Offroad':
                // Lower pressure for terrain compliance
                baseTune['tire-pressure-front'] = 22.0;
                baseTune['tire-pressure-rear'] = 20.0;
                // Less camber for offroad
                baseTune['camber-front'] = -0.8;
                baseTune['camber-rear'] = -0.5;
                // Soft suspension for terrain
                baseTune['spring-rate-front'] = Math.max(50, baseTune['spring-rate-front'] - 80);
                baseTune['spring-rate-rear'] = Math.max(50, baseTune['spring-rate-rear'] - 90);
                baseTune['anti-roll-bar-front'] = Math.max(1, baseTune['anti-roll-bar-front'] - 10);
                baseTune['anti-roll-bar-rear'] = Math.max(1, baseTune['anti-roll-bar-rear'] - 12);
                // High ride height for clearance
                baseTune['ride-height-front'] = 12.0;
                baseTune['ride-height-rear'] = 12.5;
                // Soft damping for bumps
                baseTune['bump-stiffness-front'] = Math.max(1, baseTune['bump-stiffness-front'] - 2);
                baseTune['bump-stiffness-rear'] = Math.max(1, baseTune['bump-stiffness-rear'] - 3);
                break;
        }
        
        return baseTune;
    }

    static getMetaTemplate(templateName, car) {
        const baseTune = {};
        
        switch (templateName) {
            case 'S2-Meta':
                baseTune['tire-pressure-front'] = 1.6;
                baseTune['tire-pressure-rear'] = 1.5;
                baseTune['camber-front'] = 2.8;
                baseTune['camber-rear'] = 2.2;
                baseTune['toe-front'] = -0.2;
                baseTune['toe-rear'] = 0.3;
                baseTune['anti-roll-bar-front'] = 35;
                baseTune['anti-roll-bar-rear'] = 32;
                baseTune['spring-rate-front'] = 250;
                baseTune['spring-rate-rear'] = 240;
                baseTune['final-drive'] = 3.8;
                baseTune['differential-front-accel'] = car.drivetrain !== 'RWD' ? 35 : 0;
                baseTune['differential-rear-accel'] = 45;
                baseTune['differential-center'] = car.drivetrain === 'AWD' ? 75 : 0;
                baseTune['brake-balance'] = 47;
                baseTune['brake-pressure'] = 98;
                baseTune['aero-front'] = 10;
                baseTune['aero-rear'] = 10;
                break;
                
            case 'A-Class-Meta':
                baseTune['tire-pressure-front'] = 1.8;
                baseTune['tire-pressure-rear'] = 1.7;
                baseTune['camber-front'] = 2.2;
                baseTune['camber-rear'] = 1.8;
                baseTune['anti-roll-bar-front'] = 28;
                baseTune['anti-roll-bar-rear'] = 25;
                baseTune['spring-rate-front'] = 220;
                baseTune['spring-rate-rear'] = 210;
                baseTune['final-drive'] = 3.6;
                baseTune['differential-front-accel'] = car.drivetrain !== 'RWD' ? 28 : 0;
                baseTune['differential-rear-accel'] = 35;
                baseTune['brake-balance'] = 50;
                baseTune['brake-pressure'] = 92;
                break;
                
            case 'Rivals-Meta':
                baseTune['tire-pressure-front'] = 1.9;
                baseTune['tire-pressure-rear'] = 1.8;
                baseTune['camber-front'] = 1.8;
                baseTune['camber-rear'] = 1.5;
                baseTune['anti-roll-bar-front'] = 22;
                baseTune['anti-roll-bar-rear'] = 20;
                baseTune['spring-rate-front'] = 200;
                baseTune['spring-rate-rear'] = 190;
                baseTune['final-drive'] = 3.4;
                baseTune['differential-front-accel'] = car.drivetrain !== 'RWD' ? 22 : 0;
                baseTune['differential-rear-accel'] = 28;
                baseTune['brake-balance'] = 52;
                baseTune['brake-pressure'] = 88;
                break;
                
            default:
                return this.getMetaTune(templateName, car);
        }
        
        return baseTune;
    }
}