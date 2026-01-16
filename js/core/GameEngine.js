/**
 * GameEngine - Núcleo central del juego
 * Responsabilidad: Coordinar todos los sistemas y mantener el loop principal del juego
 */

class GameEngine {
    constructor() {
        // Estado del juego
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.totalTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
        
        // Referencias a sistemas
        this.systems = new Map();
        this.eventBus = null;
        this.stateManager = null;
        this.renderer = null;
        this.audioManager = null;
        this.saveSystem = null;
        
        // Configuración
        this.config = {
            targetFPS: 60,
            debugMode: false,
            showFPS: false,
            enableSound: true
        };
        
        // Bind de métodos
        this.gameLoop = this.gameLoop.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
        
        // Inicialización
        this.init();
    }
    
    /**
     * Inicializa el motor del juego
     */
    init() {
        console.log('🎮 GameEngine: Inicializando...');
        
        // Configurar eventos del navegador
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        window.addEventListener('beforeunload', this.handleBeforeUnload);
        
        // Mensaje de bienvenida
        this.logSystemInfo();
        
        console.log('✅ GameEngine: Inicializado correctamente');
    }
    
    /**
     * Registra un sistema en el motor
     * @param {string} name - Nombre del sistema
     * @param {Object} system - Instancia del sistema
     */
    registerSystem(name, system) {
        if (this.systems.has(name)) {
            console.warn(`⚠️ GameEngine: Sistema '${name}' ya está registrado, sobrescribiendo...`);
        }
        
        this.systems.set(name, system);
        system.gameEngine = this;
        
        // Si el sistema tiene método init, lo llamamos
        if (typeof system.init === 'function') {
            system.init();
        }
        
        console.log(`✅ GameEngine: Sistema '${name}' registrado`);
    }
    
    /**
     * Obtiene un sistema registrado
     * @param {string} name - Nombre del sistema
     * @returns {Object|null} Sistema solicitado o null
     */
    getSystem(name) {
        return this.systems.get(name) || null;
    }
    
    /**
     * Inicia el loop principal del juego
     */
    start() {
        if (this.isRunning) {
            console.warn('⚠️ GameEngine: El juego ya está en ejecución');
            return;
        }
        
        console.log('🚀 GameEngine: Iniciando loop principal...');
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * Pausa el juego
     */
    pause() {
        if (!this.isRunning || this.isPaused) return;
        
        this.isPaused = true;
        this.eventBus?.emit('game:paused');
        console.log('⏸️ GameEngine: Juego pausado');
    }
    
    /**
     * Reanuda el juego
     */
    resume() {
        if (!this.isRunning || !this.isPaused) return;
        
        this.isPaused = false;
        this.lastTime = performance.now(); // Reset del tiempo para evitar saltos
        this.eventBus?.emit('game:resumed');
        console.log('▶️ GameEngine: Juego reanudado');
    }
    
    /**
     * Detiene completamente el juego
     */
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.isPaused = false;
        this.eventBus?.emit('game:stopped');
        console.log('⏹️ GameEngine: Juego detenido');
    }
    
    /**
     * Loop principal del juego
     * @param {number} currentTime - Tiempo actual del frame
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        // Calcular delta time
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.totalTime += this.deltaTime;
        
        // Calcular FPS
        this.frameCount++;
        this.fpsTimer += this.deltaTime;
        if (this.fpsTimer >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / this.fpsTimer);
            this.frameCount = 0;
            this.fpsTimer = 0;
            
            if (this.config.showFPS) {
                this.updateFPSDisplay();
            }
        }
        
        // Si el juego está pausado, solo renderizamos
        if (!this.isPaused) {
            this.update(this.deltaTime);
        }
        
        this.render(this.deltaTime);
        
        // Continuar el loop
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * Actualiza todos los sistemas
     * @param {number} deltaTime - Tiempo transcurrido en milisegundos
     */
    update(deltaTime) {
        // Actualizar cada sistema
        for (const [name, system] of this.systems) {
            if (typeof system.update === 'function') {
                try {
                    system.update(deltaTime);
                } catch (error) {
                    console.error(`❌ Error en sistema '${name}':`, error);
                }
            }
        }
    }
    
    /**
     * Renderiza todos los sistemas
     * @param {number} deltaTime - Tiempo transcurrido en milisegundos
     */
    render(deltaTime) {
        // Renderizar cada sistema
        for (const [name, system] of this.systems) {
            if (typeof system.render === 'function') {
                try {
                    system.render(deltaTime);
                } catch (error) {
                    console.error(`❌ Error renderizando sistema '${name}':`, error);
                }
            }
        }
    }
    
    /**
     * Maneja el cambio de visibilidad de la página
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.pause();
        } else {
            this.resume();
        }
    }
    
    /**
     * Maneja el evento beforeunload
     * @param {Event} event - Evento beforeunload
     */
    handleBeforeUnload(event) {
        if (this.saveSystem) {
            this.saveSystem.save();
        }
        
        // Mostrar advertencia si hay datos sin guardar
        const message = '¿Estás seguro de que quieres salir? Se perderá el progreso no guardado.';
        event.returnValue = message;
        return message;
    }
    
    /**
     * Actualiza el display de FPS
     */
    updateFPSDisplay() {
        let fpsElement = document.getElementById('fps-display');
        if (!fpsElement) {
            fpsElement = document.createElement('div');
            fpsElement.id = 'fps-display';
            fpsElement.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: #fff;
                padding: 5px 10px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 12px;
                z-index: 9999;
            `;
            document.body.appendChild(fpsElement);
        }
        
        fpsElement.textContent = `FPS: ${this.fps}`;
    }
    
    /**
     * Muestra información del sistema
     */
    logSystemInfo() {
        console.log(`
🌾 CHRONO FARMER - El Jardín de los Tiempos 🌾
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Versión: 1.0.0
🎮 Motor: GameEngine v1.0
🌐 Navegador: ${navigator.userAgent.split(' ').slice(-1)[0]}
💻 Plataforma: ${navigator.platform}
📊 Resolución: ${window.innerWidth}x${window.innerHeight}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    }
    
    /**
     * Obtiene estadísticas del juego
     * @returns {Object} Estadísticas actuales
     */
    getStats() {
        return {
            fps: this.fps,
            deltaTime: this.deltaTime,
            totalTime: this.totalTime,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            systemCount: this.systems.size,
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
                total: Math.round(performance.memory.totalJSHeapSize / 1048576) // MB
            } : null
        };
    }
    
    /**
     * Limpia recursos y destruye el motor
     */
    destroy() {
        console.log('🗑️ GameEngine: Destruyendo...');
        
        this.stop();
        
        // Limpiar eventos
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        
        // Destruir sistemas
        for (const [name, system] of this.systems) {
            if (typeof system.destroy === 'function') {
                system.destroy();
            }
        }
        
        this.systems.clear();
        
        // Limpiar FPS display
        const fpsElement = document.getElementById('fps-display');
        if (fpsElement) {
            fpsElement.remove();
        }
        
        console.log('✅ GameEngine: Destruido correctamente');
    }
}

// Exportar para uso global
window.GameEngine = GameEngine;