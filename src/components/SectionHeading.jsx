import Reveal from './Reveal';

/** Consistent heading block used at the top of each section. */
export default function SectionHeading({ eyebrow, title, accent, subtitle, align = 'center' }) {
  return (
    <Reveal className={`mx-auto mb-12 max-w-2xl sm:mb-16 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      {eyebrow && (
        <span className="chip mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        {title} {accent && <span className="gradient-text">{accent}</span>}
      </h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-white/65 sm:text-lg">{subtitle}</p>}
    </Reveal>
  );
}
