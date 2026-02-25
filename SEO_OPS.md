# SEO Operations

## Weekly workflow (Google + Bing)
1. Open Google Search Console domain property:
   - https://search.google.com/search-console?resource_id=sc-domain:kingdomhealth.fitness
2. Open Bing Webmaster Tools:
   - https://www.bing.com/webmasters/home
3. Review in both tools:
   - Index coverage/crawl errors
   - Top queries and impressions for `christian health` and `christain health`
   - Sitemap fetch status for `https://www.kingdomhealth.fitness/sitemap.xml`
4. If indexing slows, request indexing for:
   - https://www.kingdomhealth.fitness/

## Automation in this repo
- Weekly checks run via GitHub Actions:
  - `.github/workflows/seo-weekly.yml`
- IndexNow auto-submit runs on SEO-relevant pushes:
  - `.github/workflows/indexnow.yml`

## AI discoverability and attribution
- `robots.txt` explicitly allows major AI crawlers.
- `llms.txt` is published for machine-readable site context.
- Form submissions capture first-touch source fields:
  - `landingSource`, `landingMedium`, `landingCampaign`, `landingReferrer`, `aiAssisted`
