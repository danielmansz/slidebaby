# Optional reusable brand profile

A profile saves only the shared header/footer settings the user explicitly supplies. It is optional: create a deck without one when no profile is requested. Do not turn it into onboarding questions or infer dates, palette, typography or slide content. The profile name is a file-management label, not a slide brand.

Use the existing [shared chrome contract](SHARED_SLIDE_ELEMENTS.md): `brand`, `section`, `footerLeft`, `pageNumbers`, `footerRight`. Absent settings stay absent; `null` hides an individual text/brand field, `false` disables page numbers, and `chrome:null` hides all chrome. A profile does not implement themes, custom fonts or colors. Long labels and logo readability still need the normal measured build/export and visual review.

## Save explicit settings

Create an input JSON file outside the installed skill:

```json
{
  "schemaVersion": 1,
  "name": "Northstar",
  "chrome": {
    "brand": {"kind": "text", "text": "Northstar"},
    "pageNumbers": true
  }
}
```

```sh
NODE PROJECT/scripts/brand-profile.mjs \
  --input /absolute/brand-input.json \
  --output /absolute/NEW-brand-profile
```

`NODE` is an existing Node executable; `PROJECT` is the studio. Save creates a NEW directory containing `brand-profile.json` and, for an image logo, its content-hashed asset. Existing output paths are refused. Input files and originals remain untouched. An interrupted/failed logo conversion can leave an incomplete new directory; preserve it and use a new name on retry. Nothing is installed or fetched, and no deck is changed.

For a logo, replace `brand` with `{"kind":"image","src":"./logo.svg","alt":"Northstar"}`. Relative logo paths resolve against the input JSON file. Use supplied local PNG/JPEG/WebP or self-contained inactive SVG only; never search for assets merely because a profile exists. SVG stays byte-identical. Raster ingestion uses the existing `ingestImage` helper, preserves aspect ratio/alpha without upscaling, and saves WebP with height at most1080px. Original path/hash/bytes and derivative settings/hash are kept in `assets`. Originals stay outside the profile.

Raster logos require the same existing runtime paths used for other image imports:

```sh
NODE PROJECT/scripts/brand-profile.mjs \
  --input /absolute/logo-brand-input.json \
  --output /absolute/NEW-logo-profile \
  --playwright-module /existing/playwright/index.mjs \
  --browser-executable /existing/chromium
```

`--module-root /existing/node_modules` can replace `--playwright-module`. Text and SVG profiles need no browser. The helper validates chrome against the live catalogue; unsupported settings fail explicitly.

## Reuse without changing the saved profile

```sh
NODE PROJECT/scripts/brand-profile.mjs \
  --profile /absolute/brand-profile/brand-profile.json
```

This read-only command validates the saved schema, chrome, contained logo path, derivative hash and provenance. It prints `{valid,profile,name,chrome}` with an absolute logo path suitable for a normal build or compatible deck edit. It does not need the original logo file to remain accessible. Move/copy the complete profile folder, including `assets`, when reusing it elsewhere. Do not edit a guarded image in place; save a new profile for changes.

Programmatic use:

```js
import {loadBrandProfile} from './scripts/brand-profile.mjs';
const profile = await loadBrandProfile('/absolute/profile/brand-profile.json');
// Only when the user requested this profile:
plan.presentation.chrome = {...plan.presentation.chrome, ...profile.chrome};
```

For `chrome:null`, assign `plan.presentation.chrome = null` instead of spreading it. An image brand replaces the whole previous brand value. Existing per-slide chrome overrides remain in effect; a reusable default is not permission to remove them. Pass the resulting chrome to the normal source plan or supported tracked edit, preserving the parent and checking the new HTML/PDF. Do not rewrite generation records or change content to apply a brand. Applying a profile does not by itself certify logo contrast, proportions or one-line label fit.

EN request: “Save these settings as an optional Northstar profile and use it for this deck: text brand Northstar, page numbers on.”

PL request: „Zapisz te ustawienia jako opcjonalny profil Northstar i użyj go w tej prezentacji: nazwa Northstar w nagłówku, numeracja stron włączona”.

Saving a profile for future reuse does not authorize applying it to every deck, adding a date, changing original slide text, or installing anything globally.
