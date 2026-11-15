import { useContent } from '../context/ContentContext';
import Icon from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

/** Services – cards come from the admin panel (Services tab). Any number of cards stays centred. */
export default function Services() {
  const { settings } = useContent();

  return (
    <section id="services" className="section">
      <div className="container-x">
        <SectionHeading
          eyebrow="Services"
          title="Everything you need to"
          accent="grow online"
          subtitle="From a first website to a full custom web app, I design, build and look after it all."
        />

        <div className="flex flex-wrap justify-center gap-5">
          {settings.services.map((service, i) => (
            <Reveal
              key={`${service.title}-${i}`}
              delay={(i % 3) * 90}
              className="group card w-full p-7 hover:-translate-y-1.5 hover:border-brand-cyan/40 hover:shadow-glow sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
            >
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow transition duration-300 group-hover:scale-110">
                <Icon name={service.icon} className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{service.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
