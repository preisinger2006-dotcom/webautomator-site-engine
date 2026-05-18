#!/usr/bin/env node
/**
 * v0.4.0 override-consumption test (spec §15.3) — a REAL `astro build`, no
 * mocks. Proves the three contract guarantees against the _fixture customer:
 *
 *   1. override absent  → engine default renders, no theme.css <link>
 *   2. override present  → override markup renders AND theme.css is linked
 *   3. malformed theme.css → build still succeeds (never crashes)
 *
 * Temp override files are written under customers/_fixture/overrides|assets
 * and removed in a finally block so the repo stays clean.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const FIX = resolve(ROOT, 'customers/_fixture');
const OV_BLOCKS = resolve(FIX, 'overrides/blocks');
const OV_THEME = resolve(FIX, 'overrides/theme.css');
const ASSET_THEME = resolve(FIX, 'assets/theme.css');
const INDEX = resolve(ROOT, 'dist/index.html');
const DIST_THEME = resolve(ROOT, 'dist/theme.css');

const OVERRIDE_MARKER = 'OVERRIDE_MARKER_X9Z7';
const THEME_MARKER = '.block-hero{outline:3px solid #f0f}';

function build() {
  const r = spawnSync('npx', ['astro', 'build'], {
    cwd: ROOT,
    env: { ...process.env, CUSTOMER_SLUG: '_fixture', CUSTOMER: '_fixture', PRINCIPLE: 'modern' },
    stdio: 'inherit',
  });
  return r.status ?? 1;
}
function cleanup() {
  for (const p of [resolve(FIX, 'overrides'), resolve(FIX, 'assets')]) {
    if (existsSync(p)) rmSync(p, { recursive: true, force: true });
  }
}
function assert(cond, msg) {
  if (!cond) {
    console.error(`✗ FAIL: ${msg}`);
    process.exitCode = 1;
    throw new Error(msg);
  }
  console.log(`✓ ${msg}`);
}

try {
  cleanup();

  // (1) override absent → engine default, no theme.css link
  assert(build() === 0, 'build succeeds with no overrides');
  let html = readFileSync(INDEX, 'utf-8');
  assert(!html.includes(OVERRIDE_MARKER), 'no override marker when override absent');
  assert(
    !/<link[^>]+href="\/theme\.css"/.test(html),
    'no theme.css <link> when theme.css absent',
  );

  // (2) override present → override renders + theme.css linked
  mkdirSync(OV_BLOCKS, { recursive: true });
  mkdirSync(resolve(FIX, 'assets'), { recursive: true });
  writeFileSync(
    resolve(OV_BLOCKS, 'Hero.astro'),
    `---\nconst { block } = Astro.props;\n---\n<section class="block-hero" data-ov="${OVERRIDE_MARKER}">{block.headline}</section>\n`,
  );
  writeFileSync(OV_THEME, THEME_MARKER + '\n');
  writeFileSync(ASSET_THEME, THEME_MARKER + '\n'); // dual-write (commitVariant parity)

  assert(build() === 0, 'build succeeds with overrides present');
  html = readFileSync(INDEX, 'utf-8');
  assert(html.includes(OVERRIDE_MARKER), 'override markup replaces engine default Hero');
  assert(
    /<link[^>]+href="\/theme\.css"/.test(html),
    'theme.css <link> emitted when override theme.css present',
  );
  assert(existsSync(DIST_THEME), 'theme.css served from dist/ (publicDir copy)');
  assert(
    readFileSync(DIST_THEME, 'utf-8').includes(THEME_MARKER),
    'served theme.css carries the generated CSS',
  );

  // (3) malformed theme.css must not crash the build
  writeFileSync(OV_THEME, '}}}{{ this is not css <script> @@@');
  writeFileSync(ASSET_THEME, '}}}{{ this is not css <script> @@@');
  assert(build() === 0, 'build still succeeds with malformed theme.css');

  console.log('\nALL OVERRIDE-CONSUMPTION CHECKS PASSED');
} finally {
  cleanup();
}
