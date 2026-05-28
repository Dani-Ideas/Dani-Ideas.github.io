import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://portfolio.dani-ideas.dev',
  output: 'static',
  integrations: [
    tailwind({ applyBaseStyles: false }),
  ],
});
