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
        .pine-tree-2 { bottom: 28%; left: 2%; transform: scale(0.6); z-index: 3; }
        .pine-tree-3 { bottom: 18%; right: 5%; transform: scale(1.1); }
        .pine-tree-4 { bottom: 26%; right: -2%; transform: scale(0.7); z-index: 3; }
        .pine-trunk { width: 14px; height: 30px; background: #3e2723; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); border-radius: 2px; }
        .pine-layer { position: absolute; left: 50%; transform: translateX(-50%); border-left: 35px solid transparent; border-right: 35px solid transparent; border-bottom: 45px solid #1b4332; }
        .pine-layer-1 { bottom: 20px; border-bottom-width: 55px; border-left-width: 45px; border-right-width: 45px; }
        .pine-layer-2 { bottom: 50px; border-bottom-width: 45px; border-left-width: 35px; border-right-width: 35px; }
        .pine-layer-3 { bottom: 75px; border-bottom-width: 35px; border-left-width: 25px; border-right-width: 25px; }
        /* Snow on pines */
        .pine-layer::after { content: ''; position: absolute; top: 0; left: -15px; border-left: 15px solid transparent; border-right: 15px solid transparent; border-bottom: 15px solid rgba(255,255,255,0.9); transform: translateY(0px); }
        .pine-layer-1::after { left: -20px; border-left-width: 20px; border-right-width: 20px; border-bottom-width: 20px; }

        .snowman { position: absolute; bottom: 8%; left: 8%; z-index: 5; transform: scale(0.8); }
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
        
        .parking-sign { position: absolute; bottom: 26%; left: 15%; width: 30px; height: 30px; background: #3b82f6; border: 2px solid white; border-radius: 4px; z-index: 4; display: flex; align-items: center; justify-content: center; font-family: 'Rubik', sans-serif; font-weight: 800; color: white; font-size: 1.2rem; transform: rotate(-5deg); }
        .parking-sign::after { content: ''; position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); width: 4px; height: 20px; background: #94a3b8; }

        /* Skier */
        .skier { position: absolute; z-index: 4; animation: skiDown 15s linear infinite; }
        @keyframes skiDown { 0% { transform: translate(-20vw, 40vh) scale(0.5); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translate(120vw, 10vh) scale(1.5); opacity: 0; } }
        .skier-body { width: 15px; height: 25px; background: #ef4444; border-radius: 8px 8px 0 0; position: relative; transform: rotate(15deg); }
        .skier-head { position: absolute; top: -12px; left: 2px; width: 12px; height: 12px; background: #fca5a5; border-radius: 50%; }
        .skier-head::after { content: ''; position: absolute; top: -4px; left: -2px; width: 16px; height: 8px; background: #1e293b; border-radius: 4px 4px 0 0; }
        .skier-leg { position: absolute; bottom: -10px; width: 5px; height: 15px; background: #1e293b; border-radius: 2px; }
        .skier-leg-1 { left: 2px; transform: rotate(-10deg); } .skier-leg-2 { right: 2px; transform: rotate(10deg); }
        .skier-ski { position: absolute; bottom: -12px; width: 35px; height: 3px; background: #f1f5f9; border-radius: 2px; transform: rotate(-15deg); box-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .skier-ski-1 { left: -10px; } .skier-ski-2 { left: -5px; bottom: -14px; }
        .skier-pole { position: absolute; top: 10px; width: 2px; height: 30px; background: #94a3b8; transform: rotate(-45deg); }
        .skier-pole-1 { left: -5px; } .skier-pole-2 { right: -5px; }

        /* Bonfire */
        .bonfire { position: absolute; bottom: 15%; left: 25%; z-index: 5; }
        .logs { position: absolute; bottom: 0; left: -15px; width: 30px; height: 10px; background: #78350f; border-radius: 5px; transform: rotate(-10deg); }
        .logs::after { content: ''; position: absolute; bottom: 0; left: 5px; width: 30px; height: 10px; background: #451a03; border-radius: 5px; transform: rotate(20deg); }
        .fire { position: absolute; bottom: 5px; left: -10px; display: flex; gap: 2px; align-items: flex-end; }
        .flame { width: 8px; height: 20px; background: linear-gradient(180deg, #fef08a 0%, #f97316 60%, #ef4444 100%); border-radius: 50% 50% 20% 20%; transform-origin: bottom center; animation: fireFlicker 0.4s ease-in-out infinite alternate; filter: blur(1px); }
        .flame-1 { height: 15px; animation-delay: 0.1s; } .flame-2 { height: 25px; animation-delay: 0s; width: 10px; } .flame-3 { height: 18px; animation-delay: 0.2s; }
        @keyframes fireFlicker { 0% { transform: scaleY(0.8) skewX(-5deg); } 100% { transform: scaleY(1.2) skewX(5deg); } }
        .fire-glow { position: absolute; bottom: -10px; left: -25px; width: 50px; height: 20px; background: rgba(249,115,22,0.4); border-radius: 50%; filter: blur(15px); animation: firePulse 2s infinite alternate; }
        @keyframes firePulse { 0% { opacity: 0.6; transform: scale(1); } 100% { opacity: 1; transform: scale(1.2); } }

        /* String Lights */
        .string-lights { position: absolute; bottom: 25%; right: 10%; width: 250px; height: 100px; z-index: 5; pointer-events: none; }
        .wire { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-bottom: 2px solid #475569; border-radius: 50%; }
        .light-bulb { position: absolute; top: 98px; width: 6px; height: 8px; background: #fef08a; border-radius: 50%; box-shadow: 0 0 10px 3px rgba(253,224,71,0.6); animation: bulbFlicker 3s infinite; }
        .light-bulb::before { content: ''; position: absolute; top: -4px; left: 1px; width: 4px; height: 4px; background: #334155; }
        .lb-1 { left: 10%; animation-delay: 0s; top: 60px; transform: rotate(10deg); }
        .lb-2 { left: 25%; animation-delay: 0.5s; top: 82px; transform: rotate(5deg); }
        .lb-3 { left: 40%; animation-delay: 1.2s; top: 96px; transform: rotate(0deg); }
        .lb-4 { left: 55%; animation-delay: 0.2s; top: 96px; transform: rotate(-5deg); }
        .lb-5 { left: 70%; animation-delay: 0.8s; top: 82px; transform: rotate(-10deg); }
        .lb-6 { left: 85%; animation-delay: 1.5s; top: 60px; transform: rotate(-15deg); }
        @keyframes bulbFlicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; box-shadow: 0 0 5px 1px rgba(253,224,71,0.4); } }
        .light-pole { position: absolute; top: -10px; left: 0; width: 6px; height: 120px; background: #451a03; border-radius: 3px; }

        /* Signpost */
        .signpost { position: absolute; bottom: 20%; left: 12%; z-index: 5; transform: scale(0.9); }
        .signpost-pole { width: 6px; height: 80px; background: #451a03; border-radius: 3px; margin: 0 auto; }
        .sign-board { position: absolute; width: 70px; height: 20px; background: #d97706; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 0.45rem; font-weight: 800; color: #fff; text-shadow: 1px 1px 0 rgba(0,0,0,0.5); font-family: 'Rubik', sans-serif; box-shadow: 2px 2px 4px rgba(0,0,0,0.3); border: 1px solid #92400e; }
        .sign-1 { top: 10px; left: -45px; transform: rotate(-5deg); clip-path: polygon(100% 0, 100% 100%, 15% 100%, 0 50%, 15% 0); padding-left: 8px; }
        .sign-2 { top: 35px; left: -15px; transform: rotate(3deg); clip-path: polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%); padding-right: 8px; background: #ef4444; }
        .sign-3 { top: 60px; left: -35px; transform: rotate(-2deg); clip-path: polygon(100% 0, 100% 100%, 15% 100%, 0 50%, 15% 0); padding-left: 8px; background: #3b82f6; }

        /* People gathering / Urban life */
        .people-group { position: absolute; bottom: 16%; left: 20%; z-index: 5; }
        .person { position: absolute; bottom: 0; }
        .person-body { width: 12px; height: 20px; border-radius: 6px 6px 0 0; }
        .person-head { position: absolute; top: -10px; left: 1px; width: 10px; height: 10px; background: #fca5a5; border-radius: 50%; }
        .person-1 { left: 0; } .person-1 .person-body { background: #3b82f6; } .person-1 .person-head::after { content: ''; position: absolute; top:-3px; width:12px; height:6px; background:#ef4444; border-radius:4px 4px 0 0; left:-1px; }
        .person-2 { left: 25px; transform: scaleX(-1); } .person-2 .person-body { background: #10b981; } .person-2 .person-head::after { content: ''; position: absolute; top:-3px; width:12px; height:6px; background:#f59e0b; border-radius:4px 4px 0 0; left:-1px; }

        .chairlift-system { position: absolute; top: 15%; left: 0; width: 100%; height: 40%; z-index: 4; pointer-events: none; }
        .cable { position: absolute; top: 20%; left: -10%; width: 120%; height: 2px; background: #475569; transform: rotate(-8deg); }
        .chair { position: absolute; top: 20%; width: 30px; height: 40px; animation: chairMove 20s linear infinite; }
        .chair-pole { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 2px; height: 25px; background: #64748b; }
        .chair-seat { position: absolute; bottom: 0; left: 0; width: 30px; height: 15px; border: 2px solid #64748b; border-top: none; border-radius: 0 0 4px 4px; }
        .chair-bar { position: absolute; top: 25px; left: -2px; width: 34px; height: 2px; background: #94a3b8; }
        .chair-1 { left: 10%; animation-delay: 0s; }
        .chair-2 { left: 45%; animation-delay: -6s; }
        .chair-3 { left: 80%; animation-delay: -13s; }
        @keyframes chairMove { 0% { transform: translateX(100vw) translateY(-10vh) rotate(-8deg); } 100% { transform: translateX(-20vw) translateY(12vh) rotate(-8deg); } }

        .cabin { position: absolute; bottom: 30%; right: 15%; width: 100px; height: 75px; background: #78350f; border-radius: 4px; z-index: 4; border: 2px solid #451a03; transform: scale(1.1); }
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
        
        .ski-rack { position: absolute; bottom: 25%; right: 30%; width: 50px; height: 50px; border: 4px solid #64748b; border-bottom: none; border-top: none; z-index: 4; transform: scale(1.2); }
        .ski-rack-bar { position: absolute; top: 15px; left: -10px; width: 70px; height: 4px; background: #64748b; border-radius: 2px; }
        .rack-ski { position: absolute; width: 6px; height: 60px; background: #ef4444; border-radius: 3px; transform: rotate(12deg); bottom: 0; box-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .rack-ski-1 { left: 5px; } .rack-ski-2 { left: 20px; background: #3b82f6; transform: rotate(-8deg); } .rack-ski-3 { left: 35px; background: #10b981; transform: rotate(5deg); }
        .rack-snowboard { position: absolute; width: 14px; height: 50px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 6px; transform: rotate(-15deg); bottom: 0; left: 50px; border: 1px solid #b45309; }

        /* CAMPER REDESIGN & ENHANCED ANIMATION */
        .camper-scene { position: absolute; bottom: 6%; left: 50%; transform: translateX(-50%); z-index: 6; animation: camperIdle 4s ease-in-out infinite; }
        @keyframes camperIdle { 
            0%, 100% { transform: translateX(-50%) translateY(0) rotate(0deg); } 
            25% { transform: translateX(-50%) translateY(-2px) rotate(0.5deg); } 
            50% { transform: translateX(-50%) translateY(1px) rotate(0deg); } 
            75% { transform: translateX(-50%) translateY(-1px) rotate(-0.5deg); } 
        }
        
        .camper { position: relative; width: 250px; height: 115px; animation: camperSnowMovie 30s ease-in-out infinite; transform-origin: bottom center; }
        @keyframes camperSnowMovie {
            0%, 15% { transform: translateX(0) scaleY(1) scaleX(1); opacity: 1; filter: brightness(1); }
            30% { transform: translateX(0) scaleY(0.9) scaleX(1.02); opacity: 1; filter: brightness(0.95); }
            45% { transform: translateX(0) scaleY(0.7) scaleX(1.05); opacity: 1; filter: brightness(0.9); }
            50% { transform: translateX(0) scaleY(0.3) scaleX(1.1); opacity: 1; filter: brightness(0.8); }
            55% { transform: translateX(0) scaleY(0.05) scaleX(1.2); opacity: 1; filter: brightness(0.7); }
            58% { transform: translateX(0) scaleY(0) scaleX(1.2); opacity: 0; }
            65% { transform: translateX(-100vw) scaleY(1) scaleX(1); opacity: 0; filter: brightness(1); }
            66% { transform: translateX(-100vw) scaleY(1) scaleX(1); opacity: 1; }
            80%, 100% { transform: translateX(0) scaleY(1) scaleX(1); opacity: 1; filter: brightness(1); }
        }

        .giant-snow-pile { position: absolute; bottom: 110px; left: 0; width: 250px; height: 0px; background: #ffffff; border-radius: 30px 30px 10px 10px; z-index: 10; animation: snowGrow 30s ease-in infinite; box-shadow: inset 0 -10px 20px rgba(226,232,240,0.9); pointer-events: none; }
        @keyframes snowGrow {
            0%, 10% { height: 0px; bottom: 110px; opacity: 0; }
            15% { height: 10px; bottom: 110px; opacity: 1; width: 250px; left: 0; }
            30% { height: 60px; bottom: 100px; opacity: 1; width: 270px; left: -10px; border-radius: 40px 40px 10px 10px; }
            45% { height: 120px; bottom: 80px; opacity: 1; width: 290px; left: -20px; border-radius: 50px 50px 10px 10px; }
            50% { height: 160px; bottom: 35px; opacity: 1; width: 330px; left: -40px; border-radius: 70px 70px 10px 10px; }
            55% { height: 180px; bottom: 5px; opacity: 1; width: 370px; left: -60px; border-radius: 90px 90px 10px 10px; }
            58% { height: 180px; bottom: 5px; opacity: 0; width: 370px; left: -60px; }
            59%, 100% { height: 0px; bottom: 110px; opacity: 0; }
        }
        
        .ground-snow-swallow { position: absolute; bottom: -10px; left: 0px; width: 250px; height: 0px; background: #ffffff; border-radius: 50%; z-index: 15; animation: swallowGrow 30s ease-in infinite; filter: blur(3px); pointer-events: none; }
        @keyframes swallowGrow {
            0%, 40% { height: 0px; opacity: 0; }
            45% { height: 40px; opacity: 1; width: 310px; left: -30px; }
            50% { height: 80px; opacity: 1; width: 350px; left: -50px; }
            55% { height: 120px; opacity: 1; width: 410px; left: -80px; }
            58% { height: 120px; opacity: 0; width: 410px; left: -80px; transform: translateY(20px); }
            59%, 100% { height: 0px; opacity: 0; transform: translateY(0); }
        }
        .camper-body { position: absolute; bottom: 25px; left: 0; width: 100%; height: 85px; background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 45%, #cbd5e1 100%); border-radius: 20px 30px 8px 8px; border: 2px solid #64748b; overflow: hidden; box-shadow: inset -5px -5px 15px rgba(0,0,0,0.05), 5px 10px 20px rgba(0,0,0,0.15); }
        .camper-body::before { content: ''; position: absolute; top: 40px; left: -10%; width: 120%; height: 60px; background: linear-gradient(9deg, #0284c7 0%, #0ea5e9 100%); border-top: 3px solid white; border-radius: 50% 50% 0 0 / 20px 20px 0 0; }
        .camper-body::after { content: ''; position: absolute; top: 35px; left: 0; width: 100%; height: 4px; background: #0369a1; }
        
        .camper-roof { position: absolute; top: -2px; left: 20px; width: 170px; height: 10px; background: #f8fafc; border-radius: 8px; border: 2px solid #94a3b8; box-shadow: inset 0 -3px 5px rgba(0,0,0,0.05); }
        .camper-popup { position: absolute; top: -30px; left: 40px; width: 120px; height: 30px; background: repeating-linear-gradient(90deg, #e2e8f0 0px, #e2e8f0 10px, #cbd5e1 10px, #cbd5e1 12px); border: 2px solid #94a3b8; border-radius: 8px 8px 0 0; border-bottom: none; transform: skewX(-5deg); z-index: -1; }
        
        .camper-window { position: absolute; background: linear-gradient(135deg, #1e293b, #0f172a); border: 2px solid #64748b; border-radius: 6px; overflow: hidden; }
        .camper-window::after { content: ''; position: absolute; top: 0; left: -20px; width: 30px; height: 100%; background: rgba(255,255,255,0.15); transform: skewX(-20deg); animation: glassShine 4s infinite; }
        @keyframes glassShine { 0% { left: -30px; } 20%, 100% { left: 100%; } }
        .camper-window-front { right: 10px; top: 10px; width: 55px; height: 28px; border-radius: 6px 16px 6px 6px; } .camper-window-side1 { left: 22px; top: 10px; width: 45px; height: 24px; } .camper-window-side2 { left: 75px; top: 10px; width: 45px; height: 24px; }
        
        .camper-door { position: absolute; left: 130px; top: 8px; width: 34px; height: 75px; border: 2px solid #94a3b8; border-radius: 4px; border-bottom: none; z-index: 2; }
        .camper-door::after { content: ''; position: absolute; right: 4px; top: 50%; width: 6px; height: 12px; background: #64748b; border-radius: 3px; transform: translateY(-50%); box-shadow: inset 1px 1px 2px rgba(255,255,255,0.5); }
        
        .camper-bumper-front { position: absolute; right: -4px; bottom: 20px; width: 12px; height: 15px; background: linear-gradient(180deg, #94a3b8, #64748b); border-radius: 0 6px 6px 0; border: 2px solid #475569; border-left: none; }
        .camper-bumper-rear { position: absolute; left: -4px; bottom: 20px; width: 12px; height: 15px; background: linear-gradient(180deg, #94a3b8, #64748b); border-radius: 6px 0 0 6px; border: 2px solid #475569; border-right: none; }
        
        .camper-headlight { position: absolute; right: -2px; top: 45px; width: 8px; height: 14px; background: radial-gradient(circle, #fff, #fef08a); border-radius: 0 4px 4px 0; border: 1px solid #eab308; box-shadow: 0 0 20px 5px rgba(250,204,21,0.6); }
        .camper-taillight { position: absolute; left: -2px; top: 45px; width: 6px; height: 16px; background: #ef4444; border-radius: 2px 0 0 2px; border: 1px solid #991b1b; box-shadow: 0 0 10px rgba(239,68,68,0.5); }
        
        .wheel { position: absolute; bottom: 0; width: 44px; height: 44px; background: #0f172a; border-radius: 50%; border: 4px solid #020617; box-shadow: inset 0 0 10px rgba(0,0,0,0.8), 2px 5px 10px rgba(0,0,0,0.3); z-index: 3; }
        .wheel::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 24px; height: 24px; background: repeating-conic-gradient(#94a3b8 0deg 30deg, #64748b 30deg 60deg); border-radius: 50%; border: 2px solid #cbd5e1; animation: wheelSpinMovie 30s ease-out infinite; }
        @keyframes wheelSpinMovie {
            0%, 65% { transform: translate(-50%, -50%) rotate(0deg); }
            66% { transform: translate(-50%, -50%) rotate(0deg); }
            80%, 100% { transform: translate(-50%, -50%) rotate(1080deg); }
        }
        .wheel::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: #020617; border-radius: 50%; border: 2px solid #94a3b8; }
        .wheel-front { right: 30px; } .wheel-rear { left: 35px; }
        
        .wheel-arch { position: absolute; bottom: 23px; width: 56px; height: 34px; background: transparent; border: 4px solid #94a3b8; border-bottom: none; border-radius: 30px 30px 0 0; z-index: 1; }
        .wheel-arch-front { right: 24px; } .wheel-arch-rear { left: 29px; }
        
        .camper-mirror { position: absolute; right: 8px; top: 32px; width: 6px; height: 14px; background: #94a3b8; border: 1px solid #64748b; border-radius: 3px; z-index: 3; }
        .camper-mirror::before { content: ''; position: absolute; left: -5px; top: 5px; width: 5px; height: 3px; background: #0f172a; }

        /* Skis on roof */
        .skis { position: absolute; top: -12px; left: 35px; width: 110px; height: 6px; z-index: 2; transform: rotate(-2deg); }
        .ski { width: 100%; height: 3px; background: #ef4444; border-radius: 3px 10px 10px 3px; position: absolute; box-shadow: inset 0 2px 2px rgba(255,255,255,0.4); border: 1px solid #991b1b; }
        .ski::before { content: ''; position: absolute; right: -4px; top: -2px; width: 10px; height: 3px; background: #ef4444; border-radius: 50%; transform: rotate(30deg); border: 1px solid #991b1b; border-bottom: none; }
        .ski-1 { top: 0; } .ski-2 { top: 3px; background: #b91c1c; } .ski-2::before { background: #b91c1c; }
        /* Ski rack mounts */
        .skis::after { content: ''; position: absolute; left: 20px; bottom: -6px; width: 6px; height: 6px; background: #64748b; box-shadow: 60px 0 0 #64748b; }
        
        .snowboard { position: absolute; top: -14px; left: 60px; width: 80px; height: 4px; background: linear-gradient(90deg, #f59e0b, #d97706); border-radius: 4px 12px 12px 4px; z-index: 3; transform: rotate(-3deg); border: 1px solid #b45309; }
        .snowboard::before { content: ''; position: absolute; right: -4px; top: -2px; width: 8px; height: 4px; background: #f59e0b; border-radius: 50%; transform: rotate(20deg); border: 1px solid #b45309; border-bottom: none; }
        .snowboard::after { content: ''; position: absolute; left: -4px; top: -2px; width: 8px; height: 4px; background: #f59e0b; border-radius: 50%; transform: rotate(-20deg); border: 1px solid #b45309; border-bottom: none; }
        
        .camper-snow-pile { position: absolute; bottom: -5px; left: -10px; width: 270px; height: 12px; background: white; border-radius: 50%; filter: blur(2px); z-index: 4; opacity: 0.8; }
        .camper-snow-roof { position: absolute; top: -8px; left: 25px; width: 140px; height: 8px; background: white; border-radius: 4px; filter: blur(1px); z-index: 3; }
        .camper-snow-bumper { position: absolute; top: -6px; left: -2px; width: 16px; height: 8px; background: white; border-radius: 4px; filter: blur(1px); z-index: 5; }
        
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
        .sb-countdown-item { display: flex; flex-direction: column; align-items: center; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(10px); border-radius: 12px; padding: 8px 14px; min-width: 58px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 6px rgba(0,0,0,0.2); }
        .sb-countdown-number { font-family: 'Rubik', sans-serif; font-weight: 700; font-size: 1.5rem; color: #f1f5f9; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
        .sb-countdown-label { font-family: 'Amiko', sans-serif; font-size: 0.6rem; color: #7dd3fc; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }

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
          .chairlift-system, .cabin, .skier, .bonfire, .people-group, .signpost, .string-lights { display: none; }
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
        <div className="parking-sign">P</div>
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
        <div className="rack-snowboard"></div>
      </div>

      <div className="string-lights">
        <div className="light-pole"></div>
        <div className="wire"></div>
        <div className="light-bulb lb-1"></div>
        <div className="light-bulb lb-2"></div>
        <div className="light-bulb lb-3"></div>
        <div className="light-bulb lb-4"></div>
        <div className="light-bulb lb-5"></div>
        <div className="light-bulb lb-6"></div>
      </div>

      <div className="skier">
        <div className="skier-body">
            <div className="skier-head"></div>
            <div className="skier-leg skier-leg-1"></div>
            <div className="skier-leg skier-leg-2"></div>
            <div className="skier-pole skier-pole-1"></div>
            <div className="skier-pole skier-pole-2"></div>
        </div>
        <div className="skier-ski skier-ski-1"></div>
        <div className="skier-ski skier-ski-2"></div>
      </div>

      <div className="bonfire">
        <div className="fire-glow"></div>
        <div className="logs"></div>
        <div className="fire">
            <div className="flame flame-1"></div>
            <div className="flame flame-2"></div>
            <div className="flame flame-3"></div>
        </div>
      </div>

      <div className="people-group">
        <div className="person person-1"><div className="person-body"><div className="person-head"></div></div></div>
        <div className="person person-2"><div className="person-body"><div className="person-head"></div></div></div>
      </div>

      <div className="signpost">
        <div className="signpost-pole"></div>
        <div className="sign-board sign-1">PISTAS</div>
        <div className="sign-board sign-2">APRES-SKI</div>
        <div className="sign-board sign-3">PARKING</div>
      </div>

      <div className="camper-scene">
        <div className="camper-snow-pile"></div>
        <div className="giant-snow-pile"></div>
        <div className="ground-snow-swallow"></div>
        <div className="camper">
            <div className="camper-snow-roof"></div>
            <div className="camper-popup"></div>
            <div className="camper-roof"></div>
            <div className="skis"><div className="ski ski-1"></div><div className="ski ski-2"></div></div>
            <div className="snowboard"></div>
            <div className="camper-body">
                <div className="camper-window camper-window-front"></div>
                <div className="camper-window camper-window-side1"></div>
                <div className="camper-window camper-window-side2"></div>
                <div className="camper-door"></div>
            </div>
            <div className="wheel-arch wheel-arch-front"></div>
            <div className="wheel-arch wheel-arch-rear"></div>
            <div className="camper-bumper-front"><div className="camper-snow-bumper"></div></div>
            <div className="camper-bumper-rear"><div className="camper-snow-bumper"></div></div>
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
