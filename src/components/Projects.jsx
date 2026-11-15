import { useMemo, useState } from 'react';
import { useContent } from '../context/ContentContext';
import { PROJECT_CATEGORIES } from '../config/site';
import Icon from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import TiltCard from './TiltCard';

const FILTERS = [{ value: 'all', label: 'All' }, ...PROJECT_CATEGORIES];

/** A single project card (tilts in 3D on hover on desktop). */
function ProjectCard({ project, index }) {
  return (
    <TiltCard className="animate-fade-up" style={{ animationDelay: `${index * 70}ms` }}>
      <div className="relative aspect-[16/10] overflow-hidden bg-navy-700">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={`${project.title} – project preview`}
            loading="lazy"
            decoding="async"
            width="900"
            height="563"
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-brand-gradient-soft text-white/40">
            <Icon name="app" className="h-12 w-12" />
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-brand-cyan"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-xl font-semibold">{project.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/65">{project.description}</p>

        {project.link ? (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition hover:text-brand-cyan"
            aria-label={`View project: ${project.title}`}
          >
            View Project <Icon name="external" className="h-4 w-4" />
          </a>
        ) : (
          <span className="mt-5 inline-block text-sm font-medium text-white/40">Case study coming soon</span>
        )}
      </div>
    </TiltCard>
  );
}

/** Projects – filterable grid. Projects are managed from the admin panel (Projects tab). */
export default function Projects() {
  const { projects, loading } = useContent();
  const [filter, setFilter] = useState('all');

  const visible = useMemo(
    () => (filter === 'all' ? projects : projects.filter((p) => p.category === filter)),
    [projects, filter]
  );

  return (
    <section id="projects" className="section section-alt">
      <div className="container-x">
        <SectionHeading
          eyebrow="Selected Work"
          title="Projects that"
          accent="speak for themselves"
          subtitle="A few recent builds. Hover a card, then take a closer look."
        />

        {/* Filter buttons */}
        <Reveal className="mb-10 flex flex-wrap justify-center gap-2.5" role="group" aria-label="Filter projects">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={`rounded-full border px-5 py-2 text-sm font-medium transition duration-300 ${
                filter === f.value
                  ? 'border-transparent bg-brand-gradient text-white shadow-glow'
                  : 'border-white/15 bg-white/5 text-white/70 hover:border-brand-cyan/50 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </Reveal>

        {/* Grid (key = filter, so cards re-animate whenever the filter changes) */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-80 animate-shimmer rounded-2xl border border-white/10 bg-navy-800/70" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="py-10 text-center text-white/55">No projects in this category yet. Check back soon.</p>
        ) : (
          <div key={filter} className="grid gap-6 md:grid-cols-2">
            {visible.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
