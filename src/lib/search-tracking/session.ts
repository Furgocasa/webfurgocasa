/**
 * Utilidades para gestión de sesión de búsqueda
 */

const SESSION_KEY = 'furgocasa_search_session';
const QUERY_ID_KEY = 'furgocasa_search_query_id';

/**
 * Genera o recupera un ID de sesión único
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Almacena el ID de la búsqueda actual
 */
export function setSearchQueryId(queryId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(QUERY_ID_KEY, queryId);
}

/**
 * Recupera el ID de la búsqueda actual
 */
export function getSearchQueryId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(QUERY_ID_KEY);
}

/**
 * Limpia el ID de búsqueda (después de conversión)
 */
export function clearSearchQueryId(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(QUERY_ID_KEY);
}

/**
 * Detecta el tipo de dispositivo desde User Agent
 */
export function detectDeviceType(userAgent: string | null): 'mobile' | 'desktop' | 'tablet' | null {
  if (!userAgent) return null;
  
  const ua = userAgent.toLowerCase();
  
  // Detectar tablets
  if (/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(userAgent)) {
    return 'tablet';
  }
  
  // Detectar móviles
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return 'mobile';
  }
  
  // Por defecto desktop
  return 'desktop';
}

/**
 * Obtiene el locale del navegador
 */
export function getBrowserLocale(): string | null {
  if (typeof window === 'undefined') return null;
  return navigator.language?.split('-')[0] || null;
}

/**
 * Detecta si el User-Agent corresponde a un bot conocido
 * Retorna true si es un bot, false si es un usuario real
 */
export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true; // Sin UA = probablemente bot
  
  const ua = userAgent.toLowerCase();
  
  // Lista completa de bots conocidos
  const botPatterns = [
    // Bots de motores de búsqueda legítimos
    'googlebot',
    'bingbot',
    'slurp', // Yahoo
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'sogou',
    'exabot',
    
    // Scrapers y crawlers
    'scrapy',
    'crawler',
    'spider',
    'scraper',
    'bot',
    'curl',
    'wget',
    'python-requests',
    'python-urllib',
    'java/',
    'go-http-client',
    'node-fetch',
    'axios',
    'okhttp',
    
    // Herramientas de monitoreo
    'uptimerobot',
    'pingdom',
    'monitoring',
    'checker',
    'test',
    
    // Scrapers comerciales conocidos
    'semrush',
    'ahrefs',
    'mj12bot',
    'dotbot',
    'rogerbot',
    'linkedinbot',
    'facebookexternalhit',
    'twitterbot',
    'whatsapp',
    'telegrambot',
    'slackbot',
    'discordbot',
    
    // Bots maliciosos comunes
    'masscan',
    'nmap',
    'nikto',
    'sqlmap',
    'acunetix',
    'nessus',
    'openvas',
    
    // Otros patrones sospechosos
    'headless',
    'phantom',
    'selenium',
    'webdriver',
    'puppeteer',
    'playwright',
  ];
  
  // Comprobar si el UA contiene algún patrón de bot
  const isKnownBot = botPatterns.some(pattern => ua.includes(pattern));
  
  // Patrones adicionales sospechosos
  const suspiciousPatterns = [
    /^mozilla\/5\.0$/i, // Solo "Mozilla/5.0" sin más info
    /^-$/,              // Solo un guion
    /^$/,               // Vacío
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  
  return isKnownBot || isSuspicious;
}
