/**
 * Era - Componente de era temporal
 * Representa una era histórica o futura en el juego
 */

class Era {
    constructor(data) {
        // Identificación
        this.id = data.id || 'unknown';
        this.name = data.name || 'Era Desconocida';
        this.description = data.description || '';
        this.longDescription = data.longDescription || '';
        this.emoji = data.emoji || '❓';
        
        // Visuales
        this.background = data.background || 'linear-gradient(135deg, #333, #666)';
        this.primaryColor = data.primaryColor || '#ffffff';
        this.secondaryColor = data.secondaryColor || '#cccccc';
        this.cssFilter = data.cssFilter || '';
        
        // Audio
        this.musicTrack = data.musicTrack || 'default-music';
        this.ambientSound = data.ambientSound || 'default-ambient';
        
        // Recursos
        this.resources = data.resources || {
            primary: 'temporal-pulses',
            secondary: 'experience',
            bonus: 'luck'
        };
        
        // Efectos de era
        this.effects = data.effects || {
            growthMultiplier: 1.0,
            waterRetention: 1.0,
            temporalResonance: 1.0
        };
        
        // Minijuego
        this.minigame = data.minigame || null;
        
        // NPCs
        this.npcs = data.npcs || [];
        
        // Desbloqueo
        this.unlocked = data.unlocked || false;
        this.unlockRequirement = data.unlockRequirement || null;
        
        // Plantas disponibles
        this.availablePlants = data.availablePlants || [];
        
        // Animales disponibles
        this.animals = data.animals || [];
        
        console.log(`🌍 Era: ${this.name} creada`);
    }
    
    /**
     * Verifica si la era está desbloqueada
     */
    isUnlocked() {
        if (this.unlocked) return true;
        
        if (!this.unlockRequirement || !window.stateManager) {
            return false;
        }
        
        const req = this.unlockRequirement;
        
        switch (req.type) {
            case 'harvest':
                const harvestCount = this.getHarvestCount(req.plantType);
                return harvestCount >= req.count;
                
            case 'minigame':
                const minigameStats = window.stateManager.get('player.minigameStats', {});
                return minigameStats[req.minigame]?.completed >= (req.count || 1);
                
            case 'resource':
                const resourceAmount = window.stateManager.get(`player.inventory.resources.${req.resource}`, 0);
                return resourceAmount >= req.amount;
                
            case 'achievement':
                const achievements = window.stateManager.get('player.achievements', []);
                return achievements.includes(req.achievement);
                
            default:
                return false;
        }
    }
    
    /**
     * Obtiene el conteo de cosechas de un tipo de planta
     * @private
     */
    getHarvestCount(plantType) {
        const harvestStats = window.stateManager.get('player.harvestStats', {});
        return harvestStats[plantType] || 0;
    }
    
    /**
     * Desbloquea la era
     */
    unlock() {
        this.unlocked = true;
        
        // Notificar desbloqueo
        if (window.EventBus) {
            window.EventBus.emit('era:unlocked', {
                era: this,
                timestamp: Date.now()
            });
        }
        
        console.log(`🌍 Era desbloqueada: ${this.name}`);
    }
    
    /**
     * Aplica efectos de la era a una planta
     */
    applyEffects(plant) {
        // Aplicar multiplicador de crecimiento
        if (this.effects.growthMultiplier && plant.growTime) {
            plant.growTime /= this.effects.growthMultiplier;
        }
        
        // Aplicar retención de agua
        if (this.effects.waterRetention && plant.waterRequirement) {
            plant.waterRequirement /= this.effects.waterRetention;
        }
        
        // Aplicar resonancia temporal (generación de pulsos)
        if (this.effects.temporalResonance && plant.harvestYield) {
            const temporalPulses = plant.harvestYield.resources['temporal-pulses'] || 0;
            plant.harvestYield.resources['temporal-pulses'] = Math.floor(
                temporalPulses * this.effects.temporalResonance
            );
        }
        
        // Efectos específicos de era
        this.applyEraSpecificEffects(plant);
    }
    
    /**
     * Aplica efectos específicos de la era
     * @private
     */
    applyEraSpecificEffects(plant) {
        switch (this.id) {
            case 'prehistoric':
                // Bonus a plantas prehistóricas
                if (plant.era === 'prehistoric') {
                    plant.harvestYield.resources['fossils'] = 
                        (plant.harvestYield.resources['fossils'] || 0) + 1;
                }
                break;
                
            case 'egyptian':
                // Bonus con luz solar
                if (window.timeSystem && window.timeSystem.isDayTime()) {
                    plant.growTime *= 0.9; // 10% más rápido
                }
                break;
                
            case 'future':
                // Efectos de tecnología
                if (plant.effects) {
                    for (const effect in plant.effects) {
                        plant.effects[effect] *= 1.1; // 10% más efectivo
                    }
                }
                break;
        }
    }
    
    /**
     * Obtiene información de la era
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            longDescription: this.longDescription,
            emoji: this.emoji,
            
            unlocked: this.unlocked,
            unlockRequirement: this.unlockRequirement,
            
            resources: this.resources,
            effects: this.effects,
            
            availablePlants: this.availablePlants,
            animals: this.animals,
            npcs: this.npcs,
            minigame: this.minigame,
            
            theme: {
                background: this.background,
                primaryColor: this.primaryColor,
                secondaryColor: this.secondaryColor,
                cssFilter: this.cssFilter
            },
            
            audio: {
                musicTrack: this.musicTrack,
                ambientSound: this.ambientSound
            }
        };
    }
    
    /**
     * Serializa la era para guardar
     */
    serialize() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            longDescription: this.longDescription,
            emoji: this.emoji,
            
            background: this.background,
            primaryColor: this.primaryColor,
            secondaryColor: this.secondaryColor,
            cssFilter: this.cssFilter,
            
            musicTrack: this.musicTrack,
            ambientSound: this.ambientSound,
            
            resources: this.resources,
            effects: this.effects,
            
            minigame: this.minigame,
            npcs: this.npcs,
            
            unlocked: this.unlocked,
            unlockRequirement: this.unlockRequirement,
            
            availablePlants: this.availablePlants,
            animals: this.animals
        };
    }
    
    /**
     * Deserializa una era desde datos guardados
     */
    static deserialize(data) {
        return new Era(data);
    }
}

window.Era = Era;