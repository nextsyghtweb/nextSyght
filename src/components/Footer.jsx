import { useContent } from '../context/ContentContext';
import { NAV_LINKS, SITE } from '../config/site';
import { mailHref, telHref } from '../lib/utils';
import Icon from './Icons';
import Logo from './Logo';

/** Footer – logo, links, contact details and social icons (all editable from /admin). */
export default function Footer({ homeHref = '#home' }) {
  const { settings } = useContent();
  const { contact, social } = settings;
  const year = new Date().getFullYear();

  const socials = [
    { name: 'Instagram', icon: 'instagram', href: social.instagram },
    { name: 'LinkedIn', icon: 'linkedin', href: social.linkedin },
  ].filter((s) => s.href);

  return (
    <footer className="relative z-10 border-t border-white/10 bg-navy-950/90">
      <div className="container-x grid gap-10 py-14 md:grid-cols-3">
        <div>
          <Logo href={homeHref} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">{SITE.tagline}.</p>
          <div className="mt-5 flex gap-3">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Nextsyght on ${s.name}`}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-brand-cyan/60 hover:text-brand-cyan"
              >
                <Icon name={s.icon} className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Footer">
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">Explore</h4>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={homeHref.replace('#home', '') + l.href} className="text-white/70 transition hover:text-brand-cyan">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">Get in touch</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><a className="hover:text-brand-cyan" href={telHref(contact.phone)}>{contact.phone}</a></li>
            {contact.phone2 && (
              <li><a className="hover:text-brand-cyan" href={telHref(contact.phone2)}>{contact.phone2}</a></li>
            )}
            <li><a className="hover:text-brand-cyan" href={mailHref(contact.email)}>{contact.email}</a></li>
            {contact.address && <li>{contact.address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/45">
        © {year} Nextsyght. All rights reserved.
      </div>
    </footer>
  );
}
