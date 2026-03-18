/**
 * Fuente de verdad para datos de negocio - Furgocasa
 * =================================================
 * Usar SIEMPRE estos valores para mantener coherencia semántica
 * en toda la web, schema.org y visibilidad en IA.
 */

export const COMPANY = {
  /** Teléfono principal (formato E.164 para href) */
  phone: '+34868364161',
  /** Teléfono para mostrar (con espacios) */
  phoneDisplay: '868 36 41 61',
  /** Teléfono con prefijo internacional para mostrar */
  phoneDisplayFull: '+34 868 36 41 61',

  email: 'info@furgocasa.com',

  address: {
    street: 'Avenida Puente Tocinos, 4',
    locality: 'Casillas - Murcia',
    region: 'Región de Murcia',
    postalCode: '30007',
    country: 'ES',
  },

  /** Horario L-V */
  openingHours: {
    weekdays: { opens: '09:00', closes: '19:00' },
    saturday: { opens: '09:00', closes: '14:00' },
  },

  /** Horario para mostrar en texto */
  openingHoursDisplay: {
    weekdays: '09:00 - 19:00',
    saturday: '09:00 - 14:00',
    weekdaysShort: 'Lunes a Viernes',
  },

  /** Rating para schema.org - valores canónicos */
  aggregateRating: {
    ratingValue: '4.9',
    reviewCount: '500',
    bestRating: '5',
    worstRating: '1',
  },

  /** Fianza en euros - valor canónico */
  depositAmount: 1000,

  /** Rango de precios para schema */
  priceRange: '95€ - 155€',

  /** URL base canónica */
  website: 'https://www.furgocasa.com',

  /** Redes sociales */
  sameAs: [
    'https://www.facebook.com/furgocasa',
    'https://www.instagram.com/furgocasa',
  ],

  /** Coordenadas sede Murcia */
  geo: {
    latitude: '38.0265',
    longitude: '-1.1635',
  },

  foundingDate: '2012',
  legalName: 'Furgocasa S.L.',
} as const;
