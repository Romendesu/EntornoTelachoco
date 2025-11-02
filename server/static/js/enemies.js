// enemies.js
// crea enemigos que muestran el gesto que los destruye

// Enemigos para A-Frame: crear sólo cuando la escena esté lista
function crearCubo() {
  const scene = document.getElementById("scene");
  if (!scene) return;
  const gv = window.gestosValidos || gestosValidos;
  if (!gv || gv.length === 0) return;

  const cube = document.createElement("a-box");
  // Solo permitir un cubo activo en la vista del usuario a la vez
  const existing = scene.querySelectorAll('.enemy');
  if (existing && existing.length > 0) return;

  // Posición de salida más lejana (distancia mayor desde el usuario)
  // Si existe un cubo morado/debug-marker, usar su eje X para alinear la recta
  let x;
  const marker = document.getElementById('debug-marker');
  if (marker) {
    try {
      const pm = marker.getAttribute('position');
      x = (pm && pm.x !== undefined) ? pm.x : ((Math.random() - 0.5) * 40);
    } catch (e) {
      x = (Math.random() - 0.5) * 40;
    }
  } else {
    x = (Math.random() - 0.5) * 40; // dentro del campo más amplio
  }
  const startZ = -40; // salida lejana para recorrer mayor distancia
  cube.setAttribute("position", `${x} 0.5 ${startZ}`); // Altura reducida y fija
  // Cubo verde por defecto (visible al usuario)
  cube.setAttribute("material", "shader: standard; color: #2ecc71; metalness: 0.3; roughness: 0.6");
  cube.setAttribute("width", "1");
  cube.setAttribute("height", "1");
  cube.setAttribute("depth", "1");
  cube.classList.add("enemy");

  const gestureForThis = gv[Math.floor(Math.random() * gv.length)];
  cube.setAttribute("data-gesture", gestureForThis);

  const group = document.createElement("a-entity");
  group.appendChild(cube);

  // Efecto de aparición
  cube.setAttribute("animation__spawn", "property: scale; from: 0.1 0.1 0.1; to: 1 1 1; dur: 500; easing: easeOutElastic");
  
  // Añadir grupo a la escena en el punto de salida consistente (misma z de inicio)
  scene.appendChild(group);
  moverCubo(group, cube, gestureForThis);
}

function moverCubo(group, cube, gestureForThis) {
  let gestoDetectado = false;
  const interval = setInterval(() => {
    if (!cube.parentNode) { clearInterval(interval); return; }
    let pos = group.getAttribute("position");
    if (!pos) pos = { x: 0, y: 0.5, z: -10 }; // Mantener altura fija
    pos.y = 0.5; // Forzar altura constante
    
    // Comprueba el gesto actual
    const currentGesto = (window.ultimoGesto !== undefined) ? window.ultimoGesto : ultimoGesto;
    
    // Si el gesto coincide y no ha sido detectado antes
    if (!gestoDetectado && currentGesto && currentGesto === gestureForThis) {
      gestoDetectado = true;
      
      // Efecto de éxito
      cube.setAttribute("material", "color: #00ff00; emissive: #00ff00; emissiveIntensity: 0.5");
      cube.setAttribute("animation__success", "property: scale; to: 0.1 0.1 0.1; dur: 300; easing: easeInOutQuad");
      
      // Efecto de partículas verdes
      const particles = document.createElement('a-entity');
      particles.setAttribute('position', `${pos.x} 1 ${pos.z}`);
      particles.setAttribute('particle-system', {
        preset: 'dust',
        particleCount: 30,
        color: '#00ff00',
        size: 0.2,
        duration: 0.5,
        randomize: false
      });
      document.querySelector('a-scene').appendChild(particles);
      
      // Resetear el gesto
      if (window.ultimoGesto !== undefined) window.ultimoGesto = null;
      try { ultimoGesto = ""; } catch (e) {}
      
      // Sumar puntos
      sumarPuntaje(10);
      
      // Eliminar el cubo
      setTimeout(() => {
        if (group.parentNode) group.parentNode.removeChild(group);
        if (particles.parentNode) particles.parentNode.removeChild(particles);
      }, 300);
      
      clearInterval(interval);
      return;
    }
    
      // Si no ha sido destruido, continúa moviéndose
      if (!gestoDetectado) {
        pos.z += 0.08;
        group.setAttribute("position", pos);

        // Verificar si el cubo ROZA la línea roja (frontMost >= 2)
        // Consideramos frontMost = pos.z + depth/2
        const depthAttr = cube.getAttribute('depth');
        const depth = parseFloat(depthAttr) || 1.0;
        const frontMost = pos.z + (depth / 2);
        if (frontMost >= 2 && !cube.getAttribute('data-touched-line')) {
          cube.setAttribute('data-touched-line', 'true');
          // Se resta vida cuando ROZA la línea
          perderVida();

          // Efecto visual de roce de línea
          cube.setAttribute("material", "color: #ff0000; emissive: #ff0000; emissiveIntensity: 0.5");
          cube.setAttribute("animation__cross", "property: scale; to: 1.2 0.8 1.2; dur: 200; easing: easeInOutQuad");

          // Partículas rojas en el punto de roce (frontMost)
          const particles = document.createElement('a-entity');
          particles.setAttribute('position', `${pos.x} 1 ${Math.min(frontMost, 2.2)}`);
          particles.setAttribute('particle-system', {
            preset: 'dust',
            particleCount: 18,
            color: '#ff5555',
            size: 0.18,
            duration: 0.35,
            randomize: false
          });
          document.querySelector('a-scene').appendChild(particles);

          setTimeout(() => {
            if (group.parentNode) group.parentNode.removeChild(group);
            if (particles.parentNode) particles.parentNode.removeChild(particles);
          }, 300);

          clearInterval(interval);
          return;
        }

      // Eliminar si se va muy lejos
      if (pos.z > 6) {
        if (group.parentNode) group.parentNode.removeChild(group);
        clearInterval(interval);
        return;
      }
    }
  }, 50);
}

function startEnemiesWhenReady() {
  const sceneEl = document.querySelector('a-scene');
  if (sceneEl && sceneEl.hasLoaded) {
    // Iniciar el sistema de spawn con control dinámico de intervalo y dificultad
    initSpawnDifficultySystem();
    scheduleNextSpawn();
    console.log('Enemies: escena cargada, iniciando sistema dinámico de spawn de minicubos');
  } else if (sceneEl) {
    sceneEl.addEventListener('loaded', () => {
      initSpawnDifficultySystem();
      scheduleNextSpawn();
      console.log('Enemies: escena cargada (loaded), iniciando sistema dinámico de spawn de minicubos');
    });
  } else {
    // fallback: esperar DOMContentLoaded y reintentar
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(startEnemiesWhenReady, 200);
    });
  }
}

startEnemiesWhenReady();

// ---------- Sistema de cola y dificultad progresiva ----------
// Cola de minicubos: cada elemento {id, gesture}
if (!window.miniQueue) window.miniQueue = [];
// Parámetros de dificultad dinámica
if (window.spawnIntervalMs === undefined) window.spawnIntervalMs = 4000; // inicio 4s
if (window.minSpawnIntervalMs === undefined) window.minSpawnIntervalMs = 1500; // mínimo 1.5s
if (window.spawnDecreaseStep === undefined) window.spawnDecreaseStep = 150; // ms a reducir cada ciclo
if (window.spawnDecreaseEvery === undefined) window.spawnDecreaseEvery = 8000; // ms entre reducciones
if (window.miniSpeed === undefined) window.miniSpeed = 0.16; // velocidad inicial (z per tick)
if (window.miniSpeedIncreaseStep === undefined) window.miniSpeedIncreaseStep = 0.01; // incremento de velocidad
if (window.miniSpeedIncreaseEvery === undefined) window.miniSpeedIncreaseEvery = 8000; // ms entre aumentos de velocidad

let _spawnDifficultyTimer = null;
function initSpawnDifficultySystem() {
  // Evitar múltiples timers
  if (_spawnDifficultyTimer) return;
  _spawnDifficultyTimer = setInterval(() => {
    // Reducir intervalo hasta el mínimo
    if (window.spawnIntervalMs > window.minSpawnIntervalMs) {
      window.spawnIntervalMs = Math.max(window.minSpawnIntervalMs, window.spawnIntervalMs - window.spawnDecreaseStep);
      console.log('Spawn interval decreased to', window.spawnIntervalMs);
    }
    // Aumentar velocidad ligeramente
    window.miniSpeed = +(window.miniSpeed + window.miniSpeedIncreaseStep).toFixed(4);
    console.log('Mini speed increased to', window.miniSpeed);
  }, Math.max(1000, window.spawnDecreaseEvery));
}

// scheduleNextSpawn usa setTimeout para permitir cambiar window.spawnIntervalMs dinámicamente
function scheduleNextSpawn() {
  setTimeout(() => {
    // No spawnar más si es game over
    if (window.gameOver) return;
    
    try { spawnMiniFromMarker(); } catch (e) { console.warn('Error en spawnMiniFromMarker', e); }
    // programar siguiente spawn con el intervalo actual
    scheduleNextSpawn();
  }, Math.max(200, window.spawnIntervalMs));
}

// --- Generador de minicubos desde múltiples líneas de spawneo ---
function getRandomSpawnPosition() {
  const scene = document.getElementById('scene');
  if (!scene) return null;
  const marker = document.getElementById('debug-marker');
  
  // Leer posición del marker como referencia
  let pm = marker ? marker.getAttribute('position') : { x: 0, y: 3, z: -3 };
  if (!pm) pm = { x: 0, y: 3, z: -3 };
  
  const spawnDistance = 30; // distancia base desde el marker
  const markerZ = (pm.z || -3);
  const markerX = pm.x || 0;
  
  // 3 líneas de spawn: izquierda, centro y derecha
  const spawnLines = [
    { x: markerX - 15, z: markerZ - spawnDistance }, // línea izquierda
    { x: markerX, z: markerZ - spawnDistance },      // línea central (original)
    { x: markerX + 15, z: markerZ - spawnDistance }  // línea derecha
  ];
  
  // Elegir una línea aleatoria
  const line = spawnLines[Math.floor(Math.random() * spawnLines.length)];
  
  // Añadir variación aleatoria en X dentro de la línea elegida (±3 unidades)
  const randomOffset = (Math.random() - 0.5) * 6;
  return {
    x: line.x + randomOffset,
    z: line.z
  };
}

function spawnMiniFromMarker() {
  const scene = document.getElementById('scene');
  if (!scene) return;

  const spawnPos = getRandomSpawnPosition();
  if (!spawnPos) return;

  // Crear un minicubo oscuro que se moverá únicamente hacia la línea roja
  createMiniCube(spawnPos.x, 0.5, spawnPos.z);

  // Añadir líneas visuales para cada punto de spawn (si no existen)
  try {
    const marker = document.getElementById('debug-marker');
    const pm = marker ? marker.getAttribute('position') : { x: 0, y: 3, z: -3 };
    const markerX = pm.x || 0;
    const markerZ = (pm.z || -3);
    const spawnDistance = 30;
    const baseZ = markerZ - spawnDistance;
    
    const sceneEl = document.getElementById('scene');
    // Crear/actualizar líneas para los tres puntos de spawn
    const lines = [
      { id: 'gen-line-left', x: markerX - 15, z: baseZ + 5, opacity: 0.35 },
      { id: 'gen-line-center', x: markerX, z: baseZ + 5, opacity: 0.35 },
      { id: 'gen-line-right', x: markerX + 15, z: baseZ + 5, opacity: 0.35 },
      // Segunda fila de líneas (más cercanas)
      { id: 'gen-line-left-2', x: markerX - 15, z: baseZ + 10, opacity: 0.28 },
      { id: 'gen-line-center-2', x: markerX, z: baseZ + 10, opacity: 0.28 },
      { id: 'gen-line-right-2', x: markerX + 15, z: baseZ + 10, opacity: 0.28 }
    ];
    
    lines.forEach(line => {
      let lineEl = document.getElementById(line.id);
      if (!lineEl) {
        lineEl = document.createElement('a-box');
        lineEl.id = line.id;
        lineEl.setAttribute('width', '6');
        lineEl.setAttribute('height', '0.06');
        lineEl.setAttribute('depth', '0.06');
        sceneEl.appendChild(lineEl);
      }
      lineEl.setAttribute('position', `${line.x} 0.08 ${line.z}`);
      lineEl.setAttribute('material', `color: #ff8844; opacity: ${line.opacity};`);
    });
  } catch (e) {
    console.warn('No se pudieron crear las líneas del generador', e);
  }
}

function createMiniCube(x, y, z) {
  const scene = document.getElementById('scene');
  if (!scene) return;

  const mini = document.createElement('a-entity');
  // asignar id único
  const id = 'mini-' + Date.now() + '-' + Math.floor(Math.random()*1000);
  mini.setAttribute('id', id);
  // seleccionar gesto objetivo para este minicubo
  const gv = window.gestosValidos || gestosValidos || [];
  const gestureForMini = (gv.length > 0) ? gv[Math.floor(Math.random() * gv.length)] : 'gesto';
  mini.setAttribute('data-gesture', gestureForMini);
  // Encolar el mini: solo el primero mostrará su gesto en HUD
  try {
    if (!window.miniQueue) window.miniQueue = [];
    window.miniQueue.push({ id: id, gesture: gestureForMini });
    // Si es el primero en la cola, mostrar su gesto en la tarjeta
    if (window.miniQueue.length === 1) {
      const card = document.getElementById('mini-gesture-card');
      const txt = document.getElementById('mini-gesture-text');
      if (txt) txt.textContent = gestureForMini;
      if (card) card.classList.remove('hidden');
      window.currentMiniId = id;
    }
  } catch (e) { console.warn('Error en cola de minis', e); }
  mini.classList.add('mini-enemy');
  mini.setAttribute('position', `${x} ${y} ${z}`);
    // usar modelo GLB del Butter Robot (si assets disponibles) y aumentar su tamaño
  try {
    // Usar el modelo precargado en a-assets
    mini.setAttribute('gltf-model', '#butter-robot');
    // Hacemos el mini-robot más grande para visibilidad
    mini.setAttribute('scale', '2.2 2.2 2.2');
    // Rotación para que mire hacia la cámara
    mini.setAttribute('rotation', '0 180 0');
    // indicar profundidad física aproximada para colisiones/chequeo de línea
    mini.setAttribute('depth', '1.2');    // Debug - imprimir información de carga
    console.log('Creando mini con modelo precargado');
    
    // Escuchar evento de carga/error del modelo
    mini.addEventListener('model-loaded', () => {
      console.log('Mini modelo cargado correctamente');
    });
    mini.addEventListener('model-error', (e) => {
      console.error('Error cargando mini modelo:', e);
      // Si falla, mostrar el fallback
      mini.innerHTML = `<a-box width="1.2" height="1.2" depth="1.2" material="shader: standard; color: #0b6623; metalness: 0.2; roughness: 0.8"></a-box>`;
    });
  } catch (e) {
    console.error('Error configurando mini:', e);
    // fallback a caja si no carga
    mini.innerHTML = `<a-box width="1.2" height="1.2" depth="1.2" material="shader: standard; color: #0b6623; metalness: 0.2; roughness: 0.8"></a-box>`;
    mini.setAttribute('depth', '1.2');
  }


  // pequeña marca para debug opcional
  // mini.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 3000');

  scene.appendChild(mini);
  moverMiniCube(mini);
}

function moverMiniCube(mini) {
  const interval = setInterval(() => {
    if (!mini.parentNode) { clearInterval(interval); return; }
    let pos = mini.getAttribute('position');
    if (!pos) pos = { x: 0, y: 0.5, z: -3 };
    pos.y = 0.5; // mantener en el suelo

    // Movimiento únicamente hacia la línea (eje Z positivo)
    // Usar velocidad dinámica definida en window.miniSpeed
    const speed = (window.miniSpeed !== undefined) ? window.miniSpeed : 0.16;
    pos.z += speed; // velocidad de los minicubos
    mini.setAttribute('position', pos);

    // Primero, comprobar si el jugador hizo el gesto que destruye este mini
    const currentGesto = (window.ultimoGesto !== undefined) ? window.ultimoGesto : ultimoGesto;
    const miniGesture = mini.getAttribute('data-gesture');
    // Solo el primer minicubo en cola puede consumir el gesto y mostrarse en HUD
    const isFirstInQueue = (window.miniQueue && window.miniQueue.length > 0 && window.miniQueue[0].id === mini.getAttribute('id'));
    if (currentGesto && miniGesture && currentGesto === miniGesture && !mini.getAttribute('data-destroyed') && isFirstInQueue) {
      // Destrucción por gesto
      mini.setAttribute('data-destroyed', 'true');
      // Reproducir sonido de destrucción
      try {
        const sound = document.getElementById('sound-kill');
        if (sound) {
          sound.currentTime = 0;
          sound.play().catch(e => {});
        }
      } catch (e) {}
      // efecto verde
      mini.setAttribute('material', 'color: #22ff66; emissive: #22ff66; emissiveIntensity: 0.6');
      mini.setAttribute('animation__destroy', 'property: scale; to: 0.05 0.05 0.05; dur: 220; easing: easeInOutQuad');
      const particles = document.createElement('a-entity');
      particles.setAttribute('position', `${pos.x} 0.8 ${pos.z}`);
      particles.setAttribute('particle-system', {
        preset: 'dust',
        particleCount: 26,
        color: '#a8ffb0',
        size: 0.16,
        duration: 0.45,
        randomize: false
      });
      document.querySelector('a-scene').appendChild(particles);

      // sumar puntos
      sumarPuntaje(10);
      // Quitar este mini de la cola y mostrar el siguiente (si hay)
      try {
        if (!window.miniQueue) window.miniQueue = [];
        const idx = window.miniQueue.findIndex(it => it.id === mini.getAttribute('id'));
        if (idx !== -1) window.miniQueue.splice(idx, 1);
        // Si el eliminado era el primero, actualizar HUD con el nuevo primero
        const card = document.getElementById('mini-gesture-card');
        const txt = document.getElementById('mini-gesture-text');
        if (idx === 0) {
          if (window.miniQueue.length > 0) {
            const next = window.miniQueue[0];
            if (txt) txt.textContent = next.gesture;
            window.currentMiniId = next.id;
            if (card) card.classList.remove('hidden');
          } else {
            if (card) card.classList.add('hidden');
            window.currentMiniId = null;
          }
        }
      } catch (e) { console.warn('Error actualizando cola tras destruir mini', e); }

      setTimeout(() => {
        if (mini.parentNode) mini.parentNode.removeChild(mini);
        if (particles.parentNode) particles.parentNode.removeChild(particles);
      }, 260);
      clearInterval(interval);
      // reset gesto para evitar múltiples destrucciones
      if (window.ultimoGesto !== undefined) window.ultimoGesto = null;
      try { ultimoGesto = ""; } catch (e) {}
      return;
    }

    // Detectar roce con la única línea roja (z = 2)
    const depthAttr = mini.getAttribute('depth');
    const depth = parseFloat(depthAttr) || 0.6;
    const frontMost = pos.z + (depth / 2);
    const deathLines = [2];
    const touchedLine = deathLines.find(lineZ => frontMost >= lineZ);
    if (touchedLine !== undefined && !mini.getAttribute('data-touched-line')) {
      mini.setAttribute('data-touched-line', 'true');
      // Descontar vida
      perderVida();

      // Efecto visual
      mini.setAttribute('material', 'color: #7a2e1a; emissive: #7a2e1a; emissiveIntensity: 0.4');
      mini.setAttribute('animation__hit', 'property: scale; to: 1.6 0.4 1.6; dur: 180; easing: easeOutQuad');

      const particles = document.createElement('a-entity');
      particles.setAttribute('position', `${pos.x} 0.8 ${Math.min(frontMost, touchedLine + 0.2)}`);
      particles.setAttribute('particle-system', {
        preset: 'dust',
        particleCount: 16,
        color: '#ff5555',
        size: 0.14,
        duration: 0.35,
        randomize: false
      });
      document.querySelector('a-scene').appendChild(particles);

      // Quitar este mini de la cola y mostrar el siguiente (si hay)
      try {
        if (!window.miniQueue) window.miniQueue = [];
        const idx = window.miniQueue.findIndex(it => it.id === mini.getAttribute('id'));
        if (idx !== -1) window.miniQueue.splice(idx, 1);
        const card = document.getElementById('mini-gesture-card');
        const txt = document.getElementById('mini-gesture-text');
        if (idx === 0) {
          if (window.miniQueue.length > 0) {
            const next = window.miniQueue[0];
            if (txt) txt.textContent = next.gesture;
            window.currentMiniId = next.id;
            if (card) card.classList.remove('hidden');
          } else {
            if (card) card.classList.add('hidden');
            window.currentMiniId = null;
          }
        }
      } catch (e) { console.warn('Error actualizando cola tras touching line', e); }

      setTimeout(() => {
        if (mini.parentNode) mini.parentNode.removeChild(mini);
        if (particles.parentNode) particles.parentNode.removeChild(particles);
      }, 300);

      clearInterval(interval);
      return;
    }

    // Si se aleja demasiado, eliminar
    if (pos.z > 6) {
      if (mini.parentNode) mini.parentNode.removeChild(mini);
      clearInterval(interval);
      return;
    }
  }, 50);
}
