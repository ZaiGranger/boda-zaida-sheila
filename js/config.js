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
    'Vuestra presencia es el regalo más valioso que podemos recibir. Si deseáis hacernos un detalle, lo recibiremos con todo nuestro cariño en efectivo el día de la boda. ¡Gracias por acompañarnos en este momento tan especial!',

  story: [
    {
      year: 'Febrero 2020',
      title: 'El primer encuentro',
      text: 'Nos conocimos en febrero de 2020, justo un mes antes de la cuarentena. Llevábamos poco tiempo conociéndonos cuando, en marzo, nos confinaron… pero el interés entre nosotras permaneció, día tras día, hasta que por fin pudimos volver a vernos.',
    },
    {
      year: '2023',
      title: 'Un sí en Disneyland Paris',
      text: 'Zaida le pidió matrimonio a Sheila en el lugar más mágico del mundo: Disneyland Paris. Un momento de cuento de hadas que recordaremos para siempre.',
    },
    {
      year: '2025',
      title: 'Nuestro primer hogar',
      text: 'Dimos un paso más juntas y nos compramos nuestra primera casa. El lugar donde construimos nuestro futuro como familia.',
    },
    {
      year: '2027',
      title: 'El gran día',
      text: 'Por fin llega el momento de decir «sí, quiero» rodeadas de las personas que más queremos. ¡Nos casamos!',
    },
  ],

  schedule: [
    { time: '12:00', title: 'Ceremonia', desc: 'El momento más esperado. Calle Literato Azorín 32, Valencia.' },
    { time: '13:00', title: 'Comida', desc: 'Banquete nupcial para disfrutar todos juntos.' },
    { time: '—', title: 'Postre', desc: 'Momento dulce para endulzar la celebración.' },
    { time: '✨', title: 'Sorpresas', desc: 'Hay sorpresas preparadas… ¡no podemos desvelarlas!' },
    { time: '19:00', title: 'Hora de los jóvenes', desc: 'A partir de las 19:00 solo permanecen amigos en el local para celebrarlo por todo lo alto.' },
    { time: '01:00', title: 'Fin del evento', desc: 'Cierre de la fiesta (hora del día siguiente).' },
  ],

  dressCode: {
    title: 'Ven como quieras',
    description: 'Queremos que os sintáis cómodos y vosotros mismos. Podéis venir como cada uno quiera, aunque si podéis, preferimos un estilo arreglado o elegante.',
    tips: ['A vuestro gusto y comodidad', 'Preferiblemente arreglado / elegante', 'Calzado cómodo para bailar'],
  },

  faq: [
    { q: '¿Puedo venir con acompañante?', a: 'Indícalo al confirmar tu asistencia por WhatsApp para poder organizarlo todo correctamente.' },
    { q: '¿Hay parking cerca?', a: 'Sí, hay zonas de aparcamiento en las inmediaciones del lugar de la ceremonia.' },
    { q: '¿Hasta qué hora dura la fiesta?', a: 'El evento va de 12:00 a 01:00 de la madrugada. A partir de las 19:00 es la hora de los jóvenes, donde solo permanecen amigos en el local.' },
    { q: '¿Puedo ver todas las fotos de la boda?', a: 'Cada invitado solo ve los recuerdos que ha subido él o ella. Zaida y Sheila tienen acceso a toda la galería.' },
    { q: '¿Cómo subo fotos del evento?', a: 'Escanea el código QR que encontrarás en tu mesa el día de la boda. Cada mesa tiene su propio QR.' },
  ],
};
