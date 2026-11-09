# Background images — v4.25 / renderer23

Every registered template accepts an optional independent full-slide background. Use supplied/explicitly authorized decorative photos or graphics. It does not replace the template's foreground image, figure, gallery, cards, source wording or optional header/footer. The browser remains a viewer; the agent makes tracked changes.

Native slide data:

```json
{"background":{"src":"assets/user/normalized-image.webp","alt":"An accurate description of this decorative background."}}
```

Only `src` and meaningful `alt` are supported. Omission/null means no background. The image covers1920×1080, centered with preserved aspect ratio, behind all content. The renderer adds no automatic opacity wash, contrast gradient, filter or type change. It does not infer a palette from pixels. For a new deck with an observed background image and no explicit palette preference, the host agent chooses a legible Light/Dark palette from the actual image and briefly states that choice. Keep default Light for new decks without a background preference. Respect an explicitly requested or saved palette; if it conflicts with a background, explain the concrete contrast problem and suggest a suitable asset or authorized palette change. Do not silently recolor an existing deck. Keep existing opaque card/table surfaces. An arbitrary busy image may need a more suitable asset/layout for legibility; review actual text/logo/footer contrast and PDF, without hiding or rewriting source content. Do not use a decorative cropped backdrop as a substitute for essential product screenshots, figures or factual evidence.

## Creation and edits

For `edit-slide.mjs`, supply `{"background":{"src":"/absolute/path/image.png","alt":"..."}}`. `{"background":null}` removes it. Use the normal runtime flags and omit --output to update the same project. The helper ingests a proportional WebP with height≤1080/no upscaling, retains originals/provenance and checks fit/export/replay. Changing only palette retains the user's background and foreground imagery.

For several slides, use `edit-deck.mjs` with explicit stable IDs:

```json
{"slides":[{"id":"slide-id","edit":{"background":{"src":"/absolute/path/image.png","alt":"..."}}}]}
```

Repeat the requested IDs to share one image; do not add it to every slide without that scope. Native additions accept `addSlides[].content.background`. A background can be applied to image-free recipes: no-image means no foreground photo, not a prohibition on an explicitly requested backdrop. Never remove required Gallery/Figure content in its place.

For exact-source generation, map a supplied decorative figure block in `candidate.fields`:

```json
{"background":{"image":{"asset":"b0004"},"imageAlt":{"ref":"b0004"}}}
```

This is not literal hidden metadata: it consumes a real image block and its figure alt, follows the original asset order/boundary constraints, is normalized during build, and is replayed/hash-verified like foreground imagery. Ordinary body text cannot be mapped into background alt. For supplementary/shared decoration outside a fixed-boundary source, build a faithful base deck first and apply the independently supplied asset through tracked edits. Do not rewrite the source snapshot or weaken boundary/coverage checks to reuse one decorative asset. Older runtimes need an explicit compatible --studio upgrade to this bundled studio.

## Third Cover example

cover-background (“Cover · Background image” / “Okładka · Obraz w tle”) is third, after cover-default and cover-separated. It demonstrates the Figma93:2424 Dark and93:2441 Light full-slide background plus the classic wide foreground photo. Both images are required for this particular example's contract; other recipes can use just a background. The existing cover-no-image is its foreground-free partner.

The example deliberately permits foreground-photo/text overlap at x614/width1306, top112/height856 (standing whole-slide centering), matching the classic composition. cover-separated and other non-overlapping Covers retain their26px exclusion rule. Catalogue palette changes select the authored sample background/photo; actual user palette changes retain user assets. materialize is preview-only; instantiate never inherits the sample background/photo. Removing the required background through a tracked edit selects a compatible non-background Cover while preserving the foreground photo/text.

The card description and EN/PL prompts explicitly explain that background images are available for any template. Both supplied backgrounds are optimized local1920×1080 WebP; originals/hashes are retained in BACKGROUND_REFERENCE_V425.json and the workspace evidence. A single new example demonstrates this orthogonal capability; do not duplicate every recipe with/without a background.
