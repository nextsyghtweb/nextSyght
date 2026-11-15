/**
 * Logo – brand mark + wordmark.
 *
 * >>> TO REPLACE THE PLACEHOLDER LOGO <<<
 * Drop your own file into the /public folder and keep the name "logo.svg"
 * (or use e.g. "logo.png" and change the src below). A square image works best.
 * The wordmark text next to it is written exactly "Nextsyght".
 */
export default function Logo({ href = '#home', className = '' }) {
  return (
    <a href={href} className={`inline-flex items-center gap-2.5 ${className}`} aria-label="Nextsyght home">
      <img src="/logo.svg" alt="Nextsyght logo" width="36" height="36" className="h-9 w-9" />
      <span className="text-xl font-semibold tracking-tight text-white">Nextsyght</span>
    </a>
  );
}
