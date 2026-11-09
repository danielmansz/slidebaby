# Source-to-deck workflow

For optional background images on any template, source mapping and tracked add/replace/remove, read [BACKGROUND_IMAGES.md](BACKGROUND_IMAGES.md). The third Cover example demonstrates it; foreground images and text remain independent.

For the per-slide Light/Dark setting, catalogue switch, source-plan field and tracked edits, read [PALETTES.md](PALETTES.md). Omitted palette remains Light; unrelated edits preserve the saved choice.

Before the first build in the current environment, use PROJECT/scripts/check-runtime.mjs to check existing tools. For bare first use, read the installed skill’s references/first-run.md if available. Reuse its observed runtime paths and current-session result; missing tools are explained without automatic installation.

Use existing local runtimes. All paths below are placeholders resolved for the current machine, never installed automatically. Preserve new source snapshots/plan revisions. First creation uses a new project folder; subsequent edits or an authorized source rebuild update the same current project and stable HTML/PDF, with internal recovery history. Keep first-build scratch outside the installed skill; saved-project updates may use their default .brite/work staging. The model running the skill chooses semantics; no model API key is needed by the helpers.

## Optional assets and continuity

Before creating a deck or making a relevant visual edit, read the studio's ASSET_GUIDANCE.md and existing project asset notes. Inspect supplied material before suggesting logos, photos, screenshots or image-quality improvements. Continue creating a valid deck without optional assets; do not wait for replies or repeat unchanged offers. Source-required visuals and fit failures remain separate requirements. Keep explicit preferences and offered/unanswered/declined/deferred/provided/used status in project-local ASSET_NOTES.md only when useful. In-place edits/rebuilds preserve existing project notes. On first creation or an explicitly requested separate copy, carry relevant prior notes into the successful output; retain notes in scratch on failure. The bundled starter has no user-specific notes.

For an unknown relevant photo preference, use ASSET_GUIDANCE.md's one nonblocking own-later / stock / none choice within the existing offer cap. No answer means no external search and a valid no-photo draft. Explicit stock consent permits a later guarded decorative-photo revision of the source-preserving base. Keep stock source/license notes separate; do not fabricate original source-figure refs or add foreign stock to a homepage capture's selectedAssets. Skip already known choices, adequate supplied images and the fixed sample.

## 1. Read the current contracts

Resolve PROJECT with the installed skill’s `node scripts/slidebaby.mjs resolve [--design ID] [--project SAVED_PROJECT]`, then run `node PROJECT/scripts/catalog.mjs`. Brite is the current default visual template; use its registered runtime or the recognized saved project. Contracts describe required/optional fields, exact item counts, visual budgets, and image behavior. Read PROJECT/AGENT_GUIDE.md and TEMPLATE_CONTRACTS.md for local editing/export details.

## 2. Prepare the source

```sh
node PROJECT/scripts/prepare-source.mjs --input /absolute/source.md --output /absolute/work/source.json
```

Add `--exact-slides N` only when the user imposes N. Add `--no-continuations` when preserving each supplied slide as exactly one slide. Add `--allow-generated-titles` only when generating new headings is authorized. Otherwise title fields must use exact source references. Structural organization into slides is permitted when the brief leaves boundaries/count open.

The snapshot stores the original UTF-8 text, hash, parsed blocks, constraints, and original path. Input files are never modified. Supported Markdown is headings, plain paragraphs, top-level list items, standalone local images with alt text, plain Markdown pipe tables, and `---` as explicit slide boundaries. Heading markers and unordered bullet markers are structure; soft whitespace may reflow. Numbered list markers remain in the text so a year, value, or explicit ordinal cannot disappear. Nested/indented lists are reported as a gap rather than flattened. This is not a general Markdown renderer. Fenced code, malformed/embedded tables, inline image/link embeds, and embedded HTML are reported as unsupported. Plain TXT is accepted. Read the snapshot: unsupported blocks are a real gap, not a signal to omit them.

## 3. Write a semantic plan

For a source like:

```text
# A clearer way to work

One shared plan helps the team see what matters next.

- Agree on the next step.
- Review the result together.
```

The snapshot identifies b0001 as heading, b0002 as paragraph, b0003/b0004 as list items. A complete plan is:

```json
{
  "schemaVersion": 1,
  "sourceHash": "COPY artifactHash FROM source.json",
  "presentation": {"visualTemplate": {"id": "brite", "version": "1.0.0"}, "title": "A clearer way to work", "language": "en", "footer": "", "date": ""},
  "slides": [{
    "id": "shared-plan",
    "candidates": [{
      "template": "split-no-image",
      "rationale": "One explanation followed by two actions; no image supplied.",
      "fields": {
        "title": {"ref": "b0001"},
        "paragraphs": [{"ref": "b0002"}],
        "points": [{"ref": "b0003"}, {"ref": "b0004"}]
      }
    }]
  }]
}
```

One to three candidates per planned slide are allowed. Each must map the same source references in the same reading order. Candidates can change compatible layout/variant, but cannot drop text to fit. Use live stable template IDs, never positions in the catalog. Explain semantic suitability, such as parallel items versus a sequence, not just a short character count.

Reference forms:

- `{"ref":"b0002"}` uses a full text block.
- `{"ref":"b0002","start":0,"end":120}` uses a JavaScript UTF-16 character range, end exclusive. Split only at whitespace and cover every non-whitespace character exactly once. Prefer splitting whole paragraphs/list items or sentence boundaries; do not cut numbers/words. Headings may repeat on continuation slides.
- For an original standalone Markdown image, `"image":{"asset":"b0005"}` uses that source image. `"imageAlt":{"ref":"b0005"}` uses its alt text; a meaningful nonempty alt is required for figure-default. Caption can reference that text if appropriate. Do not treat unrelated photographs as source material. Relative paths resolve against the original text file; PNG/JPEG/WebP/self-contained SVG only, local inputs up to100 MB/40 MP with optimized derivatives at most20 MB. Figures are copied to content-hashed paths in the result.
- `"title":{"label":"Next steps"}` is allowed only with the explicit generated-title authorization flag. It is recorded in coverage additions. Body text cannot be an untracked literal.
- Cards require exactly two, three or four objects matching the selected recipe, with `title` and/or `description` references and at least one nonempty supplied text field. Do not split one arbitrary sentence into a third fabricated benefit. Image-dependent variants additionally require a supplied source image.

Required fields are mandatory and unsupported fields are rejected. Optional absent fields disappear with their spacing. `presentation` metadata can contain title/language/footer/date strings and structured `chrome` / `visualTemplate` objects; supply footer/date only when given or requested, never from preview samples. New Brite builds normalize omitted visualTemplate to `{id:"brite",version:"1.0.0"}` in the saved plan/deck; explicit other IDs/versions reject. Legacy source plans remain replayable without rewriting them. Exact slide count and explicit `---` source boundaries are checked against the snapshot. The normalizer must not be used to loosen an earlier user constraint.

```sh
node PROJECT/scripts/check-plan.mjs --source /absolute/work/source.json --plan /absolute/work/plan-v1.json --project PROJECT
```

This command is read-only. It checks source coverage, order, item structure, and contracts, not visual fit. Character limits cannot prove fit.

## 4. Build a new checked project

```sh
node PROJECT/scripts/build-deck.mjs \
  --source /absolute/work/source.json --plan /absolute/work/plan-v1.json \
  --project PROJECT --output /absolute/outputs/my-presentation \
  --scratch /absolute/work/brite-build \
  --playwright-module /absolute/existing/playwright/index.mjs \
  --pdf-lib-module /absolute/existing/pdf-lib \
  --browser-executable /absolute/existing/chromium
```

The helper copies only workspace code/assets, not another user's presentation/history/exports. It resolves text references and copies supplied images, then measures each candidate offline. It tries at most three candidates with the renderer's single compact-spacing retry, preserving text and type sizes. It validates the complete selected deck and exports a PDF. Only then does it create the first new project or publish to an existing recognized Brite project specified as --output. A normal follow-up reuses that current path; an unrelated existing folder is refused. Checked publication keeps recovery history and preserves the last valid outputs on failure. A rare first-creation copy failure can leave an incomplete new folder; preserve diagnostics rather than clearing user data.

On fit failure the staged source and fit-report.json stay in scratch. Exit2 returns a measured review/proposal with a fitting alternative layout or exact continuation contents when found. Read [REFLOW.md](REFLOW.md), present the actual text/count and apply only an accepted choice. No final project is published before success. Use --allow-additional-slides false when the latest instruction prohibits extra slides; a split otherwise requires explicit acceptance to change any prior fixed count. Unsupported/no-fitting structures require a focused source decision rather than endless retries or silent shortening.

The result is an ordinary Brite project with source in presentation.js, a matching PDF revision, and generation/input.md, source.json, plan.json, coverage.json, fit-report.json. The actual PDF path is reported by the build command. Source hash/plan checks prove literal text mapping, not semantic appropriateness; visually review the deck.

## 5. Verify and revise

Render the PDF, check every page, and compare text and figures with the source. Inspect My presentation and Download PDF using available browser tools. The UI locale remains independent from source language. Keep the chosen palette consistent and judge figures at final reading size.

```sh
node RESULT/scripts/verify-generation.mjs --project RESULT
```

The regular exporter automatically runs this guard for projects with generation/. It recomputes plan coverage, compares actual slide contents/order with the selected references, and checks copied-image hashes. It permits shared chrome and title/group override edits but blocks changed content until the source/plan is deliberately revised. Missing generation records block export rather than bypassing the guard. Never remove generation/ merely to defeat a failure.

For supported explicit text changes use EDITING_WORKFLOW.md setText/updateCards and tracked in-place updates; the edit input is additional source, with archived original coverage. Unsupported content restructuring still needs a deliberate source/plan revision published to the current project. For a layout-only edit, update that instance's supported overrides, re-export, and inspect the result. Keep instructions concise for the user: they supply content, the agent chooses and saves, then the permitted local live preview updates automatically (LIVE_PREVIEW.md). The offline presentation.html still needs manual refresh.

## Shared slide elements and image-free variants

Read PROJECT/SHARED_SLIDE_ELEMENTS.md for the common contract. `plan.presentation.chrome` defines defaults; `plan.slides[i].chrome` overrides individual fields. A brand is either `{kind:"image",src,alt?}`, `{kind:"text",text}`, or null. Other fields are section, footerLeft, pageNumbers, and footerRight. Null hides text/brand fields, false hides page numbering, and chrome:null hides everything. All are optional; section and right footer can be arbitrary supplied wording. These choices are metadata/instructions, not source-mapped body fields. Logo paths resolve relative to the source text file (or can be absolute) and are copied locally by the build helper. Chrome edits change the PDF fingerprint, but do not relax source-text coverage.

All decorative single-image catalog entries expose pairedTemplate pointing to a same-family image-free treatment. Select it when no decorative photograph is needed. The registry checks pair completeness. Figure text alternative needs supplied caption/explanatory text; a source visual is still preserved by coverage and cannot disappear automatically.

Agenda fields use `items:[{title:{ref:"b0002"},description:{ref:"b0003"},target:"details"}]`. Description is optional. Target identifies a planned slide; the renderer computes its real page after reordering. An explicit positive integer page can be used instead, but not together with target. Page/target are reference metadata; title/description always use exact source references. Preserve column-major item order. If writing both an agenda and detailed content, repeated section headings are supported, but do not duplicate source body paragraphs as untracked summaries. Any newly written agenda summaries need authorization and explicit source planning outside this exact-body workflow. Agenda accepts 1–8 items with measured one-line item title/description budgets.

## Family source mappings

Read only the relevant family sections of TEMPLATE_CONTRACTS.md and the live catalog. Preserve all present optional text: optional in a recipe does not mean supplied source may be dropped. Field names below are source-plan structures; every text leaf is a literal ref/range and every image binds a real figure block.

- Content: paragraphs and optional points; paragraph-only recipes cannot consume source list items by omission.
- Cards: cards:[{title?,description?}] (at least one supplied text field per card) with exactly the selected2/3/4 count. Stable card IDs, cardNumbers and consented cardTypography are slide settings, outside fields.
- Gallery: images:[{image:{asset},imageAlt:{ref},fit?}], exactly1/2/3 figures in source order. No body title/caption; do not hide text in metadata. Without images select another compatible designed family.
- Metrics: metrics:[{value,label,description?}], exact selected count; no invented values. Quotes: quote, author/authorRole when supplied, with source portrait only when available. Read contracts for exact nested fields and appearance.
- Comparison: columns:[{title,items:[{title,description?}]}], exactly two independent groups. Process: steps:[{title,description?}],2–4 ordered stages. Roadmap: milestones:[{period?,year?,title,points?}],2–4 milestones with actual supplied time horizons. Preserve membership, order and literal timing.
- Table/criteria matrix: fields.table:{ref:"b0003"} binds a complete source table. Preserve every cell, blank, alignment and order. Matrix compares actual shared criteria across2–4 options; independent groups belong in Comparison. Do not fill gaps, calculate or fabricate a winner.
- Figure: title, optional description/caption and the original image/imageAlt. overrides.title.align can select center/left or explicitly requested right without a separate right-hand catalogue recipe. Keep the whole visual and final-scale readability.
- Summary: title, optional description/takeawayLabel/takeawayDescription, required takeaway, actions:[{title,description?}],1–4 actions, plus a required real image for photo recipes. Source order is introduction, takeaway fields, actions, image. No fabricated conclusion, owner or deadline.
- Background on any family: fields.background:{image:{asset:"b0005"},imageAlt:{ref:"b0005"}}. It is independent of foreground media; do not inherit catalogue backgrounds or remove essential figures. See BACKGROUND_IMAGES.md for source versus supplementary tracked edits.

For each planned slide, palette, chrome, supported overrides, cardNumbers/cardTypography and stable card IDs are settings beside candidates, not invented source body fields. Cover titles default uppercase visually; original-case overrides preserve the original string. Prefer cover-separated for beside-text photos; cover-default and cover-background intentionally overlap without gradients. Read PALETTES.md and the relevant contracts for all geometry.

For raw notes first use NARRATIVE.md, and for one authorized webpage WEBPAGE.md. Do not re-snapshot derived text to erase original/narrative provenance. Shared-criteria tables and essential figures survive exactly once. An optional overview needs its own grounded labels and stable target IDs; AGENT_GUIDE.md defines count/authorization rules.

After checked generation use DELIVERY.md, including the first-deck viewing cue, actual HTML/PDF links and optional package-project.mjs archive. The standalone viewer excludes unused imported images; the portable project retains assets needed by generation/edit replay. Existing project history is never cleaned as part of delivery.
