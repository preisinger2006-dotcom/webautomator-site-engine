// Mirror of Webcreator's src/types/content.ts.
// Kept in sync manually until a shared package is extracted.

export type BookingProvider =
  | 'quandoo' | 'resmio' | 'opentable' | 'google_reserve'
  | 'doctolib' | 'jameda' | 'calendly' | 'cal_com' | 'simplybook';

export type Block =
  | { type: 'hero'; headline: string; subheadline?: string; body?: string; image_ref?: string; cta_label?: string; cta_link?: string }
  | { type: 'services_grid'; title?: string; items: Array<{ name: string; description?: string; icon?: string; image_ref?: string }> }
  | { type: 'booking_widget'; provider: BookingProvider; merchant_id: string; embed_code?: string }
  | { type: 'testimonials'; title?: string; items: Array<{ name: string; text: string; rating?: number }>; aggregate_rating?: number; rating_count?: number; source?: 'google_places' }
  | { type: 'about_section'; headline: string; body: string; image_ref?: string }
  | { type: 'contact_info'; phone?: string; email?: string; address?: string; map_embed?: string }
  | { type: 'gallery'; title?: string; images: Array<{ image_ref: string; alt: string; caption?: string }> }
  | { type: 'text_section'; headline?: string; body: string }
  | { type: 'menu_section'; title?: string; categories: Array<{ name: string; items: Array<{ name: string; price?: string; description?: string; image_ref?: string }> }> }
  | { type: 'team_section'; title?: string; members: Array<{ name: string; role: string; bio?: string; photo_ref?: string }> }
  | { type: 'opening_hours'; title?: string; schedule: Array<{ day: string; hours: string }> }
  | { type: 'cta_banner'; headline: string; body?: string; button_label: string; button_link: string }
  | { type: 'legal_page'; template_id: string; page_type: 'impressum' | 'dsgvo' | 'cookie_consent'; fields: Record<string, string> };

export interface ContentAsset {
  id: string;
  path: string;
  source: 'google_places' | 'customer_upload' | 'ai_generated';
  alt: string;
  dimensions?: { width: number; height: number };
  generated_by?: string;
}

export interface ContentJson {
  schema_version: '1.0';
  meta: { vertical: string; subtype: string; principle: string };
  site: { name: string; tagline?: string; languages: string[] };
  navigation: Array<{ label: string; page_id: string; external?: boolean; href?: string }>;
  pages: Record<string, { title: string; meta_description?: string; blocks: Block[] }>;
  assets: ContentAsset[];
  legal: { impressum_template: string; dsgvo_template: string; fields: Record<string, string> };
}

export interface MetaJson {
  customer_slug: string;
  principle: 'modern' | 'classic' | 'minimal';
  vertical: string;
  subtype: string;
  /**
   * Canonical token contract — must match the CSS-variable contract emitted
   * by tokensToCssVars in shared/load-customer.ts (the SOURCE OF TRUTH).
   * The Webcreator worker's mapDesignTokens adapter (apps/worker/src/jobs/
   * generate-pipeline.ts) writes this exact shape. Older meta.json that
   * predates this shape is still accepted at runtime via per-field
   * defensive defaults in tokensToCssVars.
   */
  design_tokens: {
    colors: {
      bg: string;
      surface: string;
      fg: string;
      fg_muted: string;
      primary: string;
      accent: string;
      border: string;
    };
    typography: {
      primary: string;
      secondary: string | null;
      scale: { h1: string; h2: string; h3: string; h4: string; body: string; small: string };
      line_heights: { h1: string; h2: string; h3: string; body: string };
      font_weight_regular: number;
      font_weight_bold: number;
    };
    spacing: number[];
    radius: { sm: string; md: string; lg: string; full: string };
    shadows: { sm: string; md: string; lg: string };
    component_tokens: {
      button_primary: string;
      button_secondary: string;
      card: string;
      nav: string;
    };
  };
  updated_at: string;
}

export const BLOCK_TYPES = [
  'hero', 'services_grid', 'booking_widget', 'testimonials',
  'about_section', 'contact_info', 'gallery', 'text_section',
  'menu_section', 'team_section', 'opening_hours', 'cta_banner',
  'legal_page',
] as const;
