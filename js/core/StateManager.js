/**
 * StateManager - Gestor de estado del juego
 * Responsabilidad: Manejar el estado global del juego de forma centralizada y predecible
 */

class StateManager {
    constructor() {
        // Estado del juego
        this.state = {
            // Estado del jugador
            player: {
                name: 'Nari',
                level: 1,
                experience: 0,
                inventory: {
                    seeds: {},
                    resources: {
                        'temporal-pulses': 100,
                        'seeds': 10
                    },
                    items: []
                },
                unlockedEras: ['prehistoric'],
                completedQuests: [],
                achievements: []
            },
            
            // Estado de la granja
            farm: {
                plots: [], // Array de 48 plots (8x6)
                animals: [],
                decorations: [],
                buildings: []
            },
            
            // Estado temporal
            time: {
                currentEra: 'prehistoric',
                previousEra: null,
                gameTime: 0, // Tiempo total jugado en ms
                lastSave: null,
                sessionStart: Date.now()
            },
            
            // Estado del mundo
            world: {
                weather: 'clear',
                season: 'spring',
                dayNightCycle: 0,
                events: [],
                activeEffects: []
            },
            
            // Estado de la UI
            ui: {
                currentScreen: 'loading',
                previousScreen: null,
                modals: [],
                selectedTool: 'plant',
                selectedSeed: null,
                notifications: []
            },
            
            // Estado de configuración
            settings: {
                musicVolume: 70,
                sfxVolume: 80,
                relaxMode: false,
                language: 'es',
                notifications: true
            }
        };
        
        // Historial de estados para debug y undo/redo
        this.history = [];
        this.historyLimit = 50;
        this.historyIndex = -1;
        
        // Listeners de cambios de estado
        this.stateListeners = new Map();
        
        // Optimización: batch de actualizaciones
        this.updateQueue = new Map();
        this.updateTimer = null;
        this.batchUpdates = true;
        this.batchDelay = 16; // ~1 frame
        
        // Validación de esquemas
        this.schemas = new Map();
        this.initializeSchemas();
        
        // Bind de métodos
        this.set = this.set.bind(this);
        this.get = this.get.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
        
        console.log('📊 StateManager: Gestor de estado inicializado');
        
        // Inicializar estado por defecto
        this.initializeDefaultState();
    }
    
    /**
     * Inicializa los esquemas de validación
     * @private
     */
    initializeSchemas() {
        // Esquema de validación para el estado
        this.schemas.set('player', {
            name: 'string',
            level: 'number',
            experience: 'number',
            inventory: 'object'
        });
        
        this.schemas.set('plot', {
            id: 'number',
            plant: ['object', 'null'],
            state: ['empty', 'planted', 'growing', 'ready', 'harvested'],
            waterLevel: 'number',
            nutrients: 'number'
        });
        
        console.log('📋 StateManager: Esquemas de validación inicializados');
    }
    
    /**
     * Inicializa el estado por defecto
     * @private
     */
    initializeDefaultState() {
        // Inicializar plots vacíos
        this.state.farm.plots = [];
        for (let i = 0; i < 48; i++) {
            this.state.farm.plots.push({
                id: i,
                plant: null,
                state: 'empty',
                waterLevel: 50,
                nutrients: 50,
                plantedAt: null,
                lastWatered: null,
                growthStage: 0,
                maxGrowthStage: 0
            });
        }
        
        // Inicializar semillas básicas
        this.state.player.inventory.seeds = {
            'prehistoric-moss': 5,
            'lotus-egyptian': 0,
            'crystal-future': 0
        };
        
        console.log('✅ StateManager: Estado por defecto inicializado');
    }
    
    /**
     * Obtiene un valor del estado usando path notation
     * @param {string} path - Path del estado (ej: 'player.inventory.seeds')
     * @param {*} defaultValue - Valor por defecto si no existe
     * @returns {*} Valor del estado
     */
    get(path, defaultValue = undefined) {
        if (typeof path !== 'string') {
            console.error('❌ StateManager: El path debe ser un string');
            return defaultValue;
        }
        
        const keys = path.split('.');
        let current = this.state;
        
        for (const key of keys) {
            if (current === null || current === undefined || typeof current !== 'object') {
                return defaultValue;
            }
            
            current = current[key];
        }
        
        return current !== undefined ? current : defaultValue;
    }
    
    /**
     * Establece un valor en el estado
     * @param {string} path - Path del estado
     * @param {*} value - Nuevo valor
     * @param {Object} options - Opciones de actualización
     */
    set(path, value, options = {}) {
        if (typeof path !== 'string') {
            console.error('❌ StateManager: El path debe ser un string');
            return;
        }
        
        const defaultOptions = {
            validate: true,
            notify: true,
            history: true,
            replace: false // Reemplazar todo el objeto en vez de merge
        };
        
        options = { ...defaultOptions, ...options };
        
        // Guardar estado anterior en historial
        if (options.history) {
            this.saveToHistory();
        }
        
        // Establecer el valor
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = this.state;
        
        // Navegar hasta el padre del objeto a modificar
        for (const key of keys) {
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        // Validar si es necesario
        if (options.validate && !this.validateValue(path, value)) {
            console.warn(`⚠️ StateManager: Validación fallida para ${path}`);
            return;
        }
        
        // Establecer valor
        const oldValue = current[lastKey];
        current[lastKey] = value;
        
        // Notificar cambios
        if (options.notify) {
            this.notifyChange(path, value, oldValue);
        }
    }
    
    /**
     * Actualiza múltiples valores en batch
     * @param {Object} updates - Objeto con paths y valores { 'path1': value1, 'path2': value2 }
     * @param {Object} options - Opciones de actualización
     */
    batchUpdate(updates, options = {}) {
        if (!this.batchUpdates) {
            // Si no hay batch, actualizar directamente
            for (const [path, value] of Object.entries(updates)) {
                this.set(path, value, options);
            }
            return;
        }
        
        // Agregar a la cola
        for (const [path, value] of Object.entries(updates)) {
            this.updateQueue.set(path, { value, options });
        }
        
        // Programar actualización batch
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
        }
        
        this.updateTimer = setTimeout(() => {
            this.processUpdateQueue();
        }, this.batchDelay);
    }
    
    /**
     * Procesa la cola de actualizaciones en batch
     * @private
     */
    processUpdateQueue() {
        if (this.updateQueue.size === 0) return;
        
        // Guardar estado anterior una sola vez
        this.saveToHistory();
        
        // Procesar todas las actualizaciones
        for (const [path, { value, options }] of this.updateQueue) {
            const currentOptions = { ...options, history: false, notify: false };
            this.set(path, value, currentOptions);
        }
        
        // Notificar cambios globales
        this.notifyGlobalChange();
        
        // Limpiar cola
        this.updateQueue.clear();
        this.updateTimer = null;
    }
    
    /**
     * Suscribe un callback a cambios en un path específico
     * @param {string} path - Path a observar (puede usar wildcards: 'player.inventory.*')
     * @param {Function} callback - Función a llamar cuando cambie
     * @param {Object} options - Opciones de suscripción
     * @returns {string} ID de la suscripción
     */
    subscribe(path, callback, options = {}) {
        if (typeof path !== 'string' || typeof callback !== 'function') {
            console.error('❌ StateManager: Path y callback son requeridos');
            return null;
        }
        
        const subscriptionId = this.generateSubscriptionId();
        
        if (!this.stateListeners.has(path)) {
            this.stateListeners.set(path, []);
        }
        
        const subscription = {
            id: subscriptionId,
            callback: callback,
            options: {
                once: options.once || false,
                immediate: options.immediate || false,
                deep: options.deep || false, // Observar cambios profundos
                filter: options.filter || null // Función filtro
            }
        };
        
        this.stateListeners.get(path).push(subscription);
        
        // Llamar inmediatamente si se solicita
        if (subscription.options.immediate) {
            const currentValue = this.get(path);
            callback(currentValue, currentValue, path);
        }
        
        return subscriptionId;
    }
    
    /**
     * Remueve una suscripción
     * @param {string} subscriptionId - ID de la suscripción
     * @returns {boolean} true si se removió exitosamente
     */
    unsubscribe(subscriptionId) {
        for (const [path, listeners] of this.stateListeners) {
            const index = listeners.findIndex(l => l.id === subscriptionId);
            if (index !== -1) {
                listeners.splice(index, 1);
                
                // Limpiar el path si no hay más listeners
                if (listeners.length === 0) {
                    this.stateListeners.delete(path);
                }
                
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Notifica cambios a los listeners
     * @private
     */
    notifyChange(path, newValue, oldValue) {
        // Notificar listeners específicos del path
        const specificListeners = this.stateListeners.get(path);
        if (specificListeners) {
            this.notifyListeners(specificListeners, newValue, oldValue, path);
        }
        
        // Notificar listeners con wildcards
        for (const [listenerPath, listeners] of this.stateListeners) {
            if (listenerPath.includes('*') && this.pathMatches(path, listenerPath)) {
                this.notifyListeners(listeners, newValue, oldValue, path);
            }
        }
    }
    
    /**
     * Notifica cambios globales después de batch update
     * @private
     */
    notifyGlobalChange() {
        const globalListeners = this.stateListeners.get('*');
        if (globalListeners) {
            this.notifyListeners(globalListeners, this.state, this.state, '*');
        }
    }
    
    /**
     * Notifica a una lista de listeners
     * @private
     */
    notifyListeners(listeners, newValue, oldValue, path) {
        const listenersToRemove = [];
        
        for (const subscription of listeners) {
            // Aplicar filtro si existe
            if (subscription.options.filter && !subscription.options.filter(newValue, oldValue, path)) {
                continue;
            }
            
            try {
                subscription.callback(newValue, oldValue, path);
                
                if (subscription.options.once) {
                    listenersToRemove.push(subscription.id);
                }
            } catch (error) {
                console.error(`❌ StateManager: Error en listener para ${path}:`, error);
            }
        }
        
        // Remover listeners "once"
        for (const id of listenersToRemove) {
            this.unsubscribe(id);
        }
    }
    
    /**
     * Verifica si un path coincide con un patrón con wildcard
     * @private
     */
    pathMatches(path, pattern) {
        const regex = pattern
            .replace(/\*/g, '([^.]*)')
            .replace(/\?/g, '([^])');
        return new RegExp(`^${regex}$`).test(path);
    }
    
    /**
     * Valida un valor contra el esquema
     * @private
     */
    validateValue(path, value) {
        // Por simplicidad, solo validamos algunos casos básicos
        // En una implementación real, usaríamos un validador como Joi o Yup
        return true;
    }
    
    /**
     * Guarda el estado actual en el historial
     * @private
     */
    saveToHistory() {
        const stateCopy = this.deepClone(this.state);
        
        // Si no estamos al final del historial, truncar
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push(stateCopy);
        this.historyIndex++;
        
        // Limitar tamaño del historial
        if (this.history.length > this.historyLimit) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    /**
     * Revierte al estado anterior (undo)
     * @returns {boolean} true si se pudo deshacer
     */
    undo() {
        if (this.historyIndex <= 0) {
            console.warn('⚠️ StateManager: No hay estados anteriores');
            return false;
        }
        
        this.historyIndex--;
        this.state = this.deepClone(this.history[this.historyIndex]);
        
        // Notificar cambio global
        this.notifyGlobalChange();
        
        console.log('↶ StateManager: Estado restaurado (undo)');
        return true;
    }
    
    /**
     * Rehace un cambio deshecho
     * @returns {boolean} true si se pudo rehacer
     */
    redo() {
        if (this.historyIndex >= this.history.length - 1) {
            console.warn('⚠️ StateManager: No hay estados posteriores');
            return false;
        }
        
        this.historyIndex++;
        this.state = this.deepClone(this.history[this.historyIndex]);
        
        // Notificar cambio global
        this.notifyGlobalChange();
        
        console.log('↷ StateManager: Estado reestablecido (redo)');
        return true;
    }
    
    /**
     * Crea un clon profundo de un objeto
     * @private
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }
    
    /**
     * Genera un ID único para suscripciones
     * @private
     */
    generateSubscriptionId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Obtiene el estado completo
     * @returns {Object} Estado completo del juego
     */
    getState() {
        return this.deepClone(this.state);
    }
    
    /**
     * Restaura el estado completo
     * @param {Object} newState - Nuevo estado completo
     * @param {Object} options - Opciones de restauración
     */
    setState(newState, options = {}) {
        if (typeof newState !== 'object') {
            console.error('❌ StateManager: El estado debe ser un objeto');
            return;
        }
        
        // Guardar en historial
        if (options.history !== false) {
            this.saveToHistory();
        }
        
        this.state = this.deepClone(newState);
        
        // Notificar cambio global
        if (options.notify !== false) {
            this.notifyGlobalChange();
        }
    }
    
    /**
     * Resetea el estado al inicial
     */
    reset() {
        this.history = [];
        this.historyIndex = -1;
        this.initializeDefaultState();
        this.notifyGlobalChange();
        console.log('🔄 StateManager: Estado reseteado');
    }
    
    /**
     * Obtiene estadísticas del gestor de estado
     * @returns {Object} Estadísticas
     */
    getStats() {
        return {
            historySize: this.history.length,
            historyIndex: this.historyIndex,
            listenerCount: this.stateListeners.size,
            updateQueueSize: this.updateQueue.size,
            stateSize: JSON.stringify(this.state).length
        };
    }
}

// Exportar para uso global
window.StateManager = StateManager;