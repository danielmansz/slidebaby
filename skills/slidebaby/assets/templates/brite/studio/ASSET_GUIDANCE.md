# Useful asset suggestions

D39, 4 November 2026. Apply this guidance when creating or revising a Brite presentation. Suggestions concern logos, relevant photos, product screenshots and observed image-quality problems. They support the existing source, template, editing and PDF workflows; they do not change consent or fit requirements.

## Inspect before suggesting

Read the user's brief, conversation, supplied assets and existing project notes. If ASSET_NOTES.md exists in the actual presentation project, read it before offering assets. Inspect only supplied files and the authorized project scope; do not scan unrelated folders or fetch stock images without a recorded user choice/request. Use the live catalog to establish what the library can actually do. Preview images are examples, never the user's assets.

Do not ask for a file already supplied and usable. If one is present but its purpose is ambiguous, clarify only the ambiguity that matters. Do not assume a supplied photo is a decorative background or that every image should be used everywhere. Respect an explicit text-only/no-branding/no-photo preference.

## Offer briefly, then continue

At the start, mention at most two genuinely useful optional inputs in one short update. It can contain both a logo offer and a relevant photos/screenshots offer; omit either when unnecessary. Continue creating the deck with valid no-image templates, a supplied company name as text branding, or no branding if the name is unknown/branding is unwanted. Do not wait for an optional asset response and do not open a blocking questionnaire.

After the first checked draft, lead with the result and any genuine unresolved requirements. Offer up to three high-value improvements tied to actual slides, with a reason, the useful input and a supported next action. Zero is valid. Do not repeat an unanswered start offer in the delivery message merely because the draft is finished. During later edits, suggest only what is relevant to that change; skip asset tips on unrelated typography/copy fixes. Do not append an improvement checklist to every response.

A suggestion is optional. Silence does not authorize adding slides, rewriting text, reducing type, image editing, external search or any other change. A missing essential source visual/requested figure remains an unresolved requirement; optional-photo fallbacks cannot justify deleting supplied content or bypassing fit/export checks. Explain required input separately and continue independent work where possible.

## Photo source: one choice, then remember it — D82

For a real presentation with usable content/brief, when relevant decorative photos would help and their source preference is unknown, ask once in the conversation language:

PL: **„Co ze zdjęciami? Dodasz własne później, mam wyszukać i dodać pasujące zdjęcia z Unsplash lub Pexels, czy zostawiamy prezentację bez zdjęć?”**

EN: **“What would you like to do about photos: add your own later, have me find and add relevant photos from Unsplash or Pexels, or keep the presentation photo-free?”**

Use the host's nonblocking question UI when available, otherwise a short text question while continuing independent work. This counts as one of the at-most-two initial asset offers, not an additional questionnaire. Do not ask before the user supplies their content/goal or during the fixed optional Atlas sample. Skip it when adequate photos are supplied, a preference is already known, photos are irrelevant, or the user requests text-only/no photos. With partial assets, discuss only an actual uncovered need. Do not ask again at delivery merely because the first question is unanswered.

Record project-local `Photos / deck: source=own-later|stock|none|mixed; status=unanswered|deferred|authorized|declined|used;` plus the actual user wording/context in ASSET_NOTES.md. Record only observed answers: unanswered is not stock consent. Existing equivalent notes count; do not demand migration to a rigid note format. Carry notes into new outputs and read them in later sessions. A later explicit request or new supplied images can revise the choice.

- **Own later:** create compatible no-photo slides now. Add supplied images later using verified edits; do not reserve blank image slots or remind the user every turn.
- **Find and add stock:** the explicit answer authorizes relevant Unsplash/Pexels search, download and insertion for this deck, without another approval for each ordinary candidate. It does not authorize paid content, accounts, API keys, plugin installs, unrelated sites or factual changes.
- **Photo-free / no answer:** produce the valid no-photo draft. A missing optional response never blocks HTML/PDF. Silence does not authorize search; keep unanswered separate from an explicit no.

### When stock is authorized

Choose a small coherent set for slides that benefit, rather than decorating every slide. Match the specific subject, tone, orientation, negative space and final crop/contrast. Use generic non-sensitive search terms, not private source text. Search through existing permitted host tools; no stock-provider API integration or key is bundled with Brite.

Open the actual photo detail page, confirm the free item/provider and applicable license, and use an observed permitted download URL. Do not guess image URLs, use random-image endpoints, hotlink thumbnails, select paid/sponsored/Unsplash+ results or bypass blocked access. No login/purchase is part of this workflow. After a blocked download and at most one alternative candidate/provider attempt for that slot, keep the no-photo version and explain briefly. If the host cannot browse/download, state that limitation and continue with the base deck.

Inspect the actual downloaded file. Stock is thematic illustration: never present pictured people as the user's team/customer/quote author, or stock objects/screens as their product, premises, results, screenshot, chart or evidence. Do not replace essential supplied figures or create a Gallery/Quote portrait merely to use stock. Prefer existing compatible decorative-photo pairs and preserve all body text, slide IDs/order and user settings; do not add slides or shrink fonts to accommodate a photo without the relevant authorization.

Save the chosen source page URL, provider, photographer/profile when available, license URL/check date, target slide IDs, selection reason and original/derivative paths+hashes in project-local ASSET_SOURCES.md. Label it as a decorative stock illustration. These are agent-maintained source notes; existing ingestion/replay records separately verify the actual files. Preserve downloaded originals in a task source folder outside the lightweight deck, and use normal proportional WebP ingestion (height<=1080px, no upscaling). Never add newly downloaded stock to the reusable template library by default. A source note is not blanket rights clearance for other images.

Use the existing guarded workflow: first build a valid source-preserving base, then apply authorized local stock files to compatible slides with edit-deck.mjs (one batch when possible) or edit-slide.mjs in the same current project. This works for exact-copy, narrative and homepage-based decks without pretending the stock came from their original source. Do not insert external stock into a homepage's captured selectedAssets or weaken its same-page hash guard. Homepage-only factual scope remains unchanged; stock search is the separately authorized enrichment. Preserve original source, current ASSET_NOTES and ASSET_SOURCES in the successful revision. When the answer arrives before final delivery, finish the checked photo revision and deliver that version; otherwise deliver the base and use a later request/answer for the next checked update.

Review the resulting HTML/PDF, crop, subject and readability. Report briefly which slides use stock and link the saved source notes; do not claim real-world evidence or a successful download when access failed.

Provider references (checked6 November2026): [Unsplash License](https://unsplash.com/license), [Pexels License](https://www.pexels.com/license/). Check the selected item and current download route; API use can have additional conditions and is not implemented by this update.

## Choose a useful suggestion

| Actual trigger | What to offer | Fallback and supported action |
| --- | --- | --- |
| No usable logo and branding is relevant, not declined | SVG or PNG logo, ideally with transparent background, for consistent shared branding. | Use the known company name as the text brand; otherwise omit it. A transparent background is preferred, not mandatory. Shared chrome can apply the supplied logo consistently. Preserve proportions; do not redraw/recolor/remove backgrounds automatically. |
| A project/topic would benefit from decorative imagery, with no known photo preference | Ask the one photo-source choice above; actual product/team/place evidence still needs the user's real material. | Use a valid no-photo layout meanwhile. Use supplied images or explicitly authorized thematic stock with a compatible verified photo partner. Do not substitute stock for real evidence or use unrelated sample photos. |
| A product feature is hard to understand from text alone | A real screenshot of the particular feature, naming the affected slide and what it explains. | Keep the text-based draft. Use an existing contain-figure composition when the screenshot arrives, preserving the explanation through an explicit source/plan revision. Do not crop away UI text or treat an essential screenshot as a decorative background. Respect exact slide count. |
| Actual review reveals blur, illegible screenshot labels, an unhelpful crop or insufficient logo contrast | Identify the slide and specific issue; ask for the higher-quality original, a closer screenshot or an existing contrasting logo export. Prefer an already available usable variant first. | Use supported contain fitting/another compatible treatment when it solves the issue without losing content. Optional improvement does not hold up an otherwise valid draft. If an essential visual is unusable, report that requirement honestly. Do not claim missing resolution from file size alone or promise automatic enhancement. |

Assess quality at the intended slide/PDF size: inspect the actual asset, its dimensions and placement, important subject/labels, contrast and final rendering. Do not manufacture a defect to justify a suggestion or demand a universal pixel count. If quality cannot be verified, state that uncertainty. Draft meaningful alt text from the visual rather than asking beginners to supply technical metadata unnecessarily.

When an asset is accepted, follow SHARED_SLIDE_ELEMENTS.md for branding, EDITING_WORKFLOW.md for compatible decorative-photo revisions, and SOURCE_TO_DECK.md for new or essential source figures. Keep text/settings and previous outputs, copy supplied assets locally without overwriting originals, then check fit and PDF. Do not promise an unimplemented composition/theme.

## Avoid repetition across turns

Use the current conversation and the project's existing brief/notes first. For a project where you offer a suggestion or receive an explicit relevant preference, save a short entry in ASSET_NOTES.md in the actual output project so the next session can avoid repeating it. If output does not yet exist, retain this context in the conversation/task scratch and carry it into the successful output. If there are no offers or relevant preferences to retain, do not create an empty note. This is an optional agent note, not slide content, a generation requirement or a new validation manifest. Never add user-specific notes to the bundled empty studio.

Record the category/context (slide ID when relevant), what was offered or supplied, status, and any explicit user preference/reason. Keep offered/unanswered separate from declined, deferred, provided and used. A compact example:

```markdown
# Asset notes
- Logo / deck: offered SVG/PNG; unanswered. Text brand uses the supplied name Atlas.
- Screenshot / slide feature-plans: supplied product-plans.png; used as a contain figure.
- Photos / deck: declined by user: "Text only for this presentation."
```

Do not fabricate these entries from this example. Update notes only from observed conversation/project facts. Preserve earlier notes and source material when revising them; keep a recoverable copy before significant changes. Read the current project notes before later edits. In-place edits and source rebuilds preserve those notes. When explicitly creating a separate project, carry relevant preferences and offer history into that new successful output using a non-overwriting write or an explicit notes revision. Do not modify generation/source/plan/coverage files to track suggestions. If generation fails, retain the note in task scratch and consult it on retry.

Do not repeat an unchanged offered/unanswered, deferred or declined suggestion. Revisit only when the user asks, supplies new relevant material, or a material new circumstance makes a different recommendation useful; state what changed. Unknown means not yet discussed. An unanswered offer is not a refusal or a permanent preference. A declined logo/photo offer does not suppress a distinct essential-visual requirement, which must be explained as such. Suggestions are scoped to the current project, without global memory or a database.

## Example wording (adapt to context)

Use the conversation language for agent messages; UI/prompt language never translates slide content.

PL start: "Przygotuję prezentację z Twojego tekstu. Jeśli masz logo, możesz dołączyć SVG lub PNG — bez niego użyję podanej nazwy firmy. Zdjęcia produktu lub zrzuty jego ekranów też mogą się przydać; dobiorę do nich pasujące układy. Możemy dodać je później."

EN start: "I’ll build the presentation from your text. If you have a logo, you can attach an SVG or PNG; otherwise I’ll use the company name you supplied. Product photos or screenshots may help too, and I can choose suitable layouts for them. We can add these later."

PL after a draft: "Na slajdzie 4 opisujesz planowanie wydatków. Zrzut tego ekranu pomoże pokazać działanie funkcji. Jeśli go dołączysz, przygotuję wariant z pełnym widokiem, zachowując opis."

EN after a draft: "Slide 4 explains spending plans. A screenshot of that screen would help show how the feature works. If you attach it, I can prepare a version showing the complete screen while preserving the explanation."

PL quality: "Na slajdzie 6 etykiety na zrzucie są słabo czytelne w docelowym rozmiarze. Większy eksport albo osobny zrzut tego fragmentu pomoże je wyraźniej pokazać."

EN quality: "The screenshot labels on slide 6 are hard to read at the final size. A larger export or a separate screenshot of that area would make them clearer."

These are examples, not mandatory text. Skip generic photo advice on abstract topics. Broader narrative, evidence, navigation, palette and next-step recommendations are outside this first asset-guidance release.


## Bundled photographs — D50, 5 November 2026

For new/downloaded photographs included in the reusable package, keep original source files outside the distributable and use optimized WebP derivatives. Apply orientation before sizing; preserve aspect ratio, never upscale, and cap image height at1080px. Initial photo encoding is WebP quality85; inspect the actual slide/PDF before accepting the result. Preserve meaningful alpha, placement, cropping and existing fit rules. Do not rasterize SVG logos/icons or apply lossy photo presets to screenshots/diagrams with essential small text; validate those separately.

Update all catalog/sample references and verify image decoding, template fit and PDF export. Check actual ZIP contents so large originals, review renders and duplicate historical releases do not leak into the package. Store a small original/derivative size and dimensions manifest; do not bundle full-resolution originals as backups. Older source files/releases stay recoverable outside the new version.

This package policy does not rewrite existing generated presentations or content-hashed user assets. Such a change requires a separate source-preserving derived revision; never replace a guarded source image in place or silently bypass source hashes. WebP is the still-image format; WebM is a video container. Compression uses available local tools and must not install new dependencies without permission.


## D53 — Every new bundled raster asset

Whenever a user-uploaded or Figma-downloaded raster image is added to the reusable package, automatically create a WebP derivative BEFORE bundling. This includes UI illustrations and screenshots as well as photos. Preserve original files outside the distributable. Apply orientation, preserve aspect ratio and alpha, never upscale, and cap height at1080px. Use lossless WebP encoding for text-heavy graphics/screenshots and illustrations; photo quality85 is the initial preset. Inspect final-scale readability after resizing. Do not convert unrelated documents/fonts or rasterize existing SVG logos/icons.

Use tools/optimize-image.py from the skill root with an already available Pillow/WebP runtime: `python tools/optimize-image.py --input ORIGINAL --output NEW.webp [--lossless]`. It refuses overwriting or animated sources. Do not install dependencies implicitly; use another existing equivalent converter or report the missing tool. Update runtime references, keep originals/review renders out of ZIPs, and verify decoded images and visual fit. Existing content-hashed user deck assets still need tracked derived revisions rather than in-place replacement. This expands D50 beyond photographs; it does not authorize rewriting source hashes.


## D54 — Automatic user-image ingestion

New PNG/JPEG/WebP supplied to a presentation are automatically ingested by build-deck.mjs (figures, photo variants, gallery and image branding), compose.mjs and edit-slide.mjs. They use scripts/ingest-image.mjs and the existing Playwright/Chromium runtime: no Pillow or new installation is needed for this path. Append commands with raster images require --playwright-module and --browser-executable, matching export. The standalone ingest-image CLI accepts --input, --project and those runtime flags.

Create content-hashed WebP copies under assets/user. Apply browser-decoded orientation, preserve aspect ratio and transparency, never upscale and cap height at1080px. JPEG encoding quality is0.85; PNG and resized-WebP conversion try at most qualities0.98,0.95,0.90, preferring the highest candidate no larger than its input, or the smallest bounded candidate if none meets that size. This avoids observed quality1 screenshot inflation; it is not a mathematical lossless or universal size-reduction guarantee. Small existing WebP is reused byte-for-byte. SVG stays vector and must remain self-contained. Animated PNG/WebP and unsupported formats need explicit handling, never silent first-frame flattening. Current resource limits are100MB input,40MP decoded image and20MB derivative. Missing runtimes cause a clear failure without installing anything or claiming completion.

Leave supplied originals untouched at their input paths. Do not copy full-size originals into the lightweight generated deck. Each record preserves original path/hash/byte size, derivative hash/path, dimensions and transform settings. Projects remain exportable without access to the old absolute source path; they contain the checked derivative, not a recoverable copy of the original binary. Source originals should be retained by their owner outside the deck. Records live in generation/coverage.json, edit asset records or history/assets-*.json for a plain append.

New import records and derivative hashes are checked at later export/replay; old exact-copy records remain readable. Do not silently migrate existing deck assets. A later photo edit creates a checked in-place update preserving existing text and recoverable prior files. Legacy bundle optimization policies and lossless treatment of bundled UI graphics remain unchanged. Inspect screenshot/diagram readability after resizing; a successful hash check is not a semantic or readability assessment.


D56: A website source triggers proactive official-logo discovery on that same page before suggesting an upload or choosing text branding. Inspect observed header/footer logo candidates and light/dark variants, retrieve and validate a usable one, record logoDecision and inherit it through chrome.brand. Read WEBPAGE.md. If retrieval/contrast fails, preserve a known text brand and briefly explain the exact fallback; do not misreport an unusable logo as absent.


## Concrete free-photo suggestions — D100 / v4.28

The capability already exists under D82; make it discoverable with a short, contextual request example instead of only asking for uploads. Match the current source preference and actual slide need. Do not repeat an unanswered/declined offer or delay the base deck. A persistent optional copy button is guidance, not a request automatically sent to an agent.

Choose the requested scope accurately:

- **Find candidates only.** PL: “Znajdź 3 darmowe zdjęcia z Unsplash lub Pexels do slajdu 3 o oszczędzaniu na podróż. Pokaż linki i krótko uzasadnij wybór; jeszcze ich nie wstawiaj.” EN: “Find 3 free Unsplash or Pexels photos for slide 3 about saving for travel. Show links and a short reason for each; do not insert them yet.” This authorizes relevant search, not editing the deck or downloading/inserting all candidates.
- **Find and add.** PL: “Znajdź i dodaj darmowe zdjęcie do slajdu 3 o oszczędzaniu na podróż. Wybierz Unsplash lub Pexels i kadr pasujący do układu. Zachowaj tekst, pozostałe slajdy i rozmiary fontów.” EN: “Find and add a free photo to slide 3 about saving for travel. Choose Unsplash or Pexels and a crop that fits the layout. Keep the text, other slides and font sizes.” This explicitly permits normal source-checked download/ingestion and a tracked photo edit; no redundant approval is needed.
- **Coherent set.** PL: “Dobierz i dodaj darmowe zdjęcia do slajdów 1, 4 i 6 o podróżach pociągiem. Zachowaj spójny styl fotografii, tekst i kolejność slajdów.” EN: “Choose and add free photos to slides 1, 4 and 6 about train travel. Keep a coherent photographic style, the text and slide order.” Do not add decorative photos to every slide merely because a set was requested.

After a draft, make one relevant suggestion when welcome, for example: “Na okładce o podróżach pasuje zdjęcie trasy lub krajobrazu. Możesz dodać własne albo napisać: ‘Znajdź i dodaj darmowe zdjęcie podróży pociągiem z Unsplash lub Pexels, zachowując tekst’. Dobiorę kadr do wybranego układu.” / “A route or landscape photo could suit your travel cover. Upload your own, or say: ‘Find and add a free train-travel photo from Unsplash or Pexels while keeping my text.’ I’ll choose a crop that fits the layout.” Tailor the topic to observed content; skip generic examples on unrelated subjects.

When the request is ambiguous about source or insertion, infer only what is authorized; show candidates or clarify the meaningful gap. Existing “stock/find-and-add” preferences authorize scoped later requests without asking the same source question again. Existing “none/own later” preferences suppress unsolicited chat offers until changed.

Use observed permitted host tools and actual free photo pages, including a license check; exclude paid/sponsored/Unsplash+ results. Search with generic visual terms, not private source text. Keep attribution/source/license/date notes and proportionally optimized WebP<=1080px derivatives. Preserve originals and checked source/edit records. Photos should add relevant visual context and leave text readable; assess crop and foreground/background contrast without introducing an unrequested overlay.

Never substitute stock for a real team, testimonial author, product screenshot, chart or source evidence. UI search prompts are therefore offered only for decorative photo pairs, not Figure, Gallery or speaker-portrait requirements. If a provider/tool is unavailable, keep the current slide, give the user a concrete search phrase/provider link or ask for a usable supplied file; do not claim a download or loop on blocked endpoints. Do not add a provider API, key, account requirement or new image generator.
