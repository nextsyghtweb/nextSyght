/**
 * FallbackBackdrop – CSS-only stand-in for the 3D particles and floating shapes.
 *
 * Uses only static gradients, so it is cheap even on low-end phones.
 */
export default function FallbackBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(214,194,161,.22), transparent)' }}
      />
      <div
        className="absolute -bottom-40 -left-40 h-[34rem] w-[34rem] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(245,237,224,.16), transparent)' }}
      />
    </div>
  );
}
