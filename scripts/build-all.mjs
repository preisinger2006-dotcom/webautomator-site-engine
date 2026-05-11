#!/usr/bin/env node
/**
 * Iterate every customer/* directory and build each variant present.
 * For local QA only — production builds run per-variant on Cloudflare Pages.
 */

import { readdirSync, statSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, join } from 'node:path';

const customersRoot = resolve('./customers');
if (!existsSync(customersRoot)) {
  console.error('customers/ directory missing');
  process.exit(1);
}

const PRINCIPLES = ['modern', 'classic', 'minimal'];

for (const slug of readdirSync(customersRoot)) {
  const dir = join(customersRoot, slug);
  if (!statSync(dir).isDirectory() || slug.startsWith('.') || slug === '_fixture' && process.env.SKIP_FIXTURE) continue;
  if (!existsSync(join(dir, 'content.json')) || !existsSync(join(dir, 'meta.json'))) continue;

  for (const principle of PRINCIPLES) {
    console.log(`→ ${slug} / ${principle}`);
    const r = spawnSync('node', ['scripts/build-variant.mjs', `--customer=${slug}`, `--principle=${principle}`], {
      stdio: 'inherit',
    });
    if (r.status !== 0) {
      console.error(`build failed for ${slug}/${principle}`);
      process.exit(r.status ?? 1);
    }
  }
}
console.log('all builds OK');
