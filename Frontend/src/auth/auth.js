// ============================================
// auth.js
// Acá manejamos lo que pasa cuando el usuario
// aprieta "Ingresar" o "Registrarse".
// Este archivo usa las funciones de api.js
// (por eso en el HTML, api.js se carga ANTES que este)
// ============================================

// ---------- Reloj de la franja decorativa ----------
// Esto es solo estético, no tiene nada que ver con el login.
const cajaReloj = document.getElementById("reloj");

function actualizarReloj() {
  if (!cajaReloj) return;
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  cajaReloj.textContent = `${horas}:${minutos}`;
}

actualizarReloj();
setInterval(actualizarReloj, 1000 * 30); // se actualiza cada 30 segundos, no hace falta más

// ---------- LOGIN ----------
const formLogin = document.getElementById("form-login");

if (formLogin) {
  formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault(); // evita que la página se recargue sola

    const correo = document.getElementById("correo").value;
    const contrasena = document.getElementById("contrasena").value;
    const mensajeError = document.getElementById("mensaje-error");
    const boton = formLogin.querySelector("button");

    mensajeError.textContent = "";
    boton.disabled = true;
    boton.textContent = "Ingresando...";

    try {
      const respuesta = await loginUsuario({ correo, password : contrasena });

      // Guardamos el token para usarlo en los próximos pedidos al backend.
      // localStorage se borra solo si el usuario limpia el navegador o cierra sesión a mano.
      localStorage.setItem("token", respuesta.token);
      //SERIALIZO EL OBJETO A JSON 
      //Es decir paso el JSON a un string plano tipo:
      /*
      {"idUsuarios":1,"nombreUsuarios":"Jorge","correo":"jorge@mail.com"}
      */
     //Porque localstorage solo acepta texto plano
      localStorage.setItem("usuario", JSON.stringify(respuesta));
      console.log(respuesta);

      // Después del login, el usuario elige la dificultad desde el menú del juego.
      window.location.href = "../inicio/menu.html";
    } catch (error) {
      mensajeError.textContent = error.message;
      boton.disabled = false;
      boton.textContent = "Ingresar";
    }
  });
}

// ---------- REGISTRO ----------
const formRegistro = document.getElementById("form-registro");

if (formRegistro) {
  // --- Toggle de contraseña (alterna icono ojo abierto/cerrado) ---
  function configurarToggle(botonId, inputId) {
    const boton = document.getElementById(botonId);
    const input = document.getElementById(inputId);
    if (!boton || !input) return;

    boton.addEventListener("click", () => {
      const esPassword = input.getAttribute("type") === "password";
      input.setAttribute("type", esPassword ? "text" : "password");
      boton.querySelector(".icono-ojo").style.display = esPassword ? "none" : "block";
      boton.querySelector(".icono-ojo-cerrado").style.display = esPassword ? "block" : "none";
    });
  }

  configurarToggle("toggle-contrasena", "contrasena");
  configurarToggle("toggle-repetir-contrasena", "repetir-contrasena");

  formRegistro.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const pais = document.getElementById("pais").value;
    const contrasena = document.getElementById("contrasena").value;
    const repetirContrasena = document.getElementById("repetir-contrasena").value;
    const mensajeError = document.getElementById("mensaje-error");
    const mensajeExito = document.getElementById("mensaje-exito");
    const boton = formRegistro.querySelector("button");

    mensajeError.textContent = "";
    mensajeExito.textContent = "";

    if (contrasena !== repetirContrasena) {
      mensajeError.textContent = "Las contraseñas no coinciden.";
      return;
    }

    boton.disabled = true;
    boton.textContent = "Creando cuenta...";

    try {
      await registrarUsuario({
        nombreUsuario: nombre,
        correo,
        pais,
        password: contrasena,
        foto: "default-user.png",
        fechaInicio: "2003-02-18",
        experiencia: 0,
      });

      //Si la promesa de arriba no se cumple se lanza una excepcion
      mensajeExito.textContent = "¡Cuenta creada! Te llevamos al login...";

      // Esperamos un toque para que el usuario alcance a leer el mensaje
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);
    } catch (error) {
      mensajeError.textContent = error.message;
      boton.disabled = false;
      boton.textContent = "Registrarse";
    }
  });
}
