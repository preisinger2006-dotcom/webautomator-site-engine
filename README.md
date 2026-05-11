# @webautomator/site-engine

Shared Astro engine used by every WebAutomator customer-site repo
(`webautomator-{slug}`).

Each customer repo depends on this package via a github dependency:

```json
{
  "dependencies": {
    "@webautomator/site-engine": "github:preisinger2006-dotcom/webautomator-site-engine#main"
  }
}
```

When Cloudflare Pages builds the customer repo, `pnpm install` resolves
this dep to the latest commit on `main` of this repo, giving every
customer site the same engine code in lockstep.

## Layout

```
/templates/
  /modern/        Astro template — Modern principle
  /classic/       Astro template — Classic principle
  /minimal/       Astro template — Minimal principle
/shared/
  /blocks/        Block components (closed registry of 13 types)
  BlockRenderer.astro
  Layout.astro
  Attribution.astro      Google Maps photo attribution (Maps Platform Terms)
  load-customer.ts       Loads customers/{slug}/{content,meta}.json
  types.ts
/scripts/
  build-all.mjs          Iterates customers/* and builds each variant
  build-variant.mjs      Builds a single customer × principle (CF Pages entry)
/astro.config.mjs        Per-customer dynamic routing + Tailwind
```

## Block registry

The 13 block types are listed in the Webcreator repo at
`packages/core/src/schema/content.ts`. The registry is closed: adding a
new block type requires a new component in `shared/blocks/` AND an entry
in the registry. AI cannot invent new block types via chat-edits.

```
hero, services_grid, booking_widget, testimonials, about_section,
contact_info, gallery, text_section, menu_section, team_section,
opening_hours, cta_banner, legal_page
```

## Cloudflare Pages build

Each customer × principle gets its own Cloudflare Pages project, named
`wa-{slug}-{principle}` (see `packages/services/src/services/deploy-service.ts`).

Build command (set by the control plane on project create):

```
CUSTOMER_SLUG=<slug> PRINCIPLE=<modern|classic|minimal> npx astro build
```

Output: `dist/`. The customer repo's `astro.config.mjs` re-exports this
package's config, which reads `CUSTOMER`/`PRINCIPLE` env vars to pick the
right template and write `customers/{slug}/{content,meta}.json` into
the template.

## Local dev

```bash
pnpm install
CUSTOMER=_fixture PRINCIPLE=modern pnpm dev
```

`_fixture` is a stub customer kept in this repo for engine-only testing;
real customer data lives in the per-customer repos.
