// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://kacperzaleski.com",
  output: "static",
  trailingSlash: "never",
  build: { format: "file", inlineStylesheets: "always" },
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
    },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: "en", locales: { en: "en", de: "de" } },
    }),
  ],
});
