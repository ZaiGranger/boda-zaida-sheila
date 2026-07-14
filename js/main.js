/**
 * MAIN.JS — Lógica principal de la web de boda (versión premium)
 * Controla invitación, navegación, formularios, galería, juego y más.
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadPublicConfig();
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

/** Carga playlist Spotify desde Render (variables de entorno) si existen */
async function loadPublicConfig() {
  try {
    const data = await (await fetch('/api/public-config')).json();
    if (data.spotifyPlaylistUrl) WEDDING_CONFIG.spotifyPlaylistUrl = data.spotifyPlaylistUrl;
    if (data.spotifyCollaboratorUrl) WEDDING_CONFIG.spotifyCollaboratorUrl = data.spotifyCollaboratorUrl;
    if (data.spotifyPlaylistTitle) WEDDING_CONFIG.spotifyPlaylistTitle = data.spotifyPlaylistTitle;
  } catch { /* usa valores de config.js */ }
}

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

  const envelopeNames = document.getElementById('envelope-names');
  if (envelopeNames) envelopeNames.innerHTML = `${bride1} <span>&</span> ${bride2}`;

  ['countdown-names'].forEach((id) => setText(id, namesText));

  const dateShort = new Date(WEDDING_CONFIG.weddingDate).toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).replace(/\//g, ' · ');
  setText('envelope-date', dateShort);
  setText('hero-date', dateFormatted);

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

  // Embed opcional de playlist de Spotify de las novias
  initSpotifyEmbed();
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
// SOBRE / INVITACIÓN — Apertura con efectos florales
// =============================================================================
function initEnvelope() {
  const screen = document.getElementById('envelope-screen');
  const main = document.getElementById('main-content');
  const nav = document.getElementById('nav');
  const waxSeal = document.getElementById('wax-seal');
  let isOpening = false;

  function openInvitation() {
    if (isOpening) return;
    isOpening = true;

    // 1. Romper el sello de cera rojo
    waxSeal?.classList.add('breaking');
    screen?.classList.add('is-opening');

    // 2. Las solapas del sobre se abren
    setTimeout(() => {
      document.getElementById('env-flap-top')?.classList.add('open');
      document.getElementById('env-flap-bottom')?.classList.add('open');
    }, 300);

    // 3. Destellos dorados + confeti suave
    setTimeout(() => {
      firePetalBurst();
      fireFloralConfetti();
    }, 900);

    // 4. El papel del sobre se desvanece
    setTimeout(() => screen?.classList.add('exiting'), 1200);

    // 5. La invitación se despliega como papel
    setTimeout(() => {
      screen?.classList.add('opening', 'hidden');
      main?.classList.remove('hidden');
      main?.classList.add('visible', 'entering');
      nav?.classList.add('visible');
      // Hojas laterales solo a partir de aquí
      document.getElementById('page-leaves-bg')?.classList.add('is-visible');
      setTimeout(() => main?.classList.remove('entering'), 2000);
    }, 2000);
  }

  document.getElementById('btn-open-invite')?.addEventListener('click', openInvitation);
}

/** Genera pétalos que explotan desde el centro al abrir el sobre */
function firePetalBurst() {
  const container = document.getElementById('envelope-burst');
  if (!container) return;

  const colors = ['#b8a07a', '#d4c4a0', '#8aab9a', '#f5f0e8', '#c45c4a', '#ebe4d8'];
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  for (let i = 0; i < 40; i++) {
    const petal = document.createElement('span');
    petal.className = 'burst-petal';
    petal.style.left = `${cx}px`;
    petal.style.top = `${cy}px`;
    petal.style.background = colors[i % colors.length];

    const angle = (Math.PI * 2 * i) / 40 + Math.random() * 0.5;
    const dist = 80 + Math.random() * 220;
    petal.style.setProperty('--bx', `${Math.cos(angle) * dist}px`);
    petal.style.setProperty('--by', `${Math.sin(angle) * dist}px`);
    petal.style.setProperty('--br', `${Math.random() * 720}deg`);

    container.appendChild(petal);
    setTimeout(() => petal.remove(), 2000);
  }
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
  document.getElementById('btn-add-calendar')?.addEventListener('click', openWeddingCalendar);
}

/** Detecta iPhone/iPad vs Android para abrir el calendario nativo de cada móvil */
function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isAndroidDevice() {
  return /Android/i.test(navigator.userAgent);
}

/** Fecha fin del evento: día de la boda a la hora de cierre (01:00 del día siguiente) */
function getWeddingEventEnd() {
  const start = new Date(WEDDING_CONFIG.weddingDate);
  const end = new Date(start);
  const [endHour, endMinute] = (WEDDING_CONFIG.eventEnd || '01:00').split(':').map(Number);
  // Si cierra a la 01:00, es la madrugada del día siguiente
  if (endHour < 12) end.setDate(end.getDate() + 1);
  end.setHours(endHour, endMinute || 0, 0, 0);
  return { start, end };
}

function fmtIcsDate(d) {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function fmtGoogleDate(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
}

function downloadIcsCalendar(start, end) {
  const { venue, bride1, bride2 } = WEDDING_CONFIG;
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Boda Zaida Sheila//ES', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `DTSTART:${fmtIcsDate(start)}`,
    `DTEND:${fmtIcsDate(end)}`,
    `SUMMARY:Boda ${bride1} & ${bride2}`,
    `LOCATION:${venue.fullAddress}`,
    `DESCRIPTION:Ceremonia y celebración de la boda de ${bride1} y ${bride2}.`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'boda-zaida-sheila.ics';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function openGoogleCalendar(start, end) {
  const { venue, bride1, bride2 } = WEDDING_CONFIG;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Boda ${bride1} & ${bride2}`,
    dates: `${fmtGoogleDate(start)}/${fmtGoogleDate(end)}`,
    details: `Ceremonia y celebración de la boda de ${bride1} y ${bride2}.`,
    location: venue.fullAddress,
  });
  window.open(`https://calendar.google.com/calendar/render?${params}`, '_blank', 'noopener,noreferrer');
}

function openWeddingCalendar() {
  const { start, end } = getWeddingEventEnd();

  if (isAndroidDevice()) {
    openGoogleCalendar(start, end);
  } else if (isIOSDevice()) {
    // iPhone/iPad: archivo .ics → se abre en Calendario de Apple
    downloadIcsCalendar(start, end);
  } else {
    // Escritorio u otros: Google Calendar (también funciona en muchos Android)
    openGoogleCalendar(start, end);
  }
}

// =============================================================================
// RSVP — WhatsApp a Zaida o Sheila
// =============================================================================
function buildRsvpMessage(form) {
  const name = document.getElementById('rsvp-name')?.value.trim();
  const surname = document.getElementById('rsvp-surname')?.value.trim();
  const attendance = form.querySelector('input[name="attendance"]:checked')?.value;
  const partner = form.querySelector('input[name="partner"]:checked')?.value;
  const diet = document.getElementById('diet')?.value;
  const allergies = document.getElementById('allergies')?.value.trim();

  const dietLabels = { carnivora: 'Sin restricciones', vegetariana: 'Vegetariana', vegana: 'Vegana' };
  const attendanceText = attendance === 'si' ? '✅ Sí, asistiré' : '❌ No podré asistir';

  return [
    `💒 *Confirmación — Boda ${WEDDING_CONFIG.bride1} & ${WEDDING_CONFIG.bride2}*`, '',
    `👤 *Nombre:* ${name} ${surname}`,
    `📋 *Asistencia:* ${attendanceText}`,
    `💑 *¿Con pareja?* ${partner === 'si' ? 'Sí' : 'No'}`,
    `🍽️ *Dieta:* ${dietLabels[diet]}`,
    allergies ? `⚠️ *Alergias:* ${allergies}` : '', '', '¡Gracias!',
  ].filter(Boolean).join('\n');
}

function openWhatsAppRsvp(contactIndex) {
  const form = document.getElementById('rsvp-form');
  if (!form?.reportValidity()) return;

  const contacts = WEDDING_CONFIG.whatsappContacts;
  const contact = contacts?.[contactIndex];
  if (!contact?.number) return;

  const attendance = form.querySelector('input[name="attendance"]:checked')?.value;
  const message = buildRsvpMessage(form);

  if (attendance === 'si') { fireConfetti(); setTimeout(fireConfetti, 400); }

  const url = `https://wa.me/${contact.number}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function initRSVP() {
  const form = document.getElementById('rsvp-form');
  form?.addEventListener('submit', (e) => e.preventDefault());

  document.querySelectorAll('.btn-whatsapp-contact').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.contact);
      openWhatsAppRsvp(idx);
    });
  });
}

function fireConfetti() {
  fireFloralConfetti();
}

/** Confeti en tonos florales (verdes claros y rosas) */
function fireFloralConfetti() {
  const colors = ['#b8a07a', '#8aab9a', '#f5f0e8', '#d4c4a0', '#ebe4d8', '#c45c4a'];
  const end = Date.now() + 2500;
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.75 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.75 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

// =============================================================================
// CANCIONES + SPOTIFY
// =============================================================================
let spotifyConfigured = false;
let searchTimeout = null;
let selectedTrack = null;
let lastSearchResults = [];

function initSpotifyEmbed() {
  const url = WEDDING_CONFIG.spotifyPlaylistUrl?.trim();
  const title = WEDDING_CONFIG.spotifyPlaylistTitle || 'Playlist de la boda';
  const panel = document.getElementById('spotify-playlist-panel');
  const link = document.getElementById('spotify-playlist-link');
  const wrap = document.getElementById('spotify-playlist-embed');
  const divider = document.getElementById('songs-divider');

  if (!url) return;

  const playlistId = url.match(/playlist\/([a-zA-Z0-9]+)/)?.[1];
  if (!playlistId) return;

  // URL permanente de la playlist (el enlace de colaboradores con ?pt= caduca en ~7 días)
  const openUrl = `https://open.spotify.com/playlist/${playlistId}`;

  panel?.classList.remove('hidden');
  setText('spotify-playlist-title', title);
  if (link) {
    link.href = openUrl;
    // Respaldo en móvil por si el navegador no abre bien target="_blank"
    link.onclick = (e) => {
      e.preventDefault();
      window.open(openUrl, '_blank', 'noopener,noreferrer');
    };
  }

  if (wrap) {
    wrap.classList.remove('hidden');
    wrap.innerHTML = `<iframe src="https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0" width="100%" height="352" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="${escapeHtml(title)}"></iframe>`;
  }

  divider?.classList.remove('hidden');
}

async function initSongs() {
  const searchField = document.getElementById('spotify-search-field');
  const divider = document.getElementById('songs-divider');

  // Búsqueda API solo si el servidor tiene claves Spotify (requiere Premium)
  try {
    const status = await (await fetch('/api/spotify/status')).json();
    spotifyConfigured = status.configured;
  } catch {
    spotifyConfigured = false;
  }

  if (spotifyConfigured) {
    searchField?.classList.remove('hidden');
    const searchInput = document.getElementById('song-search');
    searchInput?.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      const q = searchInput.value.trim();
      if (q.length < 2) { hideSearchResults(); return; }
      searchTimeout = setTimeout(() => searchSpotify(q), 350);
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#spotify-search-field')) hideSearchResults();
    });
    document.getElementById('song-clear')?.addEventListener('click', clearSelectedTrack);
  }

  // Si no hay playlist de Spotify, ocultar el divisor "o escríbela aquí"
  if (!WEDDING_CONFIG.spotifyPlaylistUrl?.trim()) {
    divider?.classList.add('hidden');
  }

  document.getElementById('songs-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('song-status');

    let song, artist, spotifyId, albumImage, spotifyUrl, previewUrl;

    // Prioridad: canción escrita a mano (siempre disponible)
    song = document.getElementById('song-title-manual')?.value.trim();
    artist = document.getElementById('song-artist-manual')?.value.trim();

    // Si usó búsqueda API y no escribió manual, usar la pista seleccionada
    if (!song && spotifyConfigured && selectedTrack) {
      ({ name: song, artist, id: spotifyId, image: albumImage, spotifyUrl, previewUrl } = selectedTrack);
    }

    if (!song) {
      showStatus(status, 'Escribe el nombre de la canción', 'error');
      return;
    }

    try {
      const res = await fetch('/api/songs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: document.getElementById('song-guest')?.value.trim(),
          song, artist, spotifyId, albumImage, spotifyUrl, previewUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showStatus(status, '¡Sugerencia guardada! Gracias 🎵', 'success');
      const guestName = document.getElementById('song-guest')?.value.trim();
      e.target.reset();
      clearSelectedTrack();
      if (guestName) {
        const guestInput = document.getElementById('song-guest');
        if (guestInput) guestInput.value = guestName;
      }
      loadSongs();
    } catch (err) { showStatus(status, err.message, 'error'); }
  });

  loadSongs();
}

async function searchSpotify(query) {
  const resultsEl = document.getElementById('song-search-results');
  if (!resultsEl) return;

  try {
    const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error de búsqueda');

    if (!data.length) {
      resultsEl.innerHTML = '<p class="playlist-empty" style="padding:1rem">No se encontraron canciones</p>';
      resultsEl.classList.remove('hidden');
      return;
    }

    lastSearchResults = data;

    resultsEl.innerHTML = data.map((t, idx) => `
      <div class="spotify-result" data-idx="${idx}">
        <img src="${escapeHtml(t.image || '')}" alt="" onerror="this.style.display='none'" />
        <div class="spotify-result-info">
          <strong>${escapeHtml(t.name)}</strong>
          <span>${escapeHtml(t.artist)}</span>
        </div>
      </div>`).join('');

    resultsEl.querySelectorAll('.spotify-result').forEach((el) => {
      el.addEventListener('click', () => {
        const track = lastSearchResults[Number(el.dataset.idx)];
        if (track) selectTrack(track);
        hideSearchResults();
        const search = document.getElementById('song-search');
        if (search) search.value = '';
      });
    });

    resultsEl.classList.remove('hidden');
  } catch (err) {
    resultsEl.innerHTML = `<p class="playlist-empty" style="padding:1rem">${escapeHtml(err.message)}</p>`;
    resultsEl.classList.remove('hidden');
  }
}

function selectTrack(track) {
  selectedTrack = track;
  document.getElementById('song-title-manual').value = track.name || '';
  document.getElementById('song-artist-manual').value = track.artist || '';
  document.getElementById('song-title').value = track.name || '';
  document.getElementById('song-artist').value = track.artist || '';
  document.getElementById('song-spotify-id').value = track.id || '';
  document.getElementById('song-album-image').value = track.image || '';
  document.getElementById('song-spotify-url').value = track.spotifyUrl || '';
  document.getElementById('song-preview-url').value = track.previewUrl || '';
}

function clearSelectedTrack() {
  selectedTrack = null;
  ['song-title', 'song-artist', 'song-spotify-id', 'song-album-image', 'song-spotify-url', 'song-preview-url']
    .forEach((id) => { const el = document.getElementById(id); if (el) el.value = ''; });
  const search = document.getElementById('song-search');
  if (search) search.value = '';
}

function hideSearchResults() {
  document.getElementById('song-search-results')?.classList.add('hidden');
}

async function loadSongs() {
  const list = document.getElementById('songs-list');
  if (!list) return;
  try {
    const songs = await (await fetch('/api/songs')).json();
    if (!songs.length) {
      list.innerHTML = '<p class="playlist-header">Sugerencias en la web</p><p class="playlist-empty">Sé el primero en sugerir una canción 🎵</p>';
      return;
    }
    list.innerHTML = `<p class="playlist-header">Sugerencias en la web</p>` + songs.slice(0, 30).map((s, i) => {
      const cover = s.albumImage
        ? `<img class="song-cover" src="${escapeHtml(s.albumImage)}" alt="" />`
        : `<span class="song-cover song-cover--placeholder">🎵</span>`;
      const link = s.spotifyUrl
        ? `<a class="song-spotify-link" href="${escapeHtml(s.spotifyUrl)}" target="_blank" rel="noopener" aria-label="Abrir en Spotify">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02z"/></svg>
          </a>` : '';
      return `
      <div class="song-item">
        ${cover}
        <span class="song-number">${String(i + 1).padStart(2, '0')}</span>
        <div class="song-info">
          <strong>${escapeHtml(s.song)}</strong>
          <span>${escapeHtml(s.artist || 'Artista desconocido')} · ${escapeHtml(s.guestName)}</span>
        </div>
        ${link}
      </div>`;
    }).join('');
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
