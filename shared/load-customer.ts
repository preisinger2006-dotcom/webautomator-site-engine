import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ContentJson, MetaJson } from './types';

export function loadCustomer(slug: string): { content: ContentJson; meta: MetaJson } {
  const base = resolve(process.cwd(), `customers/${slug}`);
  const content = JSON.parse(readFileSync(`${base}/content.json`, 'utf-8')) as ContentJson;
  const meta = JSON.parse(readFileSync(`${base}/meta.json`, 'utf-8')) as MetaJson;
  return { content, meta };
}

export function tokensToCssVars(tokens: MetaJson['design_tokens']): string {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(tokens.colors)) lines.push(`--color-${k}: ${v};`);
  for (const [k, v] of Object.entries(tokens.spacing)) lines.push(`--space-${k}: ${v};`);
  for (const [k, v] of Object.entries(tokens.radius)) lines.push(`--radius-${k}: ${v};`);
  if (tokens.typography.primary) lines.push(`--font-primary: ${tokens.typography.primary};`);
  if (tokens.typography.secondary) lines.push(`--font-secondary: ${tokens.typography.secondary};`);
  if (tokens.typography.mono) lines.push(`--font-mono: ${tokens.typography.mono};`);
  return `:root { ${lines.join(' ')} }`;
}
