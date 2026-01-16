/**
 * PrehistoryMinigame - Minijuego de la Prehistoria
 * "Evita los Meteoritos" - Esquiva meteoritos mientras recolectas esporas
 */

class PrehistoryMinigame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isRunning = false;
        this.score = 0;
        this.player = null;
        this.meteors = [];
        this.spores = [];
        
        this.config = {
            width: 800,
            height: 600,
            meteorSpeed: 3,
            sporeSpeed: 2,
            playerSpeed: 5
        };
        
        console.log('🦕 PrehistoryMinigame: Minijuego prehistórico inicializado');
    }
    
    init() {
        this.createCanvas();
        this.setupControls();
        console.log('✅ PrehistoryMinigame: Minijuego listo');
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;
        this.ctx = this.canvas.getContext('2d');
        
        // Estilo prehistórico
        this.canvas.style.background = 'linear-gradient(to bottom, #2d5016, #4a7c59)';
        this.canvas.style.border = '2px solid #8b4513';
        this.canvas.style.borderRadius = '8px';
    }
    
    setupControls() {
        // Controles de teclado
        document.addEventListener('keydown', (e) => {
            if (!this.isRunning) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'a':
                    this.player.x -= this.config.playerSpeed;
                    break;
                case 'ArrowRight':
                case 'd':
                    this.player.x += this.config.playerSpeed;
                    break;
                case 'ArrowUp':
                case 'w':
                    this.player.y -= this.config.playerSpeed;
                    break;
                case 'ArrowDown':
                case 's':
                    this.player.y += this.config.playerSpeed;
                    break;
            }
        });
    }
    
    start() {
        this.isRunning = true;
        this.score = 0;
        
        // Crear jugador
        this.player = {
            x: this.config.width / 2,
            y: this.config.height - 50,
            width: 30,
            height: 30,
            emoji: '🏃'
        };
        
        // Generar meteoritos iniciales
        this.spawnMeteors();
        
        // Iniciar game loop
        this.gameLoop();
        
        console.log('🦕 PrehistoryMinigame: Juego iniciado');
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Actualizar meteoritos
        this.updateMeteors();
        
        // Actualizar esporas
        this.updateSpores();
        
        // Verificar colisiones
        this.checkCollisions();
        
        // Generar nuevos elementos
        if (Math.random() < 0.02) {
            this.spawnMeteor();
        }
        
        if (Math.random() < 0.01) {
            this.spawnSpore();
        }
    }
    
    updateMeteors() {
        for (let i = this.meteors.length - 1; i >= 0; i--) {
            const meteor = this.meteors[i];
            meteor.y += this.config.meteorSpeed;
            
            // Remover meteoritos que salieron de la pantalla
            if (meteor.y > this.config.height) {
                this.meteors.splice(i, 1);
            }
        }
    }
    
    updateSpores() {
        for (let i = this.spores.length - 1; i >= 0; i--) {
            const spore = this.spores[i];
            spore.y += this.config.sporeSpeed;
            
            // Remover esporas que salieron de la pantalla
            if (spore.y > this.config.height) {
                this.spores.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        // Colisiones con meteoritos
        for (let i = this.meteors.length - 1; i >= 0; i--) {
            const meteor = this.meteors[i];
            if (this.isColliding(this.player, meteor)) {
                this.gameOver();
                return;
            }
        }
        
        // Colisiones con esporas
        for (let i = this.spores.length - 1; i >= 0; i--) {
            const spore = this.spores[i];
            if (this.isColliding(this.player, spore)) {
                this.collectSpore(spore, i);
            }
        }
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    collectSpore(spore, index) {
        this.spores.splice(index, 1);
        this.score += 10;
        
        // Efecto visual
        this.createEffect(spore.x, spore.y, '+10');
        
        // Sonido
        if (window.AudioManager) {
            window.AudioManager.play('collect-spore');
        }
    }
    
    spawnMeteors() {
        for (let i = 0; i < 3; i++) {
            this.spawnMeteor();
        }
    }
    
    spawnMeteor() {
        const meteor = {
            x: Math.random() * (this.config.width - 20),
            y: -20,
            width: 20,
            height: 20,
            emoji: '☄️',
            speed: this.config.meteorSpeed + Math.random() * 2
        };
        
        this.meteors.push(meteor);
    }
    
    spawnSpore() {
        const spore = {
            x: Math.random() * (this.config.width - 15),
            y: -15,
            width: 15,
            height: 15,
            emoji: '🌱',
            speed: this.config.sporeSpeed
        };
        
        this.spores.push(spore);
    }
    
    render() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.config.width, this.config.height);
        
        // Renderizar fondo
        this.renderBackground();
        
        // Renderizar jugador
        this.renderPlayer();
        
        // Renderizar meteoritos
        this.renderMeteors();
        
        // Renderizar esporas
        this.renderSpores();
        
        // Renderizar UI
        this.renderUI();
    }
    
    renderBackground() {
        // Fondo con efecto de parallax
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.config.height);
        gradient.addColorStop(0, '#2d5016');
        gradient.addColorStop(1, '#4a7c59');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.config.width, this.config.height);
        
        // Estrellas o partículas
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 20; i++) {
            const x = (Date.now() * 0.01 + i * 50) % this.config.width;
            const y = (i * 30) % this.config.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    renderPlayer() {
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.player.emoji, this.player.x + this.player.width/2, this.player.y + this.player.height/2 + 10);
    }
    
    renderMeteors() {
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        
        for (const meteor of this.meteors) {
            this.ctx.fillText(meteor.emoji, meteor.x + meteor.width/2, meteor.y + meteor.height/2 + 7);
            
            // Efecto de estela
            this.ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
            this.ctx.fillRect(meteor.x, meteor.y + 10, meteor.width, 10);
            this.ctx.fillStyle = 'black';
        }
    }
    
    renderSpores() {
        this.ctx.font = '15px Arial';
        this.ctx.textAlign = 'center';
        
        for (const spore of this.spores) {
            this.ctx.fillText(spore.emoji, spore.x + spore.width/2, spore.y + spore.height/2 + 5);
        }
    }
    
    renderUI() {
        // Puntuación
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Puntos: ${this.score}`, 10, 30);
        
        // Instrucciones
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Usa WASD o flechas para moverte', 10, this.config.height - 20);
    }
    
    createEffect(x, y, text) {
        // Implementar efectos visuales
        console.log(`✨ Efecto en ${x}, ${y}: ${text}`);
    }
    
    gameOver() {
        this.isRunning = false;
        
        // Mostrar mensaje de game over
        this.ctx.font = '48px Arial';
        this.ctx.fillStyle = 'red';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('¡Game Over!', this.config.width/2, this.config.height/2);
        
        // Notificar resultado
        if (window.EventBus) {
            window.EventBus.emit('minigame:completed', {
                minigame: 'meteor-dodge',
                success: false,
                score: this.score,
                rewards: null
            });
        }
        
        console.log(`🦕 PrehistoryMinigame: Game Over - Puntuación: ${this.score}`);
    }
    
    complete() {
        this.isRunning = false;
        
        // Calcular recompensas basadas en puntuación
        const rewards = this.calculateRewards();
        
        // Notificar resultado
        if (window.EventBus) {
            window.EventBus.emit('minigame:completed', {
                minigame: 'meteor-dodge',
                success: true,
                score: this.score,
                rewards: rewards
            });
        }
        
        console.log(`🦕 PrehistoryMinigame: Completado - Puntuación: ${this.score}`);
    }
    
    calculateRewards() {
        const baseRewards = {
            seeds: { 'prehistoric-moss': Math.floor(this.score / 50) },
            resources: {
                'fossils': Math.floor(this.score / 10),
                'temporal-pulses': Math.floor(this.score / 20)
            }
        };
        
        // Bonus por puntuación alta
        if (this.score > 500) {
            baseRewards.seeds['fern-ancient'] = 1;
        }
        
        return baseRewards;
    }
    
    getCanvas() {
        return this.canvas;
    }
    
    destroy() {
        this.isRunning = false;
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        console.log('🦕 PrehistoryMinigame: Minijuego destruido');
    }
}

window.PrehistoryMinigame = PrehistoryMinigame;