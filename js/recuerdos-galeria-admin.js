/**
 * GALERÍA ADMIN — Novias ven todo, agrupado por mesa
 */

const ADMIN_KEY = 'weddingAdminPassword';
let galleryItems = [];
let activeFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  const pw = sessionStorage.getItem(ADMIN_KEY);
  if (!pw) {
    window.location.href = 'admin.html';
    return;
  }

  initFilters();
  await loadGallery(pw);
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

async function loadGallery(pw) {
  const grid = document.getElementById('gallery-grid');
  try {
    const res = await fetch('/api/gallery', { headers: { 'X-Admin-Password': pw } });
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
    grid.innerHTML = '<p class="gallery-empty">Aún no hay recuerdos subidos.</p>';
    return;
  }

  grid.innerHTML = filtered.map((item) => `
    <div class="gallery-item" data-url="${item.url}" data-type="${item.type}">
      ${item.type === 'video'
        ? `<video src="${item.url}" muted></video><span class="video-badge">Vídeo</span>`
        : `<img src="${item.url}" alt="Recuerdo" loading="lazy" />`}
      <div class="gallery-overlay">${escapeHtml(item.mesaName || 'Mesa')} · ${escapeHtml(item.guestName)}</div>
    </div>`).join('');

  grid.querySelectorAll('.gallery-item').forEach((el) => {
    el.addEventListener('click', () => {
      const lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.innerHTML = `
        <button class="lightbox-close">&times;</button>
        <div class="lightbox-content">
          ${el.dataset.type === 'video'
            ? `<video src="${el.dataset.url}" controls autoplay></video>`
            : `<img src="${el.dataset.url}" alt="Recuerdo" />`}
        </div>`;
      lb.addEventListener('click', (e) => {
        if (e.target === lb || e.target.classList.contains('lightbox-close')) lb.remove();
      });
      document.body.appendChild(lb);
    });
  });
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}
