import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 45;

export default function AuthParticles({
  particleClass = 'patient-auth-particle',
  containerClass = 'patient-auth-particles',
  count = PARTICLE_COUNT,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const particles = Array.from({ length: count }, () => {
      const el = document.createElement('div');
      el.className = particleClass;
      const size = 2 + Math.random() * 4;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${Math.random() * 100}%`;
      el.style.animationDuration = `${8 + Math.random() * 14}s`;
      el.style.animationDelay = `${Math.random() * 10}s`;
      container.appendChild(el);
      return el;
    });

    return () => {
      particles.forEach((el) => el.remove());
    };
  }, [particleClass, count]);

  return <div ref={containerRef} className={containerClass} aria-hidden />;
}
