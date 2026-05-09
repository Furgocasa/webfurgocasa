import Image from "next/image";
import {
  Camera,
  CalendarRange,
  CheckCircle2,
  FileImage,
  Gift,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  Trophy,
  Upload,
  Users,
  Video,
} from "lucide-react";
import { LocalizedLink } from "@/components/localized-link";
import {
  DISCOUNT_TIERS,
  MAX_DISCOUNT_PCT,
  PERK_TIERS,
  POINTS_PER_PHOTO_SELECTED,
  POINTS_PER_PHOTO_UPLOAD,
  POINTS_PER_VIDEO_SELECTED,
  POINTS_PER_VIDEO_UPLOAD,
  COUPON_VALIDITY_MONTHS,
  COUPON_MIN_RESERVATION_DAYS,
} from "@/lib/storytellers/config";
import type { Locale } from "@/lib/i18n/config";

// Tipo del helper de traducción inline.
// Mantiene los 4 idiomas pegados al lado del JSX para facilitar el mantenimiento.
type Tr = (es: string, en: string, fr: string, de: string) => string;

const localeUrlPath: Record<Locale, string> = {
  es: "/es/storytellers",
  en: "/en/storytellers",
  fr: "/fr/storytellers",
  de: "/de/storytellers",
};

const localeOg: Record<Locale, string> = {
  es: "es_ES",
  en: "en_US",
  fr: "fr_FR",
  de: "de_DE",
};

/**
 * Construye el FAQ traducido que se muestra al cliente Y se usa para el
 * schema.org FAQPage (mejora rich snippets en buscadores e IA).
 */
function buildFaq(tr: Tr): { q: string; a: string }[] {
  return [
    {
      q: tr(
        "¿Necesito tener cuenta o registrarme?",
        "Do I need an account or to register?",
        "Dois-je créer un compte ou m'inscrire ?",
        "Brauche ich ein Konto oder muss ich mich registrieren?"
      ),
      a: tr(
        "No. El programa funciona sin login. Para subir contenido, solo necesitas tu nº de reserva (lo encuentras en tu email de confirmación) y el email asociado a esa reserva.",
        "No. The programme works without login. To upload content you only need your booking number (you'll find it in your confirmation email) and the email associated with that booking.",
        "Non. Le programme fonctionne sans connexion. Pour envoyer du contenu, vous n'avez besoin que de votre numéro de réservation (dans votre e-mail de confirmation) et de l'e-mail associé à cette réservation.",
        "Nein. Das Programm funktioniert ohne Login. Um Inhalte hochzuladen, benötigst du nur deine Buchungsnummer (in deiner Bestätigungs-E-Mail) und die mit dieser Buchung verknüpfte E-Mail-Adresse."
      ),
    },
    {
      q: tr(
        "¿Cuándo puedo subir mis fotos y vídeos?",
        "When can I upload my photos and videos?",
        "Quand puis-je envoyer mes photos et vidéos ?",
        "Wann kann ich meine Fotos und Videos hochladen?"
      ),
      a: tr(
        "Desde 7 días antes de la fecha de devolución (puedes subir durante el viaje) y hasta 90 días después. Pasado ese plazo, ya no se aceptan subidas de esa reserva.",
        "From 7 days before the drop-off date (you can upload during the trip) and up to 90 days after. After that period, no more uploads are accepted for that booking.",
        "Dès 7 jours avant la date de restitution (vous pouvez envoyer pendant le voyage) et jusqu'à 90 jours après. Passé ce délai, aucun envoi n'est accepté pour cette réservation.",
        "Ab 7 Tagen vor dem Rückgabedatum (du kannst während der Reise hochladen) und bis zu 90 Tage danach. Nach diesem Zeitraum werden keine Uploads mehr für diese Buchung akzeptiert."
      ),
    },
    {
      q: tr(
        "¿Cuántas fotos puedo subir por reserva?",
        "How many photos can I upload per booking?",
        "Combien de photos puis-je envoyer par réservation ?",
        "Wie viele Fotos kann ich pro Buchung hochladen?"
      ),
      a: tr(
        "Hasta 100 fotos y 20 vídeos por reserva. El lote mínimo de subida es de 3 fotos o 1 vídeo.",
        "Up to 100 photos and 20 videos per booking. The minimum upload batch is 3 photos or 1 video.",
        "Jusqu'à 100 photos et 20 vidéos par réservation. Le lot minimum d'envoi est de 3 photos ou 1 vidéo.",
        "Bis zu 100 Fotos und 20 Videos pro Buchung. Die Mindestmenge pro Upload beträgt 3 Fotos oder 1 Video."
      ),
    },
    {
      q: tr(
        "¿Mis fotos se publicarán en redes / web Furgocasa?",
        "Will my photos be published on Furgocasa's website / social media?",
        "Mes photos seront-elles publiées sur le site / les réseaux Furgocasa ?",
        "Werden meine Fotos auf der Furgocasa-Website / in sozialen Netzwerken veröffentlicht?"
      ),
      a: tr(
        "No nos comprometemos a publicar nada. Si tu material nos interesa para nuestro archivo profesional, lo \u201cseleccionamos\u201d y te damos puntos extra. Después podemos usarlo o no en cualquier momento, dentro de los términos de cesión que aceptas al subir.",
        "We don't commit to publishing anything. If your content is interesting for our professional archive, we 'select' it and award you extra points. We may then use it or not at any time, under the licensing terms you accept on upload.",
        "Nous ne nous engageons à rien publier. Si votre contenu nous intéresse pour notre archive professionnelle, nous le « sélectionnons » et vous attribuons des points supplémentaires. Nous pouvons ensuite l'utiliser ou non à tout moment, dans le cadre des conditions de cession que vous acceptez à l'envoi.",
        "Wir verpflichten uns nicht, etwas zu veröffentlichen. Wenn dein Material für unser professionelles Archiv interessant ist, „wählen“ wir es aus und geben dir Extra-Punkte. Anschließend können wir es jederzeit verwenden oder nicht, gemäß den Nutzungsbedingungen, die du beim Upload akzeptierst."
      ),
    },
    {
      q: tr(
        "¿Cómo canjeo el descuento?",
        "How do I redeem the discount?",
        "Comment échanger ma réduction ?",
        "Wie löse ich den Rabatt ein?"
      ),
      a: tr(
        `Al alcanzar un umbral, generamos un código de cupón con tu % desbloqueado. Lo introduces al hacer una nueva reserva. Reglas: solo en baja y media temporada, mínimo ${COUPON_MIN_RESERVATION_DAYS} días, no acumulable con otras promos, caduca a ${COUPON_VALIDITY_MONTHS} meses, tope ${MAX_DISCOUNT_PCT}%.`,
        `When you reach a threshold, we generate a coupon code with your unlocked %. You enter it when making a new booking. Rules: low and mid-season only, minimum ${COUPON_MIN_RESERVATION_DAYS} days, not combinable with other promos, expires after ${COUPON_VALIDITY_MONTHS} months, capped at ${MAX_DISCOUNT_PCT}%.`,
        `Lorsque vous atteignez un palier, nous générons un code de coupon avec votre % débloqué. Vous le saisissez lors d'une nouvelle réservation. Règles : uniquement en basse et moyenne saison, minimum ${COUPON_MIN_RESERVATION_DAYS} jours, non cumulable avec d'autres promotions, expire au bout de ${COUPON_VALIDITY_MONTHS} mois, plafond à ${MAX_DISCOUNT_PCT} %.`,
        `Wenn du eine Schwelle erreichst, generieren wir einen Gutscheincode mit deinem freigeschalteten %. Du gibst ihn bei einer neuen Buchung ein. Regeln: nur in der Neben- und Zwischensaison, mindestens ${COUPON_MIN_RESERVATION_DAYS} Tage, nicht mit anderen Promotionen kombinierbar, läuft nach ${COUPON_VALIDITY_MONTHS} Monaten ab, gedeckelt bei ${MAX_DISCOUNT_PCT}%.`
      ),
    },
    {
      q: tr(
        "¿El 3% de bienvenida se gana en cada subida?",
        "Is the 3% welcome coupon earned on every upload?",
        "Le coupon de bienvenue de 3 % est-il gagné à chaque envoi ?",
        "Wird der 3% Willkommensgutschein bei jedem Upload verdient?"
      ),
      a: tr(
        "No. El cupón del 3% se entrega solo en tu primera subida válida (≥3 fotos o 1 vídeo) y solo una vez por email. A partir de ahí, las siguientes subidas suman puntos al ledger, pero no generan cupones nuevos hasta que cruzas los 40 puntos (5%). En ese momento, el 3% queda anulado y se sustituye automáticamente por el nuevo cupón del 5%. Y así sucesivamente con los tramos superiores. Solo tienes un cupón activo a la vez: el de mayor %.",
        "No. The 3% coupon is awarded only on your first valid upload (≥3 photos or 1 video) and only once per email. From then on, further uploads add points to your ledger but don't generate new coupons until you cross 40 points (5%). At that moment, the 3% is voided and automatically replaced by the new 5% coupon, and so on with the higher tiers. You only ever have one active coupon: the one with the highest %.",
        "Non. Le coupon de 3 % n'est attribué qu'à votre premier envoi valide (≥3 photos ou 1 vidéo) et une seule fois par e-mail. Ensuite, les envois suivants ajoutent des points à votre solde, mais ne génèrent pas de nouveaux coupons tant que vous n'avez pas franchi les 40 points (5 %). À ce moment-là, le coupon de 3 % est annulé et remplacé automatiquement par le nouveau coupon de 5 %, et ainsi de suite pour les paliers supérieurs. Vous n'avez qu'un seul coupon actif à la fois : celui du % le plus élevé.",
        "Nein. Der 3%-Gutschein wird nur bei deinem ersten gültigen Upload (≥3 Fotos oder 1 Video) und nur einmal pro E-Mail vergeben. Danach summieren weitere Uploads Punkte in deinem Konto, generieren aber keine neuen Gutscheine, bis du 40 Punkte (5 %) erreichst. In diesem Moment wird der 3%-Gutschein storniert und automatisch durch den neuen 5%-Gutschein ersetzt, und so weiter mit den höheren Stufen. Du hast immer nur einen aktiven Gutschein: den mit dem höchsten %."
      ),
    },
    {
      q: tr(
        "¿Mis fotos van a tener un uso comercial?",
        "Will my photos be used commercially?",
        "Mes photos auront-elles un usage commercial ?",
        "Werden meine Fotos kommerziell genutzt?"
      ),
      a: tr(
        "Sí, al subir aceptas la cesión de uso de tus archivos: no exclusiva, mundial, perpetua, en todos los medios online y offline incluida publicidad pagada, con derecho de modificación. Esto es estándar para programas como este.",
        "Yes — by uploading you accept the licensing terms for your files: non-exclusive, worldwide, perpetual, on all online and offline media including paid advertising, with the right to edit. This is standard for programmes like this one.",
        "Oui, en envoyant vos fichiers, vous acceptez les conditions de cession : non exclusive, mondiale, perpétuelle, sur tous les supports en ligne et hors ligne y compris la publicité payante, avec droit de modification. C'est standard pour ce type de programme.",
        "Ja, mit dem Upload akzeptierst du die Nutzungsbedingungen deiner Dateien: nicht-exklusiv, weltweit, unbefristet, in allen Online- und Offline-Medien einschließlich bezahlter Werbung, mit Bearbeitungsrecht. Das ist Standard für solche Programme."
      ),
    },
    {
      q: tr(
        "¿Y si solo subo material malo o repetido?",
        "What if I only upload bad or repeated material?",
        "Et si je n'envoie que du contenu de mauvaise qualité ou répété ?",
        "Was, wenn ich nur schlechtes oder wiederholtes Material hochlade?"
      ),
      a: tr(
        "Sumarás los puntos de las subidas (premiamos la intención), pero NO los de selección. Solo lo que aporta valor real al archivo recibe los puntos extra de selección.",
        "You'll get the upload points (we reward the intent), but NOT the selection points. Only material that brings real value to our archive earns the extra selection points.",
        "Vous obtiendrez les points d'envoi (nous récompensons l'intention), mais PAS les points de sélection. Seul le contenu qui apporte une valeur réelle à notre archive reçoit les points supplémentaires de sélection.",
        "Du erhältst die Upload-Punkte (wir belohnen die Absicht), aber NICHT die Auswahl-Punkte. Nur Material, das unserem Archiv echten Mehrwert bietet, erhält die zusätzlichen Auswahl-Punkte."
      ),
    },
    {
      q: tr(
        "¿Puedo perder mis puntos?",
        "Can I lose my points?",
        "Puis-je perdre mes points ?",
        "Kann ich meine Punkte verlieren?"
      ),
      a: tr(
        "Los puntos en sí no caducan. Lo que caduca son los cupones generados, a los 18 meses desde su emisión.",
        "Points themselves don't expire. What expires are the generated coupons, 18 months after issuance.",
        "Les points en eux-mêmes n'expirent pas. Ce qui expire, ce sont les coupons générés, 18 mois après leur émission.",
        "Die Punkte selbst verfallen nicht. Was verfällt, sind die generierten Gutscheine, 18 Monate nach ihrer Ausstellung."
      ),
    },
  ];
}

function StorytellersJsonLd({ locale, tr }: { locale: Locale; tr: Tr }) {
  const faq = buildFaq(tr);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: tr(
      "Programa Storytellers Furgocasa | Sube fotos y gana descuentos",
      "Furgocasa Storytellers Programme | Upload photos and earn discounts",
      "Programme Storytellers Furgocasa | Envoyez des photos et gagnez des réductions",
      "Furgocasa Storytellers Programm | Fotos hochladen und Rabatte verdienen"
    ),
    description: tr(
      `Programa de captación de contenido amateur de Furgocasa. Sube tus fotos y vídeos del viaje y gana hasta un ${MAX_DISCOUNT_PCT}% de descuento en próximas reservas.`,
      `Furgocasa amateur content programme. Upload your trip photos and videos and earn up to ${MAX_DISCOUNT_PCT}% off your next bookings.`,
      `Programme Furgocasa de contenu amateur. Envoyez vos photos et vidéos de voyage et obtenez jusqu'à ${MAX_DISCOUNT_PCT} % de réduction sur vos prochaines réservations.`,
      `Furgocasa Programm für Amateur-Inhalte. Lade deine Reisefotos und -videos hoch und erhalte bis zu ${MAX_DISCOUNT_PCT}% Rabatt auf deine nächsten Buchungen.`
    ),
    inLanguage: localeOg[locale],
    url: `https://www.furgocasa.com${localeUrlPath[locale]}`,
    isPartOf: { "@type": "WebSite", name: "FURGOCASA", url: "https://www.furgocasa.com" },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}

/**
 * Bloque "feature" tipo zigzag: imagen a un lado, texto + bullets al
 * otro. Se inserta entre secciones de la landing para reforzar mensajes
 * concretos con apoyo visual real (no es banner pelado decorativo).
 *
 * - reverse=false: imagen a la izquierda, texto a la derecha (default)
 * - reverse=true:  imagen a la derecha, texto a la izquierda
 *
 * En mobile ambos modos colapsan a stack vertical con la imagen arriba.
 */
function LifestyleFeature({
  imageSrc,
  imageAlt,
  eyebrow,
  title,
  body,
  bullets,
  reverse = false,
}: {
  imageSrc: string;
  imageAlt: string;
  eyebrow?: string;
  title: string;
  body: string;
  bullets?: string[];
  reverse?: boolean;
}) {
  return (
    <section className="border-t border-gray-100 bg-white py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div
          className={`mx-auto grid max-w-6xl items-center gap-8 md:gap-12 lg:grid-cols-2 ${
            reverse ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          {/* Imagen */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gray-100 shadow-md md:aspect-[3/2]">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>

          {/* Copy */}
          <div>
            {eyebrow && (
              <p className="text-xs font-bold uppercase tracking-widest text-furgocasa-orange">
                {eyebrow}
              </p>
            )}
            <h3 className="mt-2 font-heading text-2xl font-bold text-gray-900 md:text-3xl">
              {title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-gray-700 md:text-lg">
              {body}
            </p>
            {bullets && bullets.length > 0 && (
              <ul className="mt-5 space-y-2.5 text-gray-700">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-furgocasa-orange" aria-hidden />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function buildShowcaseImages(tr: Tr) {
  return [
    {
      src: "/images/storytellers/showcase-sunset-couple.webp",
      title: tr("Atardecer en pareja", "Sunset for two", "Coucher de soleil à deux", "Sonnenuntergang zu zweit"),
      hint: tr("Selfie de ruta · 4:5", "Road selfie · 4:5", "Selfie de route · 4:5", "Road-Selfie · 4:5"),
      alt: tr(
        "Pareja junto a su camper al atardecer haciéndose una foto con el móvil",
        "Couple next to their camper at sunset taking a photo with their phone",
        "Couple à côté de leur camping-car au coucher du soleil prenant une photo avec leur téléphone",
        "Paar neben ihrem Camper bei Sonnenuntergang macht ein Foto mit dem Handy"
      ),
    },
    {
      src: "/images/storytellers/showcase-interior-cozy.webp",
      title: tr("Rincón de la camper", "Camper corner", "Coin du camping-car", "Camper-Ecke"),
      hint: tr("Detalle interior · 9:16", "Interior detail · 9:16", "Détail intérieur · 9:16", "Innendetail · 9:16"),
      alt: tr(
        "Interior acogedor de camper con café, libro y luz natural por la mañana",
        "Cosy camper interior with coffee, book and natural morning light",
        "Intérieur cosy de camping-car avec café, livre et lumière naturelle du matin",
        "Gemütlicher Camper-Innenraum mit Kaffee, Buch und natürlichem Morgenlicht"
      ),
    },
    {
      src: "/images/storytellers/showcase-breakfast-table.webp",
      title: tr("Desayuno en ruta", "Breakfast on the road", "Petit-déjeuner sur la route", "Frühstück unterwegs"),
      hint: tr("Mesa, café, mapa", "Table, coffee, map", "Table, café, carte", "Tisch, Kaffee, Karte"),
      alt: tr(
        "Desayuno en la mesa plegable de una camper con café y un mapa abierto",
        "Breakfast on the camper's foldable table with coffee and an open map",
        "Petit-déjeuner sur la table pliante d'un camping-car avec café et carte ouverte",
        "Frühstück am Klapptisch eines Campers mit Kaffee und einer aufgeschlagenen Karte"
      ),
    },
    {
      src: "/images/storytellers/showcase-family-fun.webp",
      title: tr("Familia en plena escapada", "Family on a getaway", "Famille en pleine escapade", "Familie auf Kurzurlaub"),
      hint: tr("Documental natural", "Natural documentary", "Documentaire naturel", "Natürliche Doku"),
      alt: tr(
        "Familia con dos hijos jugando junto a su camper aparcada en un camino forestal",
        "Family with two children playing next to their camper parked on a forest path",
        "Famille avec deux enfants jouant à côté de leur camping-car garé sur un chemin forestier",
        "Familie mit zwei Kindern spielt neben ihrem Camper, der auf einem Waldweg geparkt ist"
      ),
    },
    {
      src: "/images/storytellers/showcase-detail-route.webp",
      title: tr("Mirada desde el volante", "View from the wheel", "Vue depuis le volant", "Blick vom Lenkrad"),
      hint: tr("Carretera y paisaje", "Road and landscape", "Route et paysage", "Straße und Landschaft"),
      alt: tr(
        "Vista desde el interior de una camper en marcha por una carretera de campo",
        "View from inside a moving camper on a country road",
        "Vue depuis l'intérieur d'un camping-car en mouvement sur une route de campagne",
        "Blick aus dem Inneren eines fahrenden Campers auf einer Landstraße"
      ),
    },
    {
      src: "/images/storytellers/showcase-pet-travel.webp",
      title: tr("Compañero peludo", "Furry companion", "Compagnon à poils", "Pelziger Begleiter"),
      hint: tr("Mascota viajera", "Travel pet", "Animal voyageur", "Reisetier"),
      alt: tr(
        "Perro asomado a la puerta lateral de una camper aparcada en plena naturaleza",
        "Dog peeking out of the side door of a camper parked in nature",
        "Chien qui passe par la porte latérale d'un camping-car garé en pleine nature",
        "Hund, der aus der Seitentür eines in der Natur geparkten Campers schaut"
      ),
    },
  ];
}

interface StorytellersLandingProps {
  /** Locale en el que se renderiza la landing. Default 'es'. */
  locale?: Locale;
}

export function StorytellersLanding({ locale = "es" }: StorytellersLandingProps) {
  const tr: Tr = (es, en, fr, de) => {
    switch (locale) {
      case "en": return en;
      case "fr": return fr;
      case "de": return de;
      default: return es;
    }
  };
  const faq = buildFaq(tr);
  const showcaseImages = buildShowcaseImages(tr);

  return (
    <div className="min-h-screen bg-gray-50 font-amiko">
      <StorytellersJsonLd locale={locale} tr={tr} />

      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-furgocasa-orange via-amber-500 to-furgocasa-orange-dark py-16 md:py-24">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-orange-100">
                {tr(
                  "Programa Storytellers · Comparte tu viaje, llévate descuento",
                  "Storytellers Programme · Share your trip, get a discount",
                  "Programme Storytellers · Partagez votre voyage, recevez une réduction",
                  "Storytellers Programm · Teile deine Reise, erhalte einen Rabatt"
                )}
              </p>
              <h1 className="font-heading text-4xl font-bold leading-tight text-white md:text-5xl lg:text-[2.75rem] xl:text-5xl">
                {tr(
                  "Comparte tu viaje a cambio de descuentos.",
                  "Share your trip in exchange for discounts.",
                  "Partagez votre voyage en échange de réductions.",
                  "Teile deine Reise gegen Rabatte ein."
                )}
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-orange-50 md:text-xl">
                {tr("Hasta un", "Up to", "Jusqu'à", "Bis zu")}{" "}
                <strong className="font-semibold text-white">
                  {tr(
                    `${MAX_DISCOUNT_PCT}% de descuento`,
                    `${MAX_DISCOUNT_PCT}% off`,
                    `${MAX_DISCOUNT_PCT} % de réduction`,
                    `${MAX_DISCOUNT_PCT}% Rabatt`
                  )}
                </strong>{" "}
                {tr(
                  "en tu próxima reserva, y",
                  "on your next booking, and",
                  "sur votre prochaine réservation, et",
                  "auf deine nächste Buchung, und"
                )}{" "}
                <strong className="font-semibold text-white">
                  {tr(
                    "regalos por tus puntos",
                    "gifts for your points",
                    "des cadeaux pour vos points",
                    "Geschenke für deine Punkte"
                  )}
                </strong>
                .{" "}
                <span className="block mt-2 text-orange-100/95">
                  {tr(
                    "Sin login, sin formularios infinitos, sin compromisos.",
                    "No login, no endless forms, no strings attached.",
                    "Sans compte, sans formulaires interminables, sans engagement.",
                    "Ohne Login, ohne endlose Formulare, ohne Verpflichtungen."
                  )}
                </span>
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="/es/storytellers/subir"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-center font-heading font-bold text-furgocasa-orange-dark shadow-lg transition hover:bg-orange-50"
                >
                  <Upload className="h-5 w-5" aria-hidden />
                  {tr("Subir mi material", "Upload my content", "Envoyer mon contenu", "Material hochladen")}
                </a>
                <a
                  href="/es/storytellers/mis-puntos"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-white/40 bg-white/10 px-8 py-4 text-center font-heading font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  {tr("Ver mis puntos", "Check my points", "Voir mes points", "Meine Punkte ansehen")}
                </a>
              </div>
              <p className="mt-6 max-w-xl text-sm text-orange-100/90">
                {tr("Solo necesitas tu", "You only need your", "Vous n'avez besoin que de votre", "Du brauchst nur deine")}{" "}
                <strong className="text-white">
                  {tr("nº de reserva", "booking number", "numéro de réservation", "Buchungsnummer")}
                </strong>{" "}
                {tr("y el email asociado.", "and the associated email.", "et l'e-mail associé.", "und die zugehörige E-Mail-Adresse.")}
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-lg">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
                <Image
                  src="/images/storytellers/showcase-hero.webp"
                  alt={tr(
                    "Cliente sentada en la puerta lateral de una camper Furgocasa al atardecer haciéndose una foto con el móvil",
                    "Customer sitting in the side door of a Furgocasa camper at sunset taking a photo with her phone",
                    "Cliente assise à la porte latérale d'un camping-car Furgocasa au coucher du soleil prenant une photo avec son téléphone",
                    "Kundin sitzt in der Seitentür eines Furgocasa-Campers bei Sonnenuntergang und macht ein Foto mit dem Handy"
                  )}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 480px"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="font-medium">
                      {tr(
                        "FURGOCASA · alquiler de campers de gran volumen",
                        "FURGOCASA · large-volume campervan rental",
                        "FURGOCASA · location de camping-cars grand volume",
                        "FURGOCASA · Vermietung großvolumiger Campervans"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro SEO natural */}
      <section className="border-b border-gray-100 bg-white py-8">
        <div className="container mx-auto px-4">
          <p className="mx-auto max-w-4xl text-base leading-relaxed text-gray-700 md:text-lg">
            {tr(
              "Si has alquilado una camper con Furgocasa y disfrutas haciendo fotos o vídeos de tus viajes, esta página es para ti. Storytellers es nuestro ",
              "If you've rented a camper with Furgocasa and enjoy taking photos or videos of your trips, this page is for you. Storytellers is our ",
              "Si vous avez loué un camping-car chez Furgocasa et que vous aimez faire des photos ou vidéos de vos voyages, cette page est pour vous. Storytellers est notre ",
              "Wenn du einen Camper bei Furgocasa gemietet hast und gerne Fotos oder Videos von deinen Reisen machst, ist diese Seite für dich. Storytellers ist unser "
            )}
            <strong>
              {tr("programa de fidelización", "loyalty programme", "programme de fidélité", "Treueprogramm")}
            </strong>
            {tr(
              ": en lugar de etiquetarnos en redes y que se pierda entre cientos de stories, súbenos tu material directamente y empieza a ",
              ": instead of tagging us on social media where it gets lost among hundreds of stories, send us your content directly and start to ",
              " : au lieu de nous taguer sur les réseaux sociaux où ça se perd parmi des centaines de stories, envoyez-nous votre contenu directement et commencez à ",
              ": Statt uns in sozialen Netzwerken zu markieren, wo es zwischen Hunderten von Stories verloren geht, sende uns dein Material direkt und beginne, "
            )}
            <strong>
              {tr(
                "desbloquear descuentos en próximas reservas",
                "unlock discounts on future bookings",
                "débloquer des réductions sur vos prochaines réservations",
                "Rabatte für zukünftige Buchungen freizuschalten"
              )}
            </strong>
            {tr(
              ". Sin cuenta, sin trámites, en menos de dos minutos.",
              ". No account, no paperwork, in under two minutes.",
              ". Sans compte, sans démarches, en moins de deux minutes.",
              ". Ohne Konto, ohne Formalitäten, in unter zwei Minuten."
            )}
          </p>
        </div>
      </section>

      {/* TL;DR · Resumen visual de lectura rápida (10 segundos) */}
      <section
        className="border-b border-gray-100 bg-gradient-to-br from-orange-50/60 via-amber-50/40 to-orange-50/60 py-10 md:py-12"
        aria-label={tr(
          "Resumen rápido del programa Storytellers",
          "Quick summary of the Storytellers programme",
          "Résumé rapide du programme Storytellers",
          "Schnelle Zusammenfassung des Storytellers-Programms"
        )}
      >
        <div className="container mx-auto px-4">
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-furgocasa-orange-dark">
            {tr("En 10 segundos", "In 10 seconds", "En 10 secondes", "In 10 Sekunden")}
          </p>
          <ol className="mx-auto mt-6 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "1",
                text: (
                  <>
                    {tr("Sube ", "Upload ", "Envoyez ", "Lade ")}
                    <strong>
                      {tr("3 fotos o 1 vídeo", "3 photos or 1 video", "3 photos ou 1 vidéo", "3 Fotos oder 1 Video")}
                    </strong>
                    {tr("", "", "", " hoch")}
                  </>
                ),
              },
              {
                n: "2",
                text: (
                  <>
                    {tr("Recibes un ", "Get an ", "Recevez un ", "Erhalte einen ")}
                    <strong>
                      {tr(
                        "cupón inicial del 3 %",
                        "initial 3% coupon",
                        "coupon initial de 3 %",
                        "Startgutschein von 3 %"
                      )}
                    </strong>
                  </>
                ),
              },
              {
                n: "3",
                text: (
                  <>
                    {tr(
                      "Sumas puntos hasta el ",
                      "Earn points up to ",
                      "Cumulez des points jusqu'à ",
                      "Sammle Punkte bis zu "
                    )}
                    <strong>{MAX_DISCOUNT_PCT} %</strong>
                  </>
                ),
              },
              {
                n: "4",
                text: (
                  <>
                    {tr("Lo canjeas en tu ", "Redeem it on your ", "Échangez-le lors de votre ", "Löse ihn bei deiner ")}
                    <strong>
                      {tr(
                        "próxima reserva",
                        "next booking",
                        "prochaine réservation",
                        "nächsten Buchung ein"
                      )}
                    </strong>
                  </>
                ),
              },
            ].map((step) => (
              <li
                key={step.n}
                className="flex items-center gap-3 rounded-2xl border border-furgocasa-orange/15 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-furgocasa-orange text-base font-heading font-bold text-white">
                  {step.n}
                </span>
                <span className="text-sm leading-snug text-gray-800 md:text-base">{step.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 2. ¿Cómo funciona? — primer bloque visual, lo primero que entiende el cliente */}
      <section
        className="bg-gray-50 py-16 md:py-20"
        aria-labelledby="como-funciona-storytellers"
      >
        <div className="container mx-auto px-4">
          <h2
            id="como-funciona-storytellers"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            {tr("¿Cómo funciona?", "How does it work?", "Comment ça marche ?", "Wie funktioniert es?")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            {tr(
              "4 pasos sencillos: del primer clic en el portal al ",
              "4 simple steps: from your first click on the portal to your ",
              "4 étapes simples : du premier clic sur le portail au ",
              "4 einfache Schritte: vom ersten Klick im Portal zum "
            )}
            <strong>
              {tr(
                "cupón de descuento",
                "discount coupon",
                "coupon de réduction",
                "Rabattgutschein"
              )}
            </strong>
            {tr(
              " listo para tu próxima reserva.",
              " ready for your next booking.",
              " prêt pour votre prochaine réservation.",
              " bereit für deine nächste Buchung."
            )}
          </p>
          <ol className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "1",
                title: tr("Durante el viaje", "During the trip", "Pendant le voyage", "Während der Reise"),
                body: tr(
                  "Haces fotos o vídeos del vehículo y de tus experiencias dentro y fuera de la camper, como ya hacías.",
                  "You take photos or videos of the vehicle and your experiences inside and outside the camper, just like you already do.",
                  "Vous prenez des photos ou vidéos du véhicule et de vos expériences à l'intérieur et à l'extérieur du camping-car, comme vous le faisiez déjà.",
                  "Du machst Fotos oder Videos vom Fahrzeug und deinen Erlebnissen innerhalb und außerhalb des Campers, so wie du es bereits tust."
                ),
                icon: Camera,
              },
              {
                n: "2",
                title: tr("Sube tu material", "Upload your content", "Envoyez votre contenu", "Lade dein Material hoch"),
                body: tr(
                  "Te identificas con tu nº de reserva + email y arrastras los archivos. Puedes subir según los vas haciendo o al volver. Lote mínimo: 3 fotos o 1 vídeo.",
                  "Identify yourself with your booking number + email and drag the files in. You can upload as you go or when you return. Minimum batch: 3 photos or 1 video.",
                  "Identifiez-vous avec votre numéro de réservation + e-mail et glissez vos fichiers. Vous pouvez envoyer au fur et à mesure ou au retour. Lot minimum : 3 photos ou 1 vidéo.",
                  "Identifiziere dich mit deiner Buchungsnummer + E-Mail und ziehe die Dateien hinein. Du kannst hochladen, während du unterwegs bist, oder bei der Rückkehr. Mindestmenge: 3 Fotos oder 1 Video."
                ),
                icon: Upload,
              },
              {
                n: "3",
                title: tr("Sumas puntos", "Earn points", "Cumulez des points", "Sammle Punkte"),
                body: tr(
                  `Te llevas ${POINTS_PER_PHOTO_UPLOAD} ptos por foto y ${POINTS_PER_VIDEO_UPLOAD} por vídeo al instante. Si seleccionamos alguno para nuestro archivo: +${POINTS_PER_PHOTO_SELECTED} y +${POINTS_PER_VIDEO_SELECTED}.`,
                  `You get ${POINTS_PER_PHOTO_UPLOAD} pts per photo and ${POINTS_PER_VIDEO_UPLOAD} per video instantly. If we select any for our archive: +${POINTS_PER_PHOTO_SELECTED} and +${POINTS_PER_VIDEO_SELECTED}.`,
                  `Vous obtenez ${POINTS_PER_PHOTO_UPLOAD} pts par photo et ${POINTS_PER_VIDEO_UPLOAD} par vidéo instantanément. Si nous en sélectionnons pour notre archive : +${POINTS_PER_PHOTO_SELECTED} et +${POINTS_PER_VIDEO_SELECTED}.`,
                  `Du erhältst sofort ${POINTS_PER_PHOTO_UPLOAD} Pkt pro Foto und ${POINTS_PER_VIDEO_UPLOAD} pro Video. Wenn wir welche für unser Archiv auswählen: +${POINTS_PER_PHOTO_SELECTED} und +${POINTS_PER_VIDEO_SELECTED}.`
                ),
                icon: Sparkles,
              },
              {
                n: "4",
                title: tr("Canjeas tu cupón", "Redeem your coupon", "Échangez votre coupon", "Löse deinen Gutschein ein"),
                body: tr(
                  `Al cruzar un umbral generamos tu cupón automáticamente. Hasta el techo del ${MAX_DISCOUNT_PCT}% en próximas reservas (baja/media temporada, mín. ${COUPON_MIN_RESERVATION_DAYS} días).`,
                  `When you cross a threshold, we generate your coupon automatically. Up to a ${MAX_DISCOUNT_PCT}% cap on future bookings (low/mid-season, min. ${COUPON_MIN_RESERVATION_DAYS} days).`,
                  `En franchissant un palier, nous générons automatiquement votre coupon. Jusqu'à un plafond de ${MAX_DISCOUNT_PCT} % sur les prochaines réservations (basse/moyenne saison, min. ${COUPON_MIN_RESERVATION_DAYS} jours).`,
                  `Beim Überschreiten einer Schwelle erstellen wir deinen Gutschein automatisch. Bis zu einem Höchstwert von ${MAX_DISCOUNT_PCT}% bei zukünftigen Buchungen (Neben-/Zwischensaison, mind. ${COUPON_MIN_RESERVATION_DAYS} Tage).`
                ),
                icon: Gift,
              },
            ].map((s) => (
              <li
                key={s.n}
                className="rounded-3xl border border-gray-100 bg-gray-50 p-8 text-center transition hover:border-furgocasa-orange/30 hover:bg-white hover:shadow-lg"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-furgocasa-orange text-2xl font-heading font-bold text-white">
                  {s.n}
                </div>
                <s.icon className="mx-auto mb-3 h-6 w-6 text-furgocasa-orange" aria-hidden />
                <h3 className="font-heading text-lg font-bold text-gray-900">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Feature 1 · El día 1 ya cuenta — refuerzo de "Cómo funciona" */}
      <LifestyleFeature
        imageSrc="/images/mailing/storytellers/banner-05-salida-clean.jpg"
        imageAlt={tr(
          "Pareja cargando los últimos bártulos en su camper Furgocasa al amanecer en la costa mediterránea",
          "Couple loading the last bits into their Furgocasa camper at dawn on the Mediterranean coast",
          "Couple chargeant les dernières affaires dans leur camping-car Furgocasa à l'aube sur la côte méditerranéenne",
          "Paar lädt die letzten Sachen bei Sonnenaufgang an der Mittelmeerküste in seinen Furgocasa-Camper"
        )}
        eyebrow={tr(
          "Tu primera subida ya tiene premio",
          "Your first upload already has a reward",
          "Votre premier envoi a déjà sa récompense",
          "Dein erster Upload hat bereits eine Belohnung"
        )}
        title={tr(
          "Empieza con la primera foto del viaje",
          "Start with the first photo of the trip",
          "Commencez avec la première photo du voyage",
          "Beginne mit dem ersten Foto der Reise"
        )}
        body={tr(
          "No hace falta esperar al final del viaje para empezar a sumar. Con tu primera subida válida (3 fotos o 1 vídeo) ya entras en el programa y recibes un cupón de bienvenida del 3 % para tu próxima escapada — al instante, sin esperas.",
          "No need to wait until the end of the trip to start earning. With your first valid upload (3 photos or 1 video) you join the programme and get a 3% welcome coupon for your next getaway — instantly, no waiting.",
          "Pas besoin d'attendre la fin du voyage pour commencer à cumuler. Avec votre premier envoi valide (3 photos ou 1 vidéo), vous entrez dans le programme et recevez un coupon de bienvenue de 3 % pour votre prochaine escapade — instantanément, sans attente.",
          "Du musst nicht bis zum Ende der Reise warten, um anzufangen. Mit deinem ersten gültigen Upload (3 Fotos oder 1 Video) trittst du dem Programm bei und erhältst sofort einen Willkommensgutschein von 3 % für deinen nächsten Kurzurlaub — ohne Warten."
        )}
        bullets={[
          tr(
            "Lote mínimo: 3 fotos o 1 vídeo",
            "Minimum batch: 3 photos or 1 video",
            "Lot minimum : 3 photos ou 1 vidéo",
            "Mindestmenge: 3 Fotos oder 1 Video"
          ),
          tr(
            "Cupón del 3 % al instante (una sola vez por email)",
            "3% coupon instantly (once per email)",
            "Coupon de 3 % instantané (une seule fois par e-mail)",
            "3%-Gutschein sofort (einmal pro E-Mail)"
          ),
          tr(
            "Sin login, sin formularios largos",
            "No login, no long forms",
            "Sans compte, sans long formulaire",
            "Ohne Login, ohne lange Formulare"
          ),
        ]}
      />

      {/* 3. ¿Qué es este programa? */}
      <section className="py-16 md:py-20 bg-white" aria-labelledby="que-es-storytellers">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="que-es-storytellers"
              className="font-heading text-3xl font-bold text-gray-900 md:text-4xl"
            >
              {tr("¿Qué es este programa?", "What is this programme?", "C'est quoi ce programme ?", "Was ist dieses Programm?")}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {tr(
                "Un programa para ",
                "A programme for ",
                "Un programme pour les ",
                "Ein Programm für "
              )}
              <strong>
                {tr(
                  "viajeros Furgocasa",
                  "Furgocasa travellers",
                  "voyageurs Furgocasa",
                  "Furgocasa-Reisende"
                )}
              </strong>
              {tr(
                " que quieran compartir las fotos y vídeos que ya hacen durante el viaje. A cambio: ",
                " who want to share the photos and videos they already take during their trip. In exchange: ",
                " qui souhaitent partager les photos et vidéos qu'ils font déjà pendant le voyage. En échange : ",
                ", die die Fotos und Videos teilen möchten, die sie ohnehin während der Reise machen. Im Gegenzug: "
              )}
              <strong>
                {tr(
                  "descuentos reales en futuras reservas y regalos por tus puntos",
                  "real discounts on future bookings and gifts for your points",
                  "des réductions réelles sur vos futures réservations et des cadeaux pour vos points",
                  "echte Rabatte auf zukünftige Buchungen und Geschenke für deine Punkte"
                )}
              </strong>
              .
            </p>
          </div>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {[
              tr(
                "Funciona sin login: solo nº de reserva + email asociado",
                "Works without login: just booking number + associated email",
                "Fonctionne sans compte : juste numéro de réservation + e-mail associé",
                "Funktioniert ohne Login: nur Buchungsnummer + zugehörige E-Mail"
              ),
              tr(
                "Sumas puntos al subir y más puntos si seleccionamos tu material",
                "Earn points on upload and extra points if we select your material",
                "Gagnez des points en envoyant et plus de points si nous sélectionnons votre contenu",
                "Sammle Punkte beim Hochladen und Extra-Punkte, wenn wir dein Material auswählen"
              ),
              tr(
                `Cupones automáticos del 3% al ${MAX_DISCOUNT_PCT}% según puntos acumulados`,
                `Automatic coupons from 3% to ${MAX_DISCOUNT_PCT}% based on accumulated points`,
                `Coupons automatiques de 3 % à ${MAX_DISCOUNT_PCT} % selon les points cumulés`,
                `Automatische Gutscheine von 3% bis ${MAX_DISCOUNT_PCT}% je nach gesammelten Punkten`
              ),
              tr(
                `Cupones válidos en próximas reservas, hasta ${COUPON_VALIDITY_MONTHS} meses`,
                `Coupons valid on future bookings for up to ${COUPON_VALIDITY_MONTHS} months`,
                `Coupons valables sur les prochaines réservations, jusqu'à ${COUPON_VALIDITY_MONTHS} mois`,
                `Gutscheine gültig für zukünftige Buchungen, bis zu ${COUPON_VALIDITY_MONTHS} Monaten`
              ),
              tr(
                "Subir ya suma puntos — y si tu material entra en archivo, multiplica hasta ×10",
                "Uploading already adds points — and if your material is selected, it multiplies up to ×10",
                "Envoyer ajoute déjà des points — et si votre contenu est sélectionné, ça multiplie jusqu'à ×10",
                "Hochladen sammelt bereits Punkte — und wenn dein Material ausgewählt wird, multipliziert sich das bis zu ×10"
              ),
              tr(
                "Sin spam, sin newsletters, sin obligación de etiquetarnos",
                "No spam, no newsletters, no obligation to tag us",
                "Sans spam, sans newsletters, sans obligation de nous taguer",
                "Kein Spam, kein Newsletter, keine Pflicht, uns zu markieren"
              ),
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-gray-800"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-furgocasa-orange" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Qué ofrecemos */}
      <section
        className="border-t border-gray-100 bg-gray-50 py-16 md:py-20"
        aria-labelledby="que-ofrecemos-storytellers"
      >
        <div className="container mx-auto px-4">
          <h2
            id="que-ofrecemos-storytellers"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            {tr("Lo que te llevas tú", "What you get", "Ce que vous gagnez", "Was du erhältst")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            {tr(
              "Lo que ganas por participar, sin letra pequeña escondida.",
              "What you earn for taking part, no hidden small print.",
              "Ce que vous gagnez en participant, sans petits caractères cachés.",
              "Was du für deine Teilnahme bekommst, ohne versteckte Bedingungen."
            )}
          </p>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
            {[
              {
                title: tr(
                  "Descuentos reales en próximas reservas",
                  "Real discounts on future bookings",
                  "Des réductions réelles sur vos prochaines réservations",
                  "Echte Rabatte auf zukünftige Buchungen"
                ),
                body: tr(
                  `Cupones del 3% al ${MAX_DISCOUNT_PCT}% que se aplican directamente al precio. No son “puntos canjeables por merchandising”: son menos euros a pagar en tu siguiente alquiler.`,
                  `Coupons from 3% to ${MAX_DISCOUNT_PCT}% applied directly to the price. They're not "points redeemable for merchandise": they're fewer euros to pay on your next rental.`,
                  `Des coupons de 3 % à ${MAX_DISCOUNT_PCT} % appliqués directement au prix. Ce ne sont pas des « points échangeables contre du merchandising » : ce sont des euros en moins à payer sur votre prochaine location.`,
                  `Gutscheine von 3% bis ${MAX_DISCOUNT_PCT}%, die direkt auf den Preis angewendet werden. Es sind keine „Punkte zum Eintausch gegen Merchandise": Es sind weniger Euro, die du bei deiner nächsten Miete zahlst.`
                ),
              },
              {
                title: tr(
                  "Cero fricción para empezar",
                  "Zero friction to get started",
                  "Aucune friction pour commencer",
                  "Null Aufwand zum Starten"
                ),
                body: tr(
                  "Sin crear cuenta, sin contraseñas que recordar, sin enlazar Instagram. Llegas, te identificas con tu reserva, arrastras los archivos y listo.",
                  "No account creation, no passwords to remember, no Instagram linking. You arrive, identify yourself with your booking, drag the files in and done.",
                  "Sans créer de compte, sans mots de passe à retenir, sans lier Instagram. Vous arrivez, vous vous identifiez avec votre réservation, vous glissez les fichiers et c'est fait.",
                  "Keine Kontoerstellung, keine Passwörter, kein Verknüpfen mit Instagram. Du kommst an, identifizierst dich mit deiner Buchung, ziehst die Dateien hinein und fertig."
                ),
              },
              {
                title: tr(
                  "Y si son buenas, mucho mejor",
                  "And if they're good, even better",
                  "Et si elles sont bonnes, encore mieux",
                  "Und wenn sie gut sind, noch besser"
                ),
                body: tr(
                  `Subir ya suma (${POINTS_PER_PHOTO_UPLOAD} ptos por foto, ${POINTS_PER_VIDEO_UPLOAD} por vídeo). Pero lo que de verdad dispara los puntos es que tu material entre en nuestro archivo: +${POINTS_PER_PHOTO_SELECTED} ptos por foto seleccionada y +${POINTS_PER_VIDEO_SELECTED} por vídeo. Tómate tu tiempo: el esfuerzo se recompensa hasta 10 veces más.`,
                  `Uploading already counts (${POINTS_PER_PHOTO_UPLOAD} pts per photo, ${POINTS_PER_VIDEO_UPLOAD} per video). But what really boosts your points is your material being added to our archive: +${POINTS_PER_PHOTO_SELECTED} pts per selected photo and +${POINTS_PER_VIDEO_SELECTED} per video. Take your time: effort is rewarded up to 10 times more.`,
                  `Envoyer rapporte déjà (${POINTS_PER_PHOTO_UPLOAD} pts par photo, ${POINTS_PER_VIDEO_UPLOAD} par vidéo). Mais ce qui fait vraiment décoller les points, c'est que votre contenu entre dans notre archive : +${POINTS_PER_PHOTO_SELECTED} pts par photo sélectionnée et +${POINTS_PER_VIDEO_SELECTED} par vidéo. Prenez votre temps : l'effort est récompensé jusqu'à 10 fois plus.`,
                  `Hochladen zählt schon (${POINTS_PER_PHOTO_UPLOAD} Pkt pro Foto, ${POINTS_PER_VIDEO_UPLOAD} pro Video). Aber was die Punkte wirklich nach oben treibt, ist, dass dein Material in unser Archiv aufgenommen wird: +${POINTS_PER_PHOTO_SELECTED} Pkt pro ausgewähltem Foto und +${POINTS_PER_VIDEO_SELECTED} pro Video. Nimm dir Zeit: Mühe wird bis zu 10-mal mehr belohnt.`
                ),
              },
              {
                title: tr(
                  "Tu material, en buenas manos",
                  "Your material, in safe hands",
                  "Votre contenu, en bonnes mains",
                  "Dein Material, in sicheren Händen"
                ),
                body: tr(
                  "El bucket donde guardamos tus archivos es privado. Solo el equipo accede, vía URLs firmadas que caducan en una hora. Nada queda público sin que lo decidamos.",
                  "The bucket where we store your files is private. Only the team accesses it, via signed URLs that expire in one hour. Nothing becomes public without our decision.",
                  "Le bucket où nous stockons vos fichiers est privé. Seule l'équipe y accède, via des URLs signées qui expirent en une heure. Rien n'est public sans notre décision.",
                  "Der Bucket, in dem wir deine Dateien speichern, ist privat. Nur das Team hat Zugriff, über signierte URLs, die nach einer Stunde ablaufen. Nichts wird öffentlich, ohne dass wir es entscheiden."
                ),
              },
              {
                title: tr(
                  "Cesión clara y honesta",
                  "Clear and honest licensing",
                  "Cession claire et honnête",
                  "Klare und ehrliche Nutzungsrechte"
                ),
                body: tr(
                  "Te explicamos al pie del subidor qué autorizas: cesión no exclusiva para uso comercial. Sin sorpresas, y conservas tu material para uso propio.",
                  "We explain at the foot of the uploader what you authorise: non-exclusive licence for commercial use. No surprises, and you keep your material for your own use.",
                  "Nous vous expliquons au pied de l'envoi ce que vous autorisez : cession non exclusive pour usage commercial. Sans surprises, et vous conservez votre contenu pour votre propre usage.",
                  "Wir erklären dir am Fuß des Uploaders, was du genehmigst: nicht-exklusive Lizenz für kommerzielle Nutzung. Keine Überraschungen, und du behältst dein Material für deinen eigenen Gebrauch."
                ),
              },
              {
                title: tr(
                  `Regalos por encima del ${MAX_DISCOUNT_PCT}%`,
                  `Gifts above the ${MAX_DISCOUNT_PCT}% cap`,
                  `Cadeaux au-dessus de ${MAX_DISCOUNT_PCT} %`,
                  `Geschenke über dem ${MAX_DISCOUNT_PCT}% hinaus`
                ),
                body: tr(
                  "Cuando llegas al techo del descuento, tus puntos siguen sumando para canjearlos por merchandising oficial Furgocasa: taza, camiseta y sudadera de edición Storytellers.",
                  "When you reach the discount cap, your points keep adding up to redeem for official Furgocasa merchandise: mug, t-shirt and hoodie from the Storytellers edition.",
                  "Quand vous atteignez le plafond de réduction, vos points continuent de s'accumuler pour être échangés contre du merchandising officiel Furgocasa : tasse, t-shirt et sweat à capuche de l'édition Storytellers.",
                  "Wenn du die Rabattgrenze erreichst, sammeln sich deine Punkte weiter, um sie gegen offizielles Furgocasa-Merchandise einzutauschen: Tasse, T-Shirt und Hoodie aus der Storytellers-Edition."
                ),
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition hover:shadow-md"
              >
                <h3 className="font-heading text-xl font-bold text-gray-900">{card.title}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature 2 · Vida real en ruta — refuerzo de "Lo que te llevas" + transición a "puntos" */}
      <LifestyleFeature
        reverse
        imageSrc="/images/mailing/storytellers/banner-06-teckel-clean.jpg"
        imageAlt={tr(
          "Perro asomado por la ventana lateral de una camper Furgocasa en marcha por una carretera de sierra",
          "Dog peeking out of the side window of a moving Furgocasa camper on a mountain road",
          "Chien à la fenêtre latérale d'un camping-car Furgocasa en mouvement sur une route de montagne",
          "Hund schaut aus dem Seitenfenster eines fahrenden Furgocasa-Campers auf einer Bergstraße"
        )}
        eyebrow={tr("Verdad de viaje", "Travel honesty", "Vérité de voyage", "Reise-Ehrlichkeit")}
        title={tr(
          "Lo que ya estás haciendo, vale puntos",
          "What you're already doing earns points",
          "Ce que vous faites déjà rapporte des points",
          "Was du bereits tust, bringt Punkte"
        )}
        body={tr(
          "No buscamos perfección de revista. Buscamos verdad: paisajes, mascotas, gente disfrutando, rincones que cuentan algo. Si ya estás haciendo fotos y vídeos del viaje, lo único que tienes que hacer es enviárnoslos.",
          "We're not looking for magazine perfection. We're looking for honesty: landscapes, pets, people enjoying themselves, corners that tell a story. If you're already taking photos and videos of your trip, all you have to do is send them to us.",
          "Nous ne cherchons pas la perfection de magazine. Nous cherchons l'honnêteté : paysages, animaux, gens qui s'amusent, coins qui racontent une histoire. Si vous prenez déjà des photos et vidéos de votre voyage, il vous suffit de nous les envoyer.",
          "Wir suchen keine Magazin-Perfektion. Wir suchen Wahrheit: Landschaften, Haustiere, Menschen, die Spaß haben, Ecken, die etwas erzählen. Wenn du bereits Fotos und Videos von deiner Reise machst, musst du sie uns nur schicken."
        )}
        bullets={[
          tr(
            `+${POINTS_PER_PHOTO_UPLOAD} ptos por foto subida · +${POINTS_PER_VIDEO_UPLOAD} ptos por vídeo (≥10 s)`,
            `+${POINTS_PER_PHOTO_UPLOAD} pts per uploaded photo · +${POINTS_PER_VIDEO_UPLOAD} pts per video (≥10 s)`,
            `+${POINTS_PER_PHOTO_UPLOAD} pts par photo envoyée · +${POINTS_PER_VIDEO_UPLOAD} pts par vidéo (≥10 s)`,
            `+${POINTS_PER_PHOTO_UPLOAD} Pkt pro hochgeladenem Foto · +${POINTS_PER_VIDEO_UPLOAD} Pkt pro Video (≥10 s)`
          ),
          tr(
            `+${POINTS_PER_PHOTO_SELECTED} ptos por foto seleccionada (×10) · +${POINTS_PER_VIDEO_SELECTED} ptos por vídeo (×12)`,
            `+${POINTS_PER_PHOTO_SELECTED} pts per selected photo (×10) · +${POINTS_PER_VIDEO_SELECTED} pts per video (×12)`,
            `+${POINTS_PER_PHOTO_SELECTED} pts par photo sélectionnée (×10) · +${POINTS_PER_VIDEO_SELECTED} pts par vidéo (×12)`,
            `+${POINTS_PER_PHOTO_SELECTED} Pkt pro ausgewähltem Foto (×10) · +${POINTS_PER_VIDEO_SELECTED} Pkt pro Video (×12)`
          ),
          tr(
            "Mejor pocas fotos buenas que muchas de relleno",
            "Better a few good photos than many filler ones",
            "Mieux vaut quelques bonnes photos que beaucoup de remplissage",
            "Lieber ein paar gute Fotos als viele Füller"
          ),
        ]}
      />

      {/* 4. Cómo se ganan los puntos */}
      <section
        className="border-t border-gray-100 bg-white py-16 md:py-20"
        aria-labelledby="puntos-ganar"
      >
        <div className="container mx-auto px-4">
          <h2
            id="puntos-ganar"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            {tr("Cómo se ganan los puntos", "How points are earned", "Comment gagner des points", "Wie man Punkte verdient")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            {tr(
              "Cuatro vías. Subir ya suma — pero ",
              "Four ways. Uploading already counts — but ",
              "Quatre voies. Envoyer rapporte déjà — mais ",
              "Vier Wege. Hochladen zählt bereits — aber "
            )}
            <strong className="text-gray-900">
              {tr(
                "lo que de verdad multiplica los puntos es que tu material entre en nuestro archivo",
                "what really multiplies the points is your material being added to our archive",
                "ce qui multiplie vraiment les points, c'est que votre contenu entre dans notre archive",
                "was die Punkte wirklich vervielfacht, ist, dass dein Material in unser Archiv aufgenommen wird"
              )}
            </strong>
            {tr(
              ". Mejor pocas fotos buenas que muchas de relleno.",
              ". Better a few good photos than many filler ones.",
              ". Mieux vaut quelques bonnes photos que beaucoup de remplissage.",
              ". Lieber ein paar gute Fotos als viele Füller."
            )}
          </p>
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
            {[
              {
                icon: ImageIcon,
                label: tr("Subir 1 foto", "Upload 1 photo", "Envoyer 1 photo", "1 Foto hochladen"),
                points: tr(
                  `+${POINTS_PER_PHOTO_UPLOAD} pto/foto`,
                  `+${POINTS_PER_PHOTO_UPLOAD} pt/photo`,
                  `+${POINTS_PER_PHOTO_UPLOAD} pt/photo`,
                  `+${POINTS_PER_PHOTO_UPLOAD} Pkt/Foto`
                ),
                hint: tr(
                  "Lote mínimo: 3 fotos",
                  "Minimum batch: 3 photos",
                  "Lot minimum : 3 photos",
                  "Mindestmenge: 3 Fotos"
                ),
              },
              {
                icon: Video,
                label: tr(
                  "Subir 1 vídeo (≥10s)",
                  "Upload 1 video (≥10s)",
                  "Envoyer 1 vidéo (≥10s)",
                  "1 Video hochladen (≥10s)"
                ),
                points: tr(
                  `+${POINTS_PER_VIDEO_UPLOAD} pto/vídeo`,
                  `+${POINTS_PER_VIDEO_UPLOAD} pt/video`,
                  `+${POINTS_PER_VIDEO_UPLOAD} pt/vidéo`,
                  `+${POINTS_PER_VIDEO_UPLOAD} Pkt/Video`
                ),
                hint: tr(
                  "Hasta 500 MB / vídeo",
                  "Up to 500 MB / video",
                  "Jusqu'à 500 Mo / vidéo",
                  "Bis zu 500 MB / Video"
                ),
              },
              {
                icon: Camera,
                label: tr(
                  "Foto seleccionada para archivo",
                  "Photo selected for archive",
                  "Photo sélectionnée pour archive",
                  "Foto für Archiv ausgewählt"
                ),
                points: tr(
                  `+${POINTS_PER_PHOTO_SELECTED} ptos`,
                  `+${POINTS_PER_PHOTO_SELECTED} pts`,
                  `+${POINTS_PER_PHOTO_SELECTED} pts`,
                  `+${POINTS_PER_PHOTO_SELECTED} Pkt`
                ),
                hint: tr(
                  "Decisión del equipo",
                  "Team decision",
                  "Décision de l'équipe",
                  "Team-Entscheidung"
                ),
              },
              {
                icon: Trophy,
                label: tr(
                  "Vídeo seleccionado para archivo",
                  "Video selected for archive",
                  "Vidéo sélectionnée pour archive",
                  "Video für Archiv ausgewählt"
                ),
                points: tr(
                  `+${POINTS_PER_VIDEO_SELECTED} ptos`,
                  `+${POINTS_PER_VIDEO_SELECTED} pts`,
                  `+${POINTS_PER_VIDEO_SELECTED} pts`,
                  `+${POINTS_PER_VIDEO_SELECTED} Pkt`
                ),
                hint: tr(
                  "Decisión del equipo",
                  "Team decision",
                  "Décision de l'équipe",
                  "Team-Entscheidung"
                ),
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 transition hover:border-furgocasa-orange/30 hover:bg-white hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-furgocasa-orange/10 text-furgocasa-orange">
                  <row.icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="flex-1">
                  <p className="font-heading font-semibold text-gray-900">{row.label}</p>
                  <p className="mt-1 text-sm text-gray-500">{row.hint}</p>
                </div>
                <span className="rounded-full bg-furgocasa-orange px-3 py-1 text-sm font-bold text-white whitespace-nowrap">
                  {row.points}
                </span>
              </div>
            ))}
          </div>

          {/* Callout: la selección multiplica los puntos */}
          <div className="mx-auto mt-10 max-w-4xl rounded-2xl border-2 border-furgocasa-orange/30 bg-gradient-to-r from-orange-50 to-amber-50 p-6 md:p-7 text-center">
            <p className="font-heading text-xl font-bold text-gray-900 md:text-2xl">
              {tr("Y si son buenas… mucho mejor.", "And if they're good… even better.", "Et si elles sont bonnes… encore mieux.", "Und wenn sie gut sind… noch besser.")}
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-gray-700 leading-relaxed">
              {tr(
                `Una foto subida vale ${POINTS_PER_PHOTO_UPLOAD} ptos. Una foto seleccionada para archivo vale `,
                `An uploaded photo is worth ${POINTS_PER_PHOTO_UPLOAD} pts. A photo selected for the archive is worth `,
                `Une photo envoyée vaut ${POINTS_PER_PHOTO_UPLOAD} pts. Une photo sélectionnée pour l'archive vaut `,
                `Ein hochgeladenes Foto ist ${POINTS_PER_PHOTO_UPLOAD} Pkt wert. Ein für das Archiv ausgewähltes Foto ist `
              )}
              <strong className="text-furgocasa-orange">+{POINTS_PER_PHOTO_SELECTED} {tr("ptos", "pts", "pts", "Pkt")} · ×10</strong>
              {tr(
                `. Un vídeo subido vale ${POINTS_PER_VIDEO_UPLOAD} ptos; uno seleccionado, `,
                `. An uploaded video is worth ${POINTS_PER_VIDEO_UPLOAD} pts; a selected one, `,
                `. Une vidéo envoyée vaut ${POINTS_PER_VIDEO_UPLOAD} pts ; une sélectionnée, `,
                `. Ein hochgeladenes Video ist ${POINTS_PER_VIDEO_UPLOAD} Pkt wert; ein ausgewähltes, `
              )}
              <strong className="text-furgocasa-orange">+{POINTS_PER_VIDEO_SELECTED} {tr("ptos", "pts", "pts", "Pkt")} · ×12</strong>.{" "}
              <strong className="text-gray-900">
                {tr(
                  "Tómate tu tiempo: el esfuerzo se recompensa.",
                  "Take your time: effort is rewarded.",
                  "Prenez votre temps : l'effort est récompensé.",
                  "Nimm dir Zeit: Mühe wird belohnt."
                )}
              </strong>
            </p>
          </div>
        </div>
      </section>

      {/* 5. Cómo se canjean los puntos */}
      <section
        className="border-t border-gray-100 bg-gray-50 py-16 md:py-20"
        aria-labelledby="puntos-canjear"
      >
        <div className="container mx-auto px-4">
          <h2
            id="puntos-canjear"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            {tr(
              "Cómo se canjean los puntos",
              "How points are redeemed",
              "Comment échanger les points",
              "Wie Punkte eingelöst werden"
            )}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            {tr(
              "Al cruzar cada umbral generamos un cupón con tu % desbloqueado. Solo se mantiene activo el de mayor %: si subes a un tramo superior, el anterior queda anulado y se sustituye por el nuevo.",
              "When you cross each threshold we generate a coupon with your unlocked %. Only the highest % remains active: if you move up a tier, the previous one is voided and replaced by the new one.",
              "À chaque palier franchi, nous générons un coupon avec votre % débloqué. Seul celui du % le plus élevé reste actif : si vous montez à un palier supérieur, le précédent est annulé et remplacé par le nouveau.",
              "Beim Überschreiten jeder Schwelle erstellen wir einen Gutschein mit deinem freigeschalteten %. Nur der mit dem höchsten % bleibt aktiv: Wenn du in eine höhere Stufe aufsteigst, wird der vorherige storniert und durch den neuen ersetzt."
            )}
          </p>
          <div className="mx-auto mt-12 max-w-3xl">
            {/* Tabla en escritorio */}
            <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-furgocasa-orange text-white">
                  <tr>
                    <th className="px-6 py-4 font-heading">
                      {tr(
                        "Cuándo se desbloquea",
                        "When it unlocks",
                        "Quand cela se débloque",
                        "Wann es freigeschaltet wird"
                      )}
                    </th>
                    <th className="px-6 py-4 font-heading">
                      {tr(
                        "% descuento próxima reserva",
                        "% off next booking",
                        "% de réduction prochaine réservation",
                        "% Rabatt nächste Buchung"
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-orange-50/60">
                    <td className="px-6 py-4 text-gray-800">
                      <span className="block font-bold">
                        {tr(
                          "Tu primera subida válida",
                          "Your first valid upload",
                          "Votre premier envoi valide",
                          "Dein erster gültiger Upload"
                        )}
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {tr(
                          "cupón de bienvenida · una sola vez",
                          "welcome coupon · once only",
                          "coupon de bienvenue · une seule fois",
                          "Willkommensgutschein · nur einmal"
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-furgocasa-orange">3%</td>
                  </tr>
                  {DISCOUNT_TIERS.map((tier, i) => (
                    <tr key={tier.threshold} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {tr(
                          `Al alcanzar ${tier.threshold} ptos`,
                          `When reaching ${tier.threshold} pts`,
                          `En atteignant ${tier.threshold} pts`,
                          `Beim Erreichen von ${tier.threshold} Pkt`
                        )}
                      </td>
                      <td
                        className={`px-6 py-4 font-bold ${
                          tier.pct === MAX_DISCOUNT_PCT ? "text-furgocasa-orange-dark" : "text-furgocasa-orange"
                        }`}
                      >
                        {tier.pct}%{tier.pct === MAX_DISCOUNT_PCT ? tr(" — TECHO", " — CAP", " — PLAFOND", " — MAX") : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Tarjetas en móvil */}
            <div className="grid gap-3 md:hidden">
              <div className="rounded-2xl border-2 border-furgocasa-orange/30 bg-orange-50/60 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-800">
                    {tr(
                      "Tu primera subida válida",
                      "Your first valid upload",
                      "Votre premier envoi valide",
                      "Dein erster gültiger Upload"
                    )}
                  </span>
                  <span className="rounded-full bg-furgocasa-orange/10 px-3 py-1 text-sm font-bold text-furgocasa-orange">
                    3%
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {tr(
                    "Cupón de bienvenida · una sola vez",
                    "Welcome coupon · once only",
                    "Coupon de bienvenue · une seule fois",
                    "Willkommensgutschein · nur einmal"
                  )}
                </p>
              </div>
              {DISCOUNT_TIERS.map((tier) => (
                <div
                  key={tier.threshold}
                  className={`rounded-2xl border p-4 shadow-sm ${
                    tier.pct === MAX_DISCOUNT_PCT
                      ? "border-furgocasa-orange-dark/30 bg-orange-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">
                      {tr(
                        `Al alcanzar ${tier.threshold} ptos`,
                        `When reaching ${tier.threshold} pts`,
                        `En atteignant ${tier.threshold} pts`,
                        `Beim Erreichen von ${tier.threshold} Pkt`
                      )}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        tier.pct === MAX_DISCOUNT_PCT
                          ? "bg-furgocasa-orange-dark text-white"
                          : "bg-furgocasa-orange/10 text-furgocasa-orange"
                      }`}
                    >
                      {tier.pct}%{tier.pct === MAX_DISCOUNT_PCT ? tr(" · techo", " · cap", " · plafond", " · max") : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
              <p>
                <strong className="font-bold">
                  {tr(
                    "Importante — cómo funciona el 3% de bienvenida:",
                    "Important — how the 3% welcome coupon works:",
                    "Important — comment fonctionne le coupon de bienvenue de 3 % :",
                    "Wichtig — wie der 3% Willkommensgutschein funktioniert:"
                  )}
                </strong>{" "}
                {tr(
                  "el cupón del 3% se genera ",
                  "the 3% coupon is generated ",
                  "le coupon de 3 % est généré ",
                  "der 3%-Gutschein wird "
                )}
                <strong>
                  {tr(
                    "solo en tu primera subida válida",
                    "only on your first valid upload",
                    "uniquement lors de votre premier envoi valide",
                    "nur bei deinem ersten gültigen Upload"
                  )}
                </strong>
                {tr(
                  " y solo una vez por email. Si más adelante haces más subidas, sumas puntos al ledger pero ",
                  " and only once per email. If you upload more later, you add points to your ledger but ",
                  " et une seule fois par e-mail. Si vous envoyez plus tard, vous ajoutez des points au solde mais ",
                  " und nur einmal pro E-Mail erstellt. Wenn du später weitere Uploads machst, summierst du Punkte, aber "
                )}
                <strong>
                  {tr(
                    "no se generan cupones nuevos",
                    "no new coupons are generated",
                    "aucun nouveau coupon n'est généré",
                    "es werden keine neuen Gutscheine generiert"
                  )}
                </strong>
                {tr(
                  " hasta que cruzas los 40 puntos (5%). En ese momento, el 3% queda anulado y lo sustituye el nuevo cupón del 5%, y así sucesivamente con cada tramo.",
                  " until you cross 40 points (5%). At that moment, the 3% is voided and replaced by the new 5% coupon, and so on with each tier.",
                  " jusqu'à ce que vous franchissiez les 40 points (5 %). À ce moment-là, le 3 % est annulé et remplacé par le nouveau coupon de 5 %, et ainsi de suite avec chaque palier.",
                  ", bis du 40 Punkte (5%) erreichst. In diesem Moment wird der 3%-Gutschein storniert und durch den neuen 5%-Gutschein ersetzt, und so weiter mit jeder Stufe."
                )}
              </p>
            </div>

            {/* Ejemplos prácticos: cuánto necesito subir para cada descuento */}
            <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
              <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-gray-500">
                {tr(
                  "Ejemplos prácticos · ¿qué necesito subir?",
                  "Practical examples · what do I need to upload?",
                  "Exemples pratiques · que dois-je envoyer ?",
                  "Praktische Beispiele · was muss ich hochladen?"
                )}
              </p>
              <p className="mx-auto mt-2 max-w-xl text-center text-sm text-gray-600">
                {tr(
                  "Para que veas que ",
                  "Just so you see that ",
                  "Pour vous montrer que ",
                  "Damit du siehst, dass "
                )}
                <strong>
                  {tr(
                    "800 ptos no es imposible",
                    "800 pts isn't impossible",
                    "800 pts n'est pas impossible",
                    "800 Pkt nicht unmöglich sind"
                  )}
                </strong>
                {tr(
                  `: subir 1 foto = ${POINTS_PER_PHOTO_UPLOAD} ptos · seleccionada = +${POINTS_PER_PHOTO_SELECTED} ptos. Cualquier vídeo seleccionado son +${POINTS_PER_VIDEO_SELECTED} ptos.`,
                  `: uploading 1 photo = ${POINTS_PER_PHOTO_UPLOAD} pts · selected = +${POINTS_PER_PHOTO_SELECTED} pts. Any selected video is +${POINTS_PER_VIDEO_SELECTED} pts.`,
                  ` : envoyer 1 photo = ${POINTS_PER_PHOTO_UPLOAD} pts · sélectionnée = +${POINTS_PER_PHOTO_SELECTED} pts. Toute vidéo sélectionnée fait +${POINTS_PER_VIDEO_SELECTED} pts.`,
                  `: 1 Foto hochladen = ${POINTS_PER_PHOTO_UPLOAD} Pkt · ausgewählt = +${POINTS_PER_PHOTO_SELECTED} Pkt. Jedes ausgewählte Video bringt +${POINTS_PER_VIDEO_SELECTED} Pkt.`
                )}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-furgocasa-orange/20 bg-orange-50/40 p-5 text-center">
                  <span className="inline-block rounded-full bg-furgocasa-orange/15 px-3 py-1 text-sm font-bold text-furgocasa-orange-dark">
                    5%
                  </span>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">
                    {tr("Sube ", "Upload ", "Envoyez ", "Lade ")}
                    <strong>
                      {tr("20 fotos", "20 photos", "20 photos", "20 Fotos")}
                    </strong>
                    {tr(" de un viaje, ", " from one trip, ", " d'un voyage, ", " einer Reise hoch, ")}
                    <em>{tr("o", "or", "ou", "oder")}</em>
                    {tr(" consigue ", " get ", " obtenez ", " erreiche ")}
                    <strong>
                      {tr(
                        "2 fotos seleccionadas",
                        "2 selected photos",
                        "2 photos sélectionnées",
                        "2 ausgewählte Fotos"
                      )}
                    </strong>
                    {tr(
                      " para nuestro archivo.",
                      " for our archive.",
                      " pour notre archive.",
                      " für unser Archiv."
                    )}
                  </p>
                </div>
                <div className="rounded-2xl border border-furgocasa-orange/30 bg-orange-50/60 p-5 text-center">
                  <span className="inline-block rounded-full bg-furgocasa-orange/20 px-3 py-1 text-sm font-bold text-furgocasa-orange-dark">
                    10%
                  </span>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">
                    {tr("Un buen lote de fotos de un viaje + algún ", "A good batch of photos from one trip + some ", "Un bon lot de photos d'un voyage + quelques ", "Eine gute Menge Fotos von einer Reise + einige ")}
                    <strong>
                      {tr(
                        "vídeo seleccionado",
                        "selected videos",
                        "vidéos sélectionnées",
                        "ausgewählte Videos"
                      )}
                    </strong>
                    {tr(
                      ". Aprox. 100 ptos por viaje recurrente.",
                      ". Approx. 100 pts per recurring trip.",
                      ". Environ 100 pts par voyage récurrent.",
                      ". Ca. 100 Pkt pro wiederkehrender Reise."
                    )}
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-furgocasa-orange-dark/30 bg-gradient-to-br from-orange-50 to-amber-50 p-5 text-center shadow-sm">
                  <span className="inline-block rounded-full bg-furgocasa-orange-dark px-3 py-1 text-sm font-bold text-white">
                    {tr("15% · TECHO", "15% · CAP", "15 % · PLAFOND", "15% · MAX")}
                  </span>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">
                    {tr("Contenido ", "Content ", "Contenu ", "Inhalte ")}
                    <strong>
                      {tr(
                        "de varios viajes",
                        "from several trips",
                        "de plusieurs voyages",
                        "aus mehreren Reisen"
                      )}
                    </strong>
                    {tr(
                      " o material especialmente útil que entre en archivo. Storytellers recurrentes.",
                      " or particularly useful material that gets archived. Recurring Storytellers.",
                      " ou contenu particulièrement utile qui entre dans l'archive. Storytellers récurrents.",
                      " oder besonders nützliches Material, das ins Archiv kommt. Wiederkehrende Storytellers."
                    )}
                  </p>
                </div>
              </div>
              <p className="mx-auto mt-6 max-w-xl text-center text-xs text-gray-500">
                {tr(
                  "Las cifras son orientativas — la combinación real depende del mix de fotos, vídeos y selección por parte del equipo.",
                  "Figures are indicative — the actual combination depends on the mix of photos, videos and team selection.",
                  "Les chiffres sont indicatifs — la combinaison réelle dépend du mix de photos, vidéos et de la sélection de l'équipe.",
                  "Die Zahlen sind Richtwerte — die tatsächliche Kombination hängt vom Mix aus Fotos, Videos und Teamauswahl ab."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Cuándo y cómo se canjean los cupones (callout) */}
      <section
        className="border-t border-gray-100 bg-white py-16 md:py-20"
        aria-labelledby="cuando-canjear"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-3xl border-2 border-furgocasa-orange/30 bg-orange-50/50 p-8 md:p-12">
            <div className="flex flex-col items-start gap-6 md:flex-row">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-furgocasa-orange text-white">
                <CalendarRange className="h-7 w-7" aria-hidden />
              </div>
              <div className="flex-1">
                <h2
                  id="cuando-canjear"
                  className="font-heading text-2xl font-bold text-gray-900 md:text-3xl"
                >
                  {tr(
                    "Cuándo y cómo se canjean los cupones",
                    "When and how to redeem the coupons",
                    "Quand et comment échanger les coupons",
                    "Wann und wie die Gutscheine eingelöst werden"
                  )}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-gray-700 md:text-lg">
                  {tr(
                    "Tus cupones son válidos en ",
                    "Your coupons are valid in ",
                    "Vos coupons sont valides en ",
                    "Deine Gutscheine sind gültig in "
                  )}
                  <strong className="text-furgocasa-orange-dark">
                    {tr(
                      "baja y media temporada",
                      "low and mid-season",
                      "basse et moyenne saison",
                      "Neben- und Zwischensaison"
                    )}
                  </strong>
                  {tr(", con un ", ", with a ", ", avec un ", ", mit einem ")}
                  <strong>
                    {tr(
                      `mínimo de ${COUPON_MIN_RESERVATION_DAYS} días`,
                      `minimum of ${COUPON_MIN_RESERVATION_DAYS} days`,
                      `minimum de ${COUPON_MIN_RESERVATION_DAYS} jours`,
                      `Minimum von ${COUPON_MIN_RESERVATION_DAYS} Tagen`
                    )}
                  </strong>
                  {tr(
                    " de reserva. Los introduces en el campo de código de descuento al confirmar una nueva reserva: el sistema los detecta y aplica automáticamente.",
                    " of booking. You enter them in the discount code field when confirming a new booking: the system detects and applies them automatically.",
                    " de réservation. Vous les saisissez dans le champ code de réduction lors de la confirmation d'une nouvelle réservation : le système les détecte et les applique automatiquement.",
                    " Buchung. Du gibst sie beim Bestätigen einer neuen Buchung in das Rabattcode-Feld ein: Das System erkennt und wendet sie automatisch an."
                  )}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  {tr(
                    `No son acumulables con otras promociones ni con cupones manuales. Caducan a ${COUPON_VALIDITY_MONTHS} meses desde su emisión, pero los puntos en sí `,
                    `They cannot be combined with other promotions or manual coupons. They expire ${COUPON_VALIDITY_MONTHS} months after issuance, but the points themselves `,
                    `Ils ne sont pas cumulables avec d'autres promotions ni avec des coupons manuels. Ils expirent ${COUPON_VALIDITY_MONTHS} mois après leur émission, mais les points eux-mêmes `,
                    `Sie sind nicht mit anderen Promotionen oder manuellen Gutscheinen kombinierbar. Sie laufen ${COUPON_VALIDITY_MONTHS} Monate nach Ausstellung ab, aber die Punkte selbst `
                  )}
                  <strong>
                    {tr(
                      "siguen sumando aunque no canjees enseguida",
                      "keep adding up even if you don't redeem right away",
                      "continuent de s'accumuler même si vous n'échangez pas tout de suite",
                      "summieren sich weiter, auch wenn du nicht sofort einlöst"
                    )}
                  </strong>
                  {tr(". Y recuerda: ", ". And remember: ", ". Et n'oubliez pas : ", ". Und denk daran: ")}
                  <strong>
                    {tr(
                      "solo tienes un cupón activo a la vez",
                      "you only have one active coupon at a time",
                      "vous n'avez qu'un seul coupon actif à la fois",
                      "du hast immer nur einen aktiven Gutschein"
                    )}
                  </strong>
                  {tr(
                    ", el de mayor %. Si subes de tramo, el anterior queda anulado y lo sustituye el nuevo automáticamente.",
                    ", the one with the highest %. If you move up a tier, the previous one is voided and automatically replaced by the new one.",
                    ", celui du % le plus élevé. Si vous montez de palier, le précédent est annulé et remplacé automatiquement par le nouveau.",
                    ", den mit dem höchsten %. Wenn du eine Stufe aufsteigst, wird der vorherige storniert und automatisch durch den neuen ersetzt."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3 · No las dejes en el móvil — refuerzo de "Cuándo se canjean" + ventana 90 días */}
      <LifestyleFeature
        imageSrc="/images/mailing/storytellers/banner-07-recuerdos-clean.jpg"
        imageAlt={tr(
          "Manos sosteniendo un móvil mostrando la galería de fotos de un viaje en camper, con un sofá acogedor al fondo",
          "Hands holding a phone showing the photo gallery of a camper trip, with a cosy sofa in the background",
          "Mains tenant un téléphone montrant la galerie de photos d'un voyage en camping-car, avec un canapé cosy en arrière-plan",
          "Hände halten ein Handy, das die Fotogalerie einer Camper-Reise zeigt, mit einem gemütlichen Sofa im Hintergrund"
        )}
        eyebrow={tr(
          "No las dejes en el móvil",
          "Don't leave them on your phone",
          "Ne les laissez pas sur votre téléphone",
          "Lass sie nicht auf dem Handy"
        )}
        title={tr(
          "Tienes 90 días desde la devolución para subirlas",
          "You have 90 days from drop-off to upload them",
          "Vous avez 90 jours après la restitution pour les envoyer",
          "Du hast 90 Tage nach der Rückgabe, um sie hochzuladen"
        )}
        body={tr(
          "Aunque vuelvas con prisa, no hay urgencia: tienes una ventana cómoda de 90 días tras devolver la camper para subir tu material. Lo que tenías guardado en el móvil pasa a ser descuento real en tu siguiente escapada.",
          "Even if you come back in a hurry, there's no rush: you have a comfortable 90-day window after returning the camper to upload your material. What you had saved on your phone becomes a real discount on your next getaway.",
          "Même si vous rentrez pressé, pas d'urgence : vous avez une fenêtre confortable de 90 jours après avoir rendu le camping-car pour envoyer votre contenu. Ce que vous gardiez sur votre téléphone devient une réduction réelle sur votre prochaine escapade.",
          "Selbst wenn du in Eile zurückkommst, gibt es keine Dringlichkeit: Du hast ein bequemes 90-Tage-Fenster nach Rückgabe des Campers, um dein Material hochzuladen. Was du auf dem Handy gespeichert hattest, wird zu einem echten Rabatt für deinen nächsten Kurzurlaub."
        )}
        bullets={[
          tr(
            "Cupones válidos 18 meses, en baja y media temporada",
            "Coupons valid for 18 months, low and mid-season",
            "Coupons valables 18 mois, basse et moyenne saison",
            "Gutscheine 18 Monate gültig, Neben- und Zwischensaison"
          ),
          tr(
            "Mínimo 4 días de reserva, no acumulable con otras promos",
            "Minimum 4-day booking, not combinable with other promos",
            "Réservation minimum 4 jours, non cumulable avec d'autres promotions",
            "Mindestbuchung 4 Tage, nicht mit anderen Promotionen kombinierbar"
          ),
          tr(
            "Por encima del 15 %, regalos: taza, camiseta, sudadera",
            "Above 15%, gifts: mug, t-shirt, hoodie",
            "Au-dessus de 15 %, cadeaux : tasse, t-shirt, sweat à capuche",
            "Über 15%, Geschenke: Tasse, T-Shirt, Hoodie"
          ),
        ]}
      />

      {/* 7. Lo que premiamos y lo que firmas */}
      <section
        className="border-t border-gray-100 bg-gray-50 py-16 md:py-20"
        aria-labelledby="que-esperamos-storytellers"
      >
        <div className="container mx-auto px-4">
          <h2
            id="que-esperamos-storytellers"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            {tr(
              "Lo que premiamos y lo que firmas",
              "What we reward and what you sign",
              "Ce que nous récompensons et ce que vous signez",
              "Was wir belohnen und was du unterschreibst"
            )}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-gray-600">
            {tr(
              "Queremos que sumar puntos sea fácil pero honesto. Las reglas son claras: premiamos contenido auténtico de tu viaje, no spam ni rellenos.",
              "We want earning points to be easy but honest. The rules are clear: we reward authentic content from your trip, not spam or filler.",
              "Nous voulons que cumuler des points soit facile mais honnête. Les règles sont claires : nous récompensons un contenu authentique de votre voyage, pas du spam ni du remplissage.",
              "Wir möchten, dass das Sammeln von Punkten einfach, aber ehrlich ist. Die Regeln sind klar: Wir belohnen authentische Inhalte deiner Reise, kein Spam, keine Füller."
            )}
          </p>
          <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-2">
            {/* Premiamos */}
            <div>
              <h3 className="font-heading text-xl font-bold text-furgocasa-orange-dark">
                {tr("Lo que premiamos", "What we reward", "Ce que nous récompensons", "Was wir belohnen")}
              </h3>
              <ul className="mt-4 space-y-3 text-gray-700">
                {[
                  tr(
                    "Fotos y vídeos hechos durante tu alquiler con tu camper",
                    "Photos and videos taken during your camper rental",
                    "Photos et vidéos prises pendant votre location de camping-car",
                    "Fotos und Videos, die während deiner Camper-Miete entstanden sind"
                  ),
                  tr(
                    "Variedad: exterior, interior, ruta, vida cotidiana de viaje",
                    "Variety: exterior, interior, route, daily life on the road",
                    "Variété : extérieur, intérieur, route, vie quotidienne en voyage",
                    "Vielfalt: außen, innen, Strecke, tägliches Reiseleben"
                  ),
                  tr(
                    "Calidad razonable de móvil moderno (iPhone/Android recientes valen)",
                    "Reasonable quality from a modern phone (recent iPhone/Android works)",
                    "Qualité raisonnable de téléphone moderne (iPhone/Android récents conviennent)",
                    "Vernünftige Qualität eines modernen Handys (aktuelle iPhones/Androids reichen)"
                  ),
                  tr(
                    "Vídeos cortos (10-60s) bien iluminados con audio limpio",
                    "Short videos (10-60s) well lit with clean audio",
                    "Vidéos courtes (10-60s) bien éclairées avec un audio propre",
                    "Kurze Videos (10-60s) gut beleuchtet mit sauberem Audio"
                  ),
                  tr(
                    "Detalles humanos: gente disfrutando, mascotas, momentos reales",
                    "Human details: people enjoying themselves, pets, real moments",
                    "Détails humains : gens qui s'amusent, animaux, moments réels",
                    "Menschliche Details: Menschen, die Spaß haben, Haustiere, echte Momente"
                  ),
                  tr(
                    "Subidas progresivas durante el viaje, no todo el último día",
                    "Progressive uploads during the trip, not all on the last day",
                    "Envois progressifs pendant le voyage, pas tout le dernier jour",
                    "Progressive Uploads während der Reise, nicht alles am letzten Tag"
                  ),
                ].map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="text-furgocasa-orange" aria-hidden>
                      ·
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cesión */}
            <div className="rounded-3xl bg-furgocasa-orange/5 p-8 border border-furgocasa-orange/20">
              <h3 className="font-heading text-xl font-bold text-gray-900">
                {tr("Lo que firmas al subir", "What you sign on upload", "Ce que vous signez à l'envoi", "Was du beim Upload unterschreibst")}
              </h3>
              <p className="mt-3 text-sm text-gray-600">
                {tr(
                  "Para poder usar tu material y darte el cupón a cambio, al subir aceptas estas condiciones de cesión:",
                  "To be able to use your material and give you the coupon in exchange, on upload you accept these licensing terms:",
                  "Pour pouvoir utiliser votre contenu et vous donner le coupon en échange, à l'envoi vous acceptez ces conditions de cession :",
                  "Um dein Material verwenden und dir den Gutschein im Gegenzug geben zu können, akzeptierst du beim Upload diese Nutzungsbedingungen:"
                )}
              </p>
              <ul className="mt-4 space-y-3 text-gray-700">
                {[
                  tr(
                    "Cesión no exclusiva (sigues pudiendo usar tus fotos)",
                    "Non-exclusive licence (you can still use your photos)",
                    "Cession non exclusive (vous pouvez continuer à utiliser vos photos)",
                    "Nicht-exklusive Lizenz (du kannst deine Fotos weiterhin nutzen)"
                  ),
                  tr(
                    "Mundial y por todo el plazo legal de protección",
                    "Worldwide and for the full legal term of protection",
                    "Mondiale et pour toute la durée légale de protection",
                    "Weltweit und für die gesamte gesetzliche Schutzdauer"
                  ),
                  tr(
                    "Para todos los medios online y offline, incluida publicidad pagada",
                    "For all online and offline media, including paid advertising",
                    "Pour tous les médias en ligne et hors ligne, y compris la publicité payante",
                    "Für alle Online- und Offline-Medien, einschließlich bezahlter Werbung"
                  ),
                  tr(
                    "Con derecho de edición y modificación",
                    "With editing and modification rights",
                    "Avec droit d'édition et de modification",
                    "Mit Bearbeitungs- und Änderungsrecht"
                  ),
                  tr(
                    "Sin obligación de mención al autor",
                    "No obligation to credit the author",
                    "Sans obligation de mention de l'auteur",
                    "Keine Pflicht zur Nennung des Autors"
                  ),
                  tr(
                    "Sin remuneración adicional al cupón Storyteller",
                    "No additional compensation beyond the Storyteller coupon",
                    "Sans rémunération supplémentaire au coupon Storyteller",
                    "Keine zusätzliche Vergütung über den Storyteller-Gutschein hinaus"
                  ),
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <FileImage className="mt-0.5 h-4 w-4 shrink-0 text-furgocasa-orange" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Anti-trampa */}
          <div className="mx-auto mt-10 max-w-5xl rounded-2xl border-2 border-furgocasa-orange/20 bg-white p-6 md:p-8">
            <h3 className="font-heading text-lg font-bold text-gray-900">
              {tr(
                "Detección de subidas no válidas",
                "Detection of invalid uploads",
                "Détection des envois non valides",
                "Erkennung ungültiger Uploads"
              )}
            </h3>
            <p className="mt-3 text-gray-700 leading-relaxed">
              {tr(
                "No aceptamos imágenes generadas por IA, fotos descargadas de internet, fotos repetidas con micro-cambios, capturas de pantalla, ni material que no sea de tu viaje real. Si detectamos abuso, anulamos los puntos correspondientes y, en casos repetidos, retiramos al cliente del programa. ",
                "We don't accept AI-generated images, photos downloaded from the internet, photos repeated with micro-changes, screenshots, or material that isn't from your real trip. If we detect abuse, we void the corresponding points and, in repeated cases, remove the customer from the programme. ",
                "Nous n'acceptons pas les images générées par IA, les photos téléchargées sur internet, les photos répétées avec micro-changements, les captures d'écran, ni le contenu qui n'est pas de votre vrai voyage. Si nous détectons un abus, nous annulons les points correspondants et, en cas répétés, nous retirons le client du programme. ",
                "Wir akzeptieren keine KI-generierten Bilder, aus dem Internet heruntergeladene Fotos, Fotos mit Mikro-Änderungen, Bildschirmfotos oder Material, das nicht von deiner echten Reise stammt. Wenn wir Missbrauch feststellen, stornieren wir die entsprechenden Punkte und entfernen den Kunden bei wiederholten Fällen aus dem Programm. "
              )}
              <strong>
                {tr(
                  "No es para ser estrictos: es para que el programa siga teniendo sentido para todos.",
                  "It's not about being strict: it's so the programme keeps making sense for everyone.",
                  "Ce n'est pas pour être stricts : c'est pour que le programme continue d'avoir du sens pour tout le monde.",
                  "Es geht nicht um Strenge: Es geht darum, dass das Programm für alle weiterhin sinnvoll bleibt."
                )}
              </strong>
            </p>
          </div>
        </div>
      </section>

      {/* 8. Showcase 6 imágenes */}
      <section
        className="border-t border-gray-100 bg-white py-16 md:py-20"
        aria-labelledby="ejemplos-storytellers"
      >
        <div className="container mx-auto px-4">
          <h2
            id="ejemplos-storytellers"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            {tr(
              "El tipo de momentos que nos encantan",
              "The kind of moments we love",
              "Le type de moments que nous adorons",
              "Die Art von Momenten, die wir lieben"
            )}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            {tr(
              "No buscamos perfección de revista. Buscamos verdad de viaje: luz natural, gente real y rincones que cuentan algo.",
              "We're not looking for magazine perfection. We're looking for travel honesty: natural light, real people and corners that tell a story.",
              "Nous ne cherchons pas la perfection de magazine. Nous cherchons l'authenticité du voyage : lumière naturelle, vrais gens et coins qui racontent quelque chose.",
              "Wir suchen keine Magazin-Perfektion. Wir suchen Reise-Wahrheit: natürliches Licht, echte Menschen und Ecken, die etwas erzählen."
            )}
          </p>
          <div className="mx-auto mt-10 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {showcaseImages.map(({ src, title, hint, alt }) => (
              <figure
                key={title}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-furgocasa-orange/30 hover:shadow-md"
              >
                <div className="relative aspect-[4/5] bg-gray-100">
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <figcaption className="border-t border-gray-100 px-4 py-3 text-center">
                  <span className="text-sm font-semibold text-gray-900">{title}</span>
                  <p className="mt-1 text-xs text-gray-500">{hint}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Perks adicionales — Merchandising */}
      <section
        className="border-t border-gray-100 bg-gray-50 py-16 md:py-20"
        aria-labelledby="perks-storytellers"
      >
        <div className="container mx-auto px-4">
          <h2
            id="perks-storytellers"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            {tr(
              "Regalos por tus puntos — merchandising oficial",
              "Gifts for your points — official merchandise",
              "Cadeaux pour vos points — merchandising officiel",
              "Geschenke für deine Punkte — offizielles Merchandise"
            )}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            {tr(
              `Cuando llegas al techo del ${MAX_DISCOUNT_PCT}%, tus puntos se convierten en `,
              `When you reach the ${MAX_DISCOUNT_PCT}% cap, your points turn into `,
              `Quand vous atteignez le plafond de ${MAX_DISCOUNT_PCT} %, vos points se transforment en `,
              `Wenn du die ${MAX_DISCOUNT_PCT}%-Grenze erreichst, werden deine Punkte zu `
            )}
            <strong>{tr("regalos", "gifts", "cadeaux", "Geschenken")}</strong>
            {tr(
              ": merchandising oficial Furgocasa, edición Storytellers, pensado para Storytellers recurrentes que aportan mucho material.",
              ": official Furgocasa merchandise, Storytellers edition, designed for recurring Storytellers who contribute lots of material.",
              " : merchandising officiel Furgocasa, édition Storytellers, conçu pour les Storytellers récurrents qui apportent beaucoup de contenu.",
              ": offizielles Furgocasa-Merchandise, Storytellers-Edition, gedacht für wiederkehrende Storytellers, die viel Material beitragen."
            )}
          </p>
          <ul className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PERK_TIERS.map((p) => (
              <li
                key={p.threshold}
                className="overflow-hidden rounded-3xl border border-furgocasa-orange/15 bg-white shadow-sm transition hover:border-furgocasa-orange/30 hover:shadow-md"
              >
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={`/images/storytellers/merch-${p.slug}.webp`}
                    alt={`${p.perk} – ${tr("producto Storytellers", "Storytellers product", "produit Storytellers", "Storytellers-Produkt")}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-furgocasa-orange px-3 py-1 text-xs font-bold text-white shadow-md">
                    {p.threshold} {tr("ptos", "pts", "pts", "Pkt")}
                  </span>
                </div>
                <div className="border-t border-gray-100 p-5">
                  <p className="font-heading text-lg font-bold text-gray-900">{p.perk}</p>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">{p.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-gray-500">
            {tr(
              "* Los puntos canjeados por merch se descuentan del saldo. El envío del producto se gestiona desde la oficina de Furgocasa contactando al cliente por email tras la solicitud de canje.",
              "* Points redeemed for merchandise are deducted from the balance. Shipping is managed from the Furgocasa office, contacting the customer by email after the redemption request.",
              "* Les points échangés contre du merchandising sont déduits du solde. L'envoi du produit est géré depuis le bureau Furgocasa en contactant le client par e-mail après la demande d'échange.",
              "* Für Merchandise eingelöste Punkte werden vom Saldo abgezogen. Der Versand des Produkts wird vom Furgocasa-Büro abgewickelt, indem der Kunde nach der Einlöseanfrage per E-Mail kontaktiert wird."
            )}
          </p>
        </div>
      </section>

      {/* 11. FAQ */}
      <section
        className="border-t border-gray-100 bg-white py-16 md:py-20"
        aria-labelledby="faq-storytellers"
      >
        <div className="container mx-auto max-w-3xl px-4">
          <h2
            id="faq-storytellers"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            {tr(
              "Preguntas frecuentes",
              "Frequently asked questions",
              "Questions fréquentes",
              "Häufig gestellte Fragen"
            )}
          </h2>
          <div className="mt-10 space-y-3">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 open:bg-white open:shadow-md"
              >
                <summary className="cursor-pointer list-none font-heading font-semibold text-gray-900 pr-8 [&::-webkit-details-marker]:hidden">
                  <span className="relative block after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:text-furgocasa-orange after:content-['+'] group-open:after:content-['−']">
                    {item.q}
                  </span>
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Teaser cruzado: Creadores de Contenido */}
      <section className="border-t border-gray-100 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 rounded-3xl border border-furgocasa-blue/20 bg-white p-8 shadow-sm md:flex-row md:items-center md:p-10">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-furgocasa-blue/10 text-furgocasa-blue">
              <Users className="h-7 w-7" aria-hidden />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-wider text-furgocasa-blue">
                {tr(
                  "¿Eres profesional?",
                  "Are you a professional?",
                  "Vous êtes professionnel ?",
                  "Bist du Profi?"
                )}
              </p>
              <h3 className="mt-1 font-heading text-xl font-bold text-gray-900 md:text-2xl">
                {tr(
                  "Si trabajas en RAW + 4K LOG, mira nuestro programa para creadores",
                  "If you work in RAW + 4K LOG, check out our creators programme",
                  "Si vous travaillez en RAW + 4K LOG, découvrez notre programme pour créateurs",
                  "Wenn du in RAW + 4K LOG arbeitest, sieh dir unser Kreativen-Programm an"
                )}
              </h3>
              <p className="mt-3 text-gray-700 leading-relaxed">
                {tr(
                  "Storytellers está pensado para clientes con buen ojo, no profesionales. Si grabas en RAW, 4K LOG o entregas piezas reutilizables con cesión perpetua, ",
                  "Storytellers is designed for customers with a good eye, not professionals. If you shoot in RAW, 4K LOG or deliver reusable pieces with perpetual licensing, ",
                  "Storytellers est pensé pour les clients avec un bon œil, pas pour les professionnels. Si vous tournez en RAW, 4K LOG ou livrez des pièces réutilisables avec cession perpétuelle, ",
                  "Storytellers ist für Kunden mit gutem Auge gedacht, nicht für Profis. Wenn du in RAW, 4K LOG drehst oder wiederverwendbare Stücke mit unbefristeter Lizenz lieferst, "
                )}
                <strong>
                  {tr(
                    "el programa de Creadores de Contenido tiene condiciones distintas",
                    "the Content Creators programme has different terms",
                    "le programme Créateurs de Contenu a des conditions différentes",
                    "hat das Content Creators Programm andere Bedingungen"
                  )}
                </strong>
                {tr(
                  ": cesión de camper en baja/media temporada y acuerdo profesional escrito.",
                  ": camper loan in low/mid-season and a written professional agreement.",
                  " : prêt de camping-car en basse/moyenne saison et accord professionnel écrit.",
                  ": Camper-Bereitstellung in der Neben-/Zwischensaison und schriftliche Profivereinbarung."
                )}
              </p>
            </div>
            <LocalizedLink
              href="/creadores-de-contenido"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-furgocasa-blue px-6 py-3 font-heading font-bold text-white shadow-lg transition hover:bg-furgocasa-blue-dark"
            >
              {tr(
                "Ver programa pro",
                "See pro programme",
                "Voir le programme pro",
                "Profi-Programm ansehen"
              )}
            </LocalizedLink>
          </div>
        </div>
      </section>

      {/* 13. CTA final */}
      <section className="border-t border-gray-100 bg-gradient-to-r from-furgocasa-orange to-furgocasa-orange-dark py-16 md:py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">
            {tr(
              "Tu primera subida ya tiene premio.",
              "Your first upload already has a reward.",
              "Votre premier envoi a déjà sa récompense.",
              "Dein erster Upload hat bereits eine Belohnung."
            )}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-orange-50">
            {tr(
              "Sube tus fotos y vídeos en menos de 2 minutos y recibe un ",
              "Upload your photos and videos in under 2 minutes and get an ",
              "Envoyez vos photos et vidéos en moins de 2 minutes et recevez un ",
              "Lade deine Fotos und Videos in unter 2 Minuten hoch und erhalte einen "
            )}
            <strong className="font-semibold text-white">
              {tr(
                "cupón inmediato del 3 %",
                "immediate 3% coupon",
                "coupon immédiat de 3 %",
                "sofortigen 3%-Gutschein"
              )}
            </strong>
            {tr(
              " para tu próxima reserva — luego sigue sumando puntos hacia el ",
              " for your next booking — then keep earning points towards the ",
              " pour votre prochaine réservation — puis continuez à cumuler des points vers les ",
              " für deine nächste Buchung — dann sammle weiter Punkte in Richtung "
            )}
            {MAX_DISCOUNT_PCT}%
            {tr(" y los regalos.", " and the gifts.", " et les cadeaux.", " und der Geschenke.")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/es/storytellers/subir"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-heading font-bold text-furgocasa-orange-dark shadow-lg transition hover:bg-orange-50"
            >
              <Upload className="h-5 w-5" aria-hidden />
              {tr("Subir ahora", "Upload now", "Envoyer maintenant", "Jetzt hochladen")}
            </a>
            <a
              href="/es/storytellers/mis-puntos"
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/50 bg-transparent px-8 py-4 font-heading font-bold text-white transition hover:bg-white/10"
            >
              {tr("Ya tengo puntos", "I already have points", "J'ai déjà des points", "Ich habe bereits Punkte")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
