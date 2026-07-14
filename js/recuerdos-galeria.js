/**
 * GALERÍA INVITADO — Solo sus fotos, solo vía QR de mesa
 */

let galleryItems = [];
let activeFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  const main = document.getElementById('main-content');

  try {
    const mesa = await ensureMesaAccess();
    if (!mesa) {
      showBlockedAccess(main);
      return;
    }

    if (!getGuestId() && !getGuestName()) {
      main.innerHTML = `
        <div class="guest-id-card">
          <p>Primero sube un recuerdo en la página de subida.</p>
          <a href="subir.html" class="btn btn-gold btn-full">Ir a subir</a>
        </div>`;
      return;
    }

    main.innerHTML = `
      <div class="gallery-filters" id="gallery-filters">
        <button class="filter-btn active" data-filter="all" type="button">Todos</button>
        <button class="filter-btn" data-filter="image" type="button">Fotos</button>
        <button class="filter-btn" data-filter="video" type="button">Vídeos</button>
      </div>
      <div class="gallery-masonry" id="gallery-grid"></div>
      <div class="recuerdos-links">
        <a href="subir.html" class="btn btn-gold btn-full">Subir más recuerdos</a>
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

async function loadGallery(mesa) {
  const grid = document.getElementById('gallery-grid');
  const guestId = getGuestId();
  if (!guestId) {
    grid.innerHTML = '<p class="gallery-empty">Aún no has subido recuerdos.</p>';
    return;
  }

  try {
    const url = `/api/gallery?mesa=${encodeURIComponent(mesa.id)}&t=${encodeURIComponent(mesa.token)}&guestId=${encodeURIComponent(guestId)}`;
    const res = await fetch(url);
    galleryItems = await res.json();
    if (!res.ok) throw new Error(galleryItems.error);
    renderGallery();
  } catch (err) {
    grid.innerHTML = `<p class="gallery-empty">${err.message}</p>`;
  }
}

function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  const filtered = activeFilter === 'all' ? galleryItems : galleryItems.filter((i) => i.type === activeFilter);

  if (!filtered.length) {
    grid.innerHTML = '<p class="gallery-empty">Aún no has subido recuerdos.</p>';
    return;
  }

  grid.innerHTML = filtered.map((item) => `
    <div class="gallery-item" data-url="${item.url}" data-type="${item.type}">
      ${item.type === 'video'
        ? `<video src="${item.url}" muted></video><span class="video-badge">Vídeo</span>`
        : `<img src="${item.url}" alt="Recuerdo" loading="lazy" />`}
    </div>`).join('');

  grid.querySelectorAll('.gallery-item').forEach((el) => {
    el.addEventListener('click', () => openLightbox(el.dataset.url, el.dataset.type));
  });
}

function openLightbox(url, type) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <button class="lightbox-close">&times;</button>
    <div class="lightbox-content">
      ${type === 'video' ? `<video src="${url}" controls autoplay></video>` : `<img src="${url}" alt="Recuerdo" />`}
    </div>`;
  lb.addEventListener('click', (e) => {
    if (e.target === lb || e.target.classList.contains('lightbox-close')) lb.remove();
  });
  document.body.appendChild(lb);
}
