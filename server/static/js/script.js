let ultimoGesto = "";
let puntaje = 0;
let gestos = [];
const hudText = document.getElementById("hud-text");
const hudScore = document.getElementById("hud-score");
const scene = document.getElementById("scene");

// Cargar los gestos disponibles
async function cargarGestos() {
  const res = await fetch("/gestures_json");
  gestos = await res.json();
  console.log("Gestos cargados:", gestos.map(g => g.name));
}

// Crear cubos aleatorios en el entorno
function crearCubo(nombreGesto) {
  const cube = document.createElement("a-box");
  cube.setAttribute("position", `${Math.random() * 6 - 3} 1.5 ${-Math.random() * 6 - 2}`);
  cube.setAttribute("color", "#00ff7f");
  cube.setAttribute("width", "0.8");
  cube.setAttribute("height", "0.8");
  cube.setAttribute("depth", "0.8");
  cube.classList.add("target");
  cube.dataset.gesto = nombreGesto;
  cube.setAttribute("animation__float", "property: position; dir: alternate; dur: 1500; loop: true; to: 0 2.5 -4");
  scene.appendChild(cube);
}

// Actualizar el gesto detectado y revisar si coincide
async function actualizarGesto() {
  try {
    const res = await fetch("/ultimo_gesto");
    const data = await res.json();
    const gesto = data.gesto;

    if (gesto && gesto !== ultimoGesto) {
      ultimoGesto = gesto;
      hudText.textContent = `Gesto: ${gesto}`;
      const utter = new SpeechSynthesisUtterance(gesto);
      utter.lang = "es-ES";
      speechSynthesis.speak(utter);

      // Buscar cubos con ese nombre de gesto
      document.querySelectorAll("a-box").forEach(cubo => {
        if (cubo.dataset.gesto === gesto) {
          // Eliminar cubo y sumar puntos
          cubo.parentNode.removeChild(cubo);
          puntaje += 10;
          hudScore.textContent = `Puntaje: ${puntaje}`;
        }
      });
    }
  } catch (e) {
    console.error("Error obteniendo gesto:", e);
  }
}

// Generar cubos cada cierto tiempo
function generarCubos() {
  if (gestos.length > 0) {
    const gesto = gestos[Math.floor(Math.random() * gestos.length)].name;
    crearCubo(gesto);
  }
}

// Iniciar bucles
cargarGestos().then(() => {
  setInterval(actualizarGesto, 700);
  setInterval(generarCubos, 3000);
});
