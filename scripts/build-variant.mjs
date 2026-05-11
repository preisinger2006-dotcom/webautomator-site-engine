#!/usr/bin/env node
/**
 * Build a single customer × principle using the engine's astro config.
 *
 * Usage:
 *   node scripts/build-variant.mjs --customer=<slug> --principle=modern
 *   CUSTOMER_SLUG=<slug> PRINCIPLE=modern node scripts/build-variant.mjs
 *
 * The astro config (../astro.config.mjs) self-locates the engine via
 * `import.meta.url` and reads CUSTOMER_SLUG / PRINCIPLE from env, so this
 * script just sets the env vars and shells out to `astro build` in the
 * repo where it's invoked from (cwd = customer repo root, or engine repo
 * root for local dev).
 */

import { spawnSync } from 'node:child_process';

function parseArg(name) {
  const flag = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(flag));
  return arg ? arg.slice(flag.length) : null;
}

const customer =
  parseArg('customer') ?? process.env.CUSTOMER_SLUG ?? process.env.CUSTOMER ?? null;
const principle = parseArg('principle') ?? process.env.PRINCIPLE ?? null;

if (!customer || !principle) {
  console.error(
    'usage: build-variant.mjs --customer=<slug> --principle=<modern|classic|minimal>',
  );
  process.exit(1);
}
if (!['modern', 'classic', 'minimal'].includes(principle)) {
  console.error(`unknown principle: ${principle}`);
  process.exit(1);
}

const r = spawnSync('npx', ['astro', 'build'], {
  env: {
    ...process.env,
    CUSTOMER_SLUG: customer,
    CUSTOMER: customer,
    PRINCIPLE: principle,
  },
  stdio: 'inherit',
});
process.exit(r.status ?? 1);
