/**
 * AudioManager - Gestor de audio del juego
 * Responsabilidad: Controlar todos los aspectos de audio: música, efectos de sonido y ambientación
 */

class AudioManager {
    constructor() {
        // Contexto de audio
        this.audioContext = null;
        this.masterGain = null;

        // Canales de audio
        this.channels = {
            music: null,
            sfx: null,
            ambient: null,
            ui: null
        };

        // Volúmenes
        this.volumes = {
            master: 1.0,
            music: 0.7,
            sfx: 0.8,
            ambient: 0.5,
            ui: 0.6
        };

        // Pistas de audio cargadas
        this.sounds = new Map();
        this.musicTracks = new Map();

        // Estado de reproducción
        this.currentMusic = null;
        this.currentAmbient = null;
        this.isMuted = false;
        this.isPaused = false;

        // Efectos de audio
        this.effects = new Map();

        // Configuración
        this.config = {
            maxConcurrentSounds: 10,
            fadeDuration: 1000,
            preloadSounds: true,
            enableWebAudio: true,
            audioQuality: 'high' // high, medium, low
        };

        // Bind de métodos
        this.play = this.play.bind(this);
        this.setVolume = this.setVolume.bind(this);

        // Inicializar
        this.init();

        console.log('🔊 AudioManager: Gestor de audio inicializado');
    }

    /**
     * Inicializa el sistema de audio
     */
    async init() {
        try {
            // Crear contexto de audio
            if (this.config.enableWebAudio && window.AudioContext) {
                this.audioContext = new AudioContext();
                this.masterGain = this.audioContext.createGain();
                this.masterGain.connect(this.audioContext.destination);

                // Crear canales
                this.setupChannels();

                console.log('✅ AudioManager: Web Audio API inicializada');
            }

            // Configurar efectos de audio
            this.setupEffects();

            // Precargar sonidos si está habilitado
            if (this.config.preloadSounds) {
                await this.preloadSounds();
            }

            // Configurar manejo de interacción de usuario
            this.setupUserInteraction();

            console.log('✅ AudioManager: Sistema de audio listo');

        } catch (error) {
            console.error('❌ AudioManager: Error inicializando audio:', error);
            this.fallbackToHTML5Audio();
        }
    }

    /**
     * Configura los canales de audio
     * @private
     */
    setupChannels() {
        if (!this.audioContext) return;

        // Canal de música
        this.channels.music = this.audioContext.createGain();
        this.channels.music.connect(this.masterGain);

        // Canal de efectos de sonido
        this.channels.sfx = this.audioContext.createGain();
        this.channels.sfx.connect(this.masterGain);

        // Canal de ambientación
        this.channels.ambient = this.audioContext.createGain();
        this.channels.ambient.connect(this.masterGain);

        // Canal de UI
        this.channels.ui = this.audioContext.createGain();
        this.channels.ui.connect(this.masterGain);

        // Aplicar volúmenes iniciales
        this.updateChannelVolumes();
    }

    /**
     * Configura efectos de audio
     * @private
     */
    setupEffects() {
        this.effects.set('lowpass', this.createLowPassFilter.bind(this));
        this.effects.set('highpass', this.createHighPassFilter.bind(this));
        this.effects.set('reverb', this.createReverbEffect.bind(this));
        this.effects.set('echo', this.createEchoEffect.bind(this));
        this.effects.set('distortion', this.createDistortionEffect.bind(this));
    }

    /**
     * Precarga los sonidos del juego
     * @private
     */
    async preloadSounds() {
        // Por ahora, deshabilitar la precarga de sonidos ya que los archivos no existen
        // Esto permitirá que el juego funcione sin audio hasta que se agreguen los archivos
        console.log('⚠️ AudioManager: Precarga de sonidos deshabilitada (archivos no encontrados)');
        return;

        // Código original comentado:
        /*
        const soundsToLoad = [
            // Efectos de UI
            { name: 'ui-click', url: 'assets/audio/ui/click.mp3', type: 'sfx' },
            { name: 'ui-hover', url: 'assets/audio/ui/hover.mp3', type: 'sfx' },
            { name: 'ui-success', url: 'assets/audio/ui/success.mp3', type: 'sfx' },
            { name: 'ui-error', url: 'assets/audio/ui/error.mp3', type: 'sfx' },
            
            // Efectos de juego
            { name: 'plant-seed', url: 'assets/audio/game/plant.mp3', type: 'sfx' },
            { name: 'water-plant', url: 'assets/audio/game/water.mp3', type: 'sfx' },
            { name: 'harvest-plant', url: 'assets/audio/game/harvest.mp3', type: 'sfx' },
            { name: 'temporal-pulse', url: 'assets/audio/game/pulse.mp3', type: 'sfx' },
            
            // Música de eras
            { name: 'music-prehistoric', url: 'assets/audio/music/prehistoric.mp3', type: 'music' },
            { name: 'music-egyptian', url: 'assets/audio/music/egyptian.mp3', type: 'music' },
            { name: 'music-future', url: 'assets/audio/music/future.mp3', type: 'music' },
            
            // Ambientación
            { name: 'ambient-farm', url: 'assets/audio/ambient/farm.mp3', type: 'ambient' }
        ];
        
        const loadPromises = soundsToLoad.map(sound => this.loadSound(sound));
        
        try {
            await Promise.allSettled(loadPromises);
            console.log('✅ AudioManager: Sonidos precargados');
        } catch (error) {
            console.warn('⚠️ AudioManager: Algunos sonidos no se pudieron cargar:', error);
        }
        */
    }

    /**
     * Carga un sonido
     * @param {Object} soundInfo - Información del sonido
    */
    async loadSound(soundInfo) {
        try {
            if (this.audioContext) {
                // Usar Web Audio API
                const response = await fetch(soundInfo.url);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

                if (soundInfo.type === 'music') {
                    this.musicTracks.set(soundInfo.name, {
                        buffer: audioBuffer,
                        url: soundInfo.url,
                        type: soundInfo.type
                    });
                } else {
                    this.sounds.set(soundInfo.name, {
                        buffer: audioBuffer,
                        url: soundInfo.url,
                        type: soundInfo.type
                    });
                }
            } else {
                // Fallback a HTML5 Audio
                const audio = new Audio(soundInfo.url);
                audio.preload = 'auto';

                if (soundInfo.type === 'music') {
                    this.musicTracks.set(soundInfo.name, {
                        element: audio,
                        url: soundInfo.url,
                        type: soundInfo.type
                    });
                } else {
                    this.sounds.set(soundInfo.name, {
                        element: audio,
                        url: soundInfo.url,
                        type: soundInfo.type
                    });
                }
            }

        } catch (error) {
            console.warn(`⚠️ AudioManager: No se pudo cargar ${soundInfo.name}:`, error);
        }
    }

    /**
     * Reproduce un sonido
     * @param {string} soundName - Nombre del sonido
     * @param {Object} options - Opciones de reproducción
     */
    play(soundName, options = {}) {
        const defaultOptions = {
            volume: 1.0,
            loop: false,
            channel: 'sfx',
            fadeIn: 0,
            fadeOut: 0,
            effect: null,
            playbackRate: 1.0,
            startTime: 0
        };

        options = { ...defaultOptions, ...options };

        if (this.isMuted) return null;

        // Por ahora, simular reproducción sin audio real
        // Esto permite que el juego funcione sin archivos de audio
        return {
            stop: () => { },
            element: null,
            source: null
        };

        // Código original comentado:
        /*
        try {
            if (this.audioContext) {
                return this.playWebAudio(soundName, options);
            } else {
                return this.playHTML5Audio(soundName, options);
            }
        } catch (error) {
            console.error(`❌ AudioManager: Error reproduciendo ${soundName}:`, error);
            return null;
        }
        */
    }

    /**
     * Reproduce usando Web Audio API
     * @private
     */
    playWebAudio(soundName, options) {
        const sound = this.sounds.get(soundName) || this.musicTracks.get(soundName);
        if (!sound || !sound.buffer) {
            console.warn(`⚠️ AudioManager: Sonido no encontrado: ${soundName}`);
            return null;
        }

        // Crear source y gain nodes
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = sound.buffer;
        source.playbackRate.value = options.playbackRate;

        // Conectar al canal correspondiente
        gainNode.connect(this.channels[options.channel]);
        source.connect(gainNode);

        // Aplicar efectos si es necesario
        if (options.effect && this.effects.has(options.effect)) {
            const effectNode = this.effects.get(options.effect)();
            gainNode.connect(effectNode);
            effectNode.connect(this.channels[options.channel]);
        }

        // Configurar volumen
        const channelVolume = this.volumes[options.channel] || 1.0;
        const finalVolume = channelVolume * this.volumes.master * options.volume;

        // Fade in
        if (options.fadeIn > 0) {
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(
                finalVolume,
                this.audioContext.currentTime + options.fadeIn / 1000
            );
        } else {
            gainNode.gain.value = finalVolume;
        }

        // Loop
        source.loop = options.loop;

        // Reproducir
        source.start(this.audioContext.currentTime + options.startTime);

        // Manejar fade out y stop
        const playbackId = this.generatePlaybackId();
        const playback = {
            source,
            gainNode,
            options,
            stop: () => {
                if (options.fadeOut > 0) {
                    gainNode.gain.linearRampToValueAtTime(
                        0,
                        this.audioContext.currentTime + options.fadeOut / 1000
                    );
                    setTimeout(() => {
                        try {
                            source.stop();
                        } catch (e) {
                            // El source ya puede haber sido detenido
                        }
                    }, options.fadeOut);
                } else {
                    source.stop();
                }
            }
        };

        // Limpiar referencia cuando termine
        source.onended = () => {
            // Limpiar después de un breve delay para permitir fade out
            setTimeout(() => {
                // Referencia se limpiará en el siguiente ciclo
            }, options.fadeOut + 100);
        };

        return playback;
    }

    /**
     * Reproduce usando HTML5 Audio (fallback)
     * @private
     */
    playHTML5Audio(soundName, options) {
        const sound = this.sounds.get(soundName) || this.musicTracks.get(soundName);
        if (!sound || !sound.element) {
            console.warn(`⚠️ AudioManager: Sonido no encontrado: ${soundName}`);
            return null;
        }

        const audio = sound.element.cloneNode();
        audio.volume = this.volumes[options.channel] * this.volumes.master * options.volume;
        audio.loop = options.loop;
        audio.playbackRate = options.playbackRate;

        // Fade in (simplificado)
        if (options.fadeIn > 0) {
            audio.volume = 0;
            const fadeInterval = setInterval(() => {
                if (audio.volume < this.volumes[options.channel] * this.volumes.master * options.volume) {
                    audio.volume = Math.min(
                        audio.volume + 0.1,
                        this.volumes[options.channel] * this.volumes.master * options.volume
                    );
                } else {
                    clearInterval(fadeInterval);
                }
            }, options.fadeIn / 10);
        }

        audio.play().catch(error => {
            console.warn(`⚠️ AudioManager: Error reproduciendo ${soundName}:`, error);
        });

        return {
            element: audio,
            stop: () => {
                if (options.fadeOut > 0) {
                    const fadeInterval = setInterval(() => {
                        if (audio.volume > 0) {
                            audio.volume = Math.max(audio.volume - 0.1, 0);
                        } else {
                            clearInterval(fadeInterval);
                            audio.pause();
                        }
                    }, options.fadeOut / 10);
                } else {
                    audio.pause();
                }
            }
        };
    }

    /**
     * Reproduce música
     * @param {string} trackName - Nombre de la pista
     * @param {Object} options - Opciones de reproducción
     */
    playMusic(trackName, options = {}) {
        const musicOptions = {
            ...options,
            channel: 'music',
            loop: true,
            fadeIn: options.fadeIn || this.config.fadeDuration,
            fadeOut: options.fadeOut || this.config.fadeDuration
        };

        // Detener música actual
        this.stopMusic();

        this.currentMusic = this.play(trackName, musicOptions);
        return this.currentMusic;
    }

    /**
     * Reproduce ambientación
     * @param {string} ambientName - Nombre del ambiente
     * @param {Object} options - Opciones de reproducción
     */
    playAmbient(ambientName, options = {}) {
        const ambientOptions = {
            ...options,
            channel: 'ambient',
            loop: true,
            volume: options.volume || 0.5
        };

        this.stopAmbient();
        this.currentAmbient = this.play(ambientName, ambientOptions);
        return this.currentAmbient;
    }

    /**
     * Reproduce sonido de UI
     * @param {string} soundName - Nombre del sonido
     * @param {Object} options - Opciones de reproducción
     */
    playUI(soundName, options = {}) {
        const uiOptions = {
            ...options,
            channel: 'ui',
            volume: options.volume || 0.6
        };

        return this.play(soundName, uiOptions);
    }

    /**
     * Detiene la música actual
     */
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
    }

    /**
     * Detiene la ambientación actual
     */
    stopAmbient() {
        if (this.currentAmbient) {
            this.currentAmbient.stop();
            this.currentAmbient = null;
        }
    }

    /**
     * Detiene todos los sonidos
     */
    stopAll() {
        this.stopMusic();
        this.stopAmbient();

        // Detener todos los sonidos en reproducción
        if (this.audioContext) {
            // Reiniciar contexto de audio
            this.audioContext.close();
            this.audioContext = new AudioContext();
            this.setupChannels();
        }
    }

    /**
     * Establece el volumen de un canal
     * @param {string} channel - Nombre del canal
     * @param {number} volume - Volumen (0-1)
     */
    setVolume(channel, volume) {
        if (channel === 'master') {
            this.volumes.master = Math.max(0, Math.min(1, volume));
        } else if (this.volumes.hasOwnProperty(channel)) {
            this.volumes[channel] = Math.max(0, Math.min(1, volume));
        }

        this.updateChannelVolumes();

        // Guardar configuración
        if (window.stateManager) {
            window.stateManager.set(`settings.${channel}Volume`, Math.round(volume * 100));
        }
    }

    /**
     * Actualiza los volúmenes de los canales
     * @private
     */
    updateChannelVolumes() {
        if (!this.audioContext) return;

        for (const [channelName, gainNode] of Object.entries(this.channels)) {
            if (gainNode) {
                const channelVolume = this.volumes[channelName] || 1.0;
                const masterVolume = this.volumes.master;
                gainNode.gain.value = channelVolume * masterVolume;
            }
        }
    }

    /**
     * Silencia/activa el audio
     * @param {boolean} muted - true para silenciar
     */
    setMuted(muted) {
        this.isMuted = muted;

        if (this.audioContext && this.masterGain) {
            this.masterGain.gain.value = muted ? 0 : this.volumes.master;
        }

        // También silenciar audio HTML5
        for (const sound of this.sounds.values()) {
            if (sound.element) {
                sound.element.muted = muted;
            }
        }

        for (const track of this.musicTracks.values()) {
            if (track.element) {
                track.element.muted = muted;
            }
        }
    }

    /**
     * Pausa/reanuda el audio
     * @param {boolean} paused - true para pausar
     */
    setPaused(paused) {
        this.isPaused = paused;

        if (this.audioContext) {
            if (paused) {
                this.audioContext.suspend();
            } else {
                this.audioContext.resume();
            }
        }
    }

    /**
     * Crea un filtro paso bajo
     * @private
     */
    createLowPassFilter() {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        return filter;
    }

    /**
     * Crea un filtro paso alto
     * @private
     */
    createHighPassFilter() {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        return filter;
    }

    /**
     * Crea un efecto de reverberación
     * @private
     */
    createReverbEffect() {
        const convolver = this.audioContext.createConvolver();
        const length = this.audioContext.sampleRate * 3;
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }

        convolver.buffer = impulse;
        return convolver;
    }

    /**
     * Crea un efecto de eco
     * @private
     */
    createEchoEffect() {
        const delay = this.audioContext.createDelay();
        const feedback = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();

        delay.delayTime.value = 0.3;
        feedback.gain.value = 0.3;
        wetGain.gain.value = 0.3;

        // Crear el grafo de efecto
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(wetGain);

        return { delay, feedback, wetGain };
    }

    /**
     * Crea un efecto de distorsión
     * @private
     */
    createDistortionEffect() {
        const waveshaper = this.audioContext.createWaveShaper();

        // Crear curva de distorsión
        const samples = 44100;
        const curve = new Float32Array(samples);
        const degree = 20;

        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + degree) * x * 20 * (Math.PI / 180)) / (Math.PI + degree * Math.abs(x));
        }

        waveshaper.curve = curve;
        waveshaper.oversample = '2x';

        return waveshaper;
    }

    /**
     * Configura manejo de interacción de usuario
     * @private
     */
    setupUserInteraction() {
        // El audio context necesita ser activado por interacción del usuario
        const resumeAudioContext = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        };

        document.addEventListener('click', resumeAudioContext, { once: true });
        document.addEventListener('touchstart', resumeAudioContext, { once: true });
        document.addEventListener('keydown', resumeAudioContext, { once: true });
    }

    /**
     * Fallback a HTML5 Audio si Web Audio no está disponible
     * @private
     */
    fallbackToHTML5Audio() {
        console.warn('⚠️ AudioManager: Usando HTML5 Audio como fallback');
        this.config.enableWebAudio = false;

        // Recargar sonidos con HTML5
        if (this.config.preloadSounds) {
            this.preloadSounds();
        }
    }

    /**
     * Genera un ID único para reproducciones
     * @private
     */
    generatePlaybackId() {
        return `playback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Cambia la música según la era
     * @param {string} era - Era actual
     */
    changeMusicByEra(era) {
        const musicMap = {
            'prehistoric': 'music-prehistoric',
            'egyptian': 'music-egyptian',
            'future': 'music-future'
        };

        const trackName = musicMap[era];
        if (trackName) {
            this.playMusic(trackName);
        }
    }

    /**
     * Obtiene estadísticas del sistema de audio
     * @returns {Object} Estadísticas
     */
    getStats() {
        return {
            contextState: this.audioContext ? this.audioContext.state : 'unsupported',
            soundsLoaded: this.sounds.size,
            musicTracksLoaded: this.musicTracks.size,
            currentMusic: this.currentMusic ? 'playing' : 'stopped',
            currentAmbient: this.currentAmbient ? 'playing' : 'stopped',
            isMuted: this.isMuted,
            isPaused: this.isPaused,
            volumes: { ...this.volumes }
        };
    }

    /**
     * Configura el sistema de audio
     * @param {Object} config - Nueva configuración
     */
    configure(config) {
        Object.assign(this.config, config);

        if (config.maxConcurrentSounds !== undefined) {
            // Implementar límite de sonidos concurrentes
        }
    }

    /**
     * Destruye el sistema de audio
     */
    destroy() {
        this.stopAll();

        if (this.audioContext) {
            this.audioContext.close();
        }

        this.sounds.clear();
        this.musicTracks.clear();
        this.effects.clear();

        console.log('🗑️ AudioManager: Sistema de audio destruido');
    }
}

// Exportar para uso global
window.AudioManager = AudioManager;