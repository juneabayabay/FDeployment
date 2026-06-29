import { useEffect, useRef } from 'react';

export default function PublicMainCard({ children, enableTilt = true, className = '' }) {
  const cardRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({ currentX: 0, currentY: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (!enableTilt) return undefined;

    const card = cardRef.current;
    if (!card) return undefined;

    const isMobile = () => window.innerWidth < 768;

    const updateTilt = () => {
      const { currentX, currentY, targetX, targetY } = stateRef.current;
      const nextX = currentX + (targetX - currentX) * 0.08;
      const nextY = currentY + (targetY - currentY) * 0.08;
      stateRef.current.currentX = nextX;
      stateRef.current.currentY = nextY;

      card.style.transform = `perspective(1200px) rotateX(${nextX}deg) rotateY(${nextY}deg)`;

      const bubbles = document.querySelectorAll('.public-bubble');
      const shiftX = nextY * 0.02;
      const shiftY = nextX * 0.02;
      bubbles.forEach((bubble, i) => {
        const speed = 1 + i * 0.05;
        bubble.style.transform = `translate(${shiftX * speed}px, ${shiftY * speed}px)`;
      });

      if (Math.abs(nextX - targetX) > 0.01 || Math.abs(nextY - targetY) > 0.01) {
        rafRef.current = requestAnimationFrame(updateTilt);
      } else {
        rafRef.current = null;
      }
    };

    const scheduleUpdate = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(updateTilt);
      }
    };

    const onMouseMove = (e) => {
      if (isMobile()) return;
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      stateRef.current.targetX = ((e.clientY - centerY) / (rect.height / 2)) * -4;
      stateRef.current.targetY = ((e.clientX - centerX) / (rect.width / 2)) * 4;
      scheduleUpdate();
    };

    const onMouseLeave = () => {
      stateRef.current.targetX = 0;
      stateRef.current.targetY = 0;
      scheduleUpdate();
    };

    const onResize = () => {
      if (isMobile()) {
        card.style.transform = 'none';
        document.querySelectorAll('.public-bubble').forEach((el) => {
          el.style.transform = '';
        });
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      }
    };

    if (!isMobile()) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseleave', onMouseLeave);
      rafRef.current = requestAnimationFrame(updateTilt);
    }

    window.addEventListener('resize', onResize);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enableTilt]);

  return (
    <div ref={cardRef} className={`public-main-card ${className}`.trim()}>
      {children}
    </div>
  );
}
