/**
 * Chrono Farmer - El Jardín de los Tiempos
 * Archivo principal del juego
 * 
 * Este archivo inicializa todos los sistemas y coordina el flujo del juego
 */

class ChronoFarmer {
    constructor() {
        // Sistema principal
        this.gameEngine = null;
        this.eventBus = null;
        this.stateManager = null;
        this.renderer = null;
        this.saveSystem = null;
        this.audioManager = null;

        // Sistemas de juego
        this.plantSystem = null;
        this.timeTravelSystem = null;
        this.timeSystem = null;
        this.animalSystem = null;
        this.resourceSystem = null;
        this.weatherSystem = null;
        this.achievementSystem = null;

        // Estado del juego
        this.isInitialized = false;
        this.currentScreen = 'loading';

        // Configuración
        this.config = {
            debugMode: false,
            autoSaveInterval: 60000, // 1 minuto
            enableAnalytics: false
        };

        // Bind de métodos
        this.init = this.init.bind(this);
        this.handleError = this.handleError.bind(this);

        console.log('🌾 ChronoFarmer: Inicializando El Jardín de los Tiempos...');
    }

    /**
     * Inicializa el juego
     */
    async init() {
        try {
            console.log('🚀 ChronoFarmer: Iniciando inicialización...');

            // 1. Crear instancias de sistemas core
            console.log('🚀 Paso 1: Inicializando sistemas core...');
            await this.initializeCoreSystems();
            console.log('✅ Paso 1 completado');

            // 2. Crear instancias de sistemas de juego
            console.log('🚀 Paso 2: Inicializando sistemas de juego...');
            await this.initializeGameSystems();
            console.log('✅ Paso 2 completado');

            // 3. Configurar eventos globales
            console.log('🚀 Paso 3: Configurando eventos globales...');
            this.setupGlobalEvents();
            console.log('✅ Paso 3 completado');

            // 4. Cargar datos guardados
            console.log('🚀 Paso 4: Cargando datos guardados...');
            await this.loadGameData();
            console.log('✅ Paso 4 completado');

            // 5. Inicializar UI
            console.log('🚀 Paso 5: Inicializando UI...');
            await this.initializeUI();
            console.log('✅ Paso 5 completado');

            // 6. Iniciar motor del juego
            console.log('🚀 Paso 6: Iniciando motor del juego...');
            this.startGameEngine();
            console.log('✅ Paso 6 completado');

            // 7. Mostrar pantalla principal
            console.log('🚀 Paso 7: Mostrando menú principal...');
            this.showMainMenu();
            console.log('✅ Paso 7 completado');

            this.isInitialized = true;
            console.log('✅ ChronoFarmer: Juego inicializado correctamente');

        } catch (error) {
            console.error('❌ ChronoFarmer: Error crítico durante la inicialización:', error);
            this.handleError('Error durante la inicialización', error);
        }
    }

    /**
     * Inicializa los sistemas core
     * @private
     */
    async initializeCoreSystems() {
        console.log('⚙️ ChronoFarmer: Inicializando sistemas core...');

        // EventBus (singleton global)
        this.eventBus = window.EventBus;

        // StateManager
        this.stateManager = new StateManager();
        window.stateManager = this.stateManager;

        // DOMRenderer
        this.renderer = new DOMRenderer();
        window.renderer = this.renderer;

        // GameEngine
        this.gameEngine = new GameEngine();
        window.gameEngine = this.gameEngine;

        // Registrar sistemas core en el motor
        this.gameEngine.registerSystem('eventBus', this.eventBus);
        this.gameEngine.registerSystem('stateManager', this.stateManager);
        this.gameEngine.registerSystem('renderer', this.renderer);

        // SaveSystem
        this.saveSystem = new SaveSystem();
        window.saveSystem = this.saveSystem;
        this.gameEngine.registerSystem('saveSystem', this.saveSystem);

        // AudioManager
        this.audioManager = new AudioManager();
        window.audioManager = this.audioManager;
        this.gameEngine.registerSystem('audioManager', this.audioManager);

        // Inicializar sistemas core
        await this.renderer.init();
        await this.audioManager.init();

        console.log('✅ ChronoFarmer: Sistemas core inicializados');
    }

    /**
     * Inicializa los sistemas de juego
     * @private
     */
    async initializeGameSystems() {
        console.log('🎮 ChronoFarmer: Inicializando sistemas de juego...');

        // PlantSystem
        this.plantSystem = new PlantSystem();
        this.plantSystem.gameEngine = this.gameEngine;
        window.plantSystem = this.plantSystem;
        this.gameEngine.registerSystem('plantSystem', this.plantSystem);

        // TimeTravelSystem
        this.timeTravelSystem = new TimeTravelSystem();
        this.timeTravelSystem.gameEngine = this.gameEngine;
        window.timeTravelSystem = this.timeTravelSystem;
        this.gameEngine.registerSystem('timeTravelSystem', this.timeTravelSystem);

        // TimeSystem
        this.timeSystem = new TimeSystem();
        this.timeSystem.gameEngine = this.gameEngine;
        window.timeSystem = this.timeSystem;
        this.gameEngine.registerSystem('timeSystem', this.timeSystem);

        // AnimalSystem
        this.animalSystem = new AnimalSystem();
        this.animalSystem.gameEngine = this.gameEngine;
        window.animalSystem = this.animalSystem;
        this.gameEngine.registerSystem('animalSystem', this.animalSystem);

        // ResourceSystem
        this.resourceSystem = new ResourceSystem();
        this.resourceSystem.gameEngine = this.gameEngine;
        window.resourceSystem = this.resourceSystem;
        this.gameEngine.registerSystem('resourceSystem', this.resourceSystem);

        // WeatherSystem
        this.weatherSystem = new WeatherSystem();
        this.weatherSystem.gameEngine = this.gameEngine;
        window.weatherSystem = this.weatherSystem;
        this.gameEngine.registerSystem('weatherSystem', this.weatherSystem);

        // AchievementSystem
        this.achievementSystem = new AchievementSystem();
        this.achievementSystem.gameEngine = this.gameEngine;
        window.achievementSystem = this.achievementSystem;
        this.gameEngine.registerSystem('achievementSystem', this.achievementSystem);

        // Inicializar sistemas
        this.plantSystem.init();
        this.timeTravelSystem.init();
        this.timeSystem.init();
        this.animalSystem.init();
        this.resourceSystem.init();
        this.weatherSystem.init();
        this.achievementSystem.init();

        console.log('✅ ChronoFarmer: Sistemas de juego inicializados');
    }

    /**
     * Configura eventos globales
     * @private
     */
    setupGlobalEvents() {
        console.log('📢 ChronoFarmer: Configurando eventos globales...');

        // Eventos de UI
        this.eventBus.on('ui:screen-change', (screenName) => {
            this.currentScreen = screenName;
            console.log(`🖥️ Pantalla cambiada a: ${screenName}`);
        });

        // Eventos de error
        this.eventBus.on('error', (errorData) => {
            this.handleError(errorData.message, errorData.error);
        });

        // Eventos de guardado
        this.eventBus.on('save:success', (data) => {
            console.log('💾 Juego guardado exitosamente');
            this.showNotification('Juego guardado', 'success');
        });

        this.eventBus.on('save:error', (data) => {
            console.error('❌ Error guardando:', data.error);
            this.showNotification('Error al guardar', 'error');
        });

        // Eventos de viaje temporal
        this.eventBus.on('timetravel:success', (data) => {
            this.onTimeTravel(data);
        });

        // Eventos de plantas
        this.eventBus.on('plant:planted', (data) => {
            this.onPlantPlanted(data);
        });

        this.eventBus.on('plant:harvested', (data) => {
            this.onPlantHarvested(data);
        });

        // Eventos de recursos
        this.eventBus.on('resources:changed', (data) => {
            this.onResourcesChanged(data);
        });

        // Eventos de configuración
        this.eventBus.on('settings:changed', (data) => {
            this.onSettingsChanged(data);
        });

        console.log('✅ ChronoFarmer: Eventos globales configurados');
    }

    /**
     * Carga datos guardados del juego
     * @private
     */
    async loadGameData() {
        console.log('💾 ChronoFarmer: Cargando datos guardados...');

        const savedData = await this.saveSystem.load();

        if (savedData) {
            // Restaurar estado
            this.stateManager.setState(savedData, { notify: false });
            console.log('✅ Datos guardados cargados');
        } else {
            // Es un nuevo juego
            console.log('ℹ️ No hay datos guardados, iniciando nuevo juego');
            this.setupNewGame();
        }

        // Cargar configuración
        const savedSettings = localStorage.getItem('chrono-farmer-settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                this.stateManager.set('settings', settings);
            } catch (error) {
                console.warn('⚠️ Error cargando configuración:', error);
            }
        }
    }

    /**
     * Configura un nuevo juego
     * @private
     */
    setupNewGame() {
        console.log('🌱 ChronoFarmer: Configurando nuevo juego...');

        // El estado por defecto ya está configurado en StateManager
        // Aquí podríamos agregar lógica adicional para nuevos jugadores

        // 1. Inicializar la granja (8x6 grid = 48 plots)
        const plots = [];
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 8; col++) {
                const plotId = `plot_${row}_${col}`;
                plots.push({
                    id: plotId,
                    row: row,
                    col: col,
                    state: 'empty', // empty, planted, growing, ready, withered
                    plant: null,
                    waterLevel: 0,
                    nutrientLevel: 0,
                    plantedAt: null,
                    lastWatered: null,
                    growthProgress: 0
                });
            }
        }

        // IMPORTANTE: Guardar los plots en el StateManager
        this.stateManager.set('farm.plots', plots);

        // 2. Inicializar inventario de semillas y recursos
        // IMPORTANTE: Hay que usar IDs que existan en plants.js (La base de datos de plantas)
        this.stateManager.set('player.inventory.seeds', {
            'prehistoric-moss': 5,  // 5 semillas de helecho iniciales
            'fern-ancient': 3      // 3 semillas de baya iniciales
        });

        this.stateManager.set('player.inventory.resources', {
            'temporal-pulses': 150,  // Recursos iniciales
            'water': 100
        });

        // 3. Configurar era inicial
        this.stateManager.set('time.currentEra', 'prehistoric');

        // Tutorial
        this.stateManager.set('player.tutorial.completed', false);
        this.stateManager.set('player.tutorial.currentStep', 0);

        // Estadísticas iniciales
        this.stateManager.set('player.stats.plantsHarvested', 0);
        this.stateManager.set('player.stats.timeTraveled', 0);
        this.stateManager.set('player.stats.playTime', 0);

        console.log('✅ ChronoFarmer: Nuevo juego configurado y guardado en State');
    }

    /**
     * Inicializa la interfaz de usuario
     * @private
     */
    async initializeUI() {
        console.log('🎨 ChronoFarmer: Inicializando UI...');

        // Configurar event listeners de la UI
        this.setupUIEventListeners();

        // -- Renderizar grid de la granja
        // Obtener los plots del estado (que ya deben estar ahí por loadGame o setupNewGame)
        const plots = this.stateManager.get('farm.plots');

        if (plots && this.renderer) {
            this.renderer.renderFarmGrid(plots, (plot) => {
                this.handlePlotClick(plot);
            });
        }

        // Actualizar recursos en UI
        this.updateUI();

        console.log('✅ ChronoFarmer: UI inicializada');
    }

    /**
     * Configura los event listeners de la UI
     * @private
     */
    setupUIEventListeners() {
        // Botones del menú principal
        document.addEventListener('click', (event) => {
            const action = event.target.dataset.action;
            if (action) {
                this.handleUIAction(action, event.target);
            }
        });

        // Botones de herramientas
        const toolButtons = document.querySelectorAll('[data-tool]');
        toolButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const tool = event.target.dataset.tool;
                this.selectTool(tool);
            });
        });

        // Portal temporal
        const portalButton = document.querySelector('[data-action="activate-portal"]');
        if (portalButton) {
            portalButton.addEventListener('click', () => {
                this.showTimeTravelModal();
            });
        }

        // Modales
        this.setupModalHandlers();
    }

    /**
     * Maneja acciones de la UI
     * @private
     */
    handleUIAction(action, element) {
        switch (action) {
            case 'new-game':
                this.startNewGame();
                break;
            case 'continue':
                this.continueGame();
                break;
            case 'settings':
                this.showSettingsModal();
                break;
            case 'credits':
                this.showCredits();
                break;
            case 'menu':
                this.showGameMenu();
                break;
            case 'close-modal':
                this.closeModal(element.closest('.modal'));
                break;
        }
    }

    /**
     * Selecciona una herramienta
     * @private
     */
    selectTool(toolName) {
        // Actualizar UI
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('tool-btn--active');
        });

        const selectedButton = document.querySelector(`[data-tool="${toolName}"]`);
        if (selectedButton) {
            selectedButton.classList.add('tool-btn--active');
        }

        // Actualizar estado
        this.stateManager.set('ui.selectedTool', toolName);

        // Notificar evento
        this.eventBus.emit('tool:selected', { tool: toolName });

        console.log(`🔧 Herramienta seleccionada: ${toolName}`);
    }

    /**
     * Maneja el click en un plot
     * @private
     */
    handlePlotClick(plot) {
        const selectedTool = this.stateManager.get('ui.selectedTool', 'plant');

        switch (selectedTool) {
            case 'plant':
                this.handlePlantAction(plot);
                break;
            case 'water':
                this.handleWaterAction(plot);
                break;
            case 'harvest':
                this.handleHarvestAction(plot);
                break;
            case 'accelerate':
                this.handleAccelerateAction(plot);
                break;
        }
    }

    /**
     * Maneja la acción de plantar
     * @private
     */
    handlePlantAction(plot) {
        if (!this.plantSystem) return;

        // 1. Obtenemos la semilla que guardamos al hacer clic en el panel lateral
        const selectedSeed = this.stateManager.get('ui.selectedSeed');

        console.log("Intentando plantar semilla:", selectedSeed, "en plot:", plot.id);

        if (!selectedSeed) {
            this.showNotification('Selecciona una semilla primero', 'warning');
            return;
        }

        // 2. Llamamos al sistema de plantas pasando los parámetros correctos
        // IMPORTANTE: Verifica si tu PlantSystem usa 'plantSeed' o 'plant'
        const success = this.plantSystem.plantSeed(plot.id, selectedSeed);

        if (success) {
            // 3. Consumir la semilla del inventario
            const currentCount = this.stateManager.get(`player.inventory.seeds.${selectedSeed}`, 0);
            this.stateManager.set(`player.inventory.seeds.${selectedSeed}`, currentCount - 1);
            

            this.updateUI();
            this.showNotification('¡Semilla plantada!', 'success');
        } else {
            console.error("PlantSystem.plantSeed devolvió false. ¿El plot está ocupado o no existe?");
        }
    }

    /**
     * Maneja la acción de regar
     * @private
     */
    handleWaterAction(plot) {
        if (!this.plantSystem) return;

        const success = this.plantSystem.waterPlant(plot.id);
        if (success) {
            this.showNotification('Planta regada', 'success');
        }
    }

    /**
     * Maneja la acción de cosechar
     * @private
     */
    handleHarvestAction(plot) {
        if (!this.plantSystem) return;

        const success = this.plantSystem.harvestPlant(plot.id);
        if (success) {
            this.updateUI();
            this.showNotification('¡Cosecha exitosa!', 'success');
        }
    }

    /**
     * Maneja la acción de acelerar
     * @private
     */
    handleAccelerateAction(plot) {
        const temporalPulses = this.stateManager.get('player.inventory.resources.temporal-pulses', 0);
        const cost = 5; // Costo en pulsos temporales

        if (temporalPulses < cost) {
            this.showNotification('No tienes suficientes pulsos temporales', 'error');
            return;
        }

        // 1. Consumir recursos
        this.stateManager.set('player.inventory.resources.temporal-pulses', temporalPulses - cost);

        // 2. Aplicar aceleración en el sistema de plantas
        if (this.plantSystem) {
            // Aumentamos el progreso (ejemplo: +20% por cada rayito)
            const success = this.plantSystem.accelerateGrowth(plot.id, 20);

            if (success) {
                this.showNotification('¡Energía temporal aplicada!', 'success');
                // 3. ¡IMPORTANTE! Forzar el renderizado del plot específico
                this.updateUI();
            }
        }

    }

    /**
     * Muestra el modal de viaje temporal
     * @private
     */
    showTimeTravelModal() {
        const modal = document.getElementById('time-travel-modal');
        if (!modal) return;

        // Obtener eras desbloqueadas
        const unlockedEras = this.timeTravelSystem?.getUnlockedEras() || [];

        // Renderizar selector de eras
        const eraSelector = modal.querySelector('.era-selector');
        if (eraSelector) {
            eraSelector.innerHTML = '';

            for (const era of unlockedEras) {
                const eraCard = this.createEraCard(era);
                eraSelector.appendChild(eraCard);
            }
        }

        // Mostrar modal
        this.renderer.showModal('time-travel-modal');
    }

    /**
     * Crea una tarjeta de era
     * @private
     */
    createEraCard(era) {
        const card = document.createElement('div');
        card.className = 'era-card';
        card.dataset.eraId = era.id;

        card.innerHTML = `
            <div class="era-card__icon">${era.emoji}</div>
            <div class="era-card__name">${era.name}</div>
            <div class="era-card__description">${era.description}</div>
        `;

        card.addEventListener('click', () => {
            this.travelToEra(era.id);
            this.renderer.hideModal('time-travel-modal');
        });

        return card;
    }

    /**
     * Viaja a una era
     * @private
     */
    async travelToEra(eraId) {
        if (!this.timeTravelSystem) return;

        const success = await this.timeTravelSystem.travelTo(eraId);
        if (success) {
            this.updateUI();
            this.showNotification(`¡Viajado a ${this.timeTravelSystem.getCurrentEra()?.name}!`, 'success');
        }
    }

    /**
     * Configura manejadores de modales
     * @private
     */
    setupModalHandlers() {
        // Cerrar modales al hacer click fuera
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal__overlay')) {
                const modal = event.target.closest('.modal');
                this.renderer.hideModal(modal.id);
            }
        });

        // Botones de cerrar
        document.querySelectorAll('.modal__close').forEach(button => {
            button.addEventListener('click', (event) => {
                const modal = event.target.closest('.modal');
                this.renderer.hideModal(modal.id);
            });
        });

        // Sliders de configuración
        document.querySelectorAll('[data-setting]').forEach(slider => {
            slider.addEventListener('input', (event) => {
                const setting = event.target.dataset.setting;
                const value = parseInt(event.target.value);
                this.updateSetting(setting, value);
            });
        });
    }

    /**
     * Actualiza una configuración
     * @private
     */
    updateSetting(setting, value) {
        this.stateManager.set(`settings.${setting}`, value);

        // Aplicar cambios inmediatos
        switch (setting) {
            case 'music-volume':
                this.audioManager?.setVolume('music', value / 100);
                break;
            case 'sfx-volume':
                this.audioManager?.setVolume('sfx', value / 100);
                break;
        }
    }

    /**
     * Inicia el motor del juego
     * @private
     */
    startGameEngine() {
        console.log('🎮 ChronoFarmer: Iniciando motor del juego...');

        this.gameEngine.start();
        console.log('✅ ChronoFarmer: Motor iniciado');
    }

    /**
     * Muestra el menú principal
     * @private
     */
    showMainMenu() {
        console.log('🎮 ChronoFarmer: Mostrando menú principal...');

        // Ocultar pantalla de carga
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            console.log('🎮 Loading screen ocultada');
        }

        // Mostrar menú principal
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) {
            mainMenu.classList.remove('hidden');
            console.log('🎮 Main menu mostrado');
        } else {
            console.error('❌ Main menu no encontrado');
        }

        this.eventBus.emit('ui:screen-change', 'main-menu');
        console.log('🎮 Evento ui:screen-change emitido');
    }

    /**
     * Inicia un nuevo juego
     * @private
     */
    startNewGame() {
        console.log('🌱 ChronoFarmer: Iniciando nuevo juego...');

        // Resetear estado
        this.stateManager.reset();
        this.setupNewGame();

        // Mostrar UI del juego
        this.showGameUI();

        // Tutorial
        this.startTutorial();
    }

    /**
     * Continúa un juego guardado
     * @private
     */
    continueGame() {
        console.log('▶️ ChronoFarmer: Continuando juego...');
        this.showGameUI();
    }

    /**
     * Muestra la UI del juego
     * @private
     */
    showGameUI() {
        // Ocultar menú principal
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) {
            mainMenu.classList.add('hidden');
        }

        // Mostrar UI del juego
        const gameUI = document.getElementById('game-ui');
        if (gameUI) {
            gameUI.classList.remove('hidden');
        }

        this.eventBus.emit('ui:screen-change', 'game');

        // Actualizar UI inicial
        this.updateUI();
    }

    /**
     * Inicia el tutorial
     * @private
     */
    startTutorial() {
        if (this.stateManager.get('player.tutorial.completed')) return;

        console.log('📚 ChronoFarmer: Iniciando tutorial...');

        // Primer paso: seleccionar semilla
        this.showNotification('Bienvenido a Chrono Farmer! Selecciona una semilla para comenzar', 'info');

        // Configurar pasos del tutorial
        this.stateManager.set('player.tutorial.steps', [
            { id: 'select-seed', description: 'Selecciona una semilla prehistórica' },
            { id: 'plant-seed', description: 'Planta la semilla en un plot vacío' },
            { id: 'water-plant', description: 'Riega tu planta para que crezca' },
            { id: 'wait-growth', description: 'Espera a que tu planta crezca' },
            { id: 'harvest-plant', description: 'Cosecha tu planta cuando esté lista' }
        ]);
    }

    /**
     * Actualiza la UI
     * @private
     */
    updateUI() {
        // validación para evitar que el juego intente renderizar antes de que el StateManager esté listo
        if (!this.stateManager || !this.stateManager.get('farm.plots')) {
            return;
        }

        const playerInventory = this.stateManager.get('player.inventory');

        // Si playerInventory no existe aún, detenemos el renderizado para evitar el error
        if (!playerInventory || !playerInventory.seeds) {
            console.warn("⚠️ Esperando a que el inventario se inicialice...");
            return;
        }
        else {
            console.log("✅ Inventario cargado, actualizando UI...");
        }

        // Actualizar recursos
        const resources = this.stateManager.get('player.inventory.resources');
        this.renderer.updateResources(resources);

        // Actualizar era
        const currentEra = this.stateManager.get('time.currentEra');
        this.renderer.updateEra(currentEra);

        // Actualizar semillas
        const seeds = this.stateManager.get('player.inventory.seeds');
        this.renderer.renderSeedsPanel(seeds, (seedType) => {
            this.stateManager.set('ui.selectedSeed', seedType);
        });
    }

    /**
     * Muestra una notificación
     * @private
     */
    showNotification(message, type = 'info') {
        if (this.renderer) {
            this.renderer.showNotification(message, type);
        }
    }

    /**
     * Maneja eventos de viaje temporal
     * @private
     */
    onTimeTravel(data) {
        console.log(`⏰ Viajado de ${data.from} a ${data.to}`);
        this.updateUI();
    }

    /**
     * Maneja eventos de plantación
     * @private
     */
    onPlantPlanted(data) {
        console.log(`🌱 Planta ${data.plant.name} plantada en plot ${data.plotId}`);
        this.updateUI();
    }

    /**
     * Maneja eventos de cosecha
     * @private
     */
    onPlantHarvested(data) {
        console.log(`🌾 ${data.plant.name} cosechada de plot ${data.plotId}`);
        this.updateUI();
    }

    /**
     * Maneja cambios de recursos
     * @private
     */
    onResourcesChanged(data) {
        this.updateUI();
    }

    /**
     * Maneja cambios de configuración
     * @private
     */
    onSettingsChanged(data) {
        // Guardar configuración
        const settings = this.stateManager.get('settings');
        localStorage.setItem('chrono-farmer-settings', JSON.stringify(settings));
    }

    /**
     * Maneja errores del juego
     * @private
     */
    handleError(context, error) {
        console.error(`❌ ChronoFarmer: ${context}`, error);

        // Mostrar error al usuario
        this.showNotification('Ha ocurrido un error. Recarga la página si el problema persiste.', 'error');

        // En modo debug, mostrar más información
        if (this.config.debugMode) {
            const errorInfo = `
                Error: ${error.message}
                Stack: ${error.stack}
                Context: ${context}
                Time: ${new Date().toISOString()}
            `;
            console.error('Debug Info:', errorInfo);
        }
    }

    /**
     * Obtiene estadísticas del juego
     */
    getStats() {
        return {
            gameEngine: this.gameEngine?.getStats(),
            saveSystem: this.saveSystem?.getStats(),
            audioManager: this.audioManager?.getStats(),
            plantSystem: this.plantSystem?.getStats(),
            timeTravelSystem: this.timeTravelSystem?.getStats(),
            stateManager: this.stateManager?.getStats()
        };
    }

    /**
     * Muestra estadísticas en consola
     */
    showStats() {
        const stats = this.getStats();
        console.log('📊 Estadísticas del juego:', stats);
    }

    /**
     * Destruye el juego y libera recursos
     */
    destroy() {
        console.log('🗑️ ChronoFarmer: Destruyendo juego...');

        // Detener motor
        if (this.gameEngine) {
            this.gameEngine.stop();
            this.gameEngine.destroy();
        }

        // Destruir sistemas
        this.plantSystem?.destroy();
        this.timeTravelSystem?.destroy();
        this.saveSystem?.destroy();
        this.audioManager?.destroy();
        this.renderer?.destroy();

        // Limpiar referencias globales
        window.gameEngine = null;
        window.stateManager = null;
        window.renderer = null;
        window.saveSystem = null;
        window.audioManager = null;
        window.plantSystem = null;
        window.timeTravelSystem = null;
        window.EventBus.clear();

        console.log('✅ ChronoFarmer: Juego destruido correctamente');
    }
}

// Funciones de utilidad global
window.ChronoFarmerUtils = {
    /**
     * Formatea tiempo para mostrar
     */
    formatTime: (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
        } else if (minutes > 0) {
            return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
        } else {
            return `${seconds}s`;
        }
    },

    /**
     * Formatea números con separadores
     */
    formatNumber: (num) => {
        return new Intl.NumberFormat('es-ES').format(num);
    },

    /**
     * Genera ID único
     */
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Mezcla arrays
     */
    shuffle: (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌾 DOM cargado, inicializando Chrono Farmer...');

    // Crear instancia global del juego
    window.chronoFarmer = new ChronoFarmer();

    // Inicializar
    window.chronoFarmer.init();

    // Exponer funciones de debug
    window.debug = {
        showStats: () => window.chronoFarmer.showStats(),
        getState: () => window.stateManager?.getState(),
        exportSave: () => window.saveSystem?.exportSave(),
        importSave: (data) => window.saveSystem?.importSave(data),
        clearSave: () => {
            if (confirm('¿Estás seguro de que quieres borrar todos los datos guardados?')) {
                window.saveSystem?.clearAllData();
                location.reload();
            }
        }
    };

    console.log('🌾 Chrono Farmer está listo!');
    console.log('💡 Consejo: Usa debug.showStats() en la consola para ver estadísticas del juego');
});

// Manejar errores globales
window.addEventListener('error', (event) => {
    console.error('❌ Error global:', event.error);

    if (window.chronoFarmer) {
        window.chronoFarmer.handleError('Error global no capturado', event.error);
    }
});

// Manejar cierre de página
window.addEventListener('beforeunload', () => {
    if (window.chronoFarmer) {
        window.chronoFarmer.destroy();
    }
});

console.log('🌾 Chrono Farmer: Archivo principal cargado');