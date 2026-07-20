/**
 * game.js — Minijuego "Atrapa el ramo"
 * Motor Canvas HTML5 a ~60 FPS, responsive, táctil + teclado.
 * Sonidos con Web Audio API (sin MP3 externos).
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Constantes de juego
  // ---------------------------------------------------------------------------
  const GAME_DURATION = 30; // segundos base
  const HS_KEY = 'boda_ramo_highscore'; // récord local
  const MUTE_KEY = 'boda_ramo_muted';

  // Tipos de objetos que caen
  const ITEM_TYPES = {
    normal: { weight: 55, points: 10, radius: 28, color: '#e8b4c8', glow: null },
    golden: { weight: 12, points: 30, radius: 30, color: '#d4af37', glow: '#ffe08a' },
    power: { weight: 15, points: 0, radius: 24, color: '#8ecae6', glow: '#bde0fe' },
    obstacle: { weight: 18, points: -10, radius: 26, color: '#c9a66b', glow: null },
  };

  // ---------------------------------------------------------------------------
  // Estado del módulo
  // ---------------------------------------------------------------------------
  let canvas, ctx, wrap;
  let dpr = 1;
  let W = 0, H = 0;
  let basket = { x: 0, y: 0, w: 72, h: 28 };
  let items = [];
  let particles = [];
  let score = 0;
  let combo = 1;
  let comboTimer = 0;
  let timeLeft = GAME_DURATION;
  let frozen = 0; // segundos de congelación restantes
  let speedBoost = 0; // velocidad extra temporal
  let playing = false;
  let rafId = null;
  let lastTs = 0;
  let spawnAcc = 0;
  let playerName = '';
  let keys = { left: false, right: false };
  let muted = localStorage.getItem(MUTE_KEY) === '1';
  let audioCtx = null;

  // ---------------------------------------------------------------------------
  // Inicialización pública (llamada desde main.js)
  // ---------------------------------------------------------------------------
  window.initCatchBouquetGame = function initCatchBouquetGame() {
    wrap = document.getElementById('game-canvas-wrap');
    canvas = document.getElementById('game-canvas');
    if (!canvas || !wrap) return;

    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', () => {
      resizeCanvas();
      if (!playing) drawIdleFrame();
      else drawFrame();
    });

    // Cuando el contenedor pasa de oculto a visible (abrir invitación), recalcular tamaño
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        const prevW = W;
        resizeCanvas();
        if (W > 0 && (prevW === 0 || !playing)) drawIdleFrame();
      });
      ro.observe(wrap);
      const arena = document.getElementById('game-board');
      if (arena) ro.observe(arena);
    }

    // Controles
    setupPointerControls();
    setupKeyboard();

    // UI overlays
    document.getElementById('btn-start-game')?.addEventListener('click', onStartClick);
    document.getElementById('btn-play-again')?.addEventListener('click', showStartOverlay);
    document.getElementById('btn-game-mute')?.addEventListener('click', toggleMute);

    updateMuteButton();
    updateHud();
    updateHighScoreLabel();
    // Si aún está oculto, no dibujar; se dibujará al tener tamaño real
    if (W > 0) drawIdleFrame();
    loadLeaderboard();
  };

  /** Llamar al abrir la invitación o al mostrar la sección del juego */
  window.refreshBouquetGameCanvas = function refreshBouquetGameCanvas() {
    resizeCanvas();
    if (W > 0 && !playing) drawIdleFrame();
  };

  // ---------------------------------------------------------------------------
  // Canvas responsive — tamaño fiable en móvil (sin trucos de DPR que fallan)
  // ---------------------------------------------------------------------------
  function resizeCanvas() {
    if (!canvas || !wrap || !ctx) return;

    // Medir el área visible real del escenario
    const arena = document.getElementById('game-board');
    const rect = (arena || wrap).getBoundingClientRect();
    let cssW = Math.round(rect.width) || wrap.clientWidth || arena?.clientWidth || 0;
    if (cssW < 40) cssW = Math.min(480, Math.max(280, window.innerWidth - 48));

    // Altura fija generosa para que siempre se vea el campo de juego
    const cssH = 380;

    wrap.style.width = '100%';
    wrap.style.height = `${cssH}px`;
    arena && (arena.style.minHeight = `${cssH}px`);

    // IMPORTANTE: buffer = píxeles CSS (sin devicePixelRatio).
    // En algunos móviles el escalado DPR dejaba el dibujo “invisible”.
    // Un poco menos nítido en retina, pero SIEMPRE visible.
    const bw = Math.max(280, cssW);
    const bh = cssH;
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    canvas.style.width = '100%';
    canvas.style.height = `${cssH}px`;
    canvas.style.display = 'block';
    canvas.style.visibility = 'visible';
    canvas.style.opacity = '1';
    canvas.style.position = 'relative';
    canvas.style.zIndex = '1';

    // Reset de matriz en cada resize
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    W = bw;
    H = bh;
    basket.w = Math.max(80, Math.min(110, W * 0.22));
    basket.h = basket.w * 0.42;
    basket.y = H - basket.h - 20;
    if (!playing || basket.x < basket.w / 2 || basket.x > W - basket.w / 2) {
      basket.x = W / 2;
    }
    dpr = 1;
  }

  // ---------------------------------------------------------------------------
  // Controles: ratón, táctil y teclado
  // ---------------------------------------------------------------------------
  function setupPointerControls() {
    const moveTo = (clientX) => {
      if (!playing && !canvas.hasPointerCapture?.(0)) {
        // permite mover también en idle / durante partida
      }
      const rect = canvas.getBoundingClientRect();
      basket.x = clientX - rect.left;
      basket.x = Math.max(basket.w / 2, Math.min(W - basket.w / 2, basket.x));
      if (!playing) drawIdleFrame();
    };

    canvas.addEventListener('pointerdown', (e) => {
      canvas.setPointerCapture(e.pointerId);
      moveTo(e.clientX);
    });
    // Arrastre táctil y movimiento de ratón
    canvas.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse' || e.buttons > 0 || canvas.hasPointerCapture(e.pointerId)) {
        moveTo(e.clientX);
      }
    });
  }

  function setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    });
  }

  // ---------------------------------------------------------------------------
  // Flujo de pantallas
  // ---------------------------------------------------------------------------
  function onStartClick() {
    const input = document.getElementById('game-player-name');
    playerName = (input?.value || '').trim();
    if (!playerName) {
      input?.focus();
      input?.classList.add('is-invalid');
      return;
    }
    input?.classList.remove('is-invalid');
    ensureAudio();
    startGame();
  }

  function showStartOverlay() {
    document.getElementById('game-start')?.classList.remove('hidden');
    document.getElementById('game-result')?.classList.add('hidden');
    resizeCanvas();
    drawIdleFrame();
    loadLeaderboard();
  }

  function startGame() {
    resizeCanvas();
    if (W < 40 || H < 40) {
      requestAnimationFrame(() => {
        resizeCanvas();
        beginRound();
      });
      return;
    }
    beginRound();
  }

  function beginRound() {
    score = 0;
    combo = 1;
    comboTimer = 0;
    timeLeft = GAME_DURATION;
    frozen = 0;
    speedBoost = 0;
    items = [];
    particles = [];
    playing = true;
    spawnAcc = 0.5; // primer objeto casi al instante
    lastTs = 0;
    basket.x = W / 2;

    document.getElementById('game-start')?.classList.add('hidden');
    document.getElementById('game-result')?.classList.add('hidden');
    updateHud();
    drawFrame(); // primer frame visible ya

    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }

  async function endGame() {
    playing = false;
    cancelAnimationFrame(rafId);

    // Récord local
    const prev = Number(localStorage.getItem(HS_KEY) || 0);
    const isRecord = score > prev;
    if (isRecord) localStorage.setItem(HS_KEY, String(score));
    updateHighScoreLabel();

    // Estrellas según puntuación
    const stars = score >= 200 ? 3 : score >= 100 ? 2 : score >= 40 ? 1 : 0;
    setStars(stars);

    setTextSafe('result-score', String(score));
    setTextSafe(
      'result-prize',
      isRecord
        ? '¡Nuevo récord personal! 🌟'
        : stars === 3
          ? '¡Increíble! Eres un crack del ramo'
          : stars === 2
            ? '¡Muy bien! Casi un récord'
            : stars === 1
              ? 'Buen intento — ¡prueba otra vez!'
              : '¡Gracias por jugar!'
    );

    document.getElementById('game-result')?.classList.remove('hidden');

    if (isRecord || score >= 100) {
      burstConfetti(W / 2, H / 2, 60);
      playVictory();
      if (typeof fireFloralConfetti === 'function') fireFloralConfetti();
    }

    // Guardar en ranking del servidor
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, score }),
      });
    } catch { /* offline ok */ }

    loadLeaderboard();
  }

  function setStars(n) {
    const el = document.getElementById('result-stars');
    if (!el) return;
    el.innerHTML = [1, 2, 3]
      .map((i) => `<span class="star ${i <= n ? 'is-on' : ''}">★</span>`)
      .join('');
  }

  // ---------------------------------------------------------------------------
  // Bucle principal (~60 FPS)
  // ---------------------------------------------------------------------------
  function loop(ts) {
    if (!playing) return;
    if (!lastTs) lastTs = ts;
    let dt = Math.min(0.05, (ts - lastTs) / 1000); // clamp para pestañas en segundo plano
    lastTs = ts;

    // Congelación: el tiempo no baja, pero la cesta sí se mueve
    if (frozen > 0) {
      frozen -= dt;
      dt *= 0.15; // objetos casi quietos
    } else {
      timeLeft -= dt;
      if (speedBoost > 0) speedBoost -= dt;
    }

    // Teclado
    const keySpeed = 380 * (speedBoost > 0 ? 1.35 : 1);
    if (keys.left) basket.x -= keySpeed * dt;
    if (keys.right) basket.x += keySpeed * dt;
    basket.x = Math.max(basket.w / 2, Math.min(W - basket.w / 2, basket.x));

    if (comboTimer > 0) {
      comboTimer -= dt;
      if (comboTimer <= 0) combo = 1;
    }

    // Spawn
    spawnAcc += dt;
    const spawnEvery = Math.max(0.35, 0.85 - (GAME_DURATION - Math.max(0, timeLeft)) * 0.012);
    while (spawnAcc >= spawnEvery) {
      spawnAcc -= spawnEvery;
      spawnItem();
    }

    // Actualizar items
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.vy += it.gravity * dt;
      it.y += it.vy * dt;
      it.x += it.vx * dt;
      it.rot += it.spin * dt;

      if (hitBasket(it)) {
        catchItem(it);
        items.splice(i, 1);
        continue;
      }
      if (it.y - it.r > H + 20) items.splice(i, 1);
    }

    // Partículas
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 280 * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    updateHud();
    drawFrame();

    if (timeLeft <= 0) {
      timeLeft = 0;
      updateHud();
      endGame();
      return;
    }

    rafId = requestAnimationFrame(loop);
  }

  // ---------------------------------------------------------------------------
  // Spawn y colisiones
  // ---------------------------------------------------------------------------
  function pickType() {
    const roll = Math.random() * 100;
    let acc = 0;
    for (const [key, conf] of Object.entries(ITEM_TYPES)) {
      acc += conf.weight;
      if (roll < acc) return key;
    }
    return 'normal';
  }

  function spawnItem() {
    const type = pickType();
    const conf = ITEM_TYPES[type];
    const r = conf.radius * (0.9 + Math.random() * 0.2);
    items.push({
      type,
      x: r + Math.random() * (W - r * 2),
      y: -r - 10,
      r,
      vx: (Math.random() - 0.5) * 40,
      vy: 80 + Math.random() * 60,
      gravity: 220 + Math.random() * 80,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 4,
      conf,
    });
  }

  function hitBasket(it) {
    const left = basket.x - basket.w / 2;
    const right = basket.x + basket.w / 2;
    const top = basket.y;
    const bottom = basket.y + basket.h * 0.55;
    return (
      it.y + it.r * 0.4 >= top &&
      it.y - it.r * 0.2 <= bottom &&
      it.x >= left &&
      it.x <= right
    );
  }

  function catchItem(it) {
    if (it.type === 'normal') {
      const pts = ITEM_TYPES.normal.points * combo;
      score += pts;
      bumpCombo();
      burstParticles(it.x, it.y, '#e8b4c8', 14);
      playCatch(false);
    } else if (it.type === 'golden') {
      score += ITEM_TYPES.golden.points * combo;
      bumpCombo();
      speedBoost = 4;
      burstParticles(it.x, it.y, '#d4af37', 28);
      playCatch(true);
    } else if (it.type === 'power') {
      // 50% congela / 50% +5s
      if (Math.random() < 0.5) {
        frozen = 3;
        flashHud('¡Tiempo congelado!');
      } else {
        timeLeft = Math.min(GAME_DURATION + 10, timeLeft + 5);
        flashHud('+5 segundos');
      }
      burstParticles(it.x, it.y, '#8ecae6', 18);
      playPower();
    } else if (it.type === 'obstacle') {
      score = Math.max(0, score + ITEM_TYPES.obstacle.points);
      combo = 1;
      comboTimer = 0;
      burstParticles(it.x, it.y, '#8b6914', 10);
      playMiss();
    }
  }

  function bumpCombo() {
    combo = Math.min(5, combo + 1);
    comboTimer = 1.6;
  }

  // ---------------------------------------------------------------------------
  // Dibujado
  // ---------------------------------------------------------------------------
  function drawFrame() {
    if (!ctx || W < 10 || H < 10) return;
    // Asegurar transform limpia cada frame (evita bugs de móvil)
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    drawBackground();
    // Velos de power-up
    if (frozen > 0) {
      ctx.fillStyle = 'rgba(142, 202, 230, 0.18)';
      ctx.fillRect(0, 0, W, H);
    }
    if (speedBoost > 0) {
      ctx.fillStyle = 'rgba(212, 175, 55, 0.12)';
      ctx.fillRect(0, 0, W, H);
    }

    items.forEach(drawItem);
    particles.forEach(drawParticle);
    drawBasket();
  }

  function drawIdleFrame() {
    if (!ctx || W < 10 || H < 10) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawBackground();
    drawBasket();
  }

  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#f7f1e8');
    g.addColorStop(0.55, '#efe6d8');
    g.addColorStop(1, '#e4d5c2');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Textura sutil
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 18; i++) {
      const x = (i * 97) % W;
      const y = (i * 53) % H;
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawBasket() {
    const x = basket.x;
    const y = basket.y;
    const w = basket.w;
    const h = basket.h;

    ctx.save();
    // Sombra
    ctx.fillStyle = 'rgba(58,58,58,0.12)';
    ctx.beginPath();
    ctx.ellipse(x, y + h + 4, w * 0.45, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cuerpo cesta
    const basketGrad = ctx.createLinearGradient(x, y, x, y + h);
    basketGrad.addColorStop(0, '#c4a484');
    basketGrad.addColorStop(1, '#8b6b4a');
    ctx.fillStyle = basketGrad;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x + w / 2 - 8, y + h);
    ctx.lineTo(x - w / 2 + 8, y + h);
    ctx.closePath();
    ctx.fill();

    // Borde superior
    ctx.strokeStyle = '#6d5340';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - w / 2 - 2, y);
    ctx.lineTo(x + w / 2 + 2, y);
    ctx.stroke();

    // Asas / manos
    ctx.strokeStyle = '#5c4636';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x - w * 0.28, y - 2, 10, Math.PI * 0.15, Math.PI * 0.95);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + w * 0.28, y - 2, 10, Math.PI * 0.05, Math.PI * 0.85);
    ctx.stroke();

    ctx.restore();
  }

  function drawItem(it) {
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.rot);

    if (it.conf.glow) {
      ctx.shadowColor = it.conf.glow;
      ctx.shadowBlur = 16;
    }

    if (it.type === 'normal' || it.type === 'golden') {
      drawBouquet(it.r, it.type === 'golden');
    } else if (it.type === 'power') {
      // Alterna visual cava / anillo según posición
      if (Math.floor(it.x) % 2 === 0) drawChampagne(it.r);
      else drawRing(it.r);
    } else {
      drawCake(it.r);
    }

    ctx.restore();
  }

  function drawBouquet(r, golden) {
    const petals = golden ? '#f0d878' : '#f0c0d0';
    const center = golden ? '#c9a227' : '#d4849a';
    const leaf = '#7d9f7e';
    ctx.fillStyle = leaf;
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, r * 0.35, r * 0.35, r * 0.18, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.35, r * 0.35, r * 0.35, r * 0.18, 0.6, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.fillStyle = petals;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * r * 0.35, Math.sin(a) * r * 0.35 - r * 0.1, r * 0.32, r * 0.22, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = center;
    ctx.beginPath();
    ctx.arc(0, -r * 0.1, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawChampagne(r) {
    ctx.fillStyle = '#f5f0e0';
    ctx.beginPath();
    ctx.moveTo(-r * 0.25, -r * 0.6);
    ctx.lineTo(r * 0.25, -r * 0.6);
    ctx.lineTo(r * 0.18, r * 0.15);
    ctx.lineTo(-r * 0.18, r * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8d48a';
    ctx.fillRect(-r * 0.12, r * 0.15, r * 0.24, r * 0.45);
    ctx.fillStyle = '#c4a882';
    ctx.fillRect(-r * 0.28, r * 0.55, r * 0.56, r * 0.1);
  }

  function drawRing(r) {
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = Math.max(2, r * 0.18);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#8ecae6';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.85);
    ctx.lineTo(r * 0.22, -r * 0.45);
    ctx.lineTo(0, -r * 0.2);
    ctx.lineTo(-r * 0.22, -r * 0.45);
    ctx.closePath();
    ctx.fill();
  }

  function drawCake(r) {
    ctx.fillStyle = '#f5e6d3';
    ctx.fillRect(-r * 0.7, -r * 0.1, r * 1.4, r * 0.7);
    ctx.fillStyle = '#e8b4c8';
    ctx.fillRect(-r * 0.55, -r * 0.45, r * 1.1, r * 0.4);
    ctx.fillStyle = '#fff8f0';
    ctx.beginPath();
    ctx.arc(0, -r * 0.55, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c45c4a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.75);
    ctx.lineTo(0, -r * 0.55);
    ctx.stroke();
  }

  function drawParticle(p) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function burstParticles(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 80 + Math.random() * 180;
      particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        life: 0.4 + Math.random() * 0.5,
        maxLife: 0.9,
        size: 2 + Math.random() * 3,
        color,
      });
    }
  }

  function burstConfetti(x, y, n) {
    const colors = ['#d4af37', '#e8b4c8', '#8aab9a', '#f5f0e8', '#c45c4a'];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 120 + Math.random() * 260;
      particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 100,
        life: 0.8 + Math.random() * 0.8,
        maxLife: 1.6,
        size: 2 + Math.random() * 4,
        color: colors[i % colors.length],
      });
    }
    // Dibuja un frame de confeti aunque el loop haya parado
    let frames = 40;
    const anim = () => {
      drawBackground();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= 0.025;
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;
        p.vy += 6;
        if (p.life <= 0) particles.splice(i, 1);
        else drawParticle(p);
      }
      drawBasket();
      if (frames-- > 0 && particles.length) requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
  }

  // ---------------------------------------------------------------------------
  // HUD / UI helpers
  // ---------------------------------------------------------------------------
  function updateHud() {
    setTextSafe('game-score', String(score));
    setTextSafe('game-combo', `x${combo}`);
    setTextSafe('game-timer', String(Math.max(0, Math.ceil(timeLeft))));
    const freezeEl = document.getElementById('game-freeze-badge');
    if (freezeEl) freezeEl.classList.toggle('is-on', frozen > 0);
  }

  function updateHighScoreLabel() {
    const hs = Number(localStorage.getItem(HS_KEY) || 0);
    setTextSafe('game-highscore', String(hs));
  }

  function flashHud(msg) {
    const el = document.getElementById('game-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-show');
    clearTimeout(flashHud._t);
    flashHud._t = setTimeout(() => el.classList.remove('is-show'), 1200);
  }

  function setTextSafe(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ---------------------------------------------------------------------------
  // Web Audio API — sonidos sintéticos elegantes
  // ---------------------------------------------------------------------------
  function ensureAudio() {
    if (audioCtx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();
  }

  function beep({ freq = 440, dur = 0.12, type = 'sine', gain = 0.08, slide = 0 }) {
    if (muted || !audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t0 = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.linearRampToValueAtTime(freq + slide, t0 + dur);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function playCatch(golden) {
    beep({ freq: golden ? 880 : 660, dur: 0.1, type: 'triangle', gain: 0.07, slide: 120 });
    if (golden) setTimeout(() => beep({ freq: 1100, dur: 0.12, type: 'sine', gain: 0.05 }), 60);
  }

  function playPower() {
    beep({ freq: 520, dur: 0.15, type: 'sine', gain: 0.06, slide: 200 });
    setTimeout(() => beep({ freq: 780, dur: 0.12, type: 'triangle', gain: 0.05 }), 80);
  }

  function playMiss() {
    beep({ freq: 180, dur: 0.18, type: 'sawtooth', gain: 0.04, slide: -60 });
  }

  function playVictory() {
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => beep({ freq: f, dur: 0.18, type: 'triangle', gain: 0.06 }), i * 110);
    });
  }

  function toggleMute() {
    muted = !muted;
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    updateMuteButton();
    if (!muted) {
      ensureAudio();
      beep({ freq: 700, dur: 0.08, type: 'sine', gain: 0.05 });
    }
  }

  function updateMuteButton() {
    const btn = document.getElementById('btn-game-mute');
    if (!btn) return;
    btn.classList.toggle('is-muted', muted);
    btn.setAttribute('aria-pressed', String(muted));
    btn.setAttribute('aria-label', muted ? 'Activar sonidos del juego' : 'Silenciar sonidos del juego');
    btn.title = muted ? 'Sonido off' : 'Sonido on';
  }

  // ---------------------------------------------------------------------------
  // Ranking (reutiliza endpoint existente)
  // ---------------------------------------------------------------------------
  async function loadLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    try {
      const scores = await (await fetch('/api/scores')).json();
      if (!scores.length) {
        list.innerHTML = '<li class="rank-empty">Sé el primero en jugar</li>';
        return;
      }
      list.innerHTML = scores.slice(0, 10).map((s) =>
        `<li><span>${escapeHtmlSafe(s.playerName)}</span><span>${s.score} pts</span></li>`
      ).join('');
    } catch {
      list.innerHTML = '';
    }
  }

  function escapeHtmlSafe(str) {
    if (typeof escapeHtml === 'function') return escapeHtml(str);
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
