/**
 * EventBus - Sistema de eventos para comunicación entre componentes
 * Responsabilidad: Facilitar la comunicación desacoplada entre sistemas mediante eventos
 */

class EventBus {
    constructor() {
        // Mapa de eventos y sus listeners
        this.events = new Map();
        
        // Contador de IDs para listeners
        this.listenerIdCounter = 0;
        
        // Mapa de IDs a información de listeners (para remove)
        this.listenerMap = new Map();
        
        // Estadísticas de eventos
        this.stats = {
            eventsEmitted: 0,
            eventsHandled: 0,
            maxListenersPerEvent: 0,
            activeListeners: 0
        };
        
        // Configuración
        this.config = {
            maxListeners: 100, // Límite de listeners por evento
            enableWarnings: true, // Mostrar advertencias
            enableStats: false // Habilitar estadísticas
        };
        
        // Bind de métodos
        this.emit = this.emit.bind(this);
        this.on = this.on.bind(this);
        this.once = this.once.bind(this);
        this.off = this.off.bind(this);
        this.removeAllListeners = this.removeAllListeners.bind(this);
        
        console.log('📢 EventBus: Sistema de eventos inicializado');
    }
    
    /**
     * Emite un evento
     * @param {string} event - Nombre del evento
     * @param {...any} args - Argumentos del evento
     * @returns {boolean} true si el evento fue manejado por al menos un listener
     */
    emit(event, ...args) {
        if (typeof event !== 'string') {
            console.error('❌ EventBus: El nombre del evento debe ser un string');
            return false;
        }
        
        const listeners = this.events.get(event);
        if (!listeners || listeners.length === 0) {
            if (this.config.enableWarnings && !this.isInternalEvent(event)) {
                console.warn(`⚠️ EventBus: No hay listeners para el evento '${event}'`);
            }
            return false;
        }
        
        if (this.config.enableStats) {
            this.stats.eventsEmitted++;
        }
        
        // Crear copia de listeners para evitar problemas si se modifican durante la emisión
        const listenersCopy = [...listeners];
        let handled = false;
        
        for (const listener of listenersCopy) {
            if (listener.once) {
                this.removeListener(event, listener.id);
            }
            
            try {
                listener.callback.apply(listener.context || null, args);
                handled = true;
                
                if (this.config.enableStats) {
                    this.stats.eventsHandled++;
                }
            } catch (error) {
                console.error(`❌ EventBus: Error en listener del evento '${event}':`, error);
                
                // Si el listener tiene error handler, lo llamamos
                if (listener.onError) {
                    listener.onError(error);
                }
            }
        }
        
        return handled;
    }
    
    /**
     * Agrega un listener para un evento
     * @param {string} event - Nombre del evento
     * @param {Function} callback - Función callback
     * @param {Object} options - Opciones adicionales
     * @returns {string} ID del listener para poder removerlo
     */
    on(event, callback, options = {}) {
        if (typeof event !== 'string') {
            throw new Error('EventBus: El nombre del evento debe ser un string');
        }
        
        if (typeof callback !== 'function') {
            throw new Error('EventBus: El callback debe ser una función');
        }
        
        // Verificar límite de listeners
        const listeners = this.events.get(event) || [];
        if (listeners.length >= this.config.maxListeners) {
            console.warn(`⚠️ EventBus: Límite de listeners alcanzado para el evento '${event}'`);
        }
        
        const listenerId = this.generateListenerId();
        const listener = {
            id: listenerId,
            callback: callback,
            context: options.context || null,
            once: false,
            priority: options.priority || 0,
            onError: options.onError || null,
            metadata: options.metadata || {}
        };
        
        listeners.push(listener);
        
        // Ordenar por prioridad (mayor prioridad primero)
        listeners.sort((a, b) => b.priority - a.priority);
        
        this.events.set(event, listeners);
        this.listenerMap.set(listenerId, { event, listener });
        
        if (this.config.enableStats) {
            this.stats.activeListeners++;
            this.stats.maxListenersPerEvent = Math.max(
                this.stats.maxListenersPerEvent,
                listeners.length
            );
        }
        
        return listenerId;
    }
    
    /**
     * Agrega un listener que se ejecuta solo una vez
     * @param {string} event - Nombre del evento
     * @param {Function} callback - Función callback
     * @param {Object} options - Opciones adicionales
     * @returns {string} ID del listener
     */
    once(event, callback, options = {}) {
        const listenerId = this.on(event, callback, { ...options, once: true });
        return listenerId;
    }
    
    /**
     * Remueve un listener específico
     * @param {string} event - Nombre del evento
     * @param {string} listenerId - ID del listener a remover
     * @returns {boolean} true si se removió exitosamente
     */
    off(event, listenerId) {
        if (typeof event !== 'string') {
            console.error('❌ EventBus: El nombre del evento debe ser un string');
            return false;
        }
        
        return this.removeListener(event, listenerId);
    }
    
    /**
     * Remueve todos los listeners de un evento
     * @param {string} event - Nombre del evento
     * @returns {boolean} true si se removieron listeners
     */
    removeAllListeners(event) {
        if (typeof event !== 'string') {
            console.error('❌ EventBus: El nombre del evento debe ser un string');
            return false;
        }
        
        const listeners = this.events.get(event);
        if (!listeners) return false;
        
        // Remover del listenerMap
        for (const listener of listeners) {
            this.listenerMap.delete(listener.id);
            if (this.config.enableStats) {
                this.stats.activeListeners--;
            }
        }
        
        this.events.delete(event);
        return true;
    }
    
    /**
     * Obtiene el número de listeners para un evento
     * @param {string} event - Nombre del evento
     * @returns {number} Número de listeners
     */
    listenerCount(event) {
        const listeners = this.events.get(event);
        return listeners ? listeners.length : 0;
    }
    
    /**
     * Obtiene los nombres de todos los eventos con listeners
     * @returns {string[]} Array de nombres de eventos
     */
    eventNames() {
        return Array.from(this.events.keys());
    }
    
    /**
     * Verifica si un evento tiene listeners
     * @param {string} event - Nombre del evento
     * @returns {boolean} true si tiene listeners
     */
    hasListeners(event) {
        return this.listenerCount(event) > 0;
    }
    
    /**
     * Remueve un listener interno
     * @private
     */
    removeListener(event, listenerId) {
        const listeners = this.events.get(event);
        if (!listeners) return false;
        
        const listenerInfo = this.listenerMap.get(listenerId);
        if (!listenerInfo || listenerInfo.event !== event) return false;
        
        const index = listeners.findIndex(l => l.id === listenerId);
        if (index === -1) return false;
        
        listeners.splice(index, 1);
        this.listenerMap.delete(listenerId);
        
        if (listeners.length === 0) {
            this.events.delete(event);
        }
        
        if (this.config.enableStats) {
            this.stats.activeListeners--;
        }
        
        return true;
    }
    
    /**
     * Genera un ID único para un listener
     * @private
     */
    generateListenerId() {
        return `listener_${++this.listenerIdCounter}_${Date.now()}`;
    }
    
    /**
     * Verifica si un evento es interno del sistema
     * @private
     */
    isInternalEvent(event) {
        return event.startsWith('internal:');
    }
    
    /**
     * Emite un evento de forma asíncrona
     * @param {string} event - Nombre del evento
     * @param {...any} args - Argumentos del evento
     * @returns {Promise<boolean>} Promise que resuelve cuando todos los listeners han sido ejecutados
     */
    async emitAsync(event, ...args) {
        if (typeof event !== 'string') {
            console.error('❌ EventBus: El nombre del evento debe ser un string');
            return false;
        }
        
        const listeners = this.events.get(event);
        if (!listeners || listeners.length === 0) {
            return false;
        }
        
        if (this.config.enableStats) {
            this.stats.eventsEmitted++;
        }
        
        const listenersCopy = [...listeners];
        let handled = false;
        
        for (const listener of listenersCopy) {
            if (listener.once) {
                this.removeListener(event, listener.id);
            }
            
            try {
                const result = listener.callback.apply(listener.context || null, args);
                
                // Si el callback retorna una promise, esperamos
                if (result instanceof Promise) {
                    await result;
                }
                
                handled = true;
                
                if (this.config.enableStats) {
                    this.stats.eventsHandled++;
                }
            } catch (error) {
                console.error(`❌ EventBus: Error en listener del evento '${event}':`, error);
                
                if (listener.onError) {
                    await listener.onError(error);
                }
            }
        }
        
        return handled;
    }
    
    /**
     * Espera a que ocurra un evento específico
     * @param {string} event - Nombre del evento
     * @param {number} timeout - Tiempo máximo de espera en ms (opcional)
     * @returns {Promise<any[]>} Promise que resuelve con los argumentos del evento
     */
    waitFor(event, timeout = null) {
        return new Promise((resolve, reject) => {
            let listenerId;
            let timeoutId;
            
            const cleanup = () => {
                if (listenerId) {
                    this.off(event, listenerId);
                }
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            };
            
            listenerId = this.once(event, (...args) => {
                cleanup();
                resolve(args);
            });
            
            if (timeout !== null) {
                timeoutId = setTimeout(() => {
                    cleanup();
                    reject(new Error(`Timeout esperando evento '${event}'`));
                }, timeout);
            }
        });
    }
    
    /**
     * Crea un namespace para eventos
     * @param {string} namespace - Nombre del namespace
     * @returns {Object} Interfaz de eventos con namespace
     */
    namespace(namespace) {
        return {
            on: (event, callback, options) => this.on(`${namespace}:${event}`, callback, options),
            once: (event, callback, options) => this.once(`${namespace}:${event}`, callback, options),
            off: (event, listenerId) => this.off(`${namespace}:${event}`, listenerId),
            emit: (event, ...args) => this.emit(`${namespace}:${event}`, ...args),
            emitAsync: (event, ...args) => this.emitAsync(`${namespace}:${event}`, ...args),
            waitFor: (event, timeout) => this.waitFor(`${namespace}:${event}`, timeout),
            listenerCount: (event) => this.listenerCount(`${namespace}:${event}`),
            hasListeners: (event) => this.hasListeners(`${namespace}:${event}`)
        };
    }
    
    /**
     * Obtiene estadísticas del sistema de eventos
     * @returns {Object} Estadísticas
     */
    getStats() {
        return {
            ...this.stats,
            totalEvents: this.events.size,
            eventNames: this.eventNames(),
            avgListenersPerEvent: this.stats.activeListeners / (this.events.size || 1)
        };
    }
    
    /**
     * Limpia todos los eventos y listeners
     */
    clear() {
        this.events.clear();
        this.listenerMap.clear();
        this.stats = {
            eventsEmitted: 0,
            eventsHandled: 0,
            maxListenersPerEvent: 0,
            activeListeners: 0
        };
        
        console.log('🗑️ EventBus: Todos los eventos y listeners han sido limpiados');
    }
    
    /**
     * Configura el sistema de eventos
     * @param {Object} config - Configuración
     */
    configure(config) {
        Object.assign(this.config, config);
        console.log('⚙️ EventBus: Configuración actualizada', this.config);
    }
}

// Crear instancia global
window.EventBus = new EventBus();