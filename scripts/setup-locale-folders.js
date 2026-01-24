const fs = require('fs');
const path = require('path');

// Mapeo de nombres español → inglés/francés/alemán
const translations = {
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

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function setupLocale(locale) {
  console.log(`\n🔄 Procesando ${locale.toUpperCase()}...`);
  
  const srcDir = path.join(__dirname, '..', 'src', 'app', 'es');
  const targetDir = path.join(__dirname, '..', 'src', 'app', locale);
  const trans = translations[locale];
  
  // Obtener todos los subdirectorios de /es/ (excepto archivos raíz)
  const items = fs.readdirSync(srcDir, { withFileTypes: true });
  
  for (const item of items) {
    if (!item.isDirectory()) continue; // Saltar archivos como layout.tsx, page.tsx
    
    const spanishName = item.name;
    const translatedName = trans[spanishName] || spanishName; // Usar el original si no hay traducción
    
    const srcPath = path.join(srcDir, spanishName);
    const destPath = path.join(targetDir, translatedName);
    
    try {
      // Si ya existe el destino, eliminarlo primero
      if (fs.existsSync(destPath)) {
        fs.rmSync(destPath, { recursive: true, force: true });
      }
      
      // Copiar carpeta completa
      copyDirRecursive(srcPath, destPath);
      console.log(`  ✅ ${spanishName} → ${translatedName}`);
    } catch (error) {
      console.error(`  ❌ Error con ${spanishName}:`, error.message);
    }
    
    // Pequeña pausa
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log(`✅ ${locale.toUpperCase()} completado`);
}

async function main() {
  console.log('🚀 Configurando carpetas de idiomas desde /es/...\n');
  
  await setupLocale('en');
  await setupLocale('fr');
  await setupLocale('de');
  
  console.log('\n✅ ¡Todas las carpetas configuradas correctamente!');
}

main().catch(console.error);
