/**
 * Static site configuration.
 *
 * Things that rarely change live here. Everything you want to edit without
 * touching code (phone, email, hero text, services, testimonials, projects…)
 * is managed from the /admin panel instead.
 */

export const SITE = {
  name: 'Nextsyght', // always written exactly like this
  tagline: 'We Build the Web You Envision',
  // Formspree form ID, set in your .env file (VITE_FORMSPREE_FORM_ID)
  formspreeId: import.meta.env.VITE_FORMSPREE_FORM_ID || '',
};

// Currency symbol used in the budget dropdown of the contact form.
// Change it (for example to '₹', '£' or '€') and adjust the ranges below.
const CUR = '$';

export const PROJECT_TYPES = [
  'Website development',
  'E-commerce store',
  'Web app',
  'Website redesign',
  'Maintenance & support',
  'Not sure yet',
];

export const BUDGETS = [
  `Under ${CUR}500`,
  `${CUR}500 – ${CUR}1,500`,
  `${CUR}1,500 – ${CUR}3,000`,
  `${CUR}3,000 – ${CUR}6,000`,
  `${CUR}6,000+`,
  'Not sure yet',
];

// Categories used for project filters and in the admin project form.
export const PROJECT_CATEGORIES = [
  { value: 'websites', label: 'Websites' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'webapps', label: 'Web Apps' },
];

export const NAV_LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#projects', label: 'Work' },
  { href: '#process', label: 'Process' },
  { href: '#why', label: 'Why Us' },
  { href: '#testimonials', label: 'Reviews' },
  { href: '#contact', label: 'Contact' },
];

// Icons that can be chosen for a service in the admin panel (see components/Icons.jsx)
export const SERVICE_ICON_KEYS = [
  'globe',
  'cart',
  'app',
  'refresh',
  'wrench',
  'code',
  'bolt',
  'sparkles',
  'mobile',
  'search',
  'rocket',
  'pen',
];
