import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import UnoCSS from "@unocss/astro";
import icon from "astro-icon";

import solidJs from "@astrojs/solid-js";
// Injects minutesRead frontmatter for notes
import { remarkReadingTime } from "./src/lib/remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://cpluu.github.io/",
  integrations: [
    sitemap(),
    robotsTxt(),
    solidJs(),
    UnoCSS({ injectReset: true }),
    icon()
  ],
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  output: "static",
});