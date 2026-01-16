/**
 * Datos de animales del juego
 * Define todos los animales anacrónicos disponibles
 */

window.animalData = {
    // Animales Prehistóricos
    'mini-mammoth': {
        id: 'mini-mammoth',
        name: 'Mamut Enano',
        description: 'Un pequeño mamut domesticado que produce lana prehistórica',
        emoji: '🐘',
        era: 'prehistoric',
        type: 'producer',
        
        production: {
            item: 'mammoth-wool',
            interval: 60000, // 1 minuto
            amount: 1,
            description: 'Produce lana de mamut cada minuto'
        },
        
        cost: {
            'temporal-pulses': 50,
            'fossils': 10
        },
        
        stats: {
            happiness: 100,
            hunger: 50,
            energy: 100
        },
        
        movement: {
            pattern: 'wander',
            speed: 1
        },
        
        effects: {
            coldResistance: 1.2, // Resiste mejor el frío
            ancientWisdom: 1.1   // Pequeño bonus de experiencia
        }
    },
    
    'dodo-bird': {
        id: 'dodo-bird',
        name: 'Dodo Doméstico',
        description: 'Un dodo amigable que sigue al jugador y mejora el crecimiento de plantas',
        emoji: '🐦',
        era: 'prehistoric',
        type: 'companion',
        
        effect: {
            type: 'growth-boost',
            value: 1.1,
            description: 'Aumenta el crecimiento de plantas cercanas en 10%'
        },
        
        cost: {
            'temporal-pulses': 30
        },
        
        stats: {
            happiness: 120,
            hunger: 30,
            energy: 80
        },
        
        movement: {
            pattern: 'follow-player',
            speed: 2
        }
    },
    
    // Animales Egipcios
    'sacred-cat': {
        id: 'sacred-cat',
        name: 'Gato Sagrado',
        description: 'Un gato bendecido por los dioses egipcios, produce piel sagrada',
        emoji: '🐱',
        era: 'egyptian',
        type: 'producer',
        
        production: {
            item: 'sacred-fur',
            interval: 90000, // 1.5 minutos
            amount: 1,
            description: 'Produce piel sagrada cada 90 segundos'
        },
        
        cost: {
            'temporal-pulses': 75,
            'artifacts': 15
        },
        
        stats: {
            happiness: 90,
            hunger: 40,
            energy: 95
        },
        
        movement: {
            pattern: 'random',
            speed: 1.5
        },
        
        effects: {
            divineBlessing: 1.15, // Bonus a recursos sagrados
            sunAffinity: 1.1     // Mejora durante el día
        }
    },
    
    'scarab-beetle': {
        id: 'scarab-beetle',
        name: 'Escarabajo Sagrado',
        description: 'Un escarabajo que rueda bolas de estiércol y aumenta la producción de artefactos',
        emoji: '🪲',
        era: 'egyptian',
        type: 'companion',
        
        effect: {
            type: 'resource-boost',
            target: 'artifacts',
            value: 1.2,
            description: 'Aumenta la producción de artefactos en 20%'
        },
        
        cost: {
            'temporal-pulses': 40
        },
        
        stats: {
            happiness: 80,
            hunger: 60,
            energy: 70
        },
        
        movement: {
            pattern: 'circular',
            speed: 0.5
        }
    },
    
    // Animales del Futuro
    'robo-sheep': {
        id: 'robo-sheep',
        name: 'Oveja Robótica',
        description: 'Una oveja mecánica que produce lana de cobre para circuitos',
        emoji: '🤖',
        era: 'future',
        type: 'producer',
        
        production: {
            item: 'copper-wool',
            interval: 120000, // 2 minutos
            amount: 2,
            description: 'Produce lana de cobre cada 2 minutos'
        },
        
        cost: {
            'temporal-pulses': 100,
            'data-crystals': 20
        },
        
        stats: {
            happiness: 100, // Los robots siempre están contentos
            hunger: 0,      // No come
            energy: 100     // Batería siempre cargada
        },
        
        movement: {
            pattern: 'grid',
            speed: 1
        },
        
        effects: {
            efficiency: 1.25,      // Producción más eficiente
            noHunger: true         // No requiere alimentación
        }
    },
    
    'hologram-bird': {
        id: 'hologram-bird',
        name: 'Ave Holográfica',
        description: 'Una proyección holográfica que acelera el crecimiento de todas las plantas',
        emoji: '🕊️',
        era: 'future',
        type: 'companion',
        
        effect: {
            type: 'growth-acceleration',
            value: 1.3,
            description: 'Acelera el crecimiento de todas las plantas en 30%'
        },
        
        cost: {
            'temporal-pulses': 150
        },
        
        stats: {
            happiness: 100,
            hunger: 0,
            energy: 100
        },
        
        movement: {
            pattern: 'float',
            speed: 0.8
        },
        
        effects: {
            holographic: true,  // Puede atravesar objetos
            energyEfficient: 1.1 // Pequeño ahorro de energía
        }
    }
};

/**
 * Obtiene datos de un animal por su ID
 * @param {string} animalId - ID del animal
 * @returns {Object|null} Datos del animal
 */
window.getAnimalData = function(animalId) {
    return window.animalData[animalId] || null;
};

/**
 * Obtiene todos los animales
 * @returns {Array} Todos los animales
 */
window.getAllAnimals = function() {
    return Object.values(window.animalData);
};

/**
 * Obtiene animales por era
 * @param {string} era - Era de los animales
 * @returns {Array} Animales de la era
 */
window.getAnimalsByEra = function(era) {
    return Object.values(window.animalData).filter(animal => animal.era === era);
};

/**
 * Obtiene animales por tipo
 * @param {string} type - Tipo de animal (producer, companion)
 * @returns {Array} Animales del tipo
 */
window.getAnimalsByType = function(type) {
    return Object.values(window.animalData).filter(animal => animal.type === type);
};

console.log('🐾 Animales: Datos de animales cargados');