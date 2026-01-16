/**
 * Plant - Componente de planta
 * Representa una planta individual en el juego
 */

class Plant {
    constructor(data) {
        // Propiedades básicas
        this.id = data.id || this.generateId();
        this.type = data.type || 'unknown';
        this.name = data.name || 'Planta Desconocida';
        this.description = data.description || '';
        this.emoji = data.emoji || '🌱';
        this.era = data.era || 'prehistoric';
        
        // Estado de crecimiento
        this.growthStage = data.growthStage || 0;
        this.maxStages = data.maxStages || 3;
        this.plantedAt = data.plantedAt || Date.now();
        this.lastWatered = data.lastWatered || Date.now();
        
        // Recursos
        this.waterLevel = data.waterLevel || 100;
        this.nutrients = data.nutrients || 80;
        
        // Configuración de crecimiento
        this.growTime = data.growTime || 30000; // 30 segundos por defecto
        this.waterRequirement = data.waterRequirement || 0.6;
        this.nutrientRequirement = data.nutrientRequirement || 0.4;
        
        // Efectos especiales
        this.effects = data.effects || {};
        
        // Recompensas
        this.harvestYield = data.harvestYield || {
            seeds: 1,
            resources: {},
            experience: 10
        };
        
        // Visual
        this.appearance = data.appearance || {};
        
        // Sonidos
        this.sounds = data.sounds || {};
        
        // Estado interno
        this.isGrowing = false;
        this.isReady = false;
        this.isWatered = false;
        
        console.log(`🌱 Plant: ${this.name} creada`);
    }
    
    /**
     * Genera un ID único para la planta
     * @private
     */
    generateId() {
        return `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Actualiza el estado de la planta
     * @param {number} currentTime - Tiempo actual en ms
     */
    update(currentTime = Date.now()) {
        this.updateGrowth(currentTime);
        this.updateResources(currentTime);
        this.updateStatus();
    }
    
    /**
     * Actualiza el crecimiento de la planta
     * @param {number} currentTime - Tiempo actual
     */
    updateGrowth(currentTime) {
        const timeSincePlanted = currentTime - this.plantedAt;
        const growthProgress = Math.min(1, timeSincePlanted / this.growTime);
        
        // Calcular etapa actual basada en el progreso
        const newStage = Math.floor(growthProgress * this.maxStages);
        
        if (newStage > this.growthStage) {
            this.growthStage = newStage;
            this.onGrowthStageChanged();
        }
        
        // Verificar si está lista para cosecha
        this.isReady = growthProgress >= 1;
    }
    
    /**
     * Actualiza los recursos (agua y nutrientes)
     * @param {number} currentTime - Tiempo actual
     */
    updateResources(currentTime) {
        const timeSinceWatered = currentTime - this.lastWatered;
        
        // Decaída de agua (1% por segundo)
        const waterDecay = (timeSinceWatered / 1000) * 1;
        this.waterLevel = Math.max(0, this.waterLevel - waterDecay);
        
        // Decaída de nutrientes (0.5% por segundo)
        const timeSincePlanted = currentTime - this.plantedAt;
        const nutrientDecay = (timeSincePlanted / 1000) * 0.5;
        this.nutrients = Math.max(0, this.nutrients - nutrientDecay);
        
        // Actualizar estado de regado
        this.isWatered = this.waterLevel >= 50;
    }
    
    /**
     * Actualiza el estado general de la planta
     */
    updateStatus() {
        // Verificar si tiene suficientes recursos para crecer
        const hasEnoughWater = this.waterLevel >= (this.waterRequirement * 100);
        const hasEnoughNutrients = this.nutrients >= (this.nutrientRequirement * 100);
        
        this.isGrowing = hasEnoughWater && hasEnoughNutrients && !this.isReady;
        
        // Aplicar efectos de estado
        if (!hasEnoughWater) {
            this.applyStressEffect('dehydrated');
        }
        
        if (!hasEnoughNutrients) {
            this.applyStressEffect('malnourished');
        }
    }
    
    /**
     * Regar la planta
     * @param {number} amount - Cantidad de agua a agregar
     */
    water(amount = 30) {
        this.waterLevel = Math.min(100, this.waterLevel + amount);
        this.lastWatered = Date.now();
        this.isWatered = true;
        
        // Quitar efecto de estrés por deshidratación
        this.removeStressEffect('dehydrated');
        
        return this.waterLevel;
    }
    
    /**
     * Aplicar fertilizante
     * @param {number} amount - Cantidad de nutrientes a agregar
     */
    fertilize(amount = 20) {
        this.nutrients = Math.min(100, this.nutrients + amount);
        
        // Quitar efecto de estrés por desnutrición
        this.removeStressEffect('malnourished');
        
        return this.nutrients;
    }
    
    /**
     * Acelera el crecimiento
     * @param {number} timeReduction - Tiempo a reducir en ms
     */
    accelerate(timeReduction) {
        this.plantedAt = Math.max(this.plantedAt - timeReduction, 0);
        
        // Efecto visual/sónico
        this.onAccelerated();
        
        return this.getGrowthProgress();
    }
    
    /**
     * Obtiene el progreso de crecimiento (0-1)
     */
    getGrowthProgress() {
        const timeSincePlanted = Date.now() - this.plantedAt;
        return Math.min(1, timeSincePlanted / this.growTime);
    }
    
    /**
     * Obtiene el tiempo restante para cosecha en ms
     */
    getTimeToHarvest() {
        if (this.isReady) return 0;
        
        const timeSincePlanted = Date.now() - this.plantedAt;
        return Math.max(0, this.growTime - timeSincePlanted);
    }
    
    /**
     * Obtiene el multiplicador de crecimiento actual
     */
    getGrowthMultiplier() {
        let multiplier = 1.0;
        
        // Efectos de recursos
        const waterFactor = this.waterLevel / 100;
        const nutrientFactor = this.nutrients / 100;
        const resourceFactor = Math.min(waterFactor, nutrientFactor);
        
        // Penalización por recursos insuficientes
        if (resourceFactor < 0.5) {
            multiplier *= resourceFactor * 2;
        }
        
        // Efectos especiales de la planta
        for (const [effectName, effectValue] of Object.entries(this.effects)) {
            if (this.isEffectActive(effectName)) {
                multiplier *= effectValue;
            }
        }
        
        return multiplier;
    }
    
    /**
     * Verifica si un efecto está activo
     * @private
     */
    isEffectActive(effectName) {
        switch (effectName) {
            case 'sunBlessing':
                // Activo durante el día (simulado)
                return this.isDayTime();
            case 'waterBlessing':
                // Activo cuando está bien regada
                return this.waterLevel >= 80;
            case 'temporalResonance':
                // Siempre activo
                return true;
            default:
                return false;
        }
    }
    
    /**
     * Simula si es de día (para efectos diurnos)
     * @private
     */
    isDayTime() {
        const hour = new Date().getHours();
        return hour >= 6 && hour < 18;
    }
    
    /**
     * Aplica efecto de estrés
     * @private
     */
    applyStressEffect(effectType) {
        // Implementar efectos de estrés específicos
        switch (effectType) {
            case 'dehydrated':
                // Reduce el crecimiento
                break;
            case 'malnourished':
                // Reduce la calidad de la cosecha
                break;
        }
    }
    
    /**
     * Quita efecto de estrés
     * @private
     */
    removeStressEffect(effectType) {
        // Implementar remoción de efectos de estrés
    }
    
    /**
     * Maneja el cambio de etapa de crecimiento
     * @private
     */
    onGrowthStageChanged() {
        // Notificar al sistema de eventos
        if (window.EventBus) {
            window.EventBus.emit('plant:stage-changed', {
                plant: this,
                newStage: this.growthStage,
                timestamp: Date.now()
            });
        }
        
        // Reproducir sonido de crecimiento si está disponible
        if (window.AudioManager && this.sounds.growth) {
            window.AudioManager.play(this.sounds.growth, { volume: 0.5 });
        }
    }
    
    /**
     * Maneja la aceleración del crecimiento
     * @private
     */
    onAccelerated() {
        // Efecto visual
        if (window.EventBus) {
            window.EventBus.emit('plant:accelerated', {
                plant: this,
                timestamp: Date.now()
            });
        }
        
        // Sonido de aceleración
        if (window.AudioManager) {
            window.AudioManager.play('temporal-pulse', { volume: 0.6 });
        }
    }
    
    /**
     * Obtiene la apariencia actual de la planta
     */
    getCurrentAppearance() {
        const stageKey = `stage${this.growthStage}`;
        return this.appearance[stageKey] || {
            emoji: this.emoji,
            size: 1.0,
            glow: false
        };
    }
    
    /**
     * Calcula las recompensas de cosecha
     */
    calculateHarvestRewards() {
        const baseRewards = { ...this.harvestYield };
        
        // Aplicar bonus por estado de la planta
        const healthFactor = Math.min(this.waterLevel, this.nutrients) / 100;
        
        if (healthFactor > 0.8) {
            // Planta saludable: bonus del 25%
            baseRewards.resources = { ...baseRewards.resources };
            for (const [resource, amount] of Object.entries(baseRewards.resources)) {
                baseRewards.resources[resource] = Math.floor(amount * 1.25);
            }
            baseRewards.experience = Math.floor(baseRewards.experience * 1.25);
        } else if (healthFactor < 0.3) {
            // Planta enferma: penalización del 50%
            baseRewards.resources = { ...baseRewards.resources };
            for (const [resource, amount] of Object.entries(baseRewards.resources)) {
                baseRewards.resources[resource] = Math.floor(amount * 0.5);
            }
            baseRewards.experience = Math.floor(baseRewards.experience * 0.5);
        }
        
        return baseRewards;
    }
    
    /**
     * Serializa la planta para guardar
     */
    serialize() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            description: this.description,
            emoji: this.emoji,
            era: this.era,
            
            growthStage: this.growthStage,
            maxStages: this.maxStages,
            plantedAt: this.plantedAt,
            lastWatered: this.lastWatered,
            
            waterLevel: this.waterLevel,
            nutrients: this.nutrients,
            
            growTime: this.growTime,
            waterRequirement: this.waterRequirement,
            nutrientRequirement: this.nutrientRequirement,
            
            effects: this.effects,
            harvestYield: this.harvestYield,
            appearance: this.appearance,
            sounds: this.sounds
        };
    }
    
    /**
     * Deserializa una planta desde datos guardados
     */
    static deserialize(data) {
        return new Plant(data);
    }
    
    /**
     * Obtiene información de la planta
     */
    getInfo() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            description: this.description,
            era: this.era,
            
            growthStage: this.growthStage,
            maxStages: this.maxStages,
            growthProgress: this.getGrowthProgress(),
            timeToHarvest: this.getTimeToHarvest(),
            isReady: this.isReady,
            isGrowing: this.isGrowing,
            
            waterLevel: this.waterLevel,
            nutrients: this.nutrients,
            isWatered: this.isWatered,
            
            effects: this.effects,
            harvestYield: this.harvestYield,
            currentAppearance: this.getCurrentAppearance()
        };
    }
}

// Exportar para uso global
window.Plant = Plant;