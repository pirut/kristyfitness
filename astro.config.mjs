import { defineConfig, passthroughImageService } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import keystatic from "@keystatic/astro";

export default defineConfig({
  site: "https://www.kingdomhealth.fitness",
  output: "server",
  adapter: vercel(),
  integrations: [react(), sitemap(), keystatic()],
  image: {
    service: passthroughImageService(),
  },
});
