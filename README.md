# Chrono Farmer: El Jardín de los Tiempos

Un juego de agricultura temporal donde cultivas plantas de diferentes eras históricas, viajas en el tiempo y restauras el flujo temporal del universo.

## 🎮 Descripción

Eres Nari, un aprendiz del Gremio de Cronojardineros, cuya misión es restaurar el Flujo Temporal del universo, dañado por una catástrofe conocida como "El Latido Roto". Para ello, debes viajar entre eras (prehistoria, antiguo Egipto, edad futurista, etc.) recolectando "Semillas del Tiempo", cultivándolas en tu granja interdimensional y resolviendo misterios en cada época.

## 🌟 Características

### Mecánicas Principales

- **🌱 Agricultura Temporal**: Cada planta representa una era histórica con mecánicas únicas
- **⏰ Viajes en el Tiempo**: Explora diferentes eras con minijuegos y misiones especiales
- **🐾 Animales Anacrónicos**: Cria criaturas como Mamuts Enanos y Robot-Ovejas
- **🎨 Personalización**: Decora tu granja flotante con elementos de diferentes épocas
- **⚡ Eventos Temporales**: Tormentas temporales, paradojas y fenómenos temporales

### Eras Disponibles

- **Era Primigenia** 🦕: Musgo Prehistórico, cuevas y dinosaurios
- **Antiguo Egipto** 👑: Loto Egipcio, pirámides y el Nilo
- **Año 3025** 🚀: Cristales del Futuro, tecnología cuántica y hoverboards

## 🛠️ Arquitectura Técnica

### Estructura del Proyecto

```
chrono-farmer/
├── index.html              # Archivo HTML principal
├── css/
│   ├── main.css           # Estilos principales
│   ├── components.css     # Estilos de componentes
│   └── animations.css     # Animaciones
├── js/
│   ├── main.js            # Archivo principal del juego
│   ├── core/              # Sistemas core
│   │   ├── GameEngine.js
│   │   ├── StateManager.js
│   │   ├── EventBus.js
│   │   ├── DOMRenderer.js
│   │   ├── AudioManager.js
│   │   └── SaveSystem.js
│   ├── systems/           # Sistemas de juego
│   │   ├── PlantSystem.js
│   │   ├── TimeTravelSystem.js
│   │   ├── TimeSystem.js
│   │   ├── AnimalSystem.js
│   │   ├── ResourceSystem.js
│   │   ├── WeatherSystem.js
│   │   └── AchievementSystem.js
│   ├── components/        # Componentes
│   │   ├── Plant.js
│   │   ├── Plot.js
│   │   └── Animal.js
│   ├── data/              # Datos del juego
│   │   ├── plants.js
│   │   └── eras.js
│   └── minigames/         # Minijuegos
│       ├── PrehistoryMinigame.js
│       ├── RomeMinigame.js
│       └── FutureMinigame.js
└── assets/                # Recursos
    ├── images/
    └── audio/
```

### Principios de Diseño

#### Separación de Responsabilidades

- **Sistemas Core**: Manejan funcionalidades fundamentales del motor
- **Sistemas de Juego**: Implementan mecánicas específicas
- **Componentes**: Representan entidades del juego
- **Datos**: Configuración y contenido del juego

#### Modularización

Cada sistema es independiente y se comunica a través del EventBus:

```javascript
// Sistema emite evento
window.EventBus.emit('plant:planted', { plotId: 5, plant: plantData });

// Otro sistema escucha
window.EventBus.on('plant:planted', (data) => {
    // Manejar evento
});
```

#### Separación del DOM

Toda interacción con el DOM está centralizada en DOMRenderer:

```javascript
// ❌ No hacer esto en otros sistemas:
document.querySelector('#farm-grid').innerHTML = '';

// ✅ Hacer esto:
window.renderer.renderFarmGrid(plots, clickHandler);
```

## 🚀 Cómo Jugar

### Iniciar el Juego

1. Abre `index.html` en un navegador web moderno
2. El juego comenzará automáticamente
3. Sigue el tutorial para aprender las mecánicas básicas

### Controles Básicos

- **Click izquierdo**: Interactuar con elementos del juego
- **Herramientas**: Selecciona una herramienta y click en los plots
  - 🌱 Plantar: Planta semillas en plots vacíos
  - 💧 Regar: Riega tus plantas
  - 🌾 Cosechar: Recolecta plantas listas
  - ⚡ Acelerar: Usa pulsos temporales para acelerar el crecimiento

### Viajar en el Tiempo

1. Click en el Portal Temporal
2. Selecciona una era desbloqueada
3. ¡Explora nuevas plantas y misiones!

## 🎯 Objetivos

- **Restaura el Flujo Temporal**: Completa misiones en cada era
- **Colecciona Plantas**: Desbloquea todas las especies temporales
- **Construye tu Granja**: Personaliza tu espacio interdimensional
- **Domina el Tiempo**: Conviértete en Maestro Cronojardinero

## 🧪 Desarrollo

### Configuración del Proyecto

No se requieren dependencias externas. El juego está construido con:

- **HTML5**: Estructura semántica del juego
- **CSS3**: Estilos con metodología BEM
- **JavaScript Vanilla**: Sin frameworks, puro ES6+

### Scripts de Desarrollo

```bash
# Servir el juego localmente
python -m http.server 8000

# Abrir en el navegador
http://localhost:8000
```

### Debug y Testing

El juego incluye herramientas de debug accesibles desde la consola:

```javascript
// Mostrar estadísticas del juego
debug.showStats()

// Obtener estado actual
debug.getState()

// Exportar datos de guardado
debug.exportSave()

// Importar datos de guardado
debug.importSave(data)

// Limpiar todos los datos guardados
debug.clearSave()
```

## 🎨 Estilo Visual

- **Arte 2D**: Estilo ilustrado tipo "Ghibli meets steampunk"
- **Animaciones Suaves**: Transiciones CSS y animaciones JavaScript
- **Theming Dinámico**: Cada era tiene su propio tema visual
- **Responsive**: Adaptable a diferentes tamaños de pantalla

## 🔊 Audio

- **Música Adaptativa**: Cambia según la era en la que estés
- **Efectos de Sonido**: Feedback auditivo para todas las acciones
- **Ambientación**: Sonidos ambientales específicos de cada era

## 💾 Guardado

El juego guarda automáticamente:

- Estado de la granja
- Inventario del jugador
- Progreso y logros
- Configuración

## 🌐 Compatibilidad

- **Navegadores**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Características Requeridas**: ES6+, Web Audio API, LocalStorage
- **Dispositivos**: Desktop y móviles (touch-friendly)

## 📈 Escalabilidad

El proyecto está diseñado para escalar fácilmente:

### Escalado Vertical

- Agregar nuevas plantas y eras
- Implementar más minijuegos
- Añadir efectos visuales y sonoros complejos

### Escalado Horizontal

- Agregar nuevos sistemas (comercio, social, etc.)
- Implementar múltiples granjas
- Añadir modos de juego adicionales

## 🤝 Contribuir

Este es un proyecto educativo que demuestra:

- Arquitectura de software modular
- Mejores prácticas de JavaScript
- Desarrollo de juegos web
- Gestión de estado en aplicaciones complejas

## 📄 Licencia

Este proyecto es de código abierto para fines educativos.

## 🙏 Créditos

**Eslogan**: "Cultiva el pasado, cosecha el futuro."

**Inspiración**: Juegos de agricultura, ciencia ficción y viajes en el tiempo

---

Desarrollado con ❤️ por y para la comunidad de desarrolladores de juegos web.