# Working on this presentation

This is a Slidebaby project using the Brite template. The browser is a viewer/template library; edits happen in the agent conversation. Its actual saved presentation is separate from catalogue examples. This guide gives current execution rules; read detailed references only for the operation being performed.

New projects record `visualTemplate:{id:"brite",version:"1.0.0"}` at deck level;
`visual-template.json` identifies the saved renderer. Slide `template` still means
a layout recipe and `palette` means Light/Dark. Preserve these identities and
source/replay records. Recognized old Brite projects without the new fields remain
compatible; do not manually relabel them as another design.

## Files

- presentation.js: actual ordered deck and stable slide IDs; only these slides enter the PDF.
- catalog.js and scripts/catalog.mjs: active recipes, EN/PL names/aliases and machine-readable contracts. Resolve a named variant to its real ID before use. The Templates search supports names/aliases and common bilingual use cases; it filters browsing only and never changes the actual deck.
- engine.js / slides.css: shared rendering and measured layout. Existing projects retain their visual runtime unless an intentional compatible upgrade is requested.
- i18n.js: EN/PL interface/help/prompts. Changing UI language never changes slide content.
- exports.js: actual last successful PDF registration; never fabricate it. presentation.html is derived, not an editing source.
- samples/: explicitly illustrative catalogue/sample data; never use it as missing personal content.

## Choose the operation

For first invocation, the installed skill's first-run guide offers exactly three choices: browse the empty library, run the optional three-slide photo sample, or create from personal material. Supplied usable content skips the menu. Never run the sample silently. A copied empty browsing project needs Node only; it has no PDF/live session until real slides exist.

For a first deck read [SOURCE_TO_DECK.md](SOURCE_TO_DECK.md). Raw notes authorized for synthesis first use [NARRATIVE.md](NARRATIVE.md); exact wording stays literal. One authorized webpage also uses [WEBPAGE.md](WEBPAGE.md): capture only that page and try its observed official logo. Existing foreign presentations are content sources only when the host can read them; preserve originals and ask for missing text/figures. No native original-layout import is bundled.

For later changes read [EDITING_WORKFLOW.md](EDITING_WORKFLOW.md). Use the current skill's edit-slide/edit-deck helper against this SAME project, without --output by default. Explicit text edits carry exact before values; additions/removals/reordering are tracked inputs. Do not append a replacement slide, rebuild from sample content or delete generation records. For Content↔Cards, Cards↔Process, Cover↔Section opener and concrete overflow choices read [REFLOW.md](REFLOW.md). Other cross-family/component remapping remains unsupported. A fit-conflict result is pending, not published: show the measured proposal and obtain acceptance before applying an unrequested split.

## Preserve content and design

Select by semantics, count, density and available assets using the live catalogue and relevant [TEMPLATE_CONTRACTS.md](TEMPLATE_CONTRACTS.md) family section. Do not invent facts, metrics, actions, timing, quotations or branding. Preserve complete table cells/blanks/order, original figures and truthful attribution. Exact counts/boundaries constrain fitting. Unsupported source structures need an explanation rather than omission. Retired text-default and figure-right remain readable for old projects, not new automatic selection.

Optional descriptions close their own spacing. Shared brand, section, left footer, page numbers and right footer are independently optional under [SHARED_SLIDE_ELEMENTS.md](SHARED_SLIDE_ELEMENTS.md); preserve explicit local overrides. Cover titles display uppercase without changing source strings; an explicit original-case request uses overrides.title.textTransform:"none". Title arrays encode explicit lines; check the rendered count after fonts load.

Cards grow equally within measured safe bounds. No universal four/five-line body cutoff and no silent font shrinking. Only the USER's recorded permission enables the shared bounded card body preset (30→28 or28→26) after normal/compact spacing. Keep all card bodies consistent and disclose a used reduction. Read EDITING_WORKFLOW.md for exact consent/profile rules. Other families have no new automatic shrinking.

Read [PALETTES.md](PALETTES.md) for per-slide Light/Dark. One right-aligned catalogue switch changes previews/prompts only; it never recolors the saved deck. Mixed actual palettes are supported. Dark Filled cards use #161616. Preserve user imagery colors.

Prefer cover-separated for clear text beside a photo. It fits the photo after the full text column with26px separation and whole-slide vertical centering. An explicitly chosen cover-default or cover-background intentionally extends its wide photo behind text; check legibility and respect the selection. No gradients, washes or image-darkening fallback. All other Cover photo treatments retain separation. Background images are independent optional layers on every template under [BACKGROUND_IMAGES.md](BACKGROUND_IMAGES.md). For a new deck with an observed background and no chosen palette, inspect it and select a legible palette; preserve explicit/saved choices.

## Assets and optional improvements

Read [ASSET_GUIDANCE.md](ASSET_GUIDANCE.md) and existing ASSET_NOTES.md for relevant creation/visual edits. Logos, photos, screenshots and quality suggestions are nonblocking and contextual. At most two useful initial offers and three after a checked draft; suppress supplied, declined and unchanged unanswered offers. Ask once about own-later / authorized stock / no-photo only when useful and unknown; continue a no-photo draft while unanswered. Stock search depends on host tools and actual free source/license evidence; it never stands in for real product/team/evidence. Preserve preferences/notes only in the project, not the starter.

New supplied raster images are automatically ingested as proportional WebP, height≤1080 without upscaling; SVG remains vector. Preserve original files, derivative hashes and source provenance. Check screenshot readability and crop. Essential source visuals remain covered even when a no-photo alternative exists. [BRAND_PROFILE.md](BRAND_PROFILE.md) supports optional reusable supplied settings; it is not an arbitrary font/theme engine.

When building library views from Figma, write coherent contextual example copy, comparable across variants; label illustrative metrics/quotes honestly. This never permits rewriting actual user content. Preview footer dates merely demonstrate the optional slot; do not inherit them into a real deck.

## Optional overview

Consider a context-named overview when several substantive sections benefit from navigation. Suggest once without blocking; respect a declined/unanswered offer, fixed slide count and existing deck. Include it directly when requested. Names may be Contents, Today’s plan, What we’ll cover, Spis treści or a meaningful product-specific title. Map labels/descriptions to their own authorized source/derived blocks; do not duplicate body paragraphs or invent topics. Use stable agenda target IDs and resolve actual page numbers after insertion/reordering. Keep supplied essential content and verify the final references/PDF.

### Keep existing overviews current

After an authorized section addition/removal, maintain any existing Agenda, Contents or equivalent overview as part of that same change. Determine sections from the actual content and user's intent; one section may span several slides. A new slide, card or header label alone is not necessarily a new section.

- For a clear new section, add an entry using its authorized title and existing content language, in presentation order. Respect an explicitly selective agenda. When inclusion is unclear, you may ask once, for example “Should I add ‘Results’ to the contents?” / “Dodać sekcję «Wyniki» do spisu treści?”. An unanswered question is not approval; continue independent work and leave that addition pending without repeating the question.
- Remove the corresponding entry when the section is removed. If only its first slide disappears and the section continues, retain the entry and point it to the remaining section start. Preserve unrelated entry wording and the rest of the agenda.
- Recheck entry order and page references against the final deck after additions, removals or reordering. Prefer stable `target` slide IDs over hardcoded page numbers. Keep references valid in both the saved HTML and regenerated PDF.
- Use supported tracked edits. Changes to the agenda item list or its target mappings that the edit schema cannot express require a deliberate source/plan revision and the guarded rebuild in SOURCE_TO_DECK.md. Preserve archived originals and wording outside the authorized changes; do not patch presentation.js or erase generation/edit records to bypass validation.

Check the selected agenda's item-count and fit contract. If synchronization would require an extra agenda slide, an empty invalid agenda or deleting the whole overview, present the concrete choice and respect slide-count constraints. If no overview exists, keep the optional suggestion rule above; section editing does not itself require creating one.

## Validate, save and deliver

Use the first-run existing-runtime check before the first build. PDF requires Node20+, existing Playwright, a compatible Chrome/Edge/Chromium and pdf-lib. Use its verified paths; do not install dependencies or change global configuration automatically. Browser viewing and PDF rendering are independent.

The guarded build/edit/export checks source mapping/replay, measured layout and one1920×1080 slide per PDF page. Inspect every final PDF page and verify actual slide order, text, figures and Download PDF. Geometry/coverage do not prove contrast, narrative truth or image readability. After structural/text changes re-export. Arbitrary manual CSS/media edits also need re-export; changing visual rendering needs a layoutVersion change and appropriate QA.

The first deck uses a new folder; later edits publish the same presentation.html and exports/presentation.pdf only after successful checks. Staging, locks and .brite/history protect the last valid output. Preserve generation/ and edits/; never bypass their guards. No new numbered HTML/project for ordinary corrections. Browser Brite methods only mutate memory for checks; persist intended changes through the helpers.

Follow [DELIVERY.md](DELIVERY.md): show/open HTML first as the main preview inside the agent where supported, link the genuine HTML first and provide PDF separately as a download. Internal PDF quality inspection does not set the delivery order. Respect an explicit PDF-first/PDF-only request; if HTML preview is unavailable, offer its download first and explain the host limitation. Include the editable project location. On a permitted local desktop start/reuse the bounded session under [LIVE_PREVIEW.md](LIVE_PREVIEW.md), then request external system-browser opening. Respect explicit viewing preferences and host restrictions. The first successful deck receives one concise viewing/live/editing cue. Live observes checked saves in that same local project; offline local files require refresh and cloud downloads require a new download after changes. Do not claim unverified window visibility, automatic cloud sync or that ZIP extraction is required to continue editing here.

For an optional portable backup/transfer run scripts/package-project.mjs --project PROJECT --output NEW-project.zip. It keeps current source, generation/replay records, assets and checked outputs, while excluding local recovery snapshots/session state. All authoritative originals/history remain untouched. Standalone HTML contains current slide/UI/offline-catalogue artwork, excluding unused imported images. The original SVG workspace logo is independent of user slide branding and never enters PDF. [PRODUCT_RELEASES.md](PRODUCT_RELEASES.md) covers product identity and local release notes.

## License and delivery notices

The Slidebaby Community License in LICENSE allows free creation and paid client presentation work, including actual PDF/HTML/editable-project handoff. It prohibits resale of the reusable skill or modified versions. Free forks/sharing retain notices; third-party materials keep separate licenses. Do not impose payment or routine approval on normal deck creation. Current build/edit/export/package helpers carry LICENSE, LICENSING.md, THIRD_PARTY_NOTICES.md and font notices; standalone HTML stores them as inert JSON. Preserve these notices without adding visible slide/PDF branding. A differing existing license file is a conflict to reconcile explicitly, never silently overwrite it.
