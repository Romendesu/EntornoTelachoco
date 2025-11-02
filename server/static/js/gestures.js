// gestures.js
// carga gestos y actualiza gesto actual
// variables expuestas en window para que otros scripts las usen
let ultimoGesto = "";
let gestosValidos = []; // lista de strings, ej: ["5 dedos", "puño"]
// inicializar en window (se actualizarán más abajo)
window.ultimoGesto = ultimoGesto;
window.gestosValidos = gestosValidos;

async function cargarGestos() {
  try {
    const res = await fetch("/gestures_json");
    const data = await res.json();
    // gestures_json devuelve lista de objetos {name: ..., landmarks: [...]}
    gestosValidos = data.map(g => (g && g.name) ? g.name : "").filter(Boolean);
  // exponer en window para que otros scripts (enemies, fallback) los usen
  window.gestosValidos = gestosValidos;
  console.log("Gestos cargados:", gestosValidos);
  } catch (e) {
    console.error("No se pudieron cargar gestos:", e);
  }
}

async function actualizarGestoUI() {
  try {
    const res = await fetch("/ultimo_gesto", { cache: "no-store" });
    const data = await res.json();
    const gesto = data.gesto;
    if (gesto && gesto !== ultimoGesto) {
      ultimoGesto = gesto;
      // exponer también en el objeto window para consumo inmediato
      window.ultimoGesto = ultimoGesto;
      const el = document.getElementById("gesto-actual");
      if (el) el.textContent = `🤚 ${ultimoGesto}`;
    }
  } catch (e) {
    console.error("Error obteniendo gesto:", e);
  }
}

setInterval(actualizarGestoUI, 300);
cargarGestos();
