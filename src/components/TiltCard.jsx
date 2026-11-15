import { useEffect, useRef } from 'react';
import { hasFinePointer } from '../lib/device';

/**
 * TiltCard – a card that tilts in 3D toward the mouse and shows a soft glare.
 *
 * Only active on devices with a real mouse (on touch screens it's a normal card,
 * so there is no cost and nothing to get stuck). Honors "reduce motion".
 */
export default function TiltCard({ children, className = '', max = 9, style }) {
  const ref = useRef(null);
  const frame = useRef(0);
  const enabled = useRef(false);

  useEffect(() => {
    enabled.current = hasFinePointer();
    return () => cancelAnimationFrame(frame.current);
  }, []);

  const handleMove = (e) => {
    if (!enabled.current) return;
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1

    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rotateX = (0.5 - py) * max * 2;
      const rotateY = (px - 0.5) * max * 2;
      el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      el.style.setProperty('--gx', `${px * 100}%`);
      el.style.setProperty('--gy', `${py * 100}%`);
    });
  };

  const handleLeave = () => {
    cancelAnimationFrame(frame.current);
    if (ref.current) ref.current.style.transform = '';
  };

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={style}
      className={`tilt-card relative overflow-hidden rounded-2xl border border-white/10 bg-navy-800/80 ${className}`}
    >
      <div className="tilt-glare" aria-hidden="true" />
      {children}
    </div>
  );
}
