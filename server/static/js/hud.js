// hud.js
let score = 0;
let lives = 3;
let comboCount = 1;
let lastKillTime = 0;
const COMBO_TIMEOUT = 4000; // 4 segundos para mantener el combo

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
  // Verificar el tiempo desde la última eliminación para el combo
  const now = Date.now();
  if (now - lastKillTime <= COMBO_TIMEOUT) {
    comboCount++;
    showCombo(comboCount);
  } else {
    comboCount = 1;
  }
  lastKillTime = now;

  // Aplicar multiplicador de combo a los puntos
  const puntos = p * comboCount;
  score += puntos;
  
  // Actualizar HUD
  const scoreEl = document.getElementById("hud-score");
  const comboEl = document.getElementById("hud-combo");
  if (scoreEl) scoreEl.textContent = `🎯 Puntuación: ${score}`;
  if (comboEl) {
    comboEl.textContent = `🔥 Combo: x${comboCount}`;
    // Añadir clase active para la animación
    comboEl.classList.add('active');
    // Remover la clase después de la animación
    setTimeout(() => comboEl.classList.remove('active'), 500);
  }
  
  playSound("sound-kill");
}

function perderVida() {
  lives--;
  // Reiniciar combo al perder una vida
  comboCount = 1;
  lastKillTime = 0;
  
  // Actualizar HUD
  const livesEl = document.getElementById("hud-lives");
  const comboEl = document.getElementById("hud-combo");
  if (livesEl) livesEl.textContent = `❤️ Vidas: ${lives}`;
  if (comboEl) comboEl.textContent = `🔥 Combo: x${comboCount}`;
  
  playSound("sound-death");
  
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
