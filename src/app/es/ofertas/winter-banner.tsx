"use client";

import { useEffect, useRef, useState } from "react";
import { LocalizedLink } from "@/components/localized-link";
import { Check, Copy } from "lucide-react";

export function WinterBanner() {
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
      for (let i = 0; i < 150; i++) {
        const s = document.createElement('div');
        s.className = 'winter-star';
        const size = Math.random() * 2.5 + 0.5;
        const topPos = Math.random() * 100;
        s.style.width = size + 'px';
        s.style.height = size + 'px';
        s.style.top = topPos + '%';
        s.style.left = (Math.random() * 100) + '%';
        s.style.opacity = String(Math.random() * 0.7 + 0.3);
        s.style.setProperty('--dur', (Math.random() * 4 + 2) + 's');
        s.style.setProperty('--delay', (Math.random() * 5) + 's');
        s.style.setProperty('--min-o', String(Math.random() * 0.3 + 0.1));
        starsRef.current.appendChild(s);
      }
    }

    // Countdown for Winter
    const target = new Date('2026-01-05T00:00:00').getTime();
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

    // Snow canvas
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

    let animationFrame: number;
    const snowflakes: {x: number, y: number, r: number, vx: number, vy: number}[] = [];
    for(let i=0; i<150; i++) {
        snowflakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2.5 + 0.5,
            vx: Math.random() * 1 - 0.5,
            vy: Math.random() * 1 + 0.5
        });
    }

    const drawSnow = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      for(let i=0; i<snowflakes.length; i++) {
          const sf = snowflakes[i];
          ctx.moveTo(sf.x, sf.y);
          ctx.arc(sf.x, sf.y, sf.r, 0, Math.PI * 2, true);
          
          sf.y += sf.vy;
          sf.x += sf.vx;
          
          if(sf.y > canvas.height) {
              sf.y = -5;
              sf.x = Math.random() * canvas.width;
          }
          if(sf.x > canvas.width) sf.x = 0;
          if(sf.x < 0) sf.x = canvas.width;
      }
      ctx.fill();

      animationFrame = requestAnimationFrame(drawSnow);
    };
    drawSnow();

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText("INV2026");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="winter-banner-wrapper" className="font-amiko">
      <style dangerouslySetInnerHTML={{ __html: `
        #winter-banner-wrapper {
          --sky-dark: #060b19;
          --sky-mid: #101c3d;
          --sky-light: #1e3a5f;
          --ice-blue: #00d4ff;
          --snow-front: #ffffff;
          --snow-mid: #f1f5f9;
          --snow-back: #e2e8f0;
          --mountain-dark: #64748b;
          --mountain-light: #94a3b8;
          
          font-family: 'Amiko', sans-serif;
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background: linear-gradient(180deg,
            var(--sky-dark) 0%,
            var(--sky-mid) 40%,
            var(--sky-light) 75%,
            var(--snow-back) 100%
          );
        }

        #winter-banner-wrapper *, #winter-banner-wrapper *::before, #winter-banner-wrapper *::after {
          box-sizing: border-box;
        }

        .space-zone { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; }
        .stars-layer { position: absolute; inset: 0; }
        .winter-star { position: absolute; background: white; border-radius: 50%; animation: starTwinkle var(--dur, 3s) ease-in-out infinite var(--delay, 0s); }
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

        .moon { position: absolute; top: 8%; right: 15%; width: 80px; height: 80px; background: radial-gradient(circle at 35% 35%, #ffffff 0%, #e2e8f0 70%, #cbd5e1 100%); border-radius: 50%; box-shadow: 0 0 40px 10px rgba(255,255,255,0.3), 0 0 100px 30px rgba(255,255,255,0.1); z-index: 2; }
        .moon::before { content: ''; position: absolute; top: 20px; left: 15px; width: 12px; height: 12px; background: rgba(0,0,0,0.05); border-radius: 50%; box-shadow: 20px -8px 0 8px rgba(0,0,0,0.04), -5px 20px 0 5px rgba(0,0,0,0.03); }

        .aurora { position: absolute; top: 10%; left: 0; width: 100%; height: 50%; z-index: 1; filter: blur(30px); opacity: 0.6; mix-blend-mode: screen; pointer-events: none; }
        .aurora-1 { position: absolute; top: 0; left: 10%; width: 60%; height: 100%; background: radial-gradient(ellipse at 50% 50%, rgba(0, 255, 180, 0.3), transparent 60%); animation: auroraSway 12s ease-in-out infinite alternate; transform-origin: center; }
        .aurora-2 { position: absolute; top: 10%; right: 10%; width: 70%; height: 80%; background: radial-gradient(ellipse at 50% 50%, rgba(0, 180, 255, 0.3), transparent 60%); animation: auroraSway 18s ease-in-out infinite alternate-reverse; transform-origin: center; }
        @keyframes auroraSway { 0% { transform: scaleX(1) translateY(0) rotate(-5deg); opacity: 0.4; } 100% { transform: scaleX(1.2) translateY(-20px) rotate(5deg); opacity: 0.7; } }

        .mountain-range { position: absolute; bottom: 20%; left: 0; width: 100%; height: 40%; z-index: 2; pointer-events: none; }
        .mountain { position: absolute; bottom: 0; width: 0; height: 0; border-bottom: 300px solid var(--mountain-light); border-left: 200px solid transparent; border-right: 200px solid transparent; }
        .mountain-1 { left: -100px; border-bottom-color: var(--mountain-dark); border-bottom-width: 250px; border-left-width: 150px; border-right-width: 150px; }
        .mountain-2 { left: 15%; border-bottom-color: var(--mountain-light); border-bottom-width: 350px; z-index: 1; border-left-width: 250px; border-right-width: 250px; }
        .mountain-3 { right: 5%; border-bottom-color: #7d8ea3; border-bottom-width: 280px; }
        .mountain-4 { right: -100px; border-bottom-color: var(--mountain-dark); border-bottom-width: 200px; }
        .mountain::after { content: ''; position: absolute; top: 0; left: -60px; border-left: 60px solid transparent; border-right: 60px solid transparent; border-bottom: 80px solid rgba(255,255,255,0.8); }
        .mountain-2::after { left: -80px; border-left-width: 80px; border-right-width: 80px; border-bottom-width: 120px; }

        .snow-hills { position: absolute; bottom: 0; left: 0; width: 100%; height: 28%; z-index: 3; }
        .snow-hill { position: absolute; width: 150%; height: 100%; border-radius: 50%; }
        .snow-hill-1 { bottom: -20%; left: -25%; background: var(--snow-back); }
        .snow-hill-2 { bottom: -30%; right: -20%; background: var(--snow-mid); }
        .snow-hill-3 { bottom: -40%; left: -10%; background: var(--snow-front); width: 120%; }

        .pine-tree { position: absolute; z-index: 4; }
        .pine-tree-1 { bottom: 22%; left: 8%; }
        .pine-tree-2 { bottom: 25%; left: 15%; transform: scale(0.8); z-index: 3; }
        .pine-tree-3 { bottom: 18%; right: 12%; transform: scale(1.2); }
        .pine-tree-4 { bottom: 26%; right: 20%; transform: scale(0.7); z-index: 3; }
        .pine-trunk { width: 14px; height: 30px; background: #3e2723; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); border-radius: 2px; }
        .pine-layer { position: absolute; left: 50%; transform: translateX(-50%); border-left: 35px solid transparent; border-right: 35px solid transparent; border-bottom: 45px solid #1b4332; }
        .pine-layer-1 { bottom: 20px; border-bottom-width: 55px; border-left-width: 45px; border-right-width: 45px; }
        .pine-layer-2 { bottom: 50px; border-bottom-width: 45px; border-left-width: 35px; border-right-width: 35px; }
        .pine-layer-3 { bottom: 75px; border-bottom-width: 35px; border-left-width: 25px; border-right-width: 25px; }
        /* Snow on pines */
        .pine-layer::after { content: ''; position: absolute; top: 0; left: -15px; border-left: 15px solid transparent; border-right: 15px solid transparent; border-bottom: 15px solid rgba(255,255,255,0.9); transform: translateY(0px); }
        .pine-layer-1::after { left: -20px; border-left-width: 20px; border-right-width: 20px; border-bottom-width: 20px; }

        .snowman { position: absolute; bottom: 5%; left: 22%; z-index: 5; transform: scale(0.9); }
        .snowman-base { width: 60px; height: 60px; background: white; border-radius: 50%; box-shadow: inset -10px -10px 15px rgba(0,0,0,0.1); position: absolute; bottom: 0; left: 0; }
        .snowman-mid { width: 46px; height: 46px; background: white; border-radius: 50%; position: absolute; bottom: 45px; left: 7px; box-shadow: inset -8px -8px 12px rgba(0,0,0,0.1); }
        .snowman-head { width: 34px; height: 34px; background: white; border-radius: 50%; position: absolute; bottom: 80px; left: 13px; box-shadow: inset -6px -6px 10px rgba(0,0,0,0.1); }
        .snowman-eye { width: 4px; height: 4px; background: #1a1a1a; border-radius: 50%; position: absolute; top: 12px; }
        .snowman-eye-l { left: 10px; } .snowman-eye-r { right: 10px; }
        .snowman-nose { width: 0; height: 0; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 14px solid #f97316; position: absolute; top: 16px; left: 15px; transform: rotate(10deg); }
        .snowman-scarf { width: 42px; height: 10px; background: #ef4444; position: absolute; bottom: 76px; left: 9px; border-radius: 5px; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .snowman-scarf-tail { width: 10px; height: 25px; background: #ef4444; position: absolute; bottom: 55px; left: 32px; border-radius: 5px; z-index: 3; transform: rotate(-15deg); box-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
        .snowman-hat { width: 24px; height: 20px; background: #1f2937; position: absolute; bottom: 108px; left: 18px; border-radius: 2px 2px 0 0; }
        .snowman-hat-brim { width: 36px; height: 4px; background: #1f2937; position: absolute; bottom: 106px; left: 12px; border-radius: 2px; }

        /* PARKING LOT & SKI RESORT PROPS */
        .ski-resort-ground { position: absolute; bottom: 0; left: 0; width: 100%; height: 25%; background: linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%); z-index: 5; border-top: 4px solid #f1f5f9; box-shadow: inset 0 20px 20px -20px rgba(0,0,0,0.1); }
        .parking-line { position: absolute; bottom: 5%; width: 6px; height: 15%; background: rgba(255,255,255,0.8); transform: skewX(-45deg); box-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
        .parking-line-1 { left: 20%; } .parking-line-2 { left: 45%; } .parking-line-3 { left: 70%; } .parking-line-4 { left: 95%; }

        .chairlift-system { position: absolute; top: 15%; left: 0; width: 100%; height: 40%; z-index: 4; pointer-events: none; }
        .cable { position: absolute; top: 20%; left: -10%; width: 120%; height: 2px; background: #475569; transform: rotate(-8deg); }
        .chair { position: absolute; top: 20%; width: 30px; height: 40px; animation: chairMove 20s linear infinite; }
        .chair-pole { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 2px; height: 25px; background: #64748b; }
        .chair-seat { position: absolute; bottom: 0; left: 0; width: 30px; height: 15px; border: 2px solid #64748b; border-top: none; border-radius: 0 0 4px 4px; }
        .chair-bar { position: absolute; top: 25px; left: -2px; width: 34px; height: 2px; background: #94a3b8; }
        .chair-1 { left: 10%; animation-delay: 0s; }
        .chair-2 { left: 40%; animation-delay: -6s; }
        .chair-3 { left: 70%; animation-delay: -13s; }
        @keyframes chairMove { 0% { transform: translateX(100vw) translateY(5vh) rotate(-8deg); } 100% { transform: translateX(-20vw) translateY(22vh) rotate(-8deg); } }

        .cabin { position: absolute; bottom: 35%; right: 15%; width: 100px; height: 75px; background: #78350f; border-radius: 4px; z-index: 4; border: 2px solid #451a03; }
        .cabin-roof { position: absolute; top: -30px; left: -15px; width: 130px; height: 0; border-bottom: 35px solid #f1f5f9; border-left: 15px solid transparent; border-right: 15px solid transparent; border-radius: 4px; }
        .cabin-roof::after { content: ''; position: absolute; top: 30px; left: -10px; width: 120px; height: 6px; background: #e2e8f0; border-radius: 3px; }
        .cabin-door { position: absolute; bottom: 0; left: 20px; width: 25px; height: 45px; background: #451a03; border-radius: 2px 2px 0 0; }
        .cabin-door::after { content: ''; position: absolute; right: 4px; top: 20px; width: 4px; height: 4px; background: #fef08a; border-radius: 50%; }
        .cabin-window { position: absolute; top: 20px; right: 20px; width: 25px; height: 25px; background: #e0f2fe; border: 2px solid #94a3b8; box-shadow: inset 0 0 15px rgba(250,204,21,0.6); }
        .cabin-window::after { content: ''; position: absolute; top: 0; left: 11px; width: 2px; height: 100%; background: #94a3b8; }
        .cabin-window::before { content: ''; position: absolute; top: 11px; left: 0; width: 100%; height: 2px; background: #94a3b8; }
        .cabin-chimney { position: absolute; top: -45px; right: 25px; width: 12px; height: 25px; background: #475569; z-index: -1; }
        .cabin-smoke { position: absolute; top: -55px; right: 20px; width: 12px; height: 12px; background: rgba(255,255,255,0.7); border-radius: 50%; animation: smokeRise 4s ease-out infinite; }
        .cabin-smoke-2 { animation-delay: 1.3s; } .cabin-smoke-3 { animation-delay: 2.6s; }
        @keyframes smokeRise { 0% { transform: translateY(0) scale(1) translateX(0); opacity: 0.8; } 100% { transform: translateY(-40px) scale(4) translateX(15px); opacity: 0; } }
        
        .ski-rack { position: absolute; bottom: 30%; right: 35%; width: 50px; height: 50px; border: 4px solid #64748b; border-bottom: none; border-top: none; z-index: 4; }
        .ski-rack-bar { position: absolute; top: 15px; left: -10px; width: 70px; height: 4px; background: #64748b; border-radius: 2px; }
        .rack-ski { position: absolute; width: 6px; height: 60px; background: #ef4444; border-radius: 3px; transform: rotate(12deg); bottom: 0; box-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .rack-ski-1 { left: 5px; } .rack-ski-2 { left: 20px; background: #3b82f6; transform: rotate(-8deg); } .rack-ski-3 { left: 35px; background: #10b981; transform: rotate(5deg); }

        /* CAMPER REDESIGN & ENHANCED ANIMATION */
        .camper-scene { position: absolute; bottom: 12%; left: 60%; transform: translateX(-50%); z-index: 6; animation: camperIdle 4s ease-in-out infinite; }
        @keyframes camperIdle { 
            0%, 100% { transform: translateX(-50%) translateY(0) rotate(0deg); } 
            25% { transform: translateX(-50%) translateY(-2px) rotate(0.5deg); } 
            50% { transform: translateX(-50%) translateY(1px) rotate(0deg); } 
            75% { transform: translateX(-50%) translateY(-1px) rotate(-0.5deg); } 
        }
        
        .camper { position: relative; width: 280px; height: 130px; }
        .camper-body { position: absolute; bottom: 25px; left: 0; width: 100%; height: 95px; background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 45%, #cbd5e1 100%); border-radius: 20px 30px 8px 8px; border: 2px solid #64748b; overflow: hidden; box-shadow: inset -5px -5px 15px rgba(0,0,0,0.05), 5px 10px 20px rgba(0,0,0,0.15); }
        .camper-body::before { content: ''; position: absolute; top: 48px; left: -10%; width: 120%; height: 60px; background: linear-gradient(9deg, #0ea5e9 0%, #38bdf8 100%); border-top: 3px solid white; border-radius: 50% 50% 0 0 / 20px 20px 0 0; }
        .camper-body::after { content: ''; position: absolute; top: 43px; left: 0; width: 100%; height: 4px; background: #0284c7; }
        
        .camper-roof { position: absolute; top: -2px; left: 20px; width: 190px; height: 12px; background: #f8fafc; border-radius: 8px; border: 2px solid #94a3b8; box-shadow: inset 0 -3px 5px rgba(0,0,0,0.05); }
        .camper-popup { position: absolute; top: -30px; left: 40px; width: 140px; height: 30px; background: repeating-linear-gradient(90deg, #e2e8f0 0px, #e2e8f0 10px, #cbd5e1 10px, #cbd5e1 12px); border: 2px solid #94a3b8; border-radius: 8px 8px 0 0; border-bottom: none; transform: skewX(-5deg); z-index: -1; }
        
        .camper-window { position: absolute; background: linear-gradient(135deg, #1e293b, #0f172a); border: 2px solid #64748b; border-radius: 6px; overflow: hidden; }
        .camper-window::after { content: ''; position: absolute; top: 0; left: -20px; width: 30px; height: 100%; background: rgba(255,255,255,0.15); transform: skewX(-20deg); animation: glassShine 4s infinite; }
        @keyframes glassShine { 0% { left: -30px; } 20%, 100% { left: 100%; } }
        .camper-window-front { right: 12px; top: 12px; width: 60px; height: 32px; border-radius: 6px 16px 6px 6px; } .camper-window-side1 { left: 25px; top: 12px; width: 50px; height: 28px; } .camper-window-side2 { left: 85px; top: 12px; width: 50px; height: 28px; }
        
        .camper-door { position: absolute; left: 145px; top: 10px; width: 38px; height: 80px; border: 2px solid #94a3b8; border-radius: 4px; border-bottom: none; z-index: 2; }
        .camper-door::after { content: ''; position: absolute; right: 4px; top: 50%; width: 6px; height: 12px; background: #64748b; border-radius: 3px; transform: translateY(-50%); box-shadow: inset 1px 1px 2px rgba(255,255,255,0.5); }
        
        .camper-bumper-front { position: absolute; right: -4px; bottom: 20px; width: 15px; height: 18px; background: linear-gradient(180deg, #94a3b8, #64748b); border-radius: 0 6px 6px 0; border: 2px solid #475569; border-left: none; }
        .camper-bumper-rear { position: absolute; left: -4px; bottom: 20px; width: 15px; height: 18px; background: linear-gradient(180deg, #94a3b8, #64748b); border-radius: 6px 0 0 6px; border: 2px solid #475569; border-right: none; }
        
        .camper-headlight { position: absolute; right: -2px; top: 52px; width: 10px; height: 16px; background: radial-gradient(circle, #fff, #fef08a); border-radius: 0 4px 4px 0; border: 1px solid #eab308; box-shadow: 0 0 20px 5px rgba(250,204,21,0.6); }
        .camper-taillight { position: absolute; left: -2px; top: 50px; width: 6px; height: 18px; background: #ef4444; border-radius: 2px 0 0 2px; border: 1px solid #991b1b; box-shadow: 0 0 10px rgba(239,68,68,0.5); }
        
        .wheel { position: absolute; bottom: 0; width: 48px; height: 48px; background: #0f172a; border-radius: 50%; border: 4px solid #020617; box-shadow: inset 0 0 10px rgba(0,0,0,0.8), 2px 5px 10px rgba(0,0,0,0.3); z-index: 3; }
        .wheel::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 26px; height: 26px; background: repeating-conic-gradient(#94a3b8 0deg 30deg, #64748b 30deg 60deg); border-radius: 50%; border: 2px solid #cbd5e1; }
        .wheel::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 10px; height: 10px; background: #020617; border-radius: 50%; border: 2px solid #94a3b8; }
        .wheel-front { right: 35px; } .wheel-rear { left: 40px; }
        
        .wheel-arch { position: absolute; bottom: 23px; width: 62px; height: 38px; background: transparent; border: 4px solid #94a3b8; border-bottom: none; border-radius: 30px 30px 0 0; z-index: 1; }
        .wheel-arch-front { right: 28px; } .wheel-arch-rear { left: 33px; }
        
        .camper-mirror { position: absolute; right: 8px; top: 35px; width: 8px; height: 16px; background: #94a3b8; border: 1px solid #64748b; border-radius: 3px; z-index: 3; }
        .camper-mirror::before { content: ''; position: absolute; left: -6px; top: 6px; width: 6px; height: 3px; background: #0f172a; }

        /* Skis on roof */
        .skis { position: absolute; top: -14px; left: 40px; width: 130px; height: 8px; z-index: 2; transform: rotate(-2deg); }
        .ski { width: 100%; height: 4px; background: #ef4444; border-radius: 4px 12px 12px 4px; position: absolute; box-shadow: inset 0 2px 2px rgba(255,255,255,0.4); border: 1px solid #991b1b; }
        .ski::before { content: ''; position: absolute; right: -5px; top: -3px; width: 12px; height: 4px; background: #ef4444; border-radius: 50%; transform: rotate(30deg); border: 1px solid #991b1b; border-bottom: none; }
        .ski-1 { top: 0; } .ski-2 { top: 4px; background: #b91c1c; } .ski-2::before { background: #b91c1c; }
        /* Ski rack mounts */
        .skis::after { content: ''; position: absolute; left: 20px; bottom: -8px; width: 8px; height: 8px; background: #64748b; box-shadow: 70px 0 0 #64748b; }

        #snowCanvas { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 7; pointer-events: none; }

        .sb-content { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; text-align: center; padding: 0 20px; }
        .sb-logo-tag { font-family: 'Rubik', sans-serif; font-weight: 800; font-size: 0.95rem; color: white; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 6px 22px; border-radius: 30px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 10px; animation: fadeSlideDown 1s ease-out; border: 1px solid rgba(255,255,255,0.2); }
        .sb-main-title { font-family: 'Rubik', sans-serif; font-weight: 900; font-size: clamp(2.8rem, 8vw, 5.5rem); color: white; text-shadow: 3px 3px 0 var(--ice-blue), 6px 6px 0 rgba(0,0,0,0.3); line-height: 1.05; animation: fadeSlideDown 1s ease-out 0.2s both; }
        .sb-main-title span { display: block; font-family: 'Amiko', sans-serif; font-weight: 700; font-size: 0.38em; text-shadow: 2px 2px 0 rgba(0,0,0,0.4); margin-top: 6px; letter-spacing: 2px; }
        .sb-subtitle { font-family: 'Amiko', sans-serif; font-weight: 600; font-size: clamp(0.9rem, 2.2vw, 1.3rem); color: #e0f2fe; margin-top: 10px; text-shadow: 1px 1px 3px rgba(0,0,0,0.5); animation: fadeSlideDown 1s ease-out 0.4s both; }
        
        .sb-coupon-section { margin-top: 22px; animation: fadeSlideDown 1s ease-out 0.6s both; display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .sb-code-pill { display: inline-flex; align-items: center; gap: 0; border-radius: 60px; overflow: hidden; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s; box-shadow: 0 6px 30px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); }
        .sb-code-pill:hover { transform: scale(1.05); box-shadow: 0 10px 45px rgba(0,212,255,0.5); }
        .sb-code-pill:active { transform: scale(0.97); }
        .sb-code-pill-label { background: rgba(255,255,255,0.15); backdrop-filter: blur(12px); padding: 14px 22px; font-family: 'Rubik', sans-serif; font-weight: 700; font-size: 0.85rem; color: white; text-transform: uppercase; letter-spacing: 2px; white-space: nowrap; }
        .sb-code-pill-code { background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 14px 28px; font-family: 'Rubik', sans-serif; font-weight: 900; font-size: 1.6rem; color: white; letter-spacing: 5px; white-space: nowrap; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        
        .sb-discount-headline { font-family: 'Rubik', sans-serif; font-weight: 900; font-size: clamp(1.6rem, 4vw, 2.4rem); color: #38bdf8; text-transform: uppercase; text-shadow: 2px 2px 0 rgba(0,0,0,0.5), 0 0 30px rgba(56,189,248,0.4); letter-spacing: 2px; animation: fadeSlideDown 1s ease-out 0.8s both; }
        .sb-validity-line { font-family: 'Amiko', sans-serif; font-weight: 600; font-size: 0.85rem; color: #bae6fd; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); animation: fadeSlideDown 1s ease-out 0.9s both; }
        
        .sb-tap-cta { display: inline-flex; align-items: center; gap: 6px; font-family: 'Rubik', sans-serif; font-weight: 700; font-size: 0.9rem; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 8px 20px; border-radius: 30px; border: 1.5px solid rgba(255,255,255,0.4); cursor: pointer; transition: all 0.3s; animation: fadeSlideDown 1s ease-out 1s both, ctaPulseWinter 2s ease-in-out infinite 2s; }
        .sb-tap-cta:hover { background: rgba(255,255,255,0.3); border-color: rgba(255,255,255,0.8); transform: translateY(-2px); }
        @keyframes ctaPulseWinter { 0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.3); } 50% { box-shadow: 0 0 0 8px rgba(255,255,255,0); } }

        .sb-countdown-section { margin-top: 18px; animation: fadeSlideDown 1s ease-out 0.8s both; }
        .sb-countdown-title { font-family: 'Amiko', sans-serif; font-weight: 600; font-size: 0.75rem; color: #7dd3fc; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 8px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); }
        .sb-countdown-bar { display: flex; gap: 10px; justify-content: center; }
        .sb-countdown-item { display: flex; flex-direction: column; align-items: center; background: rgba(0,0,0,0.4); backdrop-filter: blur(10px); border-radius: 12px; padding: 8px 14px; min-width: 58px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 6px rgba(0,0,0,0.2); }
        .sb-countdown-number { font-family: 'Rubik', sans-serif; font-weight: 700; font-size: 1.5rem; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
        .sb-countdown-label { font-family: 'Amiko', sans-serif; font-size: 0.6rem; color: #bae6fd; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }

        .sb-floating-emoji { position: absolute; font-size: 2rem; z-index: 8; animation: floatUp 8s ease-in-out infinite; opacity: 0.8; text-shadow: 0 4px 8px rgba(0,0,0,0.2); }
        .sb-floating-emoji:nth-child(1) { left: 8%; top: 45%; animation-delay: 0s; font-size: 1.8rem; }
        .sb-floating-emoji:nth-child(2) { right: 10%; top: 40%; animation-delay: 2s; font-size: 2.2rem; }
        .sb-floating-emoji:nth-child(3) { left: 15%; top: 60%; animation-delay: 4s; font-size: 1.5rem; }
        .sb-floating-emoji:nth-child(4) { right: 15%; top: 58%; animation-delay: 1s; font-size: 1.6rem; }
        .sb-floating-emoji:nth-child(5) { left: 5%; top: 52%; animation-delay: 3s; font-size: 2rem; }
        @keyframes floatUp { 0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.7; } 25% { transform: translateY(-15px) rotate(5deg); opacity: 0.9; } 50% { transform: translateY(-25px) rotate(-3deg); opacity: 0.6; } 75% { transform: translateY(-10px) rotate(2deg); opacity: 0.8; } }

        @keyframes fadeSlideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }

        .copied-tooltip { position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-100px); background: rgba(255,255,255,0.95); color: #0284c7; font-family: 'Rubik', sans-serif; font-weight: 700; padding: 12px 28px; border-radius: 30px; z-index: 100; transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); pointer-events: none; font-size: 0.95rem; letter-spacing: 1px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .copied-tooltip.show { transform: translateX(-50%) translateY(0); }

        @media (max-width: 768px) {
          .pine-tree-1 { left: -2%; } .pine-tree-3 { right: -2%; }
          .camper { transform: scale(0.65); }
          .sb-code-pill { flex-direction: column; border-radius: 20px; }
          .sb-code-pill-label { padding: 10px 20px; font-size: 0.75rem; } .sb-code-pill-code { padding: 10px 24px; font-size: 1.3rem; }
          .sb-countdown-item { min-width: 48px; padding: 6px 10px; } .sb-countdown-number { font-size: 1.2rem; }
          .sb-floating-emoji { display: none; }
          .chairlift-system, .cabin { display: none; }
        }
        @media (max-width: 480px) {
          .pine-tree, .snowman, .ski-rack { display: none; }
          .sb-code-pill-code { font-size: 1.1rem; letter-spacing: 3px; } .sb-discount-headline { font-size: 1.3rem; }
          .mountain-range { opacity: 0.5; }
        }
      `}} />

      <div className="space-zone">
        <div className="stars-layer" ref={starsRef}></div>
        <div className="moon"></div>
        <div className="aurora">
            <div className="aurora-1"></div>
            <div className="aurora-2"></div>
        </div>
        <div className="shooting-star"></div><div className="shooting-star shooting-star-2"></div>
      </div>

      <div className="mountain-range">
        <div className="mountain mountain-1"></div>
        <div className="mountain mountain-2"></div>
        <div className="mountain mountain-3"></div>
        <div className="mountain mountain-4"></div>
      </div>
      
      <div className="ski-resort-ground">
        <div className="parking-line parking-line-1"></div>
        <div className="parking-line parking-line-2"></div>
        <div className="parking-line parking-line-3"></div>
        <div className="parking-line parking-line-4"></div>
      </div>

      <div className="chairlift-system">
        <div className="cable"></div>
        <div className="chair chair-1"><div className="chair-pole"></div><div className="chair-seat"></div><div className="chair-bar"></div></div>
        <div className="chair chair-2"><div className="chair-pole"></div><div className="chair-seat"></div><div className="chair-bar"></div></div>
        <div className="chair chair-3"><div className="chair-pole"></div><div className="chair-seat"></div><div className="chair-bar"></div></div>
      </div>

      <div className="cabin">
        <div className="cabin-roof"></div>
        <div className="cabin-door"></div>
        <div className="cabin-window"></div>
        <div className="cabin-smoke cabin-smoke-1"></div>
        <div className="cabin-smoke cabin-smoke-2"></div>
        <div className="cabin-smoke cabin-smoke-3"></div>
      </div>

      <div className="ski-rack">
        <div className="ski-rack-bar"></div>
        <div className="rack-ski rack-ski-1"></div>
        <div className="rack-ski rack-ski-2"></div>
        <div className="rack-ski rack-ski-3"></div>
      </div>

      <div className="snow-hills">
        <div className="snow-hill snow-hill-1"></div>
        <div className="snow-hill snow-hill-2"></div>
        <div className="snow-hill snow-hill-3"></div>
      </div>

      <div className="pine-tree pine-tree-1"><div className="pine-trunk"></div><div className="pine-layer pine-layer-1"></div><div className="pine-layer pine-layer-2"></div><div className="pine-layer pine-layer-3"></div></div>
      <div className="pine-tree pine-tree-2"><div className="pine-trunk"></div><div className="pine-layer pine-layer-1"></div><div className="pine-layer pine-layer-2"></div><div className="pine-layer pine-layer-3"></div></div>
      <div className="pine-tree pine-tree-3"><div className="pine-trunk"></div><div className="pine-layer pine-layer-1"></div><div className="pine-layer pine-layer-2"></div><div className="pine-layer pine-layer-3"></div></div>
      <div className="pine-tree pine-tree-4"><div className="pine-trunk"></div><div className="pine-layer pine-layer-1"></div><div className="pine-layer pine-layer-2"></div><div className="pine-layer pine-layer-3"></div></div>

      <div className="ski-resort-ground">
        <div className="parking-line parking-line-1"></div>
        <div className="parking-line parking-line-2"></div>
        <div className="parking-line parking-line-3"></div>
        <div className="parking-line parking-line-4"></div>
      </div>

      <div className="chairlift-system">
        <div className="cable"></div>
        <div className="chair chair-1"><div className="chair-pole"></div><div className="chair-seat"></div><div className="chair-bar"></div></div>
        <div className="chair chair-2"><div className="chair-pole"></div><div className="chair-seat"></div><div className="chair-bar"></div></div>
        <div className="chair chair-3"><div className="chair-pole"></div><div className="chair-seat"></div><div className="chair-bar"></div></div>
      </div>

      <div className="cabin">
        <div className="cabin-chimney"></div>
        <div className="cabin-roof"></div>
        <div className="cabin-door"></div>
        <div className="cabin-window"></div>
        <div className="cabin-smoke cabin-smoke-1"></div>
        <div className="cabin-smoke cabin-smoke-2"></div>
        <div className="cabin-smoke cabin-smoke-3"></div>
      </div>

      <div className="ski-rack">
        <div className="ski-rack-bar"></div>
        <div className="rack-ski rack-ski-1"></div>
        <div className="rack-ski rack-ski-2"></div>
        <div className="rack-ski rack-ski-3"></div>
      </div>

      <div className="camper-scene">
        <div className="camper">
            <div className="camper-popup"></div>
            <div className="camper-roof"></div>
            <div className="skis"><div className="ski ski-1"></div><div className="ski ski-2"></div></div>
            <div className="camper-body">
                <div className="camper-window camper-window-front"></div>
                <div className="camper-window camper-window-side1"></div>
                <div className="camper-window camper-window-side2"></div>
                <div className="camper-door"></div>
            </div>
            <div className="wheel-arch wheel-arch-front"></div>
            <div className="wheel-arch wheel-arch-rear"></div>
            <div className="camper-bumper-front"></div>
            <div className="camper-bumper-rear"></div>
            <div className="camper-mirror"></div>
            <div className="camper-headlight"></div>
            <div className="camper-taillight"></div>
            <div className="wheel wheel-front"></div>
            <div className="wheel wheel-rear"></div>
        </div>
      </div>

      <div className="snowman">
        <div className="snowman-base"></div>
        <div className="snowman-mid"></div>
        <div className="snowman-head">
            <div className="snowman-eye snowman-eye-l"></div>
            <div className="snowman-eye snowman-eye-r"></div>
            <div className="snowman-nose"></div>
        </div>
        <div className="snowman-scarf"></div>
        <div className="snowman-scarf-tail"></div>
        <div className="snowman-hat"></div>
        <div className="snowman-hat-brim"></div>
      </div>

      <div className="sb-floating-emoji">❄️</div><div className="sb-floating-emoji">⛄</div><div className="sb-floating-emoji">🏔️</div><div className="sb-floating-emoji">🏂</div><div className="sb-floating-emoji">☕</div>

      <canvas id="snowCanvas" ref={canvasRef}></canvas>

      <div className="sb-content">
        <div className="sb-logo-tag">Furgocasa</div>
        <h1 className="sb-main-title">INVIERNO 2026<span>¡Aventura sobre ruedas en la nieve!</span></h1>
        <p className="sb-subtitle">Equipadas con calefacción estacionaria premium</p>

        <div className="sb-coupon-section">
          <div className="sb-code-pill" onClick={handleCopyCode}>
            <div className="sb-code-pill-label">Código descuento</div>
            <div className="sb-code-pill-code">INV2026</div>
          </div>
          <div className="sb-discount-headline">Hasta −20% en tu alquiler</div>
          <div className="sb-validity-line">Válido del 5 de enero al 20 de marzo de 2026</div>
          <div className="sb-tap-cta" onClick={handleCopyCode}>📋 Copiar código</div>
        </div>

        <div className="sb-countdown-section">
          <div className="sb-countdown-title">La promoción termina en</div>
          <div className="sb-countdown-bar">
            <div className="sb-countdown-item"><span className="sb-countdown-number">{timeLeft.days}</span><span className="sb-countdown-label">Días</span></div>
            <div className="sb-countdown-item"><span className="sb-countdown-number">{timeLeft.hours}</span><span className="sb-countdown-label">Horas</span></div>
            <div className="sb-countdown-item"><span className="sb-countdown-number">{timeLeft.mins}</span><span className="sb-countdown-label">Min</span></div>
            <div className="sb-countdown-item"><span className="sb-countdown-number">{timeLeft.secs}</span><span className="sb-countdown-label">Seg</span></div>
          </div>
        </div>
      </div>

      <div className={`copied-tooltip ${copied ? 'show' : ''}`}>✅ ¡Código INV2026 copiado!</div>
    </div>
  );
}
