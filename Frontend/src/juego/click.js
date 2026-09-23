//Event básicamente es un parámetro tipo objeto MouseEvent
//Su contenido se obtiene de manera automatica al desencadenarse un evento
// que almacena la información general del click dada por el navegador
//El navegador no muestre el menu de opciones por defecto.
//Con esta linea de abajo aseguramos que en caso de hacer click derecho

async function manejarClick(event) {
    const celda = event.currentTarget;
    if (juego.haTerminado()) return;
    //Pido la semilla y el id de la partida:
    if (event.type === "click" && juego.estado === "inicial") {
        const estado = await obtenerPartida();
        if (estado != null) juego.estado = "jugando";
    }

    //Creo una matriz llamando al algoritmo de traducción de índice unidimensional a indice bidimensional i,j
    let { fila_click, col_click } = getCoordenadas(event);

    if (event.type == "click") {
        juego.clicksIzquierdo++;  // Incrementar contador de clicks izquierdo
        if (juego.intervalo === null && (juego.estado === "jugando")) {
            iniciarTimer();
        }
        if (celda.classList.contains("celda-bandera")) {
            return; // Evita que se revele en caso de dar click izq a una bandera
        }
        //ACTUALIZO TABLERO LÓGICO SEGÚN LA COORDENADA IMPUESTA
        setBoard(fila_click, col_click);  //Quizas podrìa mandar solo el indice 1d

        //GUARDO LA JUGADA EN UN LOG
        traza.push({
            tipo: "izquierdo",
            timestamp: Math.round(performance.now() - juego.inicio),
            coordenadas: Number(event.target.dataset.index)  //Parseo el str a entero
        });
        //LUEGO RENDERIZO EL TABLERO:
        mapeoDOM();  //Esto renderiza los objetos que no son minas
        //----------     Verificación de fin de juego     ----------//
        if (juego.haGanado() || juego.haPerdido()) {
            await terminarJuego();
        }
    }

    else if (event.type == "contextmenu") {
        event.preventDefault(); // evitar menú o comportamiento por defecto
        juego.clicksDerecho++;
        // Hacemos un toggle Si la celda ya tiene bandera, la quitamos 
        if (celda.classList.contains("celda-bandera")) {
            celda.classList.remove("celda-bandera");
            celda.classList.add("celda-oculta");
            if (juego.minasRestantes < juego.minas) {
                juego.minasRestantes++;
            }
        } else {
            if (juego.tablero[fila_click][col_click] == "M" || juego.tablero[fila_click][col_click] == "V") {
                celda.classList.remove("celda-oculta");
                celda.classList.add("celda-bandera");
                if (juego.minasRestantes > 0) {
                    juego.minasRestantes--;
                }
            }
        }

        // Actualizamos contador de bombas en la barra superior en vivo
        actualizarConteoBombas();

        //GUARDO LA JUGADA EN UN LOG
        traza.push({
            tipo: "derecho",
            timestamp: Math.round(performance.now() - juego.inicio),
            coordenadas: Number(event.target.dataset.index)  //Parseo el str a entero
        });
    }
    return juego.celdas;
}

async function terminarJuego() {
    detenerTimer();
    juego.fechaUltimaPartida = new Date().toLocaleString();
    let datosBackend = null;

    if (juego.estado === "ganado") {
        if (typeof enviarStats === 'function') {
            datosBackend = await enviarStats(1);
        }
    }
    else if (juego.estado === "perdido") {
        const idxExplotada = juego.columnas * juego.filaExplotada + juego.colExplotada;
        const celdaExplotada = juego.celdas[idxExplotada];
        if (celdaExplotada) {
            celdaExplotada.classList.add("celda-pulso");  //Renderizo un lienzo de pulso rojo
            setTimeout(() => {
                celdaExplotada.classList.remove("celda-pulso");
            }, 700);
        }

        const btn = document.getElementById("reiniciar");
        if (btn) {
            btn.style.backgroundImage = "url('../../assets/img/LOSE.png')";
            btn.style.backgroundPosition = "center";
            btn.style.backgroundSize = "cover";
            btn.style.backgroundRepeat = "no-repeat";
        }
        juego.expGanada = 0; // dejar 0 para partida perdida
        // NO enviar estadísticas al backend cuando pierde
    }

    // Renderizar la tabla de estadísticas únicamente aquí, al terminar la partida
    juego.mostrarEstadisticasUI(datosBackend);
    return;
}