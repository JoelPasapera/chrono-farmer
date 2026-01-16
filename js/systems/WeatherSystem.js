/**
 * WeatherSystem - Sistema del clima
 * Responsabilidad: Manejar el clima y sus efectos en el juego
 */

class WeatherSystem {
    constructor() {
        this.currentWeather = 'clear';
        this.weatherDuration = 0;
        this.nextWeatherChange = 0;
        
        this.weatherTypes = {
            clear: { probability: 0.6, duration: [30000, 120000] },
            rainy: { probability: 0.2, duration: [20000, 60000] },
            sunny: { probability: 0.15, duration: [40000, 100000] },
            stormy: { probability: 0.05, duration: [10000, 30000] }
        };
        
        console.log('🌦️ WeatherSystem: Sistema del clima inicializado');
    }
    
    init() {
        this.changeWeather('clear');
        console.log('✅ WeatherSystem: Sistema listo');
    }
    
    update(deltaTime) {
        this.weatherDuration += deltaTime;
        
        if (Date.now() > this.nextWeatherChange) {
            this.changeWeather(this.selectNextWeather());
        }
    }
    
    selectNextWeather() {
        const rand = Math.random();
        let cumulative = 0;
        
        for (const [weather, data] of Object.entries(this.weatherTypes)) {
            cumulative += data.probability;
            if (rand <= cumulative) {
                return weather;
            }
        }
        
        return 'clear';
    }
    
    changeWeather(newWeather) {
        const oldWeather = this.currentWeather;
        this.currentWeather = newWeather;
        
        // Configurar próximo cambio
        const durationRange = this.weatherTypes[newWeather].duration;
        const duration = Math.random() * (durationRange[1] - durationRange[0]) + durationRange[0];
        this.nextWeatherChange = Date.now() + duration;
        this.weatherDuration = 0;
        
        // Notificar cambio
        if (window.EventBus) {
            window.EventBus.emit('weather:changed', {
                old: oldWeather,
                new: newWeather,
                duration: duration
            });
        }
        
        console.log(`🌦️ Clima cambiado a: ${newWeather}`);
    }
    
    getWeatherEffects(weather = this.currentWeather) {
        const effects = {
            clear: { growth: 1.0, waterRetention: 1.0 },
            rainy: { growth: 1.2, waterRetention: 1.5, autoWater: true },
            sunny: { growth: 1.3, waterRetention: 0.7 },
            stormy: { growth: 0.8, waterRetention: 1.0, damageRisk: 0.1 }
        };
        
        return effects[weather] || effects.clear;
    }
    
    destroy() {
        console.log('🗑️ WeatherSystem: Sistema del clima destruido');
    }
}

window.WeatherSystem = WeatherSystem;