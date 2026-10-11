# ⚡ Minesweeper Neon - Frontend

Módulo cliente para **Minesweeper Neon**. Desarrollado con el estándar **Vanilla Web Stack** (HTML5, CSS3, JavaScript ES6+), sin sobrecarga de frameworks, priorizando rendimiento nativo, modularidad y estética cyberpunk/retro-neón.

---

## 📁 Estructura del Módulo

La aplicación cliente está organizada de forma modular según el dominio de funcionalidad:

```
Frontend/
├── assets/                    # Recursos gráficos (iconos de banderas, cronómetros, etc.)
├── playwright.config.js       # Configuración para pruebas automatizadas E2E
├── package.json               # Dependencias de testing (Playwright)
├── tests/                     # Suites de pruebas de interfaz
└── src/
    ├── api.js                 # Cliente unificado HTTP (Fetch API + Bearer JWT)
    ├── styles.css             # Variables globales CSS, tipografías y reset
    │
    ├── auth/                  # Módulo de Autenticación
    │   ├── login.html         # Pantalla de inicio de sesión
    │   ├── registrar.html     # Pantalla de registro de usuario
    │   ├── auth.css           # Estilos de formularios y validaciones visuales
    │   └── auth.js            # Lógica de validación de campos y llamadas a /usuarios
    │
    ├── inicio/                # Módulo Principal y Menú
    │   ├── menu.html          # Vista de inicio, selección de tablero y ranking
    │   ├── menu.css           # Layout del menú, barra de navegación y modales
    │   ├── menu.js            # Interacción de menús, estado del usuario y vistas
    │   └── clasificacion.js   # Renderizado de tabla de récords y filtros (país/mes)
    │
    └── juego/                 # Módulo del Tablero y Mecánicas del Juego
        ├── panel_tablero.html # Vista del tablero
        ├── juego.js           # Inicialización del ciclo de vida de la partida
        ├── logica.js          # Lógica interna de casillas, minas y despejes
        ├── click.js           # Interacciones del ratón (izquierdo, banderas, chording)
        ├── plantilla.js       # Construcción dinámica de la cuadrícula DOM
        ├── stats.js           # Recopilación de traza de movimientos y métricas
        └── styles.css         # Estilos visuales del tablero, celdas y efectos neón
```

---

## 🎨 Sistema de Diseño y Estilos

El diseño visual está centralizado en variables personalizables en `src/styles.css` y hojas de estilo por módulo:
- **Paleta Neón**: Uso de contrastes oscuros profundos con acentos neón para dar la vibra retro-arcade.
- **Tipografía Digital**: Integración de la fuente digital `@fontsource/dseg7-classic` para el cronómetro y el contador de minas.
- **Adaptabilidad y Feedback**: Animaciones sutiles en hover, estados activos, modales transparentes y soporte para pantalla completa y zoom.

---

## 🔌 Conexión con la API (`api.js`)

Todas las llamadas hacia el backend están centralizadas en `src/api.js`. Esto evita dispersar peticiones `fetch()` en la lógica de interfaz y garantiza:
1. **Inyección automática del Token**: Inclusión de la cabecera `Authorization: Bearer <token>` cuando el usuario está autenticado.
2. **Manejo de Expiración**: Si el servidor responde con `401 Unauthorized`, la sesión se limpia y se redirige automáticamente al login.
3. **Punto central de configuración**: Cambiar la URL del servidor se realiza únicamente modificando `API_BASE_URL` en `api.js`:
   ```javascript
   const API_BASE_URL = "http://localhost:8080";
   ```

---

## 🚀 Ejecución Local

Podés servir este módulo con cualquier servidor web estático:

1. **Con Live Server (VS Code)**:
   - Clic derecho en `src/inicio/menu.html` o `src/auth/login.html` → **Open with Live Server**.

2. **Con Node (`npx serve`)**:
   ```bash
   npx serve .
   ```

3. **Con Python**:
   ```bash
   python -m http.server 3000
   ```

---

## 🧪 Pruebas Automatizadas

Las pruebas de extremo a extremo (E2E) están implementadas con **Playwright**:

```bash
# Instalar dependencias
npm install

# Ejecutar tests
npx playwright test

# Ejecutar con interfaz visual
npx playwright test --ui
```
