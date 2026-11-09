# Create a narrative from raw text

Use this mode when the user asks to turn rough notes/project text into a presentation, summarize or organize material. Preserve mode remains the default for finished slide text or explicit exact-wording requests. Never infer rewriting permission from a wish to change typography/templates. Support pasted text/local TXT/Markdown and the single-page capture workflow in WEBPAGE.md. The host agent reads the page; helpers do not fetch or crawl. PPTX/PDF import remains deferred.

The agent running this skill writes the narrative and selects active templates. Helpers do not call an LLM, score semantic truth or fetch websites. No manual template selection or routine outline approval is required. Infer purpose/audience/language/count from the brief; ask only when a material ambiguity prevents a sensible result. Preserve the language unless translation is requested.

## Editorial workflow

1. Read the original and save a source snapshot with `prepare-source.mjs`. Inspect its blocks and IDs. Missing content needs a question. Unsupported/merged tables, code, nested structures or essential figures remain gaps; this stage must not silently discard them.
2. Choose a narrative suited to the audience: problem/solution for a product, progress/risks/next steps for an update, context/work/result for a case study. Do not force every brief into a ten-slide pitch. Keep a coherent argument and short, specific titles.
3. Write a draft JSON as below. Condense, combine and reorder relevant text. Every derived block references one or more original block IDs and explains its editorial purpose/change. Record fully omitted original blocks and why; explain partial condensation in the derived block's reason. Generated framing/titles also need supporting source refs. Do not invent facts, metrics, endorsements, schedules or promises. Preserve negation, uncertainty, units, dates/time windows and all material limitations. Keep quotes exact and attribution truthful. Conflicting source claims need resolution or explicit presentation as uncertainty.
4. Review each derived claim against the original. The review flags record the agent's review, not a deterministic fact-check result. Note caveats and meaningful editorial decisions. An exact requested slide count must be set in draft.exactSlides; do not silently relax it or hide essential content to fit.
5. Run `node scripts/narrative.mjs --input /absolute/raw.md --draft /absolute/draft.json --output /absolute/NEW-prepared-folder`. It preserves original text, the editorial map, derived slides.md and source.json. The original snapshot and draft are embedded in source.json and checked during later builds/exports. Never prepare a plain replacement snapshot of slides.md to bypass these records.
6. Read the live catalog and map derived source.json blocks to compatible template fields using SOURCE_TO_DECK.md. Choose based on semantics, count, assets and density. A heading followed by parallel pairs can become cards; an argument need not become unrelated cards. Use no-photo layouts without relevant assets. Missing evidence is not permission to fill a metrics/quote template. Shortlist up to three compatible layouts preserving all derived text; if none fits, revise the narrative deliberately from the original or report a gap. Smaller fonts still require separate user consent.
7. Build with the existing check-plan/build-deck pipeline using the prepared source.json. Build copies original.md and narrative.json into generation/ alongside derived input.md, source snapshot, plan and coverage. Later export/edit verification retains both records. Validate fit and inspect final PDF. Tell the user briefly that content was condensed/reordered, the resulting count and material omissions/uncertainties. Exact source coverage refers to the derived slide text, not verbatim retention of all original wording.

## Draft example

```json
{
  "authorization":"create-narrative",
  "brief":"User asks: turn these rough notes into a short client presentation.",
  "exactSlides":1,
  "slides":[{"blocks":[
    {"kind":"heading","text":"A clearer weekly plan","sources":["b0001"],"reason":"Write a framing title for the supplied project purpose."},
    {"kind":"paragraph","text":"The team can review upcoming tasks in one place.","sources":["b0001","b0002"],"reason":"Combine the purpose and workflow description without adding outcomes."}
  ]}],
  "omissions":[],
  "review":{"facts":true,"qualifications":true,"attribution":true,"notes":"Checked every statement against the source. No metrics or endorsements supplied or added."}
}
```

Block kinds: heading, paragraph, list-item, figure and table. Ordinary text is a single nonempty line (wrapping is handled by rendering); a table block uses one complete plain Markdown pipe table as multiline text. Use distinct heading/paragraph blocks for card titles/bodies. All original blocks must be referenced or explicitly omitted, without contradictory omission/use entries. References can repeat because one source passage may support several slides. Structural checks cannot establish that the selected passages truly support the summary: perform the editorial review.

Preserve mode continues to use prepare-source.mjs directly and exact source references; it never calls narrative.mjs. With no instruction to condense, keep source wording. User-requested later rewrites require a deliberate new narrative/source/plan revision; existing lossless visual/card edits remain supported.


## Starter requests

EN: Turn these rough notes into a concise client presentation. Organize the narrative, shorten repetition, preserve facts and limitations, and choose suitable templates automatically.

PL: Ułóż z tych notatek krótką prezentację dla klienta. Zbuduj narrację, skróć powtórzenia, zachowaj fakty i zastrzeżenia oraz samodzielnie dobierz szablony.

For exact text: Keep my wording and slide order exactly; choose layouts without rewriting. / Zachowaj dokładnie moje teksty i kolejność slajdów; dobierz układy bez przeredagowywania.


D55: A narrative draft may include a supplied local figure block (kind:figure, text:meaningful alt, asset:local path) alongside text. For webpage sources the asset must be recorded in the selectedAssets evidence. Keep its supporting original text references and reason. Use --source-snapshot to retain the captured page metadata when preparing narrative. Existing essential-figure/unsupported original structures remain explicit gaps in the text-first importer.


D58: Consider a useful optional section overview and context-sensitive title; follow AGENT_GUIDE.md, Optional section overview. Suggest once without blocking or silently adding to an existing/fixed-count deck. If requested, use its own derived source unit and stable agenda targets, preserving all original content and reading-order checks.


D68: A narrative draft can include {"kind":"table","text":"| Item | Amount |\n| --- | --- |\n| Housing | £900 |","sources":["b0003"],"reason":"Preserve the supplied dataset."}. Each original structured source table must appear exactly once as a derived table with identical headers, cell strings, blanks, order and alignment. Do not omit, summarize or change it as part of ordinary prose condensation. A table derived from raw prose also needs original refs/reasons and factual review; never invent missing values or calculations. Malformed/embedded/merged table structures remain explicit gaps. The usual source snapshot, narrative records and guarded build/export apply to the resulting typed table block.


## Shared-criteria comparisons — D73

During narrative/template selection, distinguish a true comparison of the same criteria across2–4 actual options from two independent content groups. Use table-criteria-matrix for the former within its contract, existing Comparison for independent columns, and table-default for other supplied datasets. Original structured tables must still survive unchanged and exactly once. Turning raw notes into a new matrix requires authorized editorial synthesis: source every value and relationship, preserve qualifiers, retain uncomparable/unknown values honestly, and never invent criteria, rankings, scores or yes/no claims. Do not fill blanks, sort, transpose or manufacture a winner. Unsupported density is a fit conflict or a compatible source-preserving Table fallback, not permission to omit data.


## Closing takeaway and practical next steps — D74

Consider Summary when the supplied material has a real closing takeaway and1–4 actions, or the user has authorized editorial synthesis that can ground them in the original evidence. Each derived title/description/takeaway/label/detail/action needs its usual original refs and editorial reason. Do not convert an unanswered question, hypothesis or tentative option into an approved conclusion, commitment, owner/date or measured outcome. If no actual next actions can be grounded, use another suitable layout or suggest a closing slide once; do not invent filler. All five Summary recipes share the same text schema and source guards; a source image cannot disappear as a fit fallback.


## Original figures — v4.18 correction

Supplied original figure blocks are supported rather than rejected as unsupported text. Each must map to exactly one derived figure referencing that original block and the same local asset; meaningful alt may be edited under narrative authorization. Do not merge distinct figure blocks or satisfy an image with a paragraph/omission. Relative derived paths resolve against the original input folder before saving the narrative, so moving derived Markdown into its work folder does not break the source image. Build still ingests and hashes the actual original/derivative and verifies final-scale readability.
