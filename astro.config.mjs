/**
 * Shared Astro config for every WebAutomator customer-site repo + this
 * engine's own dev mode.
 *
 * Inputs (set by the build command — see deploy-service.ts):
 *   CUSTOMER_SLUG (preferred) or CUSTOMER  — which customer's data to use
 *   PRINCIPLE                              — modern | classic | minimal
 *
 * Self-locates via `import.meta.url`, so the same config works whether it's
 * run from this repo directly (engine dev) or imported from a customer
 * repo's `node_modules/@webautomator/site-engine/astro.config.mjs`.
 */

import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENGINE_ROOT = dirname(fileURLToPath(import.meta.url));
const CUSTOMER_REPO_ROOT = process.cwd();

const customer = process.env.CUSTOMER_SLUG ?? process.env.CUSTOMER ?? '_fixture';
const principle = process.env.PRINCIPLE ?? 'modern';
if (!['modern', 'classic', 'minimal'].includes(principle)) {
  throw new Error(`unknown PRINCIPLE: ${principle} (expected modern|classic|minimal)`);
}

// Astro reads pages, components, styles from `srcDir`. We point it at the
// engine's per-principle template src directory regardless of where the
// engine lives (this repo's templates/ in dev, node_modules/.../templates/
// when consumed as a github dep).
const templateSrcDir = resolve(ENGINE_ROOT, `templates/${principle}/src`);

// Customer-owned data + assets live in the consuming repo's `customers/{slug}/`.
const customerDir = resolve(CUSTOMER_REPO_ROOT, 'customers', customer);

export default defineConfig({
  srcDir: templateSrcDir,
  publicDir: resolve(customerDir, 'assets'),
  // Flat dist/ — CF Pages publishes from `dist/`. (The control plane builds
  // one CF Pages project per customer × principle, so per-variant nesting
  // would be redundant and would break the publish dir.)
  outDir: resolve(CUSTOMER_REPO_ROOT, 'dist'),
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
  },
  vite: {
    plugins: [tailwindcss()],
    define: {
      __CUSTOMER__: JSON.stringify(customer),
      __PRINCIPLE__: JSON.stringify(principle),
      __CUSTOMER_DIR__: JSON.stringify(customerDir),
      __ENGINE_ROOT__: JSON.stringify(ENGINE_ROOT),
    },
  },
});
