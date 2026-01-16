/**
 * TimeTravelSystem - Sistema de viajes temporales
 * Responsabilidad: Manejar los viajes entre eras y sus efectos
 */

class TimeTravelSystem {
    constructor() {
        // Referencias a otros sistemas
        this.gameEngine = null;
        this.eventBus = null;
        this.stateManager = null;
        this.renderer = null;
        this.audioManager = null;
        this.plantSystem = null;
        
        // Estado del sistema
        this.currentEra = 'prehistoric';
        this.previousEra = null;
        this.isTraveling = false;
        this.travelCooldown = 0;
        
        // Configuración de eras
        this.eras = new Map();
        this.initializeEras();
        
        // Configuración de viaje
        this.travelConfig = {
            minTravelInterval: 5000, // 5 segundos entre viajes
            travelDuration: 2000, // 2 segundos de animación
            temporalPulseCost: 10, // Costo en pulsos temporales
            unlockRequirements: new Map()
        };
        
        // Efectos de viaje
        this.travelEffects = [];
        
        // Configuración
        this.config = {
            enableTravelEffects: true,
            enableCooldown: true,
            enableCost: true
        };
        
        // Bind de métodos
        this.travelTo = this.travelTo.bind(this);
        this.update = this.update.bind(this);
        
        console.log('⏰ TimeTravelSystem: Sistema de viajes temporales inicializado');
    }
    
    /**
     * Inicializa el sistema
     */
    init() {
        // Obtener referencias a otros sistemas
        if (this.gameEngine) {
            this.eventBus = this.gameEngine.getSystem('eventBus') || window.EventBus;
            this.stateManager = this.gameEngine.getSystem('stateManager') || window.stateManager;
            this.renderer = this.gameEngine.getSystem('renderer') || window.renderer;
            this.audioManager = this.gameEngine.getSystem('audioManager') || window.audioManager;
            this.plantSystem = this.gameEngine.getSystem('plantSystem') || window.plantSystem;
        }
        
        // Cargar era actual del estado
        if (this.stateManager) {
            this.currentEra = this.stateManager.get('time.currentEra', 'prehistoric');
        }
        
        // Configurar eventos
        this.setupEvents();
        
        console.log('✅ TimeTravelSystem: Sistema listo');
    }
    
    /**
     * Inicializa las eras del juego
     * @private
     */
    initializeEras() {
        this.eras.set('prehistoric', {
            id: 'prehistoric',
            name: 'Era Primigenia',
            description: 'La época de los dinosaurios y las plantas ancestrales',
            emoji: '🦕',
            theme: {
                background: 'linear-gradient(135deg, #2d5016 0%, #4a7c59 100%)',
                primaryColor: '#4a7c59',
                secondaryColor: '#8b4513',
                filter: 'hue-rotate(120deg) saturate(0.7)'
            },
            music: 'music-prehistoric',
            ambient: 'ambient-jungle',
            unlocked: true,
            minigame: 'meteor-dodge',
            resources: {
                seeds: ['prehistoric-moss'],
                bonus: 'fossils'
            },
            effects: {
                growthMultiplier: 0.8,
                waterRetention: 1.2
            }
        });
        
        this.eras.set('egyptian', {
            id: 'egyptian',
            name: 'Antiguo Egipto',
            description: 'La era de los faraones y los misterios del Nilo',
            emoji: '👑',
            theme: {
                background: 'linear-gradient(135deg, #d4af37 0%, #daa520 100%)',
                primaryColor: '#d4af37',
                secondaryColor: '#8b4513',
                filter: 'hue-rotate(45deg) brightness(1.1)'
            },
            music: 'music-egyptian',
            ambient: 'ambient-desert',
            unlocked: false,
            unlockRequirement: {
                type: 'harvest',
                plantType: 'prehistoric-moss',
                count: 10
            },
            minigame: 'aqueduct-puzzle',
            resources: {
                seeds: ['lotus-egyptian'],
                bonus: 'artifacts'
            },
            effects: {
                growthMultiplier: 1.0,
                waterRetention: 0.9
            }
        });
        
        this.eras.set('future', {
            id: 'future',
            name: 'Año 3025',
            description: 'Un futuro tecnológico con plantas cristalinas',
            emoji: '🚀',
            theme: {
                background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                primaryColor: '#00ffff',
                secondaryColor: '#ff00ff',
                filter: 'hue-rotate(280deg) saturate(1.3) brightness(1.2)'
            },
            music: 'music-future',
            ambient: 'ambient-cyber',
            unlocked: false,
            unlockRequirement: {
                type: 'harvest',
                plantType: 'lotus-egyptian',
                count: 15
            },
            minigame: 'hoverboard-race',
            resources: {
                seeds: ['crystal-future'],
                bonus: 'data-crystals'
            },
            effects: {
                growthMultiplier: 1.5,
                waterRetention: 0.7
            }
        });
        
        console.log('🌍 TimeTravelSystem: Eras inicializadas');
    }
    
    /**
     * Configura los eventos del sistema
     * @private
     */
    setupEvents() {
        if (!this.eventBus) return;
        
        // Eventos de viaje temporal
        this.eventBus.on('timetravel:request', (eraId) => {
            this.travelTo(eraId);
        });
        
        // Eventos de desbloqueo de eras
        this.eventBus.on('plant:harvested', (data) => {
            this.checkEraUnlocks(data);
        });
        
        // Eventos de minijuegos
        this.eventBus.on('minigame:completed', (data) => {
            this.onMinigameCompleted(data);
        });
    }
    
    /**
     * Viaja a una era específica
     * @param {string} eraId - ID de la era destino
     */
    async travelTo(eraId) {
        // Verificaciones previas
        if (this.isTraveling) {
            console.warn('⏰ TimeTravelSystem: Ya hay un viaje en progreso');
            return false;
        }
        
        if (this.currentEra === eraId) {
            console.warn(`⏰ TimeTravelSystem: Ya estás en la era ${eraId}`);
            return false;
        }
        
        const targetEra = this.eras.get(eraId);
        if (!targetEra) {
            console.error(`❌ TimeTravelSystem: Era desconocida ${eraId}`);
            return false;
        }
        
        if (!targetEra.unlocked) {
            console.warn(`⏰ TimeTravelSystem: Era ${eraId} no está desbloqueada`);
            this.eventBus?.emit('timetravel:locked', { eraId, requirement: targetEra.unlockRequirement });
            return false;
        }
        
        // Verificar cooldown
        if (this.config.enableCooldown && this.travelCooldown > 0) {
            console.warn('⏰ TimeTravelSystem: En cooldown');
            return false;
        }
        
        // Verificar costo
        if (this.config.enableCost) {
            const currentPulses = this.stateManager?.get('player.inventory.resources.temporal-pulses', 0);
            if (currentPulses < this.travelConfig.temporalPulseCost) {
                console.warn('⏰ TimeTravelSystem: No hay suficientes pulsos temporales');
                this.eventBus?.emit('timetravel:insufficient-resources', {
                    required: this.travelConfig.temporalPulseCost,
                    current: currentPulses
                });
                return false;
            }
        }
        
        // Iniciar viaje
        this.isTraveling = true;
        
        try {
            // Consumir recursos
            if (this.config.enableCost) {
                const currentPulses = this.stateManager.get('player.inventory.resources.temporal-pulses', 0);
                this.stateManager.set('player.inventory.resources.temporal-pulses', currentPulses - this.travelConfig.temporalPulseCost);
            }
            
            // Notificar inicio de viaje
            this.eventBus?.emit('timetravel:start', {
                from: this.currentEra,
                to: eraId,
                timestamp: Date.now()
            });
            
            // Efectos de viaje
            await this.playTravelEffects();
            
            // Cambiar era
            this.previousEra = this.currentEra;
            this.currentEra = eraId;
            
            // Actualizar estado
            this.stateManager?.set('time.currentEra', eraId);
            this.stateManager?.set('time.previousEra', this.previousEra);
            
            // Aplicar efectos de era
            this.applyEraEffects(targetEra);
            
            // Cambiar música y ambientación
            if (this.audioManager) {
                this.audioManager.playMusic(targetEra.music);
                this.audioManager.playAmbient(targetEra.ambient);
            }
            
            // Actualizar tema visual
            this.applyEraTheme(targetEra);
            
            // Notificar éxito
            this.eventBus?.emit('timetravel:success', {
                from: this.previousEra,
                to: eraId,
                timestamp: Date.now()
            });
            
            // Establecer cooldown
            this.travelCooldown = this.travelConfig.minTravelInterval;
            
            console.log(`⏰ TimeTravelSystem: Viajado de ${this.previousEra} a ${eraId}`);
            return true;
            
        } catch (error) {
            console.error('❌ TimeTravelSystem: Error durante el viaje:', error);
            this.eventBus?.emit('timetravel:error', { error: error.message });
            return false;
        } finally {
            this.isTraveling = false;
        }
    }
    
    /**
     * Reproduce efectos de viaje temporal
     * @private
     */
    async playTravelEffects() {
        if (!this.config.enableTravelEffects) return;
        
        // Efecto visual de portal
        if (this.renderer) {
            const portal = this.renderer.getElement('time-portal');
            if (portal) {
                portal.classList.add('time-portal--active');
                await this.wait(this.travelConfig.travelDuration * 0.5);
                portal.classList.remove('time-portal--active');
            }
        }
        
        // Efecto de sonido
        if (this.audioManager) {
            this.audioManager.play('temporal-pulse');
        }
        
        // Efecto de pantalla
        if (this.renderer) {
            const gameContainer = this.renderer.getElement('game-container');
            if (gameContainer) {
                gameContainer.style.animation = 'timeWarp 2s ease-in-out';
                await this.wait(this.travelConfig.travelDuration);
                gameContainer.style.animation = '';
            }
        }
    }
    
    /**
     * Aplica efectos de la era actual
     * @private
     */
    applyEraEffects(era) {
        if (!this.plantSystem) return;
        
        // Aplicar multiplicador de crecimiento
        if (era.effects?.growthMultiplier) {
            this.plantSystem.growthConfig.growthMultiplier = era.effects.growthMultiplier;
        }
        
        // Aplicar efectos de retención de agua
        if (era.effects?.waterRetention && this.config.enableWatering) {
            // Este efecto se aplicaría en el sistema de plantas
        }
    }
    
    /**
     * Aplica el tema visual de la era
     * @private
     */
    applyEraTheme(era) {
        if (!this.renderer) return;
        
        const gameContainer = this.renderer.getElement('game-container');
        if (!gameContainer) return;
        
        // Aplicar fondo
        if (era.theme?.background) {
            gameContainer.style.background = era.theme.background;
        }
        
        // Aplicar filtro CSS
        if (era.theme?.filter) {
            const farmArea = this.renderer.getElement('farm-area');
            if (farmArea) {
                farmArea.style.filter = era.theme.filter;
            }
        }
        
        // Actualizar UI
        if (this.renderer) {
            this.renderer.updateEra(era.id);
        }
    }
    
    /**
     * Verifica si se deben desbloquear eras
     * @private
     */
    checkEraUnlocks(harvestData) {
        for (const [eraId, era] of this.eras) {
            if (era.unlocked || !era.unlockRequirement) continue;
            
            const req = era.unlockRequirement;
            let shouldUnlock = false;
            
            switch (req.type) {
                case 'harvest':
                    if (harvestData.plant.type === req.plantType) {
                        // Contar cosechas totales del tipo requerido
                        const currentCount = this.getHarvestCount(req.plantType);
                        if (currentCount >= req.count) {
                            shouldUnlock = true;
                        }
                    }
                    break;
                    
                case 'minigame':
                    // Verificado en onMinigameCompleted
                    break;
                    
                case 'resource':
                    const currentAmount = this.stateManager?.get(`player.inventory.resources.${req.resource}`, 0);
                    if (currentAmount >= req.amount) {
                        shouldUnlock = true;
                    }
                    break;
            }
            
            if (shouldUnlock) {
                this.unlockEra(eraId);
            }
        }
    }
    
    /**
     * Desbloquea una era
     * @param {string} eraId - ID de la era
     */
    unlockEra(eraId) {
        const era = this.eras.get(eraId);
        if (!era || era.unlocked) return;
        
        era.unlocked = true;
        
        // Actualizar estado del jugador
        const unlockedEras = this.stateManager?.get('player.unlockedEras', []);
        if (!unlockedEras.includes(eraId)) {
            unlockedEras.push(eraId);
            this.stateManager?.set('player.unlockedEras', unlockedEras);
        }
        
        // Notificar desbloqueo
        this.eventBus?.emit('timetravel:era-unlocked', {
            eraId,
            era: era,
            timestamp: Date.now()
        });
        
        // Mostrar notificación
        this.eventBus?.emit('notification:show', {
            message: `¡Era desbloqueada: ${era.name}!`,
            type: 'success',
            duration: 5000
        });
        
        console.log(`⏰ TimeTravelSystem: Era ${eraId} desbloqueada`);
    }
    
    /**
     * Maneja la finalización de un minijuego
     * @private
     */
    onMinigameCompleted(data) {
        const { minigame, success, rewards } = data;
        
        if (success) {
            // Verificar si el minijuego desbloquea una era
            for (const [eraId, era] of this.eras) {
                if (era.unlockRequirement?.type === 'minigame' &&
                    era.unlockRequirement.minigame === minigame) {
                    this.unlockEra(eraId);
                    break;
                }
            }
            
            // Aplicar recompensas de minijuego
            this.applyMinigameRewards(rewards);
        }
    }
    
    /**
     * Aplica recompensas de minijuego
     * @private
     */
    applyMinigameRewards(rewards) {
        if (!this.stateManager || !rewards) return;
        
        // Aplicar recursos
        for (const [resource, amount] of Object.entries(rewards.resources || {})) {
            const current = this.stateManager.get(`player.inventory.resources.${resource}`, 0);
            this.stateManager.set(`player.inventory.resources.${resource}`, current + amount);
        }
        
        // Aplicar semillas
        for (const [seed, count] of Object.entries(rewards.seeds || {})) {
            const current = this.stateManager.get(`player.inventory.seeds.${seed}`, 0);
            this.stateManager.set(`player.inventory.seeds.${seed}`, current + count);
        }
    }
    
    /**
     * Obtiene el conteo de cosechas de un tipo de planta
     * @private
     */
    getHarvestCount(plantType) {
        // Esto debería ser trackeado en el estado del jugador
        const harvestStats = this.stateManager?.get('player.harvestStats', {});
        return harvestStats[plantType] || 0;
    }
    
    /**
     * Actualiza el sistema (llamado en el game loop)
     * @param {number} deltaTime - Tiempo transcurrido en ms
     */
    update(deltaTime) {
        // Actualizar cooldown
        if (this.travelCooldown > 0) {
            this.travelCooldown = Math.max(0, this.travelCooldown - deltaTime);
        }
    }
    
    /**
     * Obtiene información de una era
     * @param {string} eraId - ID de la era
     * @returns {Object|null} Información de la era
     */
    getEra(eraId) {
        return this.eras.get(eraId) || null;
    }
    
    /**
     * Obtiene todas las eras desbloqueadas
     * @returns {Array} Eras desbloqueadas
     */
    getUnlockedEras() {
        const unlocked = [];
        for (const era of this.eras.values()) {
            if (era.unlocked) {
                unlocked.push(era);
            }
        }
        return unlocked;
    }
    
    /**
     * Obtiene la era actual
     * @returns {Object} Era actual
     */
    getCurrentEra() {
        return this.eras.get(this.currentEra) || null;
    }
    
    /**
     * Utilidad para esperar
     * @private
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Obtiene estadísticas del sistema
     * @returns {Object} Estadísticas
     */
    getStats() {
        return {
            currentEra: this.currentEra,
            previousEra: this.previousEra,
            isTraveling: this.isTraveling,
            travelCooldown: this.travelCooldown,
            unlockedEras: this.getUnlockedEras().length,
            totalEras: this.eras.size
        };
    }
    
    /**
     * Configura el sistema
     * @param {Object} config - Nueva configuración
     */
    configure(config) {
        Object.assign(this.config, config);
    }
    
    /**
     * Destruye el sistema
     */
    destroy() {
        this.eras.clear();
        this.travelEffects = [];
        console.log('🗑️ TimeTravelSystem: Sistema de viajes temporales destruido');
    }
}

// Exportar para uso global
window.TimeTravelSystem = TimeTravelSystem;