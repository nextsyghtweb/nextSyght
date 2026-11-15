import Icon from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

// Edit the four reasons here.
const REASONS = [
  {
    icon: 'bolt',
    title: 'Fast Delivery',
    text: 'Clear timelines and quick turnaround, so you launch sooner and start getting results.',
  },
  {
    icon: 'sparkles',
    title: 'Modern Design',
    text: 'Clean, current, brand-focused design that makes a strong first impression.',
  },
  {
    icon: 'mobile',
    title: 'Mobile-First',
    text: 'Built for phones first, then scaled up, so your site feels great on every screen.',
  },
  {
    icon: 'search',
    title: 'SEO-Ready',
    text: 'Clean code, fast loading and proper meta tags, so Google can find and understand your site.',
  },
];

/** Why Nextsyght – four key benefits. */
export default function WhyUs() {
  return (
    <section id="why" className="section section-alt">
      <div className="container-x">
        <SectionHeading
          eyebrow="Why Nextsyght"
          title="Built to look great and"
          accent="perform better"
          subtitle="Four things every project gets, whatever the size."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r, i) => (
            <Reveal
              key={r.title}
              delay={i * 90}
              className="card group p-7 hover:-translate-y-1.5 hover:border-brand-violet/50 hover:shadow-glow-violet"
            >
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-brand-gradient-soft text-brand-cyan transition duration-300 group-hover:scale-110 group-hover:text-white">
                <Icon name={r.icon} className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{r.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
