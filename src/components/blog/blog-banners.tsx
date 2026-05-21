"use client";

import React, { useState, useEffect, useMemo } from "react";
import "./blog-banners.css";

/* ─────────────────────────────────────────────
   Datos de los 8 banners (HTML inline limpio)
   URLs correctas: /es/ofertas y /es/vehiculos
   ───────────────────────────────────────────── */

const HORIZONTAL_BANNERS = [
  {
    id: "h1-ofertas",
    html: `<a class="fc-banner-h" href="https://www.furgocasa.com/es/ofertas" aria-label="Ver ofertas Furgocasa">
  <img class="fc-banner-h__img" src="/images/mailing/vehicles/fu0006-dreamer-fun-d55.jpg" alt="Camper Dreamer Fun D55 de la flota Furgocasa" loading="lazy">
  <div class="fc-banner-h__overlay"></div>
  <span class="fc-banner-h__brand">Furgocasa</span>
  <div class="fc-banner-h__content">
    <span class="fc-banner-h__tag">Ofertas activas</span>
    <h3 class="fc-banner-h__title">Tu próxima escapada en camper, <span>al mejor precio</span></h3>
    <p class="fc-banner-h__subtitle">Aprovecha los huecos entre reservas y consigue tu camper totalmente equipada con descuentos exclusivos.</p>
    <span class="fc-banner-h__cta">Ver ofertas</span>
  </div>
</a>`,
  },
  {
    id: "h2-ventajas",
    html: `<a class="fc-banner-hsplit" href="https://www.furgocasa.com/es/vehiculos" aria-label="Descubre la flota de campers Furgocasa">
  <div class="fc-banner-hsplit__text">
    <div class="fc-banner-hsplit__inner">
      <div class="fc-banner-hsplit__brand">Furgocasa · Murcia</div>
      <h3 class="fc-banner-hsplit__title">Tu camper lista para salir, sin sorpresas</h3>
      <p class="fc-banner-hsplit__subtitle">Modelos modernos totalmente equipados y al alquilarlos con nosotros tendrás:</p>
      <div class="fc-banner-hsplit__features">
        <span class="fc-banner-hsplit__feature">Kilometraje ilimitado</span>
        <span class="fc-banner-hsplit__feature">Seguro a todo riesgo</span>
        <span class="fc-banner-hsplit__feature">Reserva en 2 minutos</span>
      </div>
      <span class="fc-banner-hsplit__cta">Ver nuestra flota</span>
    </div>
  </div>
  <div class="fc-banner-hsplit__img-wrap">
    <img class="fc-banner-hsplit__img" src="/images/mailing/vehicles/fu0016-challenger-v114-max.jpg" alt="Camper Challenger V114 Max de la flota Furgocasa" loading="lazy">
  </div>
</a>`,
  },
  {
    id: "h3-comodidad",
    html: `<a class="fc-banner-h2" href="https://www.furgocasa.com/es/vehiculos" aria-label="Descubre las campers Furgocasa">
  <img class="fc-banner-h2__img" src="/images/mailing/vehicles/fu0019-weinsberg-carabus-600-mq.jpg" alt="Camper Weinsberg Carabus 600 de la flota Furgocasa" loading="lazy">
  <div class="fc-banner-h2__overlay"></div>
  <span class="fc-banner-h2__brand">Furgocasa</span>
  <div class="fc-banner-h2__content">
    <span class="fc-banner-h2__tag">Alquiler en Murcia</span>
    <h3 class="fc-banner-h2__title">Despierta <span>donde quieras</span></h3>
    <p class="fc-banner-h2__subtitle">Campers totalmente equipadas con cocina, ducha y cama para que solo te preocupes de disfrutar.</p>
    <span class="fc-banner-h2__cta">Descubre los modelos</span>
  </div>
</a>`,
  },
  {
    id: "h4-reserva",
    html: `<a class="fc-banner-hsplit2" href="https://www.furgocasa.com/es/vehiculos" aria-label="Reserva tu camper Furgocasa">
  <div class="fc-banner-hsplit2__text">
    <div class="fc-banner-hsplit2__inner">
      <div class="fc-banner-hsplit2__brand">Furgocasa · Murcia</div>
      <h3 class="fc-banner-hsplit2__title">Reserva tu camper <span>en 2 minutos</span></h3>
      <p class="fc-banner-hsplit2__subtitle">Busca tus fechas, elige tu camper y confirma tu reserva directamente desde la web.</p>
      <div class="fc-banner-hsplit2__steps">
        <div class="fc-banner-hsplit2__step"><span class="fc-banner-hsplit2__step-num">1</span><span class="fc-banner-hsplit2__step-label">Elige fechas</span></div>
        <div class="fc-banner-hsplit2__step"><span class="fc-banner-hsplit2__step-num">2</span><span class="fc-banner-hsplit2__step-label">Elige camper</span></div>
        <div class="fc-banner-hsplit2__step"><span class="fc-banner-hsplit2__step-num">3</span><span class="fc-banner-hsplit2__step-label">¡A rodar!</span></div>
      </div>
      <span class="fc-banner-hsplit2__cta">Reservar ahora</span>
    </div>
  </div>
  <div class="fc-banner-hsplit2__img-wrap">
    <img class="fc-banner-hsplit2__img" src="/images/mailing/vehicles/fu0012-knaus-boxstar-family.jpg" alt="Camper Knaus Boxstar Family de la flota Furgocasa" loading="lazy">
  </div>
</a>`,
  },
];

const VERTICAL_BANNERS = [
  {
    id: "v1-ofertas",
    html: `<a class="fc-banner-v" href="https://www.furgocasa.com/es/ofertas" aria-label="Ver ofertas Furgocasa">
  <img class="fc-banner-v__img" src="/images/mailing/storytellers/showcase-hero.jpg" alt="Disfruta del atardecer desde tu camper Furgocasa" loading="lazy">
  <div class="fc-banner-v__overlay"></div>
  <span class="fc-banner-v__tag">Ofertas activas</span>
  <span class="fc-banner-v__brand">Furgocasa</span>
  <div class="fc-banner-v__content">
    <h3 class="fc-banner-v__title">Tu próxima aventura <span>al mejor precio</span></h3>
    <p class="fc-banner-v__subtitle">Huecos entre reservas con descuentos exclusivos en campers totalmente equipadas.</p>
    <span class="fc-banner-v__cta">Ver ofertas</span>
  </div>
</a>`,
  },
  {
    id: "v2-ventajas",
    html: `<a class="fc-banner-vcard" href="https://www.furgocasa.com/es/vehiculos" aria-label="Descubre la flota de campers Furgocasa">
  <div class="fc-banner-vcard__img-wrap">
    <span class="fc-banner-vcard__tag">La libertad de viajar</span>
    <span class="fc-banner-vcard__brand">Furgocasa</span>
    <img class="fc-banner-vcard__img" src="/images/mailing/storytellers/showcase-detail-route.jpg" alt="La carretera vista desde una camper Furgocasa" loading="lazy">
  </div>
  <div class="fc-banner-vcard__content">
    <h3 class="fc-banner-vcard__title">Lleva tu casa <span>contigo</span></h3>
    <p class="fc-banner-vcard__subtitle">Donde quieras, cuando quieras. Tu camper lista para salir desde Murcia.</p>
    <div class="fc-banner-vcard__features">
      <span class="fc-banner-vcard__feature">Kilometraje ilimitado</span>
      <span class="fc-banner-vcard__feature">Seguro a todo riesgo</span>
      <span class="fc-banner-vcard__feature">Reserva online en 2 min</span>
    </div>
    <span class="fc-banner-vcard__cta">Ver nuestra flota</span>
  </div>
</a>`,
  },
  {
    id: "v3-momentos",
    html: `<a class="fc-banner-v2" href="https://www.furgocasa.com/es/vehiculos" aria-label="Descubre las campers Furgocasa">
  <img class="fc-banner-v2__img" src="/images/mailing/storytellers/showcase-sunset-couple.jpg" alt="Pareja disfrutando del atardecer junto a su camper Furgocasa" loading="lazy">
  <div class="fc-banner-v2__overlay"></div>
  <span class="fc-banner-v2__brand">Furgocasa</span>
  <div class="fc-banner-v2__content">
    <div class="fc-banner-v2__quote">Para recordar siempre</div>
    <h3 class="fc-banner-v2__title">Los mejores momentos <span>se viven en camper</span></h3>
    <p class="fc-banner-v2__subtitle">Atardeceres, risas y carreteras sin fin. Alquila tu camper y crea tu historia.</p>
    <span class="fc-banner-v2__cta">Elige tu camper</span>
  </div>
</a>`,
  },
  {
    id: "v4-interior",
    html: `<a class="fc-banner-vcard2" href="https://www.furgocasa.com/es/vehiculos" aria-label="Descubre el interior de nuestras campers">
  <div class="fc-banner-vcard2__img-wrap">
    <span class="fc-banner-vcard2__tag">Todo incluido</span>
    <span class="fc-banner-vcard2__brand">Furgocasa</span>
    <img class="fc-banner-vcard2__img" src="/images/mailing/storytellers/showcase-breakfast-table.jpg" alt="Desayuno dentro de una camper Furgocasa" loading="lazy">
  </div>
  <div class="fc-banner-vcard2__content">
    <h3 class="fc-banner-vcard2__title">Tu hotel <span>sobre ruedas</span></h3>
    <p class="fc-banner-vcard2__subtitle">Cocina, ducha, cama y las mejores vistas. Todo listo para salir.</p>
    <div class="fc-banner-vcard2__features">
      <span class="fc-banner-vcard2__feature">Cocina equipada</span>
      <span class="fc-banner-vcard2__feature">Baño con ducha</span>
      <span class="fc-banner-vcard2__feature">Cama doble</span>
      <span class="fc-banner-vcard2__feature">Calefacción y A/C</span>
    </div>
    <span class="fc-banner-vcard2__cta">Ver equipamiento</span>
  </div>
</a>`,
  },
];

function shuffleAndPick<T>(arr: T[], count: number, seed: number): T[] {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

function BlogBanner({ hBanner, vBanner }: { hBanner: typeof HORIZONTAL_BANNERS[0]; vBanner: typeof VERTICAL_BANNERS[0] }) {
  return (
    <div className="fc-blog-banner-slot not-prose">
      <div className="fc-blog-banner-slot__h" dangerouslySetInnerHTML={{ __html: hBanner.html }} />
      <div className="fc-blog-banner-slot__v" dangerouslySetInnerHTML={{ __html: vBanner.html }} />
    </div>
  );
}

interface BlogContentWithBannersProps {
  htmlContent: string;
  readingTime: number;
  proseClassName: string;
}

export function BlogContentWithBanners({ htmlContent, readingTime, proseClassName }: BlogContentWithBannersProps) {
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 2147483646) + 1);
  }, []);

  const sections = useMemo(() => {
    if (!htmlContent) return [""];
    const parts = htmlContent.split(/(?=<h2[\s>])/i);
    return parts.filter(Boolean);
  }, [htmlContent]);

  const bannerCount = useMemo(() => {
    const sectionCount = sections.length;
    if (readingTime <= 4 || sectionCount <= 2) return 1;
    if (readingTime <= 8 || sectionCount <= 5) return 2;
    return 3;
  }, [readingTime, sections.length]);

  const bannerPositions = useMemo(() => {
    const total = sections.length;
    if (total <= 1) return [];

    const positions: number[] = [];
    const step = total / (bannerCount + 1);

    for (let i = 1; i <= bannerCount; i++) {
      const pos = Math.round(step * i);
      if (pos > 0 && pos < total && !positions.includes(pos)) {
        positions.push(pos);
      }
    }
    return positions;
  }, [sections.length, bannerCount]);

  const selectedBanners = useMemo(() => {
    if (seed === 0) return [];
    const hPicks = shuffleAndPick(HORIZONTAL_BANNERS, bannerCount, seed);
    const vPicks = shuffleAndPick(VERTICAL_BANNERS, bannerCount, seed + 7919);
    return hPicks.map((h, i) => ({ h, v: vPicks[i] }));
  }, [seed, bannerCount]);

  if (seed === 0) {
    return (
      <div
        className={proseClassName}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  const result: React.ReactElement[] = [];
  let bannerIdx = 0;

  sections.forEach((section, i) => {
    result.push(
      <div
        key={`section-${i}`}
        className={proseClassName}
        dangerouslySetInnerHTML={{ __html: section }}
      />
    );

    if (bannerPositions.includes(i + 1) && bannerIdx < selectedBanners.length) {
      const { h, v } = selectedBanners[bannerIdx];
      result.push(
        <BlogBanner key={`banner-${bannerIdx}`} hBanner={h} vBanner={v} />
      );
      bannerIdx++;
    }
  });

  return <>{result}</>;
}
