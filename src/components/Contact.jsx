import { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { BUDGETS, PROJECT_TYPES, SITE } from '../config/site';
import { mailHref, telHref, waHref } from '../lib/utils';
import Icon from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const EMPTY = { name: '', email: '', phone: '', projectType: '', budget: '', message: '', _gotcha: '' };

/**
 * Contact – enquiry form + quick-contact buttons.
 *
 * The form posts to Formspree, which emails every enquiry to you.
 * >>> Put your Formspree form ID in .env as VITE_FORMSPREE_FORM_ID (see README). <<<
 * If no ID is set yet, the form falls back to opening the visitor's email app,
 * so no enquiry is ever lost while you are setting things up.
 */
export default function Contact() {
  const { settings } = useContent();
  const { phone, phone2, email, whatsapp, whatsapp2, address } = settings.contact;

  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot: real people never see this field, bots fill it in. Pretend success and drop it.
    if (values._gotcha) {
      setStatus('success');
      return;
    }

    // No Formspree ID yet: open the visitor's email app with the message pre-filled.
    if (!SITE.formspreeId) {
      const body = `Name: ${values.name}\nEmail: ${values.email}\nPhone: ${values.phone}\nProject type: ${values.projectType}\nBudget: ${values.budget}\n\n${values.message}`;
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(
        'New project enquiry from ' + values.name
      )}&body=${encodeURIComponent(body)}`;
      return;
    }

    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch(`https://formspree.io/f/${SITE.formspreeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone,
          project_type: values.projectType,
          budget: values.budget,
          message: values.message,
          _subject: `New enquiry from ${values.name} (Nextsyght website)`,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.errors?.map((x) => x.message).join(', ') || 'Something went wrong.');
      }
      setStatus('success');
      setValues(EMPTY);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Could not send. Please try WhatsApp or email instead.');
    }
  };

  // Quick-contact buttons. The second WhatsApp / phone only appear if filled in from /admin.
  const waText = "Hi Nextsyght, I'd like to discuss a project.";
  const quick = [
    { icon: 'whatsapp', label: 'WhatsApp', sub: whatsapp2 ? whatsapp : 'Chat now', href: waHref(whatsapp, waText), external: true },
    whatsapp2 && { icon: 'whatsapp', label: 'WhatsApp 2', sub: whatsapp2, href: waHref(whatsapp2, waText), external: true },
    { icon: 'call', label: 'Call', sub: phone, href: telHref(phone) },
    phone2 && { icon: 'call', label: 'Call 2', sub: phone2, href: telHref(phone2) },
    { icon: 'mail', label: 'Email', sub: email, href: mailHref(email, 'Project enquiry') },
  ].filter(Boolean);

  return (
    <section id="contact" className="section section-alt">
      <div className="container-x">
        <SectionHeading
          eyebrow="Contact"
          title="Let's build your"
          accent="next project"
          subtitle="Tell me a little about it. You'll get a reply within one business day."
        />

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Form */}
          <Reveal className="card p-6 sm:p-8 lg:col-span-3">
            {status === 'success' ? (
              <div className="grid min-h-[22rem] place-items-center text-center" role="status">
                <div>
                  <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-brand-gradient shadow-glow">
                    <Icon name="check" className="h-8 w-8" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-semibold">Thank you!</h3>
                  <p className="mx-auto mt-2 max-w-sm text-white/65">
                    Your enquiry is on its way. I&apos;ll get back to you very soon.
                  </p>
                  <button type="button" className="btn-ghost mt-6" onClick={() => setStatus('idle')}>
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2" noValidate={false}>
                <div>
                  <label className="label" htmlFor="c-name">Name *</label>
                  <input id="c-name" className="input" required autoComplete="name" value={values.name} onChange={set('name')} placeholder="Your name" />
                </div>
                <div>
                  <label className="label" htmlFor="c-email">Email *</label>
                  <input id="c-email" type="email" className="input" required autoComplete="email" value={values.email} onChange={set('email')} placeholder="you@company.com" />
                </div>
                <div>
                  <label className="label" htmlFor="c-phone">Phone</label>
                  <input id="c-phone" type="tel" className="input" autoComplete="tel" value={values.phone} onChange={set('phone')} placeholder="+00 00000 00000" />
                </div>
                <div>
                  <label className="label" htmlFor="c-type">Project type *</label>
                  <select id="c-type" className="input" required value={values.projectType} onChange={set('projectType')}>
                    <option value="" disabled>Select…</option>
                    {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="c-budget">Budget</label>
                  <select id="c-budget" className="input" value={values.budget} onChange={set('budget')}>
                    <option value="">Select…</option>
                    {BUDGETS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="c-message">Message *</label>
                  <textarea id="c-message" rows={5} className="input resize-y" required value={values.message} onChange={set('message')} placeholder="Tell me about your project, goals and timeline…" />
                </div>

                {/* Honeypot (hidden from people) */}
                <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                  <label>Leave this empty<input tabIndex={-1} autoComplete="off" value={values._gotcha} onChange={set('_gotcha')} /></label>
                </div>

                <div className="sm:col-span-2">
                  <button type="submit" disabled={status === 'sending'} className="btn-primary w-full disabled:opacity-60 sm:w-auto">
                    {status === 'sending' ? 'Sending…' : 'Send Enquiry'}
                    <Icon name="arrow" className="h-4 w-4" />
                  </button>
                  {status === 'error' && (
                    <p role="alert" className="mt-3 text-sm text-red-300">{errorMsg}</p>
                  )}
                </div>
              </form>
            )}
          </Reveal>

          {/* Quick contact */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {quick.map((q, i) => (
              <Reveal key={q.label} delay={i * 90}>
                <a
                  href={q.href}
                  {...(q.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="card group flex items-center gap-4 p-5 hover:-translate-y-1 hover:border-brand-cyan/40 hover:shadow-glow"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-gradient shadow-glow">
                    <Icon name={q.icon} className="h-6 w-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{q.label}</span>
                    <span className="block truncate text-sm text-white/60">{q.sub}</span>
                  </span>
                  <Icon name="arrow" className="ml-auto h-5 w-5 text-white/40 transition group-hover:translate-x-1 group-hover:text-brand-cyan" />
                </a>
              </Reveal>
            ))}
            {address && (
              <Reveal delay={270} className="card flex items-center gap-4 p-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-brand-gradient-soft text-brand-cyan">
                  <Icon name="pin" className="h-6 w-6" />
                </span>
                <span>
                  <span className="block font-semibold">Based in</span>
                  <span className="block text-sm text-white/60">{address}</span>
                </span>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
