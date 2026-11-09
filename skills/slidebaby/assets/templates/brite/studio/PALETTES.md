# Brite Light and Dark

For optional background images on any template, source mapping and tracked add/replace/remove, read [BACKGROUND_IMAGES.md](BACKGROUND_IMAGES.md). The third Cover example demonstrates it; foreground images and text remain independent.

All 69 active recipes in fourteen families support `light` and `dark` without duplicate recipe IDs. Each slide may have `palette:"light"` or `palette:"dark"`; omission retains Light for existing documents. Other values, including null, are invalid. This is independent of UI language and typography. Mixed-palette decks are supported.

## Template browsing and prompts

The single switch at the top of Templates changes all catalogue previews, the enlarged preview and copied prompts. It never changes saved presentation data, its matching PDF, or the viewer interface theme. Light is the initial default; a local catalogue preference/`templatePalette` URL parameter can remember the last selection. This parameter is a catalogue preference, not a presentation override. Prompts explicitly name the palette and instruct the agent to save it on the new slide.

Keep one shared control; individual template switches are not planned. Its right-aligned EN/PL help link opens a numbered usage modal with requests for new slides, a single slide, all slides and mixed palettes. Do not duplicate recipes for palettes or infer an actual deck recolor from a library preference.

## Creating and revising slides

For source composition put `"palette":"dark"` on the plan slide, next to its `id` and `candidates`, not in source-mapped `fields`. Every candidate for that slide receives it. Keep the requested or saved palette. For a new deck without a background preference, default to Light. For a new deck with an observed background image and no explicit palette choice, choose the legible Light/Dark option from that image and briefly state the choice; read BACKGROUND_IMAGES.md. The renderer never recolors a saved slide automatically. Do not copy sample text, brand or photographs.

For a tracked edit use `{"palette":"dark"}` as the edit-slide input. A deck batch uses:

```json
{"slides":[{"id":"existing-slide-id","edit":{"palette":"dark"}}]}
```

Resolve real stable IDs first. To change the whole presentation, list all its existing slide IDs in the batch; do not create a parallel project or rewrite text. Palette-only edits preserve wording, images, local layout settings and other slides. Omit `--output` to update the same saved project. `palette:"light"` restores Light; there is no arbitrary CSS/theme field or implicit font change.

Native `addSlides[].content.palette` is also accepted. `instantiate` deliberately does not insert an implicit Light property, preserving old source hashes. Palette is included in guarded source/edit content hashes and replay. Do not edit presentation.js directly to bypass those records. Older saved runtimes need an explicit compatible `--studio` upgrade to this bundled studio when adding the new palette field; then use its copied helpers normally. Follow EDITING_WORKFLOW.md, export matching HTML/PDF and inspect every PDF page.

## Color scope and review

Light retains its existing pixels. Dark reverses paper/ink: background #000000, foreground #f5f5ec. Outlines and line roles follow foreground; subtle table rules/header tint use the foreground at their existing opacities. Filled card surfaces in Feature cards, Comparison, Process, Roadmap and Summary use #161616, as approved in Figma92:2385, against the black slide. Outlined cards keep their black surface and cream border; Plain variants stay transparent. Inverse number tiles retain their readable paper/dark treatment. Typography and card geometry remain unchanged.

Known bundled monochrome Brite logos use new cream SVG derivatives; original files remain. User brand artwork, photographs, screenshots and figures retain their own colors. Never filter/invert an entire slide or raster asset. For a supplied logo with poor contrast, suggest a suitable light logo rather than modifying its artwork without a request. An actual screenshot can contain a light interface; dark palette does not redesign that content. Footer over supplied photography still needs visual contrast review. Cover gradients/masks for text contrast are removed (D91 supersedes D80/D90). The photo narrows to the remaining width after all text boxes plus a 26 px gap, except for cover-default and cover-background, whose wide photos intentionally extend behind text. Text settings and whole-slide vertical centering stay intact. Dark catalogue Covers use the supplied Figma1:19 photo; actual slide images remain the supplied source, even when their palette changes. See TEMPLATE_CONTRACTS.md. Bundled Agenda/Process/Roadmap rule SVGs have cream derivatives with unchanged opacity. The known illustrative transparent chart bitmap keeps a paper backing so its rasterized axis labels remain readable; image pixels stay unchanged.

User review may establish later palette refinements. Do not claim all possible user images or hosts are certified by bundled sample tests.


## Cover and background behavior

cover-default and cover-background intentionally place the wide photo under text in both palettes. All other photo Covers fit it beside the full text column with26px separation, preserving type and wording. No gradient/mask/wash is added. Check legibility and suggest cover-separated when appropriate; respect an explicit selection. Every template supports an independent background:{src,alt} under BACKGROUND_IMAGES.md. Dark Filled surfaces remain #161616. Native palette changes retain user imagery. Current counts/IDs come from scripts/catalog.mjs.
