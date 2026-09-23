//Busca todos los elmentos que tengan la clase diff-card

const difficultyCards = Array.from(document.querySelectorAll('.diff-card'));  //Devuelve una colección 
const startButton = document.getElementById('start-button');
//Guarda la referencia a un elemento del DOM de html 
const guestLogin = document.getElementById('guest-login');
//Guarda una referencia al elemento que contiene:
//Avatar,  Username, XP y Barra de XP
const accountPreview = document.getElementById('account-preview');
const username = document.getElementById('username');
const xpValue = document.getElementById('xp-value');
const xpProgress = document.getElementById('xp-progress');
//Verifica la existencia de un token para saber si hay sesión
const hasSession = Boolean(localStorage.getItem('token'));

//Utilizamos la propiedad hiden para ocultar un elemento HTML
/*
Básicamente le ponemos así, con eso el navegador no lo mostrará:
<a hidden>Iniciá sesión</a>
*/
guestLogin.hidden = hasSession;
accountPreview.hidden = !hasSession;   //Si hay sesión entonces la propiedad de ocultar es falsa

if (hasSession) {
    //ESTA ES UNA OPERACIÓN PARA DESEARIZAR
    //IMPORTANTE: Convierte el string JSON de vuelta en un objeto JavaScript.
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const nombre = usuario.nombreUsuarios;
    //Usamos la operación de javascript nullish coalescing "??":
    const experiencia = Number(usuario.experiencia ?? 0);
    //La linea de arriba básicamente dice:
    //Si el usuario tiene un valor de xp, usalo, si es null entonces usa 0

    //Si el usuario tiene nombre pues poner ese nombre en html
    if (nombre) username.textContent = nombre;
    xpValue.textContent = experiencia;
    //Calcular la experiencia
    xpProgress.style.width = `${Math.min(experiencia, 100)}%`;
}
let dificultad = null;  //Hardcodeo la dificultad deseada por ahora
//Ahora lidio con la dificultad del juego que esta en un id:
difficultyCards.forEach(
    card => {
        card.addEventListener('click',
             () => {
                //extraigo atributo y parseo
                dificultad = parseInt(card.dataset.index,10);
                //console.log("Dificultad seleccionada: " + dificultad);
                selectDifficulty(dificultad);
            }
        )
    }
);

startButton.addEventListener('click', () => {
    const dificultadActual = localStorage.getItem("dificultad") || "facil";
  if (dificultadActual && ["facil", "intermedio", "dificil"].includes(dificultadActual) ){
    
    window.location.href = '../juego/panel_tablero.html';    
  } 
  else {
    alert('Seleccioná una dificultad antes de empezar');
  }
});
//Marcar el html clickeado como selected
function selectDifficulty(index) {
    //Recorre todos los botones.
    const nombreDificultad = ["facil", "intermedio", "dificil"][index];
    //Guardo la dificultad finalmente como un string en localstorage
    localStorage.setItem("dificultad", nombreDificultad);
    difficultyCards.forEach((card, cardIndex) => { //Card es cada boton, cardIndex su posicion
    const isSelected = cardIndex === index; //Es el boton que realmente elegí
    //En base al indice que obtuve vuelvo y lo marco como selected.
    card.classList.toggle('selected', isSelected); //Dependiendo de si isSelected es true o false
    //isSelected == true -> Agrega -> selected
    //isSelected == false -> elimina -> selected
    //Con esto modifico el texto de ese atributo:
    //Si cambia el texto entonces un parametro de css puede dispararse si hay match
    card.setAttribute('aria-pressed', String(isSelected)); //Es una funcionalidad peculiar
    //Básicamente se usa para manipular el lector de texto para personas ciegas
  });
}

