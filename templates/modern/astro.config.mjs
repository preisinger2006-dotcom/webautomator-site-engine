import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { resolve } from 'node:path';

const customer = process.env.CUSTOMER ?? '_fixture';

export default defineConfig({
  // Resolve customer content from the repo root, not the template subdir.
  root: '.',
  publicDir: resolve('../../customers', customer, 'assets'),
  outDir: resolve('../../dist', `${customer}-modern`),
  integrations: [tailwind()],
});
