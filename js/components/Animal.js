/**
 * Animal - Componente de animal
 * Representa un animal anacrónico en el juego
 */

class Animal {
    constructor(data) {
        // Identificación
        this.id = data.id || this.generateId();
        this.type = data.type || 'unknown';
        this.name = data.name || 'Animal Desconocido';
        this.emoji = data.emoji || '🐾';
        this.era = data.era || 'prehistoric';
        
        // Posición
        this.x = data.x || 0;
        this.y = data.y || 0;
        
        // Estado
        this.happiness = data.happiness || 100;
        this.hunger = data.hunger || 50;
        this.energy = data.energy || 100;
        
        // Producción
        this.production = data.production || null;
        this.lastProduction = data.lastProduction || 0;
        
        // Efectos
        this.effects = data.effects || {};
        
        // Movimiento
        this.movementPattern = data.movementPattern || 'random';
        this.movementSpeed = data.movementSpeed || 1;
        this.targetX = null;
        this.targetY = null;
        
        // Configuración
        this.config = {
            maxHappiness: 100,
            maxHunger: 100,
            maxEnergy: 100,
            decayRate: 0.1,
            ...data.config
        };
        
        console.log(`🐾 Animal: ${this.name} creado`);
    }
    
    generateId() {
        return `animal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    update(deltaTime) {
        this.updateNeeds(deltaTime);
        this.updateMovement(deltaTime);
        this.checkProduction();
    }
    
    updateNeeds(deltaTime) {
        // Decaída de necesidades
        const decayAmount = this.config.decayRate * (deltaTime / 1000);
        
        this.hunger = Math.max(0, this.hunger - decayAmount);
        this.energy = Math.max(0, this.energy - decayAmount * 0.5);
        
        // La felicidad depende de las necesidades
        const needFactor = (this.hunger + this.energy) / 200;
        this.happiness = Math.max(0, needFactor * 100);
    }
    
    updateMovement(deltaTime) {
        switch (this.movementPattern) {
            case 'random':
                this.randomMovement(deltaTime);
                break;
            case 'circular':
                this.circularMovement(deltaTime);
                break;
            case 'wander':
                this.wanderMovement(deltaTime);
                break;
        }
    }
    
    randomMovement(deltaTime) {
        if (!this.targetX || !this.targetY || this.isAtTarget()) {
            this.setRandomTarget();
        }
        
        this.moveTowardsTarget(deltaTime);
    }
    
    circularMovement(deltaTime) {
        const centerX = 400;
        const centerY = 300;
        const radius = 100;
        const speed = 0.001;
        
        const time = Date.now() * speed;
        this.x = centerX + Math.cos(time) * radius;
        this.y = centerY + Math.sin(time) * radius;
    }
    
    wanderMovement(deltaTime) {
        if (Math.random() < 0.01) {
            this.x += (Math.random() - 0.5) * 20;
            this.y += (Math.random() - 0.5) * 20;
        }
        
        // Mantener dentro de límites
        this.x = Math.max(0, Math.min(800, this.x));
        this.y = Math.max(0, Math.min(600, this.y));
    }
    
    setRandomTarget() {
        this.targetX = Math.random() * 800;
        this.targetY = Math.random() * 600;
    }
    
    moveTowardsTarget(deltaTime) {
        if (!this.targetX || !this.targetY) return;
        
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            const moveAmount = this.movementSpeed * (deltaTime / 16);
            this.x += (dx / distance) * moveAmount;
            this.y += (dy / distance) * moveAmount;
        }
    }
    
    isAtTarget() {
        if (!this.targetX || !this.targetY) return true;
        
        const distance = Math.sqrt(
            Math.pow(this.targetX - this.x, 2) + 
            Math.pow(this.targetY - this.y, 2)
        );
        
        return distance < 10;
    }
    
    checkProduction() {
        if (!this.production) return;
        
        const now = Date.now();
        const timeSinceLastProduction = now - this.lastProduction;
        
        if (timeSinceLastProduction >= this.production.interval) {
            this.produce();
            this.lastProduction = now;
        }
    }
    
    produce() {
        if (!this.production || this.happiness < 30) return;
        
        const amount = this.production.amount * (this.happiness / 100);
        
        // Notificar producción
        if (window.EventBus) {
            window.EventBus.emit('animal:produced', {
                animal: this,
                item: this.production.item,
                amount: amount
            });
        }
        
        console.log(`🐾 ${this.name} produjo ${amount} ${this.production.item}`);
    }
    
    feed(amount = 20) {
        this.hunger = Math.min(this.config.maxHunger, this.hunger + amount);
        this.happiness = Math.min(this.config.maxHappiness, this.happiness + 10);
        
        if (window.EventBus) {
            window.EventBus.emit('animal:fed', { animal: this, amount });
        }
    }
    
    pet() {
        this.happiness = Math.min(this.config.maxHappiness, this.happiness + 15);
        this.energy = Math.max(0, this.energy - 5);
        
        if (window.EventBus) {
            window.EventBus.emit('animal:petted', { animal: this });
        }
    }
    
    sleep() {
        this.energy = Math.min(this.config.maxEnergy, this.energy + 30);
        this.hunger = Math.max(0, this.hunger - 10);
        
        if (window.EventBus) {
            window.EventBus.emit('animal:slept', { animal: this });
        }
    }
    
    getInfo() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            emoji: this.emoji,
            era: this.era,
            
            x: this.x,
            y: this.y,
            
            happiness: this.happiness,
            hunger: this.hunger,
            energy: this.energy,
            
            production: this.production,
            lastProduction: this.lastProduction,
            
            effects: this.effects,
            movementPattern: this.movementPattern
        };
    }
    
    serialize() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            emoji: this.emoji,
            era: this.era,
            
            x: this.x,
            y: this.y,
            
            happiness: this.happiness,
            hunger: this.hunger,
            energy: this.energy,
            
            production: this.production,
            lastProduction: this.lastProduction,
            
            effects: this.effects,
            movementPattern: this.movementPattern,
            movementSpeed: this.movementSpeed
        };
    }
    
    static deserialize(data) {
        return new Animal(data);
    }
}

window.Animal = Animal;