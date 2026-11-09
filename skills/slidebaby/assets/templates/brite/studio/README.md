# Slidebaby presentation project — Brite template

Created and designed by [Daniel Mansz](https://www.linkedin.com/in/daniel-mansz/).

Open presentation.html for the self-contained viewer, or use index.html with the adjacent project files. **My presentation** contains the actual saved deck; **Templates** contains examples with descriptions, preview and copyable prompts. The installed starter is empty. A generated project holds your material separately from those examples.

Request edits in your agent conversation, for example: “Keep the wording and add my photo to slide2”, or “Make slide3 Dark”. Search Templates by name or what you want to show (for example comparison, results or next steps), then copy a prompt or name the variant. English/Polish terms and unaccented spelling work in either interface language. Clear the search to return to the full library. The agent checks whether its structure fits your content. The browser itself does not edit the deck.

## Viewing and files

- presentation.html embeds fonts, needed images, the offline catalogue and the matching prepared PDF. Unused imported images are excluded from this derived viewer.
- exports/presentation.pdf is the current checked PDF. Download PDF in the viewer retrieves that same result.
- The full project retains generation/edit records and assets for later work. presentation.js is its saved deck; presentation.html is generated output.
- Local Live preview can reload the same browser tab after checked saves. Without it refresh the locally updated HTML. Downloaded cloud files are snapshots and need a new download after cloud edits. See [LIVE_PREVIEW.md](LIVE_PREVIEW.md).
- A project ZIP is optional backup/transfer. Continue editing here without downloading/unpacking it while your agent has the project. For a chosen local move, unpack the project and ask a local agent to start its preview.

## Create, revise and package

Agents start with [AGENT_GUIDE.md](AGENT_GUIDE.md), then [SOURCE_TO_DECK.md](SOURCE_TO_DECK.md) for creation, [NARRATIVE.md](NARRATIVE.md) for authorized synthesis or [EDITING_WORKFLOW.md](EDITING_WORKFLOW.md) for later edits. [DELIVERY.md](DELIVERY.md) gives commands and truthful local/cloud handoffs. The first generated deck gets a new project; ordinary corrections update the same stable HTML/PDF. Original inputs and recovery copies are preserved.

To create an optional current-project archive using existing Node:

```sh
node scripts/package-project.mjs --project /absolute/project --output /absolute/NEW-project.zip
```

The ZIP retains source/generation/edit records and local assets, including assets needed to replay earlier edits. It omits .brite recovery/work/live state, old derived exports and unrecognized files; PROJECT_ARCHIVE.json lists included hashes and excluded paths. It never cleans the source project. This archive is for editable backup/transfer; a standalone HTML/PDF is for viewing/sharing.

PDF generation needs existing Node20+, Playwright, a compatible Chrome/Edge/Chromium and pdf-lib. Tools are checked before generation and are not installed automatically. Viewing the standalone HTML needs none of them; serving a completed project locally needs Node only. Safari/Firefox can view HTML but do not provide this Chromium PDF renderer.

## Layouts and appearance

Read the live scripts/catalog.mjs metadata for current recipes, names and contracts. Fourteen families cover Cover, Agenda, Content, Feature cards, Section opener, Figure & caption, Gallery, Key metrics, Quotes & testimonials, Comparison, Process, Roadmap, Tables and Summary & next steps.

Each actual slide saves Light/Dark independently. The single right-aligned Templates switch changes examples/prompts only; no per-template switches are planned. Interface EN/PL does not translate content. Read [PALETTES.md](PALETTES.md), [BACKGROUND_IMAGES.md](BACKGROUND_IMAGES.md), [TEMPLATE_CONTRACTS.md](TEMPLATE_CONTRACTS.md) and [SHARED_SLIDE_ELEMENTS.md](SHARED_SLIDE_ELEMENTS.md) for specific settings. Optional brand/footer slots are user-controlled, not copied from previews.

Cards grow within available safe space. Text is never silently shortened, clipped or reduced; smaller card body type needs explicit permission and changes the whole row consistently. Compatible layout/image changes preserve content; Content↔Cards, Cards↔Process and Cover↔Section opener have guarded projections. Overflow can produce a concrete measured proposal with actual text/count for your approval. See [REFLOW.md](REFLOW.md). Arbitrary component mixing, native charts, custom fonts/themes and original-layout PPTX/PDF import remain separate scope.

Local changelog notes describe this copy, not an online update feed. Slidebaby is the product; Brite is the current template and slidebaby is the public skill ID; Brite remains a separate visual-template bundle. This copy is version1.0.0; product release notes are local to the copy.

## License

[Slidebaby Community License 1.0](LICENSE) permits free presentation creation and paid client work, including delivery of PDF, HTML and editable projects. Selling the skill or its modified versions is prohibited. Free sharing/forks retain notices. Read [LICENSING.md](LICENSING.md) for English/Polish summaries and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for independent font/image terms. Standalone HTML embeds these legal texts and original font licenses as inert data; slides/PDF need no visible author credit.
