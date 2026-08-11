/**
 * GALERÍA DE LA MESA — Opción A
 * Quien escanea el QR de una mesa ve TODAS las fotos/vídeos de esa mesa.
 * (Las novias ven todo desde galeria-admin.html)
 */

let galleryItems = [];
let activeFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  const main = document.getElementById('main-content');
  const title = document.getElementById('gallery-title');
  const subtitle = document.getElementById('gallery-subtitle');

  try {
    // Sin QR / sesión de mesa válida → bloqueado
    const mesa = await ensureMesaAccess();
    if (!mesa) {
      showBlockedAccess(main);
      return;
    }

    // Título dinámico: "Recuerdos · Mesa 1"
    if (title) title.textContent = `Recuerdos · ${mesa.name}`;
    if (subtitle) {
      subtitle.textContent = 'Todo lo que ha subido vuestra mesa. Nosotras vemos todas las mesas.';
    }

    // Nombre opcional: si no lo tienen, pueden ver igual; al subir sí se pide
    main.innerHTML = `
      <div class="gallery-filters" id="gallery-filters">
        <button class="filter-btn active" data-filter="all" type="button">Todos</button>
        <button class="filter-btn" data-filter="image" type="button">Fotos</button>
        <button class="filter-btn" data-filter="video" type="button">Vídeos</button>
      </div>
      <div class="gallery-masonry" id="gallery-grid"></div>
      <div class="recuerdos-links">
        <a href="subir.html" class="btn btn-gold btn-full">Subir foto o vídeo</a>
      </div>`;

    initFilters();
    await loadGallery(mesa);
  } catch {
    showBlockedAccess(main);
  }
});

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderGallery();
    });
  });
}

/** Carga TODO lo de la mesa (ya no filtra por guestId) */
async function loadGallery(mesa) {
  const grid = document.getElementById('gallery-grid');

  try {
    const url = `/api/gallery?mesa=${encodeURIComponent(mesa.id)}&t=${encodeURIComponent(mesa.token)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo cargar la galería');
    galleryItems = Array.isArray(data) ? data : [];
    renderGallery();
  } catch (err) {
    grid.innerHTML = `<p class="gallery-empty">${escapeHtml(err.message)}</p>`;
  }
}

function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  const filtered =
    activeFilter === 'all'
      ? galleryItems
      : galleryItems.filter((i) => i.type === activeFilter);

  if (!filtered.length) {
    grid.innerHTML =
      '<p class="gallery-empty">Aún no hay recuerdos en esta mesa. ¡Sed los primeros!</p>';
    return;
  }

  // Cada ítem muestra quién lo subió (nombre de invitado)
  grid.innerHTML = filtered
    .map(
      (item) => `
    <div class="gallery-item" data-url="${escapeHtml(item.url)}" data-type="${escapeHtml(item.type)}" data-guest="${escapeHtml(item.guestName || 'Invitado')}">
      ${
        item.type === 'video'
          ? `<video src="${escapeHtml(item.url)}" muted playsinline></video><span class="video-badge">Vídeo</span>`
          : `<img src="${escapeHtml(item.url)}" alt="Recuerdo de ${escapeHtml(item.guestName || 'invitado')}" loading="lazy" />`
      }
      <span class="gallery-caption">${escapeHtml(item.guestName || 'Invitado')}</span>
    </div>`
    )
    .join('');

  grid.querySelectorAll('.gallery-item').forEach((el) => {
    el.addEventListener('click', () => openLightbox(el.dataset.url, el.dataset.type, el.dataset.guest));
  });
}

function openLightbox(url, type, guest) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Cerrar">&times;</button>
    <div class="lightbox-content">
      ${type === 'video' ? `<video src="${escapeHtml(url)}" controls autoplay playsinline></video>` : `<img src="${escapeHtml(url)}" alt="Recuerdo" />`}
      <p class="lightbox-caption">${escapeHtml(guest || '')}</p>
    </div>`;
  lb.addEventListener('click', (e) => {
    if (e.target === lb || e.target.classList.contains('lightbox-close')) lb.remove();
  });
  document.body.appendChild(lb);
}
