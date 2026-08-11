/**
 * ADMIN — Crear mesas y generar QR único por mesa
 *
 * Usa la librería QRCode (qrcodejs). Si el QR falla al dibujarse,
 * igual se pueden eliminar mesas y copiar el enlace.
 */

const ADMIN_KEY = 'weddingAdminPassword';
let adminPassword = sessionStorage.getItem(ADMIN_KEY);

document.addEventListener('DOMContentLoaded', () => {
  // Enter en el campo de contraseña también inicia sesión
  document.getElementById('admin-password')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') login();
  });

  if (adminPassword) showAdminPanel();
  else document.getElementById('btn-login')?.addEventListener('click', login);
});

async function login() {
  // trim: evita fallos por espacios al pegar la contraseña
  const password = document.getElementById('admin-password')?.value?.trim();
  const status = document.getElementById('login-status');

  if (!password) {
    showStatus(status, 'Escribe la contraseña', 'error');
    return;
  }

  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error('Contraseña incorrecta');
    sessionStorage.setItem(ADMIN_KEY, password);
    adminPassword = password;
    showAdminPanel();
    showStatus(status, '', '');
  } catch (err) {
    showStatus(status, err.message, 'error');
  }
}

function showAdminPanel() {
  document.getElementById('login-panel')?.classList.add('hidden');
  document.getElementById('admin-panel')?.classList.remove('hidden');

  // Evitar listeners duplicados si se llama más de una vez
  const btnOne = document.getElementById('btn-create-one');
  const btnMany = document.getElementById('btn-create-many');
  if (btnOne && !btnOne.dataset.bound) {
    btnOne.dataset.bound = '1';
    btnOne.addEventListener('click', () =>
      createMesas({ name: document.getElementById('mesa-name')?.value })
    );
  }
  if (btnMany && !btnMany.dataset.bound) {
    btnMany.dataset.bound = '1';
    btnMany.addEventListener('click', () =>
      createMesas({ count: document.getElementById('mesa-count')?.value })
    );
  }

  loadMesas();
}

async function apiAdmin(path, options = {}) {
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Password': adminPassword,
      ...options.headers,
    },
  });
}

async function createMesas(body) {
  const res = await apiAdmin('/api/admin/mesas', { method: 'POST', body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) {
    alert(data.error || 'No se pudo crear');
    return;
  }
  const nameInput = document.getElementById('mesa-name');
  if (nameInput) nameInput.value = '';
  loadMesas();
}

async function loadMesas() {
  const grid = document.getElementById('mesas-grid');
  if (!grid) return;

  const res = await apiAdmin('/api/admin/mesas');
  const mesas = await res.json();

  if (!Array.isArray(mesas) || !mesas.length) {
    grid.innerHTML = '<p class="gallery-empty">No hay mesas. Crea la primera arriba.</p>';
    return;
  }

  // Pintamos tarjetas (el id del QR no puede llevar caracteres raros: usamos índice seguro)
  grid.innerHTML = mesas
    .map((m, i) => {
      const safeId = `qr-box-${i}`;
      return `
    <div class="mesa-card" data-id="${escapeHtml(m.id)}" data-token="${escapeHtml(m.token)}" data-name="${escapeHtml(m.name)}" data-qr="${safeId}">
      <h4>${escapeHtml(m.name)}</h4>
      <div class="mesa-qr-wrap" id="${safeId}"></div>
      <button class="btn btn-gold btn-sm btn-download-qr" type="button">Descargar QR</button>
      <button class="btn btn-ghost-dark btn-sm btn-copy-link" type="button">Copiar enlace</button>
      <button class="btn btn-ghost-dark btn-sm btn-delete-mesa" type="button">Eliminar</button>
    </div>`;
    })
    .join('');

  // 1) Primero enganchamos botones (aunque el dibujo del QR falle)
  bindMesaCardActions(grid);

  // 2) Después dibujamos los QR
  const libOk = await waitForQRCode();
  if (!libOk) {
    grid.querySelectorAll('.mesa-qr-wrap').forEach((el) => {
      el.innerHTML = '<p class="qr-fallback">QR no disponible. Usa «Copiar enlace».</p>';
    });
    return;
  }

  mesas.forEach((m, i) => {
    const box = document.getElementById(`qr-box-${i}`);
    if (!box) return;
    box.innerHTML = ''; // limpio por si se recarga
    try {
      // qrcodejs: new QRCode(elemento, { text, width, height })
      // eslint-disable-next-line no-new
      new QRCode(box, {
        text: buildMesaQrUrl(m.id, m.token),
        width: 160,
        height: 160,
        correctLevel: QRCode.CorrectLevel.M,
      });
    } catch (err) {
      console.error('QR error', err);
      box.innerHTML = '<p class="qr-fallback">Error al generar QR</p>';
    }
  });
}

/** Engancha Descargar / Copiar / Eliminar en cada tarjeta */
function bindMesaCardActions(grid) {
  grid.querySelectorAll('.mesa-card').forEach((card) => {
    const id = card.dataset.id;
    const name = card.dataset.name || 'mesa';
    const token = card.dataset.token;
    const qrBox = card.querySelector('.mesa-qr-wrap');

    card.querySelector('.btn-download-qr')?.addEventListener('click', () => {
      const dataUrl = getQrDataUrl(qrBox);
      if (!dataUrl) {
        alert('El QR aún no está listo. Prueba «Copiar enlace» o recarga la página.');
        return;
      }
      const link = document.createElement('a');
      const safeName = name.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-_áéíóúñ]/gi, '');
      link.download = `qr-${safeName || 'mesa'}.png`;
      link.href = dataUrl;
      link.click();
    });

    card.querySelector('.btn-copy-link')?.addEventListener('click', async () => {
      const url = buildMesaQrUrl(id, token);
      try {
        await navigator.clipboard.writeText(url);
        alert('Enlace copiado. Puedes abrirlo en el móvil para probar.');
      } catch {
        prompt('Copia este enlace:', url);
      }
    });

    card.querySelector('.btn-delete-mesa')?.addEventListener('click', async () => {
      if (!confirm(`¿Eliminar «${name}»? El QR de esa mesa dejará de funcionar.`)) return;
      const res = await apiAdmin(`/api/admin/mesas/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'No se pudo eliminar');
        return;
      }
      loadMesas();
    });
  });
}

/**
 * qrcodejs mete un <img> o un <canvas> dentro del contenedor.
 * Sacamos la imagen en PNG para poder descargarla.
 */
function getQrDataUrl(qrBox) {
  if (!qrBox) return null;
  const img = qrBox.querySelector('img');
  if (img?.src) return img.src;
  const canvas = qrBox.querySelector('canvas');
  if (canvas) {
    try {
      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  }
  return null;
}

/** Espera a que cargue la librería QRCode (máx. ~5 s) */
async function waitForQRCode() {
  let n = 0;
  while (typeof QRCode === 'undefined' && n < 50) {
    await new Promise((r) => setTimeout(r, 100));
    n++;
  }
  return typeof QRCode !== 'undefined';
}
