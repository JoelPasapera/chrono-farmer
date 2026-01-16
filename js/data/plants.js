/**
 * Datos de plantas del juego
 * Define todas las plantas disponibles con sus características
 */

window.plantData = {
    // Plantas Prehistóricas
    'prehistoric-moss': {
        id: 'prehistoric-moss',
        name: 'Musgo Prehistórico',
        description: 'Un musgo ancestral que crecía en las profundidades de las cuevas prehistóricas. Resistente y lleno de energía primigenia.',
        emoji: '🌿',
        era: 'prehistoric',
        growTime: 30000, // 30 segundos
        stages: 3,
        waterRequirement: 0.6, // 60% de agua mínimo
        nutrientRequirement: 0.4, // 40% de nutrientes mínimo

        // Efectos especiales
        effects: {
            temporalResonance: 1.2, // Aumenta la generación de pulsos temporales
            earthConnection: 1.1   // Mejora la absorción de nutrientes
        },

        // Recompensas de cosecha
        harvestYield: {
            seeds: 1,
            resources: {
                'temporal-pulses': 5,
                'fossils': 2
            },
            experience: 10
        },

        // Visual
        appearance: {
            stage0: { emoji: '🌱', size: 0.8 },
            stage1: { emoji: '🌿', size: 1.0 },
            stage2: { emoji: '🌿', size: 1.2, glow: true }
        },

        // Sonidos
        sounds: {
            plant: 'plant-seed',
            water: 'water-plant',
            harvest: 'harvest-plant',
            ambient: 'moss-rustle'
        }
    },

    'fern-ancient': {
        id: 'fern-ancient',
        name: 'Helecho Ancestral',
        description: 'Un helecho gigante de la era de los dinosaurios. Sus frondas contienen la sabiduría de millones de años.',
        emoji: '🌾',
        era: 'prehistoric',
        growTime: 45000, // 45 segundos
        stages: 4,
        waterRequirement: 0.7,
        nutrientRequirement: 0.5,

        effects: {
            temporalResonance: 1.3,
            photosynthesis: 1.15 // Mejora la eficiencia de crecimiento
        },

        harvestYield: {
            seeds: 1,
            resources: {
                'temporal-pulses': 8,
                'fossils': 3,
                'plant-fiber': 2
            },
            experience: 15
        },

        appearance: {
            stage0: { emoji: '🌱', size: 0.8 },
            stage1: { emoji: '🌿', size: 1.0 },
            stage2: { emoji: '🌾', size: 1.1 },
            stage3: { emoji: '🌾', size: 1.3, glow: true }
        },

        unlockRequirement: {
            type: 'harvest',
            plant: 'prehistoric-moss',
            count: 5
        }
    },

    // Plantas Egipcias
    'lotus-egyptian': {
        id: 'lotus-egyptian',
        name: 'Loto Egipcio',
        description: 'La flor sagrada del Nilo, símbolo de pureza y renacimiento. Florece con la luz del sol artificial.',
        emoji: '⚪',
        era: 'egyptian',
        growTime: 45000, // 45 segundos
        stages: 4,
        waterRequirement: 0.8,
        nutrientRequirement: 0.6,

        effects: {
            sunBlessing: 1.25, // Crece mejor con luz
            waterBlessing: 1.1  // Mayor retención de agua
        },

        harvestYield: {
            seeds: 1,
            resources: {
                'temporal-pulses': 12,
                'lotus-petals': 3,
                'sacred-dust': 1
            },
            experience: 20
        },

        appearance: {
            stage0: { emoji: '🌱', size: 0.8 },
            stage1: { emoji: '🌿', size: 1.0 },
            stage2: { emoji: '🪷', size: 1.1 },
            stage3: { emoji: '⚪', size: 1.2, glow: true }
        },

        sounds: {
            plant: 'plant-lotus',
            water: 'water-lotus',
            harvest: 'harvest-lotus',
            ambient: 'lotus-bloom'
        }
    },

    'papyrus-reed': {
        id: 'papyrus-reed',
        name: 'Junco de Papiro',
        description: 'La planta que dio origen al papel en el antiguo Egipto. Sus tallos contienen secretos escritos en jeroglíficos.',
        emoji: '🎋',
        era: 'egyptian',
        growTime: 60000, // 60 segundos
        stages: 5,
        waterRequirement: 0.9,
        nutrientRequirement: 0.5,

        effects: {
            knowledgePreservation: 1.2, // Mayor experiencia al cosechar
            waterAffinity: 1.15        // Crece mejor cerca del agua
        },

        harvestYield: {
            seeds: 1,
            resources: {
                'temporal-pulses': 10,
                'papyrus-sheets': 4,
                'hieroglyphic-ink': 1
            },
            experience: 25
        },

        appearance: {
            stage0: { emoji: '🌱', size: 0.8 },
            stage1: { emoji: '🌿', size: 1.0 },
            stage2: { emoji: '🎋', size: 1.1 },
            stage3: { emoji: '🎋', size: 1.2 },
            stage4: { emoji: '🎋', size: 1.3, glow: true }
        },

        unlockRequirement: {
            type: 'harvest',
            plant: 'lotus-egyptian',
            count: 8
        }
    },

    // Plantas del Futuro
    'crystal-future': {
        id: 'crystal-future',
        name: 'Cristal del Futuro',
        description: 'Una planta cristalina que crece con la energía de la música synthwave. Sus facetas refractan la luz neón.',
        emoji: '💎',
        era: 'future',
        growTime: 60000, // 60 segundos
        stages: 5,
        waterRequirement: 0.3, // Necesita poca agua
        nutrientRequirement: 0.8, // Pero muchos nutrientes

        effects: {
            energyConversion: 1.4, // Convierte luz/energía en crecimiento
            crystalResonance: 1.3  // Aumenta la producción de cristales
        },

        harvestYield: {
            seeds: 1,
            resources: {
                'temporal-pulses': 20,
                'data-crystals': 5,
                'quantum-essence': 2
            },
            experience: 35
        },

        appearance: {
            stage0: { emoji: '🔷', size: 0.8 },
            stage1: { emoji: '🔹', size: 1.0 },
            stage2: { emoji: '💎', size: 1.1 },
            stage3: { emoji: '💎', size: 1.2 },
            stage4: { emoji: '💎', size: 1.3, glow: true, animation: 'crystal-pulse' }
        },

        sounds: {
            plant: 'plant-crystal',
            water: 'water-crystal',
            harvest: 'harvest-crystal',
            ambient: 'crystal-hum'
        }
    },

    'neuro-plant': {
        id: 'neuro-plant',
        name: 'Planta Neurocibernética',
        description: 'Una planta biomecánica que procesa datos y genera algoritmos genéticos. Sus raíces son circuitos impresos.',
        emoji: '🧠',
        era: 'future',
        growTime: 90000, // 90 segundos
        stages: 6,
        waterRequirement: 0.4,
        nutrientRequirement: 0.9,

        effects: {
            dataProcessing: 1.5,    // Genera más recursos digitales
            neuralLink: 1.2,        // Mejora todas las plantas cercanas
            autoOptimization: 1.1   // Se optimiza automáticamente
        },

        harvestYield: {
            seeds: 1,
            resources: {
                'temporal-pulses': 25,
                'neural-chips': 3,
                'ai-fragments': 1
            },
            experience: 50
        },

        appearance: {
            stage0: { emoji: '🔌', size: 0.8 },
            stage1: { emoji: '🌱', size: 1.0 },
            stage2: { emoji: '🧠', size: 1.1 },
            stage3: { emoji: '🧠', size: 1.2 },
            stage4: { emoji: '🧠', size: 1.3 },
            stage5: { emoji: '🧠', size: 1.4, glow: true, animation: 'neural-pulse' }
        },

        unlockRequirement: {
            type: 'harvest',
            plant: 'crystal-future',
            count: 12
        }
    },

    // Plantas Especiales (Eventos/Logros)
    'golden-rose': {
        id: 'golden-rose',
        name: 'Rosa Dorada del Tiempo',
        description: 'Una rosa legendaria que florece solo una vez cada mil años. Sus pétalos contienen el poder de manipular el tiempo.',
        emoji: '🌹',
        era: 'special',
        growTime: 300000, // 5 minutos
        stages: 7,
        waterRequirement: 0.5,
        nutrientRequirement: 0.5,

        effects: {
            temporalMastery: 2.0, // Duplica la producción de todos los recursos
            timeDilation: 1.5,    // Ralentiza el tiempo para las plantas cercanas
            goldenAura: 1.25      // Aumenta la calidad de todas las cosechas cercanas
        },

        harvestYield: {
            seeds: 0, // No produce semillas
            resources: {
                'temporal-pulses': 100,
                'golden-petals': 7,
                'time-essence': 1
            },
            experience: 100
        },

        appearance: {
            stage0: { emoji: '🌱', size: 0.8 },
            stage1: { emoji: '🌿', size: 1.0 },
            stage2: { emoji: '🌹', size: 1.1 },
            stage3: { emoji: '🌹', size: 1.2 },
            stage4: { emoji: '🌹', size: 1.3 },
            stage5: { emoji: '🌹', size: 1.4 },
            stage6: { emoji: '🌹', size: 1.5, glow: true, animation: 'golden-shimmer' }
        },

        unlockRequirement: {
            type: 'achievement',
            achievement: 'master-of-time',
            description: 'Desbloqueada al completar todas las misiones de cada era'
        }
    }
};

/**
 * Obtiene datos de una planta por su ID
 * @param {string} plantId - ID de la planta
 * @returns {Object|null} Datos de la planta
 */
window.getPlantData = function (plantId) {
    return window.plantData[plantId] || null;
};

/**
 * Obtiene todas las plantas de una era específica
 * @param {string} era - Era de las plantas
 * @returns {Array} Plantas de la era
 */
window.getPlantsByEra = function (era) {
    return Object.values(window.plantData).filter(plant => plant.era === era);
};

/**
 * Obtiene las plantas desbloqueadas para el jugador
 * @param {Array} unlockedEras - Eras desbloqueadas
 * @returns {Array} Plantas desbloqueadas
 */
window.getUnlockedPlants = function (unlockedEras) {
    return Object.values(window.plantData).filter(plant =>
        unlockedEras.includes(plant.era) || plant.era === 'special'
    );
};

console.log('🌱 Plantas: Datos de plantas cargados');