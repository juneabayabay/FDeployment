import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 35;

export default function GeoParticles() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const particles = Array.from({ length: PARTICLE_COUNT }, () => {
      const el = document.createElement('div');
      el.className = 'admin-auth-particle';
      const size = 4 + Math.random() * 10;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${Math.random() * 100}%`;
      el.style.animationDuration = `${10 + Math.random() * 16}s`;
      el.style.animationDelay = `${Math.random() * 12}s`;
      container.appendChild(el);
      return el;
    });

    return () => {
      particles.forEach((el) => el.remove());
    };
  }, []);

  return <div ref={containerRef} className="admin-auth-particles" aria-hidden />;
}
