"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface SmartTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

export function SmartTooltip({ children, content, className = "" }: SmartTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return;

      const trigger = triggerRef.current;
      const tooltip = tooltipRef.current;
      const triggerRect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      
      // Calcular espacio disponible en cada dirección
      const spaceTop = triggerRect.top;
      const spaceBottom = viewportHeight - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewportWidth - triggerRect.right;
      
      // Decidir la mejor posición
      let bestPlacement: 'top' | 'bottom' | 'left' | 'right' = 'top';
      let top = 0;
      let left = 0;
      
      // Intentar arriba primero
      if (spaceTop >= tooltipRect.height + 10) {
        bestPlacement = 'top';
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
      } 
      // Intentar abajo
      else if (spaceBottom >= tooltipRect.height + 10) {
        bestPlacement = 'bottom';
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
      }
      // Intentar derecha
      else if (spaceRight >= tooltipRect.width + 10) {
        bestPlacement = 'right';
        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.right + scrollX + 8;
      }
      // Intentar izquierda
      else if (spaceLeft >= tooltipRect.width + 10) {
        bestPlacement = 'left';
        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
      }
      // Si no cabe en ningún lado, usar el que tenga más espacio
      else {
        const maxSpace = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight);
        if (maxSpace === spaceTop) {
          bestPlacement = 'top';
          top = triggerRect.top + scrollY - tooltipRect.height - 8;
          left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
        } else if (maxSpace === spaceBottom) {
          bestPlacement = 'bottom';
          top = triggerRect.bottom + scrollY + 8;
          left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
        } else if (maxSpace === spaceRight) {
          bestPlacement = 'right';
          top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
          left = triggerRect.right + scrollX + 8;
        } else {
          bestPlacement = 'left';
          top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
          left = triggerRect.left + scrollX - tooltipRect.width - 8;
        }
      }
      
      // Ajustar para que no se salga de la pantalla horizontalmente
      if (left < 10) left = 10;
      if (left + tooltipRect.width > viewportWidth - 10) {
        left = viewportWidth - tooltipRect.width - 10;
      }
      
      setPlacement(bestPlacement);
      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

  const getArrowStyle = () => {
    if (!triggerRef.current) return {};
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    
    switch (placement) {
      case 'top':
        return {
          position: 'absolute' as const,
          bottom: '-4px',
          left: `${triggerRect.left + scrollX + triggerRect.width / 2 - position.left}px`,
          transform: 'translateX(-50%)',
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: '4px solid rgb(17, 24, 39)',
        };
      case 'bottom':
        return {
          position: 'absolute' as const,
          top: '-4px',
          left: `${triggerRect.left + scrollX + triggerRect.width / 2 - position.left}px`,
          transform: 'translateX(-50%)',
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderBottom: '4px solid rgb(17, 24, 39)',
        };
      case 'left':
        return {
          position: 'absolute' as const,
          right: '-4px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
          borderLeft: '4px solid rgb(17, 24, 39)',
        };
      case 'right':
        return {
          position: 'absolute' as const,
          left: '-4px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
          borderRight: '4px solid rgb(17, 24, 39)',
        };
    }
  };

  const tooltipContent = isVisible && mounted && (
    <div 
      ref={tooltipRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
    >
      <div className="bg-gray-900 text-white text-xs rounded shadow-xl px-3 py-2 relative">
        {content}
        <div style={getArrowStyle()}></div>
      </div>
    </div>
  );

  return (
    <>
      <div 
        ref={triggerRef}
        className={className}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {mounted && typeof window !== 'undefined' && createPortal(
        tooltipContent,
        document.body
      )}
    </>
  );
}
