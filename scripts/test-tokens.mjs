#!/usr/bin/env node
/**
 * tokensToCssVars contract test — pins the canonical CSS-variable contract
 * (§6.1c of webcreator-design-quality-pipeline-remediation.md). Two
 * scenarios, both of which MUST hold for the design-quality pipeline to
 * have a working contract surface between the worker and the engine:
 *
 *   1. NEW-SHAPE meta.json (what the post-Session-1 worker emits) → every
 *      variable from the canonical contract is present in the output.
 *   2. OLD / PARTIAL meta.json (legacy commits, hand-edited files, missing
 *      whole sections) → no throw, every contract variable still appears,
 *      every value comes from DEFAULTS.
 *
 * Run via the engine's bare-Node TS support (Node 23.6+ strips types
 * natively; --experimental-strip-types is silently accepted on Node 22.6+).
 * No tsc, no bundler, no extra dependency.
 */
import assert from 'node:assert/strict';
import { tokensToCssVars } from '../shared/load-customer.ts';

// Every var the §6.1c canonical contract requires. The test fails loudly if
// any is missing from the emitter's output — the worker / Step-9 prompts
// rely on this exact list.
const CONTRACT_VARS = [
  '--color-bg', '--color-surface', '--color-fg', '--color-fg-muted',
  '--color-primary', '--color-accent', '--color-border',
  '--space-0', '--space-1', '--space-2', '--space-3',
  '--space-4', '--space-5', '--space-6', '--space-7',
  '--radius-sm', '--radius-md', '--radius-lg', '--radius-full',
  '--shadow-sm', '--shadow-md', '--shadow-lg',
  '--font-primary', '--font-secondary',
  '--font-size-h1', '--font-size-h2', '--font-size-h3', '--font-size-h4',
  '--font-size-body', '--font-size-small',
  '--line-height-h1', '--line-height-h2', '--line-height-h3', '--line-height-body',
  '--font-weight-regular', '--font-weight-bold',
  '--component-button-primary', '--component-button-secondary',
  '--component-card', '--component-nav',
];

function assertEveryVarPresent(css, label) {
  const missing = CONTRACT_VARS.filter((v) => !css.includes(`${v}:`));
  assert.equal(
    missing.length, 0,
    `${label}: missing contract vars: ${missing.join(', ')}\n--- emitted ---\n${css}`,
  );
}

// ─── Case 1: new-shape meta.json (post-Session-1 worker output) ───────────
const newShape = {
  colors: {
    bg: '#0a0a0a', surface: '#171717', fg: '#f5f5f5', fg_muted: '#a3a3a3',
    primary: '#d97706', accent: '#fbbf24', border: '#262626',
  },
  typography: {
    primary: 'Inter, sans-serif', secondary: 'Playfair Display, serif',
    scale: { h1: '4rem', h2: '2.5rem', h3: '1.875rem', h4: '1.5rem', body: '1rem', small: '0.875rem' },
    line_heights: { h1: '1.05', h2: '1.1', h3: '1.2', body: '1.6' },
    font_weight_regular: 400, font_weight_bold: 700,
  },
  spacing: [0, 4, 8, 12, 16, 24, 32, 48],
  radius: { sm: '4px', md: '8px', lg: '16px', full: '9999px' },
  shadows: { sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 4px 6px rgba(0,0,0,0.1)', lg: '0 10px 25px rgba(0,0,0,0.15)' },
  component_tokens: {
    button_primary: 'filled-accent-rounded', button_secondary: 'outlined-fg-soft',
    card: 'elevated-with-border', nav: 'horizontal-divider',
  },
};
const newOutput = tokensToCssVars(newShape);
assertEveryVarPresent(newOutput, 'new-shape');
// Spot-check Step-4 values made it through (proves no narrowing / dropping).
assert.ok(newOutput.includes('--color-primary: #d97706;'), 'new-shape: --color-primary value not propagated');
assert.ok(newOutput.includes('--shadow-md: 0 4px 6px rgba(0,0,0,0.1);'), 'new-shape: --shadow-md value not propagated');
assert.ok(newOutput.includes('--font-size-h4: 1.5rem;'), 'new-shape: --font-size-h4 value not propagated');
assert.ok(newOutput.includes('--line-height-body: 1.6;'), 'new-shape: --line-height-body value not propagated');
assert.ok(newOutput.includes('--font-weight-bold: 700;'), 'new-shape: --font-weight-bold value not propagated');
assert.ok(newOutput.includes('--component-card: "elevated-with-border";'), 'new-shape: --component-card descriptor not propagated');
console.log('✓ new-shape meta.json — every canonical contract variable emitted with the Step-4 value');

// ─── Case 2: legacy / partial meta.json — what _fixture/meta.json looks ──
// like today (pre-Session-1 worker output). Missing shadows, component_tokens,
// typography.scale, typography.line_heights, weight contrast, surface/fg_muted.
// Must NOT throw; must emit every contract var via DEFAULTS.
const oldShape = {
  colors: { bg: '#0a0a0a', fg: '#f5f5f5', accent: '#d97706', muted: '#171717', card: '#1a1a1a', border: '#262626' },
  typography: { primary: 'system-ui, -apple-system, sans-serif', secondary: 'Georgia, serif' },
  spacing: { sm: '0.5rem', md: '1rem', lg: '2rem', xl: '4rem' }, // object, not array
  radius: { sm: '2px', md: '6px', lg: '12px' },                  // no `full`
};
let oldOutput;
try {
  oldOutput = tokensToCssVars(oldShape);
} catch (err) {
  console.error('✗ legacy meta.json threw:', err);
  process.exit(1);
}
assertEveryVarPresent(oldOutput, 'old-shape');
// Defaults kick in for everything the old shape lacks.
assert.ok(oldOutput.includes('--color-surface: #fafafa;'), 'old-shape: --color-surface should default (legacy lacks surface)');
assert.ok(oldOutput.includes('--color-fg-muted: #6b7280;'), 'old-shape: --color-fg-muted should default');
assert.ok(oldOutput.includes('--radius-full: 9999px;'), 'old-shape: --radius-full should default (legacy lacks full)');
assert.ok(oldOutput.includes('--shadow-sm:'), 'old-shape: --shadow-sm should default (legacy lacks shadows entirely)');
assert.ok(oldOutput.includes('--font-size-h4: 1.4rem;'), 'old-shape: --font-size-h4 should default');
assert.ok(oldOutput.includes('--line-height-body: 1.6;'), 'old-shape: --line-height-body should default');
assert.ok(oldOutput.includes('--font-weight-regular: 400;'), 'old-shape: --font-weight-regular should default');
assert.ok(oldOutput.includes('--component-card: "elevated";'), 'old-shape: --component-card should default');
// Spacing was an object — emitter should fall back to the DEFAULTS array.
assert.ok(oldOutput.includes('--space-0:') && oldOutput.includes('--space-7:'), 'old-shape: --space-0..7 should be emitted from DEFAULTS when spacing is not an array');
console.log('✓ legacy / partial meta.json — no throw, every contract variable emitted from DEFAULTS');

// ─── Case 3: tokens == undefined / null (meta.json without design_tokens) ─
const undefOutput = tokensToCssVars(undefined);
assertEveryVarPresent(undefOutput, 'undefined');
const nullOutput = tokensToCssVars(null);
assertEveryVarPresent(nullOutput, 'null');
console.log('✓ undefined / null design_tokens — no throw, every contract variable emitted from DEFAULTS');

console.log('\nAll tokensToCssVars contract tests passed.');
