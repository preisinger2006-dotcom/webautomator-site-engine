import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { resolve } from 'node:path';

const customer = process.env.CUSTOMER ?? '_fixture';

export default defineConfig({
  root: '.',
  publicDir: resolve('../../customers', customer, 'assets'),
  outDir: resolve('../../dist', `${customer}-minimal`),
  integrations: [tailwind()],
});
