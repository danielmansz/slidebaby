# Safe layout changes and measured overflow proposals

Read this when changing a saved slide to another family or resolving a real fit conflict. User wording, slide identity, assets and intentional settings remain authoritative. The normal agent conversation is the editor; this is not an in-browser slide editor.

## Supported projections

Use the ordinary tracked `edit.template` operation with a current catalogue ID. No manual source-record removal or direct `presentation.js` rewrite.

1. Content with two to four points ↔ Feature cards of the same count. Keep introduction paragraphs and points verbatim. A point becomes a body-only card; do not invent card headings. Returning to Content restores original paragraph and card-role boundaries when their exact wording still matches. After wording changes, keep the changed text intact rather than guessing its former heading.
2. Feature cards ↔ Process of the same count. Cards need supplied step headings for Process. Body-only cards cannot invent them. Returning restores stable card IDs, number visibility and explicit card typography settings.
3. Cover ↔ Section opener. Keep title, description, photos, background, palette and chrome. A supplied section number has no Cover slot: explicitly remove it only if authorized, otherwise keep Section opener.

Use a compatible photo/no-photo target and count. An incompatible local override is a conflict to resolve, not permission to discard it. Target layouts use their designed type roles; this never enables overflow font reduction. Existing card reduction consent can survive a round trip; an explicit `allowSmallerText: false` revokes it. Normal card height grows equally within measured slide space. Each card may have a heading, body, or both, with at least one nonempty field.

`layoutState` stores bounded IDs, lengths, hashes and prior formatting settings for reversible projections. It cannot contain hidden source text. Source and edit replay still verify the visible result. Other cross-family mappings and arbitrary component mixing remain unsupported; use an authorized source/plan revision for them.

Example `edit-deck.mjs` input (get the actual ID from the saved deck):

```json
{"slides":[{"id":"details","edit":{"template":"cards-outline-3-no-image"}}]}
```

For new projections, current helpers upgrade renderer23 projects to the additive renderer24 automatically, then verify the entire deck. Older runtimes need a deliberate compatible `--studio` upgrade. Normal legacy edits retain their saved renderer. Later edits update the same HTML/PDF paths.

## When a build or edit does not fit

The helpers stage a source-valid draft, keep the last valid project intact, and return JSON with exit status **2**:

- `saved: false`, `status: fit-conflict`, `proposal`, `review`, exact literal `choices[].preview`, and `requiresAcceptance: true` when a measured alternative exists.
- `status: needs-source-decision` when no fully fitting lossless choice is found within the bounded search. This is not a successful export. Preserve the draft and explain the specific conflict, without claiming the existing project contains the pending change.

Read `review` and `proposal`. Offer the actual layout name and contents, not a generic “shorten your text” warning. Present a concise chat summary and the proposed text division. For example: “This slide would be clearer as two slides. Slide 1: [actual supplied paragraphs/points]. Slide 2: [remaining supplied paragraphs/points]. This changes the presentation from 5 to 6 slides. Shall I apply this split?” In Polish: “Proponuję podzielić ten slajd na dwa: [rzeczywista treść części 1] oraz [rzeczywista treść części 2]. Liczba slajdów zmieni się z 5 na 6. Zaakceptuj podział, jeśli mam go zastosować.” The counts and content must come from the actual proposal, never these examples.

The bounded search measures up to three compatible layout candidates per failing slide and continuation candidates under a shared 48-measurement limit. A choice is offered only if the complete resulting deck fits. Continuations support Content, Cards and Process, creating two to four Content slides per failing slide. Prefer complete body units and nearby sentence endings; if these do not fit, a word-boundary cut can still be proposed explicitly. Exact ordered body ranges are retained once; the main title is repeated verbatim, along with existing imagery and chrome. Automatic table/quote/essential-figure splits, wording condensation and title rewriting are not supported. A long title or single unbreakable value can need a deliberate source decision.

A split always needs explicit acceptance because it adds slides, including when a previous brief fixed a slide count. If the latest instruction prohibits extra slides, use `--allow-additional-slides false` on the build/edit command; only fitting layout alternatives can be offered. No silent clipping, text removal, image removal, font reduction or rewriting. Existing independent layout-change permission does not authorize an unrequested split. Do not repeat approval questions for a choice the user already explicitly accepted.

## Apply an accepted choice

Run the installed/current helper, using returned paths and the chosen ID (`layout` or `split`):

```sh
node scripts/apply-recovery.mjs --project PROJECT --proposal PROPOSAL_JSON --choice split --accept true --playwright-module EXISTING_PLAYWRIGHT --pdf-lib-module EXISTING_PDF_LIB --browser-executable EXISTING_CHROMIUM
```

`--accept true` records a real user decision, not permission for the agent to approve itself. The helper rejects changed saved projects, changed draft contents, changed layout tools and modified requests. It runs the ordinary tracked edit/export again and publishes only the checked result to the original stable HTML/PDF paths. For a first-generation overflow, the original intended output remains absent until this accepted result succeeds. Pending proposals belong to local staging; do not describe them as a portable ready project or offer a failed draft as the final HTML/PDF.

After success, verify source replay, inspect the resulting HTML and every PDF page, and disclose the new slide count and chosen layout/split. If the saved presentation changed while waiting, regenerate the proposal instead of applying stale ranges. Do not delete recovery/source records to bypass a guard.
