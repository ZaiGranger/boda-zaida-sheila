/**
 * CONFIGURACIÓN DE LA BODA
 * Edita este archivo con vuestros datos antes de publicar.
 */
const WEDDING_CONFIG = {
  bride1: 'Zaida',
  bride2: 'Sheila',
  weddingDate: '2027-09-04T12:00:00',
  weddingTime: '12:00',
  eventEnd: '01:00', // del día siguiente
  hashtag: '#ZaidaYSheila2027',

  // URL pública (Render). Actualizar si cambia el nombre del servicio.
  siteUrl: 'https://boda-zaida-sheila.onrender.com',

  // Playlist colaborativa de Spotify (recomendado, sin Premium de desarrollador).
  // 1. Cread una playlist en Spotify → clic derecho → "Playlist colaborativa"
  // 2. Compartir → Copiar enlace y pegarlo aquí:
  spotifyPlaylistUrl: 'https://open.spotify.com/playlist/3VqjpPnHfKktz8tc5pMqbi',
  // Enlace de colaboradores (opcional; caduca ~7 días — el botón usa spotifyPlaylistUrl)
  spotifyCollaboratorUrl: 'https://open.spotify.com/playlist/3VqjpPnHfKktz8tc5pMqbi',
  spotifyPlaylistTitle: 'Playlist boda Zaida & Sheila',

  // Música de fondo (se inicia al pulsar "Abrir invitación")
  // Volumen suave 0–1; el archivo está en /audio/marry-you.mp3
  backgroundMusic: {
    src: 'assets/audio/boda.mp3',
    volume: 0.3,
    loop: true,
  },

  venue: {
    name: 'Ceremonia',
    address: 'Calle Literato Azorín 32',
    city: 'Valencia',
    fullAddress: 'Calle Literato Azorín 32, Valencia, España',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Calle+Literato+Azorin+32+Valencia+España',
    mapsEmbed: 'https://maps.google.com/maps?q=Calle+Literato+Azorin+32+Valencia+España&output=embed',
    lat: 39.4699,
    lon: -0.3763,
  },

  // WhatsApp para confirmar asistencia (prefijo España 34)
  whatsappContacts: [
    { name: 'Zaida', number: '34605826729' },
    { name: 'Sheila', number: '34652737073' },
  ],
  couplePhoto: 'images/couple.jpg',

  giftMessage:
    'Vuestra presencia es el mejor regalo. Si queréis un detalle, preferimos efectivo el día del evento.',

  story: [
    {
      year: 'Febrero 2020',
      title: 'El primer encuentro',
      text: 'Nos conocimos un mes antes de la cuarentena. El interés siguió, día a día, hasta vernos de nuevo.',
    },
    {
      year: '2023',
      title: 'Un sí en Disneyland Paris',
      text: 'Zaida le pidió matrimonio a Sheila en Disneyland Paris. Un momento de cuento.',
    },
    {
      year: '2025',
      title: 'Nuestro primer hogar',
      text: 'Compramos nuestra primera casa. El lugar donde construimos el futuro.',
    },
    {
      year: '2027',
      title: 'El gran día',
      text: 'El «sí, quiero», rodeadas de quienes más queremos.',
    },
  ],

  schedule: [
    { time: '12:00', title: 'Ceremonia', desc: 'Calle Literato Azorín 32, Valencia.', icon: 'rings' },
    { time: '13:00', title: 'Comida', desc: 'Banquete juntos.', icon: 'plate' },
    { time: '—', title: 'Postre', desc: 'Momento dulce.', icon: 'cake' },
    { time: '✨', title: 'Sorpresas', desc: 'Hay más… ¡sin spoilers!', icon: 'spark' },
    { time: '19:00', title: 'Hora de los jóvenes', desc: 'A partir de las 19:00, fiesta con amigos.', icon: 'music' },
    { time: '01:00', title: 'Fin', desc: 'Cierre de la celebración.', icon: 'moon' },
  ],

  dressCode: {
    title: 'Ven como quieras',
    description: 'Cómodos y vosotros mismos. Si podéis, estilo arreglado o elegante.',
    tips: ['A vuestro gusto', 'Preferible arreglado / elegante', 'Calzado cómodo para bailar'],
  },

  faq: [
    { q: '¿Puedo venir con acompañante?', a: 'Indícalo al confirmar tu asistencia por WhatsApp para poder organizarlo todo correctamente.' },
    { q: '¿Hay parking cerca?', a: 'Sí, hay zonas de aparcamiento en las inmediaciones del lugar de la ceremonia.' },
    { q: '¿Hasta qué hora dura la fiesta?', a: 'El evento va de 12:00 a 01:00 de la madrugada. A partir de las 19:00 es la hora de los jóvenes, donde solo permanecen amigos en el local.' },
    { q: '¿Cómo subo o veo fotos del evento?', a: 'Escanea el QR de tu mesa. Podrás subir fotos/vídeos y ver todo lo que haya subido tu mesa. Cada mesa tiene su propio QR.' },
    { q: '¿Puedo ver las fotos de otras mesas?', a: 'No: cada mesa solo ve sus recuerdos. Zaida y Sheila tienen acceso a toda la galería.' },
  ],
};
