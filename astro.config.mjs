import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
// import netlify from "@astrojs/netlify";
import robotsTxt from "astro-robots-txt";
import UnoCSS from "@unocss/astro";
import icon from "astro-icon";

import solidJs from "@astrojs/solid-js";
import { remarkReadingTime } from "./src/lib/ remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://cpluu.github.io/",
  integrations: [
    sitemap(),
    robotsTxt({
      sitemap: [
        "https://cpluu.github.io/sitemap-index.xml",
        "https://cpluu.github.io/sitemap-0.xml",
      ],
    }),
    solidJs(),
    UnoCSS({ injectReset: true }),
    icon()
  ],
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  // output: "server", ARE these lines needed if we're deploying on github pages??
  // adapter: netlify(),
});
// export default defineConfig({
//   site: 'https://cpluu.github.io/',
//   // base: '/my-repo',
// })