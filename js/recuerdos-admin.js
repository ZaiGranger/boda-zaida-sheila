/**
 * ADMIN — Crear mesas y generar QR único por mesa
 */

const ADMIN_KEY = 'weddingAdminPassword';
let adminPassword = sessionStorage.getItem(ADMIN_KEY);

document.addEventListener('DOMContentLoaded', () => {
  if (adminPassword) showAdminPanel();
  else document.getElementById('btn-login')?.addEventListener('click', login);
});

async function login() {
  const password = document.getElementById('admin-password')?.value;
  const status = document.getElementById('login-status');

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

  document.getElementById('btn-create-one')?.addEventListener('click', () => createMesas({ name: document.getElementById('mesa-name')?.value }));
  document.getElementById('btn-create-many')?.addEventListener('click', () => createMesas({ count: document.getElementById('mesa-count')?.value }));

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
  if (!res.ok) { alert(data.error); return; }
  document.getElementById('mesa-name').value = '';
  loadMesas();
}

async function loadMesas() {
  const grid = document.getElementById('mesas-grid');
  const res = await apiAdmin('/api/admin/mesas');
  const mesas = await res.json();

  if (!mesas.length) {
    grid.innerHTML = '<p class="gallery-empty">No hay mesas. Crea la primera arriba.</p>';
    return;
  }

  grid.innerHTML = mesas.map((m) => `
    <div class="mesa-card" data-id="${m.id}">
      <h4>${escapeHtml(m.name)}</h4>
      <div class="mesa-qr-wrap"><canvas id="qr-${m.id}"></canvas></div>
      <button class="btn btn-gold btn-sm btn-download-qr" data-id="${m.id}" data-name="${escapeHtml(m.name)}" type="button">Descargar QR</button>
      <button class="btn btn-ghost-dark btn-sm btn-delete-mesa" data-id="${m.id}" type="button">Eliminar</button>
    </div>`).join('');

  // Generar QR en cada canvas (esperar librería)
  await waitForQRCode();
  for (const m of mesas) {
    const canvas = document.getElementById(`qr-${m.id}`);
    if (canvas) {
      await QRCode.toCanvas(canvas, buildMesaQrUrl(m.id, m.token), {
        width: 160, margin: 1, color: { dark: '#1c1917', light: '#ffffff' },
      });
    }
  }

  grid.querySelectorAll('.btn-download-qr').forEach((btn) => {
    btn.addEventListener('click', () => {
      const canvas = document.getElementById(`qr-${btn.dataset.id}`);
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `qr-${btn.dataset.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  });

  grid.querySelectorAll('.btn-delete-mesa').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar esta mesa? El QR dejará de funcionar.')) return;
      await apiAdmin(`/api/admin/mesas/${btn.dataset.id}`, { method: 'DELETE' });
      loadMesas();
    });
  });
}

async function waitForQRCode() {
  let n = 0;
  while (typeof QRCode === 'undefined' && n < 50) {
    await new Promise((r) => setTimeout(r, 100));
    n++;
  }
}
