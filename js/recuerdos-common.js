/**
 * Lógica común para páginas de recuerdos (acceso solo vía QR de mesa)
 */

const SESSION_MESA = 'weddingMesaSession';
const SESSION_GUEST_ID = 'weddingGuestId';
const SESSION_GUEST_NAME = 'weddingGuestName';

/** Lee mesa y token de la URL (?mesa=xxx&t=yyy) */
function getMesaFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    mesaId: params.get('mesa') || '',
    token: params.get('t') || '',
  };
}

/** Guarda la sesión de mesa tras validar el QR */
function saveMesaSession(mesa) {
  sessionStorage.setItem(SESSION_MESA, JSON.stringify(mesa));
}

function getMesaSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_MESA) || 'null');
  } catch {
    return null;
  }
}

function getGuestId() {
  return localStorage.getItem(SESSION_GUEST_ID);
}

function getGuestName() {
  return localStorage.getItem(SESSION_GUEST_NAME);
}

function saveGuest(name, guestId) {
  localStorage.setItem(SESSION_GUEST_NAME, name);
  if (guestId) localStorage.setItem(SESSION_GUEST_ID, guestId);
}

function clearGuest() {
  localStorage.removeItem(SESSION_GUEST_ID);
  localStorage.removeItem(SESSION_GUEST_NAME);
}

/** URL base del sitio (para QRs en admin) */
function getSiteUrl() {
  if (typeof WEDDING_CONFIG !== 'undefined' && WEDDING_CONFIG.siteUrl) {
    return WEDDING_CONFIG.siteUrl.replace(/\/$/, '');
  }
  if (window.location.protocol !== 'file:') {
    return window.location.origin;
  }
  return 'http://localhost:3001';
}

/** Enlace que lleva el QR de una mesa */
function buildMesaQrUrl(mesaId, token) {
  return `${getSiteUrl()}/recuerdos/subir.html?mesa=${encodeURIComponent(mesaId)}&t=${encodeURIComponent(token)}`;
}

/** Enlace a galería personal (misma mesa) */
function buildGaleriaUrl() {
  const mesa = getMesaSession();
  if (!mesa) return 'galeria.html';
  return `galeria.html?mesa=${encodeURIComponent(mesa.id)}&t=${encodeURIComponent(mesa.token)}`;
}

/**
 * Valida acceso por QR. Si hay params en URL, verifica con el servidor.
 * Si no hay params, usa sesión guardada. Si nada válido, devuelve null.
 */
async function ensureMesaAccess() {
  const fromUrl = getMesaFromUrl();

  if (fromUrl.mesaId && fromUrl.token) {
    try {
      const res = await fetch(
        `/api/mesa/verify?mesa=${encodeURIComponent(fromUrl.mesaId)}&t=${encodeURIComponent(fromUrl.token)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const session = { id: data.mesa.id, name: data.mesa.name, token: fromUrl.token };
      saveMesaSession(session);
      // Limpiar URL para no compartir el token por accidente en barra de direcciones
      window.history.replaceState({}, '', window.location.pathname);
      return session;
    } catch (err) {
      throw err;
    }
  }

  const saved = getMesaSession();
  if (saved?.id && saved?.token) {
    const res = await fetch(
      `/api/mesa/verify?mesa=${encodeURIComponent(saved.id)}&t=${encodeURIComponent(saved.token)}`
    );
    if (res.ok) return saved;
    sessionStorage.removeItem(SESSION_MESA);
  }

  return null;
}

function showBlockedAccess(container) {
  container.innerHTML = `
    <div class="access-blocked">
      <span class="access-blocked-icon">📱</span>
      <h2>Escanea el QR de tu mesa</h2>
      <p>Esta página solo es accesible escaneando el código QR que encontrarás en tu mesa el día de la boda.</p>
      <p class="access-hint">Cada mesa tiene su propio código. Sin él no es posible subir ni ver recuerdos.</p>
      <a href="../index.html" class="btn btn-ghost-dark">Volver a la invitación</a>
    </div>`;
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function showStatus(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.className = `form-feedback ${type || ''}`;
}
