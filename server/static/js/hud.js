// hud.js
let score = 0;
let lives = 3;

// Sistema de sonido
function playSound(id) {
  try {
    const sound = document.getElementById(id);
    if (sound) {
      // Si no está cargado, solicitar carga primero para asegurar reproducción
      try { sound.load(); } catch(e) {}
      sound.currentTime = 0;
      sound.play().catch(e => console.warn('Error playing sound:', e));
    }
  } catch (e) {
    console.warn('Error with sound system:', e);
  }
}

// Inicializar HUD
document.addEventListener('DOMContentLoaded', () => {
    const scoreEl = document.getElementById("hud-score");
    const livesEl = document.getElementById("hud-lives");
    if (scoreEl) scoreEl.textContent = `🎯 Puntuación: ${score}`;
    if (livesEl) livesEl.textContent = `❤️ Vidas: ${lives}`;
});

function sumarPuntaje(p) {
  score += p;
  const el = document.getElementById("hud-score");
  if (el) el.textContent = `Puntaje: ${score}`;
}

function perderVida() {
  lives--;
  const el = document.getElementById("hud-lives");
  if (el) el.textContent = `❤️ Vidas: ${lives}`;
  // Reproducir sonido de daño
  playSound('sound-death');
  // breve feedback visual
  const hud = document.getElementById("hud");
  if (hud) {
    hud.style.transform = "scale(0.98)";
    setTimeout(() => hud.style.transform = "", 150);
  }
  if (lives <= 0) {
    showGameOver();
  }
}

function showGameOver() {
  // Detener el juego
  window.gameOver = true; // flag para que enemies.js detenga spawns
  // Reproducir sonido de game over
  playSound('sound-gameover');
  
  // Mostrar overlay y menú
  const overlay = document.getElementById('game-over-overlay');
  const menu = document.getElementById('game-over-menu');
  const finalScore = document.getElementById('final-score');
  
  if (finalScore) finalScore.textContent = score;
  if (overlay) overlay.style.display = 'block';
  if (menu) menu.style.display = 'block';
  
  // Detener todos los minicubos actuales
  const minis = document.querySelectorAll('.mini-enemy');
  minis.forEach(mini => {
    try {
      const pos = mini.getAttribute('position');
      if (pos) mini.setAttribute('animation', `property: position; to: ${pos.x} ${pos.y} ${pos.z}; dur: 1`);
    } catch (e) {}
  });
}
