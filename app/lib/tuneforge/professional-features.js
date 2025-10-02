// Professional TuneForge Features for Forza 5 Community

export class ProfessionalTuner {
    // Telemetry-based tuning recommendations
    static analyzeTelemetry(telemetryData) {
        const recommendations = [];
        
        // Suspension analysis (20-80% compression range)
        if (telemetryData.suspension) {
            if (telemetryData.suspension.front > 80) {
                recommendations.push({
                    category: 'Suspension',
                    issue: 'Front suspension bottoming out',
                    solution: 'Increase front spring rate or raise ride height',
                    priority: 'High'
                });
            }
            if (telemetryData.suspension.rear > 80) {
                recommendations.push({
                    category: 'Suspension',
                    issue: 'Rear suspension bottoming out', 
                    solution: 'Increase rear spring rate or raise ride height',
                    priority: 'High'
                });
            }
        }
        
        // Tire temperature analysis (mustard color = optimal)
        if (telemetryData.tires) {
            const tempDiff = Math.abs(telemetryData.tires.inside - telemetryData.tires.outside);
            if (tempDiff > 20) {
                recommendations.push({
                    category: 'Alignment',
                    issue: 'Tire temperature difference > 20°F',
                    solution: tempDiff > 0 ? 'Reduce camber' : 'Increase camber',
                    priority: 'Medium'
                });
            }
        }
        
        return recommendations;
    }
    
    // Track-specific tuning presets
    static getTrackPreset(trackType, car) {
        const presets = {
            'Road America': {
                description: 'High-speed circuit with long straights',
                adjustments: {
                    'aero-front': Math.min(car.pi.class === 'S2' ? 3 : 1, 10),
                    'aero-rear': Math.min(car.pi.class === 'S2' ? 5 : 2, 10),
                    'final-drive': -0.2, // Longer for top speed
                    'tire-pressure-front': 32,
                    'tire-pressure-rear': 30
                }
            },
            'Laguna Seca': {
                description: 'Technical circuit with elevation changes',
                adjustments: {
                    'aero-front': Math.min(car.pi.class === 'S2' ? 6 : 3, 10),
                    'aero-rear': Math.min(car.pi.class === 'S2' ? 8 : 4, 10),
                    'camber-front': -2.5,
                    'camber-rear': -2.0,
                    'tire-pressure-front': 28,
                    'tire-pressure-rear': 26
                }
            },
            'Nürburgring': {
                description: 'Mixed circuit requiring balanced setup',
                adjustments: {
                    'aero-front': Math.min(car.pi.class === 'S2' ? 4 : 2, 10),
                    'aero-rear': Math.min(car.pi.class === 'S2' ? 6 : 3, 10),
                    'spring-rate-front': 20, // Stiffer for bumps
                    'spring-rate-rear': 15,
                    'ride-height-front': 6.5,
                    'ride-height-rear': 7.0
                }
            }
        };
        
        return presets[trackType] || null;
    }
    
    // Weather condition adjustments
    static getWeatherAdjustments(weather, baseTune) {
        const adjustments = { ...baseTune };
        
        switch (weather) {
            case 'Rain':
                // Lower tire pressure for more contact patch
                adjustments['tire-pressure-front'] = Math.max(20, adjustments['tire-pressure-front'] - 4);
                adjustments['tire-pressure-rear'] = Math.max(18, adjustments['tire-pressure-rear'] - 4);
                // Reduce camber for wet conditions
                adjustments['camber-front'] = Math.max(-2.0, adjustments['camber-front'] + 0.5);
                adjustments['camber-rear'] = Math.max(-1.5, adjustments['camber-rear'] + 0.5);
                // Softer suspension for grip
                adjustments['spring-rate-front'] = Math.max(80, adjustments['spring-rate-front'] - 20);
                adjustments['spring-rate-rear'] = Math.max(70, adjustments['spring-rate-rear'] - 20);
                break;
                
            case 'Hot':
                // Higher tire pressure to prevent overheating
                adjustments['tire-pressure-front'] = Math.min(40, adjustments['tire-pressure-front'] + 2);
                adjustments['tire-pressure-rear'] = Math.min(38, adjustments['tire-pressure-rear'] + 2);
                break;
                
            case 'Cold':
                // Lower tire pressure for quicker warm-up
                adjustments['tire-pressure-front'] = Math.max(22, adjustments['tire-pressure-front'] - 2);
                adjustments['tire-pressure-rear'] = Math.max(20, adjustments['tire-pressure-rear'] - 2);
                break;
        }
        
        return adjustments;
    }
    
    // Competitive meta analysis
    static getCompetitiveMeta(gameMode, piClass) {
        const meta = {
            'Rivals': {
                'S2': {
                    topCars: ['McLaren Senna', 'Koenigsegg Jesko', 'Bugatti Chiron'],
                    keySettings: {
                        'tire-pressure-front': 28,
                        'tire-pressure-rear': 26,
                        'camber-front': -2.8,
                        'camber-rear': -2.2,
                        'aero-front': 8,
                        'aero-rear': 10
                    }
                },
                'S1': {
                    topCars: ['Porsche 911 GT3 RS', 'McLaren 720S', 'Ferrari 488 Pista'],
                    keySettings: {
                        'tire-pressure-front': 30,
                        'tire-pressure-rear': 28,
                        'camber-front': -2.5,
                        'camber-rear': -2.0,
                        'aero-front': 6,
                        'aero-rear': 8
                    }
                }
            },
            'Online Racing': {
                'A': {
                    topCars: ['Mazda RX-7', 'Nissan Skyline GT-R', 'BMW M3 E92'],
                    keySettings: {
                        'tire-pressure-front': 32,
                        'tire-pressure-rear': 30,
                        'camber-front': -2.2,
                        'camber-rear': -1.8
                    }
                }
            }
        };
        
        return meta[gameMode]?.[piClass] || null;
    }
    
    // Tune sharing and community features
    static generateTuneCode(tune, car) {
        const tuneData = {
            car: car.fullName,
            pi: car.pi,
            tune: tune,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        // Generate shareable code
        const encoded = btoa(JSON.stringify(tuneData));
        return `TF-${encoded.substring(0, 12).toUpperCase()}`;
    }
    
    static decodeTuneCode(code) {
        try {
            const encoded = code.replace('TF-', '');
            const decoded = atob(encoded);
            return JSON.parse(decoded);
        } catch (error) {
            return null;
        }
    }
    
    // Performance metrics calculation
    static calculatePerformanceMetrics(car, tune) {
        const metrics = {};
        
        // Theoretical top speed based on gearing and power
        const finalDrive = tune['final-drive'] || 3.5;
        const gearRatio = tune['gear-6'] || 0.9;
        const totalRatio = finalDrive * gearRatio;
        metrics.theoreticalTopSpeed = Math.round((car.engine.horsepower * 0.8) / totalRatio);
        
        // Acceleration estimate based on power-to-weight and gearing
        const powerToWeight = car.engine.horsepower / car.weight;
        const launchGearing = tune['gear-1'] || 3.2;
        metrics.estimated0to60 = Math.round((4.5 - (powerToWeight * 2) + (launchGearing * 0.3)) * 10) / 10;
        
        // Handling balance score
        const frontBias = (tune['spring-rate-front'] || 150) / (tune['spring-rate-rear'] || 140);
        metrics.handlingBalance = frontBias > 1.1 ? 'Understeer' : frontBias < 0.9 ? 'Oversteer' : 'Neutral';
        
        // Tire wear estimate (lower pressure = more wear)
        const avgPressure = ((tune['tire-pressure-front'] || 30) + (tune['tire-pressure-rear'] || 28)) / 2;
        metrics.tireWearRate = avgPressure < 25 ? 'High' : avgPressure > 35 ? 'Low' : 'Medium';
        
        return metrics;
    }
}

// Community features for professional tuners
export class CommunityFeatures {
    static tunerProfiles = new Map();
    static tuneDatabase = new Map();
    
    static createTunerProfile(name, specialties, reputation = 0) {
        return {
            name,
            specialties, // ['Drift', 'Road Racing', 'Drag', 'Rally']
            reputation,
            tunesShared: 0,
            downloadsReceived: 0,
            rating: 0,
            badges: []
        };
    }
    
    static rateTune(tuneId, rating, feedback) {
        const tune = this.tuneDatabase.get(tuneId);
        if (tune) {
            tune.ratings.push({ rating, feedback, timestamp: Date.now() });
            tune.averageRating = tune.ratings.reduce((sum, r) => sum + r.rating, 0) / tune.ratings.length;
        }
    }
    
    static searchTunes(filters) {
        const results = [];
        for (const [id, tune] of this.tuneDatabase) {
            let matches = true;
            
            if (filters.car && tune.car !== filters.car) matches = false;
            if (filters.piClass && tune.piClass !== filters.piClass) matches = false;
            if (filters.tuneType && tune.type !== filters.tuneType) matches = false;
            if (filters.minRating && tune.averageRating < filters.minRating) matches = false;
            
            if (matches) results.push({ id, ...tune });
        }
        
        return results.sort((a, b) => b.averageRating - a.averageRating);
    }
}