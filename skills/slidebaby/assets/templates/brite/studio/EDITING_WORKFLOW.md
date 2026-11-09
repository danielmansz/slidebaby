# Change an existing slide safely

For optional background images on any template, source mapping and tracked add/replace/remove, read [BACKGROUND_IMAGES.md](BACKGROUND_IMAGES.md). The third Cover example demonstrates it; foreground images and text remain independent.

For the per-slide Light/Dark setting, catalogue switch, source-plan field and tracked edits, read [PALETTES.md](PALETTES.md). Omitted palette remains Light; unrelated edits preserve the saved choice.

Current editing workflow. Update the same project by default; a separate output is only for an explicitly requested copy. Use this workflow for a later request to add/remove a decorative photograph, add/insert/reorder cards, explicitly update a card's text, change a compatible template or Light/Dark palette, or set optional card numbers/compact typography. Do not append a replacement slide. The browser remains a viewer; the agent performs the edit locally.


## Explicit text revisions and document edits — v4.18

A change to wording is an explicit new source input, not a side effect of selecting a layout. The saved edit request, original deck/generation records and replay chain retain what changed. Ordinary corrections update the SAME project, presentation.html and exports/presentation.pdf; previous managed file contents are recoverable under .brite/history. A new --output is an explicit separate-copy request, not the default. Use these helpers for supported changes rather than rebuilding unrelated slides or deleting provenance. Do not create a new timestamped HTML/project for each correction. Source/plan reconstruction remains necessary for unsupported structures, list/action-count restructuring outside the operations below, or a genuinely different narrative. The user describes the change in ordinary language; the agent writes this JSON.

Single-slide `edit-slide.mjs` accepts `setText` in addition to the appearance/photo/card operations below:

```json
{"setText":[
  {"path":"/title","before":"Previous heading","value":"The supplied replacement"},
  {"path":"/description","before":"Previous description","value":null},
  {"path":"/table/rows/0/1","before":"£450","value":"£500"}
]}
```

Use only paths present in the target's schema; these three examples illustrate different possible targets, not a single universal slide. Indices are zero-based. `before` is mandatory and must match the current value exactly; use null for an absent optional field. Existing title-line arrays may be replaced by supplied text or another explicit line array. Optional text can be removed with null; required text cannot. Table cells/headers may be blank strings, preserving literal data. No calculations, inferred values or global find/replace are performed.

Supported text paths: `/title`, optional `/description`, `/caption`, `/sectionNumber`, Summary `/takeaway`, `/takeawayLabel`, `/takeawayDescription`, Quote `/quote`, `/author`, `/authorRole`, `/imageAlt`; existing `/paragraphs/N`, `/points/N`; `/actions/N/title|description`, `/steps/N/title|description`, `/milestones/N/period|year|title`, `/milestones/N/points/N`, `/columns/N/title`, `/columns/N/items/N/title|description`, `/metrics/N/value|label|description`, `/items/N/title|description`, `/images/N/alt`, `/table/headers/N`, `/table/rows/N/N`. Every path remains subject to that family's contract and real measured fit. Card wording uses stable-ID `updateCards`, not positional text paths. Essential image files/collections cannot be removed by changing their alt text.

For multiple target slides, local title/group settings, shared branding or slide insertion/removal/reordering use `scripts/edit-deck.mjs` with the same runtime flags, **without --slide or --output** by default:

```json
{
  "slides":[
    {"id":"cover-id","edit":{"setText":[{"path":"/title","before":"A review","value":["A","clearer","weekly","review"]}]},"overrides":{"title":{"width":700,"fontSize":100,"targetLines":4}}},
    {"id":"summary-id","edit":{"setText":[{"path":"/actions/0/title","before":"Check dates","value":"Confirm dates"}]}}
  ],
  "chrome":{"brand":{"kind":"text","text":"Northstar"},"pageNumbers":true}
}
```

`slides` uses distinct existing IDs. Each item can contain a supported `edit`, explicit `chrome` and/or `overrides`; all unspecified content/settings remain. A chrome object merges explicitly supplied fields; null hides all slots. Local overrides use supported title/group keys and bounded values; null resets a key/group or the entire overrides object. Use title arrays for explicit lines, not an invented lineStarts override. Cover-only textTransform accepts none/uppercase. Measured fit still validates line count and collisions.

Optional document fields:

- `addSlides:[{id,template,content,afterId?}]`: supplied new native content instantiated from an active recipe, never from sample text. Absent afterId appends; null inserts first; an existing ID inserts after that slide. Supplied images are ingested with provenance.
- `removeSlides:[id,...]`: explicit removals. At least one slide must remain. A slide cannot be edited and removed in one request.
- `slideOrder:[id,...]`: every resulting ID exactly once, including any additions. Counts stay within1–60. Pagination and dynamic agenda targets resolve after the new order.

Keep an existing agenda synchronized with authorized section additions/removals under [AGENT_GUIDE.md](AGENT_GUIDE.md#keep-existing-overviews-current). Remove an obsolete section entry, or retarget it to the surviving section start when only its first slide was removed; do not point the label to an unrelated section or erase the entire agenda. A dangling target still blocks export. The current edit schema does not add/remove agenda items or change their targets: use a deliberate source/plan revision and guarded rebuild for those structural changes, retaining archived originals. Supported cross-family projections and accepted exact-range continuations are defined in [REFLOW.md](REFLOW.md). Other remapping is still not automatic. Structural changes are explicit later source requests: original count/boundary records remain archived as the original brief, and the new request records the authorized changes. Existing user content must not disappear through an appearance-only operation.

`splitSlides` is a guarded document operation for an accepted REFLOW.md proposal, with exact ordered body ranges rather than replacement text. Do not fabricate a split or apply one without user acceptance.

Both helpers stage a new project, normalize only supplied assets, replay the original source plus every edit, measure and export, then publish to the current project. A separate NEW output is used only when explicitly requested with --output. On overflow, exit2 returns review/proposal paths and exact choices as described in REFLOW.md. A stale previous value, incompatible family/count, overflow, invalid asset or export failure leaves the last valid current source, HTML and PDF untouched. New asset normalization binds each supplied path/base to its actual derivative; legacy records remain readable. Result fields html/pdf/project are real paths; default delivery includes both formats. See DELIVERY.md.

An optional [brand profile](BRAND_PROFILE.md) may supply `chrome` only when the user requests it. Load/validate the profile; copy its explicit chrome into the new plan or tracked document request, preserving per-slide exceptions. It never rewrites slide text or enables a new palette/font.

## User-facing requests

Examples: “Add my photo to slide 2”, “Add this fourth card”, “Put this card before the savings card”, “Use the outlined design”, “Replace this card description with the text below”, or “You may use slightly smaller text if needed.” Resolve the saved slide ID and existing card IDs from presentation.js. Ask only for missing required material, such as the actual photo or a new card's wording. Never use banking preview content as a substitute.

## Revision helper

Write an edit JSON with only the requested changes. For appearance/card additions, existing wording/settings need not be copied into the request. Explicit setText changes additionally include their exact before values:

```json
{
  "addCards": [{"title": "Spending trends", "description": "The user's new description."}],
  "image": {"src": "/absolute/path/photo.jpg", "alt": "Description of the supplied photograph."},
  "allowSmallerText": false
}
```

Run with already available local runtime paths:

```sh
node scripts/edit-slide.mjs \
  --project /absolute/parent-presentation \
  --slide stable-slide-id \
  --input /absolute/edit.json \
  --playwright-module /existing/playwright/index.mjs \
  --pdf-lib-module /existing/pdf-lib \
  --browser-executable /existing/chromium
```

The saved project's visual runtime is retained by default; current bundled edit/publication helpers and guidance are copied into checked staging. --studio can explicitly choose a compatible visual runtime, not silently reset a customized design. Omit --output and --scratch for the usual in-place edit. Internal .brite/work staging is temporary; failed candidates remain for diagnostics. An explicit scratch must use a real directory outside the project/skill. An explicit different --output must be new and is used only for a requested separate copy. Do not install dependencies or edit the installed starter.

Supported fields:

| Field | Meaning |
| --- | --- |
| template | Optional active template ID in the same family or a supported REFLOW.md pair. Otherwise choose the matching photo/card-count variant while retaining appearance. |
| image | `{src,alt}` adds/replaces a decorative photo; null removes it. Paths are relative to the parent project or absolute. Essential figures/galleries need a deliberate composition/source revision. |
| addCards | Array of `{title?,description?,id?,beforeId?}` with at least one nonempty heading/body. Generated IDs are recorded. beforeId inserts at a precise existing card; otherwise append. |
| updateCards | Array of `{id,title?,description?}` with explicit replacement wording; null removes an optional field, but at least one nonempty heading/body must remain. Only supplied fields may change. Previous wording remains in the archived origin/history; this is an authorized content revision, not a layout side effect. |
| cardOrder | Every resulting card ID exactly once, in the requested order. Without it, existing order remains. |
| cardNumbers | Boolean, independent of footer pagination. |
| allowSmallerText | Explicit boolean consent for a bounded whole-row body-text reduction. Default is false; existing recorded consent on this slide persists unless revoked. Never set true merely to make a failed candidate pass. |
| typographyProfile | auto, normal or compact. compact requires consent; auto tries normal and compact spacing first, then one smaller preset only with consent. normal retains baseline sizes even if permission exists. |

Changing count does not authorize changing existing text or its font size. The helper retains the previous row baseline (30 px or 28 px), even when the new count's authored default differs. A newly composed four-card template starts at its designed 28 px; preserving a previous 30 px baseline during a three→four edit is a separate obligation. Compact text uses one 2 px step for every card body: 30→28 or 28→26, with matching line height. Card headings retain their heading role. No per-card shrinking or unlimited retries.

Keep optional chrome, card-number choices, IDs, order and compatible title/group overrides. Incompatible explicit geometry is rejected rather than silently reset. The helper supports compatible variants and the bounded cross-family projections in REFLOW.md; it does not invent headings or a five-card layout. When measured fit fails, review its exact alternative/split proposal, preserving the previous document until an accepted correction fits.

## What is saved

The user keeps one current project folder, one presentation.html and one exports/presentation.pdf. index.html, saved presentation.js, source/generation records, replayable edit requests and immutable content-hashed assets remain editable. Existing notes and unrelated user files are preserved.

Helpers hold a short project-local write lock, validate/measure/export in isolated staging, then publish only managed changes with compact gzip recovery backups under .brite/history. The standalone viewer is renamed last and embeds its own matching PDF. A partial publication failure rolls back tool-owned changes; observed external changes are preserved and reported instead of overwritten. An interrupted transaction is checked/recovered on the next write. A live operation rejects a competing write; a stale lock is retained as diagnostic metadata rather than blocking forever.

Only the operation's own completed temporary staging copies are removed. Failed candidates remain for inspection. This is not cleanup of previous projects, old timestamped exports, original photos, notes or user files. No new standalone snapshots/project folders are created during normal edits. A genuinely requested separate copy still preserves the original project.

Each explicit edit retains its raw request, normalized replayable operation, source/derivative image hashes, before/after content hashes and result. Original generation records remain verified against edits/base-presentation.js; later requests replay to the current saved document. Font consent cannot be silently enabled. Use verify-document.mjs for both generated/plain edited decks. Do not delete generation/edits records to bypass guards.

The result returns stable html/pdf/project paths. Under LIVE_PREVIEW.md, reuse the running live URL so the tab updates automatically after a successful save. For an offline presentation.html, tell the user to refresh that same file. export.mjs updates the stable outputs with history; make-preview.mjs defaults to the same viewer, and an explicit NEW --output makes a requested snapshot. Do not edit the derived viewer as source. On first update of a legacy project, use the newly returned stable link; old preview-REVISION.html files remain snapshots.

A deliberately rewritten source/plan may use build-deck.mjs with the current project as --output. It recognizes a valid Brite project and archives replaced managed records before publishing the new baseline to the same folder. Preserve stable IDs/settings and unrelated content in the plan unless the request changes them; a source rebuild is not an excuse to reset the design. Other existing folders and unregistered viewer/PDF collisions are refused.

## Adaptive height

Cards use natural content height and all cards in a row stretch to the tallest one. The former five-line body cutoff is removed: available measured height, wrapping, safe margins and collisions determine fit. A five-line guide remains for design guidance; card headings retain their two-line budget. The normal→compact-spacing retry remains bounded. No text is clipped, summarized or replaced automatically. Removing badges/optional introduction can free space, while removing a card's background photo does not inherently widen its columns.

Inspect the final PDF as well as HTML after a structural edit. State if compact text was used and what changed; do not call an overflowing or unverified draft complete.


D54: New supplied raster images are automatically converted/scaled to WebP by the current build/append/edit helpers using existing Playwright/Chromium. Include --playwright-module and --browser-executable for compose.mjs when importing raster images as for export. No manual source-image replacement is needed. Originals stay at their supplied paths; derivative hashes and original provenance are recorded. See ASSET_GUIDANCE.md. Existing decks are not retroactively transcoded.


D67: Comparison/Process/Roadmap now accept decorative image edits in Outline/Filled, selecting the paired -photo/base ID while retaining the existing appearance. Explicit same-family template changes can also switch appearance while preserving columns/steps/milestones. Plain cannot carry a photo. For example {"image":{"src":"/absolute/path/photo.webp","alt":"A meaningful description."}} adds/replaces photography; {"image":null} removes it. Both run measured fit and export as a checked in-place update with internal history. Do not shrink type, change source wording, or bypass provenance to make a narrower title fit. A sourced image can be intentionally removed through this replayable edit without altering archived generation records.


D68: Native table data participates in the lossless edit invariant. Existing visual/no-op template edits retain the complete headers/rows/alignment, wording, blanks and order. Data table and criteria matrix are compatible same-family appearances; neither has a decorative photo partner. Explicit literal cell/header text changes now use setText under v4.18; add/remove/reorder rows or columns through a deliberate new source/plan revision, preserving the parent; generic card edits do not mutate table data.


## Table / criteria matrix appearance — D73

For an explicit request to show an existing table as a matrix, use {"template":"table-criteria-matrix"}; for the Data table appearance use {"template":"table-default"}. Both are same-family visual revisions supported by edit-slide.mjs. The entire table (headers/cells/alignments/order/blanks), title, description, caption, chrome and local overrides remain unchanged. Matrix bounds are3–5 total columns and1–6 rows; an incompatible count or actual overflow rejects instead of rewriting/slicing data. A successful revision returns the new HTML/PDF/project paths. No data-content edit or automatic transpose is implied by a style request.


## Summary appearance and background — D74

Summary style switches use template:summary-outline / summary-filled / summary-plain, or their -photo counterparts for the first two. Image add/remove retains the current Outline/Filled appearance automatically; Plain cannot accept an image. The helper guards takeawayLabel/takeaway/takeawayDescription/actions as well as title/description/chrome/overrides. Every action's order and title/detail survives; no sample text is substituted. Existing Summary text/action fields can use explicit tracked setText under v4.18; action-count changes require a deliberate source/narrative revision, not addCards or untracked mutation. Equal card height grows without smaller text. A fresh checked HTML and PDF accompany each successful update at the same paths.


D94 / v4.25: Every template supports an independent optional background:{src,alt}, with guarded source mapping, normalized image provenance and tracked add/replace/remove. Read BACKGROUND_IMAGES.md. cover-background is third in Cover order and demonstrates both palettes with the supplied Figma backgrounds plus a classic wide foreground photo. That example also permits authored photo/text overlap; the previous first-Cover-only statement is superseded for this newly supplied design. No other layout/imagery is silently changed.69 recipes/fourteen families, renderer23, empty starter.

D99: Reuse verified existing PDF browser/runtime paths. After a checked edit retain the current external live tab; do not open another window per correction. To reopen explicitly, use scripts/open-preview.mjs as described in DELIVERY.md.
