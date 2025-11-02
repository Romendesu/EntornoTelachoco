// main.js - inicialización general
console.log("Iniciando minijuego...");

// inicializa video feed y refresco ligero (no demasiado agresivo)
const videoFeed = document.getElementById("videoFeed");
function iniciarVideo() {
  if (!videoFeed) return;
  videoFeed.src = "/video_feed";
  // refresco moderado para no sobrecargar (≈30-35 fps)
  setInterval(() => {
    videoFeed.src = "/video_feed?t=" + performance.now();
  }, 30);
}
window.addEventListener("load", iniciarVideo);
// Modo debug: permitir simular gestos con teclas numéricas 1..9
window.addEventListener('keydown', (ev) => {
  // evitar cuando el usuario escribe en un input
  if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) return;
  const k = ev.key;
  if (/[1-9]/.test(k)) {
    const idx = parseInt(k, 10) - 1;
    const gv = window.gestosValidos || [];
    if (gv[idx]) {
      window.ultimoGesto = gv[idx];
      const el = document.getElementById('gesto-actual');
      if (el) el.textContent = `🔧 ${window.ultimoGesto} (simulado)`;
      console.log('Gesto simulado:', window.ultimoGesto);
    }
  }
});
