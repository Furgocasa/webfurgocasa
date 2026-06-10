"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LocalizedLink } from "@/components/localized-link";
import { initGuiaCamper3dScene } from "./init-scene";

export function GuiaCamper3dClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lessonName, setLessonName] = useState("Inicio");
  const [xrayOn, setXrayOn] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? window.scrollY / max : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    document.documentElement.style.background = "#8FCBEE";
    document.body.style.background = "#8FCBEE";
    document.body.style.overflowX = "hidden";

    const cleanup = initGuiaCamper3dScene(canvas, {
      onLessonChange: setLessonName,
      onXrayChange: setXrayOn,
    });

    return () => {
      cleanup();
      document.documentElement.style.background = "";
      document.body.style.background = "";
      document.body.style.overflowX = "";
    };
  }, []);

  const progressPct = Math.round(scrollProgress * 100);
  const showScrollNudge = scrollProgress < 0.12;

  return (
    <div className="guia3d-root">
      <canvas ref={canvasRef} id="bg" aria-hidden="true" />

      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso de la lección"
      >
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="top">
        <LocalizedLink href="/es/guia-camper" className="logo-link" aria-label="Volver a la Guía Camper">
          <Image
            src="/images/mailing/LOGO BLANCO.png"
            alt="Furgocasa"
            width={140}
            height={36}
            priority
            className="logo-img"
          />
        </LocalizedLink>
        <div className="leccion">
          <b>{lessonName}</b> · Guía 3D · {progressPct}%
        </div>
        <div className="leccion-mobile">{progressPct}%</div>
      </div>

      {showScrollNudge && (
        <div className="scroll-nudge" aria-hidden="true">
          <span className="scroll-nudge-label">Desliza hacia abajo</span>
          <span className="scroll-nudge-chevrons">
            <span>▼</span>
            <span>▼</span>
          </span>
        </div>
      )}

      <div className={`xray${xrayOn ? " on" : ""}`}>
        <span className="dot" />
        MODO RAYOS X
      </div>

      <main>
        <section className="hero-sec">
          <div className="card">
            <span className="eyebrow">Antes de recoger tu camper · 7 nociones</span>
            <h1>
              La Guía Camper,
              <br />
              en <em>rayos X</em>
            </h1>
            <p className="hero-lead">
              Viajar en camper por primera vez genera dudas. Por eso vas a recorrer tu vehículo por
              fuera y por dentro: con cada noción, la cámara volará a esa parte de la furgo y la
              carrocería se volverá transparente para que veas el sistema funcionando. Cuando llegues
              al final, recoges las llaves sabiendo más que muchos veteranos.
            </p>
          </div>
          <span className="scroll">
            <span className="scroll-label">Scroll para empezar la lección</span>
            <span className="scroll-chevrons">▼ ▼</span>
          </span>
        </section>

        <section>
          <div className="card">
            <div className="num">1</div>
            <h2>Energía: batería de litio y placa solar</h2>
            <p>
              Tu camper tiene dos sistemas eléctricos: el del motor y el de la vivienda. La batería de
              litio (la caja azul que ves brillar bajo el asiento) alimenta luces, nevera y enchufes
              USB, y se recarga sola: con la placa solar del techo y con el alternador mientras
              conduces.
            </p>
            <div className="tip">
              <b>Truco:</b> el panel de control central te dice el nivel de batería y de los depósitos.
              Échale un ojo cada mañana: es el &quot;salpicadero&quot; de tu casa.
            </div>
          </div>
        </section>

        <section>
          <div className="card">
            <div className="num">2</div>
            <h2>Conexión a red de 220 V</h2>
            <p>
              En campings y áreas con electricidad puedes enchufar la camper a un poste de corriente:
              mira el cable conectado a la toma exterior. Furgocasa incluye los conectores y el
              alargador necesarios con todas sus campers. Con 220 V cargas la batería a tope y usas
              los enchufes como en casa.
            </p>
            <div className="tip">
              <b>Importante:</b> conecta primero el cable al poste y después a la camper. Al irte,
              desconecta y guarda el cable en su hueco del maletero.
            </div>
          </div>
        </section>

        <section>
          <div className="card">
            <div className="num">3</div>
            <h2>El gas propano</h2>
            <p>
              Las botellas de gas viven en un hueco trasero al que se accede desde el maletero —ahí
              está, en naranja. El gas alimenta los fuegos de la cocina, la calefacción y el agua
              caliente.
            </p>
            <div className="tip">
              <b>La regla de oro:</b> botella CERRADA durante la marcha, ABIERTA al acampar. Si
              enciendes la calefacción o el agua caliente con el gas cerrado, el sistema se bloquea
              tras varios intentos. Y si se agota: recárgala en cualquier gasolinera, Furgocasa asume
              el coste.
            </div>
          </div>
        </section>

        <section>
          <div className="card">
            <div className="num">4</div>
            <h2>Agua limpia</h2>
            <p>
              El depósito de agua limpia (azul, ahora llenándose) abastece el grifo de la cocina, el
              lavabo y la ducha. Se rellena por una boca exterior con la manguera del área de
              servicio, como la que tienes al lado. Con un uso normal, da para 2-3 días de autonomía.
            </p>
            <div className="tip">
              <b>Truco:</b> viaja con el depósito a medias si vas a hacer muchos km —menos peso, menos
              consumo— y rellena al llegar al destino.
            </div>
          </div>
        </section>

        <section>
          <div className="card">
            <div className="num">5</div>
            <h2>Aguas grises</h2>
            <p>
              Todo lo que se va por los desagües (fregadero, ducha, lavabo) cae al depósito de aguas
              grises, bajo el suelo del vehículo. Son aguas residuales contaminantes: <b>solo</b>{" "}
              pueden vaciarse en las rejillas habilitadas de áreas de autocaravanas o campings, como
              la que tiene la camper debajo ahora mismo.
            </p>
            <div className="tip">
              <b>Contra los olores:</b> vacía cada 2-3 días y echa un poco de agua con producto
              específico tras cada vaciado. Tu nariz te lo agradecerá.
            </div>
          </div>
        </section>

        <section>
          <div className="card">
            <div className="num">6</div>
            <h2>El WC químico (cassette)</h2>
            <p>
              El WC usa un depósito extraíble tipo maletín —el cassette— al que se accede por una
              portezuela exterior, la que está señalada. Para vaciarlo: se extrae el maletín, se lleva
              a la zona de aguas negras del área, se gira el codo a la posición cómoda y se vierte.
            </p>
            <div className="tip">
              <b>Nunca</b> lo vacíes fuera de las zonas habilitadas. Y usa siempre el producto
              químico azul: descompone los residuos y elimina los olores.
            </div>
          </div>
        </section>

        <section>
          <div className="card">
            <div className="num">7</div>
            <h2>Calefacción y agua caliente</h2>
            <p>
              Está anocheciendo y la calefacción estática ya está encendida: funciona con el gas (¿ves
              por qué la regla de oro era importante?) y calienta la camper sin arrancar el motor, en
              silencio. El mismo sistema te da agua caliente para la ducha en unos 20 minutos.
            </p>
            <div className="tip">
              <b>Orden correcto:</b> 1) abre la botella de gas, 2) enciende la calefacción en el
              panel, 3) elige temperatura. Dormirás a 21° aunque fuera hiele.
            </div>
          </div>
        </section>

        <section className="final">
          <div className="card">
            <span className="eyebrow">Lección completada · Ya es de noche</span>
            <h2 className="final-title">Aprobado. Las llaves<br />te están esperando.</h2>
            <p className="final-lead">
              Esto es solo el resumen: en la Guía Camper completa y en los video-tutoriales tienes
              cada sistema explicado paso a paso en el modelo exacto que vas a alquilar. Y para
              encontrar áreas de servicio en ruta, Mapa Furgocasa.
            </p>
            <div className="final-actions">
              <LocalizedLink href="/es/guia-camper" className="btn">
                Guía completa
              </LocalizedLink>
              <LocalizedLink href="/es/video-tutoriales" className="btn ghost">
                Video tutoriales
              </LocalizedLink>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .guia3d-root {
          --naranja: #ff6b2c;
          --crema: #fff4e6;
          background: #8fcbee;
          color: var(--crema);
          font-family: var(--font-space-grotesk), sans-serif;
          font-weight: 300;
          min-height: 100vh;
        }
        .guia3d-root ::selection {
          background: var(--naranja);
          color: #fff;
        }
        .guia3d-root a {
          color: inherit;
        }
        .guia3d-root canvas#bg {
          position: fixed;
          inset: 0;
          z-index: 0;
        }
        .guia3d-root .progress-track {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          z-index: 40;
          background: rgba(11, 16, 36, 0.35);
          pointer-events: none;
        }
        .guia3d-root .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--naranja), #ffb35c);
          box-shadow: 0 0 12px rgba(255, 107, 44, 0.65);
          transition: width 0.12s ease-out;
        }
        .guia3d-root .top {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 30;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.3rem 4vw;
          pointer-events: none;
        }
        .guia3d-root .logo-link {
          pointer-events: auto;
          display: block;
          line-height: 0;
        }
        .guia3d-root .logo-img {
          height: 2rem;
          width: auto;
          filter: drop-shadow(0 2px 18px rgba(0, 0, 0, 0.35));
        }
        .guia3d-root .leccion {
          pointer-events: none;
          font-size: 0.68rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          background: rgba(11, 16, 36, 0.45);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 99px;
          padding: 0.6rem 1.3rem;
          font-variant-numeric: tabular-nums;
        }
        .guia3d-root .leccion b {
          color: var(--naranja);
          font-weight: 500;
        }
        .guia3d-root .leccion-mobile {
          display: none;
          pointer-events: none;
          font-size: 0.68rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          background: rgba(11, 16, 36, 0.45);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 99px;
          padding: 0.6rem 1rem;
          font-variant-numeric: tabular-nums;
          color: var(--naranja);
          font-weight: 600;
        }
        .guia3d-root .scroll-nudge {
          position: fixed;
          left: 50%;
          bottom: 1.6rem;
          transform: translateX(-50%);
          z-index: 28;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          pointer-events: none;
          background: rgba(11, 16, 36, 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 99px;
          padding: 0.65rem 1.2rem 0.5rem;
          animation: guia3d-nudge-in 0.5s ease-out;
        }
        .guia3d-root .scroll-nudge-label {
          font-size: 0.58rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #fff;
          opacity: 0.9;
        }
        .guia3d-root .scroll-nudge-chevrons {
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 0.55;
          color: var(--naranja);
          font-size: 0.72rem;
          animation: guia3d-bounce 1.8s ease-in-out infinite;
        }
        .guia3d-root .scroll-nudge-chevrons span:last-child {
          opacity: 0.45;
        }
        @keyframes guia3d-nudge-in {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes guia3d-bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(5px);
          }
        }
        .guia3d-root .xray {
          position: fixed;
          left: max(2vw, 16px);
          bottom: 2rem;
          z-index: 30;
          pointer-events: none;
          background: rgba(11, 16, 36, 0.45);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 14px;
          padding: 0.8rem 1.1rem;
          font-size: 0.6rem;
          letter-spacing: 0.26em;
          text-transform: uppercase;
        }
        .guia3d-root .xray .dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #5a5f70;
          margin-right: 0.6rem;
          vertical-align: 1px;
          transition: background 0.4s, box-shadow 0.4s;
        }
        .guia3d-root .xray.on .dot {
          background: #69e8ff;
          box-shadow: 0 0 12px #69e8ff;
        }
        .guia3d-root main {
          position: relative;
          z-index: 1;
        }
        .guia3d-root section {
          min-height: 125vh;
          display: flex;
          align-items: center;
          padding: 0 6vw;
          pointer-events: none;
        }
        .guia3d-root section:nth-child(even) {
          justify-content: flex-end;
        }
        .guia3d-root .card {
          max-width: 460px;
          pointer-events: auto;
          background: rgba(11, 16, 36, 0.5);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 22px;
          padding: 2.2rem 2.3rem 2rem;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.25);
        }
        .guia3d-root .num {
          display: inline-grid;
          place-items: center;
          width: 2.4rem;
          height: 2.4rem;
          border-radius: 50%;
          background: var(--naranja);
          font-family: var(--font-syne), sans-serif;
          font-weight: 800;
          font-size: 1rem;
          margin-bottom: 1.1rem;
        }
        .guia3d-root .eyebrow {
          font-size: 0.62rem;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: var(--naranja);
          margin-bottom: 0.9rem;
          display: block;
          font-weight: 500;
        }
        .guia3d-root h1 {
          font-family: var(--font-syne), sans-serif;
          font-weight: 800;
          font-size: clamp(2rem, 4.2vw, 3.3rem);
          line-height: 1.06;
          color: #fff;
        }
        .guia3d-root h1 em {
          font-style: normal;
          color: var(--naranja);
        }
        .guia3d-root h2 {
          font-family: var(--font-syne), sans-serif;
          font-weight: 700;
          font-size: clamp(1.4rem, 3vw, 2.1rem);
          line-height: 1.15;
          color: #fff;
          margin-bottom: 1rem;
        }
        .guia3d-root .card p {
          line-height: 1.8;
          font-size: 0.94rem;
          opacity: 0.9;
        }
        .guia3d-root .hero-lead {
          margin-top: 1.3rem;
        }
        .guia3d-root .tip {
          margin-top: 1.3rem;
          border-left: 3px solid var(--naranja);
          padding: 0.7rem 1rem;
          background: rgba(255, 107, 44, 0.1);
          border-radius: 0 10px 10px 0;
          font-size: 0.85rem;
          line-height: 1.65;
        }
        .guia3d-root .tip b {
          color: var(--naranja);
        }
        .guia3d-root .btn {
          display: inline-block;
          margin-top: 1.6rem;
          padding: 0.95rem 2.4rem;
          font-family: var(--font-syne), sans-serif;
          font-weight: 700;
          font-size: 0.74rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #fff;
          background: var(--naranja);
          border-radius: 99px;
          text-decoration: none;
          box-shadow: 0 12px 34px rgba(255, 107, 44, 0.45);
          transition: transform 0.25s;
        }
        .guia3d-root .btn:hover {
          transform: translateY(-3px);
        }
        .guia3d-root .btn.ghost {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: none;
          margin-left: 0.7rem;
        }
        .guia3d-root .btn:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 4px;
        }
        .guia3d-root .hero-sec .scroll {
          position: absolute;
          bottom: 5vh;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.45rem;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
        }
        .guia3d-root .scroll-label {
          font-size: 0.62rem;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          color: #fff;
          opacity: 0.85;
          animation: guia3d-pulse 2.6s infinite;
        }
        .guia3d-root .scroll-chevrons {
          color: var(--naranja);
          font-size: 0.75rem;
          letter-spacing: 0.35em;
          animation: guia3d-bounce 1.8s ease-in-out infinite;
        }
        @keyframes guia3d-pulse {
          50% {
            opacity: 0.25;
          }
        }
        .guia3d-root .final {
          justify-content: center !important;
          text-align: center;
        }
        .guia3d-root .final .card {
          max-width: 580px;
        }
        .guia3d-root .hero-sec .card {
          max-width: 540px;
        }
        .guia3d-root .final-title {
          font-size: clamp(1.7rem, 4vw, 2.7rem);
        }
        .guia3d-root .final-lead {
          margin-top: 0.8rem;
        }
        @media (max-width: 760px) {
          .guia3d-root section {
            padding: 0 4vw;
            min-height: 115vh;
            align-items: flex-end;
            padding-bottom: 9vh;
          }
          .guia3d-root section:nth-child(even) {
            justify-content: flex-start;
          }
          .guia3d-root .card {
            padding: 1.5rem 1.4rem;
            max-width: none;
            width: 100%;
          }
          .guia3d-root .card p {
            font-size: 0.88rem;
            line-height: 1.7;
          }
          .guia3d-root .tip {
            font-size: 0.8rem;
          }
          .guia3d-root .btn.ghost {
            margin-left: 0;
            margin-top: 0.7rem;
          }
          .guia3d-root .hero-sec {
            align-items: center;
            padding-bottom: 0;
          }
          .guia3d-root .leccion {
            display: none;
          }
          .guia3d-root .leccion-mobile {
            display: block;
          }
          .guia3d-root .scroll-nudge {
            bottom: 1.1rem;
          }
          .guia3d-root .xray {
            bottom: 4.6rem;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .guia3d-root * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
