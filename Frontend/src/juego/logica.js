//Defino vector con los movimientos adyacentes posibles:
const direcciones = [
  [-1, -1],[-1, 0], [-1, 1], // fila de arriba
  [0, -1],          [0, 1], // misma fila
  [1, -1],  [1, 0],  [1, 1], // fila de abajo
];

// ------------------------     FUNCIONES DE LÓGICA Y ALGORITMOS        ---------------------------//
var FILAS = 0;
var COLUMNAS = 0;
function generarTablero() {
    FILAS = juego.filas, COLUMNAS = juego.columnas;
  //let rango = FILAS * COLUMNAS; //Limite de coordenadas, conjunto experimental
  //Mundo lógico: Necesito una estructura de datos como una matriz
  const matriz = [];
  //JS NO CONTIENE MATRICES ASÍ QUE LAS CREAMOS A MANO:
  //Voy creando las filas
  for (let i = 0; i < FILAS; i++) {
    let fila = [];
    for (let j = 0; j < COLUMNAS; j++) {
      fila.push("V"); // llenamos cada celda con "V"
    }
    matriz.push(fila);
  }
  //Ahora creo numeros aleatorios del 0 al 63
  //PARA EL MODO FÁCIL SON 10 MINAS => GENERO UNA LISTA DE 10 NUMEROS ALEATORIOS SIN REPOSICIÓN
  let seed = juego.seed, largo = seed.length
  //Transformo cada semilla en una coordenada fila i , columna j:
  for (let i = 0; i < largo; i++) {
    let valor = seed[i];  //Es un índice 1D
    //Convertir índice 1D a uno 2D
    let fila = Math.floor(valor / COLUMNAS);
    let col = valor % COLUMNAS;
    //Ahora lo establezco en el arreglo lógico:
    matriz[fila][col] = "M";
  }
  //obtengo una matriz finalmente que representa un tablero de juego
  return matriz;
}
// ------------------       LÓGICA PRINCIPAL DEL JUEGO      ----------------------//
function setBoard(fila, col) {  //Genera una o varias jugadas en el tablero
  //Ambos son filas
  //Uso las constantes anteriores.
  if (!(fila >= 0 && fila < FILAS) || !(col >= 0 && col < COLUMNAS)) {
    //Si me salgo de los límites
    return;
  }
  //Escenario: CLICK EN MINA => PIERDE
  if (juego.tablero[fila][col] == "M") {
    juego.colExplotada = col;
    juego.filaExplotada = fila;
    for(let i = 0; i < FILAS; i++){
        for(let j = 0; j < COLUMNAS; j++){
            if(juego.tablero[i][j] == "M"){
                juego.tablero[i][j] = "X";  //Asigno a las minas restantes la etiqueta X (?)
            }
        }
    }
    juego.estado = "perdido";
    //return;
  }
  //if (juego.tablero[fila][col] != "V") return; // ya revelada, 

  //A PARTIR DE AQUÍ EL CLICK SE PROCESA EN UNA CELDA YA SEA REVELADA NUMERICA O NO REVELADA
  //ES DECIR CELDAS SIN MINAS
  const flags = adyacencia(fila, col);   //Obtengo ambas banderas las teoricas y las provistas por el user

  //CASO: CELDAS NO REVELADAS
  if(juego.tablero[fila][col] == "V"){

    juego.aciertos++;
    if (flags.flagsByGame > 0) {
        //Ponemos lógicamente en el tablero el numero correspondiente:
        juego.tablero[fila][col] = flags.flagsByGame + "";
       // return;
    } else {  //Si la celda es un '0' o Blank 'B'
        juego.tablero[fila][col] = "B";
        //PROPAGO RECURSIVAMENTE HACIA TODOS SUS LADOS ADYACENTES USANDO EL VECTOR DE DIRECCIONES:
        //Mediante el for each propago 8 llamadas recursivas:
        direcciones.forEach(([df, dc]) => {
        setBoard(fila + df, col + dc);
        });
    }
    //return;
  }
 //CASO: clicks en celda numerica B-9 ya revelada.
  else{ 
    // console.log("tumama");
    //Ejecuto el algoritmo CHORD
    resolveAdy(fila,col, flags);
    
    
    

  }

  //Verificar si se gano el juego
    if(juego.aciertos == COLUMNAS * FILAS - juego.minas){
        juego.estado = "ganado";
    }
  
 // console.table(juego.tablero);

    return;
}

//Devuelve las banderas adyacentes clickeadas por el usuario y la cantidad de minas adyacentes
function adyacencia(fila, col) {
  let realFlags = 0, userFlags = 0;
  direcciones.forEach(([df, dc]) => {
    let nueva_fila = fila + df;
    let nueva_col = col + dc;
    //Validación dentro del tablero:
    if (
      nueva_fila >= 0 && nueva_fila < FILAS &&
      nueva_col >= 0 && nueva_col < COLUMNAS
    ) {
      //Busco si hay minas alrededor:
      if (juego.tablero[nueva_fila][nueva_col] === "M" || juego.tablero[nueva_fila][nueva_col] === "X") {
        realFlags++;
      }
      //Creo el índice 1D en base a los 2 indices 2D
      let idx = COLUMNAS * nueva_fila + nueva_col;
      //Con esto anoto las banderas adyacentes puestas por el usuario
      if(juego.celdas[idx].classList.contains("celda-bandera")){
        userFlags++;
      }
    }
  });
  return {
    flagsByGame: realFlags,
    flagsByUser: userFlags
  };
}

function resolveAdy(fila, col,flags){
  if(flags.flagsByUser != flags.flagsByGame) return;
    //Se considera un escenario de look-ahead inválido, por lo tanto no es castigable a revelar celdas.
    //Aunque juegos modernos si lo hacen, podría implementarlo más tarde
    //No habra castigo
    if(flags.flagsByUser == 0) return;
//Para este punto flagsByUser == flagsByGame con flagsByUser != 0
//Realiza el revelado de jugar las casillas adyacentes indistintamente si se gana o pierde

    direcciones.forEach(([df,dc]) => {
        let nueva_fila = fila + df;
        let nueva_col = col + dc;
        
        if (!(nueva_fila >= 0 && nueva_fila < FILAS) || !(nueva_col >= 0 && nueva_col < COLUMNAS)) {
            //Si me salgo de los límites, la coordenada es invalida y no me trago una excepcion
          return;
        } 

        //Creo el índice 1D en base a los 2 indices 2D
        let idx = COLUMNAS * nueva_fila + nueva_col;
        const tieneBandera = juego.celdas[idx].classList.contains("celda-bandera")
        const valor = juego.tablero[nueva_fila][nueva_col];    

        if((valor == "V" && !tieneBandera) || valor == "M" && !tieneBandera){
            //console.log("jugada automatica ahora mismo");
            setBoard(nueva_fila, nueva_col);
            //Se juega solo en todas las celdas adyacentes que no tengan al mismo tiempo bomba y bandera
        }
        //console.log(nueva_col + " - " + nueva_fila);
        // //Lineas sospechosa , no tiene mucho sentido a priori
        // if(juego.tablero[nueva_fila][nueva_col] == "M"){
        //     //Flujo de jugada no valida.
        //     setBoard(nueva_fila, nueva_col);
        // }
    });
  }

//Convierte el indice de 1D de html a un indice 2D de una matriz
function getCoordenadas(event){
    // Convierte el elemento que es una cadena a un numero de base 
    let idx = parseInt(event.target.dataset.index, 10);  //e.target es el elemento que se le hizo un click
    const cols = juego.columnas || COLUMNAS || 9;
    //Traducción de índice 1D a 2D
    let col_click = idx % cols;
    let fila_click = Math.floor(idx / cols);
    return {fila_click, col_click};
} 