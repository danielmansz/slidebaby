# First invocation and optional sample

Show the matching language's three numbered choices from [START_HERE.md](../START_HERE.md) for bare invocation/help: empty library, explicit sample, personal material. Keep the welcome short; supplied usable content or an existing-project edit skips it. Installation does not start a conversation. A question about the tool needs an answer, not a generated sample. Never silently substitute fixture content for missing material.

## Route the choice

- Empty library: run the installed skill’s `NODE SKILL/scripts/slidebaby.mjs browse --output NEW_PROJECT --lang pl` outside the installed skill and any actual deck. It resolves the default/requested visual template, copies its empty starter and prepares the genuine HTML. Then link its returned `url` (it includes the UI language and #templates view); on a permitted desktop request external opening with --view templates. No PDF runtime check or live server is needed. If Node is unavailable, use an available host preview of the bundled index and explain actual limitations without installing tools. A later first build may reuse this recognized empty project.
- Explicit sample: “Prepare a test presentation” is sufficient. Run the optional photo fixture below; do not ask for source.md or personal content.
- Personal material: ask only for missing material, then follow SOURCE_TO_DECK.md, NARRATIVE.md for authorized synthesis and WEBPAGE.md for one authorized page. Preserve audience/language/count/wording constraints; no manual template-selection step.
- Foreign deck: use the host's actual existing reader only, preserve the original and save an inspectable text snapshot with provenance. Preserve accessible essential figures and explicit boundaries. Ask for missing text/figures rather than claiming an unread attachment was imported. No native parser/original-layout import is bundled.
- Saved Brite project: use EDITING_WORKFLOW.md; update the same project without --output by default.

```sh
NODE SKILL/scripts/slidebaby.mjs browse --output NEW_PROJECT --lang pl
NODE NEW_PROJECT/scripts/open-preview.mjs --project NEW_PROJECT --lang pl --view templates
```

## Existing-runtime check

NODE means an observed existing Node20+ executable; SKILL means the installed Slidebaby folder; PROJECT is the runtime returned by `SKILL/scripts/slidebaby.mjs resolve [--design ID] [--project SAVED_PROJECT]`, or that compatible saved project. Brite is the default; keep a saved project's selected template. Discover modules through the host's existing dependency locator or scoped project lookup. Do not scan the home directory or hardcode the author's paths. If Node is absent, explain that before trying a Node script.

```sh
NODE PROJECT/scripts/check-runtime.mjs --project PROJECT --lang pl
```

Optional observed paths: --module-root /existing/node_modules, --playwright-module /existing/playwright/index.mjs, --pdf-lib-module /existing/pdf-lib, --browser-executable /existing/chromium. Use --lang en for English.

The checker probes an offline one-page PDF in memory, tries installed Chrome/Edge/Chromium before an existing Playwright cache and tries another observed automatic candidate after failure. An explicit browser path remains explicit. Exit0 is ready; exit2 is unavailable. Use returned result.runtime paths and reuse a successful current-session check unless availability changes. PDF tools must exist where the agent executes; a browser on the user's laptop is not automatically available in a cloud sandbox. Viewing HTML is independent from PDF rendering.

Missing tools get a concise explanation naming only actual missing components and a practical next step. Preserve supplied material. No automatic dependency/plugin/browser installation, global setting or persistent service. Existing Chrome may be reused; Safari/Firefox may view HTML but do not provide the Chromium PDF renderer. A wrong supplied path can be replaced only by a genuinely observed existing alternative. Do not loop over speculative locations or claim completed PDF output.

## Optional photo sample

Only run on an explicit sample/test request. Choose NEW output and scratch folders outside the installed skill/existing decks:

```sh
NODE SKILL/scripts/slidebaby.mjs sample --output /absolute/NEW-sample-project --scratch /absolute/NEW-sample-work --lang pl
```

The same observed runtime flags apply. The helper creates exactly three fictional Atlas slides (Cover, Feature cards, Section opener), text branding and explicitly bundled illustrative photos. It preserves source/plan/coverage and uses the normal guarded build/export. Output/scratch collisions reject; failed builds preserve diagnostics. This fixture does not test semantic template selection or establish fresh-machine compatibility. It never becomes a fallback for a real deck's missing photos.

Inspect all three PDF pages, source text and matching viewer download. Use DELIVERY.md for actual HTML/PDF links, external opening where permitted, the editable project and optional current-project archive via package-project.mjs. Say the sample is fictional and the user may now supply their own material. Keep this sample separate from earlier decks.

## First delivery and later edits

For both a real deck and the sample, show/open HTML first in the agent's preview where supported, then offer PDF as a separate download. Put the HTML link before the PDF link; internal PDF inspection does not replace the main HTML preview. Follow DELIVERY.md for explicit format requests and actual host preview limitations, plus its required one-time viewing/Live preview/editing cue after the first successful real deck or sample. Explain that edits continue here; ZIP is optional backup/transfer. Live refresh observes checked saves in the same local folder; offline local files need refresh and downloaded cloud copies need a new download after edits. Cloud cannot be assumed to open the user's desktop; never claim a queued opener is visibly rendered. Do not repeat setup on corrections or suggest enabling an already-running live session.

Optional assets follow ASSET_GUIDANCE.md after a useful real brief: one nonblocking own-later / authorized stock / no-photo choice, skipped for the fixed sample and known preferences. Continue without optional photos while unanswered. One shared catalogue palette switch remains; no individual template switches are planned.
