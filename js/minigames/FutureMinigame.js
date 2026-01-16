/**
 * FutureMinigame - Minijuego del Futuro
 * "Carrera de Hoverboards" - Corre entre drones recolectando cristales de datos
 */

class FutureMinigame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isRunning = false;
        this.player = null;
        this.drones = [];
        this.crystals = [];
        this.obstacles = [];
        
        this.config = {
            width: 800,
            height: 600,
            playerSpeed: 6,
            droneSpeed: 4,
            crystalSpeed: 3
        };
        
        console.log('🚀 FutureMinigame: Minijuego futurista inicializado');
    }
    
    init() {
        this.createCanvas();
        this.setupControls();
        console.log('✅ FutureMinigame: Minijuego listo');
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;
        this.ctx = this.canvas.getContext('2d');
        
        // Estilo futurista
        this.canvas.style.background = 'linear-gradient(to bottom, #0f0c29, #24243e)';
        this.canvas.style.border = '2px solid #00ffff';
        this.canvas.style.borderRadius = '8px';
        this.canvas.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5)';
    }
    
    setupControls() {
        // Controles de teclado para hoverboard
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
        this.timeElapsed = 0;
        
        // Crear jugador (hoverboard)
        this.player = {
            x: 50,
            y: this.config.height / 2,
            width: 40,
            height: 20,
            emoji: '🏄'
        };
        
        // Generar drones y obstáculos
        this.spawnInitialElements();
        
        // Iniciar game loop
        this.gameLoop();
        
        console.log('🚀 FutureMinigame: Juego iniciado');
    }
    
    spawnInitialElements() {
        for (let i = 0; i < 5; i++) {
            this.spawnDrone();
        }
        
        for (let i = 0; i < 3; i++) {
            this.spawnObstacle();
        }
        
        for (let i = 0; i < 10; i++) {
            this.spawnCrystal();
        }
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.timeElapsed += 16; // Aproximadamente 60 FPS
        
        // Actualizar drones
        this.updateDrones();
        
        // Actualizar cristales
        this.updateCrystals();
        
        // Actualizar obstáculos
        this.updateObstacles();
        
        // Verificar colisiones
        this.checkCollisions();
        
        // Generar nuevos elementos
        this.spawnNewElements();
        
        // Verificar tiempo límite (60 segundos)
        if (this.timeElapsed >= 60000) {
            this.complete();
        }
    }
    
    updateDrones() {
        for (let i = this.drones.length - 1; i >= 0; i--) {
            const drone = this.drones[i];
            drone.x -= drone.speed;
            
            // Movimiento sinusoidal
            drone.y += Math.sin(drone.x * 0.01) * 2;
            
            // Remover drones que salieron de la pantalla
            if (drone.x + drone.width < 0) {
                this.drones.splice(i, 1);
            }
        }
    }
    
    updateCrystals() {
        for (let i = this.crystals.length - 1; i >= 0; i--) {
            const crystal = this.crystals[i];
            crystal.x -= crystal.speed;
            crystal.rotation += 0.05;
            
            // Remover cristales que salieron de la pantalla
            if (crystal.x + crystal.width < 0) {
                this.crystals.splice(i, 1);
            }
        }
    }
    
    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= obstacle.speed;
            
            // Remover obstáculos que salieron de la pantalla
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
    }
    
    spawnDrone() {
        const drone = {
            x: this.config.width,
            y: Math.random() * (this.config.height - 100) + 50,
            width: 30,
            height: 20,
            speed: this.config.droneSpeed + Math.random() * 2,
            emoji: '🚁'
        };
        
        this.drones.push(drone);
    }
    
    spawnCrystal() {
        const crystal = {
            x: this.config.width,
            y: Math.random() * (this.config.height - 100) + 50,
            width: 20,
            height: 20,
            speed: this.config.crystalSpeed,
            rotation: 0,
            emoji: '💎'
        };
        
        this.crystals.push(crystal);
    }
    
    spawnObstacle() {
        const obstacle = {
            x: this.config.width,
            y: Math.random() * (this.config.height - 100) + 50,
            width: 40,
            height: 40,
            speed: 2 + Math.random() * 2,
            emoji: '⚡'
        };
        
        this.obstacles.push(obstacle);
    }
    
    spawnNewElements() {
        // Generar drones
        if (Math.random() < 0.01) {
            this.spawnDrone();
        }
        
        // Generar cristales
        if (Math.random() < 0.02) {
            this.spawnCrystal();
        }
        
        // Generar obstáculos
        if (Math.random() < 0.008) {
            this.spawnObstacle();
        }
    }
    
    checkCollisions() {
        // Colisiones con drones (obstáculos móviles)
        for (const drone of this.drones) {
            if (this.isColliding(this.player, drone)) {
                this.gameOver();
                return;
            }
        }
        
        // Colisiones con obstáculos estáticos
        for (const obstacle of this.obstacles) {
            if (this.isColliding(this.player, obstacle)) {
                this.gameOver();
                return;
            }
        }
        
        // Colisiones con cristales
        for (let i = this.crystals.length - 1; i >= 0; i--) {
            const crystal = this.crystals[i];
            if (this.isColliding(this.player, crystal)) {
                this.collectCrystal(crystal, i);
            }
        }
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    collectCrystal(crystal, index) {
        this.crystals.splice(index, 1);
        this.score += 25;
        
        // Efecto visual
        this.createEffect(crystal.x, crystal.y, '+25');
        
        // Sonido
        if (window.AudioManager) {
            window.AudioManager.play('collect-crystal');
        }
    }
    
    createEffect(x, y, text) {
        // Implementar efectos visuales flotantes
        console.log(`✨ Efecto en ${x}, ${y}: ${text}`);
    }
    
    render() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.config.width, this.config.height);
        
        // Renderizar fondo con efectos
        this.renderBackground();
        
        // Renderizar cristales
        this.renderCrystals();
        
        // Renderizar drones
        this.renderDrones();
        
        // Renderizar obstáculos
        this.renderObstacles();
        
        // Renderizar jugador
        this.renderPlayer();
        
        // Renderizar UI
        this.renderUI();
    }
    
    renderBackground() {
        // Fondo con gradiente espacial
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.config.height);
        gradient.addColorStop(0, '#0f0c29');
        gradient.addColorStop(0.5, '#302b63');
        gradient.addColorStop(1, '#24243e');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.config.width, this.config.height);
        
        // Estrellas animadas
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const time = Date.now() * 0.001;
        for (let i = 0; i < 30; i++) {
            const x = (Math.sin(time + i) * 100 + i * 30) % this.config.width;
            const y = (Math.cos(time + i) * 50 + i * 20) % this.config.height;
            const size = Math.sin(time + i) * 2 + 2;
            this.ctx.fillRect(x, y, size, size);
        }
        
        // Líneas de grid futurista
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.config.width; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.config.height);
            this.ctx.stroke();
        }
    }
    
    renderCrystals() {
        for (const crystal of this.crystals) {
            this.ctx.save();
            this.ctx.translate(crystal.x + crystal.width/2, crystal.y + crystal.height/2);
            this.ctx.rotate(crystal.rotation);
            
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(crystal.emoji, 0, 7);
            
            // Brillo
            this.ctx.shadowColor = '#00ffff';
            this.ctx.shadowBlur = 10;
            this.ctx.fillText(crystal.emoji, 0, 7);
            this.ctx.shadowBlur = 0;
            
            this.ctx.restore();
        }
    }
    
    renderDrones() {
        this.ctx.font = '25px Arial';
        this.ctx.textAlign = 'center';
        
        for (const drone of this.drones) {
            this.ctx.fillText(drone.emoji, drone.x + drone.width/2, drone.y + drone.height/2 + 7);
            
            // Propulsores
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.fillRect(drone.x - 5, drone.y + drone.height/2, 5, 3);
            this.ctx.fillStyle = 'black';
        }
    }
    
    renderObstacles() {
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        
        for (const obstacle of this.obstacles) {
            this.ctx.fillText(obstacle.emoji, obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2 + 10);
            
            // Efecto de electricidad
            this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(obstacle.x - 5, obstacle.y - 5, obstacle.width + 10, obstacle.height + 10);
        }
    }
    
    renderPlayer() {
        this.ctx.save();
        this.ctx.translate(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
        
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.player.emoji, 0, 10);
        
        // Estela del hoverboard
        this.ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        this.ctx.fillRect(-20, 8, 40, 4);
        
        this.ctx.restore();
    }
    
    renderUI() {
        // Panel de información
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 80);
        
        // Puntuación
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#00ffff';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Datos: ${this.score}`, 20, 40);
        
        // Tiempo
        const timeLeft = Math.max(0, 60 - Math.floor(this.timeElapsed / 1000));
        this.ctx.fillText(`Tiempo: ${timeLeft}s`, 20, 70);
        
        // Instrucciones
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('Usa WASD o flechas para moverte', 10, this.config.height - 30);
        this.ctx.fillText('¡Recolecta cristales y evita obstáculos!', 10, this.config.height - 10);
    }
    
    gameOver() {
        this.isRunning = false;
        
        // Pantalla de game over
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.config.width, this.config.height);
        
        this.ctx.font = '48px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('¡Sistema Crítico!', this.config.width/2, this.config.height/2 - 50);
        this.ctx.fillText('Datos Corrompidos', this.config.width/2, this.config.height/2);
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Puntuación: ${this.score}`, this.config.width/2, this.config.height/2 + 50);
        
        // Notificar resultado
        if (window.EventBus) {
            window.EventBus.emit('minigame:completed', {
                minigame: 'hoverboard-race',
                success: false,
                score: this.score,
                rewards: null
            });
        }
        
        console.log(`🚀 FutureMinigame: Game Over - Puntuación: ${this.score}`);
    }
    
    complete() {
        this.isRunning = false;
        
        // Pantalla de victoria
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.config.width, this.config.height);
        
        this.ctx.font = '48px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('¡Misión Completada!', this.config.width/2, this.config.height/2 - 50);
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Datos Recolectados: ${this.score}`, this.config.width/2, this.config.height/2 + 20);
        
        const rewards = this.calculateRewards();
        
        // Notificar resultado
        if (window.EventBus) {
            window.EventBus.emit('minigame:completed', {
                minigame: 'hoverboard-race',
                success: true,
                score: this.score,
                rewards: rewards
            });
        }
        
        console.log(`🚀 FutureMinigame: Completado - Puntuación: ${this.score}`);
    }
    
    calculateRewards() {
        const baseRewards = {
            seeds: { 'crystal-future': Math.floor(this.score / 100) },
            resources: {
                'data-crystals': Math.floor(this.score / 25),
                'temporal-pulses': Math.floor(this.score / 50)
            }
        };
        
        // Bonus por puntuación alta
        if (this.score > 1000) {
            baseRewards.seeds['neuro-plant'] = 1;
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
        console.log('🚀 FutureMinigame: Minijuego destruido');
    }
}

window.FutureMinigame = FutureMinigame;