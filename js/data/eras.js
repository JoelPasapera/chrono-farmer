/**
 * Datos de eras del juego
 * Define todas las eras disponibles y sus características
 */

window.eraData = {
    'prehistoric': {
        id: 'prehistoric',
        name: 'Era Primigenia',
        description: 'La época de los dinosaurios y las plantas ancestrales. Un mundo salvaje donde la naturaleza reina suprema.',
        longDescription: 'Viaja a los albores del tiempo, cuando los dinosaurios dominaban la Tierra y las primeras plantas comenzaban a cubrir su superficie. Las cuevas resuenan con sonidos primitivos y el aire está cargado de energía pura. Aquí encontrarás las semillas más antiguas, aquellas que han sobrevivido a cataclismos inimaginables.',
        
        // Iconos y visuales
        emoji: '🦕',
        background: 'linear-gradient(135deg, #2d5016 0%, #4a7c59 100%)',
        primaryColor: '#4a7c59',
        secondaryColor: '#8b4513',
        cssFilter: 'hue-rotate(120deg) saturate(0.7)',
        
        // Música y sonido
        musicTrack: 'music-prehistoric',
        ambientSound: 'ambient-jungle',
        
        // Recursos y mecánicas
        resources: {
            primary: 'fossils',
            secondary: 'plant-fiber',
            bonus: 'dino-eggs'
        },
        
        // Efectos de era
        effects: {
            growthMultiplier: 0.8, // Crecimiento más lento
            waterRetention: 1.2,   // Retiene más agua
            temporalResonance: 1.1 // Mejor generación de pulsos temporales
        },
        
        // Minijuego
        minigame: {
            id: 'meteor-dodge',
            name: 'Evita los Meteoritos',
            description: '¡Los meteoritos caen del cielo! Esquívalos mientras recolectas esporas prehistóricas.',
            difficulty: 'medium',
            rewards: {
                seeds: { 'prehistoric-moss': 3 },
                resources: { 'fossils': 10, 'temporal-pulses': 15 }
            }
        },
        
        // NPCs y misiones
        npcs: [
            {
                id: 'cave-shaman',
                name: 'Chamán de la Cueva',
                description: 'Un anciano sabio que conoce los secretos de las plantas prehistóricas',
                quests: [
                    {
                        id: 'first-plant',
                        title: 'Tu Primera Semilla',
                        description: 'Planta tu primera semilla prehistórica y aprende los fundamentos de la agricultura temporal',
                        type: 'plant',
                        target: 'prehistoric-moss',
                        count: 1,
                        rewards: {
                            seeds: { 'prehistoric-moss': 2 },
                            resources: { 'temporal-pulses': 20 },
                            experience: 25
                        }
                    },
                    {
                        id: 'cave-garden',
                        title: 'Jardín de la Cueva',
                        description: 'Cultiva 5 plantas prehistóricas para crear un jardín digno de los ancestros',
                        type: 'harvest',
                        target: 'prehistoric-moss',
                        count: 5,
                        rewards: {
                            seeds: { 'fern-ancient': 1 },
                            resources: { 'fossils': 15, 'temporal-pulses': 30 },
                            experience: 50
                        }
                    }
                ]
            }
        ],
        
        // Desbloqueo
        unlocked: true, // Empieza desbloqueada
        
        // Plantas disponibles
        availablePlants: ['prehistoric-moss', 'fern-ancient'],
        
        // Animales
        animals: [
            {
                id: 'mini-mammoth',
                name: 'Mamut Enano',
                emoji: '🐘',
                type: 'producer',
                production: {
                    item: 'mammoth-wool',
                    interval: 60000, // 1 minuto
                    amount: 1
                },
                cost: {
                    'temporal-pulses': 50,
                    'fossils': 10
                }
            },
            {
                id: 'dodo-bird',
                name: 'Dodo Doméstico',
                emoji: '🐦',
                type: 'companion',
                effect: {
                    type: 'growth-boost',
                    value: 1.1,
                    description: 'Aumenta el crecimiento de plantas cercanas en 10%'
                },
                cost: {
                    'temporal-pulses': 30
                }
            }
        ]
    },
    
    'egyptian': {
        id: 'egyptian',
        name: 'Antiguo Egipto',
        description: 'La era de los faraones y los misterios del Nilo. Donde la agricultura floreció en las riberas del gran río.',
        longDescription: 'El sol del desierto brilla sobre las pirámides mientras el Nilo trae vida a las arenas. Los antiguos egipcios dominaron el arte de la agricultura en tierras áridas, creando jardines suspendidos y cultivando lotos sagrados. Las plantas de esta era responden a los ritmos del sol y las estrellas.',
        
        emoji: '👑',
        background: 'linear-gradient(135deg, #d4af37 0%, #daa520 100%)',
        primaryColor: '#d4af37',
        secondaryColor: '#8b4513',
        cssFilter: 'hue-rotate(45deg) brightness(1.1)',
        
        musicTrack: 'music-egyptian',
        ambientSound: 'ambient-desert',
        
        resources: {
            primary: 'artifacts',
            secondary: 'papyrus-sheets',
            bonus: 'hieroglyphic-ink'
        },
        
        effects: {
            growthMultiplier: 1.0, // Crecimiento normal
            waterRetention: 0.9,   // Se evapora más rápido
            sunBlessing: 1.15      // Bonus con luz solar
        },
        
        minigame: {
            id: 'aqueduct-puzzle',
            name: 'Acueducto de los Dioses',
            description: 'Construye acueductos para regar los campos de lotos. ¡La lógica egipcia es clave!',
            difficulty: 'hard',
            rewards: {
                seeds: { 'lotus-egyptian': 2, 'papyrus-reed': 1 },
                resources: { 'artifacts': 15, 'temporal-pulses': 25 }
            }
        },
        
        npcs: [
            {
                id: 'high-priest',
                name: 'Sumo Sacerdote',
                description: 'Guardián de los secretos del Nilo y las plantas sagradas',
                quests: [
                    {
                        id: 'sacred-lotus',
                        title: 'El Loto Sagrado',
                        description: 'Cultiva el loto egipcio para honrar a los dioses del Nilo',
                        type: 'plant',
                        target: 'lotus-egyptian',
                        count: 3,
                        rewards: {
                            seeds: { 'papyrus-reed': 1 },
                            resources: { 'artifacts': 20, 'hieroglyphic-ink': 1 },
                            experience: 40
                        }
                    },
                    {
                        id: 'pharaoh-garden',
                        title: 'Jardín del Faraón',
                        description: 'Crea un jardín digno de un faraón con 10 plantas egipcias',
                        type: 'harvest',
                        target: 'lotus-egyptian',
                        count: 10,
                        rewards: {
                            seeds: { 'crystal-future': 1 },
                            resources: { 'golden-petals': 1, 'temporal-pulses': 50 },
                            experience: 75
                        }
                    }
                ]
            }
        ],
        
        unlockRequirement: {
            type: 'harvest',
            plantType: 'prehistoric-moss',
            count: 10
        },
        
        availablePlants: ['lotus-egyptian', 'papyrus-reed'],
        
        animals: [
            {
                id: 'sacred-cat',
                name: 'Gato Sagrado',
                emoji: '🐱',
                type: 'producer',
                production: {
                    item: 'sacred-fur',
                    interval: 90000, // 1.5 minutos
                    amount: 1
                },
                cost: {
                    'temporal-pulses': 75,
                    'artifacts': 15
                }
            },
            {
                id: 'scarab-beetle',
                name: 'Escarabajo Sagrado',
                emoji: '🪲',
                type: 'companion',
                effect: {
                    type: 'resource-boost',
                    target: 'artifacts',
                    value: 1.2,
                    description: 'Aumenta la producción de artefactos en 20%'
                },
                cost: {
                    'temporal-pulses': 40
                }
            }
        ]
    },
    
    'future': {
        id: 'future',
        name: 'Año 3025',
        description: 'Un futuro tecnológico con plantas cristalinas. La agricultura se ha fusionado con la tecnología cuántica.',
        longDescription: 'Las ciudades flotantes brillan con luces de neón mientras los cultivos de cristal crecen en jardines suspendidos. La música electrónica alimenta plantas biomecánicas que generan datos puros. Los agricultores del futuro son ingenieros que cultivan código genético.',
        
        emoji: '🚀',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        primaryColor: '#00ffff',
        secondaryColor: '#ff00ff',
        cssFilter: 'hue-rotate(280deg) saturate(1.3) brightness(1.2)',
        
        musicTrack: 'music-future',
        ambientSound: 'ambient-cyber',
        
        resources: {
            primary: 'data-crystals',
            secondary: 'neural-chips',
            bonus: 'ai-fragments'
        },
        
        effects: {
            growthMultiplier: 1.5, // Crecimiento muy rápido
            waterRetention: 0.7,   // Se evapora rápido
            energyConversion: 1.3  // Convierte energía en crecimiento
        },
        
        minigame: {
            id: 'hoverboard-race',
            name: 'Carrera de Hoverboards',
            description: '¡Corre entre los drones recolectando cristales de datos en tu hoverboard!',
            difficulty: 'extreme',
            rewards: {
                seeds: { 'crystal-future': 2, 'neuro-plant': 1 },
                resources: { 'data-crystals': 20, 'temporal-pulses': 40 }
            }
        },
        
        npcs: [
            {
                id: 'ai-gardener',
                name: 'Jardinero AI',
                description: 'Una inteligencia artificial especializada en agricultura cuántica',
                quests: [
                    {
                        id: 'crystal-garden',
                        title: 'Jardín de Cristal',
                        description: 'Cultiva plantas cristalinas para alimentar los motores temporales',
                        type: 'plant',
                        target: 'crystal-future',
                        count: 5,
                        rewards: {
                            seeds: { 'neuro-plant': 1 },
                            resources: { 'data-crystals': 25, 'ai-fragments': 2 },
                            experience: 60
                        }
                    },
                    {
                        id: 'quantum-harvest',
                        title: 'Cosecha Cuántica',
                        description: 'Domina la agricultura del futuro con 15 cosechas de plantas cristalinas',
                        type: 'harvest',
                        target: 'crystal-future',
                        count: 15,
                        rewards: {
                            seeds: { 'golden-rose': 1 },
                            resources: { 'time-essence': 1, 'temporal-pulses': 100 },
                            experience: 100
                        }
                    }
                ]
            }
        ],
        
        unlockRequirement: {
            type: 'harvest',
            plantType: 'lotus-egyptian',
            count: 15
        },
        
        availablePlants: ['crystal-future', 'neuro-plant'],
        
        animals: [
            {
                id: 'robo-sheep',
                name: 'Oveja Robótica',
                emoji: '🤖',
                type: 'producer',
                production: {
                    item: 'copper-wool',
                    interval: 120000, // 2 minutos
                    amount: 2
                },
                cost: {
                    'temporal-pulses': 100,
                    'data-crystals': 20
                }
            },
            {
                id: 'hologram-bird',
                name: 'Ave Holográfica',
                emoji: '🕊️',
                type: 'companion',
                effect: {
                    type: 'growth-acceleration',
                    value: 1.3,
                    description: 'Acelera el crecimiento de todas las plantas en 30%'
                },
                cost: {
                    'temporal-pulses': 150
                }
            }
        ]
    }
};

/**
 * Obtiene datos de una era por su ID
 * @param {string} eraId - ID de la era
 * @returns {Object|null} Datos de la era
 */
window.getEraData = function(eraId) {
    return window.eraData[eraId] || null;
};

/**
 * Obtiene todas las eras
 * @returns {Array} Todas las eras
 */
window.getAllEras = function() {
    return Object.values(window.eraData);
};

/**
 * Obtiene las eras desbloqueadas para el jugador
 * @param {Array} unlockedEraIds - IDs de eras desbloqueadas
 * @returns {Array} Eras desbloqueadas
 */
window.getUnlockedEras = function(unlockedEraIds) {
    return Object.values(window.eraData).filter(era => 
        era.unlocked || unlockedEraIds.includes(era.id)
    );
};

console.log('🌍 Eras: Datos de eras cargados');