#!/usr/bin/env node
/**
 * Build a single customer × principle. Used by Cloudflare Pages (one project
 * per variant) and by `build-all.mjs` locally.
 *
 * Usage:
 *   node scripts/build-variant.mjs --customer=demo --principle=modern
 *
 * Reads CUSTOMER + PRINCIPLE from CLI flags or env vars and shells out to
 * the principle-specific Astro template.
 */

import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

function parseArg(name) {
  const flag = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(flag));
  return arg ? arg.slice(flag.length) : process.env[name.toUpperCase()] ?? null;
}

const customer = parseArg('customer');
const principle = parseArg('principle');
if (!customer || !principle) {
  console.error('usage: build-variant.mjs --customer=<slug> --principle=<modern|classic|minimal>');
  process.exit(1);
}
if (!['modern', 'classic', 'minimal'].includes(principle)) {
  console.error(`unknown principle: ${principle}`);
  process.exit(1);
}

const templateDir = resolve(`./templates/${principle}`);
const r = spawnSync('astro', ['build'], {
  cwd: templateDir,
  env: { ...process.env, CUSTOMER: customer, PRINCIPLE: principle },
  stdio: 'inherit',
});
process.exit(r.status ?? 1);
