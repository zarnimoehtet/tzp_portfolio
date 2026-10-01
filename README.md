# Photographer Portfolio

A premium, single-photographer portfolio website with an admin dashboard.

**One photographer → one project → one dashboard → one beautiful portfolio website.**

- **Public site**: editorial, photography-first design (Home, Portfolio, Album, Packages, About, Contact)
- **Admin dashboard** at `/admin`: photos, albums, packages, testimonials, about, contact, website settings, inquiries
- **Stack**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Supabase (Postgres + Auth), Cloudflare R2, React Hook Form + Zod, Lucide

---

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in values (see below)
npm run dev
```

The public site renders with placeholder content before Supabase is configured, so you can work on design immediately.

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the schema: open **SQL Editor** and paste `supabase/migrations/20261001000000_init.sql`
   (or `supabase db push` with the Supabase CLI).
3. **Authentication → Providers → Email**: keep email enabled, and **disable "Allow new users to sign up"**.
4. **Authentication → Users → Add user**: create the photographer's account (email + password).
5. Grant that user admin access (SQL Editor):

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'photographer@example.com';
   ```

6. Copy **Project URL** and **anon public key** (Project Settings → API) into `.env.local`.

No service-role key is used. All access control is enforced by Row Level Security:
visitors can read published content and submit inquiries; only users in `public.admins` can write.

## 2. Cloudflare R2

1. Create a bucket (e.g. `portfolio-images`).
2. Make it publicly readable: **Settings → Custom Domains** (recommended, e.g. `images.yourdomain.com`) or enable the `r2.dev` URL. Put that URL in `R2_PUBLIC_URL`.
3. **Manage R2 API Tokens → Create token** with *Object Read & Write* for this bucket. Copy the Access Key ID, Secret, and your Account ID.
4. **Settings → CORS policy** (browsers upload originals directly to R2):

   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["Content-Type"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

5. **Settings → Object lifecycle rules**: add a rule that deletes objects with prefix `tmp/` after 1 day (cleans up abandoned uploads).

## 3. Deploy to Vercel

1. Import the repository in Vercel (framework preset: Next.js).
2. Add every variable from `.env.example` under **Settings → Environment Variables**. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
3. Deploy. Add your production domain to the R2 CORS `AllowedOrigins`.

## Environment variables

| Variable | Where it's used |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, Open Graph |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (safe in the browser; RLS protects data) |
| `R2_ACCOUNT_ID` | Cloudflare account ID (server only) |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | R2 API token (server only) |
| `R2_BUCKET_NAME` | Bucket name |
| `R2_PUBLIC_URL` | Public bucket URL, no trailing slash |
| `IMAGE_FORMAT` | Optional: `webp` (default) or `avif` |

---

## Architecture

```text
src/
├── app/
│   ├── (site)/                 Public pages — fetch data, render the active template
│   │   ├── page.tsx            Home
│   │   ├── portfolio/          Portfolio + [slug] album pages
│   │   ├── packages/ about/ contact/
│   │   └── layout.tsx          Theme (colours/fonts) + template layout
│   ├── admin/
│   │   ├── login/              Sign in
│   │   └── (dashboard)/        Protected dashboard pages
│   ├── api/admin/uploads/      presign + process (image pipeline)
│   ├── sitemap.ts  robots.ts  not-found.tsx
├── templates/                  Public UI templates (presentation only)
│   ├── types.ts                SiteTemplate contract + page prop types
│   ├── ids.ts                  Template ids (used by settings + validation)
│   ├── registry.ts             id → template implementation
│   └── minimal/                MinimalTemplate
├── components/
│   ├── site/                   Shared public building blocks (images, lightbox, gallery, contact form)
│   ├── admin/                  Dashboard building blocks (uploader, sortable list, image field…)
│   └── ui/                     shadcn/ui
├── lib/
│   ├── actions/                Server Actions (validated with Zod, admin-checked)
│   ├── data/public.ts          Cached public queries (tag-based revalidation)
│   ├── data/admin.ts           Uncached dashboard queries
│   ├── images/                 Image specs, sharp pipeline, srcset helpers
│   ├── supabase/               Clients, proxy session refresh, database types
│   ├── r2.ts                   R2 (S3 API) client
│   ├── validations.ts          Shared Zod schemas (forms + server)
│   └── auth.ts                 Admin guards
└── proxy.ts                    Session refresh + /admin redirect (Next 16 "middleware")
```

### Authentication

- `src/proxy.ts` runs only on `/admin/*`, refreshes the Supabase session and redirects signed-out visitors to `/admin/login`.
- The dashboard layout (`requireAdminPage`) and **every** Server Action / upload route (`requireAdmin`) verify the user server-side against `public.admins`.
- RLS is the final line of defence in the database.

### Image pipeline

```text
Browser ──presigned PUT──▶ R2 tmp/<uuid>         (original, never kept)
           │
           └─▶ POST /api/admin/uploads/process
                 sharp: auto-orient → sRGB → resize (never upscale)
                   large      ≤ 2400px  WebP q82
                   medium     ≤ 1200px  WebP q80
                   thumbnail  ≤  600px  WebP q75
                   blur       16px data URL placeholder
                 upload variants to R2 photos/<uuid>/  (immutable cache headers)
                 delete original
           └─▶ Server Action saves URLs, keys, dimensions in Postgres
```

Uploading straight to R2 avoids Vercel's request body limit, so full-size camera files work.
The database stores only URLs/keys. Variant sizes per image type (hero, portrait, avatar, logo, favicon) live in `src/lib/images/config.ts`.

On the public site, `ResponsiveImage` renders a plain `<img>` with `srcset`/`sizes` over the three variants, explicit `width`/`height` (no layout shift), lazy loading, and the blur preview as a background — no runtime image optimizer needed.

### Caching & performance

- Public pages are statically prerendered. Queries are cached with tags (`src/lib/cache-tags.ts`) and refreshed hourly.
- Admin mutations call `updateTag(...)`, so changes appear on the website immediately.
- Album galleries server-render the first 24 photos; more load progressively as you scroll.
- Server Components by default; client JS only for the header, gallery/lightbox, filters and contact form.
- Scroll-reveal animations are pure CSS (`animation-timeline: view()`) and respect `prefers-reduced-motion`.
- Fonts are self-hosted via `next/font`; alternate pairings are not preloaded.

### SEO

Database-driven metadata per page, canonical URLs, Open Graph + X/Twitter cards, `sitemap.xml` (with album cover images), `robots.txt` (admin excluded), JSON-LD (`ProfessionalService` on the home page, `ImageGallery` on albums), semantic HTML and alt text (editable per photo).

---

## Customizing the design

**Without code** (Admin → Settings): name, logo, favicon, hero image/text, primary & secondary colours, font pairing, template, SEO.

**Tweaking the Minimal template**: edit files in `src/templates/minimal/`. Design tokens (`ink`, `paper`, `muted-ink`, `line`, `veil`, `font-display`, `font-body`) are defined in `src/app/globals.css` and driven by the settings.

**Adding a new template** (e.g. `DarkTemplate`):

1. Create `src/templates/dark/` with components implementing `SiteTemplate` from `src/templates/types.ts` (copy `minimal/` as a starting point).
2. Add `{ id: "dark", label: "Dark", description: "…" }` to `TEMPLATE_OPTIONS` in `src/templates/ids.ts`.
3. Register it in `src/templates/registry.ts`.

It then appears in Admin → Settings → Template. Templates receive fully-typed data as props and never fetch data themselves, so the dashboard and business logic stay untouched.

**Adding a font pairing**: load the fonts in `src/lib/fonts/index.ts`, map them in `PRESET_VARIABLES`, and add the option to `src/lib/fonts/presets.ts`.

## Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```
