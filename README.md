# Kingdom Health Landing Page

Static one-page site for Kingdom Health with:
- polished marketing page design
- mobile-responsive layout
- animated section reveals
- contact/application form wired directly to Formspree

## Run locally

### Frontend only
```bash
cd /Users/jrbussard/repos/kristyfitness
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Form setup (no backend)

This project uses [Formspree](https://formspree.io/html/) so there is no serverless
email code to host.

1. Create a Formspree form.
2. Copy your endpoint (looks like `https://formspree.io/f/abcxyzpd`).
3. Replace the placeholder action in `/Users/jrbussard/repos/kristyfitness/index.html`:
   - `action="https://formspree.io/f/YOUR_FORM_ID"`

## Image credits

Stock photography from Unsplash:
- [healthy food](https://unsplash.com/photos/flat-lay-photography-of-vegetable-salads-and-eggs-c92c4e306e5f)
- [Bible photo](https://unsplash.com/photos/book-with-black-cover-on-brown-wooden-table-f1e604a9c3d1)

Hero image is client-provided:
- `/Users/jrbussard/repos/kristyfitness/assets/ChatGPT Image Feb 16, 2026, 06_20_16 PM.png`
