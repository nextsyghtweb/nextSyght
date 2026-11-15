import { useContent } from '../context/ContentContext';
import { initials } from '../lib/utils';
import Icon from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

/** Testimonials – edit, add or delete them in the admin panel (Testimonials tab). */
export default function Testimonials() {
  const { settings } = useContent();
  const items = settings.testimonials;

  // Nothing to show? Hide the whole section instead of leaving an empty gap.
  if (!items.length) return null;

  return (
    <section id="testimonials" className="section">
      <div className="container-x">
        <SectionHeading
          eyebrow="Testimonials"
          title="Kind words from"
          accent="happy clients"
        />

        <div className="flex flex-wrap justify-center gap-5">
          {items.map((t, i) => (
            <Reveal
              key={`${t.name}-${i}`}
              delay={(i % 3) * 90}
              className="card flex w-full flex-col p-7 sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
            >
              <div className="mb-4 flex gap-1 text-brand-cyan" role="img" aria-label={`${t.rating || 5} out of 5 stars`}>
                {Array.from({ length: Math.max(0, Math.min(5, Number(t.rating) || 5)) }).map((_, s) => (
                  <Icon key={s} name="star" className="h-4 w-4" />
                ))}
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-white/80">“{t.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-gradient text-sm font-semibold">
                  {initials(t.name)}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{t.name}</span>
                  <span className="block text-xs text-white/55">{t.role}</span>
                </span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
