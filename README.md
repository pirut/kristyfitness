# Kristy Fitness Website

Astro site for Kristy Fitness ("Join the Fit Life") with:
- a marketing homepage (water training, nutrition coaching, one-on-one personal training) with a Formspree contact form
- a blog at `/blog` that Kristy can edit herself
- Keystatic editor access at `/keystatic`
- RSS and generated sitemap output
- GitHub-backed content storage for blog posts

## Editing the blog (for Kristy)

1. Go to `https://www.kristyfitness.com/keystatic` and sign in with GitHub.
2. Click **Blog posts** → **Create entry**.
3. Fill in the title, slug, date, and excerpt, write your post, and add photos with the image button.
4. Leave **Draft** checked while you work; uncheck it when you're ready to publish.
5. Click **Save** — the site updates automatically a minute or two later.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:4321`.

Keystatic runs in `local` mode during development, so you can test the editor locally
without GitHub auth.

## Editor setup for production

Production uses Keystatic GitHub mode. Configure these environment variables in your
deployment platform:

- `KEYSTATIC_GITHUB_CLIENT_ID`
- `KEYSTATIC_GITHUB_CLIENT_SECRET`
- `KEYSTATIC_GITHUB_APP_SLUG`
- `KEYSTATIC_SECRET`

You will also need a GitHub app with write access to this repository.

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

- Weekly SEO check script: `bash scripts/seo_weekly_check.sh https://www.kristyfitness.com`
- Manual IndexNow submission: `bash scripts/submit_indexnow.sh https://www.kristyfitness.com/`
- Operations checklist: `SEO_OPS.md`

## Form setup

The contact form posts to [Formspree](https://formspree.io/). To change the endpoint,
update the `action` on the homepage form in `src/pages/index.astro`.
