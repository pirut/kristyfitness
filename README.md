# Kristy Fitness Website

Astro site for Kristy Fitness ("Join the Fit Life") with:
- a marketing homepage (water training, nutrition coaching, one-on-one personal training) with a Formspree contact form
- a blog at `/blog` that Kristy can edit herself
- a simple password-protected blog editor at `/admin` (no GitHub account needed)
- an optional Keystatic editor at `/keystatic` for developers (GitHub sign-in)
- RSS and generated sitemap output
- GitHub-backed content storage for blog posts

## Editing the blog (for Kristy)

1. Go to `https://www.kingdomhealth.fitness/admin` and type the blog password.
2. Click **Write a New Post**.
3. Fill in the title, date, and short description, write your post, and add photos with the toolbar.
4. Check "Show this post on the website" to publish, or leave it unchecked to keep a private draft.
5. Click **Save** — the site updates automatically a minute or two later.

## Admin editor setup (one time)

The `/admin` editor needs two environment variables in Vercel:

- `ADMIN_PASSWORD` — the password Kristy types to open the editor.
- `BLOG_GITHUB_TOKEN` — a fine-grained GitHub personal access token with
  **Contents: Read and write** permission on `pirut/kristyfitness`
  (github.com → Settings → Developer settings → Fine-grained tokens).
  The editor uses it server-side to commit posts; each save triggers a redeploy.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:4321`.

In development the `/admin` editor reads and writes post files directly on disk
(set `ADMIN_PASSWORD` in `.env` to sign in), and Keystatic runs in `local` mode.

## Optional: Keystatic editor for production

`/keystatic` also works in production if you configure a GitHub App and these
environment variables (not required for Kristy's `/admin` editor):

- `KEYSTATIC_GITHUB_CLIENT_ID`
- `KEYSTATIC_GITHUB_CLIENT_SECRET`
- `KEYSTATIC_GITHUB_APP_SLUG`
- `KEYSTATIC_SECRET`

## Content locations

- Blog posts: `src/content/blog/`
- Blog settings: `src/content/settings/blog.yaml`
- Site-wide contact info and copy constants: `src/lib/site.ts`
- Public assets: `public/assets/`

## Commands

- Dev server: `npm run dev`
- Type and Astro checks: `npm run check`
- Production build: `npm run build`

## SEO operations

- Weekly SEO check script: `bash scripts/seo_weekly_check.sh https://www.kingdomhealth.fitness`
- Manual IndexNow submission: `bash scripts/submit_indexnow.sh https://www.kingdomhealth.fitness/`
- Operations checklist: `SEO_OPS.md`

## Form setup

The contact form posts to [Formspree](https://formspree.io/). To change the endpoint,
update the `action` on the homepage form in `src/pages/index.astro`.
