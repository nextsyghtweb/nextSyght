/**
 * FallbackBackdrop – CSS-only stand-in for the 3D particles and floating shapes.
 *
 * Uses only transforms and gradients (no blur filters, no WebGL), so it is
 * cheap even on low-end phones. Fewer shapes are rendered on small screens.
 */
const SHAPES = [
  { left: '8%', top: '18%', size: 38, color: '#22d3ee', round: false, delay: '0s', dur: '9s', mobile: true },
  { left: '88%', top: '12%', size: 26, color: '#8b5cf6', round: true, delay: '1.5s', dur: '11s', mobile: true },
  { left: '78%', top: '58%', size: 46, color: '#2f6bff', round: false, delay: '0.8s', dur: '13s', mobile: false },
  { left: '14%', top: '68%', size: 30, color: '#8b5cf6', round: true, delay: '2.4s', dur: '10s', mobile: true },
  { left: '50%', top: '86%', size: 34, color: '#22d3ee', round: false, delay: '3.1s', dur: '12s', mobile: false },
  { left: '36%', top: '8%', size: 22, color: '#2f6bff', round: true, delay: '1s', dur: '8s', mobile: false },
];

export default function FallbackBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(47,107,255,.22), transparent)' }}
      />
      <div
        className="absolute -bottom-40 -left-40 h-[34rem] w-[34rem] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(139,92,246,.2), transparent)' }}
      />
      {SHAPES.map((s, i) => (
        <span
          key={i}
          className={`absolute animate-float opacity-40 ${s.mobile ? '' : 'hidden sm:block'}`}
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            border: `2px solid ${s.color}`,
            borderRadius: s.round ? '9999px' : '8px',
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
        />
      ))}
    </div>
  );
}
