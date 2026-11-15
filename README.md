# Nextsyght – Portfolio & Lead-Generation Website

React + Tailwind CSS + React Three Fiber (Three.js) front end, with a **Supabase** backend so you can edit the site from a password-protected `/admin` page. Enquiries are emailed to you through **Formspree**.

**What you get**

- Hero with an interactive 3D glowing `< >` eye that follows the mouse and reacts to scrolling
- 3D particles and floating shapes in the background, 3D-tilting project cards, scroll-reveal animations
- Automatic lightweight fallback (SVG eye + CSS shapes) on weak devices, reduced-motion users, no-WebGL browsers, or if the 3D scene runs slowly
- Sections: Hero, Services, Projects (filters), Process, Why Nextsyght, Testimonials, Contact, Footer
- Sticky **Get a Free Quote** button and floating **WhatsApp** button
- Hidden `/admin` to edit contact details, social links, hero text, services, testimonials and projects (with image upload), saved permanently for all visitors
- SEO meta tags, Open Graph / Twitter tags, structured data, `robots.txt`, `sitemap.xml`, alt text on images

---

## 1. Run it on your computer

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
cp .env.example .env     # then fill in the values (steps 2 and 3 below)
npm run dev              # opens http://localhost:5173
```

The site works immediately with placeholder content, even before you set up the backend.
Tip: add `?fallback=1` to the URL (`http://localhost:5173/?fallback=1`) to preview the non-3D fallback.

---

## 2. Contact form: where to put your key (Formspree)

1. Sign up free at <https://formspree.io> and click **New form**. Use the email where you want enquiries (for example the one you check daily).
2. Copy the **form ID** from the form's URL: `https://formspree.io/f/`**`xyzabcde`** ← this part.
3. Put it in your `.env` file:
   ```
   VITE_FORMSPREE_FORM_ID=xyzabcde
   ```
4. On Vercel/Netlify add the same variable (see section 5).
5. Send a test enquiry from the site. Formspree asks you to confirm your email the first time.

Until an ID is set, the form simply opens the visitor's email app with the message filled in, so no enquiry is lost while you set up.
Spam protection: there is a hidden honeypot field, and you can also enable reCAPTCHA in the Formspree dashboard.

---

## 3. Backend setup (Supabase) – needed for `/admin`

Supabase is free for a site this size.

### 3.1 Create the project
1. Sign up at <https://supabase.com> → **New project**. Choose a name, a strong database password (save it somewhere), and the region closest to your visitors.
2. Wait about a minute for it to finish setting up.

### 3.2 Create the admin login (this is your admin password)
1. In Supabase: **Authentication → Users → Add user → Create new user**.
2. Enter **your email** and a **strong password**. Tick **Auto Confirm User**. This is what you will type at `/admin`.
3. **Important – stop strangers from registering:** go to **Authentication → Sign In / Providers** (or **Settings**) and turn **OFF** "Allow new users to sign up". Even if they did, the database rules in the next step only accept *your* email, but turning signups off is good practice.

**To change the admin password later:** Authentication → Users → click your user → **Send password recovery**, or delete the user and create it again with a new password.

### 3.3 Create the tables and security rules
1. Open `supabase/schema.sql` from this project in a text editor.
2. Find `YOUR_ADMIN_EMAIL` and replace it with **the exact email you used in step 3.2**.
3. In Supabase: **SQL Editor → New query**, paste the whole file, click **Run**. You should see "Success".

This creates the settings table, the projects table (with your 4 sample projects), a public image bucket called `project-images`, and rules so that **anyone can read, but only your email can change anything**.

### 3.4 Connect the site to Supabase
1. In Supabase: **Project Settings → API**.
2. Copy **Project URL** and the **anon public** key into `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
   The anon key is designed to be public. **Never** use the `service_role` key anywhere in this project.
3. Restart `npm run dev`, open <http://localhost:5173/admin> and log in.

---

## 4. Using the admin panel

Go to **yourdomain.com/admin** (it isn't linked anywhere on the site and is hidden from search engines).

| Tab | What you can change |
| --- | --- |
| Contact & Social | Phone, email, WhatsApp number, address, Instagram and LinkedIn links |
| Hero text | Headline, gradient part of the headline, subtext, button text |
| Services | Add / edit / reorder / delete (choose an icon, title, description) |
| Projects | Add / edit / delete / reorder; title, description, category, tags, link, image upload |
| Testimonials | Add / edit / reorder / delete (name, role, quote, stars) |

Press **Save changes** on each tab. Changes appear for every visitor on their next page load, with no redeploy.

Notes
- **WhatsApp number:** digits only with country code, e.g. `919876543210`.
- **Project image:** a 16:10 screenshot (e.g. 1600×1000) looks best. Max 5 MB.
- **Category** decides which filter button (Websites / E-commerce / Web Apps) shows the project.

---

## 5. Deploy

Both options give you free HTTPS and a free hosting URL. Push this folder to a GitHub repository first.

### Vercel
1. <https://vercel.com> → **Add New → Project** → import your GitHub repo (framework: Vite is detected automatically).
2. Under **Environment Variables** add:
   `VITE_FORMSPREE_FORM_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
3. **Deploy.** `vercel.json` already makes `/admin` work on refresh.

### Netlify
1. <https://netlify.com> → **Add new site → Import an existing project** → pick your repo.
2. Build command `npm run build`, publish directory `dist` (already set in `netlify.toml`).
3. **Site configuration → Environment variables**: add the same three variables, then **Deploy**.

> Environment variables are baked in at build time. If you change one, **redeploy**.

### Custom domain
Add your domain in the Vercel/Netlify dashboard and follow their DNS instructions.

### After your domain is live (SEO / sharing)
Search for `YOUR-DOMAIN.com` and replace it with your real domain in:
- `index.html` (canonical, Open Graph and Twitter tags, structured data)
- `public/robots.txt`
- `public/sitemap.xml`

Then test the link preview at <https://www.opengraph.xyz> (Facebook/WhatsApp/LinkedIn cache previews, so re-scrape if you change the image).

---

## 6. Customising

| Want to change | Where |
| --- | --- |
| **Logo** | Replace `public/logo.svg` (keep the name, or edit `src/components/Logo.jsx`). Also `public/favicon.svg`. |
| **Share image** | Replace `public/og-image.png` (1200×630). |
| Colours | `tailwind.config.js` → `colors` and `backgroundImage` |
| Font | Poppins is loaded in `index.html`; for Montserrat change the Google Fonts link there and the order in `tailwind.config.js` |
| Budget currency / ranges, project types | `src/config/site.js` |
| Process steps, "Why Nextsyght" points | `src/components/Process.jsx`, `src/components/WhyUs.jsx` |
| Default text before you use the admin | `src/data/defaults.js` |

---

## 7. How the 3D and fallback work

- One fixed WebGL canvas sits behind the page (`src/components/three/`): the eye, particles and floating shapes share it, so there is only a single WebGL context.
- The 3D code is a **lazy-loaded chunk**: it is only downloaded on devices that pass `detectCapability()` (`src/lib/device.js`): WebGL present, not "reduce motion", not a low-memory / ≤2-core device, not Data Saver.
- `FpsGuard` checks the frame rate in the first seconds; under ~24 FPS it switches to the fallback automatically. A WebGL context loss or a load error also triggers the fallback.
- Mobile gets fewer particles/shapes and a lower pixel ratio.
- Card tilt only runs on devices with a real mouse.

---

## 8. Project structure

```
src/
  components/      Sections, navbar, floating buttons, tilt card, reveal, icons
    three/         HeroEye, Particles, FloatingShapes, FpsGuard, BackgroundScene
  pages/           Home, Admin (+ admin/ editors), NotFound
  context/         ContentContext – loads settings + projects from Supabase
  lib/             Supabase client, device detection, helpers
  config/ data/    Static config and default content
supabase/schema.sql   Database + security rules (run once)
public/               Logo, favicon, OG image, placeholder project images, robots, sitemap
```

## Troubleshooting

- **Admin says "Backend not connected":** `.env` values are missing or you didn't restart / redeploy after adding them.
- **"Incorrect email or password":** use the user created in Supabase → Authentication → Users.
- **Saving says "row-level security" / permission error:** the email in `schema.sql` doesn't exactly match the email you log in with. Fix the email in the `is_admin()` function and run it again.
- **Site shows sample projects after setup:** schema not run yet, or the Supabase URL/key is wrong (check the browser console).
- **Form not arriving:** confirm the Formspree email, check its spam folder, and make sure `VITE_FORMSPREE_FORM_ID` is set on your host and you redeployed.
