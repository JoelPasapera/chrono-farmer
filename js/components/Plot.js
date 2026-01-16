/**
 * Plot - Componente de celda de granja
 * Representa una celda individual donde se pueden plantar cultivos
 */

class Plot {
    constructor(id, config = {}) {
        // Identificación
        this.id = id;
        this.position = this.calculatePosition(id);
        
        // Estado
        this.state = 'empty'; // empty, planted, growing, ready, harvested
        this.plant = null;
        
        // Recursos del suelo
        this.waterLevel = config.waterLevel || 50;
        this.nutrients = config.nutrients || 50;
        this.soilQuality = config.soilQuality || 100;
        
        // Historial
        this.plantedAt = null;
        this.lastWatered = null;
        this.lastHarvested = null;
        
        // Configuración
        this.config = {
            maxWater: 100,
            maxNutrients: 100,
            waterDecayRate: config.waterDecayRate || 0.5,
            nutrientDecayRate: config.nutrientDecayRate || 0.3,
            soilType: config.soilType || 'standard', // standard, fertile, sandy, rocky
            ...config
        };
        
        // Efectos del plot
        this.effects = new Map();
        
        // Callbacks
        this.onStateChange = config.onStateChange || null;
        this.onPlantChange = config.onPlantChange || null;
        
        // Inicializar según tipo de suelo
        this.initializeSoil();
        
        console.log(`🌱 Plot ${this.id}: Celda creada en posición ${this.position.x},${this.position.y}`);
    }
    
    /**
     * Calcula la posición (x, y) basada en el ID
     * @private
     */
    calculatePosition(id) {
        const gridWidth = 8; // 8 columnas
        const x = id % gridWidth;
        const y = Math.floor(id / gridWidth);
        return { x, y };
    }
    
    /**
     * Inicializa el suelo según su tipo
     * @private
     */
    initializeSoil() {
        const soilTypes = {
            standard: {
                waterRetention: 1.0,
                nutrientCapacity: 1.0,
                growthMultiplier: 1.0
            },
            fertile: {
                waterRetention: 1.2,
                nutrientCapacity: 1.3,
                growthMultiplier: 1.25,
                initialNutrients: 80
            },
            sandy: {
                waterRetention: 0.6,
                nutrientCapacity: 0.8,
                growthMultiplier: 0.9,
                initialWater: 30
            },
            rocky: {
                waterRetention: 0.8,
                nutrientCapacity: 0.6,
                growthMultiplier: 0.8,
                initialNutrients: 30
            }
        };
        
        const soilConfig = soilTypes[this.config.soilType];
        if (soilConfig) {
            this.config = { ...this.config, ...soilConfig };
            
            // Aplicar valores iniciales
            if (soilConfig.initialWater !== undefined) {
                this.waterLevel = soilConfig.initialWater;
            }
            if (soilConfig.initialNutrients !== undefined) {
                this.nutrients = soilConfig.initialNutrients;
            }
        }
    }
    
    /**
     * Planta una semilla en el plot
     * @param {Object} plantData - Datos de la planta a sembrar
     * @returns {boolean} true si se plantó exitosamente
     */
    plant(plantData) {
        if (!this.isEmpty()) {
            console.warn(`⚠️ Plot ${this.id}: No se puede plantar, el plot no está vacío`);
            return false;
        }
        
        // Crear instancia de planta
        this.plant = new Plant({
            ...plantData,
            plantedAt: Date.now(),
            lastWatered: Date.now()
        });
        
        // Actualizar estado
        this.state = 'planted';
        this.plantedAt = Date.now();
        this.lastWatered = Date.now();
        
        // Aplicar efectos de suelo
        this.applySoilEffects();
        
        // Notificar cambio
        this.notifyStateChange();
        this.notifyPlantChange();
        
        console.log(`🌱 Plot ${this.id}: ${plantData.name} plantada`);
        return true;
    }
    
    /**
     * Riega la planta en el plot
     * @param {number} amount - Cantidad de agua
     * @returns {number} Nuevo nivel de agua
     */
    water(amount = 30) {
        if (!this.hasPlant()) {
            // Regar suelo vacío (preparación para futura plantación)
            this.waterLevel = Math.min(this.config.maxWater, this.waterLevel + amount * 0.5);
            return this.waterLevel;
        }
        
        // Regar planta
        const newWaterLevel = this.plant.water(amount);
        this.waterLevel = newWaterLevel;
        this.lastWatered = Date.now();
        
        // Aplicar bonus por regado oportuno
        if (this.plant.waterLevel > 80) {
            this.addEffect('well-watered', {
                growthMultiplier: 1.1,
                duration: 30000 // 30 segundos
            });
        }
        
        console.log(`💧 Plot ${this.id}: Regado, nivel de agua: ${this.waterLevel}%`);
        return this.waterLevel;
    }
    
    /**
     * Aplica fertilizante al plot
     * @param {number} amount - Cantidad de nutrientes
     * @returns {number} Nuevo nivel de nutrientes
     */
    fertilize(amount = 20) {
        if (!this.hasPlant()) {
            // Fertilizar suelo vacío
            this.nutrients = Math.min(this.config.maxNutrients, this.nutrients + amount * 0.3);
            return this.nutrients;
        }
        
        // Fertilizar planta
        const newNutrientLevel = this.plant.fertilize(amount);
        this.nutrients = newNutrientLevel;
        
        // Aplicar bonus por fertilización
        if (this.plant.nutrients > 80) {
            this.addEffect('well-fertilized', {
                qualityMultiplier: 1.15,
                duration: 60000 // 1 minuto
            });
        }
        
        console.log(`🌱 Plot ${this.id}: Fertilizado, nutrientes: ${this.nutrients}%`);
        return this.nutrients;
    }
    
    /**
     * Cosecha la planta del plot
     * @returns {Object|null} Recompensas de la cosecha o null si no hay planta
     */
    harvest() {
        if (!this.canHarvest()) {
            console.warn(`⚠️ Plot ${this.id}: No se puede cosechar`);
            return null;
        }
        
        // Calcular recompensas
        const rewards = this.plant.calculateHarvestRewards();
        
        // Aplicar bonus del plot
        const finalRewards = this.applyPlotBonuses(rewards);
        
        // Limpiar plot
        const oldPlant = this.plant;
        this.plant = null;
        this.state = 'empty';
        this.lastHarvested = Date.now();
        
        // Reducir calidad del suelo
        this.soilQuality = Math.max(50, this.soilQuality - 5);
        
        // Limpiar efectos
        this.effects.clear();
        
        // Notificar cambios
        this.notifyStateChange();
        this.notifyPlantChange();
        
        console.log(`🌾 Plot ${this.id}: ${oldPlant.name} cosechada`);
        return finalRewards;
    }
    
    /**
     * Actualiza el estado del plot
     * @param {number} currentTime - Tiempo actual
     */
    update(currentTime = Date.now()) {
        // Actualizar planta si existe
        if (this.hasPlant()) {
            this.plant.update(currentTime);
            this.syncPlantState();
        }
        
        // Decaída de recursos del suelo
        this.updateSoilResources(currentTime);
        
        // Actualizar efectos
        this.updateEffects(currentTime);
        
        // Actualizar estado del plot basado en la planta
        this.updatePlotState();
    }
    
    /**
     * Sincroniza el estado del plot con el estado de la planta
     * @private
     */
    syncPlantState() {
        if (!this.plant) return;
        
        // Sincronizar recursos
        this.waterLevel = this.plant.waterLevel;
        this.nutrients = this.plant.nutrients;
        
        // Sincronizar estado de crecimiento
        if (this.plant.isReady && this.state !== 'ready') {
            this.state = 'ready';
            this.notifyStateChange();
        } else if (this.plant.isGrowing && this.state === 'planted') {
            this.state = 'growing';
            this.notifyStateChange();
        }
    }
    
    /**
     * Actualiza los recursos del suelo
     * @private
     */
    updateSoilResources(currentTime) {
        const timeSinceLastUpdate = currentTime - (this.lastWatered || currentTime);
        
        // Decaída de agua
        if (this.waterLevel > 0) {
            const waterDecay = (timeSinceLastUpdate / 1000) * this.config.waterDecayRate;
            this.waterLevel = Math.max(0, this.waterLevel - waterDecay);
        }
        
        // Decaída de nutrientes (más lenta si no hay planta)
        const nutrientDecayRate = this.hasPlant() ? 
            this.config.nutrientDecayRate : 
            this.config.nutrientDecayRate * 0.3;
            
        if (this.nutrients > 0) {
            const nutrientDecay = (timeSinceLastUpdate / 1000) * nutrientDecayRate;
            this.nutrients = Math.max(0, this.nutrients - nutrientDecay);
        }
    }
    
    /**
     * Actualiza los efectos activos
     * @private
     */
    updateEffects(currentTime) {
        for (const [effectId, effect] of this.effects) {
            if (effect.expiresAt && currentTime > effect.expiresAt) {
                this.effects.delete(effectId);
                console.log(`✨ Plot ${this.id}: Efecto ${effectId} expirado`);
            }
        }
    }
    
    /**
     * Actualiza el estado del plot
     * @private
     */
    updatePlotState() {
        // El estado principalmente se deriva del estado de la planta
        // pero podría haber estados especiales del plot (envenenado, bendecido, etc.)
    }
    
    /**
     * Aplica efectos del suelo
     * @private
     */
    applySoilEffects() {
        if (!this.hasPlant()) return;
        
        // Aplicar multiplicador de crecimiento del suelo
        this.plant.growTime /= this.config.growthMultiplier;
        
        // Aplicar retención de agua
        this.plant.waterRequirement /= this.config.waterRetention;
    }
    
    /**
     * Aplica bonus del plot a las recompensas
     * @private
     */
    applyPlotBonuses(rewards) {
        const finalRewards = { ...rewards };
        
        // Bonus por calidad del suelo
        const soilBonus = this.soilQuality / 100;
        
        // Aplicar bonus a recursos
        if (finalRewards.resources) {
            finalRewards.resources = { ...finalRewards.resources };
            for (const [resource, amount] of Object.entries(finalRewards.resources)) {
                finalRewards.resources[resource] = Math.floor(amount * soilBonus);
            }
        }
        
        // Aplicar bonus de experiencia
        if (finalRewards.experience) {
            finalRewards.experience = Math.floor(finalRewards.experience * soilBonus);
        }
        
        // Aplicar efectos del plot
        for (const effect of this.effects.values()) {
            if (effect.qualityMultiplier) {
                if (finalRewards.resources) {
                    for (const resource of Object.keys(finalRewards.resources)) {
                        finalRewards.resources[resource] = Math.floor(
                            finalRewards.resources[resource] * effect.qualityMultiplier
                        );
                    }
                }
            }
        }
        
        return finalRewards;
    }
    
    /**
     * Agrega un efecto al plot
     * @param {string} effectId - ID del efecto
     * @param {Object} effectData - Datos del efecto
     */
    addEffect(effectId, effectData) {
        const expiresAt = effectData.duration ? 
            Date.now() + effectData.duration : 
            null;
            
        this.effects.set(effectId, {
            ...effectData,
            expiresAt
        });
        
        console.log(`✨ Plot ${this.id}: Efecto ${effectId} aplicado`);
    }
    
    /**
     * Quita un efecto del plot
     * @param {string} effectId - ID del efecto
     */
    removeEffect(effectId) {
        return this.effects.delete(effectId);
    }
    
    /**
     * Notifica cambio de estado
     * @private
     */
    notifyStateChange() {
        if (this.onStateChange) {
            this.onStateChange(this.state, this);
        }
        
        // Notificar al bus de eventos
        if (window.EventBus) {
            window.EventBus.emit('plot:state-changed', {
                plotId: this.id,
                state: this.state,
                plot: this
            });
        }
    }
    
    /**
     * Notifica cambio de planta
     * @private
     */
    notifyPlantChange() {
        if (this.onPlantChange) {
            this.onPlantChange(this.plant, this);
        }
        
        // Notificar al bus de eventos
        if (window.EventBus) {
            window.EventBus.emit('plot:plant-changed', {
                plotId: this.id,
                plant: this.plant,
                plot: this
            });
        }
    }
    
    /**
     * Verifica si el plot está vacío
     */
    isEmpty() {
        return this.state === 'empty' && !this.plant;
    }
    
    /**
     * Verifica si el plot tiene una planta
     */
    hasPlant() {
        return this.plant !== null;
    }
    
    /**
     * Verifica si se puede cosechar
     */
    canHarvest() {
        return this.hasPlant() && this.plant.isReady;
    }
    
    /**
     * Verifica si está siendo regado
     */
    isBeingWatered() {
        return this.waterLevel > 70;
    }
    
    /**
     * Obtiene información del plot
     */
    getInfo() {
        return {
            id: this.id,
            position: this.position,
            state: this.state,
            plant: this.plant ? this.plant.getInfo() : null,
            
            waterLevel: this.waterLevel,
            nutrients: this.nutrients,
            soilQuality: this.soilQuality,
            
            plantedAt: this.plantedAt,
            lastWatered: this.lastWatered,
            lastHarvested: this.lastHarvested,
            
            effects: Array.from(this.effects.keys()),
            config: this.config
        };
    }
    
    /**
     * Serializa el plot para guardar
     */
    serialize() {
        return {
            id: this.id,
            state: this.state,
            plant: this.plant ? this.plant.serialize() : null,
            
            waterLevel: this.waterLevel,
            nutrients: this.nutrients,
            soilQuality: this.soilQuality,
            
            plantedAt: this.plantedAt,
            lastWatered: this.lastWatered,
            lastHarvested: this.lastHarvested,
            
            config: this.config
        };
    }
    
    /**
     * Deserializa un plot desde datos guardados
     */
    static deserialize(data, config = {}) {
        const plot = new Plot(data.id, { ...config, ...data.config });
        
        // Restaurar estado
        plot.state = data.state || 'empty';
        plot.waterLevel = data.waterLevel || 50;
        plot.nutrients = data.nutrients || 50;
        plot.soilQuality = data.soilQuality || 100;
        
        plot.plantedAt = data.plantedAt;
        plot.lastWatered = data.lastWatered;
        plot.lastHarvested = data.lastHarvested;
        
        // Restaurar planta si existe
        if (data.plant) {
            plot.plant = Plant.deserialize(data.plant);
        }
        
        return plot;
    }
}

// Exportar para uso global
window.Plot = Plot;