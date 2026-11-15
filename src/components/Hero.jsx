import { useContent } from '../context/ContentContext';
import FallbackEye from './FallbackEye';
import Icon from './Icons';

/**
 * Hero – headline, subtext and the two main buttons.
 *
 * The 3D eye is NOT rendered here: it lives in the page-wide canvas (components/three)
 * and lines up with the empty "visual slot" on the right (top on phones).
 * When 3D is unavailable, the SVG FallbackEye fills that slot instead.
 *
 * Text is editable from /admin (Hero tab).
 */
export default function Hero({ fallback }) {
  const { settings } = useContent();
  const h = settings.hero;

  // Uses a CSS animation (not Reveal) so the headline appears immediately, without waiting for JS observers.
  const anim = (delay) => ({ animationDelay: `${delay}ms` });

  return (
    <section id="home" className="relative flex min-h-[100svh] items-center overflow-hidden">
      <div className="container-x relative z-10 grid w-full items-center gap-2 pb-20 pt-24 lg:grid-cols-2 lg:gap-8 lg:pb-16 lg:pt-28">
        {/* Text */}
        <div className="order-2 lg:order-1">
          <span className="chip animate-fade-up" style={anim(0)}>
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
            {h.eyebrow}
          </span>

          <h1
            className="text-pop mt-5 text-[2.5rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
            style={anim(80)}
          >
            {h.headline} <span className="gradient-text">{h.headlineAccent}</span>
          </h1>

          <p
            className="mt-5 max-w-xl animate-fade-up text-base font-medium leading-relaxed text-white/85 sm:text-lg"
            style={anim(160)}
          >
            {h.subtext}
          </p>

          <div className="mt-8 flex animate-fade-up flex-col gap-3 sm:flex-row" style={anim(240)}>
            <a href="#contact" className="btn-primary">
              {h.ctaPrimary}
              <Icon name="arrow" className="h-4 w-4" />
            </a>
            <a href="#projects" className="btn-ghost">
              {h.ctaSecondary}
            </a>
          </div>
        </div>

        {/* Visual slot: the 3D eye is drawn here by the background canvas */}
        <div className="order-1 flex h-[36svh] items-center justify-center lg:order-2 lg:h-[70vh]">
          {fallback && <FallbackEye />}
        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#services"
        aria-label="Scroll to services"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/40 transition hover:text-white lg:block"
      >
        <span className="flex h-10 w-6 items-start justify-center rounded-full border border-white/25 p-1.5">
          <span className="h-2 w-1 animate-shimmer rounded-full bg-brand-cyan" />
        </span>
      </a>
    </section>
  );
}
