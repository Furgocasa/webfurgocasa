"use client";

import { useEffect, useRef, useState } from "react";
import { LocalizedLink } from "@/components/localized-link";
import { Check, Copy } from "lucide-react";

export function SummerBanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState({
    days: '--',
    hours: '--',
    mins: '--',
    secs: '--'
  });

  useEffect(() => {
    // Generate stars
    if (starsRef.current && starsRef.current.children.length === 0) {
      for (let i = 0; i < 100; i++) {
        const s = document.createElement('div');
        s.className = 'summer-star';
        const size = Math.random() * 2.5 + 0.5;
        const topPos = Math.random() * 85;
        s.style.width = size + 'px';
        s.style.height = size + 'px';
        s.style.top = topPos + '%';
        s.style.left = (Math.random() * 100) + '%';
        s.style.opacity = String(topPos > 60 ? (1 - (topPos - 60) / 25) * 0.6 : 0.6);
        s.style.setProperty('--dur', (Math.random() * 4 + 2) + 's');
        s.style.setProperty('--delay', (Math.random() * 5) + 's');
        s.style.setProperty('--min-o', String(Math.random() * 0.3 + 0.1));
        starsRef.current.appendChild(s);
      }
    }

    // Countdown
    const target = new Date('2026-06-01T00:00:00').getTime();
    const updateCountdown = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: '🎉', hours: '00', mins: '00', secs: '00' });
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

    // Wave canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;
    let animationFrame: number;

    const drawWaves = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const w = canvas.width, h = canvas.height;

      // Wave 1 - back
      ctx.beginPath(); ctx.moveTo(0,h);
      for (let x=0;x<=w;x+=3) {
        ctx.lineTo(x, h*0.5+Math.sin(x*0.008+time*0.8)*18+Math.sin(x*0.015+time*1.2)*8+Math.sin(x*0.003+time*0.5)*10);
      }
      ctx.lineTo(w,h); ctx.closePath();
      ctx.fillStyle='rgba(8,146,208,0.4)'; ctx.fill();

      // Wave 2 - mid
      ctx.beginPath(); ctx.moveTo(0,h);
      for (let x=0;x<=w;x+=3) {
        ctx.lineTo(x, h*0.6+Math.sin(x*0.01+time+1)*15+Math.sin(x*0.02+time*1.5)*7+Math.cos(x*0.005+time*0.7)*9);
      }
      ctx.lineTo(w,h); ctx.closePath();
      ctx.fillStyle='rgba(72,201,232,0.4)'; ctx.fill();

      // Wave 3 - front
      ctx.beginPath(); ctx.moveTo(0,h);
      for (let x=0;x<=w;x+=3) {
        ctx.lineTo(x, h*0.75+Math.sin(x*0.012+time*1.3+2)*12+Math.sin(x*0.025+time*1.8)*6+Math.cos(x*0.006+time*0.9)*8);
      }
      ctx.lineTo(w,h); ctx.closePath();
      ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fill();

      // Foam dots
      for (let i=0;i<30;i++) {
        const fx=(i*67+time*20)%w;
        const fy=h*0.75+Math.sin(fx*0.012+time*1.3+2)*12+Math.sin(fx*0.025+time*1.8)*6+Math.sin(i*3+time*2)*3;
        const r=1.5+Math.sin(i*7+time*3)*0.8;
        ctx.beginPath(); ctx.arc(fx,fy,r,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,255,${0.3+Math.sin(i+time)*0.15})`; ctx.fill();
      }

      time+=0.035;
      animationFrame = requestAnimationFrame(drawWaves);
    };
    drawWaves();

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText("EARLY2026");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="summer-banner-wrapper" className="font-amiko">
      <style dangerouslySetInnerHTML={{ __html: `
        #summer-banner-wrapper {
          --sky-top: #0a9cf5;
          --sky-bottom: #87CEEB;
          --sand: #f4d9a0;
          --sand-dark: #e8c676;
          --ocean-deep: #006994;
          --ocean-mid: #0892d0;
          --ocean-light: #48c9e8;
          --sunset-orange: #FF6B35;
          --sunset-pink: #FF3864;
          --space-dark: #050a18;
          --space-mid: #0b1530;
          
          font-family: 'Amiko', sans-serif;
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background: linear-gradient(180deg,
            #050a18 0%, #080e22 3%, #0b1530 6%, #0e1c3e 9%,
            #12254e 12%, #183060 15%, #1f3e74 17%, #274e8a 19%,
            #3060a0 21%, #3e74b4 23%, #5690cc 25%, #6ca4d8 26.5%,
            #87CEEB 30%, #87CEEB 48%, var(--ocean-light) 58%,
            var(--sand) 72%, var(--sand-dark) 100%
          );
        }

        #summer-banner-wrapper *, #summer-banner-wrapper *::before, #summer-banner-wrapper *::after {
          box-sizing: border-box;
        }

        .space-zone { position: absolute; top: 0; left: 0; width: 100%; height: 22%; z-index: 1; overflow: hidden; }
        .stars-layer { position: absolute; inset: 0; }
        .summer-star { position: absolute; background: white; border-radius: 50%; animation: starTwinkle var(--dur, 3s) ease-in-out infinite var(--delay, 0s); }
        @keyframes starTwinkle { 0%,100% { opacity: var(--min-o, 0.3); transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }

        .shooting-star {
          position: absolute; width: 3px; height: 3px; background: white; border-radius: 50%;
          top: 8%; left: -5%; box-shadow: 0 0 6px 2px rgba(255,255,255,0.6);
          animation: shootStar 6s linear infinite 3s;
        }
        .shooting-star::after {
          content: ''; position: absolute; top: 0; right: 3px; width: 60px; height: 1.5px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7)); transform-origin: right center;
        }
        .shooting-star-2 { top: 15%; animation: shootStar 8s linear infinite 7s; }
        @keyframes shootStar { 0% { transform: translate(0, 0) rotate(-15deg); opacity: 0; } 5% { opacity: 1; } 30% { opacity: 1; } 35% { transform: translate(105vw, 8vh) rotate(-15deg); opacity: 0; } 100% { opacity: 0; } }

        .moon { position: absolute; top: 4%; left: 10%; width: 50px; height: 50px; background: radial-gradient(circle at 35% 35%, #f5f0d0 0%, #e8e0b0 50%, #d4c88a 100%); border-radius: 50%; box-shadow: 0 0 30px 8px rgba(245,240,208,0.2), 0 0 80px 20px rgba(245,240,208,0.08); z-index: 2; }
        .moon::before { content: ''; position: absolute; top: 15px; left: 12px; width: 8px; height: 8px; background: rgba(0,0,0,0.08); border-radius: 50%; box-shadow: 14px -5px 0 5px rgba(0,0,0,0.06), -2px 12px 0 3px rgba(0,0,0,0.05); }

        .satellite { position: absolute; top: 12%; right: 20%; z-index: 2; animation: satelliteOrbit 30s linear infinite; }
        @keyframes satelliteOrbit { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(40px, -15px) rotate(5deg); } 50% { transform: translate(80px, 0) rotate(0deg); } 75% { transform: translate(40px, 15px) rotate(-5deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
        .satellite-body { width: 10px; height: 6px; background: linear-gradient(180deg, #ccc, #888); border-radius: 2px; position: relative; }
        .satellite-body::before, .satellite-body::after { content: ''; position: absolute; top: -2px; width: 18px; height: 10px; background: linear-gradient(135deg, #1a3a6a 0%, #2855a0 40%, #1a3a6a 60%, #4488cc 100%); border: 1px solid #4488cc; border-radius: 1px; }
        .satellite-body::before { right: 100%; margin-right: 2px; } .satellite-body::after { left: 100%; margin-left: 2px; }
        .satellite-signal { position: absolute; top: -4px; left: 50%; width: 3px; height: 3px; background: red; border-radius: 50%; transform: translateX(-50%); animation: signalBlink 2s ease-in-out infinite; }
        @keyframes signalBlink { 0%,45%,55%,100% { opacity: 0; } 50% { opacity: 1; box-shadow: 0 0 4px 1px red; } }

        .ufo { position: absolute; top: 0; left: 50%; z-index: 15; animation: ufoAction 30s ease-in-out infinite; transform-origin: center bottom; }
        @keyframes ufoAction {
            0%, 33% { transform: translate(25vw, 10vh) scale(calc(var(--ufo-scale, 1) * 0.8)) rotate(-5deg); opacity: 1; }
            40% { transform: translate(0, 42vh) scale(calc(var(--ufo-scale, 1) * 1.5)) rotate(0deg); opacity: 1; }
            56% { transform: translate(0, 42vh) scale(calc(var(--ufo-scale, 1) * 1.5)) rotate(2deg); opacity: 1; }
            63% { transform: translate(-30vw, -20vh) scale(calc(var(--ufo-scale, 1) * 0.5)) rotate(15deg); opacity: 1; }
            64%, 95% { transform: translate(-30vw, -20vh) scale(0); opacity: 0; }
            98%, 100% { transform: translate(25vw, 10vh) scale(calc(var(--ufo-scale, 1) * 0.8)) rotate(-5deg); opacity: 1; }
        }
        .ufo-dome { width: 40px; height: 25px; background: radial-gradient(ellipse at 50% 80%, rgba(150,220,255,0.9), rgba(100,200,255,0.4)); border-radius: 50% 50% 0 0; margin: 0 auto; border: 1px solid rgba(150,220,255,0.6); box-shadow: inset 0 2px 8px rgba(255,255,255,0.9); position: relative; z-index: 2; }
        .ufo-body { width: 90px; height: 22px; background: linear-gradient(180deg, #f8fafc 0%, #94a3b8 40%, #334155 100%); border-radius: 50%; position: relative; left: 50%; transform: translateX(-50%); margin-top: -6px; box-shadow: 0 8px 20px rgba(0,0,0,0.6), inset 0 3px 4px rgba(255,255,255,0.8); border: 1px solid #1e293b; z-index: 1; }
        .ufo-lights { position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; }
        .ufo-light { width: 6px; height: 6px; border-radius: 50%; animation: ufoLights 1s ease-in-out infinite; }
        .ufo-light:nth-child(1) { background: #ef4444; animation-delay: 0s; } .ufo-light:nth-child(2) { background: #22c55e; animation-delay: 0.2s; } .ufo-light:nth-child(3) { background: #3b82f6; animation-delay: 0.4s; } .ufo-light:nth-child(4) { background: #eab308; animation-delay: 0.6s; } .ufo-light:nth-child(5) { background: #d946ef; animation-delay: 0.8s; }
        @keyframes ufoLights { 0%,100% { opacity: 0.4; box-shadow: none; } 50% { opacity: 1; box-shadow: 0 0 12px 4px currentColor; } }
        .ufo-beam { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 400px; height: 450px; background: linear-gradient(180deg, rgba(150,255,200,0.9) 0%, rgba(150,255,200,0.4) 60%, transparent 100%); clip-path: polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%); animation: beamAction 30s linear infinite; z-index: -1; pointer-events: none; }
        @keyframes beamAction { 0%, 43% { opacity: 0; } 45%, 55% { opacity: 1; } 57%, 100% { opacity: 0; } }

        .rocket { position: absolute; top: 18%; left: 25%; z-index: 2; animation: rocketFly 20s linear infinite; transform: rotate(-35deg); }
        @keyframes rocketFly { 0% { transform: translate(0,0) rotate(-35deg); } 100% { transform: translate(-60vw, -30vh) rotate(-35deg); } }
        .rocket-body { width: 8px; height: 22px; background: linear-gradient(180deg, #ff4444 0%, #fff 30%, #fff 70%, #ccc 100%); border-radius: 4px 4px 2px 2px; position: relative; }
        .rocket-body::before { content: ''; position: absolute; top: -5px; left: 50%; transform: translateX(-50%); border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 8px solid #ff4444; }
        .rocket-flame { width: 6px; height: 14px; background: linear-gradient(180deg, #FFA500 0%, #FF4500 40%, transparent 100%); border-radius: 0 0 3px 3px; margin: 0 auto; animation: flameFlicker 0.15s ease-in-out infinite alternate; filter: blur(0.5px); }
        @keyframes flameFlicker { 0% { height: 12px; opacity: 0.9; } 100% { height: 16px; opacity: 1; } }

        .planet { position: absolute; top: 8%; right: 8%; width: 24px; height: 24px; background: radial-gradient(circle at 35% 35%, #c49b6a, #8b6842 60%, #5a3d25 100%); border-radius: 50%; z-index: 2; }
        .planet::after { content: ''; position: absolute; top: 50%; left: 50%; width: 40px; height: 10px; border: 1.5px solid rgba(196,155,106,0.4); border-radius: 50%; transform: translate(-50%, -50%) rotate(-20deg); }

        .constellation { position: absolute; top: 3%; left: 45%; z-index: 1; }
        .const-line { position: absolute; height: 1px; background: rgba(255,255,255,0.1); transform-origin: left center; }
        .const-dot { position: absolute; width: 3px; height: 3px; background: white; border-radius: 50%; opacity: 0.6; box-shadow: 0 0 3px 1px rgba(255,255,255,0.3); }

        .sun { position: absolute; top: 30%; right: 15%; width: 100px; height: 100px; background: radial-gradient(circle, #FFD700 0%, #FFA500 60%, transparent 70%); border-radius: 50%; box-shadow: 0 0 80px 30px rgba(255,200,0,0.4), 0 0 200px 60px rgba(255,165,0,0.15); animation: sunPulse 4s ease-in-out infinite; z-index: 2; }
        @keyframes sunPulse { 0%,100% { box-shadow: 0 0 80px 30px rgba(255,200,0,0.4), 0 0 200px 60px rgba(255,165,0,0.15); } 50% { box-shadow: 0 0 100px 40px rgba(255,200,0,0.5), 0 0 250px 80px rgba(255,165,0,0.2); } }

        .cloud { position: absolute; background: white; border-radius: 50px; opacity: 0.85; filter: blur(1px); z-index: 2; }
        .cloud::before, .cloud::after { content: ''; position: absolute; background: white; border-radius: 50%; }
        .cloud-1 { width: 120px; height: 40px; top: 34%; left: -150px; animation: cloudDrift 25s linear infinite; }
        .cloud-1::before { width: 60px; height: 60px; top: -30px; left: 20px; } .cloud-1::after { width: 45px; height: 45px; top: -20px; left: 55px; }
        .cloud-2 { width: 90px; height: 30px; top: 38%; left: -100px; animation: cloudDrift 35s linear infinite 8s; opacity: 0.6; }
        .cloud-2::before { width: 45px; height: 45px; top: -22px; left: 15px; } .cloud-2::after { width: 35px; height: 35px; top: -15px; left: 42px; }
        .cloud-3 { width: 140px; height: 45px; top: 31%; left: -180px; animation: cloudDrift 30s linear infinite 15s; opacity: 0.7; }
        .cloud-3::before { width: 70px; height: 70px; top: -35px; left: 25px; } .cloud-3::after { width: 50px; height: 50px; top: -25px; left: 70px; }
        @keyframes cloudDrift { from { transform: translateX(0); } to { transform: translateX(calc(100vw + 300px)); } }

        .birds { position: absolute; top: 36%; left: 20%; animation: birdsFly 18s linear infinite; z-index: 3; }
        .bird { position: absolute; width: 0; height: 0; }
        .bird::before, .bird::after { content: ''; position: absolute; background: #333; width: 14px; height: 2px; border-radius: 50%; transform-origin: right center; }
        .bird::before { transform: rotate(-25deg); } .bird::after { left: 12px; transform-origin: left center; transform: rotate(25deg); }
        .bird:nth-child(1) { top: 0; left: 0; } .bird:nth-child(2) { top: 8px; left: 25px; animation: birdFlap 0.8s ease-in-out infinite; } .bird:nth-child(3) { top: -5px; left: 50px; animation: birdFlap 0.9s ease-in-out infinite 0.3s; } .bird:nth-child(4) { top: 12px; left: 70px; animation: birdFlap 0.7s ease-in-out infinite 0.5s; }
        @keyframes birdsFly { from { transform: translate(0,0); } to { transform: translate(60vw, -5vh); } }
        @keyframes birdFlap { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(-1); } }

        .ocean { position: absolute; bottom: 28%; left: 0; width: 100%; height: 22%; z-index: 2; }
        .wave { position: absolute; width: 200%; height: 100%; bottom: 0; left: -50%; }
        .wave-back { background: radial-gradient(ellipse 120px 18px at 60px 50%, var(--ocean-deep) 0%, transparent 100%) repeat-x, linear-gradient(180deg, transparent 0%, var(--ocean-deep) 30%); background-size: 200px 100%, 100% 100%; animation: waveMove 7s ease-in-out infinite; opacity: 0.7; }
        .wave-mid { background: radial-gradient(ellipse 140px 20px at 70px 45%, var(--ocean-mid) 0%, transparent 100%) repeat-x, linear-gradient(180deg, transparent 10%, var(--ocean-mid) 40%); background-size: 180px 100%, 100% 100%; animation: waveMove 5s ease-in-out infinite reverse; bottom: -5%; }
        .wave-front { background: radial-gradient(ellipse 160px 22px at 80px 40%, var(--ocean-light) 0%, transparent 100%) repeat-x, linear-gradient(180deg, transparent 15%, var(--ocean-light) 50%); background-size: 160px 100%, 100% 100%; animation: waveMove 4s ease-in-out infinite; bottom: -10%; }
        @keyframes waveMove { 0%,100% { transform: translateX(0); } 50% { transform: translateX(80px); } }

        #waveCanvas { position: absolute; bottom: 25%; left: 0; width: 100%; height: 12%; z-index: 3; pointer-events: none; }

        .shore { position: absolute; bottom: 26%; left: 0; width: 100%; height: 10%; z-index: 3; }
        .shore-wave { position: absolute; bottom: 0; left: -5%; width: 110%; height: 100%; }
        .shore-wave-1 { background: linear-gradient(180deg, transparent 0%, rgba(72,201,232,0.3) 30%, rgba(72,201,232,0.5) 50%, rgba(72,201,232,0.2) 80%, transparent 100%); animation: shoreWash 6s ease-in-out infinite; transform-origin: bottom center; }
        .shore-wave-2 { background: linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.2) 70%, transparent 100%); animation: shoreWash 6s ease-in-out infinite 1.5s; transform-origin: bottom center; }
        .shore-wave-3 { background: linear-gradient(180deg, transparent 0%, rgba(72,201,232,0.15) 30%, rgba(255,255,255,0.3) 50%, transparent 100%); animation: shoreWash 6s ease-in-out infinite 3s; }
        .foam-line { position: absolute; bottom: 0; left: 0; width: 100%; height: 8px; background: repeating-linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.6) 20px, rgba(255,255,255,0.9) 40px, rgba(255,255,255,0.6) 60px, transparent 80px); filter: blur(2px); animation: foamSlide 4s linear infinite, shoreWash 6s ease-in-out infinite; }
        @keyframes shoreWash { 0% { transform: translateY(100%) scaleY(0.3); opacity: 0; } 15% { opacity: 1; } 40% { transform: translateY(-30%) scaleY(1); opacity: 0.9; } 60% { transform: translateY(-20%) scaleY(0.9); opacity: 0.7; } 80% { transform: translateY(50%) scaleY(0.5); opacity: 0.3; } 100% { transform: translateY(100%) scaleY(0.2); opacity: 0; } }
        @keyframes foamSlide { from { background-position: 0 0; } to { background-position: 80px 0; } }

        .wet-sand { position: absolute; bottom: 22%; left: 0; width: 100%; height: 7%; background: linear-gradient(180deg, #d4b876 0%, #c9a85c 40%, var(--sand) 100%); z-index: 2; }
        .wet-sand::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 40%; background: linear-gradient(180deg, rgba(72,201,232,0.15), transparent); animation: wetShimmer 6s ease-in-out infinite; }
        @keyframes wetShimmer { 0%,100% { opacity: 0.3; } 50% { opacity: 0.8; } }

        .sand-area { position: absolute; bottom: 0; left: 0; width: 100%; height: 24%; background: linear-gradient(180deg, var(--sand) 0%, var(--sand-dark) 60%, #d4a948 100%); z-index: 4; }
        .sand-area::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(1px 1px at 10% 20%, rgba(0,0,0,0.08) 50%, transparent 50%), radial-gradient(1px 1px at 30% 50%, rgba(0,0,0,0.06) 50%, transparent 50%), radial-gradient(1px 1px at 50% 30%, rgba(0,0,0,0.07) 50%, transparent 50%), radial-gradient(1px 1px at 70% 60%, rgba(0,0,0,0.05) 50%, transparent 50%), radial-gradient(1px 1px at 90% 40%, rgba(0,0,0,0.08) 50%, transparent 50%); background-size: 40px 40px; }

        .palm-tree { position: absolute; z-index: 5; }
        .palm-tree-1 { bottom: 22%; left: 3%; }
        .palm-tree-2 { bottom: 22%; right: 5%; transform: scaleX(-1); }
        .palm-trunk { width: 14px; height: 180px; background: linear-gradient(90deg, #6B4226 0%, #8B5E3C 40%, #A0704B 60%, #7A4E30 100%); border-radius: 8px 8px 12px 12px; transform: rotate(-5deg); transform-origin: bottom center; position: relative; }
        .palm-tree-2 .palm-trunk { transform: rotate(5deg); height: 160px; }
        .palm-trunk::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent 0px, rgba(0,0,0,0.1) 8px, transparent 10px); border-radius: inherit; }
        .palm-leaves { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); }
        .palm-leaf { position: absolute; width: 120px; height: 20px; background: linear-gradient(90deg, #2d8a2d, #45a845 40%, #228B22); border-radius: 0 80% 80% 0 / 0 50% 50% 0; transform-origin: left center; animation: palmSway 4s ease-in-out infinite; }
        .palm-leaf::after { content: ''; position: absolute; top: 50%; left: 10%; width: 80%; height: 1px; background: rgba(0,0,0,0.15); }
        .palm-leaf:nth-child(1) { --rot: -30deg; transform: rotate(-30deg); animation-delay: 0s; } .palm-leaf:nth-child(2) { --rot: -60deg; transform: rotate(-60deg); animation-delay: 0.3s; } .palm-leaf:nth-child(3) { --rot: -90deg; transform: rotate(-90deg); animation-delay: 0.6s; } .palm-leaf:nth-child(4) { --rot: -120deg; transform: rotate(-120deg); animation-delay: 0.1s; } .palm-leaf:nth-child(5) { --rot: -150deg; transform: rotate(-150deg); animation-delay: 0.5s; } .palm-leaf:nth-child(6) { --rot: 0deg; transform: rotate(0deg); animation-delay: 0.2s; } .palm-leaf:nth-child(7) { --rot: -180deg; transform: rotate(-180deg); animation-delay: 0.4s; }
        @keyframes palmSway { 0%,100% { transform: rotate(var(--rot, -30deg)); } 50% { transform: rotate(calc(var(--rot, -30deg) + 8deg)); } }

        /* CAMPER REDESIGN & ENHANCED ANIMATION */
        .camper-scene { position: absolute; bottom: 23%; left: 50%; transform: translateX(-50%); z-index: 6; animation: camperIdle 4s ease-in-out infinite; }
        @keyframes camperIdle { 
            0%, 100% { transform: translateX(-50%) translateY(0) rotate(0deg); } 
            25% { transform: translateX(-50%) translateY(-2px) rotate(0.5deg); } 
            50% { transform: translateX(-50%) translateY(1px) rotate(0deg); } 
            75% { transform: translateX(-50%) translateY(-1px) rotate(-0.5deg); } 
        }
        
        .camper { position: relative; width: 280px; height: 130px; animation: camperAbduction 30s ease-in-out infinite; }
        @keyframes camperAbduction {
            0%, 44% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; filter: brightness(1); }
            48% { transform: translate(0, -30px) scale(0.9) rotate(3deg); opacity: 1; filter: brightness(1.3) drop-shadow(0 -10px 20px rgba(150,255,200,0.8)); }
            52% { transform: translate(0, -120px) scale(0.5) rotate(-5deg); opacity: 0.8; filter: brightness(1.6) drop-shadow(0 -20px 40px rgba(150,255,200,0.9)); }
            56% { transform: translate(0, -250px) scale(0); opacity: 0; filter: brightness(2); }
            72% { transform: translate(-100vw, 0) scale(1); opacity: 0; }
            73% { transform: translate(-100vw, 0) scale(1); opacity: 1; filter: brightness(1); }
            85%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
        }
        .camper-body { position: absolute; bottom: 25px; left: 0; width: 100%; height: 95px; background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 45%, #e2e8f0 100%); border-radius: 20px 30px 8px 8px; border: 2px solid #94a3b8; overflow: hidden; box-shadow: inset -5px -5px 15px rgba(0,0,0,0.05), 5px 10px 20px rgba(0,0,0,0.15); }
        .camper-body::before { content: ''; position: absolute; top: 48px; left: -10%; width: 120%; height: 60px; background: linear-gradient(9deg, var(--sunset-orange) 0%, #ff8a5c 100%); border-top: 3px solid white; border-radius: 50% 50% 0 0 / 20px 20px 0 0; }
        .camper-body::after { content: ''; position: absolute; top: 43px; left: 0; width: 100%; height: 4px; background: var(--sunset-pink); }
        
        .camper-roof { position: absolute; top: -2px; left: 20px; width: 190px; height: 12px; background: #f8fafc; border-radius: 8px; border: 2px solid #cbd5e1; box-shadow: inset 0 -3px 5px rgba(0,0,0,0.05); }
        .camper-popup { position: absolute; top: -30px; left: 40px; width: 140px; height: 30px; background: repeating-linear-gradient(90deg, #f1f5f9 0px, #f1f5f9 10px, #e2e8f0 10px, #e2e8f0 12px); border: 2px solid #cbd5e1; border-radius: 8px 8px 0 0; border-bottom: none; transform: skewX(-5deg); z-index: -1; }
        
        .camper-window { position: absolute; background: linear-gradient(135deg, #1e293b, #0f172a); border: 2px solid #94a3b8; border-radius: 6px; overflow: hidden; }
        .camper-window::after { content: ''; position: absolute; top: 0; left: -20px; width: 30px; height: 100%; background: rgba(255,255,255,0.15); transform: skewX(-20deg); animation: glassShine 4s infinite; }
        @keyframes glassShine { 0% { left: -30px; } 20%, 100% { left: 100%; } }
        .camper-window-front { right: 12px; top: 12px; width: 60px; height: 32px; border-radius: 6px 16px 6px 6px; } .camper-window-side1 { left: 25px; top: 12px; width: 50px; height: 28px; } .camper-window-side2 { left: 85px; top: 12px; width: 50px; height: 28px; }
        
        .camper-door { position: absolute; left: 145px; top: 10px; width: 38px; height: 80px; border: 2px solid #cbd5e1; border-radius: 4px; border-bottom: none; z-index: 2; }
        .camper-door::after { content: ''; position: absolute; right: 4px; top: 50%; width: 6px; height: 12px; background: #94a3b8; border-radius: 3px; transform: translateY(-50%); box-shadow: inset 1px 1px 2px rgba(255,255,255,0.5); }
        
        .camper-bumper-front { position: absolute; right: -4px; bottom: 20px; width: 15px; height: 18px; background: linear-gradient(180deg, #e2e8f0, #94a3b8); border-radius: 0 6px 6px 0; border: 2px solid #94a3b8; border-left: none; }
        .camper-bumper-rear { position: absolute; left: -4px; bottom: 20px; width: 15px; height: 18px; background: linear-gradient(180deg, #e2e8f0, #94a3b8); border-radius: 6px 0 0 6px; border: 2px solid #94a3b8; border-right: none; }
        
        .camper-headlight { position: absolute; right: -2px; top: 52px; width: 10px; height: 16px; background: radial-gradient(circle, #fff, #fef08a); border-radius: 0 4px 4px 0; border: 1px solid #eab308; box-shadow: 0 0 20px 5px rgba(250,204,21,0.6); }
        .camper-taillight { position: absolute; left: -2px; top: 50px; width: 6px; height: 18px; background: #ef4444; border-radius: 2px 0 0 2px; border: 1px solid #991b1b; box-shadow: 0 0 10px rgba(239,68,68,0.5); }
        
        .wheel { position: absolute; bottom: 0; width: 48px; height: 48px; background: #1e293b; border-radius: 50%; border: 4px solid #0f172a; box-shadow: inset 0 0 10px rgba(0,0,0,0.8), 2px 5px 10px rgba(0,0,0,0.3); z-index: 3; }
        .wheel::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 26px; height: 26px; background: repeating-conic-gradient(#cbd5e1 0deg 30deg, #94a3b8 30deg 60deg); border-radius: 50%; border: 2px solid #e2e8f0; animation: wheelSpin 10s linear infinite; }
        .wheel::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 10px; height: 10px; background: #0f172a; border-radius: 50%; border: 2px solid #94a3b8; }
        @keyframes wheelSpin { 100% { transform: translate(-50%, -50%) rotate(360deg); } }
        .wheel-front { right: 35px; } .wheel-rear { left: 40px; }
        
        .wheel-arch { position: absolute; bottom: 23px; width: 62px; height: 38px; background: transparent; border: 4px solid #cbd5e1; border-bottom: none; border-radius: 30px 30px 0 0; z-index: 1; }
        .wheel-arch-front { right: 28px; } .wheel-arch-rear { left: 33px; }
        
        .camper-awning { position: absolute; top: 8px; left: 15px; width: 200px; height: 10px; background: linear-gradient(180deg, #fff, #cbd5e1); border-radius: 4px; border: 1px solid #94a3b8; z-index: 2; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .camper-surfboard { position: absolute; top: -14px; left: 50px; width: 120px; height: 12px; background: linear-gradient(90deg, #fbbf24, #f59e0b); border-radius: 10px 20px 20px 10px; transform: rotate(-2deg); border: 1px solid #b45309; z-index: 3; box-shadow: inset 0 2px 4px rgba(255,255,255,0.4); }
        .camper-surfboard::after { content: ''; position: absolute; top: 0; left: 25px; width: 70px; height: 10px; border-left: 3px solid #334155; border-right: 3px solid #334155; }
        
        .camper-mirror { position: absolute; right: 8px; top: 35px; width: 8px; height: 16px; background: #cbd5e1; border: 1px solid #94a3b8; border-radius: 3px; z-index: 3; }
        .camper-mirror::before { content: ''; position: absolute; left: -6px; top: 6px; width: 6px; height: 3px; background: #0f172a; }

        .umbrella { position: absolute; bottom: 2%; left: 22%; z-index: 5; }
        .umbrella-pole { width: 4px; height: 130px; background: linear-gradient(90deg, #d4a94e, #c69538); margin: 0 auto; }
        .umbrella-top { width: 140px; height: 70px; background: conic-gradient(var(--sunset-orange) 0deg, var(--sunset-orange) 45deg, #fff 45deg, #fff 90deg, var(--sunset-orange) 90deg, var(--sunset-orange) 135deg, #fff 135deg, #fff 180deg); border-radius: 140px 140px 0 0; position: relative; left: 50%; transform: translateX(-50%) rotate(-5deg); }
        .towel { position: absolute; bottom: 3%; left: 17%; width: 100px; height: 20px; background: repeating-linear-gradient(90deg, #FF6B35 0px, #FF6B35 12px, #fff 12px, #fff 24px); border-radius: 3px; transform: perspective(200px) rotateX(40deg) rotate(-8deg); z-index: 5; }
        .shell { position: absolute; z-index: 5; font-size: 18px; opacity: 0.7; }
        .shell-1 { bottom: 6%; left: 40%; transform: rotate(30deg); } .shell-2 { bottom: 4%; left: 60%; transform: rotate(-15deg); font-size: 14px; } .shell-3 { bottom: 8%; left: 75%; transform: rotate(45deg); font-size: 22px; }
        .starfish { position: absolute; bottom: 5%; right: 35%; font-size: 28px; z-index: 5; animation: starSpin 20s linear infinite; opacity: 0.8; }
        @keyframes starSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .flipflop { position: absolute; bottom: 10%; right: 28%; font-size: 26px; z-index: 5; transform: rotate(-20deg); }

        .sb-content { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; text-align: center; padding: 0 20px; }
        .sb-logo-tag { font-family: 'Rubik', sans-serif; font-weight: 800; font-size: 0.95rem; color: white; background: rgba(0,0,0,0.2); backdrop-filter: blur(10px); padding: 6px 22px; border-radius: 30px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 10px; animation: fadeSlideDown 1s ease-out; }
        .sb-main-title { font-family: 'Rubik', sans-serif; font-weight: 900; font-size: clamp(2.8rem, 8vw, 5.5rem); color: white; text-shadow: 3px 3px 0 var(--sunset-orange), 6px 6px 0 rgba(0,0,0,0.15); line-height: 1.05; animation: fadeSlideDown 1s ease-out 0.2s both; }
        .sb-main-title span { display: block; font-family: 'Amiko', sans-serif; font-weight: 700; font-size: 0.38em; text-shadow: 2px 2px 0 rgba(0,0,0,0.2); margin-top: 6px; letter-spacing: 2px; }
        .sb-subtitle { font-family: 'Amiko', sans-serif; font-weight: 600; font-size: clamp(0.9rem, 2.2vw, 1.3rem); color: white; margin-top: 10px; text-shadow: 1px 1px 3px rgba(0,0,0,0.3); animation: fadeSlideDown 1s ease-out 0.4s both; }
        .sb-coupon-section { margin-top: 22px; animation: fadeSlideDown 1s ease-out 0.6s both; display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .sb-code-pill { display: inline-flex; align-items: center; gap: 0; border-radius: 60px; overflow: hidden; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s; box-shadow: 0 6px 30px rgba(0,0,0,0.25); }
        .sb-code-pill:hover { transform: scale(1.05); box-shadow: 0 10px 45px rgba(255,107,53,0.4); }
        .sb-code-pill:active { transform: scale(0.97); }
        .sb-code-pill-label { background: rgba(255,255,255,0.2); backdrop-filter: blur(12px); padding: 14px 22px; font-family: 'Rubik', sans-serif; font-weight: 700; font-size: 0.85rem; color: white; text-transform: uppercase; letter-spacing: 2px; white-space: nowrap; }
        .sb-code-pill-code { background: linear-gradient(135deg, var(--sunset-orange), var(--sunset-pink)); padding: 14px 28px; font-family: 'Rubik', sans-serif; font-weight: 900; font-size: 1.6rem; color: white; letter-spacing: 5px; white-space: nowrap; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .sb-discount-headline { font-family: 'Rubik', sans-serif; font-weight: 900; font-size: clamp(1.6rem, 4vw, 2.4rem); color: #FFD700; text-transform: uppercase; text-shadow: 2px 2px 0 rgba(0,0,0,0.3), 0 0 30px rgba(255,215,0,0.3); letter-spacing: 2px; animation: fadeSlideDown 1s ease-out 0.8s both; }
        .sb-validity-line { font-family: 'Amiko', sans-serif; font-weight: 600; font-size: 0.85rem; color: #ff3333; text-shadow: 1px 1px 0 white, 0 0 8px rgba(255,255,255,0.5); animation: fadeSlideDown 1s ease-out 0.9s both; }
        .sb-tap-cta { display: inline-flex; align-items: center; gap: 6px; font-family: 'Rubik', sans-serif; font-weight: 700; font-size: 0.9rem; color: #ff3333; text-shadow: 1px 1px 0 white, 0 0 8px rgba(255,255,255,0.5); background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 8px 20px; border-radius: 30px; border: 1.5px solid rgba(255,255,255,0.3); cursor: pointer; transition: all 0.3s; animation: fadeSlideDown 1s ease-out 1s both, ctaPulse 2s ease-in-out infinite 2s; }
        .sb-tap-cta:hover { background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.5); transform: translateY(-2px); }
        @keyframes ctaPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.2); } 50% { box-shadow: 0 0 0 8px rgba(255,255,255,0); } }

        .sb-countdown-section { margin-top: 18px; animation: fadeSlideDown 1s ease-out 0.8s both; }
        .sb-countdown-title { font-family: 'Amiko', sans-serif; font-weight: 600; font-size: 0.75rem; color: #ff3333; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 8px; text-shadow: 1px 1px 0 white, 0 0 8px rgba(255,255,255,0.5); }
        .sb-countdown-bar { display: flex; gap: 10px; justify-content: center; }
        .sb-countdown-item { display: flex; flex-direction: column; align-items: center; background: rgba(0,0,0,0.2); backdrop-filter: blur(10px); border-radius: 12px; padding: 8px 14px; min-width: 58px; border: 1px solid rgba(255,255,255,0.12); }
        .sb-countdown-number { font-family: 'Rubik', sans-serif; font-weight: 700; font-size: 1.5rem; color: white; }
        .sb-countdown-label { font-family: 'Amiko', sans-serif; font-size: 0.6rem; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }

        .sb-floating-emoji { position: absolute; font-size: 2rem; z-index: 8; animation: floatUp 8s ease-in-out infinite; opacity: 0.6; }
        .sb-floating-emoji:nth-child(1) { left: 8%; top: 45%; animation-delay: 0s; font-size: 1.8rem; }
        .sb-floating-emoji:nth-child(2) { right: 10%; top: 40%; animation-delay: 2s; font-size: 2.2rem; }
        .sb-floating-emoji:nth-child(3) { left: 15%; top: 60%; animation-delay: 4s; font-size: 1.5rem; }
        .sb-floating-emoji:nth-child(4) { right: 15%; top: 58%; animation-delay: 1s; font-size: 1.6rem; }
        .sb-floating-emoji:nth-child(5) { left: 5%; top: 52%; animation-delay: 3s; font-size: 2rem; }
        @keyframes floatUp { 0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.6; } 25% { transform: translateY(-15px) rotate(5deg); opacity: 0.8; } 50% { transform: translateY(-25px) rotate(-3deg); opacity: 0.5; } 75% { transform: translateY(-10px) rotate(2deg); opacity: 0.7; } }

        .sparkle { position: absolute; width: 4px; height: 4px; background: #FFD700; border-radius: 50%; z-index: 8; animation: sparkle 2s ease-in-out infinite; }
        .sparkle::before, .sparkle::after { content: ''; position: absolute; background: #FFD700; }
        .sparkle::before { width: 12px; height: 2px; top: 1px; left: -4px; border-radius: 1px; }
        .sparkle::after { width: 2px; height: 12px; top: -4px; left: 1px; border-radius: 1px; }
        .sparkle:nth-child(1) { top: 38%; left: 30%; animation-delay: 0s; } .sparkle:nth-child(2) { top: 42%; right: 25%; animation-delay: 0.7s; } .sparkle:nth-child(3) { top: 35%; left: 55%; animation-delay: 1.4s; }
        @keyframes sparkle { 0%,100% { opacity: 0; transform: scale(0) rotate(0deg); } 50% { opacity: 1; transform: scale(1) rotate(45deg); } }

        @keyframes fadeSlideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }

        .copied-tooltip { position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-100px); background: rgba(0,0,0,0.85); color: #FFD700; font-family: 'Rubik', sans-serif; font-weight: 700; padding: 12px 28px; border-radius: 30px; z-index: 100; transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); pointer-events: none; font-size: 0.95rem; letter-spacing: 1px; }
        .copied-tooltip.show { transform: translateX(-50%) translateY(0); }

        @media (max-width: 768px) {
          #summer-banner-wrapper { --ufo-scale: 0.7; }
          .palm-tree-1 { left: -2%; } .palm-tree-2 { right: -2%; }
          .camper { transform: scale(0.75); } .umbrella { left: 12%; } .towel { left: 8%; }
          .sb-code-pill { flex-direction: column; border-radius: 20px; }
          .sb-code-pill-label { padding: 10px 20px; font-size: 0.75rem; } .sb-code-pill-code { padding: 10px 24px; font-size: 1.3rem; }
          .sb-countdown-item { min-width: 48px; padding: 6px 10px; } .sb-countdown-number { font-size: 1.2rem; }
          .sb-floating-emoji { display: none; } .rocket { transform: scale(0.7); }
        }
        @media (max-width: 480px) {
          .palm-tree, .umbrella, .towel, .flipflop { display: none; }
          .sb-code-pill-code { font-size: 1.1rem; letter-spacing: 3px; } .sb-discount-headline { font-size: 1.3rem; }
          .satellite, .rocket, .constellation { display: none; }
        }
      `}} />

      <div className="space-zone">
        <div className="stars-layer" ref={starsRef}></div>
        <div className="moon"></div>
        <div className="planet"></div>
        <div className="satellite"><div className="satellite-signal"></div><div className="satellite-body"></div></div>
        <div className="rocket"><div className="rocket-body"></div><div className="rocket-flame"></div></div>
        <div className="constellation">
          <svg width="120" height="40" style={{position:'absolute',top:'-15px',left:'-5px',overflow:'visible'}}>
            <line x1="2" y1="17" x2="27" y2="5" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <line x1="27" y1="5" x2="57" y2="22" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <line x1="57" y1="22" x2="82" y2="9" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <line x1="82" y1="9" x2="107" y2="27" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          </svg>
          <div className="const-dot" style={{top:0,left:0}}></div><div className="const-dot" style={{top:'-12px',left:'25px'}}></div><div className="const-dot" style={{top:'5px',left:'55px'}}></div><div className="const-dot" style={{top:'-8px',left:'80px'}}></div><div className="const-dot" style={{top:'10px',left:'105px'}}></div>
        </div>
        <div className="shooting-star"></div><div className="shooting-star shooting-star-2"></div>
      </div>

      <div className="sun"></div>
      <div className="cloud cloud-1"></div><div className="cloud cloud-2"></div><div className="cloud cloud-3"></div>
      
      <div className="birds"><div className="bird"></div><div className="bird"></div><div className="bird"></div><div className="bird"></div></div>
      <div className="sparkle"></div><div className="sparkle"></div><div className="sparkle"></div>
      
      <div className="sb-floating-emoji">🌊</div><div className="sb-floating-emoji">☀️</div><div className="sb-floating-emoji">🏖️</div><div className="sb-floating-emoji">🐚</div><div className="sb-floating-emoji">🌴</div>

      <div className="ocean"><div className="wave wave-back"></div><div className="wave wave-mid"></div><div className="wave wave-front"></div></div>
      <canvas id="waveCanvas" ref={canvasRef}></canvas>
      
      <div className="shore"><div className="shore-wave shore-wave-1"></div><div className="shore-wave shore-wave-2"></div><div className="shore-wave shore-wave-3"></div><div className="foam-line"></div></div>
      <div className="wet-sand"></div><div className="sand-area"></div>

      <div className="palm-tree palm-tree-1"><div className="palm-trunk"><div className="palm-leaves"><div className="palm-leaf"></div><div className="palm-leaf"></div><div className="palm-leaf"></div><div className="palm-leaf"></div><div className="palm-leaf"></div><div className="palm-leaf"></div><div className="palm-leaf"></div></div></div></div>
      <div className="palm-tree palm-tree-2"><div className="palm-trunk"><div className="palm-leaves"><div className="palm-leaf"></div><div className="palm-leaf"></div><div className="palm-leaf"></div><div className="palm-leaf"></div><div className="palm-leaf"></div><div className="palm-leaf"></div><div className="palm-leaf"></div></div></div></div>

      <div className="ufo"><div className="ufo-dome"></div><div className="ufo-body"><div className="ufo-lights"><div className="ufo-light"></div><div className="ufo-light"></div><div className="ufo-light"></div><div className="ufo-light"></div><div className="ufo-light"></div></div></div><div className="ufo-beam"></div></div>

      <div className="camper-scene">
        <div className="camper">
          <div className="camper-popup"></div>
          <div className="camper-roof"></div>
          <div className="camper-awning"></div>
          <div className="camper-surfboard"></div>
          <div className="camper-body">
            <div className="camper-window camper-window-front"></div>
            <div className="camper-window camper-window-side1"></div>
            <div className="camper-window camper-window-side2"></div>
            <div className="camper-door"></div>
            <div className="camper-headlight"></div>
            <div className="camper-taillight"></div>
            <div className="camper-mirror"></div>
          </div>
          <div className="wheel-arch wheel-arch-front"></div>
          <div className="wheel-arch wheel-arch-rear"></div>
          <div className="camper-bumper-front"></div>
          <div className="camper-bumper-rear"></div>
          <div className="wheel wheel-front"></div>
          <div className="wheel wheel-rear"></div>
        </div>
      </div>

      <div className="umbrella"><div className="umbrella-top"></div><div className="umbrella-pole"></div></div>
      <div className="towel"></div>
      <div className="shell shell-1">🐚</div><div className="shell shell-2">🐚</div><div className="shell shell-3">🦪</div>
      <div className="starfish">⭐</div><div className="flipflop">🩴</div>

      <div className="sb-content">
        <div className="sb-logo-tag">Furgocasa</div>
        <h1 className="sb-main-title">VERANO 2026<span>¡Reserva ya tu camper al mejor precio!</span></h1>
        <p className="sb-subtitle">Adelántate al verano desde Murcia</p>

        <div className="sb-coupon-section">
          <div className="sb-code-pill" onClick={handleCopyCode}>
            <div className="sb-code-pill-label">Código descuento</div>
            <div className="sb-code-pill-code">EARLY2026</div>
          </div>
          <div className="sb-discount-headline">Hasta −20% en tu reserva</div>
          <div className="sb-validity-line">Alquileres de junio a septiembre 2026</div>
          <div className="sb-tap-cta" onClick={handleCopyCode}>📋 Copiar código</div>
        </div>

        <div className="sb-countdown-section">
          <div className="sb-countdown-title">El verano empieza en</div>
          <div className="sb-countdown-bar">
            <div className="sb-countdown-item"><span className="sb-countdown-number">{timeLeft.days}</span><span className="sb-countdown-label">Días</span></div>
            <div className="sb-countdown-item"><span className="sb-countdown-number">{timeLeft.hours}</span><span className="sb-countdown-label">Horas</span></div>
            <div className="sb-countdown-item"><span className="sb-countdown-number">{timeLeft.mins}</span><span className="sb-countdown-label">Min</span></div>
            <div className="sb-countdown-item"><span className="sb-countdown-number">{timeLeft.secs}</span><span className="sb-countdown-label">Seg</span></div>
          </div>
        </div>
      </div>

      <div className={`copied-tooltip ${copied ? 'show' : ''}`}>✅ ¡Código EARLY2026 copiado!</div>
    </div>
  );
}
