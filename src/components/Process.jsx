import Icon from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

// Edit the wording of the four steps here.
const STEPS = [
  {
    icon: 'chat',
    title: 'Audit',
    text: 'We talk about your goals, audience and budget, so we understand exactly what success looks like for you.',
  },
  {
    icon: 'pen',
    title: 'Design',
    text: 'We create a clear, modern design for you to review. We refine it together until it feels right.',
  },
  {
    icon: 'code',
    title: 'Build',
    text: 'Your design becomes a fast, responsive, SEO-ready website or app, with regular progress updates.',
  },
  {
    icon: 'rocket',
    title: 'Launch',
    text: 'After careful testing we go live. I stay close for support, tweaks and future improvements.',
  },
];

/** Process – the four steps from first chat to launch. */
export default function Process() {
  return (
    <section id="process" className="section">
      <div className="container-x">
        <SectionHeading
          eyebrow="How It Works"
          title="A simple process,"
          accent="no surprises"
          subtitle="Four clear steps from your first message to launch day."
        />

        <div className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* connecting line (desktop) */}
          <div
            className="pointer-events-none absolute left-[12%] right-[12%] top-[3.1rem] hidden h-px bg-gradient-to-r from-brand-cyan/0 via-brand-blue/60 to-brand-violet/0 lg:block"
            aria-hidden="true"
          />

          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 110} className="card relative p-7 text-center">
              <div className="relative mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-brand-gradient text-white shadow-glow">
                <Icon name={step.icon} className="h-6 w-6" />
                <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border border-white/20 bg-navy-900 text-[11px] font-bold text-brand-cyan">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{step.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
