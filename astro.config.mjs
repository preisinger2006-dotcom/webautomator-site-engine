import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

const customer = process.env.CUSTOMER ?? '_fixture';
const principle = process.env.PRINCIPLE ?? 'modern';

export default defineConfig({
  outDir: `./dist/${customer}-${principle}`,
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
  },
  integrations: [tailwind()],
  vite: {
    define: {
      __CUSTOMER__: JSON.stringify(customer),
      __PRINCIPLE__: JSON.stringify(principle),
    },
  },
});
