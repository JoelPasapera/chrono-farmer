/**
 * DOMRenderer - Renderizador y gestor del DOM
 * Responsabilidad: Todas las interacciones con el DOM están centralizadas aquí
 */

class DOMRenderer {
    constructor() {
        // Referencias a elementos del DOM cacheadas
        this.elements = new Map();

        // Templates compilados
        this.templates = new Map();

        // Listeners de eventos registrados
        this.eventListeners = new Map();

        // Slots para componentes dinámicos
        this.slots = new Map();

        // Configuración
        this.config = {
            enableAnimations: true,
            enableTransitions: true,
            enableCache: true,
            debugMode: false
        };

        // Bind de métodos
        this.getElement = this.getElement.bind(this);
        this.createElement = this.createElement.bind(this);
        this.updateElement = this.updateElement.bind(this);
        this.addEventListener = this.addEventListener.bind(this);

        // Inicializar
        this.init();

        console.log('🎨 DOMRenderer: Renderizador DOM inicializado');
    }

    /**
     * Inicializa el renderizador
     */
    init() {
        // Cachear elementos principales
        this.cacheElement('game-container', '#game-container');
        this.cacheElement('loading-screen', '#loading-screen');
        this.cacheElement('main-menu', '#main-menu');
        this.cacheElement('game-ui', '#game-ui');
        this.cacheElement('farm-grid', '#farm-grid');
        this.cacheElement('time-portal', '#time-portal');

        // Precompilar templates
        this.precompileTemplates();

        // Configurar observer para elementos dinámicos
        this.setupMutationObserver();
    }

    /**
     * Obtiene un elemento del DOM (con cache)
     * @param {string} selector - Selector CSS
     * @param {boolean} refresh - Forzar actualización de cache
     * @returns {HTMLElement|null} Elemento encontrado
     */
    getElement(selector, refresh = false) {
        if (!selector) return null;

        const key = selector.startsWith('#') ? selector.slice(1) : selector;

        if (!refresh && this.elements.has(key) && this.config.enableCache) {
            const element = this.elements.get(key);
            // Verificar que el elemento aún existe en el DOM
            if (element && document.contains(element)) {
                return element;
            }
        }

        const element = document.querySelector(selector);
        if (element && this.config.enableCache) {
            this.elements.set(key, element);
        }

        return element;
    }

    /**
     * Cachea un elemento para uso rápido
     * @param {string} key - Clave de cache
     * @param {string} selector - Selector CSS
     */
    cacheElement(key, selector) {
        const element = this.getElement(selector);
        if (element) {
            this.elements.set(key, element);
        }
    }

    /**
     * Crea un elemento con atributos y clases
     * @param {string} tagName - Nombre del tag
     * @param {Object} config - Configuración del elemento
     * @returns {HTMLElement} Elemento creado
     */
    createElement(tagName, config = {}) {
        const element = document.createElement(tagName);

        // Aplicar clases
        if (config.className) {
            if (Array.isArray(config.className)) {
                element.className = config.className.join(' ');
            } else {
                element.className = config.className;
            }
        }

        // Aplicar atributos
        if (config.attributes) {
            for (const [name, value] of Object.entries(config.attributes)) {
                element.setAttribute(name, value);
            }
        }

        // Aplicar dataset
        if (config.dataset) {
            for (const [key, value] of Object.entries(config.dataset)) {
                element.dataset[key] = value;
            }
        }

        // Establecer contenido
        if (config.textContent !== undefined) {
            element.textContent = config.textContent;
        }

        if (config.innerHTML !== undefined) {
            element.innerHTML = config.innerHTML;
        }

        // Aplicar estilos inline
        if (config.style) {
            Object.assign(element.style, config.style);
        }

        // Agregar event listeners
        if (config.listeners) {
            for (const [event, handler] of Object.entries(config.listeners)) {
                element.addEventListener(event, handler);
            }
        }

        // Agregar hijos
        if (config.children) {
            for (const child of config.children) {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof HTMLElement) {
                    element.appendChild(child);
                }
            }
        }

        return element;
    }

    /**
     * Actualiza un elemento existente
     * @param {HTMLElement|string} element - Elemento o selector
     * @param {Object} updates - Actualizaciones a aplicar
     */
    updateElement(element, updates) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (!el) return;

        // Actualizar clases
        if (updates.className) {
            if (Array.isArray(updates.className)) {
                el.className = updates.className.join(' ');
            } else {
                el.className = updates.className;
            }
        }

        // Agregar/quitar clases
        if (updates.addClass) {
            const classes = Array.isArray(updates.addClass) ? updates.addClass : [updates.addClass];
            el.classList.add(...classes);
        }

        if (updates.removeClass) {
            const classes = Array.isArray(updates.removeClass) ? updates.removeClass : [updates.removeClass];
            el.classList.remove(...classes);
        }

        // Actualizar atributos
        if (updates.attributes) {
            for (const [name, value] of Object.entries(updates.attributes)) {
                if (value === null || value === undefined) {
                    el.removeAttribute(name);
                } else {
                    el.setAttribute(name, value);
                }
            }
        }

        // Actualizar dataset
        if (updates.dataset) {
            for (const [key, value] of Object.entries(updates.dataset)) {
                if (value === null || value === undefined) {
                    delete el.dataset[key];
                } else {
                    el.dataset[key] = value;
                }
            }
        }

        // Actualizar contenido
        if (updates.textContent !== undefined) {
            el.textContent = updates.textContent;
        }

        if (updates.innerHTML !== undefined) {
            el.innerHTML = updates.innerHTML;
        }

        // Actualizar estilos
        if (updates.style) {
            Object.assign(el.style, updates.style);
        }

        // Toggle clases
        if (updates.toggleClass) {
            for (const [className, condition] of Object.entries(updates.toggleClass)) {
                el.classList.toggle(className, condition);
            }
        }
    }

    /**
     * Muestra u oculta un elemento
     * @param {HTMLElement|string} element - Elemento o selector
     * @param {boolean} show - Mostrar u ocultar
     * @param {string} displayMode - Modo de display cuando se muestra
     */
    toggleElement(element, show, displayMode = 'block') {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (!el) return;

        if (show) {
            el.classList.remove('hidden');
            el.style.display = displayMode;
        } else {
            el.classList.add('hidden');
            el.style.display = 'none';
        }
    }

    /**
     * Agrega un event listener con auto-gestión
     * @param {HTMLElement|string} element - Elemento o selector
     * @param {string} event - Tipo de evento
     * @param {Function} handler - Manejador del evento
     * @param {Object} options - Opciones del listener
     * @returns {string} ID del listener para remover
     */
    addEventListener(element, event, handler, options = {}) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (!el) return null;

        const listenerId = this.generateListenerId();
        const listenerConfig = {
            element: el,
            event: event,
            handler: handler,
            options: options,
            id: listenerId
        };

        el.addEventListener(event, handler, options);
        this.eventListeners.set(listenerId, listenerConfig);

        return listenerId;
    }

    /**
     * Remueve un event listener
     * @param {string} listenerId - ID del listener
     */
    removeEventListener(listenerId) {
        const config = this.eventListeners.get(listenerId);
        if (!config) return;

        config.element.removeEventListener(config.event, config.handler, config.options);
        this.eventListeners.delete(listenerId);
    }

    /**
     * Remueve todos los event listeners de un elemento
     * @param {HTMLElement|string} element - Elemento o selector
     */
    removeAllEventListeners(element) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (!el) return;

        const listenersToRemove = [];

        for (const [id, config] of this.eventListeners) {
            if (config.element === el) {
                listenersToRemove.push(id);
            }
        }

        for (const id of listenersToRemove) {
            this.removeEventListener(id);
        }
    }

    /**
     * Renderiza el grid de la granja
     * @param {Array} plots - Array de plots
     * @param {Function} clickHandler - Manejador de clicks
     */
    renderFarmGrid(plots, clickHandler) {
        const farmGrid = this.getElement('farm-grid');
        if (!farmGrid) return;

        // Limpiar grid existente
        farmGrid.innerHTML = '';

        // Crear plots
        for (const plot of plots) {
            const plotElement = this.createPlotElement(plot, clickHandler);
            farmGrid.appendChild(plotElement);
        }
    }

    /**
     * Crea un elemento de plot
     * @param {Object} plot - Datos del plot
     * @param {Function} clickHandler - Manejador de clicks
     * @returns {HTMLElement} Elemento del plot
     */
    createPlotElement(plot, clickHandler) {
        const classes = ['plot'];
        if (plot.state) classes.push(`plot--${plot.state}`);

        const plotEl = this.createElement('div', {
            className: classes,
            dataset: {
                plotId: plot.id,
                plotState: plot.state
            }
        });

        // Agregar contenido según el estado
        if (plot.plant) {
            const plantEl = this.createElement('div', {
                className: ['plant', `plant--${plot.plant.type || 'default'}`],
                textContent: plot.plant.emoji || '🌱'
            });
            plotEl.appendChild(plantEl);

            // Indicador de crecimiento
            if (plot.growthStage !== undefined && plot.maxGrowthStage > 0) {
                const growthIndicator = this.createElement('div', {
                    className: 'plot__growth-indicator'
                });

                const progress = this.createElement('div', {
                    className: 'plot__growth-progress',
                    style: {
                        width: `${(plot.growthStage / plot.maxGrowthStage) * 100}%`
                    }
                });

                growthIndicator.appendChild(progress);
                plotEl.appendChild(growthIndicator);
            }
        } else {
            // Plot vacío
            const soilEl = this.createElement('div', {
                className: 'plot__soil'
            });
            plotEl.appendChild(soilEl);
        }

        // Event listener
        if (clickHandler) {
            plotEl.addEventListener('click', () => clickHandler(plot));
        }

        return plotEl;
    }

    /**
     * Actualiza un plot específico
     * @param {number} plotId - ID del plot
     * @param {Object} updates - Actualizaciones a aplicar
     */
    updatePlot(plotId, updates) {
        const plotEl = this.getElement(`[data-plot-id="${plotId}"]`);
        if (!plotEl) return;

        // Actualizar estado visual
        if (updates.state) {
            // Remover clases de estado anteriores
            plotEl.className = plotEl.className.replace(/plot--\w+/g, '');
            plotEl.classList.add(`plot--${updates.state}`);

            // Actualizar dataset
            plotEl.dataset.plotState = updates.state;
        }

        // Actualizar planta
        if (updates.plant !== undefined) {
            const existingPlant = plotEl.querySelector('.plant');
            if (existingPlant) {
                existingPlant.remove();
            }

            if (updates.plant) {
                const plantEl = this.createElement('div', {
                    className: ['plant', `plant--${updates.plant.type || 'default'}`],
                    textContent: updates.plant.emoji || '🌱'
                });
                plotEl.appendChild(plantEl);
            }
        }
    }

    /**
     * Actualiza visualmente solo la barra de progreso de un plot
     * @param {number} plotId - ID del plot
     * @param {number} progress - Porcentaje 0-100
     */
    updatePlotProgress(plotId, progress) {
        const plotEl = this.getElement(`[data-plot-id="${plotId}"]`);
        if (!plotEl) return;

        const progressBar = plotEl.querySelector('.plot__growth-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;

            // Efecto visual de "chispa" al acelerar
            progressBar.classList.add('pulse');
            setTimeout(() => progressBar.classList.remove('pulse'), 300);
        }
    }

    /**
     * Renderiza el panel de semillas
     * @param {Object} seeds - Inventario de semillas
     * @param {Function} selectHandler - Manejador de selección
     */
    renderSeedsPanel(seeds, selectHandler) {
        const seedsInventory = this.getElement('#seeds-inventory');
        /*
        document.querySelector('seeds-inventory') (sin el símbolo #) busca una etiqueta HTML 
        llamada <seeds-inventory>, esta llamada no existe :v. Para buscar bien por ID, querySelector 
        necesita si o si el prefijo #, NO LO OLVIDES ;).
        */
        if (!seedsInventory) {
            console.error("❌ Error: No se encontró el elemento #seeds-inventory en el HTML");
            return;
        }
        seedsInventory.innerHTML = '';

        for (const [seedType, count] of Object.entries(seeds)) {
            if (count > 0) {
                const seedEl = this.createSeedElement(seedType, count, selectHandler);
                seedsInventory.appendChild(seedEl);
            }
        }
    }

    /**
     * Crea un elemento de semilla
     * @param {string} seedType - Tipo de semilla
     * @param {number} count - Cantidad disponible
     * @param {Function} selectHandler - Manejador de selección
     * @returns {HTMLElement} Elemento de semilla
     */
    createSeedElement(seedType, count, selectHandler) {
        const seedData = this.getSeedData(seedType);

        const seedEl = this.createElement('div', {
            className: 'seed-item',
            dataset: {
                seedType: seedType
            },
            listeners: {
                click: () => selectHandler(seedType)
            }
        });

        const iconEl = this.createElement('span', {
            className: 'seed-item__icon',
            textContent: seedData.emoji
        });

        const countEl = this.createElement('span', {
            className: 'seed-item__count',
            textContent: count
        });

        const nameEl = this.createElement('span', {
            className: 'seed-item__name',
            textContent: seedData.name
        });

        seedEl.appendChild(iconEl);
        seedEl.appendChild(countEl);
        seedEl.appendChild(nameEl);

        return seedEl;
    }

    /**
     * Obtiene datos de una semilla
     * @param {string} seedType - Tipo de semilla
     * @returns {Object} Datos de la semilla
     */
    getSeedData(seedType) {
        const seedDataMap = {
            'prehistoric-moss': {
                name: 'Musgo Prehistórico',
                emoji: '🌿',
                era: 'prehistoric',
                growTime: 30000, // 30 segundos
                stages: 3
            },
            'lotus-egyptian': {
                name: 'Loto Egipcio',
                emoji: '⚪',
                era: 'egyptian',
                growTime: 45000, // 45 segundos
                stages: 4
            },
            'crystal-future': {
                name: 'Cristal del Futuro',
                emoji: '💎',
                era: 'future',
                growTime: 60000, // 60 segundos
                stages: 5
            }
        };

        return seedDataMap[seedType] || {
            name: 'Semilla Desconocida',
            emoji: '🌱',
            era: 'unknown',
            growTime: 30000,
            stages: 3
        };
    }

    /**
     * Muestra una notificación
     * @param {string} message - Mensaje de la notificación
     * @param {string} type - Tipo de notificación
     * @param {number} duration - Duración en ms
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = this.createElement('div', {
            className: ['notification', `notification--${type}`]
        });

        const title = this.createElement('div', {
            className: 'notification__title',
            textContent: this.getNotificationTitle(type)
        });

        const messageEl = this.createElement('div', {
            className: 'notification__message',
            textContent: message
        });

        notification.appendChild(title);
        notification.appendChild(messageEl);

        document.body.appendChild(notification);

        // Auto-remover
        setTimeout(() => {
            notification.style.animation = 'notificationSlideOut 0.3s ease-in-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    /**
     * Obtiene el título de una notificación según su tipo
     * @param {string} type - Tipo de notificación
     * @returns {string} Título
     */
    getNotificationTitle(type) {
        const titles = {
            success: '¡Éxito!',
            warning: 'Advertencia',
            error: 'Error',
            info: 'Información'
        };
        return titles[type] || 'Notificación';
    }

    /**
     * Muestra un modal
     * @param {string} modalId - ID del modal
     */
    showModal(modalId) {
        const modal = this.getElement(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Oculta un modal
     * @param {string} modalId - ID del modal
     */
    hideModal(modalId) {
        const modal = this.getElement(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    /**
     * Actualiza los recursos mostrados en la UI
     * @param {Object} resources - Recursos a actualizar
     */
    updateResources(resources) {
        for (const [resource, value] of Object.entries(resources)) {
            const element = this.getElement(`[data-resource="${resource}"]`);
            if (element) {
                element.textContent = value;

                // Animación de cambio
                element.classList.add('pulse');
                setTimeout(() => {
                    element.classList.remove('pulse');
                }, 300);
            }
        }
    }

    /**
     * Actualiza la era mostrada en la UI
     * @param {string} era - Era actual
     */
    updateEra(era) {
        const eraElement = this.getElement('[data-era="current"]');
        if (eraElement) {
            eraElement.textContent = this.getEraName(era);
        }
    }

    /**
     * Obtiene el nombre legible de una era
     * @param {string} era - Identificador de era
     * @returns {string} Nombre legible
     */
    getEraName(era) {
        const eraNames = {
            'prehistoric': 'Era Primigenia',
            'egyptian': 'Antiguo Egipto',
            'future': 'Año 3025'
        };
        return eraNames[era] || 'Era Desconocida';
    }

    /**
     * Precompila templates para mejor rendimiento
     * @private
     */
    precompileTemplates() {
        // Templates pueden ser definidos aquí o cargados desde el DOM
        console.log('📝 DOMRenderer: Templates precompilados');
    }

    /**
     * Configura el observer de mutaciones del DOM
     * @private
     */
    setupMutationObserver() {
        if (!window.MutationObserver) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Limpiar cache de elementos si se eliminaron nodos
                    mutation.removedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.clearCacheForElement(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('👁️ DOMRenderer: MutationObserver configurado');
    }

    /**
     * Limpia el cache para un elemento y sus hijos
     * @private
     */
    clearCacheForElement(element) {
        // Limpiar elementos del cache que ya no existen
        for (const [key, cachedElement] of this.elements) {
            if (!document.contains(cachedElement)) {
                this.elements.delete(key);
            }
        }
    }

    /**
     * Genera un ID único para listeners
     * @private
     */
    generateListenerId() {
        return `dom_listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Limpia todos los recursos del renderizador
     */
    destroy() {
        // Remover todos los event listeners
        for (const config of this.eventListeners.values()) {
            config.element.removeEventListener(config.event, config.handler);
        }
        this.eventListeners.clear();

        // Limpiar cache
        this.elements.clear();

        console.log('🗑️ DOMRenderer: Recursos liberados');
    }
}

// Exportar para uso global
window.DOMRenderer = DOMRenderer;