/**
 * AnimalSystem - Sistema de animales
 * Responsabilidad: Manejar la crianza y producción de animales anacrónicos
 */

class AnimalSystem {
    constructor() {
        this.animals = new Map();
        this.productionTimers = new Map();
        
        this.config = {
            maxAnimals: 10,
            productionCheckInterval: 5000 // 5 segundos
        };
        
        console.log('🐾 AnimalSystem: Sistema de animales inicializado');
    }
    
    init() {
        console.log('✅ AnimalSystem: Sistema listo');
    }
    
    update(deltaTime) {
        // Actualizar producción de animales
        for (const [animalId, animal] of this.animals) {
            this.updateAnimal(animal, deltaTime);
        }
    }
    
    updateAnimal(animal, deltaTime) {
        // Lógica de actualización de animales
    }
    
    addAnimal(animalType, position) {
        // Implementar agregar animal
    }
    
    removeAnimal(animalId) {
        // Implementar remover animal
    }
    
    collectProduction(animalId) {
        // Implementar recolección de producción
    }
    
    destroy() {
        this.animals.clear();
        this.productionTimers.clear();
        console.log('🗑️ AnimalSystem: Sistema de animales destruido');
    }
}

window.AnimalSystem = AnimalSystem;