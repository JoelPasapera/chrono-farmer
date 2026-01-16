/**
 * PlantSystem - Sistema de gestión de plantas
 * Responsabilidad: Manejar todo lo relacionado con el cultivo, crecimiento y cosecha de plantas
 */

class PlantSystem {
    constructor() {
        // Referencias a otros sistemas
        this.gameEngine = null;
        this.eventBus = null;
        this.stateManager = null;
        this.renderer = null;
        this.audioManager = null;

        // Plantas activas (por plot ID)
        this.activePlants = new Map();

        // Configuración de crecimiento
        this.growthConfig = {
            updateInterval: 1000, // Actualizar cada segundo
            waterDecayRate: 0.5, // Decaída de agua por segundo
            nutrientDecayRate: 0.3, // Decaída de nutrientes por segundo
            growthMultiplier: 1.0 // Multiplicador global de crecimiento
        };

        // Timer de actualización
        this.updateTimer = 0;
        this.lastUpdateTime = 0;

        // Configuración
        this.config = {
            enableRealTimeGrowth: true,
            enableWatering: true,
            enableNutrients: true,
            enableEffects: true
        };

        // Bind de métodos
        this.update = this.update.bind(this);
        this.plantSeed = this.plantSeed.bind(this);
        this.harvestPlant = this.harvestPlant.bind(this);
        this.waterPlant = this.waterPlant.bind(this);

        console.log('🌱 PlantSystem: Sistema de plantas inicializado');
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
        }

        // Cargar plantas existentes del estado
        this.loadExistingPlants();

        // Configurar eventos
        this.setupEvents();

        console.log('✅ PlantSystem: Sistema listo');
    }

    /**
     * Carga las plantas existentes del estado
     * @private
     */
    loadExistingPlants() {
        if (!this.stateManager) return;

        const plots = this.stateManager.get('farm.plots', []);

        for (const plot of plots) {
            if (plot.plant && plot.state !== 'empty') {
                this.activePlants.set(plot.id, {
                    ...plot.plant,
                    plotId: plot.id,
                    plantedAt: plot.plantedAt,
                    lastWatered: plot.lastWatered,
                    growthStage: plot.growthStage,
                    waterLevel: plot.waterLevel,
                    nutrients: plot.nutrients
                });
            }
        }

        console.log(`🌱 PlantSystem: ${this.activePlants.size} plantas cargadas`);
    }

    /**
     * Configura los eventos del sistema
     * @private
     */
    setupEvents() {
        if (!this.eventBus) return;

        // Eventos de plantación
        this.eventBus.on('plant:seed', (plotId, seedType) => {
            this.plantSeed(plotId, seedType);
        });

        // Eventos de regado
        this.eventBus.on('plant:water', (plotId) => {
            this.waterPlant(plotId);
        });

        // Eventos de cosecha
        this.eventBus.on('plant:harvest', (plotId) => {
            this.harvestPlant(plotId);
        });

        // Eventos de aceleración temporal
        this.eventBus.on('time:accelerate', (plotId, duration) => {
            this.accelerateGrowth(plotId, duration);
        });

        // Eventos de cambio de era
        this.eventBus.on('era:changed', (newEra) => {
            this.onEraChanged(newEra);
        });
    }

    /**
     * Planta una semilla en un plot
     * @param {number} plotId - ID del plot
     * @param {string} seedType - Tipo de semilla
     */
    plantSeed(plotId, seedType) {
        if (!this.stateManager || !this.eventBus) return false;

        // Verificar que el plot existe y está vacío
        const plot = this.getPlot(plotId);
        if (!plot || plot.state !== 'empty') {
            console.warn(`⚠️ PlantSystem: Plot ${plotId} no está vacío`);
            this.eventBus.emit('plant:error', { plotId, error: 'Plot ocupado' });
            return false;
        }

        // Verificar que el jugador tiene la semilla
        const seedCount = this.stateManager.get(`player.inventory.seeds.${seedType}`, 0);
        if (seedCount <= 0) {
            console.warn(`⚠️ PlantSystem: No hay semillas de tipo ${seedType}`);
            this.eventBus.emit('plant:error', { plotId, error: 'Sin semillas' });
            return false;
        }

        // Obtener datos de la planta
        const plantData = this.getPlantData(seedType);
        if (!plantData) {
            console.error(`❌ PlantSystem: Datos de planta no encontrados para ${seedType}`);
            return false;
        }

        // Crear planta
        const plant = {
            type: seedType,
            name: plantData.name,
            emoji: plantData.emoji,
            era: plantData.era,
            growTime: plantData.growTime,
            maxStages: plantData.stages,
            harvestYield: plantData.harvestYield || { seeds: 1, resources: {} }
        };

        // Actualizar estado del plot
        const now = Date.now();
        const updates = {
            plant: plant,
            state: 'planted',
            plantedAt: now,
            lastWatered: now,
            growthStage: 0,
            maxGrowthStage: plantData.stages,
            waterLevel: 100,
            nutrients: 80
        };

        // Aplicar actualizaciones
        this.updatePlot(plotId, updates);

        // Agregar a plantas activas
        this.activePlants.set(plotId, {
            ...plant,
            plotId,
            plantedAt: now,
            lastWatered: now,
            growthStage: 0,
            waterLevel: 100,
            nutrients: 80
        });

        // Consumir semilla
        this.stateManager.set(`player.inventory.seeds.${seedType}`, seedCount - 1);

        // Notificar evento
        this.eventBus.emit('plant:planted', {
            plotId,
            plant: plant,
            timestamp: now
        });

        // Reproducir sonido
        if (this.audioManager) {
            this.audioManager.play('plant-seed');
        }

        // Actualizar UI
        if (this.renderer) {
            this.renderer.updatePlot(plotId, updates);
        }

        console.log(`🌱 PlantSystem: Semilla ${seedType} plantada en plot ${plotId}`);
        return true;
    }

    /**
     * Riega una planta
     * @param {number} plotId - ID del plot
     */
    waterPlant(plotId) {
        if (!this.stateManager || !this.eventBus) return false;

        const plot = this.getPlot(plotId);
        if (!plot || !plot.plant || plot.state === 'empty') {
            console.warn(`⚠️ PlantSystem: No hay planta en plot ${plotId}`);
            return false;
        }

        // Actualizar nivel de agua
        const newWaterLevel = Math.min(100, (plot.waterLevel || 0) + 30);
        const updates = {
            waterLevel: newWaterLevel,
            lastWatered: Date.now()
        };

        this.updatePlot(plotId, updates);

        // Actualizar planta activa
        const activePlant = this.activePlants.get(plotId);
        if (activePlant) {
            activePlant.waterLevel = newWaterLevel;
            activePlant.lastWatered = Date.now();
        }

        // Notificar evento
        this.eventBus.emit('plant:watered', {
            plotId,
            waterLevel: newWaterLevel,
            timestamp: Date.now()
        });

        // Reproducir sonido
        if (this.audioManager) {
            this.audioManager.play('water-plant');
        }

        // Actualizar UI
        if (this.renderer) {
            this.renderer.updatePlot(plotId, updates);
        }

        console.log(`💧 PlantSystem: Planta en plot ${plotId} regada`);
        return true;
    }

    /**
     * Cosecha una planta
     * @param {number} plotId - ID del plot
     */
    harvestPlant(plotId) {
        if (!this.stateManager || !this.eventBus) return false;

        const plot = this.getPlot(plotId);
        if (!plot || !plot.plant || plot.state !== 'ready') {
            console.warn(`⚠️ PlantSystem: Planta en plot ${plotId} no está lista para cosecha`);
            this.eventBus.emit('plant:error', { plotId, error: 'Planta no lista' });
            return false;
        }

        // Calcular recompensas
        const plant = plot.plant;
        const rewards = this.calculateHarvestRewards(plant);

        // Aplicar recompensas
        this.applyHarvestRewards(rewards);

        // Limpiar plot
        const updates = {
            plant: null,
            state: 'empty',
            plantedAt: null,
            lastWatered: null,
            growthStage: 0,
            maxGrowthStage: 0,
            waterLevel: 50,
            nutrients: 50
        };

        this.updatePlot(plotId, updates);

        // Remover de plantas activas
        this.activePlants.delete(plotId);

        // Notificar evento
        this.eventBus.emit('plant:harvested', {
            plotId,
            plant: plant,
            rewards: rewards,
            timestamp: Date.now()
        });

        // Reproducir sonido
        if (this.audioManager) {
            this.audioManager.play('harvest-plant');
        }

        // Actualizar UI
        if (this.renderer) {
            this.renderer.updatePlot(plotId, updates);
        }

        // Mostrar notificación
        if (this.eventBus) {
            this.eventBus.emit('notification:show', {
                message: `¡Cosechaste ${plant.name}!`,
                type: 'success'
            });
        }

        console.log(`🌾 PlantSystem: Planta ${plant.name} cosechada de plot ${plotId}`);
        return true;
    }

    /**
     * Actualiza el sistema (llamado en el game loop)
     * @param {number} deltaTime - Tiempo transcurrido en ms
     */
    update(deltaTime) {
        this.updateTimer += deltaTime;

        // Actualizar cada segundo
        if (this.updateTimer >= this.growthConfig.updateInterval) {
            this.updatePlants();
            this.updateTimer = 0;
        }
    }

    /**
     * Actualiza todas las plantas
     * @private
     */
    updatePlants() {
        const now = Date.now();

        for (const [plotId, plant] of this.activePlants) {
            const plot = this.getPlot(plotId);
            if (!plot) continue;

            let needsUpdate = false;
            const updates = {};

            // Decaída de agua
            if (this.config.enableWatering && plot.waterLevel > 0) {
                const timeSinceWatered = now - (plot.lastWatered || now);
                const waterDecay = (timeSinceWatered / 1000) * this.growthConfig.waterDecayRate;
                const newWaterLevel = Math.max(0, plot.waterLevel - waterDecay);

                if (Math.abs(newWaterLevel - plot.waterLevel) > 0.1) {
                    updates.waterLevel = newWaterLevel;
                    plant.waterLevel = newWaterLevel;
                    needsUpdate = true;
                }
            }

            // Decaída de nutrientes
            if (this.config.enableNutrients && plot.nutrients > 0) {
                const timeSincePlanted = now - (plot.plantedAt || now);
                const nutrientDecay = (timeSincePlanted / 1000) * this.growthConfig.nutrientDecayRate;
                const newNutrients = Math.max(0, plot.nutrients - nutrientDecay);

                if (Math.abs(newNutrients - plot.nutrients) > 0.1) {
                    updates.nutrients = newNutrients;
                    plant.nutrients = newNutrients;
                    needsUpdate = true;
                }
            }

            // Crecimiento
            if (plot.state === 'planted' || plot.state === 'growing') {
                const growthResult = this.calculateGrowth(plot, plant, now);

                if (growthResult.stageChanged) {
                    updates.growthStage = growthResult.newStage;
                    plant.growthStage = growthResult.newStage;
                    needsUpdate = true;

                    // Notificar crecimiento
                    if (this.eventBus) {
                        this.eventBus.emit('plant:growth', {
                            plotId,
                            plant: plant,
                            newStage: growthResult.newStage,
                            timestamp: now
                        });
                    }
                }

                // Verificar si está lista para cosecha
                if (growthResult.isReady && plot.state !== 'ready') {
                    updates.state = 'ready';
                    needsUpdate = true;

                    // Notificar que está lista
                    if (this.eventBus) {
                        this.eventBus.emit('plant:ready', {
                            plotId,
                            plant: plant,
                            timestamp: now
                        });
                    }
                }
            }

            // Aplicar actualizaciones si es necesario
            if (needsUpdate) {
                this.updatePlot(plotId, updates);

                // Actualizar UI
                if (this.renderer) {
                    this.renderer.updatePlot(plotId, updates);
                }
            }
        }
    }

    /**
     * Calcula el crecimiento de una planta
     * @private
     */
    calculateGrowth(plot, plant, now) {
        const plantData = this.getPlantData(plant.type);
        const timeSincePlanted = now - plot.plantedAt;

        // Calcular factor de crecimiento basado en agua y nutrientes
        const waterFactor = Math.max(0.1, (plot.waterLevel || 0) / 100);
        const nutrientFactor = Math.max(0.1, (plot.nutrients || 0) / 100);
        const environmentFactor = waterFactor * nutrientFactor;

        // Calcular etapa de crecimiento
        const baseGrowTime = plantData.growTime;
        const adjustedGrowTime = baseGrowTime / (environmentFactor * this.growthConfig.growthMultiplier);
        const progress = Math.min(1, timeSincePlanted / adjustedGrowTime);
        const newStage = Math.floor(progress * plant.maxStages);

        return {
            newStage: newStage,
            stageChanged: newStage > (plot.growthStage || 0),
            isReady: progress >= 1,
            progress: progress
        };
    }

    /**
     * Acelera el crecimiento usando pulsos temporales
     * @param {number} plotId - ID del plot
     * @param {number} duration - Duración del pulso en ms
     */
    accelerateGrowth(plotId, duration) {
        const plot = this.getPlot(plotId);

        // 1. Corregimos la validación: ahora verificamos plot.plant.type
        if (!plot || !plot.plant) {
            console.warn(`⚠️ PlantSystem: No hay planta en plot ${plotId}`);
            return null;
        }

        const now = Date.now();

        // 2. CAMBIO CLAVE: Usamos .type en lugar de .id
        const plantData = this.getPlantData(plot.plant.type);

        if (!plantData) {
            console.error(`❌ PlantSystem: Datos no encontrados para tipo: ${plot.plant.type}`);
            return null;
        }

        // 3. Aplicar aceleración (viaje al pasado de la fecha de plantación)
        const newPlantedAt = (plot.plantedAt || now) - duration;

        // 4. Actualizar el Plot en el StateManager
        this.updatePlot(plotId, {
            plantedAt: newPlantedAt
        });

        // 5. Sincronizar la planta activa en memoria
        const activePlant = this.activePlants.get(plotId);
        if (activePlant) {
            activePlant.plantedAt = newPlantedAt;
        }

        // 6. Calcular el nuevo progreso para la respuesta
        const elapsed = now - newPlantedAt;
        const progress = Math.min(100, (elapsed / plantData.growTime) * 100);

        // 7. Notificar a otros sistemas
        if (this.eventBus) {
            this.eventBus.emit('plant:accelerated', {
                plotId,
                progress,
                duration,
                timestamp: now
            });
        }

        if (this.audioManager) {
            this.audioManager.play('temporal-pulse');
        }

        console.log(`⚡ Acelerado: ${plot.plant.name} al ${Math.round(progress)}%`);
        return progress;
    }

    /**
     * Maneja el cambio de era
     * @param {string} newEra - Nueva era
     */
    onEraChanged(newEra) {
        // Aplicar efectos de era en el crecimiento
        const eraMultipliers = {
            'prehistoric': 0.8, // Crecimiento más lento
            'egyptian': 1.0,    // Crecimiento normal
            'future': 1.5       // Crecimiento más rápido
        };

        this.growthConfig.growthMultiplier = eraMultipliers[newEra] || 1.0;

        console.log(`🌍 PlantSystem: Multiplicador de crecimiento cambiado a ${this.growthConfig.growthMultiplier} por era ${newEra}`);
    }

    /**
     * Obtiene un plot del estado buscando por su ID
     * @private
     */
    getPlot(plotId) {
        if (!this.stateManager) return null;
        // Obtenemos el array de plots (en lugar de intentar acceder por punto)
        const plots = this.stateManager.get('farm.plots', []);

        // Buscamos el plot que tenga el ID que recibimos
        const foundPlot = plots.find(p => p.id === plotId);

        if (!foundPlot) {
            console.error(`❌ PlantSystem: No se encontró el plot con ID: ${plotId}`);
        }

        return foundPlot;
    }

    /**
     * Actualiza un plot en el estado
     * @private
     */
    updatePlot(plotId, updates) {
        if (!this.stateManager) return;

        // 1. Obtenemos la lista actual
        const plots = this.stateManager.get('farm.plots', []);
        // 2. Buscamos el índice del plot que queremos actualizar
        const index = plots.findIndex(p => p.id === plotId);

        if (index !== -1) {
            // 3. Aplicamos los cambios al objeto de ese índice
            plots[index] = { ...plots[index], ...updates };

            // 4. IMPORTANTE: Guardamos el array COMPLETO de nuevo
            // Esto notificará a la UI que algo en "farm.plots" cambió
            this.stateManager.set('farm.plots', plots);
        } else {
            console.error(`❌ PlantSystem: Imposible actualizar plot ${plotId}, no existe.`);
        }
    }

    /**
     * Obtiene los datos de una planta
     * @private
     */
    getPlantData(seedType) {
        if (!window.plantData) return null;
        return window.plantData[seedType];
    }

    /**
     * Calcula las recompensas de cosecha
     * @private
     */
    calculateHarvestRewards(plant) {
        const baseYield = plant.harvestYield;

        // Calcular variaciones aleatorias
        const seedBonus = Math.floor(Math.random() * 2); // 0-1 semillas extra
        const resourceBonus = Math.random() * 0.5 + 0.75; // 75-125% de recursos

        return {
            seeds: baseYield.seeds + seedBonus,
            resources: Object.fromEntries(
                Object.entries(baseYield.resources || {}).map(
                    ([resource, amount]) => [resource, Math.floor(amount * resourceBonus)]
                )
            )
        };
    }

    /**
     * Aplica las recompensas de cosecha al jugador
     * @private
     */
    applyHarvestRewards(rewards) {
        if (!this.stateManager) return;

        // Aplicar semillas
        for (const [seedType, count] of Object.entries(rewards.seeds || {})) {
            const currentCount = this.stateManager.get(`player.inventory.seeds.${seedType}`, 0);
            this.stateManager.set(`player.inventory.seeds.${seedType}`, currentCount + count);
        }

        // Aplicar recursos
        for (const [resource, amount] of Object.entries(rewards.resources || {})) {
            const currentAmount = this.stateManager.get(`player.inventory.resources.${resource}`, 0);
            this.stateManager.set(`player.inventory.resources.${resource}`, currentAmount + amount);
        }
    }

    /**
     * Obtiene estadísticas del sistema
     * @returns {Object} Estadísticas
     */
    getStats() {
        return {
            activePlants: this.activePlants.size,
            config: this.config,
            growthMultiplier: this.growthConfig.growthMultiplier
        };
    }

    /**
     * Configura el sistema
     * @param {Object} config - Nueva configuración
     */
    configure(config) {
        Object.assign(this.config, config);

        if (config.growthMultiplier !== undefined) {
            this.growthConfig.growthMultiplier = config.growthMultiplier;
        }
    }

    /**
     * Destruye el sistema
     */
    destroy() {
        this.activePlants.clear();
        console.log('🗑️ PlantSystem: Sistema de plantas destruido');
    }
}

// Exportar para uso global
window.PlantSystem = PlantSystem;