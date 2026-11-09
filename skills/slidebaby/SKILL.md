---
name: slidebaby
description: Create and revise designed HTML/PDF presentations from text, notes or one webpage using registered Slidebaby templates, preserved wording and checked fit. No original-layout PPTX/PDF import.
license: "LicenseRef-Slidebaby-Community-1.0; see LICENSE and THIRD_PARTY_NOTICES.md."
metadata:
  version: "1.0.0"
  author: Daniel Mansz
  author-url: https://www.linkedin.com/in/daniel-mansz/
---

# Slidebaby

Created and designed by [Daniel Mansz](https://www.linkedin.com/in/daniel-mansz/). Slidebaby (slidebaby.com) is the product; Brite is the current template. Version 1.0.0, renderer 24, 69 recipes / fourteen families. The main skill is `slidebaby`; visual templates are registered in assets/templates.json. Keep all installed starters empty.

The host agent organizes material and chooses designed layouts; bundled scripts check source correspondence, fit, edits and export. No model API is called by the helpers. The browser is a viewer and template library; users request edits in this conversation. Templates can be searched by name, legacy alias or common use case in English or Polish, with diacritics optional. Search filters discovery only; it never adds or changes slides.

The [Slidebaby Community License](LICENSE) permits free presentation creation and paid client work, including delivery of PDF, HTML and editable projects. It prohibits selling or licensing the skill/modified versions for a fee. Free forks/sharing retain notices; fonts and images keep their own terms. [LICENSING.md](LICENSING.md) gives EN/PL summaries. This is source-available, not OSI open source. Do not request a license payment or routine legal approval to create a presentation.

## Select the visual template

Use this skill’s `node scripts/slidebaby.mjs templates` and `resolve [--design ID] [--project PROJECT]` to inspect registered templates and the selected runtime. Brite is the current default; do not require a choice when none was requested. Saved projects keep their own template. `--design` means the visual template; `--template` means a layout recipe within it. New plans/decks record `visualTemplate:{id,version}` separately from slide recipe IDs and palettes. Unknown templates/versions reject; do not silently substitute a design or promise automatic conversion between designs.

The references below describe the included Brite adapter. Follow the selected runtime’s AGENT_GUIDE and actual catalogue/capabilities for another registered adapter, rather than assuming Brite’s layouts. The product entry point forwards registered commands and existing flags; projects remain self-contained with their own helpers.

## Route the request

- Bare invocation/help or explicit sample: [first-run.md](references/first-run.md). Show three numbered choices: empty template browsing, optional three-slide photo sample, or personal material. Installation itself does not open a chat. Never substitute the sample for missing personal content.
- Rough notes or project text to organize: [NARRATIVE.md](assets/templates/brite/studio/NARRATIVE.md), then the [source workflow](assets/templates/brite/studio/SOURCE_TO_DECK.md). Record original-to-derived provenance, factual limitations and material omissions. Finished copy/exact wording uses source preservation without rewriting.
- One supplied webpage: also [WEBPAGE.md](assets/templates/brite/studio/WEBPAGE.md). Capture only the authorized page, try an observed official logo and preserve source/asset evidence. Do not crawl linked pages.
- Existing non-Brite deck: use only content the host can actually read, preserve the attachment and save an inspectable text snapshot. No native PPTX/PDF parser or original-layout importer is bundled. Ask for missing text/essential figures if extraction is incomplete.
- Saved Brite project/change request: [EDITING_WORKFLOW.md](assets/templates/brite/studio/EDITING_WORKFLOW.md). Use stable IDs and explicit source inputs, updating the same project by default.

Infer audience, purpose, language, intended length and live versus independent reading from the brief. Ask only about material ambiguity or missing required content. Supplied usable material skips the welcome; no mandatory template selection or routine outline approval. Preserve content language unless translation is requested. EN/PL UI language never translates slides.

## Execute the selected workflow

Read the selected project's [AGENT_GUIDE.md](assets/templates/brite/studio/AGENT_GUIDE.md), then only relevant references. Use `node scripts/catalog.mjs` for live IDs, EN/PL names/aliases, required fields and counts. Never choose a recipe by a remembered label or inherit preview text, dates, logos or photographs. Choose by meaning, density, counts and actual assets. Use no-photo partners without imagery; Gallery requires images. Respect complete tables, essential figures and truthful quotations. Do not invent facts, metrics, timing, actions or attributions to populate a layout.

Before the first build in this environment, run the existing-runtime check in first-run.md. PDF needs existing Node20+, Playwright, a compatible Chrome/Edge/Chromium and pdf-lib; they are not bundled. Use verified returned paths and reuse a successful current-session result. Missing tools need a concise next step, preserving the supplied material. No automatic installation, global configuration or persistent service.

The first deck gets a new project outside the installed skill; an explicitly created empty browsing project may be reused. Later corrections update its stable `presentation.html` and `exports/presentation.pdf`. Use this skill's current edit helpers to migrate older projects; omit `--output` on ordinary edits. A new output is for an explicitly requested separate copy. Checked staging/recovery preserve the last valid files; never remove generation/edit records to defeat a guard.

Keep an existing Agenda/Contents/overview synchronized with authorized section additions/removals: update its entries, order, section targets and actual page references as part of the edit. A section can span several slides; adding a slide within it does not automatically add an agenda entry. You may ask once whether to include a new section when inclusion is unclear or the agenda is deliberately selective; preserve a declined/pending choice. Follow the selected project's AGENT_GUIDE for source-preserving maintenance. Do not create an agenda merely because a section changed.

Try at most three source-preserving compatible candidates per content unit. A measured fit failure returns a concrete reviewed alternative or continuation through [REFLOW.md](assets/templates/brite/studio/REFLOW.md), preserving the last valid project. Show its actual text division/count and wait for acceptance before applying; respect a latest instruction forbidding extra slides. When no lossless choice fits, explain the specific remaining source decision. Do not clip, hide, rewrite or shrink text to force a fit. Cards grow equally within measured space; smaller body text needs explicit user permission, applies to all cards together and must be disclosed. The exact presets and edit schema live in EDITING_WORKFLOW.md.

Same-family template/photo/count edits preserve wording and intentional settings. [REFLOW.md](assets/templates/brite/studio/REFLOW.md) also supports Content↔Cards, Cards↔Process and Cover↔Section opener with compatible counts/assets. Body-only cards avoid invented headings; Process needs actual supplied step headings. Other cross-family mappings and arbitrary component mixing remain gaps. Supported text changes use tracked `setText` with exact previous values, or stable-ID `updateCards`. Unsupported restructuring needs a deliberate source/narrative/plan revision. Cover casing, local overrides and optional chrome are defined in AGENT_GUIDE.md and the live contracts.

## Read conditional guidance when needed

- [TEMPLATE_CONTRACTS.md](assets/templates/brite/studio/TEMPLATE_CONTRACTS.md): read the relevant family for schemas, geometry and selection. Designed recipes only; retired layouts remain readable for old projects.
- [PALETTES.md](assets/templates/brite/studio/PALETTES.md): save Light/Dark per slide. One shared catalogue switch changes examples/prompts only. Preserve a saved palette on unrelated edits.
- [BACKGROUND_IMAGES.md](assets/templates/brite/studio/BACKGROUND_IMAGES.md): optional independent background on every template. For a new deck with an observed background and no chosen palette, inspect it and choose a legible palette. Respect explicit/saved choices; no contrast gradients/overlays.
- [SHARED_SLIDE_ELEMENTS.md](assets/templates/brite/studio/SHARED_SLIDE_ELEMENTS.md): independently optional image/text brand, section and footer/page slots. [BRAND_PROFILE.md](assets/templates/brite/studio/BRAND_PROFILE.md): reusable supplied settings only on request.
- [ASSET_GUIDANCE.md](assets/templates/brite/studio/ASSET_GUIDANCE.md): contextual nonblocking logo/photo/screenshot/quality offers and remembered preferences. At most two initial offers and three after a checked draft; suppress supplied, declined and unchanged unanswered suggestions. Ask the own-later / authorized Unsplash-Pexels / no-photo choice once when useful. No answer means no stock search. Stock never replaces actual evidence; no provider API is bundled.

New rasters use automatic proportional WebP ingestion, height≤1080 without upscaling; SVG remains vector. Preserve originals/provenance and check final-scale readability. Optional assets do not block a valid no-photo draft. Essential source images cannot disappear as a fit fallback.

## Complete the result

Follow [DELIVERY.md](assets/templates/brite/studio/DELIVERY.md). Inspect every PDF page and the actual HTML/PDF download; coverage/fit do not prove editorial truth or visual legibility. Show/open **HTML first as the main preview inside the agent**, where supported, and put **Open presentation (HTML)** first in the response. Provide **Download PDF** separately after it, then identify the editable project. PDF inspection is internal validation, not the default user-facing preview. Honor an explicit PDF-first/PDF-only request. If the host cannot preview HTML, offer its genuine download link first and explain the actual limitation. On permitted local desktops, start/reuse bounded Live preview and request system external opening; cloud sessions get genuine downloadable files. Do not claim an unverified visible window or cloud-to-local synchronization.

After the first successful deck, give the one-time external-browser/Live preview cue and explain that edits continue here. Live observes checked saves in that same local project; without live refresh the locally updated file, and after cloud edits download the new snapshot. Subsequent corrections receive short current-link/status guidance.

Use `scripts/package-project.mjs --project PROJECT --output NEW-project.zip` when delivering a portable project archive. Label it **Project ZIP — optional backup/transfer**. It retains source/replay records and assets, excluding local recovery copies/live state without changing the authoritative project. Unpacking is not required to continue editing here. Use the helper rather than recursively zipping the whole working folder. Exported HTML includes current visual dependencies and offline catalogue artwork, excluding unused imported images; it is still a complete viewer with an embedded matching PDF.

PPTX/PDF/DOCX import, browser canvas editing, arbitrary fonts/themes, native chart calculation and unsupported writing systems are separate scope. When extending the library from Figma, use coherent contextual sample copy and truthful illustrative labels; this never authorizes rewriting user content. [PRODUCT_RELEASES.md](assets/templates/brite/studio/PRODUCT_RELEASES.md) covers identity/changelog maintenance and unresolved public distribution scope.
