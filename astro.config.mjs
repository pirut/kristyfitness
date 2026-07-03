import { defineConfig, passthroughImageService } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://www.kristyfitness.com",
  output: "server",
  adapter: vercel(),
  integrations: [react(), sitemap()],
  image: {
    service: passthroughImageService(),
  },
});
