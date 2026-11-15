import { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { waHref } from '../lib/utils';
import Icon from './Icons';

/**
 * FloatingActions – the lead-capture buttons that stay on screen on every page:
 *   - "Get a Free Quote" (bottom-left, scrolls to the contact form)
 *   - Floating WhatsApp button (bottom-right)
 *       · one number  -> opens WhatsApp directly
 *       · two numbers -> opens a small menu so the visitor can pick one
 *
 * `quoteHref` is "#contact" on the home page and "/#contact" on other pages.
 */
export default function FloatingActions({ quoteHref = '#contact' }) {
  const { settings } = useContent();
  const { whatsapp, whatsapp2 } = settings.contact;
  const [open, setOpen] = useState(false);

  const text = "Hi Nextsyght, I'd like a free quote for my project.";
  const hasTwo = Boolean(whatsapp2);

  const buttonClass =
    'relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.7)] transition hover:scale-110';

  return (
    <>
      <a href={quoteHref} className="btn-primary fixed bottom-5 left-4 z-50 !px-5 !py-3 shadow-glow sm:left-6">
        Get a Free Quote
      </a>

      <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:right-6">
        {hasTwo && open && (
          <div className="flex flex-col gap-2" role="menu">
            {[whatsapp, whatsapp2].map((num, i) => (
              <a
                key={num}
                role="menuitem"
                href={waHref(num, text)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-navy-900/95 px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur transition hover:border-[#25D366]"
              >
                <Icon name="whatsapp" className="h-4 w-4 text-[#25D366]" />
                WhatsApp {i + 1}
              </a>
            ))}
          </div>
        )}

        {hasTwo ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Chat with Nextsyght on WhatsApp"
            aria-expanded={open}
            className={buttonClass}
          >
            <span className="absolute inset-0 animate-ping-slow rounded-full bg-[#25D366]" aria-hidden="true" />
            <Icon name={open ? 'close' : 'whatsapp'} className="relative h-7 w-7" />
          </button>
        ) : (
          <a
            href={waHref(whatsapp, text)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Nextsyght on WhatsApp"
            className={buttonClass}
          >
            <span className="absolute inset-0 animate-ping-slow rounded-full bg-[#25D366]" aria-hidden="true" />
            <Icon name="whatsapp" className="relative h-7 w-7" />
          </a>
        )}
      </div>
    </>
  );
}
