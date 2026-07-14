/**
 * SUBIR — Solo accesible con QR de mesa (?mesa=...&t=...)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const main = document.getElementById('main-content');
  const mesaLabel = document.getElementById('mesa-label');

  try {
    const mesa = await ensureMesaAccess();
    if (!mesa) {
      showBlockedAccess(main);
      if (mesaLabel) mesaLabel.textContent = 'Acceso restringido';
      return;
    }

    if (mesaLabel) mesaLabel.textContent = mesa.name;

    if (getGuestName()) {
      renderUploadForm(main, mesa);
    } else {
      renderGuestForm(main, mesa);
    }
  } catch (err) {
    showBlockedAccess(main);
    if (mesaLabel) mesaLabel.textContent = err.message || 'QR no válido';
  }
});

function renderGuestForm(main, mesa) {
  main.innerHTML = `
    <div class="guest-id-card">
      <h2>¿Quién eres?</h2>
      <p>Escribe tu nombre para subir recuerdos en <strong>${escapeHtml(mesa.name)}</strong>. Solo verás lo que tú subas.</p>
      <div class="form-field">
        <label for="guest-name-input">Tu nombre</label>
        <input type="text" id="guest-name-input" placeholder="Ej: María" maxlength="100" />
      </div>
      <button class="btn btn-gold btn-full" id="btn-save-guest" type="button">Continuar</button>
    </div>`;

  document.getElementById('btn-save-guest')?.addEventListener('click', () => {
    const name = document.getElementById('guest-name-input')?.value.trim();
    if (!name) { alert('Escribe tu nombre'); return; }
    saveGuest(name, getGuestId() || crypto.randomUUID());
    renderUploadForm(main, mesa);
  });
}

function renderUploadForm(main, mesa) {
  const name = getGuestName();
  main.innerHTML = `
    <p class="guest-welcome">${escapeHtml(mesa.name)} · Hola, <strong>${escapeHtml(name)}</strong></p>
    <form class="form-premium" id="upload-form">
      <div class="form-field">
        <label for="upload-file">Foto o vídeo</label>
        <div class="file-drop" id="file-drop">
          <input type="file" id="upload-file" accept="image/*,video/*" />
          <div class="file-drop-content">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            <p>Arrastra o haz clic</p>
            <span>JPG, PNG, MP4 — máx. 50 MB</span>
          </div>
        </div>
        <p class="file-selected" id="file-selected"></p>
      </div>
      <button type="submit" class="btn btn-gold btn-full">Subir recuerdo</button>
      <p class="form-feedback" id="upload-status"></p>
    </form>
    <div class="recuerdos-links">
      <a href="${buildGaleriaUrl()}" class="btn btn-ghost-dark btn-full">Ver mis recuerdos</a>
      <button class="btn btn-ghost-dark btn-full" id="btn-change-guest" type="button">Cambiar nombre</button>
    </div>`;

  initUploadHandlers(mesa);
  document.getElementById('btn-change-guest')?.addEventListener('click', () => {
    if (confirm('¿Cambiar de usuario? Solo verás los recuerdos del nuevo nombre.')) {
      clearGuest();
      renderGuestForm(main, mesa);
    }
  });
}

function initUploadHandlers(mesa) {
  const form = document.getElementById('upload-form');
  const fileInput = document.getElementById('upload-file');
  const fileDrop = document.getElementById('file-drop');
  const fileSelected = document.getElementById('file-selected');
  const status = document.getElementById('upload-status');

  ['dragenter', 'dragover'].forEach((e) => {
    fileDrop?.addEventListener(e, (ev) => { ev.preventDefault(); fileDrop.classList.add('dragover'); });
  });
  ['dragleave', 'drop'].forEach((e) => {
    fileDrop?.addEventListener(e, (ev) => { ev.preventDefault(); fileDrop.classList.remove('dragover'); });
  });
  fileDrop?.addEventListener('drop', (ev) => {
    if (ev.dataTransfer?.files?.length) {
      fileInput.files = ev.dataTransfer.files;
      if (fileSelected) fileSelected.textContent = ev.dataTransfer.files[0].name;
    }
  });
  fileInput?.addEventListener('change', () => {
    if (fileInput.files?.[0] && fileSelected) fileSelected.textContent = fileInput.files[0].name;
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput?.files?.[0];
    if (!file) { showStatus(status, 'Selecciona un archivo', 'error'); return; }

    const fd = new FormData();
    fd.append('media', file);
    fd.append('guestName', getGuestName());
    fd.append('guestId', getGuestId() || '');
    fd.append('mesaId', mesa.id);
    fd.append('mesaToken', mesa.token);

    showStatus(status, 'Subiendo...', '');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.guestId) saveGuest(getGuestName(), data.guestId);
      showStatus(status, '¡Recuerdo subido!', 'success');
      form.reset();
      if (fileSelected) fileSelected.textContent = '';
      if (typeof confetti === 'function') {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      }
    } catch (err) {
      showStatus(status, err.message, 'error');
    }
  });
}
