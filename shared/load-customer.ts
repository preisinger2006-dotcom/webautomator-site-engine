import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ContentJson, MetaJson } from './types';

export function loadCustomer(slug: string): { content: ContentJson; meta: MetaJson } {
  const base = resolve(process.cwd(), `customers/${slug}`);
  const content = JSON.parse(readFileSync(`${base}/content.json`, 'utf-8')) as ContentJson;
  const meta = JSON.parse(readFileSync(`${base}/meta.json`, 'utf-8')) as MetaJson;
  return { content, meta };
}

/**
 * Defensive defaults for tokensToCssVars. Every contract field listed in the
 * SOURCE OF TRUTH comment below has a fallback here, so a meta.json missing
 * design_tokens (or any individual sub-key) renders a usable site instead of
 * crashing the Astro build. The values are deliberately neutral — colour
 * choices belong to the per-customer Step-4 tokens, not the engine.
 */
const DEFAULTS = {
  colors: {
    bg: '#ffffff', surface: '#fafafa', fg: '#111111', fg_muted: '#6b7280',
    primary: '#2563eb', accent: '#d97706', border: '#e5e7eb',
  },
  // 8-tier baseline; the emitter appends indices 8..N when Step 4 ships them.
  spacing: [0, 4, 8, 12, 16, 24, 32, 48] as number[],
  radius: { sm: '2px', md: '6px', lg: '12px', full: '9999px' },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 25px rgba(0,0,0,0.15)',
  },
  typography: {
    primary: 'system-ui, -apple-system, sans-serif',
    secondary: 'Georgia, serif',
    scale: { h1: '3rem', h2: '2.25rem', h3: '1.75rem', h4: '1.4rem', body: '1rem', small: '0.875rem' },
    line_heights: { h1: '1.1', h2: '1.15', h3: '1.2', body: '1.6' },
    font_weight_regular: 400,
    font_weight_bold: 700,
  },
  component_tokens: {
    button_primary: 'filled-accent', button_secondary: 'outlined-fg',
    card: 'elevated', nav: 'horizontal',
  },
} as const;

/**
 * Translate a customer's design_tokens into the canonical :root CSS-variable
 * contract that every theme.css / .astro override may rely on.
 *
 * SOURCE OF TRUTH for the variable names emitted here — every Step-9a /
 * Step-9b prompt template in the Webcreator monorepo
 * (packages/services/src/services/design-service.ts) carries an identical
 * "WHAT THE ENGINE ALREADY PROVIDES" block, and a generated theme.css that
 * references any var outside this list is considered broken.
 *
 *   Colors      --color-bg --color-surface --color-fg --color-fg-muted
 *               --color-primary --color-accent --color-border
 *   Spacing     --space-0 --space-1 --space-2 --space-3
 *               --space-4 --space-5 --space-6 --space-7
 *               (indices 8..N appended when Step 4 emits a longer scale)
 *   Radius      --radius-sm --radius-md --radius-lg --radius-full
 *   Shadows     --shadow-sm --shadow-md --shadow-lg
 *   Typography  --font-primary --font-secondary
 *               --font-size-h1 --font-size-h2 --font-size-h3 --font-size-h4
 *               --font-size-body --font-size-small
 *               --line-height-h1 --line-height-h2 --line-height-h3
 *               --line-height-body
 *               --font-weight-regular --font-weight-bold
 *   Component   --component-button-primary --component-button-secondary
 *               --component-card --component-nav
 *
 * Older / partial meta.json (missing whole sections or individual keys) is
 * accepted — every read goes through DEFAULTS so the build never throws.
 */
export function tokensToCssVars(tokens: MetaJson['design_tokens'] | undefined | null): string {
  // Runtime is JSON.parse'd untrusted input, so individual sub-keys may be
  // absent even though the compile-time type declares them required. Read
  // each field through DEFAULTS via `??` so older / partial meta.json
  // never throws. Where a whole section is missing, fall back to the empty
  // object placeholder so the per-key reads below all hit the default path.
  const t = tokens ?? ({} as MetaJson['design_tokens']);
  const c = t.colors ?? ({} as MetaJson['design_tokens']['colors']);
  const r = t.radius ?? ({} as MetaJson['design_tokens']['radius']);
  const sh = t.shadows ?? ({} as MetaJson['design_tokens']['shadows']);
  const typo = t.typography ?? ({} as MetaJson['design_tokens']['typography']);
  const scale = typo.scale ?? ({} as MetaJson['design_tokens']['typography']['scale']);
  const lh = typo.line_heights ?? ({} as MetaJson['design_tokens']['typography']['line_heights']);
  const comp = t.component_tokens ?? ({} as MetaJson['design_tokens']['component_tokens']);
  const spacing = Array.isArray(t.spacing) ? t.spacing : DEFAULTS.spacing;

  const lines: string[] = [];

  // Colors — full Step 4 palette
  lines.push(`--color-bg: ${c.bg ?? DEFAULTS.colors.bg};`);
  lines.push(`--color-surface: ${c.surface ?? DEFAULTS.colors.surface};`);
  lines.push(`--color-fg: ${c.fg ?? DEFAULTS.colors.fg};`);
  lines.push(`--color-fg-muted: ${c.fg_muted ?? DEFAULTS.colors.fg_muted};`);
  lines.push(`--color-primary: ${c.primary ?? DEFAULTS.colors.primary};`);
  lines.push(`--color-accent: ${c.accent ?? DEFAULTS.colors.accent};`);
  lines.push(`--color-border: ${c.border ?? DEFAULTS.colors.border};`);

  // Spacing — full scale (always at least 8 entries; indices 8..N appended).
  const spaceCount = Math.max(spacing.length, DEFAULTS.spacing.length);
  for (let i = 0; i < spaceCount; i++) {
    const n = spacing[i] ?? DEFAULTS.spacing[i] ?? 0;
    lines.push(`--space-${i}: ${n}px;`);
  }

  // Radius — full 4-tier scale
  lines.push(`--radius-sm: ${r.sm ?? DEFAULTS.radius.sm};`);
  lines.push(`--radius-md: ${r.md ?? DEFAULTS.radius.md};`);
  lines.push(`--radius-lg: ${r.lg ?? DEFAULTS.radius.lg};`);
  lines.push(`--radius-full: ${r.full ?? DEFAULTS.radius.full};`);

  // Shadows — full 3-tier scale
  lines.push(`--shadow-sm: ${sh.sm ?? DEFAULTS.shadows.sm};`);
  lines.push(`--shadow-md: ${sh.md ?? DEFAULTS.shadows.md};`);
  lines.push(`--shadow-lg: ${sh.lg ?? DEFAULTS.shadows.lg};`);

  // Typography
  lines.push(`--font-primary: ${typo.primary ?? DEFAULTS.typography.primary};`);
  lines.push(`--font-secondary: ${typo.secondary ?? DEFAULTS.typography.secondary};`);
  lines.push(`--font-size-h1: ${scale.h1 ?? DEFAULTS.typography.scale.h1};`);
  lines.push(`--font-size-h2: ${scale.h2 ?? DEFAULTS.typography.scale.h2};`);
  lines.push(`--font-size-h3: ${scale.h3 ?? DEFAULTS.typography.scale.h3};`);
  lines.push(`--font-size-h4: ${scale.h4 ?? DEFAULTS.typography.scale.h4};`);
  lines.push(`--font-size-body: ${scale.body ?? DEFAULTS.typography.scale.body};`);
  lines.push(`--font-size-small: ${scale.small ?? DEFAULTS.typography.scale.small};`);
  lines.push(`--line-height-h1: ${lh.h1 ?? DEFAULTS.typography.line_heights.h1};`);
  lines.push(`--line-height-h2: ${lh.h2 ?? DEFAULTS.typography.line_heights.h2};`);
  lines.push(`--line-height-h3: ${lh.h3 ?? DEFAULTS.typography.line_heights.h3};`);
  lines.push(`--line-height-body: ${lh.body ?? DEFAULTS.typography.line_heights.body};`);
  lines.push(`--font-weight-regular: ${typo.font_weight_regular ?? DEFAULTS.typography.font_weight_regular};`);
  lines.push(`--font-weight-bold: ${typo.font_weight_bold ?? DEFAULTS.typography.font_weight_bold};`);

  // Component descriptors (literal strings — theme.css interprets them)
  lines.push(`--component-button-primary: "${comp.button_primary ?? DEFAULTS.component_tokens.button_primary}";`);
  lines.push(`--component-button-secondary: "${comp.button_secondary ?? DEFAULTS.component_tokens.button_secondary}";`);
  lines.push(`--component-card: "${comp.card ?? DEFAULTS.component_tokens.card}";`);
  lines.push(`--component-nav: "${comp.nav ?? DEFAULTS.component_tokens.nav}";`);

  return `:root { ${lines.join(' ')} }`;
}
