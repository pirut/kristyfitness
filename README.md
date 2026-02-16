# Kingdom Health Landing Page

Static one-page site for Kingdom Health with:
- polished marketing page design
- mobile-responsive layout
- animated section reveals
- contact/application form wired to a serverless endpoint

## Run locally

### Frontend only
```bash
cd /Users/jrbussard/repos/kristyfitness
python3 -m http.server 8080
```

Open `http://localhost:8080`.

### Full form flow (frontend + `/api/contact`)
Use Vercel dev so the serverless API runs locally:

```bash
cd /Users/jrbussard/repos/kristyfitness
cp .env.example .env.local
# Fill values in .env.local
vercel dev
```

Open `http://localhost:3000`.

## Email setup

The form posts to `/api/contact` and sends via [Resend](https://resend.com/).

Required env vars:
- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL` (must use a verified domain/sender in Resend)
- `CONTACT_TO_EMAIL` (your mom's inbox)

## Image credits

Stock photography from Unsplash:
- [healthy food](https://unsplash.com/photos/flat-lay-photography-of-vegetable-salads-and-eggs-c92c4e306e5f)
- [Bible photo](https://unsplash.com/photos/book-with-black-cover-on-brown-wooden-table-f1e604a9c3d1)

Hero image is client-provided:
- `/Users/jrbussard/repos/kristyfitness/assets/ChatGPT Image Feb 16, 2026, 06_20_16 PM.png`
