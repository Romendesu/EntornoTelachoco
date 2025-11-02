// fallback2d.js
// Minijuego 2D simple que simula la mecánica basada en gestos
(function(){
  console.log('Inicializando fallback 2D del minijuego...');

  // Crear canvas si no existe
  const existing = document.getElementById('game-2d-canvas');
  let canvas;
  if (existing) canvas = existing;
  else {
    canvas = document.createElement('canvas');
    canvas.id = 'game-2d-canvas';
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '5';
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // HUD helpers (si existen)
  const sumarPuntaje = window.sumarPuntaje || function(p){ console.log('puntaje +',p); };
  const perderVida = window.perderVida || function(){ console.log('perder vida'); };

  // Gestos y estado
  let gestos = window.gestosValidos || [];
  let ultimo = window.ultimoGesto || null;
  // observar cambios periódicamente (gestures.js actualiza window.ultimoGesto)
  setInterval(()=>{
    gestos = window.gestosValidos || gestos;
    ultimo = window.ultimoGesto || null;
  }, 200);

  // Jugador
  const player = { x: canvas.width/2, y: canvas.height - 80, w: 60, h: 60 };

  // Enemigos
  const enemies = [];

  function spawnEnemy(){
    if (!gestos || gestos.length === 0) return;
    const g = gestos[Math.floor(Math.random()*gestos.length)];
    const sz = 40 + Math.random()*30;
    enemies.push({ x: Math.random()*(canvas.width-60)+30, y: -50, w: sz, h: sz, speed: 1+Math.random()*2, gesture: g });
  }

  function update(dt){
    for(let i=enemies.length-1;i>=0;i--){
      const e = enemies[i];
      e.y += e.speed * dt * 0.06;
      // colisión con jugador
      if (e.y + e.h/2 >= player.y - player.h/2) {
        // si el gesto coincide y hay uno activo, destruir
        if (ultimo && ultimo === e.gesture) {
          // consumir gesto
          window.ultimoGesto = null;
          sumarPuntaje(10);
          enemies.splice(i,1);
        } else if (e.y > canvas.height + 100) {
          enemies.splice(i,1);
        } else if (e.y + e.h/2 >= player.y + player.h/2) {
          // paso del jugador → perder vida
          perderVida();
          enemies.splice(i,1);
        }
      }
      // fuera de pantalla
      if (e.y > canvas.height+200) enemies.splice(i,1);
    }
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Fondo tenue
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Dibujar player
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(player.x - player.w/2, player.y - player.h/2, player.w, player.h);

    // Dibujar enemigos
    enemies.forEach(e=>{
      ctx.fillStyle = '#0f0';
      ctx.fillRect(e.x - e.w/2, e.y - e.h/2, e.w, e.h);
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(e.gesture, e.x, e.y);
    });

    // Texto ayuda
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('Fallback 2D — usa gestos reales o pulsa 1..9 para simular', 120, 20);
  }

  let last = performance.now();
  function loop(t){
    const dt = t - last;
    last = t;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // spawn regular
  setInterval(spawnEnemy, 1800);

  requestAnimationFrame(loop);

})();
