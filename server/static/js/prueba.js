const videoFeed = document.getElementById("videoFeed");
const gestureText = document.getElementById("gesture-text");
const gestureDisplay = document.getElementById("gesture-display");

let ultimoGesto = "";

// Iniciar video
function iniciarVideo() {
  videoFeed.src = "/video_feed";
}

// Actualización del gesto
async function actualizarGesto() {
  try {
    const res = await fetch("/ultimo_gesto", { cache: "no-store" });
    const data = await res.json();
    const gesto = data.gesto;

    if (gesto && gesto !== ultimoGesto) {
      ultimoGesto = gesto;
      gestureText.textContent = gesto;
      gestureDisplay.classList.add("active");
      setTimeout(() => gestureDisplay.classList.remove("active"), 200);

      const utter = new SpeechSynthesisUtterance(gesto);
      utter.lang = "es-ES";
      utter.rate = 1.05;
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    }
  } catch (e) {
    console.error("Error obteniendo gesto:", e);
  }
}

// Refresco de cámara (~40fps)
setInterval(() => {
  videoFeed.src = "/video_feed?t=" + performance.now();
}, 25);

// Polling de gestos
setInterval(actualizarGesto, 400);

// Iniciar
window.addEventListener("load", iniciarVideo);
