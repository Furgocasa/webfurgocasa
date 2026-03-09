"use client";

import { useEffect, useState } from "react";

export function WinterBannerTron() {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: '--',
    hours: '--',
    mins: '--',
    secs: '--'
  });

  useEffect(() => {
    // Countdown
    const target = new Date('2026-03-20T23:59:59').getTime();
    const updateCountdown = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: '00', hours: '00', mins: '00', secs: '00' });
        return;
      }
      setTimeLeft({
        days: String(Math.floor(diff/86400000)).padStart(2,'0'),
        hours: String(Math.floor((diff%86400000)/3600000)).padStart(2,'0'),
        mins: String(Math.floor((diff%3600000)/60000)).padStart(2,'0'),
        secs: String(Math.floor((diff%60000)/1000)).padStart(2,'0')
      });
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText("TRON2026");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="tron-banner-wrapper" className="font-amiko">
      <style dangerouslySetInnerHTML={{ __html: `
        #tron-banner-wrapper {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background: radial-gradient(circle at center, #0a0a2a 0%, #020208 100%);
        }
        #tron-banner-wrapper *, #tron-banner-wrapper *::before, #tron-banner-wrapper *::after {
          box-sizing: border-box;
        }

        /* 3D Grid */
        .tron-grid {
          position: absolute; inset: -50%; 
          background-image: 
            linear-gradient(rgba(0, 243, 255, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 243, 255, 0.15) 1px, transparent 1px);
          background-size: 60px 60px;
          transform: perspective(600px) rotateX(70deg) translateY(-100px) translateZ(-200px);
          animation: gridMove 10s linear infinite;
          z-index: 0;
          mask-image: linear-gradient(to top, black 40%, transparent 100%);
          -webkit-mask-image: linear-gradient(to top, black 40%, transparent 100%);
        }
        @keyframes gridMove {
          0% { transform: perspective(600px) rotateX(70deg) translateY(0px) translateZ(-200px); }
          100% { transform: perspective(600px) rotateX(70deg) translateY(60px) translateZ(-200px); }
        }

        /* Scanlines overlay */
        .scanlines {
          position: absolute; inset: 0; z-index: 30; pointer-events: none;
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
          background-size: 100% 4px;
        }

        .map-layer {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;
        }

        .neon-node {
          position: absolute; width: 16px; height: 16px;
          background: #020208; border: 3px solid #ff00ff; border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 15px 5px rgba(255, 0, 255, 0.6);
          animation: pulseNode 2s infinite;
        }
        @keyframes pulseNode {
          0%, 100% { box-shadow: 0 0 10px 2px rgba(255, 0, 255, 0.6); }
          50% { box-shadow: 0 0 25px 8px rgba(255, 0, 255, 0.8); }
        }

        .dest-icon {
          position: absolute; transform: translate(-50%, -100%); z-index: 5;
        }
        .dest-mountain { left: 20%; top: 60%; animation: popMountain 30s infinite; }
        .dest-market { left: 50%; top: 40%; animation: popMarket 30s infinite; }
        .dest-resort { left: 80%; top: 70%; animation: popResort 30s infinite; }

        @keyframes popMountain {
          0%, 10% { opacity: 0; transform: translate(-50%, -80%) scale(0.5); }
          15%, 30% { opacity: 1; transform: translate(-50%, -100%) scale(1); }
          35%, 100% { opacity: 0; transform: translate(-50%, -80%) scale(0.5); }
        }
        @keyframes popMarket {
          0%, 35% { opacity: 0; transform: translate(-50%, -80%) scale(0.5); }
          40%, 55% { opacity: 1; transform: translate(-50%, -100%) scale(1); }
          60%, 100% { opacity: 0; transform: translate(-50%, -80%) scale(0.5); }
        }
        @keyframes popResort {
          0%, 60% { opacity: 0; transform: translate(-50%, -80%) scale(0.5); }
          65%, 80% { opacity: 1; transform: translate(-50%, -100%) scale(1); }
          85%, 100% { opacity: 0; transform: translate(-50%, -80%) scale(0.5); }
        }

        .neon-camper {
          position: absolute;
          transform: translate(-50%, -100%);
          z-index: 10;
          animation: driveJourney 30s infinite;
        }
        @keyframes driveJourney {
          0% { left: -10%; top: 60%; animation-timing-function: linear; }
          15% { left: 20%; top: 60%; }
          25% { left: 20%; top: 60%; animation-timing-function: linear; }
          32.5% { left: 35%; top: 40%; animation-timing-function: linear; }
          40% { left: 50%; top: 40%; }
          50% { left: 50%; top: 40%; animation-timing-function: linear; }
          57.5% { left: 65%; top: 70%; animation-timing-function: linear; }
          65% { left: 80%; top: 70%; }
          75% { left: 80%; top: 70%; animation-timing-function: linear; }
          82.5% { left: 95%; top: 60%; animation-timing-function: linear; }
          90%, 100% { left: 110%; top: 60%; }
        }

        .header-overlay {
          position: absolute; top: 6%; left: 0; width: 100%; z-index: 20;
          display: flex; flex-direction: column; align-items: center;
          pointer-events: none; text-align: center;
        }
        .footer-overlay {
          position: absolute; bottom: 8%; left: 0; width: 100%; z-index: 20;
          display: flex; flex-direction: column; align-items: center; gap: 15px;
          pointer-events: none;
        }
        .footer-overlay > * { pointer-events: auto; }

        .tron-title {
          font-family: 'Rubik', sans-serif; font-weight: 900; font-size: clamp(2.5rem, 6vw, 4.5rem);
          color: #fff; text-shadow: 0 0 10px #00f3ff, 0 0 20px #00f3ff, 0 0 40px #00f3ff;
          line-height: 1; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px;
          animation: neonFlicker 4s infinite alternate;
        }
        @keyframes neonFlicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { text-shadow: 0 0 10px #00f3ff, 0 0 20px #00f3ff, 0 0 40px #00f3ff; opacity: 1; }
          20%, 24%, 55% { text-shadow: none; opacity: 0.8; }
        }
        .tron-subtitle {
          font-family: 'Amiko', sans-serif; font-size: clamp(0.9rem, 2vw, 1.2rem);
          color: #00ff9d; text-shadow: 0 0 10px #00ff9d; letter-spacing: 3px;
          text-transform: uppercase; font-weight: 600;
        }

        .tron-coupon-box {
          display: flex; gap: 20px;
        }
        .tron-coupon {
          background: rgba(2, 2, 8, 0.8); border: 2px solid #ff00ff; border-radius: 12px;
          padding: 15px 30px; box-shadow: 0 0 15px rgba(255, 0, 255, 0.4), inset 0 0 15px rgba(255, 0, 255, 0.2);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; cursor: pointer; transition: all 0.3s;
        }
        .tron-coupon:hover { transform: scale(1.05); box-shadow: 0 0 25px rgba(255, 0, 255, 0.6), inset 0 0 25px rgba(255, 0, 255, 0.4); }
        .tron-coupon-label { color: #fff; font-size: 0.75rem; letter-spacing: 2px; opacity: 0.9; text-transform: uppercase; }
        .tron-coupon-code { font-family: 'Rubik', sans-serif; font-size: 2rem; font-weight: 900; color: #ff00ff; text-shadow: 0 0 10px #ff00ff; letter-spacing: 4px; }

        .tron-cta {
          background: transparent; border: 2px solid #00ff9d; color: #00ff9d;
          padding: 12px 25px; border-radius: 30px; font-weight: bold; font-size: 1rem; text-transform: uppercase;
          letter-spacing: 1px; box-shadow: 0 0 10px rgba(0, 255, 157, 0.4); cursor: pointer; transition: 0.3s;
          display: flex; align-items: center; justify-content: center;
        }
        .tron-cta:hover { background: #00ff9d; color: #020208; box-shadow: 0 0 20px rgba(0, 255, 157, 0.8); }

        .tron-countdown {
          display: flex; gap: 10px; margin-top: 5px;
        }
        .tron-cd-item {
          display: flex; flex-direction: column; align-items: center;
          background: rgba(0, 243, 255, 0.1); border: 1px solid #00f3ff; border-radius: 8px;
          padding: 6px 10px; box-shadow: inset 0 0 8px rgba(0, 243, 255, 0.2); min-width: 55px;
        }
        .tron-cd-num { font-family: 'Rubik', sans-serif; font-size: 1.4rem; font-weight: bold; color: #fff; text-shadow: 0 0 8px #00f3ff; }
        .tron-cd-label { font-size: 0.6rem; color: #00f3ff; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }

        .copied-tooltip { position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-100px); background: #ff00ff; color: #fff; font-family: 'Rubik', sans-serif; font-weight: 700; padding: 12px 28px; border-radius: 30px; z-index: 100; transition: 0.4s; font-size: 0.95rem; box-shadow: 0 0 20px #ff00ff; pointer-events: none; }
        .copied-tooltip.show { transform: translateX(-50%) translateY(0); }

        @media (max-width: 768px) {
          .tron-coupon-box { flex-direction: column; gap: 15px; }
          .tron-coupon { padding: 10px 20px; }
          .tron-coupon-code { font-size: 1.5rem; }
          .tron-cd-num { font-size: 1.2rem; }
        }
      `}} />

      <div className="tron-grid"></div>
      
      <svg className="map-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M -10,60 L 20,60 L 35,40 L 50,40 L 65,70 L 80,70 L 95,60 L 110,60" fill="none" stroke="rgba(0,243,255,0.3)" strokeWidth="6" vectorEffect="non-scaling-stroke" />
        <path d="M -10,60 L 20,60 L 35,40 L 50,40 L 65,70 L 80,70 L 95,60 L 110,60" fill="none" stroke="#00f3ff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="neon-node" style={{left: '20%', top: '60%'}}></div>
      <div className="neon-node" style={{left: '50%', top: '40%'}}></div>
      <div className="neon-node" style={{left: '80%', top: '70%'}}></div>

      <div className="dest-icon dest-mountain">
        <svg viewBox="0 0 100 100" width="100" height="100">
          <path d="M 10,90 L 50,20 L 90,90 Z" fill="rgba(255,0,255,0.1)" stroke="#ff00ff" strokeWidth="3" style={{filter: 'drop-shadow(0 0 4px #ff00ff)'}}/>
          <path d="M 35,46 L 45,55 L 55,45 L 65,55 L 75,46" fill="none" stroke="#ff00ff" strokeWidth="2" />
          <text x="50" y="105" fill="#00f3ff" fontFamily="Rubik, sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle" style={{filter: 'drop-shadow(0 0 3px #00f3ff)'}}>ALPES</text>
        </svg>
      </div>

      <div className="dest-icon dest-market">
        <svg viewBox="0 0 100 100" width="100" height="100">
          <path d="M 20,80 L 20,40 L 50,20 L 80,40 L 80,80" fill="rgba(0,243,255,0.1)" stroke="#00f3ff" strokeWidth="3" style={{filter: 'drop-shadow(0 0 4px #00f3ff)'}}/>
          <path d="M 10,40 L 90,40" stroke="#00f3ff" strokeWidth="3" />
          <circle cx="30" cy="45" r="3" fill="#ff00ff" style={{filter: 'drop-shadow(0 0 3px #ff00ff)'}}/>
          <circle cx="50" cy="45" r="3" fill="#00ff9d" style={{filter: 'drop-shadow(0 0 3px #00ff9d)'}}/>
          <circle cx="70" cy="45" r="3" fill="#ff00ff" style={{filter: 'drop-shadow(0 0 3px #ff00ff)'}}/>
          <text x="50" y="105" fill="#ff00ff" fontFamily="Rubik, sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle" style={{filter: 'drop-shadow(0 0 3px #ff00ff)'}}>MERCADILLO</text>
        </svg>
      </div>

      <div className="dest-icon dest-resort">
        <svg viewBox="0 0 100 100" width="100" height="100">
          <path d="M 20,20 L 80,40" stroke="#00ff9d" strokeWidth="2" />
          <rect x="40" y="42" width="20" height="25" rx="3" fill="rgba(0,255,157,0.1)" stroke="#00ff9d" strokeWidth="3" style={{filter: 'drop-shadow(0 0 4px #00ff9d)'}}/>
          <path d="M 50,28 L 50,42" stroke="#00ff9d" strokeWidth="3" />
          <text x="50" y="105" fill="#00ff9d" fontFamily="Rubik, sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle" style={{filter: 'drop-shadow(0 0 3px #00ff9d)'}}>ESTACIÓN</text>
        </svg>
      </div>

      <div className="neon-camper">
        <svg viewBox="0 0 100 50" width="90" height="45">
          <path d="M 10,40 L 10,15 Q 10,5 20,5 L 70,5 Q 85,5 90,20 L 95,40 Z" fill="rgba(0,255,157,0.1)" stroke="#00ff9d" strokeWidth="3" style={{filter: 'drop-shadow(0 0 4px #00ff9d)'}}/>
          <circle cx="25" cy="40" r="8" fill="#020208" stroke="#00ff9d" strokeWidth="2" />
          <circle cx="75" cy="40" r="8" fill="#020208" stroke="#00ff9d" strokeWidth="2" />
          <path d="M 60,12 L 80,12 L 85,22 L 60,22 Z" fill="none" stroke="#00f3ff" strokeWidth="2" style={{filter: 'drop-shadow(0 0 2px #00f3ff)'}}/>
          <path d="M 20,12 L 50,12 L 50,22 L 20,22 Z" fill="none" stroke="#00f3ff" strokeWidth="2" style={{filter: 'drop-shadow(0 0 2px #00f3ff)'}}/>
        </svg>
      </div>

      <div className="scanlines"></div>

      <div className="header-overlay">
        <h1 className="tron-title">NEON MAP 2026</h1>
        <p className="tron-subtitle">LA RUTA DEL FUTURO</p>
      </div>

      <div className="footer-overlay">
        <div className="tron-coupon-box">
            <div className="tron-coupon" onClick={handleCopyCode}>
                <span className="tron-coupon-label">CÓDIGO DESCUENTO</span>
                <span className="tron-coupon-code">TRON2026</span>
            </div>
            <div className="flex flex-col items-center justify-center">
                <div className="tron-countdown">
                    <div className="tron-cd-item"><span className="tron-cd-num">{timeLeft.days}</span><span className="tron-cd-label">Días</span></div>
                    <div className="tron-cd-item"><span className="tron-cd-num">{timeLeft.hours}</span><span className="tron-cd-label">Horas</span></div>
                    <div className="tron-cd-item"><span className="tron-cd-num">{timeLeft.mins}</span><span className="tron-cd-label">Min</span></div>
                    <div className="tron-cd-item"><span className="tron-cd-num">{timeLeft.secs}</span><span className="tron-cd-label">Seg</span></div>
                </div>
                <div className="tron-cta mt-3" onClick={handleCopyCode}>📋 COPIAR Y VIAJAR</div>
            </div>
        </div>
      </div>

      <div className={`copied-tooltip ${copied ? 'show' : ''}`}>✅ ¡Código TRON2026 copiado!</div>
    </div>
  );
}
