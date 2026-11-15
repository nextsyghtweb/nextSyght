import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/hooks';
import Logo from '../components/Logo';
import FloatingActions from '../components/FloatingActions';

/** 404 page. It also carries the sticky quote + WhatsApp buttons so lead capture works on every page. */
export default function NotFound() {
  usePageMeta('Page not found | Nextsyght', true);

  return (
    <div className="grid min-h-screen place-items-center bg-navy-950 px-5 text-center">
      <div>
        <Logo href="/" className="mb-8" />
        <p className="gradient-text text-7xl font-bold">404</p>
        <h1 className="mt-3 text-2xl font-semibold">This page doesn&apos;t exist</h1>
        <p className="mt-2 text-white/60">The link may be broken, or the page may have moved.</p>
        <Link to="/" className="btn-primary mt-8">Back to home</Link>
      </div>
      <FloatingActions quoteHref="/#contact" />
    </div>
  );
}
