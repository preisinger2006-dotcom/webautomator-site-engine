// Mirror of Webcreator's src/types/content.ts.
// Kept in sync manually until a shared package is extracted.

export type BookingProvider =
  | 'quandoo' | 'resmio' | 'opentable' | 'google_reserve'
  | 'doctolib' | 'jameda' | 'calendly' | 'cal_com' | 'simplybook';

export type Block =
  | { type: 'hero'; headline: string; subheadline?: string; body?: string; image_ref?: string; cta_label?: string; cta_link?: string }
  | { type: 'services_grid'; title?: string; items: Array<{ name: string; description?: string; icon?: string; image_ref?: string }> }
  | { type: 'booking_widget'; provider: BookingProvider; merchant_id: string; embed_code?: string }
  | { type: 'testimonials'; title?: string; items: Array<{ name: string; text: string; rating?: number }> }
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
  design_tokens: {
    colors: Record<string, string>;
    typography: { primary: string; secondary?: string; mono?: string };
    spacing: Record<string, string>;
    radius: Record<string, string>;
  };
  updated_at: string;
}

export const BLOCK_TYPES = [
  'hero', 'services_grid', 'booking_widget', 'testimonials',
  'about_section', 'contact_info', 'gallery', 'text_section',
  'menu_section', 'team_section', 'opening_hours', 'cta_banner',
  'legal_page',
] as const;
