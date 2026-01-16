/**
 * Datos de logros del juego
 * Define todos los logros disponibles
 */

window.achievementData = {
    'first-plant': {
        id: 'first-plant',
        name: 'Primeros Pasos',
        description: 'Planta tu primera semilla',
        category: 'planting',
        icon: '🌱',
        requirement: { type: 'plant', count: 1 },
        reward: { experience: 10, resources: { 'temporal-pulses': 20 } }
    },
    'green-thumb': {
        id: 'green-thumb',
        name: 'Pulgar Verde',
        description: 'Cultiva 50 plantas',
        category: 'planting',
        icon: '🌿',
        requirement: { type: 'plant', count: 50 },
        reward: { experience: 100, seeds: { 'golden-rose': 1 } }
    },
    'time-traveler': {
        id: 'time-traveler',
        name: 'Viajero del Tiempo',
        description: 'Viaja a todas las eras',
        category: 'exploration',
        icon: '⏰',
        requirement: { type: 'visit-all-eras' },
        reward: { experience: 200, resources: { 'time-essence': 1 } }
    },
    'wealthy-farmer': {
        id: 'wealthy-farmer',
        name: 'Agricultor Acomodado',
        description: 'Acumula 1000 pulsos temporales',
        category: 'economy',
        icon: '💰',
        requirement: { type: 'resource', resource: 'temporal-pulses', amount: 1000 },
        reward: { experience: 150, resources: { 'temporal-pulses': 200 } }
    },
    'prehistoric-master': {
        id: 'prehistoric-master',
        name: 'Amigo de los Dinosaurios',
        description: 'Cultiva 20 plantas prehistóricas',
        category: 'planting',
        icon: '🦕',
        requirement: { type: 'harvest-era', era: 'prehistoric', count: 20 },
        reward: { experience: 75, seeds: { 'fern-ancient': 2 } }
    },
    'pharaoh-friend': {
        id: 'pharaoh-friend',
        name: 'Amigo de los Faraones',
        description: 'Completa todas las misiones egipcias',
        category: 'quests',
        icon: '👑',
        requirement: { type: 'complete-era-quests', era: 'egyptian' },
        reward: { experience: 150, resources: { 'artifacts': 50 } }
    },
    'quantum-gardener': {
        id: 'quantum-gardener',
        name: 'Jardinero Cuántico',
        description: 'Cultiva tu primera planta del futuro',
        category: 'planting',
        icon: '🚀',
        requirement: { type: 'harvest-era', era: 'future', count: 1 },
        reward: { experience: 100, seeds: { 'crystal-future': 2 } }
    }
};

/**
 * Obtiene datos de un logro por su ID
 * @param {string} achievementId - ID del logro
 * @returns {Object|null} Datos del logro
 */
window.getAchievementData = function(achievementId) {
    return window.achievementData[achievementId] || null;
};

/**
 * Obtiene todos los logros
 * @returns {Array} Todos los logros
 */
window.getAllAchievements = function() {
    return Object.values(window.achievementData);
};

/**
 * Obtiene logros por categoría
 * @param {string} category - Categoría de logros
 * @returns {Array} Logros de la categoría
 */
window.getAchievementsByCategory = function(category) {
    return Object.values(window.achievementData).filter(achievement => 
        achievement.category === category
    );
};

console.log('🏆 Logros: Datos de logros cargados');