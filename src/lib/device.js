/**
 * Device capability detection.
 *
 * Decides whether the Three.js scene should run, or whether we should show the
 * lightweight CSS/SVG fallback instead. We fall back when:
 *   - WebGL is not available
 *   - the visitor prefers reduced motion
 *   - the device looks weak (<= 2 CPU cores, <= 2 GB RAM) or "Data Saver" is on
 *   - the URL contains ?fallback=1 (handy for testing the fallback yourself)
 *
 * Separately, the 3D scene itself watches its frame rate and switches to the
 * fallback automatically if it runs too slowly (see FpsGuard).
 */

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    // Release the test context straight away so it doesn't count against browser limits.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function detectCapability() {
  if (typeof window === 'undefined') return { canRun3D: false, isMobile: false };

  const params = new URLSearchParams(window.location.search);
  const forceFallback = params.get('fallback') === '1';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

  const memory = navigator.deviceMemory; // may be undefined (Safari/Firefox)
  const cores = navigator.hardwareConcurrency;
  const saveData = navigator.connection?.saveData === true;
  const weakDevice = (memory && memory <= 2) || (cores && cores <= 2) || saveData;

  const canRun3D = !forceFallback && !reducedMotion && !weakDevice && hasWebGL();

  return { canRun3D, isMobile, reducedMotion };
}

/** True on devices with a real mouse (used to enable card tilt). */
export function hasFinePointer() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
