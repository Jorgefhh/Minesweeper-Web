//En esta sección de código lo que voy a hacer es pasar los objetos a través
//del protocolo http para que un backend pueda procesarlos y hacer su respectiva lógica de negocio 

function enviarBackend() {
    // Verificar que el objeto juego esté disponible
    if (typeof juego === 'undefined') {
        console.error("Error: El objeto 'juego' no está disponible");
        return;
    }

    // Serializo el JSON
    const datosJson = JSON.stringify(juego);

    // Inicio la petición HTTP mediante un fetch
    fetch("http://localhost:8080/api/partidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: datosJson
    })
        .then(res => res.json())  // Este es quien recibe el eventual HTTP response del servidor.
        .then(data => console.log("Respuesta del backend:", data))  // Procesa el objeto
        .catch(err => console.error("Error:", err)); // Captura el error si es que hubo
}

// Enviar solo los datos necesarios para la tabla Partidas al ganar
async function enviarPartidaAlBackend(modoId = null) {
    if (typeof juego === 'undefined') {
        console.error("Error: El objeto 'juego' no está disponible");
        return null;
    }

    // Calcular el tiempo exacto transcurrido en segundos con 3 cifras decimales
    const tiempoExacto = juego.inicio > 0
        ? ((performance.now() - juego.inicio) / 1000).toFixed(3)
        : Number(juego.segundos).toFixed(3);

    // Construir el payload con los datos requeridos por el backend
    const payload = {
        idPartida: juego.idPartida,
        idModo: modoId,
        tiempo: tiempoExacto,
        clicksIzquierdo: juego.clicksIzquierdo,
        clicksDerecho: juego.clicksDerecho,
        listaTraza: traza
    };

    try {
        const data = await patchAutenticado(payload);

        if (!data) return null; // Si fue redirigido por 401 u otro motivo

        console.log("Servidor validó la victoria:", data);
        return data;
    } catch (err) {
        console.warn("Validación rechazada o error de conexión con el backend:", err.message);
        return null;
    }
}

// Función auxiliar para enviar estadísticas al ganar
async function enviarStats(modoId = 1) {
    if (typeof juego === 'undefined') {
        console.error("Error: El objeto 'juego' no está disponible");
        return null;
    }
    if (juego.haTerminado()) {
        return await enviarPartidaAlBackend(modoId);
    }
    return null;
}
