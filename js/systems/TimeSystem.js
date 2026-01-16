/**
 * TimeSystem - Sistema de tiempo del juego
 * Responsabilidad: Manejar el ciclo día/noche y el flujo del tiempo del juego
 */

class TimeSystem {
    constructor() {
        // Estado del tiempo
        this.gameTime = 0; // Tiempo total del juego en ms
        this.dayNightCycle = 0; // 0-1 (0 = medianoche, 0.5 = mediodía)
        this.dayDuration = 300000; // 5 minutos por día
        this.currentDay = 1;
        
        // Configuración
        this.config = {
            enableDayNightCycle: true,
            enableSeasons: true,
            timeSpeed: 1.0 // Multiplicador de velocidad del tiempo
        };
        
        console.log('⏰ TimeSystem: Sistema de tiempo inicializado');
    }
    
    /**
     * Inicializa el sistema
     */
    init() {
        // Cargar tiempo guardado
        if (window.stateManager) {
            this.gameTime = window.stateManager.get('time.gameTime', 0);
            this.currentDay = window.stateManager.get('time.currentDay', 1);
        }
        
        console.log('✅ TimeSystem: Sistema listo');
    }
    
    /**
     * Actualiza el tiempo del juego
     * @param {number} deltaTime - Tiempo transcurrido en ms
     */
    update(deltaTime) {
        // Actualizar tiempo total del juego
        this.gameTime += deltaTime * this.config.timeSpeed;
        
        // Actualizar ciclo día/noche
        if (this.config.enableDayNightCycle) {
            this.updateDayNightCycle();
        }
        
        // Actualizar estaciones
        if (this.config.enableSeasons) {
            this.updateSeasons();
        }
        
        // Guardar tiempo
        if (window.stateManager) {
            window.stateManager.set('time.gameTime', this.gameTime);
            window.stateManager.set('time.currentDay', this.currentDay);
        }
        
        // Notificar cambios cada minuto
        const minutes = Math.floor(this.gameTime / 60000);
        if (minutes !== this.lastNotifiedMinute) {
            this.lastNotifiedMinute = minutes;
            this.notifyTimeChange();
        }
    }
    
    /**
     * Actualiza el ciclo día/noche
     * @private
     */
    updateDayNightCycle() {
        const timeOfDay = (this.gameTime % this.dayDuration) / this.dayDuration;
        this.dayNightCycle = timeOfDay;
        
        // Verificar cambio de día
        const newDay = Math.floor(this.gameTime / this.dayDuration) + 1;
        if (newDay !== this.currentDay) {
            this.currentDay = newDay;
            this.onNewDay();
        }
    }
    
    /**
     * Actualiza las estaciones
     * @private
     */
    updateSeasons() {
        // Implementar lógica de estaciones
        const seasonDuration = this.dayDuration * 10; // 10 días por estación
        const seasonIndex = Math.floor(this.gameTime / seasonDuration) % 4;
        
        const seasons = ['spring', 'summer', 'autumn', 'winter'];
        this.currentSeason = seasons[seasonIndex];
    }
    
    /**
     * Maneja el inicio de un nuevo día
     * @private
     */
    onNewDay() {
        console.log(`🌅 Nuevo día: ${this.currentDay}`);
        
        // Notificar a otros sistemas
        if (window.EventBus) {
            window.EventBus.emit('time:new-day', {
                day: this.currentDay,
                season: this.currentSeason
            });
        }
        
        // Eventos diarios
        this.triggerDailyEvents();
    }
    
    /**
     * Dispara eventos diarios
     * @private
     */
    triggerDailyEvents() {
        // Eventos aleatorios cada día
        const events = [
            { type: 'weather-change', chance: 0.3 },
            { type: 'visitor-arrival', chance: 0.1 },
            { type: 'resource-bonus', chance: 0.2 }
        ];
        
        for (const event of events) {
            if (Math.random() < event.chance) {
                if (window.EventBus) {
                    window.EventBus.emit(`daily:${event.type}`, { day: this.currentDay });
                }
            }
        }
    }
    
    /**
     * Notifica cambios de tiempo
     * @private
     */
    notifyTimeChange() {
        if (window.EventBus) {
            window.EventBus.emit('time:changed', {
                gameTime: this.gameTime,
                dayNightCycle: this.dayNightCycle,
                currentDay: this.currentDay,
                season: this.currentSeason
            });
        }
    }
    
    /**
     * Obtiene la hora actual del día (0-24)
     */
    getHourOfDay() {
        return Math.floor(this.dayNightCycle * 24);
    }
    
    /**
     * Obtiene si es de día
     */
    isDayTime() {
        const hour = this.getHourOfDay();
        return hour >= 6 && hour < 18;
    }
    
    /**
     * Obtiene si es de noche
     */
    isNightTime() {
        return !this.isDayTime();
    }
    
    /**
     * Obtiene el nombre de la estación actual
     */
    getCurrentSeason() {
        return this.currentSeason || 'spring';
    }
    
    /**
     * Obtiene información del tiempo
     */
    getTimeInfo() {
        return {
            gameTime: this.gameTime,
            dayNightCycle: this.dayNightCycle,
            currentDay: this.currentDay,
            currentSeason: this.getCurrentSeason(),
            hourOfDay: this.getHourOfDay(),
            isDayTime: this.isDayTime(),
            isNightTime: this.isNightTime()
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
        console.log('🗑️ TimeSystem: Sistema de tiempo destruido');
    }
}

// Exportar para uso global
window.TimeSystem = TimeSystem;