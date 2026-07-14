/**
 * SERVIDOR — Invitación + recuerdos por mesa (QR único)
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');
const TABLES_FILE = path.join(DATA_DIR, 'tables.json');
const SONGS_FILE = path.join(DATA_DIR, 'songs.json');
const SCORES_FILE = path.join(DATA_DIR, 'scores.json');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ZaidaSheila2027';

// Playlist colaborativa (configurable en Render sin tocar código)
const SPOTIFY_PLAYLIST_URL = process.env.SPOTIFY_PLAYLIST_URL || 'https://open.spotify.com/playlist/3VqjpPnHfKktz8tc5pMqbi';
const SPOTIFY_COLLABORATOR_URL = process.env.SPOTIFY_COLLABORATOR_URL || SPOTIFY_PLAYLIST_URL;
const SPOTIFY_PLAYLIST_TITLE = process.env.SPOTIFY_PLAYLIST_TITLE || 'Playlist boda Zaida & Sheila';

[UPLOADS_DIR, DATA_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

[GALLERY_FILE, TABLES_FILE, SONGS_FILE, SCORES_FILE].forEach((file) => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(ROOT_DIR));

// Datos de la boda (para generar .ics sin descarga en iPhone)
const WEDDING_ICS = {
  bride1: 'Zaida',
  bride2: 'Sheila',
  start: '20270904T120000',
  end: '20270905T010000',
  location: 'Calle Literato Azorín 32, Valencia, España',
  summary: 'Boda Zaida & Sheila',
  description: 'Ceremonia y celebración de la boda de Zaida y Sheila.',
};

// Config pública (playlist Spotify desde variables de entorno en Render)
app.get('/api/public-config', (_req, res) => {
  res.json({
    spotifyPlaylistUrl: SPOTIFY_PLAYLIST_URL,
    spotifyCollaboratorUrl: SPOTIFY_COLLABORATOR_URL,
    spotifyPlaylistTitle: SPOTIFY_PLAYLIST_TITLE,
  });
});

// Calendario iPhone: al abrir esta URL, Safari muestra "Añadir al calendario" (sin descargar archivo)
app.get('/boda.ics', (_req, res) => {
  const { summary, description, location, start, end } = WEDDING_ICS;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Boda Zaida Sheila//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:boda-zaida-sheila-2027@boda-zaida-sheila.onrender.com`,
    `DTSTAMP:${start}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="boda-zaida-sheila.ics"');
  res.send(ics);
});

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${safe}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^(image\/(jpeg|jpg|png|gif|webp|heic)|video\/(mp4|webm|quicktime|mov))$/i.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Solo imágenes y vídeos'));
  },
});

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function isAdmin(req) {
  return req.headers['x-admin-password'] === ADMIN_PASSWORD;
}

/** Busca mesa por id y comprueba el token secreto del QR */
function findTable(mesaId, token) {
  const tables = readJson(TABLES_FILE);
  return tables.find((t) => t.id === mesaId && t.token === token) || null;
}

// --- Verificar acceso desde QR de mesa ---
app.get('/api/mesa/verify', (req, res) => {
  const mesaId = (req.query.mesa || '').trim();
  const token = (req.query.t || '').trim();
  const table = findTable(mesaId, token);

  if (!table) {
    return res.status(403).json({ error: 'Código QR no válido. Escanea el QR de tu mesa.' });
  }

  res.json({ success: true, mesa: { id: table.id, name: table.name } });
});

// --- Admin: listar mesas ---
app.get('/api/admin/mesas', (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'No autorizado' });
  res.json(readJson(TABLES_FILE));
});

// --- Admin: crear mesa(s) ---
app.post('/api/admin/mesas', (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'No autorizado' });

  const { name, count } = req.body;
  const tables = readJson(TABLES_FILE);
  const created = [];

  if (count && Number(count) > 0) {
    const n = Math.min(Number(count), 50);
    const start = tables.length + 1;
    for (let i = 0; i < n; i++) {
      const entry = {
        id: crypto.randomUUID(),
        token: crypto.randomBytes(16).toString('hex'),
        name: `Mesa ${start + i}`,
        createdAt: new Date().toISOString(),
      };
      tables.push(entry);
      created.push(entry);
    }
  } else if (name?.trim()) {
    const entry = {
      id: crypto.randomUUID(),
      token: crypto.randomBytes(16).toString('hex'),
      name: name.trim().slice(0, 80),
      createdAt: new Date().toISOString(),
    };
    tables.push(entry);
    created.push(entry);
  } else {
    return res.status(400).json({ error: 'Indica nombre de mesa o cantidad' });
  }

  writeJson(TABLES_FILE, tables);
  res.json({ success: true, mesas: created });
});

// --- Admin: eliminar mesa ---
app.delete('/api/admin/mesas/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'No autorizado' });
  let tables = readJson(TABLES_FILE);
  tables = tables.filter((t) => t.id !== req.params.id);
  writeJson(TABLES_FILE, tables);
  res.json({ success: true });
});

app.post('/api/admin/verify', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) res.json({ success: true });
  else res.status(401).json({ error: 'Contraseña incorrecta' });
});

// --- Subir archivo (requiere mesa + token + guestId) ---
app.post('/api/upload', upload.single('media'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió archivo' });

  const mesaId = (req.body.mesaId || '').trim();
  const token = (req.body.mesaToken || '').trim();
  const table = findTable(mesaId, token);

  if (!table) {
    return res.status(403).json({ error: 'Acceso no válido. Usa el QR de tu mesa.' });
  }

  const guestName = (req.body.guestName || 'Invitado').trim().slice(0, 100);
  let guestId = (req.body.guestId || '').trim().slice(0, 64);
  if (!guestId) guestId = crypto.randomUUID();

  const mediaInfo = {
    id: Date.now().toString(),
    mesaId: table.id,
    mesaName: table.name,
    guestId,
    guestName,
    filename: req.file.filename,
    type: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
    uploadedAt: new Date().toISOString(),
    url: `/uploads/${req.file.filename}`,
  };

  const gallery = readJson(GALLERY_FILE);
  gallery.unshift(mediaInfo);
  writeJson(GALLERY_FILE, gallery);

  res.json({ success: true, media: mediaInfo, guestId });
});

// --- Galería ---
// Admin: todo | Invitado: solo sus fotos de SU mesa (mesaId + token + guestId)
app.get('/api/gallery', (req, res) => {
  const gallery = readJson(GALLERY_FILE);

  if (isAdmin(req)) return res.json(gallery);

  const mesaId = (req.query.mesa || '').trim();
  const token = (req.query.t || '').trim();
  const guestId = (req.query.guestId || '').trim();

  const table = findTable(mesaId, token);
  if (!table) return res.status(403).json({ error: 'Acceso no válido' });
  if (!guestId) return res.status(401).json({ error: 'Identificación requerida' });

  const mine = gallery.filter(
    (item) => item.mesaId === mesaId && item.guestId === guestId
  );
  res.json(mine);
});

app.post('/api/songs', (req, res) => {
  const { guestName, song, artist, spotifyId, albumImage, spotifyUrl, previewUrl } = req.body;
  if (!song?.trim()) return res.status(400).json({ error: 'Canción obligatoria' });

  const songs = readJson(SONGS_FILE);
  songs.unshift({
    id: Date.now().toString(),
    guestName: (guestName || 'Anónimo').slice(0, 100),
    song: song.slice(0, 200),
    artist: (artist || '').slice(0, 200),
    spotifyId: spotifyId || null,
    albumImage: albumImage || null,
    spotifyUrl: spotifyUrl || null,
    previewUrl: previewUrl || null,
    createdAt: new Date().toISOString(),
  });
  writeJson(SONGS_FILE, songs);
  res.json({ success: true });
});

app.get('/api/songs', (_req, res) => res.json(readJson(SONGS_FILE)));

app.post('/api/scores', (req, res) => {
  const { playerName, score } = req.body;
  if (!playerName?.trim() || typeof score !== 'number') {
    return res.status(400).json({ error: 'Datos incompletos' });
  }
  const scores = readJson(SCORES_FILE);
  scores.unshift({
    id: Date.now().toString(),
    playerName: playerName.slice(0, 50),
    score,
    prize: getPrizeForScore(score),
    createdAt: new Date().toISOString(),
  });
  scores.sort((a, b) => b.score - a.score);
  writeJson(SCORES_FILE, scores.slice(0, 50));
  res.json({ success: true });
});

app.get('/api/scores', (_req, res) => res.json(readJson(SCORES_FILE)));

function getPrizeForScore(score) {
  if (score >= 50) return '🏆 ¡Campeón/a del ramo!';
  if (score >= 30) return '💃 ¡Bailarín/a estrella!';
  if (score >= 15) return '🌸 ¡Buen ojo!';
  return '💕 ¡Gracias por jugar!';
}

// --- Spotify (búsqueda de canciones para invitados) ---
// Requiere SPOTIFY_CLIENT_ID y SPOTIFY_CLIENT_SECRET en variables de entorno.
// Crear app en https://developer.spotify.com/dashboard

let spotifyToken = null;
let spotifyTokenExpiry = 0;

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (spotifyToken && Date.now() < spotifyTokenExpiry) return spotifyToken;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) return null;

  const data = await res.json();
  spotifyToken = data.access_token;
  spotifyTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return spotifyToken;
}

app.get('/api/spotify/status', (_req, res) => {
  const configured = !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
  res.json({ configured });
});

app.get('/api/spotify/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json([]);

  const token = await getSpotifyToken();
  if (!token) {
    return res.status(503).json({
      error: 'Spotify no configurado. Añade SPOTIFY_CLIENT_ID y SPOTIFY_CLIENT_SECRET en el servidor.',
    });
  }

  try {
    const url = `https://api.spotify.com/v1/search?type=track&limit=8&q=${encodeURIComponent(q)}`;
    const spotifyRes = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!spotifyRes.ok) return res.status(502).json({ error: 'Error al buscar en Spotify' });

    const data = await spotifyRes.json();
    const tracks = (data.tracks?.items || []).map((t) => ({
      id: t.id,
      name: t.name,
      artist: t.artists?.map((a) => a.name).join(', ') || '',
      album: t.album?.name || '',
      image: t.album?.images?.[2]?.url || t.album?.images?.[0]?.url || '',
      spotifyUrl: t.external_urls?.spotify || '',
      previewUrl: t.preview_url || '',
    }));

    res.json(tracks);
  } catch {
    res.status(500).json({ error: 'No se pudo conectar con Spotify' });
  }
});

app.listen(PORT, () => {
  console.log(`💒 Web activa en http://localhost:${PORT}`);
  console.log(`📷 Admin mesas/QR: /recuerdos/admin.html`);
  console.log(`🔐 Contraseña admin: ${ADMIN_PASSWORD}`);
});
