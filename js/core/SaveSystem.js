/**
 * SaveSystem - Sistema de guardado del juego
 * Responsabilidad: Persistir y cargar el estado del juego de forma segura
 */

class SaveSystem {
    constructor() {
        // Configuración de guardado
        this.config = {
            storageKey: 'chrono-farmer-save',
            backupKey: 'chrono-farmer-backup',
            settingsKey: 'chrono-farmer-settings',
            autoSaveInterval: 60000, // 1 minuto
            maxBackups: 5,
            compressionEnabled: true,
            encryptionEnabled: false, // Por simplicidad, deshabilitado por defecto
            version: '1.0.0'
        };
        
        // Estado de guardado
        this.saveData = null;
        this.isSaving = false;
        this.lastSaveTime = null;
        this.autoSaveTimer = null;
        
        // Validación de datos
        this.requiredFields = [
            'player', 'farm', 'time', 'version', 'timestamp'
        ];
        
        // Bind de métodos
        this.save = this.save.bind(this);
        this.load = this.load.bind(this);
        this.autoSave = this.autoSave.bind(this);
        
        // Inicializar
        this.init();
        
        console.log('💾 SaveSystem: Sistema de guardado inicializado');
    }
    
    /**
     * Inicializa el sistema de guardado
     */
    init() {
        // Verificar soporte de localStorage
        if (!this.checkStorageSupport()) {
            console.warn('⚠️ SaveSystem: localStorage no soportado, el guardado estará deshabilitado');
            return;
        }
        
        // Migrar datos antiguos si es necesario
        this.migrateData();
        
        // Configurar auto-guardado
        this.setupAutoSave();
        
        // Configurar eventos de página
        this.setupPageEvents();
        
        console.log('✅ SaveSystem: Sistema listo para guardar');
    }
    
    /**
     * Verifica si el navegador soporta localStorage
     * @returns {boolean} true si está soportado
     */
    checkStorageSupport() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Guarda el estado del juego
     * @param {Object} gameState - Estado del juego a guardar
     * @param {Object} options - Opciones de guardado
     * @returns {Promise<boolean>} true si se guardó exitosamente
     */
    async save(gameState = null, options = {}) {
        if (this.isSaving) {
            console.warn('⚠️ SaveSystem: Guardado ya en progreso');
            return false;
        }
        
        if (!this.checkStorageSupport()) {
            console.error('❌ SaveSystem: No se puede guardar, localStorage no soportado');
            return false;
        }
        
        this.isSaving = true;
        
        try {
            // Obtener estado del StateManager si no se proporciona
            if (!gameState && window.stateManager) {
                gameState = window.stateManager.getState();
            }
            
            // Preparar datos de guardado
            const saveData = this.prepareSaveData(gameState);
            
            // Validar datos
            if (!this.validateSaveData(saveData)) {
                throw new Error('Datos de guardado inválidos');
            }
            
            // Serializar datos
            const serializedData = this.serialize(saveData);
            
            // Guardar en localStorage
            localStorage.setItem(this.config.storageKey, serializedData);
            
            // Crear backup
            this.createBackup(saveData);
            
            // Actualizar timestamp
            this.lastSaveTime = Date.now();
            
            // Notificar éxito
            this.notifySaveSuccess();
            
            console.log('💾 SaveSystem: Juego guardado exitosamente');
            return true;
            
        } catch (error) {
            console.error('❌ SaveSystem: Error al guardar:', error);
            this.notifySaveError(error);
            return false;
        } finally {
            this.isSaving = false;
        }
    }
    
    /**
     * Carga el estado del juego
     * @param {Object} options - Opciones de carga
     * @returns {Promise<Object|null>} Estado del juego o null si falló
     */
    async load(options = {}) {
        try {
            if (!this.checkStorageSupport()) {
                throw new Error('localStorage no soportado');
            }
            
            // Obtener datos guardados
            const serializedData = localStorage.getItem(this.config.storageKey);
            if (!serializedData) {
                console.log('ℹ️ SaveSystem: No hay datos guardados');
                return null;
            }
            
            // Deserializar
            const saveData = this.deserialize(serializedData);
            
            // Validar
            if (!this.validateSaveData(saveData)) {
                throw new Error('Datos de guardado corruptos');
            }
            
            // Migrar si es necesario
            const migratedData = this.migrateSaveData(saveData);
            
            // Notificar carga exitosa
            this.notifyLoadSuccess();
            
            console.log('💾 SaveSystem: Juego cargado exitosamente');
            return migratedData;
            
        } catch (error) {
            console.error('❌ SaveSystem: Error al cargar:', error);
            
            // Intentar recuperar desde backup
            const backupData = await this.loadBackup();
            if (backupData) {
                console.log('💾 SaveSystem: Recuperado desde backup');
                return backupData;
            }
            
            this.notifyLoadError(error);
            return null;
        }
    }
    
    /**
     * Prepara los datos para guardar
     * @private
     */
    prepareSaveData(gameState) {
        const timestamp = Date.now();
        
        return {
            version: this.config.version,
            timestamp: timestamp,
            player: gameState.player,
            farm: gameState.farm,
            time: gameState.time,
            world: gameState.world,
            settings: gameState.settings,
            metadata: {
                saveCount: (this.saveData?.metadata?.saveCount || 0) + 1,
                firstSave: this.saveData?.metadata?.firstSave || timestamp,
                gameVersion: this.config.version,
                browser: navigator.userAgent,
                screenSize: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            }
        };
    }
    
    /**
     * Valida los datos de guardado
     * @private
     */
    validateSaveData(saveData) {
        if (!saveData || typeof saveData !== 'object') {
            return false;
        }
        
        // Verificar campos requeridos
        for (const field of this.requiredFields) {
            if (!(field in saveData)) {
                console.error(`❌ SaveSystem: Campo requerido faltante: ${field}`);
                return false;
            }
        }
        
        // Verificar estructura básica
        if (typeof saveData.player !== 'object' ||
            typeof saveData.farm !== 'object' ||
            typeof saveData.time !== 'object') {
            return false;
        }
        
        return true;
    }
    
    /**
     * Serializa los datos para guardar
     * @private
     */
    serialize(data) {
        try {
            let serialized = JSON.stringify(data);
            
            if (this.config.compressionEnabled) {
                serialized = this.compress(serialized);
            }
            
            if (this.config.encryptionEnabled) {
                serialized = this.encrypt(serialized);
            }
            
            return serialized;
        } catch (error) {
            console.error('❌ SaveSystem: Error serializando datos:', error);
            throw error;
        }
    }
    
    /**
     * Deserializa los datos guardados
     * @private
     */
    deserialize(data) {
        try {
            let deserialized = data;
            
            if (this.config.encryptionEnabled) {
                deserialized = this.decrypt(deserialized);
            }
            
            if (this.config.compressionEnabled) {
                deserialized = this.decompress(deserialized);
            }
            
            return JSON.parse(deserialized);
        } catch (error) {
            console.error('❌ SaveSystem: Error deserializando datos:', error);
            throw error;
        }
    }
    
    /**
     * Comprime datos usando LZ-string (simplificado)
     * @private
     */
    compress(data) {
        // Por simplicidad, solo codificamos en base64
        // En producción usaríamos una librería como lz-string
        try {
            return btoa(encodeURIComponent(data));
        } catch (error) {
            console.warn('⚠️ SaveSystem: Compresión falló, usando datos sin comprimir');
            return data;
        }
    }
    
    /**
     * Descomprime datos
     * @private
     */
    decompress(data) {
        try {
            return decodeURIComponent(atob(data));
        } catch (error) {
            console.warn('⚠️ SaveSystem: Descompresión falló, intentando usar datos directamente');
            return data;
        }
    }
    
    /**
     * Encripta datos (placeholder)
     * @private
     */
    encrypt(data) {
        // Implementación de encriptación simplificada
        // En producción usaríamos Web Crypto API
        return data;
    }
    
    /**
     * Desencripta datos (placeholder)
     * @private
     */
    decrypt(data) {
        // Implementación de desencriptación simplificada
        return data;
    }
    
    /**
     * Migra datos de versiones anteriores
     * @private
     */
    migrateData() {
        const currentVersion = this.config.version;
        const savedVersion = localStorage.getItem('game-version');
        
        if (savedVersion && savedVersion !== currentVersion) {
            console.log(`🔄 SaveSystem: Migrando datos de ${savedVersion} a ${currentVersion}`);
            // Implementar lógica de migración específica por versión
        }
        
        localStorage.setItem('game-version', currentVersion);
    }
    
    /**
     * Migra datos de guardado según la versión
     * @private
     */
    migrateSaveData(saveData) {
        if (saveData.version === this.config.version) {
            return saveData;
        }
        
        // Implementar migraciones específicas por versión
        console.log(`🔄 SaveSystem: Migrando save data de ${saveData.version} a ${this.config.version}`);
        
        // Migración de ejemplo
        if (!saveData.metadata) {
            saveData.metadata = {
                saveCount: 1,
                firstSave: saveData.timestamp,
                gameVersion: this.config.version
            };
        }
        
        saveData.version = this.config.version;
        return saveData;
    }
    
    /**
     * Crea un backup de los datos
     * @private
     */
    createBackup(saveData) {
        try {
            const backupKey = `${this.config.backupKey}-${Date.now()}`;
            const backupData = {
                ...saveData,
                backupTimestamp: Date.now()
            };
            
            localStorage.setItem(backupKey, this.serialize(backupData));
            
            // Limpiar backups antiguos
            this.cleanupOldBackups();
            
        } catch (error) {
            console.error('❌ SaveSystem: Error creando backup:', error);
        }
    }
    
    /**
     * Carga datos desde backup
     * @private
     */
    loadBackup() {
        try {
            // Buscar el backup más reciente
            const backupKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.config.backupKey)) {
                    backupKeys.push(key);
                }
            }
            
            if (backupKeys.length === 0) {
                return null;
            }
            
            // Ordenar por timestamp (más reciente primero)
            backupKeys.sort((a, b) => {
                const timeA = parseInt(a.split('-').pop());
                const timeB = parseInt(b.split('-').pop());
                return timeB - timeA;
            });
            
            // Intentar cargar el backup más reciente
            const latestBackup = localStorage.getItem(backupKeys[0]);
            if (latestBackup) {
                const backupData = this.deserialize(latestBackup);
                return this.migrateSaveData(backupData);
            }
            
        } catch (error) {
            console.error('❌ SaveSystem: Error cargando backup:', error);
        }
        
        return null;
    }
    
    /**
     * Limpia backups antiguos
     * @private
     */
    cleanupOldBackups() {
        try {
            const backupKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.config.backupKey)) {
                    backupKeys.push(key);
                }
            }
            
            // Si hay más backups que el límite, eliminar los más antiguos
            if (backupKeys.length > this.config.maxBackups) {
                backupKeys.sort((a, b) => {
                    const timeA = parseInt(a.split('-').pop());
                    const timeB = parseInt(b.split('-').pop());
                    return timeA - timeB;
                });
                
                const toRemove = backupKeys.length - this.config.maxBackups;
                for (let i = 0; i < toRemove; i++) {
                    localStorage.removeItem(backupKeys[i]);
                }
            }
            
        } catch (error) {
            console.error('❌ SaveSystem: Error limpiando backups:', error);
        }
    }
    
    /**
     * Configura el auto-guardado
     * @private
     */
    setupAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            this.autoSave();
        }, this.config.autoSaveInterval);
    }
    
    /**
     * Guardado automático
     * @private
     */
    autoSave() {
        if (window.stateManager && window.gameEngine?.isRunning) {
            console.log('💾 SaveSystem: Auto-guardando...');
            this.save(null, { isAutoSave: true });
        }
    }
    
    /**
     * Configura eventos de la página
     * @private
     */
    setupPageEvents() {
        // Guardar antes de cerrar
        window.addEventListener('beforeunload', () => {
            this.save();
        });
        
        // Guardar cuando el juego pierde foco
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.save();
            }
        });
    }
    
    /**
     * Notifica éxito en guardado
     * @private
     */
    notifySaveSuccess() {
        if (window.eventBus) {
            window.eventBus.emit('save:success', {
                timestamp: this.lastSaveTime,
                isAutoSave: false
            });
        }
    }
    
    /**
     * Notifica error en guardado
     * @private
     */
    notifySaveError(error) {
        if (window.eventBus) {
            window.eventBus.emit('save:error', {
                error: error.message,
                timestamp: Date.now()
            });
        }
    }
    
    /**
     * Notifica éxito en carga
     * @private
     */
    notifyLoadSuccess() {
        if (window.eventBus) {
            window.eventBus.emit('load:success', {
                timestamp: Date.now()
            });
        }
    }
    
    /**
     * Notifica error en carga
     * @private
     */
    notifyLoadError(error) {
        if (window.eventBus) {
            window.eventBus.emit('load:error', {
                error: error.message,
                timestamp: Date.now()
            });
        }
    }
    
    /**
     * Exporta datos de guardado
     * @returns {string} Datos serializados
     */
    exportSave() {
        try {
            const gameState = window.stateManager?.getState();
            const saveData = this.prepareSaveData(gameState);
            return this.serialize(saveData);
        } catch (error) {
            console.error('❌ SaveSystem: Error exportando datos:', error);
            throw error;
        }
    }
    
    /**
     * Importa datos de guardado
     * @param {string} data - Datos serializados
     * @returns {boolean} true si se importó exitosamente
     */
    importSave(data) {
        try {
            const saveData = this.deserialize(data);
            
            if (!this.validateSaveData(saveData)) {
                throw new Error('Datos de importación inválidos');
            }
            
            // Guardar datos importados
            localStorage.setItem(this.config.storageKey, data);
            
            // Notificar
            if (window.eventBus) {
                window.eventBus.emit('save:imported', {
                    timestamp: Date.now()
                });
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ SaveSystem: Error importando datos:', error);
            return false;
        }
    }
    
    /**
     * Elimina todos los datos guardados
     */
    clearAllData() {
        try {
            // Limpiar localStorage
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (
                    key === this.config.storageKey ||
                    key === this.config.settingsKey ||
                    key.startsWith(this.config.backupKey)
                )) {
                    keysToRemove.push(key);
                }
            }
            
            for (const key of keysToRemove) {
                localStorage.removeItem(key);
            }
            
            console.log('🗑️ SaveSystem: Todos los datos han sido eliminados');
            return true;
            
        } catch (error) {
            console.error('❌ SaveSystem: Error eliminando datos:', error);
            return false;
        }
    }
    
    /**
     * Obtiene información de los datos guardados
     * @returns {Object|null} Información de guardado o null si no hay datos
     */
    getSaveInfo() {
        try {
            const data = localStorage.getItem(this.config.storageKey);
            if (!data) return null;
            
            const saveData = this.deserialize(data);
            return {
                version: saveData.version,
                timestamp: saveData.timestamp,
                playerLevel: saveData.player?.level || 1,
                playTime: saveData.time?.gameTime || 0,
                currentEra: saveData.time?.currentEra || 'prehistoric',
                saveCount: saveData.metadata?.saveCount || 1,
                firstSave: saveData.metadata?.firstSave || saveData.timestamp,
                size: data.length
            };
        } catch (error) {
            console.error('❌ SaveSystem: Error obteniendo info de guardado:', error);
            return null;
        }
    }
    
    /**
     * Obtiene estadísticas del sistema de guardado
     * @returns {Object} Estadísticas
     */
    getStats() {
        const saveInfo = this.getSaveInfo();
        const backupKeys = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.config.backupKey)) {
                backupKeys.push(key);
            }
        }
        
        return {
            hasSaveData: saveInfo !== null,
            saveInfo: saveInfo,
            backupCount: backupKeys.length,
            storageAvailable: this.checkStorageSupport(),
            autoSaveEnabled: this.autoSaveTimer !== null,
            lastSaveTime: this.lastSaveTime,
            config: this.config
        };
    }
    
    /**
     * Configura el sistema de guardado
     * @param {Object} config - Nueva configuración
     */
    configure(config) {
        Object.assign(this.config, config);
        
        // Reconfigurar auto-guardado si cambió el intervalo
        if (config.autoSaveInterval !== undefined) {
            this.setupAutoSave();
        }
        
        console.log('⚙️ SaveSystem: Configuración actualizada');
    }
    
    /**
     * Destruye el sistema de guardado
     */
    destroy() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
        
        console.log('🗑️ SaveSystem: Sistema de guardado destruido');
    }
}

// Exportar para uso global
window.SaveSystem = SaveSystem;