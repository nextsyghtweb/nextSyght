# NextSyght
NextSyght is an Express website for SEO/AEO audits, with a public frontend,
Supabase projects/settings/enquiries/reviews, project image uploads,
Supabase Auth administration, Formspree enquiry forwarding and a local RAG chat.

## Tech stack

- Node.js and Express
- Browser HTML/CSS/JavaScript
- Supabase Auth, Database and Storage
- Formspree enquiry forwarding
- Local `transformers.js` RAG chat

## Folder structure

| Path | Purpose |
|---|---|
| `server.js` | Express entry point and API router setup |
| `routes/` | Public and admin API route modules |
| `middleware/adminAuth.js` | Supabase login verification and admin email allowlist |
| `public/` | Existing website and admin frontend |
| `rag/` | Local RAG knowledge and inference engine |
| `supabaseClient.js` | Server-only Supabase service-role client |
| `supabase/schema.sql` | Supabase tables, RLS policies and Storage setup |
| `.env.example` | Placeholder environment variables |

## Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql).
3. In **Storage**, confirm that the public `project-images` bucket exists.
4. Copy the project URL and keys from **Project Settings > API**.
5. Copy `.env.example` to `.env` and fill in the placeholders.
6. In **Authentication > Users**, create `nextsyght.web@gmail.com` and set a strong password.

SQLite is empty, so no existing project or review records need migration.
The existing contact defaults are seeded into `site_settings`.

## Environment variables

| Variable | Purpose | Secret? |
|---|---|---|
| `PORT` | Express listening port | No |
| `SUPABASE_URL` | Supabase project URL | Public project value |
| `SUPABASE_ANON_KEY` | Supabase browser/public key | Public key; not an elevated secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase privileged client | **Yes; server only** |
| `ADMIN_EMAILS` | Comma-separated Supabase Auth users allowed to manage admin data | Sensitive configuration |
| `FORMSPREE_ENDPOINT` | Formspree form submission URL | No; keep server-side |

Never place `SUPABASE_SERVICE_ROLE_KEY` in HTML or JavaScript under `public/`.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
cp .env.example .env
npm start
```

Open `http://localhost:3000`.

## Admin setup

Set `ADMIN_EMAILS=nextsyght.web@gmail.com` in `.env`. Login at `/admin.html`
uses Supabase Auth. The server verifies the access token and allowlists only
the configured email.

The dashboard manages:

- Projects, including Supabase Storage image upload, replacement and deletion
- Contact phone numbers, WhatsApp number, email and address
- Enquiries, including search, mark-read and delete
- Reviews, including approve, hide and delete

Project images must be JPG, PNG or WEBP and no larger than 5 MB.

## Formspree setup

1. Create a form in Formspree.
2. Copy its endpoint, such as `https://formspree.io/f/your-form-id`.
3. Set `FORMSPREE_ENDPOINT` in `.env`.

The enquiry API always saves in Supabase first. If forwarding fails or the
endpoint is blank, the enquiry remains available in the admin dashboard.

## API endpoints

| Endpoint | Access | Description |
|---|---|---|
| `GET /api/config` | Public | Supplies the Supabase URL and anon key to the browser |
| `GET /api/projects` | Public | Lists projects |
| `POST/PUT/DELETE /api/projects*` | Allowed admin | Adds, updates or deletes projects |
| `GET /api/settings` | Public | Reads contact settings |
| `PUT /api/settings` | Allowed admin | Updates contact settings |
| `POST /api/enquiries` | Public | Validates and saves an enquiry, then forwards to Formspree |
| `GET /api/enquiries` | Allowed admin | Lists enquiries |
| `PATCH /api/enquiries/:id/read` | Allowed admin | Marks an enquiry read |
| `DELETE /api/enquiries/:id` | Allowed admin | Deletes an enquiry |
| `GET /api/reviews` | Public | Lists approved reviews |
| `GET /api/reviews/all` | Allowed admin | Lists all reviews |
| `POST /api/reviews` | Public | Adds a review |
| `PATCH /api/reviews/:id/approve` | Allowed admin | Shows or hides a review |
| `DELETE /api/reviews/:id` | Allowed admin | Deletes a review |
| `POST /api/admin/verify` | Allowed admin | Verifies an admin access token |
| `GET /api/admin/stats` | Allowed admin | Returns dashboard counts |
| `POST /api/chat` | Public | Sends a prompt to the local RAG chat |

## Deploying with Cloudflare Pages

The frontend and Express backend cannot be deployed together directly to
Cloudflare Pages. Cloudflare Pages can host the static files in `public/`,
while Express must run on a Node-capable host.

### 1. Deploy the Express backend

Deploy this repository to Render, Railway, Fly.io or a VPS. Set these
environment variables in the backend host:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_EMAILS=nextsyght.web@gmail.com
FORMSPREE_ENDPOINT=https://formspree.io/f/your-form-id
PORT=3000
```

Use the port required by the hosting platform if it does not automatically
provide `PORT`. Keep `SUPABASE_SERVICE_ROLE_KEY` only in server-side hosting
configuration.

After deployment, copy the public Express API URL, for example:

```text
https://nextsyght-api.onrender.com
```

Confirm these routes respond:

```text
https://nextsyght-api.onrender.com/api/config
https://nextsyght-api.onrender.com/api/projects
https://nextsyght-api.onrender.com/api/settings
```

### 2. Deploy the frontend to Cloudflare Pages

1. Push the repository to GitHub or GitLab.
2. In Cloudflare Dashboard, open **Workers & Pages > Create application > Pages**
   and connect the repository.
3. Use these build settings:

```text
Framework preset: None
Build command: (leave empty)
Build output directory: public
Root directory: /
```

There is no frontend build step because `public/` already contains HTML,
CSS and JavaScript.

Do not upload or configure `SUPABASE_SERVICE_ROLE_KEY` as a Cloudflare Pages
environment variable.

### 3. Route API requests through the frontend domain

The browser code calls relative URLs such as `/api/projects` and
`/api/settings`. Create `public/_redirects` with this line, replacing the
backend hostname:

```text
/api/*  https://nextsyght-api.onrender.com/api/:splat  200
```

Cloudflare Pages then proxies `/api/*` from the same frontend domain to
Express. Redeploy Pages after adding or changing `_redirects`.

If Cloudflare Pages does not proxy a specific route on your plan or setup,
instead set the frontend API base URL to the Express HTTPS origin and enable
CORS on Express for the frontend domain.

### 4. Add the domain and configure DNS

1. In Cloudflare Pages, open **Custom domains**.
2. Add the website domain, for example `nextsyght.com`.
3. Add or verify the DNS records shown by Cloudflare.
4. Enable HTTPS and wait for the certificate to become active.

The API backend does not need to use the same domain. If it uses a separate
subdomain, add that subdomain and its DNS/Caddy/Nginx or hosting-provider
certificate settings there.

### 5. Final deployment checklist

- Confirm the homepage loads on the Pages domain.
- Confirm `/api/projects`, `/api/settings` and `/api/reviews` return JSON.
- Confirm `/admin.html` loads.
- Confirm the Supabase Auth login works.
- Confirm project image uploads work.
- Confirm contact details update and appear on the homepage.
- Confirm enquiries save in Supabase and forward to Formspree when configured.
- Confirm WhatsApp opens with the correct number.
- Confirm logged-out users receive a `401` or `403` for admin actions.
- Confirm no browser request exposes the service-role key.
