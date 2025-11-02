// assets-loader.js
// Carga modelos y activa audio de forma diferida para mejorar el tiempo de carga inicial.
// - Busca elementos con `data-model-src` y les asigna gltf-model/obj-model según extensión.
// - Respeta `data-scale` y `data-rotation` si están presentes.
// - Carga los assets de forma escalonada para bajar el pico de red.
// - Expone window.lazyLoadModels() y activa la carga en la primera interacción del usuario.

(function(){
  const STAGGER_MS = 350; // retardo entre cada carga para aplanar picos

  // Crear overlay de carga
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'loading-overlay';
  loadingOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    font-family: 'Quicksand', system-ui, sans-serif;
    color: white;
    backdrop-filter: blur(8px);
  `;

  const loadingContent = document.createElement('div');
  loadingContent.style.cssText = `
    text-align: center;
    padding: 2rem;
    background: rgba(255,255,255,0.1);
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    min-width: 300px;
  `;

  const loadingTitle = document.createElement('h2');
  loadingTitle.textContent = 'Cargando Assets';
  loadingTitle.style.marginBottom = '1rem';

  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    width: 100%;
    height: 8px;
    background: rgba(255,255,255,0.2);
    border-radius: 4px;
    overflow: hidden;
    margin: 1rem 0;
  `;

  const progressFill = document.createElement('div');
  progressFill.style.cssText = `
    width: 0%;
    height: 100%;
    background: #66d9ff;
    transition: width 0.3s ease-out;
  `;
  progressBar.appendChild(progressFill);

  const loadingText = document.createElement('div');
  loadingText.style.fontSize = '0.9rem';
  loadingText.style.opacity = '0.8';

  loadingContent.appendChild(loadingTitle);
  loadingContent.appendChild(progressBar);
  loadingContent.appendChild(loadingText);
  loadingOverlay.appendChild(loadingContent);
  document.body.appendChild(loadingOverlay);

  // Variables de progreso
  let totalAssets = 0;
  let loadedAssets = 0;

  function updateProgress() {
    const percentage = Math.round((loadedAssets / totalAssets) * 100);
    progressFill.style.width = percentage + '%';
    loadingText.textContent = `Cargando ${loadedAssets} de ${totalAssets} elementos (${percentage}%)`;
    
    if (loadedAssets >= totalAssets) {
      setTimeout(() => {
        loadingOverlay.style.opacity = '0';
        loadingOverlay.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => loadingOverlay.remove(), 500);
      }, 500);
    }
  }

  function setModelAttr(el, src){
    if(!src) return;
    const lower = src.toLowerCase();
    try {
      // Asegurarnos que las rutas empiecen con / y codificar espacios
      let assetPath = src;
      if (!assetPath.startsWith('/')) assetPath = '/' + assetPath;
      
      // Debug
      console.log('Cargando modelo:', assetPath);

      if (lower.endsWith('.glb') || lower.endsWith('.gltf')) {
        // Para GLB/GLTF asegurarnos que el path está bien codificado
        const encodedPath = assetPath.split('/').map(part => encodeURIComponent(part)).join('/');
        console.log('Ruta codificada:', encodedPath);
        el.setAttribute('gltf-model', encodedPath);
        
        // Escuchar eventos de carga/error
        el.addEventListener('model-loaded', () => {
          console.log('Modelo cargado:', encodedPath);
          loadedAssets++;
          updateProgress();
        });
        el.addEventListener('model-error', (e) => {
          console.error('Error cargando modelo:', encodedPath, e);
          loadedAssets++;
          updateProgress();
        });
      } else if (lower.endsWith('.obj')) {
        el.setAttribute('obj-model', `obj: ${assetPath}`);
        if (!el.getAttribute('material')) {
          el.setAttribute('material', 'color: #cccccc; metalness: 0.2; roughness: 0.8');
        }
      } else {
        el.setAttribute('gltf-model', assetPath);
      }

      // Escuchar evento de carga del modelo
      el.addEventListener('model-loaded', () => {
        loadedAssets++;
        updateProgress();
      }, { once: true });

      // Por si falla la carga, también contar
      el.addEventListener('model-error', () => {
        loadedAssets++;
        updateProgress();
      }, { once: true });

    } catch(e){
      console.warn('assets-loader: no se pudo asignar modelo a', el, e);
      loadedAssets++;
      updateProgress();
    }
  }

  function applyTransforms(el){
    const s = el.getAttribute('data-scale');
    if(s) el.setAttribute('scale', s);
    const r = el.getAttribute('data-rotation');
    if(r) el.setAttribute('rotation', r);
    const p = el.getAttribute('data-position');
    if(p) el.setAttribute('position', p);
  }

  function loadAllModels(){
    const placeholders = Array.from(document.querySelectorAll('[data-model-src]'));
    const audios = Array.from(document.querySelectorAll('audio[preload="none"]'));
    
    totalAssets = placeholders.length + audios.length;
    updateProgress();

    placeholders.forEach((el, idx) => {
      const src = el.getAttribute('data-model-src');
      setTimeout(() => {
        applyTransforms(el);
        setModelAttr(el, src);
        el.removeAttribute('data-model-src');
      }, idx * STAGGER_MS);
    });

    // Cargar audios
    audios.forEach(audio => {
      try {
        audio.addEventListener('canplaythrough', () => {
          loadedAssets++;
          updateProgress();
        }, { once: true });
        audio.load();
      } catch(e) {
        loadedAssets++;
        updateProgress();
      }
    });
  }

  // Exponer API pública
  window.lazyLoadModels = function(force){
    if (window._assetsLoaderStarted && !force) return;
    window._assetsLoaderStarted = true;
    loadAllModels();
  };

  // Cargar inmediatamente cuando la escena esté lista
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (!window._assetsLoaderStarted) {
        window.lazyLoadModels();
      }
    }, 500);
  });
})();
