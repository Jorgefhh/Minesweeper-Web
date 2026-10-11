// ============================================================================
//  menu.js — Maneja la selección de dificultad y la transición al juego
//  inline dentro de menu.html, además de toda la funcionalidad del panel
//  de opciones (dificultad, zoom, pantalla completa, nuevo juego).
// ============================================================================

// ─── Referencias DOM ───
const difficultyCards = Array.from(document.querySelectorAll('.diff-card'));
const startButton = document.getElementById('start-button');
const guestLogin = document.getElementById('guest-login');
const accountPreview = document.getElementById('account-preview');
const usernameEl = document.getElementById('username');
const xpValue = document.getElementById('xp-value');
const xpProgress = document.getElementById('xp-progress');

const menuPanel = document.getElementById('menu-panel');
const gameArea = document.getElementById('game-area');

// ─── Sesión ───
const hasSession = Boolean(localStorage.getItem('token'));
guestLogin.hidden = hasSession;
accountPreview.hidden = !hasSession;

if (hasSession) {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const nombre = usuario.nombreUsuarios;
    const experiencia = Number(usuario.experiencia ?? 0);
    if (nombre) usernameEl.textContent = nombre;
    xpValue.textContent = experiencia;
    xpProgress.style.width = `${Math.min(experiencia, 100)}%`;
}

// ─── Selección de dificultad en el menú de inicio ───
let dificultad = null;
difficultyCards.forEach(card => {
    card.addEventListener('click', () => {
        dificultad = parseInt(card.dataset.index, 10);
        selectDifficulty(dificultad);
    });
});

function selectDifficulty(index) {
    const nombreDificultad = ["facil", "intermedio", "dificil"][index];
    localStorage.setItem("dificultad", nombreDificultad);
    difficultyCards.forEach((card, cardIndex) => {
        const isSelected = cardIndex === index;
        card.classList.toggle('selected', isSelected);
        card.setAttribute('aria-pressed', String(isSelected));
    });
}

// ─── Botón Empezar → Mostrar tablero inline ───
startButton.addEventListener('click', () => {
    const dificultadActual = localStorage.getItem("dificultad") || "facil";
    if (dificultadActual && ["facil", "intermedio", "dificil"].includes(dificultadActual)) {
        mostrarJuego(dificultadActual);
    } else {
        alert('Seleccioná una dificultad antes de empezar');
    }
});

function mostrarJuego(dificultadActual) {
    // Sincronizar el botón segmentado del panel con la dificultad elegida
    sincronizarSegDificultad(dificultadActual);

    // Fade-out el menú, fade-in el tablero
    menuPanel.classList.add('fade-out');
    menuPanel.addEventListener('animationend', () => {
        menuPanel.hidden = true;
        gameArea.hidden = false;
        gameArea.classList.add('fade-in');

        // Iniciar / reiniciar el juego con la dificultad elegida
        iniciarJuegoInline();
    }, { once: true });
}

function iniciarJuegoInline() {
    juego.reiniciarEstado();
    pintar();
}

// ═══════════════════════════════════════════════════
//  PANEL DE OPCIONES — Funcionalidad
// ═══════════════════════════════════════════════════

// ─── Dificultad segmentada ───
function sincronizarSegDificultad(dificultadStr) {
    document.querySelectorAll('#seg-dificultad button').forEach(b => {
        b.classList.toggle('on', b.dataset.d === dificultadStr);
    });
}

document.querySelectorAll('#seg-dificultad button').forEach(b => {
    b.addEventListener('click', () => {
        const nuevaDificultad = b.dataset.d;
        // Actualizar visual del panel
        document.querySelectorAll('#seg-dificultad button').forEach(x => x.classList.remove('on'));
        b.classList.add('on');

        // Guardar y recargar el juego con la nueva dificultad
        localStorage.setItem("dificultad", nuevaDificultad);
        juego.reiniciarEstado();
        reiniciarJuego();
    });
});

// ─── Zoom ───
let zoom = 100;
const ZOOM_MIN = 70;
const ZOOM_MAX = 130;
const ZOOM_STEP = 10;
const zoomValEl = document.getElementById('zoomVal');
const zoomBoardZone = document.getElementById('board-zone');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');

function setZoom(v) {
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v));
    zoomValEl.textContent = zoom + '%';
    zoomBoardZone.style.zoom = zoom / 100;
    // Desactivar visualmente los botones en los límites
    zoomInBtn.style.opacity = zoom >= ZOOM_MAX ? '0.35' : '1';
    zoomInBtn.style.pointerEvents = zoom >= ZOOM_MAX ? 'none' : 'auto';
    zoomOutBtn.style.opacity = zoom <= ZOOM_MIN ? '0.35' : '1';
    zoomOutBtn.style.pointerEvents = zoom <= ZOOM_MIN ? 'none' : 'auto';
}

zoomInBtn.addEventListener('click', () => setZoom(zoom + ZOOM_STEP));
zoomOutBtn.addEventListener('click', () => setZoom(zoom - ZOOM_STEP));

// ─── Pantalla completa ───
document.getElementById('btnFull').addEventListener('click', () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen();
    }
});

// ─── Botón Nuevo juego (equivalente al botón de carita) ───
document.getElementById('btnNuevo').addEventListener('click', async () => {
    const btn = document.getElementById('reiniciar');
    if (btn) {
        btn.classList.add('activado');
        setTimeout(() => btn.classList.remove('activado'), 200);
    }
    await reiniciarJuego();
});

// ─── Pistas (placeholder: decrementa el badge) ───
document.getElementById('btnPista').addEventListener('click', () => {
    const p = document.getElementById('pistas');
    const n = +p.textContent;
    if (n > 0) p.textContent = n - 1;
});

// ─── Cómo jugar (placeholder) ───
document.getElementById('btnAyuda').addEventListener('click', () => {
    alert(
        '🎮 Cómo jugar Minesweeper Neon\n\n' +
        '• Click izquierdo: Revela una celda.\n' +
        '• Click derecho: Coloca o quita una bandera.\n' +
        '• Los números indican cuántas minas hay alrededor.\n' +
        '• Revela todas las celdas sin minas para ganar.\n' +
        '• Si pisás una mina, ¡perdés!'
    );
});

// --- Navegaci�n a Clasificaci�n ---
const navClasificacion = document.getElementById('nav-clasificacion');
if (navClasificacion) {
    navClasificacion.addEventListener('click', (e) => {
        e.preventDefault();
        const section = document.getElementById('clasificacion-section');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    });
}
