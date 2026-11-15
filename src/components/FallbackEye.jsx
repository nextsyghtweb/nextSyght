import { useEffect, useRef } from 'react';

/**
 * FallbackEye – lightweight replacement for the 3D hero eye.
 *
 * Shown on devices that can't (or shouldn't) run WebGL: weak phones, reduced-motion
 * users, Data Saver, or when the 3D scene runs too slowly. It's a plain SVG with
 * a CSS glow and a gently floating animation. The pupil still follows the pointer
 * (a few lines of JS, no WebGL), so the effect isn't lost.
 */
export default function FallbackEye() {
  const pupil = useRef(null);

  useEffect(() => {
    let frame = 0;
    const onMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        if (pupil.current) {
          pupil.current.style.transform = `translate(${nx * 18}px, ${ny * 10}px)`;
        }
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="relative flex w-full max-w-md animate-float items-center justify-center" aria-hidden="true">
      {/* glow behind the eye */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(closest-side, rgba(214,194,161,.45), rgba(245,237,224,.16) 55%, transparent 75%)',
        }}
      />
      <svg viewBox="0 0 400 300" className="relative w-full drop-shadow-[0_0_30px_rgba(214,194,161,0.45)]">
        <defs>
          <linearGradient id="fe-g" x1="0" y1="0" x2="400" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#F5EDE0" />
            <stop offset="1" stopColor="#D6C2A1" />
          </linearGradient>
          <radialGradient id="fe-iris" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#F5EDE0" />
            <stop offset="1" stopColor="#D6C2A1" />
          </radialGradient>
        </defs>

        <path d="M96 70 20 150l76 80" fill="none" stroke="url(#fe-g)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m304 70 76 80-76 80" fill="none" stroke="url(#fe-g)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M120 150c24-44 52-66 80-66s56 22 80 66c-24 44-52 66-80 66s-56-22-80-66Z"
          fill="rgba(23,23,23,0.85)"
          stroke="url(#fe-g)"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <g ref={pupil} style={{ transition: 'transform 0.18s ease-out' }}>
          <circle cx="200" cy="150" r="36" fill="url(#fe-iris)" />
          <circle cx="200" cy="150" r="15" fill="#171717" />
          <circle cx="213" cy="137" r="6" fill="#fff" />
        </g>
      </svg>
    </div>
  );
}
