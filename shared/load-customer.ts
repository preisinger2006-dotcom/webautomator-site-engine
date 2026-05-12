import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ContentJson, MetaJson } from './types';

export function loadCustomer(slug: string): { content: ContentJson; meta: MetaJson } {
  const base = resolve(process.cwd(), `customers/${slug}`);
  const content = JSON.parse(readFileSync(`${base}/content.json`, 'utf-8')) as ContentJson;
  const meta = JSON.parse(readFileSync(`${base}/meta.json`, 'utf-8')) as MetaJson;
  return { content, meta };
}

// Defensive defaults so a meta.json missing `design_tokens` (e.g. an older
// generated commit before the control plane started persisting them) renders
// a usable site instead of crashing the Astro build.
const DEFAULT_TOKENS: MetaJson['design_tokens'] = {
  colors: { bg: '#ffffff', fg: '#111111', accent: '#2563eb', muted: '#f5f5f5', card: '#ffffff', border: '#e5e7eb' },
  spacing: { sm: '0.5rem', md: '1rem', lg: '2rem', xl: '4rem' },
  radius: { sm: '2px', md: '6px', lg: '12px' },
  typography: { primary: 'system-ui, -apple-system, sans-serif', secondary: 'Georgia, serif' },
};

export function tokensToCssVars(tokens: MetaJson['design_tokens'] | undefined | null): string {
  const t = tokens ?? DEFAULT_TOKENS;
  const colors = t.colors ?? DEFAULT_TOKENS.colors;
  const spacing = t.spacing ?? DEFAULT_TOKENS.spacing;
  const radius = t.radius ?? DEFAULT_TOKENS.radius;
  const typo = t.typography ?? DEFAULT_TOKENS.typography;
  const lines: string[] = [];
  for (const [k, v] of Object.entries(colors)) lines.push(`--color-${k}: ${v};`);
  for (const [k, v] of Object.entries(spacing)) lines.push(`--space-${k}: ${v};`);
  for (const [k, v] of Object.entries(radius)) lines.push(`--radius-${k}: ${v};`);
  if (typo.primary) lines.push(`--font-primary: ${typo.primary};`);
  if (typo.secondary) lines.push(`--font-secondary: ${typo.secondary};`);
  if (typo.mono) lines.push(`--font-mono: ${typo.mono};`);
  return `:root { ${lines.join(' ')} }`;
}
