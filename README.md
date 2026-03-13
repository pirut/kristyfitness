# Kingdom Health Website

Astro site for Kingdom Health with:
- the original marketing homepage and Formspree contact flow
- a branded blog at `/blog`
- Keystatic editor access at `/keystatic`
- RSS and generated sitemap output
- GitHub-backed content storage for blog posts

## Run locally

```bash
cd /Users/jrbussard/repos/kristyfitness
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

- Blog posts:
  - `/Users/jrbussard/repos/kristyfitness/src/content/blog/`
- Blog settings:
  - `/Users/jrbussard/repos/kristyfitness/src/content/settings/blog.yaml`
- Public assets:
  - `/Users/jrbussard/repos/kristyfitness/public/assets/`

## Commands

- Dev server:
  ```bash
  npm run dev
  ```
- Type and Astro checks:
  ```bash
  npm run check
  ```
- Production build:
  ```bash
  npm run build
  ```

## SEO operations

- Weekly SEO check script:
  ```bash
  bash scripts/seo_weekly_check.sh https://www.kingdomhealth.fitness
  ```
- Manual IndexNow submission:
  ```bash
  bash scripts/submit_indexnow.sh https://www.kingdomhealth.fitness/
  ```
- Operations checklist:
  - `/Users/jrbussard/repos/kristyfitness/SEO_OPS.md`

## Form setup

This project still uses [Formspree](https://formspree.io/html/) for the application form.

1. Create or keep the Formspree form.
2. Copy the endpoint.
3. Update the `action` on the homepage form in:
   - `/Users/jrbussard/repos/kristyfitness/src/pages/index.astro`

## Image credits

Stock photography from Unsplash:
- [healthy food](https://unsplash.com/photos/flat-lay-photography-of-vegetable-salads-and-eggs-c92c4e306e5f)
- [Bible photo](https://unsplash.com/photos/book-with-black-cover-on-brown-wooden-table-f1e604a9c3d1)

Hero image is client-provided:
- `/Users/jrbussard/repos/kristyfitness/public/assets/ChatGPT Image Feb 16, 2026, 06_20_16 PM.png`
