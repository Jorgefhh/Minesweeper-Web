// ============================================
// api.js
// Acá van TODAS las funciones que hacen fetch al backend.
// La idea es que login.html, registrar.html, juego.js, etc,
// llamen a estas funciones en vez de escribir fetch() por todos lados.
// ============================================

// Cambiá esto si tu backend corre en otro puerto o dominio.
const API_BASE_URL = "http://localhost:8080";

// ---------- REGISTRO ----------
// datosUsuario = {
//   nombreUsuario, correo, password, foto, fechaInicio, experiencia
// }
async function registrarUsuario(datosUsuario) {
  const respuesta = await fetch(`${API_BASE_URL}/usuarios/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datosUsuario),
  });

  if (!respuesta.ok) {
    const textoError = await respuesta.text();
    throw new Error(textoError || "No se pudo registrar el usuario");
  }

  // Algunos backends no devuelven body en el registro, por eso el catch
  return respuesta.json().catch(() => ({}));
}

// ---------- LOGIN ----------
 //credenciales = { correo, password }
// El backend debería devolver algo como { token: "..." }
async function loginUsuario(credenciales) {
  const respuesta = await fetch(`${API_BASE_URL}/usuarios/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credenciales),
  });

  if (!respuesta.ok) {
    const textoError = await respuesta.text();
    throw new Error(textoError || "Usuario o contraseña incorrectos");
  }

  return respuesta.json();
}

// ---------- Función de ayuda para pedidos que necesitan el token ----------
// Ejemplo de uso más adelante: fetchConToken("/usuario/datos")
async function fetchConToken(ruta, opciones = {}) {
  const token = localStorage.getItem("token");

  const rutaNormalizada = ruta.startsWith("/") ? ruta : `/${ruta}`;
  const respuesta = await fetch(`${API_BASE_URL}${rutaNormalizada}`, {
    ...opciones,
    headers: {
      ...(opciones.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (respuesta.status === 401) {
    // Si el token venció o es inválido -> mandamos al usuario a loguearse de nuevo
    localStorage.removeItem("token");
    window.location.href = "/src/auth/login.html";
    return;
  }

  return respuesta;
}

// ---------- SEMILLA DEL TABLERO ----------
// Solo se llama cuando el usuario ya inició sesión y realiza una acción
// relevante del juego (click o reinicio). En el cuerpo solo se envía la dificultad.
async function postAutenticado(dificultad) {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  const respuesta = await fetch(`${API_BASE_URL}/api/partidas?dificultad=${encodeURIComponent(dificultad)}`, {
    method: "POST",
    headers: {
    //   "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    //puedo decidir si mandarlo como parametro o como body json
    // body: JSON.stringify({ dificultad }),
  });

  if (!respuesta.ok) {
    const textoError = await respuesta.text();
    throw new Error(textoError || "No se pudo obtener la semilla");
  }

  //Parseo el JSON string que me llega en un objeto JS comun y corriente
  return respuesta.json().catch(() => ({}));
}

// ---------- ACTUALIZAR PARTIDA ----------
// Envía al backend las estadísticas de una partida ganada.
async function patchAutenticado(datosPartida) {
  const respuesta = await fetchConToken("/api/partidas", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datosPartida),
  });

  if (!respuesta) {
    return null;
  }

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "No se pudo actualizar la partida");
  }

  return datos;
}
