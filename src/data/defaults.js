/**
 * Default content.
 *
 * This is what the site shows until you save changes in the admin panel
 * (or if the backend is not configured yet). Anything saved from /admin
 * is merged on top of these values, so a missing field never breaks the page.
 *
 * All values below are PLACEHOLDERS – replace them from /admin.
 */

export const DEFAULT_SETTINGS = {
  contact: {
    phone: '+00 00000 00000',
    // Second phone / WhatsApp are optional: leave empty to hide them.
    phone2: '',
    email: 'hello@yourdomain.com',
    // Digits only, with country code and no "+" (used for wa.me links)
    whatsapp: '000000000000',
    whatsapp2: '',
    address: 'Your City, Country',
  },
  social: {
    instagram: 'https://www.instagram.com/',
    linkedin: 'https://www.linkedin.com/',
  },
  hero: {
    eyebrow: 'Freelance web development studio',
    headline: 'We Build the Web',
    headlineAccent: 'You Envision',
    subtext:
      'Fast, beautiful, mobile-first websites, online stores and web apps that turn visitors into customers. From first idea to launch day, we handle it all.',
    ctaPrimary: 'Start a Project',
    ctaSecondary: 'View My Work',
  },
  services: [
    {
      icon: 'globe',
      title: 'Website Development',
      description:
        'Custom, responsive websites that load fast, look sharp on every screen and are built to rank on Google.',
    },
    {
      icon: 'cart',
      title: 'E-commerce Stores',
      description:
        'Online stores with smooth checkout, secure payments and easy product management so you can start selling quickly.',
    },
    {
      icon: 'app',
      title: 'Web Apps',
      description:
        'Dashboards, portals and custom tools that automate your work, built with modern, scalable technology.',
    },
    {
      icon: 'refresh',
      title: 'Redesigns',
      description:
        'Give your outdated site a fresh, modern look and better performance, without losing the traffic you already have.',
    },
    {
      icon: 'wrench',
      title: 'Maintenance',
      description:
        'Updates, security, backups and quick fixes, so your website stays fast, safe and online while you focus on business.',
    },
  ],
  testimonials: [
    {
      name: 'Client Name',
      role: 'Company, Role',
      quote:
        'This is a placeholder testimonial. Add a real client quote from the admin panel to build trust with new visitors.',
      rating: 5,
    },
    {
      name: 'Client Name',
      role: 'Company, Role',
      quote:
        'This is a placeholder testimonial. Ask happy clients for a short review and paste it here from the admin panel.',
      rating: 5,
    },
    {
      name: 'Client Name',
      role: 'Company, Role',
      quote:
        'This is a placeholder testimonial. You can edit the name, role, quote and star rating, or delete it entirely.',
      rating: 5,
    },
  ],
};

// Sample projects shown only when the backend is not configured (or fails to load).
// Once Supabase is set up, projects come from the database instead.
export const DEFAULT_PROJECTS = [
  {
    id: 'sample-1',
    title: 'Project One',
    description: 'A modern business website with a clean design, fast loading and strong SEO foundations.',
    category: 'websites',
    tags: ['React', 'Tailwind', 'SEO'],
    link: 'https://example.com',
    image_url: '/placeholders/project-1.svg',
    sort_order: 1,
  },
  {
    id: 'sample-2',
    title: 'Project Two',
    description: 'A full e-commerce store with product catalogue, cart, secure checkout and order management.',
    category: 'ecommerce',
    tags: ['Shopify', 'Payments', 'Mobile-first'],
    link: 'https://example.com',
    image_url: '/placeholders/project-2.svg',
    sort_order: 2,
  },
  {
    id: 'sample-3',
    title: 'Project Three',
    description: 'A custom web app with a secure login, live dashboard and role-based access for a growing team.',
    category: 'webapps',
    tags: ['React', 'Supabase', 'Dashboard'],
    link: 'https://example.com',
    image_url: '/placeholders/project-3.svg',
    sort_order: 3,
  },
  {
    id: 'sample-4',
    title: 'Project Four',
    description: 'A complete redesign of an outdated website, with a new look, better UX and faster performance.',
    category: 'websites',
    tags: ['Redesign', 'UX', 'Performance'],
    link: 'https://example.com',
    image_url: '/placeholders/project-4.svg',
    sort_order: 4,
  },
];
