const fs = require('fs');
const path = require('path');

const renamings = {
  en: {
    'contacto': 'contact',
    'vehiculos': 'vehicles',
    'tarifas': 'rates',
    'ofertas': 'offers',
    'ventas': 'sales',
    'buscar': 'search',
    'quienes-somos': 'about-us',
    'guia-camper': 'camper-guide',
    'inteligencia-artificial': 'artificial-intelligence',
    'mapa-areas': 'areas-map',
    'parking-murcia': 'murcia-parking',
    'video-tutoriales': 'video-tutorials',
    'clientes-vip': 'vip-clients',
    'documentacion-alquiler': 'rental-documentation',
    'como-funciona': 'how-it-works',
    'como-reservar-fin-semana': 'weekend-booking',
    'aviso-legal': 'legal-notice',
    'privacidad': 'privacy',
    'publicaciones': 'publications',
    'reservar': 'book'
  },
  fr: {
    'contacto': 'contact',
    'vehiculos': 'vehicules',
    'tarifas': 'tarifs',
    'ofertas': 'offres',
    'ventas': 'ventes',
    'buscar': 'recherche',
    'quienes-somos': 'a-propos',
    'guia-camper': 'guide-camping-car',
    'inteligencia-artificial': 'intelligence-artificielle',
    'mapa-areas': 'carte-zones',
    'parking-murcia': 'parking-murcie',
    'video-tutoriales': 'tutoriels-video',
    'clientes-vip': 'clients-vip',
    'documentacion-alquiler': 'documentation-location',
    'como-funciona': 'comment-ca-marche',
    'como-reservar-fin-semana': 'reservation-weekend',
    'aviso-legal': 'mentions-legales',
    'privacidad': 'confidentialite',
    'publicaciones': 'publications',
    'reservar': 'reserver'
  },
  de: {
    'contacto': 'kontakt',
    'vehiculos': 'fahrzeuge',
    'tarifas': 'preise',
    'ofertas': 'angebote',
    'ventas': 'verkauf',
    'buscar': 'suche',
    'quienes-somos': 'uber-uns',
    'guia-camper': 'wohnmobil-guide',
    'inteligencia-artificial': 'kunstliche-intelligenz',
    'mapa-areas': 'gebietskarte',
    'parking-murcia': 'parkplatz-murcia',
    'video-tutoriales': 'video-anleitungen',
    'clientes-vip': 'vip-kunden',
    'documentacion-alquiler': 'mietdokumentation',
    'como-funciona': 'wie-es-funktioniert',
    'como-reservar-fin-semana': 'wochenend-buchung',
    'aviso-legal': 'impressum',
    'privacidad': 'datenschutz',
    'publicaciones': 'publikationen',
    'reservar': 'buchen'
  }
};

async function renameFolder(oldPath, newPath) {
  try {
    await fs.promises.rename(oldPath, newPath);
    console.log(`✅ ${oldPath} → ${newPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error renombrando ${oldPath}:`, error.message);
    return false;
  }
}

async function renameLocale(locale) {
  console.log(`\n🔄 Procesando idioma: ${locale.toUpperCase()}`);
  
  const baseDir = path.join(__dirname, '..', 'src', 'app', locale);
  const renames = renamings[locale];
  
  for (const [oldName, newName] of Object.entries(renames)) {
    const oldPath = path.join(baseDir, oldName);
    const newPath = path.join(baseDir, newName);
    
    if (fs.existsSync(oldPath)) {
      await renameFolder(oldPath, newPath);
      // Pequeña pausa para evitar conflictos
      await new Promise(resolve => setTimeout(resolve, 100));
    } else {
      console.log(`⏭️  Saltando ${oldName} (no existe)`);
    }
  }
  
  console.log(`✅ ${locale.toUpperCase()} completado`);
}

async function main() {
  console.log('🚀 Iniciando renombrado de carpetas...\n');
  
  await renameLocale('en');
  await renameLocale('fr');
  await renameLocale('de');
  
  console.log('\n✅ ¡Renombrado completado para todos los idiomas!');
}

main().catch(console.error);
