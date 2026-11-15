/** Small helper functions used across the site. */

/** Join class names, ignoring falsy values. */
export const cx = (...parts) => parts.filter(Boolean).join(' ');

/** Keep digits only: "+1 (415) 555-0123" -> "14155550123" */
export const digitsOnly = (value = '') => String(value).replace(/\D/g, '');

/** tel: link from a phone number string. */
export const telHref = (phone = '') => `tel:+${digitsOnly(phone)}`;

/** mailto: link. */
export const mailHref = (email = '', subject = '') =>
  `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

/** WhatsApp click-to-chat link. `number` may include +, spaces, dashes. */
export const waHref = (number = '', text = '') =>
  `https://wa.me/${digitsOnly(number)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/** First letters of a name, for avatar circles. */
export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';

/** "react, tailwind , seo" -> ['react','tailwind','seo'] */
export const parseTags = (text = '') =>
  text
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
