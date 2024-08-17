import sitemap from "@astrojs/sitemap";
import solidJs from "@astrojs/solid-js";
import { defineConfig } from "astro/config";
import unocss from "unocss/astro";
import config from "./src/config";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  integrations: [unocss({
    injectReset: true
  }), sitemap(), solidJs(), mdx()],
  site: config.site.url,
  base: config.site.baseUrl,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover"
  },
  markdown: {
    shikiConfig: {
      themes: config.post.code.theme
    }
  }
});