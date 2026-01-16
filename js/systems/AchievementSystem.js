/**
 * AchievementSystem - Sistema de logros
 * Responsabilidad: Manejar los logros y progreso del jugador
 */

class AchievementSystem {
    constructor() {
        this.achievements = new Map();
        this.playerProgress = new Map();
        this.unlockedAchievements = new Set();
        
        this.initializeAchievements();
        
        console.log('🏆 AchievementSystem: Sistema de logros inicializado');
    }
    
    init() {
        // Cargar progreso del jugador
        if (window.stateManager) {
            const savedProgress = window.stateManager.get('player.achievements', []);
            for (const achievementId of savedProgress) {
                this.unlockedAchievements.add(achievementId);
            }
        }
        
        // Configurar listeners de eventos
        this.setupEventListeners();
        
        console.log('✅ AchievementSystem: Sistema listo');
    }
    
    /**
     * Inicializa los logros disponibles
     * @private
     */
    initializeAchievements() {
        const achievements = [
            {
                id: 'first-plant',
                name: 'Primeros Pasos',
                description: 'Planta tu primera semilla',
                category: 'planting',
                icon: '🌱',
                requirement: { type: 'plant', count: 1 },
                reward: { experience: 10, resources: { 'temporal-pulses': 20 } }
            },
            {
                id: 'green-thumb',
                name: 'Pulgar Verde',
                description: 'Cultiva 50 plantas',
                category: 'planting',
                icon: '🌿',
                requirement: { type: 'plant', count: 50 },
                reward: { experience: 100, seeds: { 'golden-rose': 1 } }
            },
            {
                id: 'time-traveler',
                name: 'Viajero del Tiempo',
                description: 'Viaja a todas las eras',
                category: 'exploration',
                icon: '⏰',
                requirement: { type: 'visit-all-eras' },
                reward: { experience: 200, resources: { 'time-essence': 1 } }
            },
            {
                id: 'wealthy-farmer',
                name: 'Agricultor Acomodado',
                description: 'Acumula 1000 pulsos temporales',
                category: 'economy',
                icon: '💰',
                requirement: { type: 'resource', resource: 'temporal-pulses', amount: 1000 },
                reward: { experience: 150, resources: { 'temporal-pulses': 200 } }
            }
        ];
        
        for (const achievement of achievements) {
            this.achievements.set(achievement.id, achievement);
        }
    }
    
    /**
     * Configura listeners de eventos
     * @private
     */
    setupEventListeners() {
        if (!window.EventBus) return;
        
        // Eventos de plantación
        window.EventBus.on('plant:planted', (data) => {
            this.updateProgress('plant', 1);
        });
        
        // Eventos de viaje temporal
        window.EventBus.on('timetravel:success', (data) => {
            this.updateProgress('travel', 1);
            this.checkEraVisits();
        });
        
        // Eventos de recursos
        window.EventBus.on('resources:changed', (data) => {
            this.checkResourceAchievements(data);
        });
    }
    
    /**
     * Actualiza el progreso de un tipo de logro
     * @private
     */
    updateProgress(type, amount = 1) {
        const current = this.playerProgress.get(type) || 0;
        this.playerProgress.set(type, current + amount);
        
        // Verificar logros
        this.checkAchievements();
    }
    
    /**
     * Verifica si se han desbloqueado logros
     * @private
     */
    checkAchievements() {
        for (const [id, achievement] of this.achievements) {
            if (this.unlockedAchievements.has(id)) continue;
            
            if (this.isAchievementUnlocked(achievement)) {
                this.unlockAchievement(id);
            }
        }
    }
    
    /**
     * Verifica si un logro está desbloqueado
     * @private
     */
    isAchievementUnlocked(achievement) {
        const req = achievement.requirement;
        
        switch (req.type) {
            case 'plant':
                return (this.playerProgress.get('plant') || 0) >= req.count;
                
            case 'resource':
                if (!window.stateManager) return false;
                const currentAmount = window.stateManager.get(`player.inventory.resources.${req.resource}`, 0);
                return currentAmount >= req.amount;
                
            case 'visit-all-eras':
                return this.checkAllErasVisited();
                
            default:
                return false;
        }
    }
    
    /**
     * Verifica si se han visitado todas las eras
     * @private
     */
    checkAllErasVisited() {
        if (!window.stateManager) return false;
        
        const unlockedEras = window.stateManager.get('player.unlockedEras', []);
        const totalEras = window.getAllEras ? window.getAllEras().length : 3;
        
        return unlockedEras.length >= totalEras;
    }
    
    /**
     * Verifica logros basados en recursos
     * @private
     */
    checkResourceAchievements(data) {
        // Verificar logros de recursos específicos
        for (const [id, achievement] of this.achievements) {
            if (this.unlockedAchievements.has(id)) continue;
            
            const req = achievement.requirement;
            if (req.type === 'resource' && data[req.resource]) {
                if (data[req.resource] >= req.amount) {
                    this.unlockAchievement(id);
                }
            }
        }
    }
    
    /**
     * Verifica visitas a eras
     * @private
     */
    checkEraVisits() {
        this.checkAchievements();
    }
    
    /**
     * Desbloquea un logro
     * @param {string} achievementId - ID del logro
     */
    unlockAchievement(achievementId) {
        const achievement = this.achievements.get(achievementId);
        if (!achievement) return;
        
        this.unlockedAchievements.add(achievementId);
        
        // Guardar progreso
        if (window.stateManager) {
            window.stateManager.set('player.achievements', Array.from(this.unlockedAchievements));
        }
        
        // Notificar desbloqueo
        this.notifyAchievementUnlocked(achievement);
        
        // Aplicar recompensas
        this.applyReward(achievement.reward);
        
        console.log(`🏆 Logro desbloqueado: ${achievement.name}`);
    }
    
    /**
     * Notifica el desbloqueo de un logro
     * @private
     */
    notifyAchievementUnlocked(achievement) {
        if (window.EventBus) {
            window.EventBus.emit('achievement:unlocked', {
                achievement: achievement,
                timestamp: Date.now()
            });
        }
        
        // Mostrar notificación
        if (window.renderer) {
            window.renderer.showNotification(
                `¡Logro desbloqueado: ${achievement.name}!`,
                'success',
                5000
            );
        }
    }
    
    /**
     * Aplica recompensas de logro
     * @private
     */
    applyReward(reward) {
        if (!window.stateManager || !reward) return;
        
        // Aplicar experiencia
        if (reward.experience) {
            const currentExp = window.stateManager.get('player.experience', 0);
            window.stateManager.set('player.experience', currentExp + reward.experience);
        }
        
        // Aplicar recursos
        if (reward.resources) {
            for (const [resource, amount] of Object.entries(reward.resources)) {
                const current = window.stateManager.get(`player.inventory.resources.${resource}`, 0);
                window.stateManager.set(`player.inventory.resources.${resource}`, current + amount);
            }
        }
        
        // Aplicar semillas
        if (reward.seeds) {
            for (const [seed, count] of Object.entries(reward.seeds)) {
                const current = window.stateManager.get(`player.inventory.seeds.${seed}`, 0);
                window.stateManager.set(`player.inventory.seeds.${seed}`, current + count);
            }
        }
    }
    
    /**
     * Obtiene todos los logros
     */
    getAllAchievements() {
        return Array.from(this.achievements.values());
    }
    
    /**
     * Obtiene los logros desbloqueados
     */
    getUnlockedAchievements() {
        return Array.from(this.unlockedAchievements)
            .map(id => this.achievements.get(id))
            .filter(Boolean);
    }
    
    /**
     * Obtiene el progreso hacia un logro específico
     */
    getProgressTowards(achievementId) {
        const achievement = this.achievements.get(achievementId);
        if (!achievement) return null;
        
        const req = achievement.requirement;
        let current = 0;
        let target = 0;
        
        switch (req.type) {
            case 'plant':
                current = this.playerProgress.get('plant') || 0;
                target = req.count;
                break;
                
            case 'resource':
                if (window.stateManager) {
                    current = window.stateManager.get(`player.inventory.resources.${req.resource}`, 0);
                }
                target = req.amount;
                break;
                
            default:
                return null;
        }
        
        return {
            current: Math.min(current, target),
            target: target,
            percentage: Math.min(100, (current / target) * 100)
        };
    }
    
    /**
     * Obtiene estadísticas de logros
     */
    getStats() {
        const total = this.achievements.size;
        const unlocked = this.unlockedAchievements.size;
        
        return {
            totalAchievements: total,
            unlockedAchievements: unlocked,
            completionPercentage: Math.round((unlocked / total) * 100),
            categories: this.getCategoryStats()
        };
    }
    
    /**
     * Obtiene estadísticas por categoría
     * @private
     */
    getCategoryStats() {
        const categories = {};
        
        for (const achievement of this.achievements.values()) {
            if (!categories[achievement.category]) {
                categories[achievement.category] = { total: 0, unlocked: 0 };
            }
            categories[achievement.category].total++;
            
            if (this.unlockedAchievements.has(achievement.id)) {
                categories[achievement.category].unlocked++;
            }
        }
        
        return categories;
    }
    
    /**
     * Destruye el sistema
     */
    destroy() {
        this.achievements.clear();
        this.playerProgress.clear();
        this.unlockedAchievements.clear();
        console.log('🗑️ AchievementSystem: Sistema de logros destruido');
    }
}

window.AchievementSystem = AchievementSystem;