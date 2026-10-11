// ============================================================================
// clasificacion.js — Lógica para la sección de clasificación (leaderboard)
// ============================================================================

const DIFS = {
  facil: { label: "Fácil", size: "9×9", col: "#ffb02e" },
  medio: { label: "Medio", size: "16×16", col: "#ff6a2a" },
  dificil: { label: "Difícil", size: "20×30", col: "#ff2e4d" }
};

/* ---------- Helpers ---------- */
// Escapa caracteres HTML especiales para prevenir XSS (inyección de código)
// El String(s || "") convierte null/undefined a "" para que no explote
const esc = s => String(s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const FL = {
  AR: '<rect width="40" height="40" fill="#74acdf"/><rect y="13.3" width="40" height="13.4" fill="#fff"/><circle cx="20" cy="20" r="3.5" fill="#f6b40e"/>',
  BR: '<rect width="40" height="40" fill="#009c3b"/><path d="M20 6 36 20 20 34 4 20z" fill="#ffdf00"/><circle cx="20" cy="20" r="7.5" fill="#002776"/>',
  CL: '<rect width="40" height="40" fill="#fff"/><rect y="20" width="40" height="20" fill="#d52b1e"/><rect width="20" height="20" fill="#0039a6"/><circle cx="10" cy="10" r="3" fill="#fff"/>',
  UY: '<rect width="40" height="40" fill="#fff"/>' + [0, 1, 2, 3].map(i => `<rect y="${4.4 + i * 8.9}" width="40" height="4.4" fill="#0038a8"/>`).join("") + '<rect width="18" height="18" fill="#fff"/><circle cx="9" cy="9" r="4" fill="#fcd116"/>',
  MX: '<rect width="13.3" height="40" fill="#006847"/><rect x="13.3" width="13.4" height="40" fill="#fff"/><rect x="26.7" width="13.3" height="40" fill="#ce1126"/><circle cx="20" cy="20" r="3.5" fill="#8b6b2e"/>',
  ES: '<rect width="40" height="40" fill="#c60b1e"/><rect y="10" width="40" height="20" fill="#ffc400"/>',
  CO: '<rect width="40" height="40" fill="#fcd116"/><rect y="20" width="40" height="10" fill="#003893"/><rect y="30" width="40" height="10" fill="#ce1126"/>',
  PE: '<rect width="40" height="40" fill="#d91023"/><rect x="13.3" width="13.4" height="40" fill="#fff"/>',
  US: '<rect width="40" height="40" fill="#fff"/>' + [0, 1, 2, 3, 4, 5, 6].map(i => `<rect y="${i * 6.15}" width="40" height="3.08" fill="#b22234"/>`).join("") + '<rect width="18" height="21.5" fill="#3c3b6e"/>',
  DE: '<rect width="40" height="13.4" fill="#000"/><rect y="13.3" width="40" height="13.4" fill="#dd0000"/><rect y="26.6" width="40" height="13.4" fill="#ffce00"/>',
  JP: '<rect width="40" height="40" fill="#fff"/><circle cx="20" cy="20" r="9" fill="#bc002d"/>',
  PL: '<rect width="40" height="20" fill="#fff"/><rect y="20" width="40" height="20" fill="#dc143c"/>',
  PY: '<rect width="40" height="13.4" fill="#d52b1e"/><rect y="13.3" width="40" height="13.4" fill="#fff"/><rect y="26.6" width="40" height="13.4" fill="#0038a8"/><circle cx="20" cy="20" r="3" fill="none" stroke="#3a7d2c" stroke-width="1.2"/>',
  BO: '<rect width="40" height="13.4" fill="#d52b1e"/><rect y="13.3" width="40" height="13.4" fill="#f9e300"/><rect y="26.6" width="40" height="13.4" fill="#007934"/>',
  VE: '<rect width="40" height="13.4" fill="#fc0"/><rect y="13.3" width="40" height="13.4" fill="#00247d"/><rect y="26.6" width="40" height="13.4" fill="#cf142b"/>'
};
const flag = cc => `<span class="flag-clasif" title="${esc(country(cc))}"><svg viewBox="0 0 40 40" aria-hidden="true">${FL[cc] || `<rect width="40" height="40" fill="#3a2f2c"/><text x="20" y="25" font-size="14" text-anchor="middle" fill="#8e807a">${cc}</text>`}</svg></span>`;
let names; try { names = new Intl.DisplayNames(["es"], { type: "region" }) } catch (e) { names = null }
const country = cc => names ? names.of(cc) : cc;
// El backend devuelve "tiempo" en segundos (double), lo formateamos a 2 decimales
const fmtTime = seg => Number(seg).toFixed(2);
// El backend devuelve "fecha" como string ISO 8601, lo convertimos a fecha legible
const fmtDate = iso => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

function avatar(u) {
  // u.username es el nombre que viene del backend
  const nombre = u.username || "?";
  let h = 0; for (const ch of nombre) h = (h * 31 + ch.charCodeAt(0)) % 360;
  const hue = [8, 16, 24, 34, 346, 356][h % 6];
  return `<span class="av-clasif" style="background:linear-gradient(135deg,hsl(${hue} 90% 55%),hsl(${(hue + 340) % 360} 80% 38%))">${esc(nombre[0].toUpperCase())}</span>`;
}
const trophy = c => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>`;
const TROPHY = ["#f5b73b", "#cfd6dd", "#d4804f"]; // gold, silver, bronze

const GLOBE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.500 0 18M12 3c-3 3.500-3 14.500 0 18"/></svg>';

/* ========================================================================
   Función reutilizable: obtiene la clasificación del backend
   Se puede llamar desde cualquier parte (clasificacion.js, stats.js, etc.)
   ======================================================================== */
async function obtenerClasificacion(dificultad = "facil", pais = null, fecha = null) {
  // Construyo la URL con query params dinámicos
  const params = new URLSearchParams();
  params.set("modo", dificultad); // siempre obligatorio

  // Solo agrego los opcionales si tienen valor
  if (pais) params.set("pais", pais);
  if (fecha) params.set("fecha", fecha);

  const url = `http://localhost:8080/api/clasificacion?${params.toString()}`;

  try {
    const respuesta = await fetch(url);
    

    if (!respuesta.ok) {
      console.error("Error del servidor:", respuesta.status);
      return [];
    }

    // .json() convierte la respuesta a un array de objetos JS automáticamente
    const datos = await respuesta.json();
    console.log(datos);
    return datos; // Array de { username, pais, tiempo, fecha }
  } catch (err) {
    console.error("Error de conexión al obtener clasificación:", err);
    return [];
  }
}

/* ---------- Render ---------- */
const tabs_clasif = document.getElementById("tabs-clasif"), list_clasif = document.getElementById("list-clasif");
let current_clasif = "facil";

// renderClasif ahora es async porque llama al backend
async function renderClasif() {
  const d = DIFS[current_clasif];
  tabs_clasif.querySelectorAll(".tab-clasif").forEach(b => b.setAttribute("aria-selected", b.dataset.k === current_clasif));
  tabs_clasif.querySelector(".info-clasif").textContent = `Tablero ${d.size}`;

  // Leemos los valores actuales de los filtros del HTML
  const paisFiltro = fc_clasif.value || null;
  const mesFiltro = fm_clasif.value || null;

  // Actualizamos la UI de los filtros
  slot_clasif.innerHTML = fc_clasif.value ? flag(fc_clasif.value) : GLOBE;
  fc_clasif.classList.toggle("on", !!fc_clasif.value);
  fm_clasif.classList.toggle("on", !!fm_clasif.value);
  clr_clasif.hidden = !(fc_clasif.value || fm_clasif.value);

  // Pedimos los datos al backend con los filtros actuales
  const data = await obtenerClasificacion(current_clasif, paisFiltro, mesFiltro);

  cnt_clasif.textContent = `${data.length} ${data.length === 1 ? "jugador" : "jugadores"}`;

  list_clasif.innerHTML = !data.length
    ? '<div class="empty-clasif">Nadie registró tiempos con estos filtros.</div>'
    : data.map((u, i) => `
    <div class="grid-clasif row-clasif ${i < 3 ? "top" : ""}" style="--i:${i}">
      <span class="pos-clasif">${i < 3 ? trophy(TROPHY[i]) : i + 1}</span>
      <span class="user-clasif">${avatar(u)}<span class="name-clasif">${esc(u.username)}</span></span>
      ${flag(u.pais)}
      <span class="time-clasif">${fmtTime(u.tiempo)}<i>s</i></span>
      <span class="date-clasif">${fmtDate(u.fecha)}</span>
    </div>`).join("");
}

/* ---------- Inicialización de tabs ---------- */
tabs_clasif.innerHTML = Object.entries(DIFS).map(([k, d]) =>
  `<button class="tab-clasif" role="tab" data-k="${k}">${d.label}</button>`).join("") + `<span class="info-clasif"></span>`;
tabs_clasif.addEventListener("click", e => {
  const b = e.target.closest(".tab-clasif");
  if (b) {
    current_clasif = b.dataset.k;
    renderClasif();
  }
});

/* ---------- Inicialización de filtros ---------- */
const fc_clasif = document.getElementById("fc"), fm_clasif = document.getElementById("fm"),
  clr_clasif = document.getElementById("clr"),
  slot_clasif = document.getElementById("cflag"), cnt_clasif = document.getElementById("cnt");

// Generar las opciones del filtro de países basándonos en los códigos de banderas (FL)
const countryCodes = Object.keys(FL).sort((a, b) => country(a).localeCompare(country(b), "es"));
fc_clasif.innerHTML = '<option value="">Todos los países</option>' + 
  countryCodes.map(cc => `<option value="${cc}">${esc(country(cc))}</option>`).join("");

const MN = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Generar las opciones del filtro de meses (últimos 12 meses desde hoy)
const hoy = new Date();
let yy = hoy.getFullYear(), mm = hoy.getMonth();
let moOpts = '<option value="">Todos los meses</option>';
for (let i = 0; i < 12; i++) {
  moOpts += `<option value="${yy}-${String(mm + 1).padStart(2, "0")}">${MN[mm]} ${yy}</option>`;
  if (--mm < 0) { mm = 11; yy--; }
}
fm_clasif.innerHTML = moOpts;

// Eventos de los filtros: al cambiar cualquier filtro, volver a consultar al backend
[fc_clasif, fm_clasif].forEach(el => el.addEventListener("change", renderClasif));
clr_clasif.addEventListener("click", () => { fc_clasif.value = ""; fm_clasif.value = ""; renderClasif(); });

// Carga inicial: consulta al backend con dificultad "facil" (sin filtros extras)
renderClasif();
