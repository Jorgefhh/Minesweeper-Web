/********************** FLUJO PRINCIPAL DE CÓDIGO  **********************/
// Solo auto-inicializar si estamos en panel_tablero.html (no en menu.html)
const _esMenuPage = window.location.pathname.includes('/inicio/');
if (!_esMenuPage) {
  // Inicializar tablero
  juego.reiniciarEstado();
  //Ejecuto un oyente al cargar la página sobre el DOM
  window.addEventListener("DOMContentLoaded", () => {
    //Genero visualmente el tablero.
    pintar();  //FUNCION PRINCIPAL DEL JUEGO QUE GENERA LOS EVENTOS A CADA CELDA
  });
}

//Agrego un evento a la etiqueda de reiniciar
document.querySelector("#reiniciar").addEventListener("click", async function () {
  this.classList.add("activado"); // enciende el borde
  await reiniciarJuego();
  setTimeout(() => {
    document.querySelector("#reiniciar").classList.remove("activado");
  }, 200); // se apaga después de un cuarto de segundo
});

// Evitar el menú contextual del navegador en el área que contiene el tablero
const boardZone = document.getElementById("board-zone");
if (boardZone) {
  boardZone.addEventListener("contextmenu", (e) => e.preventDefault());
}

//******************************************************************* */

/*---------------------     FUNCIONES EMPLEADAS    ----------------------- */

/*---------------------     Funcion de renderizado    ----------------------- */
//Posible BUG aquí arreglar después
var columnas = juego.columnas, filas = juego.filas;

// Renderiza las celdas, si la partida inicia entonces todas son grises
function pintar() {
  juego.celdas = [];
  columnas = juego.columnas;
  filas = juego.filas;
  //Apunto a la etiqueta que quiero cambiar:
  const cuadro = document.querySelector(".tablero");
  cuadro.innerHTML = "";

  const totalCeldas = columnas * filas;
  //Voy creando divs con la clase asignada celda - oculta.
  for (let i = 0; i < totalCeldas; i++) {
    //Guardo la referencia a un DOM dentro de la variable celda.
    const celda = document.createElement("div");
    celda.classList.add("celda", "celda-oculta"); //Imagen que se mostrara.
    //Le asigno un indice o posición 1D a la etiqueta html:
    celda.dataset.index = i;
    juego.celdas.push(celda); //Guardo la referencia del div creado en un conjunto de celdas.

    //AGREGO UN PUNTO OYENTE PARA QUE EL DIV CON INDICE i TENGA LA CAPACIDAD DE PERCIBIR EVENTOS.
    celda.addEventListener("click", manejarClick);
    celda.addEventListener("contextmenu", manejarClick);
    cuadro.appendChild(celda);  //Insertar el siguiente elemento al elemento padre del cuadro
  }
}
// --------------------------   Funcion que asigna subclases a los divs dinámicos  --------------------------//
function mapeoDOM() {
  //Obtengo el indice
  columnas = juego.columnas, filas = juego.filas;
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      const indice1D = i * columnas + j;  //Traduzco indices 2D a un único índice 1D
      const celda = juego.celdas[indice1D];
      const valor = juego.tablero[i][j];

      if (celda.classList.contains("celda-bandera") && (juego.tablero[i][j] >= "1" && juego.tablero[i][j] <= "5")) {
        celda.classList.remove("celda-bandera");
      }
      if (juego.haPerdido()) {
        if (celda.classList.contains("celda-bandera") && juego.tablero[i][j] != "X") {
          //Renderizo las banderas con tonos rojo.
          celda.classList.remove("celda-bandera");
          celda.classList.add("celda-bandera-error");
        }
      }
      //?
      celda.classList.remove("celda-oculta",
        "celda-1", "celda-2", "celda-3",
        "celda-4", "celda-5", "celda-6", "celda-mina",
        "celda-vacia");
      //Pongo la clase de estilo según el estado del tablero lógico:
      switch (valor) {
        case '1': celda.classList.add("celda", "celda-1"); break;
        case '2': celda.classList.add("celda", "celda-2"); break;
        case '3': celda.classList.add("celda", "celda-3"); break;
        case '4': celda.classList.add("celda", "celda-4"); break;
        case '5': celda.classList.add("celda", "celda-5"); break;
        case '6': celda.classList.add("celda", "celda-6"); break;
        case 'X': celda.classList.add("celda", "celda-mina"); break;
        case 'B': celda.classList.add("celda", "celda-vacia"); break;
        default: celda.classList.add("celda", "celda-oculta"); break;
      }
    }
  }
}

async function reiniciarJuego() {
  traza.length = 0;  //Es vital vaciar la traza sino las partidas seran inconsistentes.
  juego.reiniciarEstado();
  reiniciarTimer();
  juego.estado = "inicial";
  //await obtenerPartida(); //Pide los datos del backend y los guarda en el obj juego
  pintar(); // repinta el DOM desde cero
}
function iniciarTimer() {
  if (juego.intervalo !== null) return;
  juego.inicio = performance.now();  // Guardo el tiempo inicial de alta precisión
  juego.intervalo = setInterval(() => {
    if (juego.segundos < 999) {
      juego.segundos++;
    }
    actualizarRelojUI();
  }, 1000);
}
function detenerTimer() {
  if (juego.intervalo !== null) {
    clearInterval(juego.intervalo);
    juego.intervalo = null;
  }
}
function reiniciarTimer() {
  detenerTimer();
  juego.segundos = 0;
  juego.minutos = 0;
  actualizarRelojUI();
}
async function obtenerPartida() {
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("Error: Para jugar una partida necesita estar autenticado. Cree una cuenta.");
    return null;
  }

  try {
    //Realizo un posteo al beckend
    const respuesta = await postAutenticado(juego.dificultad);
    //Si las respuestas coinciden: Entonces leo los datos del response dados por el backend
    //Los datos que manda el backend son la semilla y el id de la partida
    juego.idPartida = respuesta?.idPartida ?? null;
    //Si los atributos JSON no coinciden con el frontend ocurrirá error.
    juego.seed = Array.isArray(respuesta?.semillas) ? respuesta.semillas : [];

    console.log("Partida activa:", juego.idPartida);
    console.log("Seed guardada:", juego.seed);

    juego.tablero = generarTablero();
    return respuesta;
  } catch (error) {
    console.error("Error al obtener la partida desde el backend:", error.message);
    return null;
  }
}