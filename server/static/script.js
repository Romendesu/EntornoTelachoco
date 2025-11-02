const hudText = document.getElementById("hud-text");
let ultimoGesto = "";

async function actualizarGesto() {
  try {
    const res = await fetch("/ultimo_gesto");
    const data = await res.json();
    const gesto = data.gesto;

    if (gesto && gesto !== ultimoGesto) {
      ultimoGesto = gesto;
      hudText.textContent = `Gesto: ${gesto}`;

      // Voz al cambiar gesto
      const utter = new SpeechSynthesisUtterance(gesto);
      utter.lang = "es-ES";
      utter.rate = 1.1;
      speechSynthesis.speak(utter);
    }
  } catch (e) {
    console.error("Error obteniendo gesto:", e);
  }
}

setInterval(actualizarGesto, 700);
