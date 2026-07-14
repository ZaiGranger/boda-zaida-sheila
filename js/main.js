/**
 * MAIN.JS — Lógica principal de la web de boda (versión premium)
 * Controla invitación, navegación, formularios, galería, juego y más.
 */

document.addEventListener('DOMContentLoaded', () => {
  applyConfig();
  initEnvelope();
  initNavigation();
  initScrollProgress();
  initFloatingCTA();
  initCountdown();
  initStory();
  initSchedule();
  initDressCode();
  initFAQ();
  initRSVP();
  initSongs();
  initGame();
  initWeather();
  initShare();
  initAddToCalendar();
  initScrollReveal();
});

// =============================================================================
// CONFIGURACIÓN
// =============================================================================
function applyConfig() {
  const { bride1, bride2, venue, giftMessage, couplePhoto, hashtag } = WEDDING_CONFIG;
  const initials = `${bride1.charAt(0)}&${bride2.charAt(0)}`;
  const namesText = `${bride1} & ${bride2}`;
  const dateFormatted = formatWeddingDate();

  // Monograma en sello, nav y footer
  ['seal-monogram', 'nav-brand', 'footer-names'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = id === 'seal-monogram' ? initials : initials.replace('&', ' & ');
  });

  const heroNames = document.getElementById('hero-names');
  if (heroNames) heroNames.innerHTML = `${bride1} <em>&</em> ${bride2}`;

  ['envelope-names', 'countdown-names'].forEach((id) => setText(id, namesText));

  ['envelope-date', 'hero-date'].forEach((id) => setText(id, dateFormatted));

  setText('venue-address', venue.address);
  setText('venue-city', `${venue.city}, España`);
  setText('venue-time', `${WEDDING_CONFIG.weddingTime} h`);
  setText('gift-message', giftMessage);
  setText('footer-hashtag', hashtag || '');

  const mapsLink = document.getElementById('maps-link');
  if (mapsLink) mapsLink.href = venue.mapsUrl;

  const mapsEmbed = document.getElementById('maps-embed');
  if (mapsEmbed && venue.mapsEmbed) mapsEmbed.src = venue.mapsEmbed;

  const photo = document.getElementById('couple-photo');
  if (photo) photo.src = couplePhoto;
}

function formatWeddingDate() {
  return new Date(WEDDING_CONFIG.weddingDate).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// =============================================================================
// SOBRE / INVITACIÓN
// =============================================================================
function initEnvelope() {
  const envelope = document.getElementById('envelope');
  const screen = document.getElementById('envelope-screen');
  const main = document.getElementById('main-content');
  const nav = document.getElementById('nav');

  function openInvitation() {
    envelope?.classList.add('open');
    setTimeout(() => {
      screen?.classList.add('opening');
      setTimeout(() => {
        screen?.classList.add('hidden');
        main?.classList.remove('hidden');
        main?.classList.add('visible');
        nav?.classList.add('visible');
        fireConfetti();
      }, 700);
    }, 900);
  }

  document.getElementById('btn-open-invite')?.addEventListener('click', openInvitation);
  envelope?.addEventListener('click', openInvitation);
}

// =============================================================================
// NAVEGACIÓN
// =============================================================================
function initNavigation() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const nav = document.getElementById('nav');
  const links = menu?.querySelectorAll('.nav-link') || [];

  toggle?.addEventListener('click', () => menu?.classList.toggle('open'));

  links.forEach((link) => {
    link.addEventListener('click', () => menu?.classList.remove('open'));
  });

  // Resaltar sección activa y fondo al hacer scroll
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 60);

    let current = '';
    sections.forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    links.forEach((l) => {
      l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });
}

// =============================================================================
// BARRA DE PROGRESO Y BOTÓN FLOTANTE RSVP
// =============================================================================
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    if (bar) bar.style.width = `${Math.min(scrolled * 100, 100)}%`;
  }, { passive: true });
}

function initFloatingCTA() {
  const fab = document.getElementById('fab-rsvp');
  const rsvp = document.getElementById('rsvp');
  if (!fab || !rsvp) return;

  window.addEventListener('scroll', () => {
    const rsvpBottom = rsvp.offsetTop + rsvp.offsetHeight;
    const show = window.scrollY > 400 && window.scrollY < rsvpBottom - 200;
    fab.classList.toggle('visible', show);
  }, { passive: true });
}

// =============================================================================
// CUENTA ATRÁS (con animación al cambiar segundos)
// =============================================================================
function initCountdown() {
  const weddingDate = new Date(WEDDING_CONFIG.weddingDate).getTime();
  let prevSeconds = -1;

  function update() {
    const diff = weddingDate - Date.now();
    if (diff <= 0) { setCountdown(0, 0, 0, 0); return; }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    setCountdown(d, h, m, s);

    if (s !== prevSeconds) {
      document.getElementById('seconds')?.classList.add('tick');
      setTimeout(() => document.getElementById('seconds')?.classList.remove('tick'), 300);
      prevSeconds = s;
    }
  }

  function setCountdown(d, h, m, s) {
    setText('days', String(d).padStart(2, '0'));
    setText('hours', String(h).padStart(2, '0'));
    setText('minutes', String(m).padStart(2, '0'));
    setText('seconds', String(s).padStart(2, '0'));
  }

  update();
  setInterval(update, 1000);
}

// =============================================================================
// HISTORIA, PROGRAMA, DRESS CODE, FAQ
// =============================================================================
function initStory() {
  const container = document.getElementById('story-timeline');
  if (!container || !WEDDING_CONFIG.story) return;

  container.innerHTML = WEDDING_CONFIG.story.map((item) => `
    <div class="timeline-item">
      <div class="timeline-year">${escapeHtml(item.year)}</div>
      <h3 class="timeline-title">${escapeHtml(item.title)}</h3>
      <p class="timeline-text">${escapeHtml(item.text)}</p>
    </div>
  `).join('');

  // Animar cada hito al entrar en pantalla
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.3 });
  container.querySelectorAll('.timeline-item').forEach((el) => observer.observe(el));
}

function initSchedule() {
  const grid = document.getElementById('schedule-grid');
  if (!grid || !WEDDING_CONFIG.schedule) return;

  grid.innerHTML = WEDDING_CONFIG.schedule.map((item) => `
    <div class="schedule-item">
      <div class="schedule-time">${escapeHtml(item.time)}</div>
      <div>
        <h3 class="schedule-title">${escapeHtml(item.title)}</h3>
        <p class="schedule-desc">${escapeHtml(item.desc)}</p>
      </div>
    </div>
  `).join('');
}

function initDressCode() {
  const dc = WEDDING_CONFIG.dressCode;
  if (!dc) return;
  setText('dresscode-title', dc.title);
  setText('dresscode-desc', dc.description);

  const tips = document.getElementById('dresscode-tips');
  if (tips && dc.tips) {
    tips.innerHTML = dc.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join('');
  }
}

function initFAQ() {
  const list = document.getElementById('faq-list');
  if (!list || !WEDDING_CONFIG.faq) return;

  list.innerHTML = WEDDING_CONFIG.faq.map((item, i) => `
    <div class="faq-item" id="faq-${i}">
      <button class="faq-question" type="button" aria-expanded="false">
        ${escapeHtml(item.q)}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="faq-answer">${escapeHtml(item.a)}</div>
    </div>
  `).join('');

  list.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item?.classList.contains('open');
      list.querySelectorAll('.faq-item').forEach((f) => f.classList.remove('open'));
      if (!isOpen) item?.classList.add('open');
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

// =============================================================================
// COMPARTIR Y AÑADIR AL CALENDARIO
// =============================================================================
function initShare() {
  document.getElementById('btn-share')?.addEventListener('click', async () => {
    const shareData = {
      title: `${WEDDING_CONFIG.bride1} & ${WEDDING_CONFIG.bride2} — Nos casamos`,
      text: `¡Estás invitado/a a nuestra boda el 4 de septiembre de 2027 en Valencia!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* cancelado */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  });
}

function initAddToCalendar() {
  document.getElementById('btn-add-calendar')?.addEventListener('click', () => {
    const start = new Date(WEDDING_CONFIG.weddingDate);
    const end = new Date(start.getTime() + 8 * 3600000); // 8 horas de evento

    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const { venue, bride1, bride2 } = WEDDING_CONFIG;

    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
      `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
      `SUMMARY:Boda ${bride1} & ${bride2}`,
      `LOCATION:${venue.fullAddress}`,
      `DESCRIPTION:Ceremonia de boda de ${bride1} y ${bride2}`,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'boda-zaida-sheila.ics';
    link.click();
  });
}

// =============================================================================
// RSVP
// =============================================================================
function initRSVP() {
  document.getElementById('rsvp-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const name = document.getElementById('rsvp-name')?.value.trim();
    const surname = document.getElementById('rsvp-surname')?.value.trim();
    const attendance = form.querySelector('input[name="attendance"]:checked')?.value;
    const partner = form.querySelector('input[name="partner"]:checked')?.value;
    const diet = document.getElementById('diet')?.value;
    const allergies = document.getElementById('allergies')?.value.trim();

    const dietLabels = { carnivora: 'Sin restricciones', vegetariana: 'Vegetariana', vegana: 'Vegana' };
    const attendanceText = attendance === 'si' ? '✅ Sí, asistiré' : '❌ No podré asistir';

    const message = [
      `💒 *Confirmación — Boda ${WEDDING_CONFIG.bride1} & ${WEDDING_CONFIG.bride2}*`, '',
      `👤 *Nombre:* ${name} ${surname}`,
      `📋 *Asistencia:* ${attendanceText}`,
      `💑 *¿Con pareja?* ${partner === 'si' ? 'Sí' : 'No'}`,
      `🍽️ *Dieta:* ${dietLabels[diet]}`,
      allergies ? `⚠️ *Alergias:* ${allergies}` : '', '', '¡Gracias!',
    ].filter(Boolean).join('\n');

    if (attendance === 'si') { fireConfetti(); setTimeout(fireConfetti, 400); }
    window.open(`https://wa.me/${WEDDING_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  });
}

function fireConfetti() {
  const colors = ['#b8956b', '#c9a0a0', '#d4b896', '#f8f5f0', '#8b7049'];
  const end = Date.now() + 2500;
  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.75 }, colors });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.75 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

// =============================================================================
// CANCIONES
// =============================================================================
function initSongs() {
  document.getElementById('songs-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('song-status');
    try {
      const res = await fetch('/api/songs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: document.getElementById('song-guest')?.value.trim(),
          artist: document.getElementById('song-artist')?.value.trim(),
          song: document.getElementById('song-title')?.value.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showStatus(status, 'Canción añadida a la playlist', 'success');
      e.target.reset();
      loadSongs();
    } catch (err) { showStatus(status, err.message, 'error'); }
  });
  loadSongs();
}

async function loadSongs() {
  const list = document.getElementById('songs-list');
  if (!list) return;
  try {
    const songs = await (await fetch('/api/songs')).json();
    if (!songs.length) { list.innerHTML = '<p class="playlist-empty">Sé el primero en sugerir una canción</p>'; return; }
    list.innerHTML = songs.slice(0, 25).map((s, i) => `
      <div class="song-item">
        <span class="song-number">${String(i + 1).padStart(2, '0')}</span>
        <div class="song-info">
          <strong>${escapeHtml(s.song)}</strong>
          <span>${escapeHtml(s.artist || 'Artista desconocido')} · ${escapeHtml(s.guestName)}</span>
        </div>
      </div>`).join('');
  } catch { /* silencioso */ }
}

// =============================================================================
// MINIJUEGO (con sistema de combo)
// =============================================================================
function initGame() {
  const board = document.getElementById('game-board');
  const startScreen = document.getElementById('game-start');
  const resultScreen = document.getElementById('game-result');
  const scoreEl = document.getElementById('game-score');
  const comboEl = document.getElementById('game-combo');
  const timerEl = document.getElementById('game-timer');

  let score = 0, combo = 1, timeLeft = 30, isPlaying = false;
  let timerInterval, spawnInterval, comboTimeout;

  document.getElementById('btn-start-game')?.addEventListener('click', startGame);
  document.getElementById('btn-play-again')?.addEventListener('click', () => {
    resultScreen?.classList.add('hidden');
    startScreen?.classList.remove('hidden');
    loadLeaderboard();
  });

  function startGame() {
    const name = document.getElementById('game-player-name')?.value.trim();
    if (!name) { alert('Escribe tu nombre'); return; }

    score = 0; combo = 1; timeLeft = 30; isPlaying = true;
    scoreEl.textContent = '0'; comboEl.textContent = 'x1'; timerEl.textContent = '30';
    startScreen?.classList.add('hidden');
    resultScreen?.classList.add('hidden');
    board?.querySelectorAll('.game-bouquet').forEach((b) => b.remove());

    timerInterval = setInterval(() => {
      timeLeft--;
      timerEl.textContent = String(timeLeft);
      if (timeLeft <= 0) endGame(name);
    }, 1000);

    spawnInterval = setInterval(spawnBouquet, 700);
  }

  function spawnBouquet() {
    if (!isPlaying || !board) return;
    const b = document.createElement('div');
    b.className = 'game-bouquet';
    b.textContent = ['💐', '🌸', '💮', '🌺'][Math.floor(Math.random() * 4)];
    b.style.left = `${Math.random() * 85 + 5}%`;
    const dur = 1.8 + Math.random() * 1.5;
    b.style.animationDuration = `${dur}s`;

    b.addEventListener('click', () => {
      if (!isPlaying) return;
      score += combo;
      scoreEl.textContent = String(score);
      combo = Math.min(combo + 1, 5);
      comboEl.textContent = `x${combo}`;
      clearTimeout(comboTimeout);
      comboTimeout = setTimeout(() => { combo = 1; comboEl.textContent = 'x1'; }, 1500);
      b.classList.add('caught');
      setTimeout(() => b.remove(), 250);
    });

    board.appendChild(b);
    setTimeout(() => b.remove(), dur * 1000);
  }

  async function endGame(name) {
    isPlaying = false;
    clearInterval(timerInterval);
    clearInterval(spawnInterval);
    board?.querySelectorAll('.game-bouquet').forEach((b) => b.remove());

    try {
      const res = await fetch('/api/scores', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name, score }),
      });
      const data = await res.json();
      setText('result-score', String(score));
      setText('result-prize', data.result?.prize || '¡Gracias por jugar!');
    } catch {
      setText('result-score', String(score));
    }

    resultScreen?.classList.remove('hidden');
    if (score >= 15) fireConfetti();
    loadLeaderboard();
  }

  loadLeaderboard();
}

async function loadLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  if (!list) return;
  try {
    const scores = await (await fetch('/api/scores')).json();
    if (!scores.length) { list.innerHTML = '<li style="justify-content:center;color:#999">Sé el primero en jugar</li>'; return; }
    list.innerHTML = scores.slice(0, 10).map((s) =>
      `<li><span>${escapeHtml(s.playerName)}</span><span>${s.score} pts</span></li>`
    ).join('');
  } catch { list.innerHTML = ''; }
}

// =============================================================================
// TIEMPO
// =============================================================================
async function initWeather() {
  const card = document.getElementById('weather-card');
  const note = document.getElementById('weather-note');
  if (!card) return;

  const { lat, lon } = WEDDING_CONFIG.venue;
  const wedding = new Date(WEDDING_CONFIG.weddingDate);
  const daysUntil = Math.ceil((wedding - Date.now()) / 86400000);

  if (daysUntil > 16) { await showHistoricalWeather(card, note, lat, lon); return; }

  try {
    const dateStr = wedding.toISOString().split('T')[0];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max&timezone=Europe%2FMadrid&start_date=${dateStr}&end_date=${dateStr}`;
    const data = await (await fetch(url)).json();
    if (data.daily) {
      renderWeather(card, {
        tempMax: Math.round(data.daily.temperature_2m_max[0]),
        tempMin: Math.round(data.daily.temperature_2m_min[0]),
        code: data.daily.weathercode[0],
        rainChance: data.daily.precipitation_probability_max?.[0] || 0,
        isEstimate: false,
      });
      if (note) note.textContent = 'Previsión actualizada para el día de la boda.';
    }
  } catch { await showHistoricalWeather(card, note, lat, lon); }
}

async function showHistoricalWeather(card, note, lat, lon) {
  try {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=2020-09-04&end_date=2024-09-04&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe%2FMadrid`;
    const data = await (await fetch(url)).json();
    const d = data.daily;
    if (d?.temperature_2m_max?.length) {
      const avg = (arr) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
      renderWeather(card, {
        tempMax: avg(d.temperature_2m_max), tempMin: avg(d.temperature_2m_min),
        code: d.weathercode[Math.floor(d.weathercode.length / 2)],
        rainChance: 15, isEstimate: true,
      });
      if (note) note.textContent = 'Estimación basada en septiembre en Valencia. La previsión real estará disponible días antes.';
    }
  } catch {
    card.innerHTML = '<div class="weather-icon">☀️</div><p class="weather-desc">Valencia en septiembre: cálido y soleado (25-30°C)</p>';
  }
}

function renderWeather(card, { tempMax, tempMin, code, rainChance, isEstimate }) {
  const { icon, desc } = weatherCodeToText(code);
  card.innerHTML = `
    <div class="weather-icon">${icon}</div>
    <div class="weather-temp">${tempMin}° — ${tempMax}°C</div>
    <p class="weather-desc">${desc}</p>
    <div class="weather-details">
      <span>Lluvia: ${rainChance}%</span>
      <span>${isEstimate ? 'Estimación histórica' : 'Previsión actual'}</span>
    </div>`;
}

function weatherCodeToText(code) {
  const m = { 0: ['☀️', 'Despejado'], 1: ['🌤️', 'Mayormente despejado'], 2: ['⛅', 'Parcialmente nublado'], 3: ['☁️', 'Nublado'], 61: ['🌧️', 'Lluvia ligera'], 95: ['⛈️', 'Tormenta'] };
  const [icon, desc] = m[code] || ['🌡️', 'Tiempo variable'];
  return { icon, desc };
}

// =============================================================================
// UTILIDADES
// =============================================================================
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function showStatus(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.className = `form-feedback ${type || ''}`;
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}
