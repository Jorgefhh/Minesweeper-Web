//Este código contiene el modelo lógico y el renderizado del juego

// // Variables globales
// const ORDENC = 8;
// const ORDENF = 8;

const DIFICULTAD = {
  facil: { filas: 9, columnas: 9, minas: 10 },
  intermedio: { filas: 19, columnas: 16, minas: 40 },
  dificil: { filas: 16, columnas: 30, minas: 99 }
}

//Estructura de datos que guarda el log de la partida
const traza = [];

// Estado del juego encapsulado en un objeto
const juego = {
  estado: "inicial", // "inicial", "jugando", "ganado", "perdido"
  dificultad: "facil", //"facil", "medio","dificil"
  tablero: [],
  filas: null,
  columnas: null,
  celdas: [],
  aciertos: 0,
  minas: 10,
  minasRestantes: 10,
  colExplotada: null,
  filaExplotada: null,
  intervalo: null,
  inicio: 0.0,
  minutos: 0,
  segundos: 0,
  clicksIzquierdo: 0,
  clicksDerecho: 0,
  expGanada: 0,
  idPartida: null,
  seed: [],

  // Métodos útiles
  haTerminado() {
    return this.estado === "ganado" || this.estado === "perdido";
  },
  haGanado() {
    return this.estado === "ganado";
  },
  haPerdido() {
    return this.estado === "perdido";
  },
  reiniciarEstado() {
    this.aciertos = 0;
    this.inicio = 0.0;
    this.minutos = 0;
    this.segundos = 0;
    this.clicksIzquierdo = 0;
    this.clicksDerecho = 0;
    this.expGanada = 0;
    this.fechaUltimaPartida = "-";
    cargarDificultad();
    this.minasRestantes = this.minas;
    actualizarConteoBombas();
    actualizarRelojUI();
    ocultarEstadisticasUI();
    // Restaurar carita sonriente original
    const btn = document.getElementById("reiniciar");
    if (btn) {
      const assetBase = window.location.pathname.includes('/inicio/')
        ? '../../assets/img/' : '../../assets/img/';
      btn.style.backgroundImage = `url('${assetBase}SMILE.png')`;
    }
  },
  mostrarEstadisticasUI(datosBackend = null) {
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    // Usar datos del backend si están disponibles; caso contrario, contadores locales
    const clicksIzq = datosBackend?.clicksIzquierdo ?? datosBackend?.clicksIzq ?? this.clicksIzquierdo;
    const clicksDer = datosBackend?.clicksDerecho ?? datosBackend?.clicksDer ?? this.clicksDerecho;
    const exp = datosBackend?.exp ?? datosBackend?.expGanada ?? datosBackend?.experiencia ?? this.expGanada;

    // El tiempo siempre debe mostrarse en segundos con 3 cifras decimales
    let tiempoSegundos;
    if (this.haGanado() && datosBackend?.tiempo !== undefined && datosBackend?.tiempo !== null) {
      tiempoSegundos = typeof datosBackend.tiempo === "number"
        ? datosBackend.tiempo.toFixed(3)
        : String(datosBackend.tiempo);
    } else {
      tiempoSegundos = this.inicio > 0
        ? ((performance.now() - this.inicio) / 1000).toFixed(3)
        : Number(this.segundos).toFixed(3);
    }

    const modoTexto = (this.dificultad || "fácil");
    const modoFormateado = modoTexto.charAt(0).toUpperCase() + modoTexto.slice(1);

    setText("estad-clicks-izq", clicksIzq);
    setText("estad-clicks-der", clicksDer);
    setText("estad-tiempo", `${tiempoSegundos} s`);
    setText("estad-fecha", this.fechaUltimaPartida || new Date().toLocaleString());
    setText("estad-modo", modoFormateado);
    setText("estad-exp", exp);

    const panel = document.querySelector(".panel-estadisticas");
    if (panel) {
      panel.classList.add("visible");
    }
  },
  ocultarEstadisticasUI() {
    ocultarEstadisticasUI();
  },
  actualizarEstadisticasUI(datosBackend = null) {
    if (this.haTerminado()) {
      this.mostrarEstadisticasUI(datosBackend);
    } else {
      actualizarConteoBombas();
      actualizarRelojUI();
    }
  }
};



function cargarDificultad() {
  //Solicitar la dificultad deseado o la fácil por defecto.
  const dificultadActual = localStorage.getItem("dificultad") || "facil";
  const config = DIFICULTAD[dificultadActual] || DIFICULTAD.facil;

  juego.dificultad = dificultadActual in DIFICULTAD ? dificultadActual : "facil";
  juego.filas = config.filas;
  juego.columnas = config.columnas;
  juego.minas = config.minas;
  aplicarDimensionTablero();
}

function aplicarDimensionTablero() {
  const columnas = juego.columnas || 9;
  const filas = juego.filas || 9;
  const maxDim = Math.max(columnas, filas);
  const tamanioCelda = Math.max(32, Math.min(64, Math.floor(64 * Math.sqrt(9 / maxDim))));
  const root = document.documentElement;

  //Esto define la cantidad de filas y columnas al código css para evitar hardcode
  root.style.setProperty("--cols", columnas);
  root.style.setProperty("--rows", filas);
  root.style.setProperty("--celda-size", `${tamanioCelda}px`);
}


function actualizarConteoBombas() {
  const bombaEl = document.getElementById("bombas-restantes");
  if (bombaEl) {
    bombaEl.textContent = String(Math.max(0, juego.minasRestantes)).padStart(3, '0');
  }
}

function actualizarRelojUI() {
  const tiempoEl = document.getElementById("tiempo");
  if (tiempoEl) {
    tiempoEl.textContent = String(Math.min(juego.segundos, 999)).padStart(3, '0');
  }
}

function ocultarEstadisticasUI() {
  const panel = document.querySelector(".panel-estadisticas");
  if (panel) {
    panel.classList.remove("visible");
  }
}