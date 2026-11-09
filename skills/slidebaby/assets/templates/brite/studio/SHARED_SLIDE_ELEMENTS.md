# Shared header and footer

All compositions use one optional set of slide elements. The top-left slot accepts either an image logo or a text brand. The center header is an arbitrary section label. The footer has left text, automatic page numbering, and right text (a date or any other supplied wording). Every slot can be omitted independently. Their positions stay fixed when neighbors disappear.

## Defaults and local choices

Set `chrome` on the presentation for inherited defaults, and on a slide for local overrides:

```js
window.BRITE_PRESENTATION = {
  title: 'Project review',
  language: 'en',
  chrome: {
    brand: {kind: 'text', text: 'ATLAS'},
    section: 'Project review',
    footerLeft: 'Atlas Design Conference',
    pageNumbers: true,
    footerRight: '04 NOV, 2026'
  },
  slides: [
    {id:'intro', layout:'text', title:'Our next step', paragraphs:['Supplied content.']},
    {id:'detail', layout:'text', title:'The detail', paragraphs:['Supplied content.'],
      chrome:{section:'Features', footerRight:'DRAFT', pageNumbers:false}},
    {id:'clean', layout:'divider', title:'A new chapter', chrome:null}
  ]
};
```

`chrome:null` hides all five slots on that scope. An object inherits unspecified fields. `brand:null`, `section:null`, `footerLeft:null`, or `footerRight:null` hides that field; `pageNumbers:false` hides numbering. Empty text also renders no slot. A slide can enable selected fields after a presentation-level `chrome:null`. Values are copied, not shared mutable references.

For an image logo use `brand:{kind:'image',src:'assets/my-logo.svg',alt:'Company name'}`. For a text brand use `brand:{kind:'text',text:'Company name'}`. The union prevents accidentally showing both. Text branding uses exactly the section-label style: Outfit 600, 28 px, 28 px line height, uppercase. It is left-aligned in the brand slot; the section label is centered. Custom logo aspect ratios are preserved inside a 280 × 32 region. No brand is inherited from catalog samples when instantiating actual slides.

Defaults: when chrome is absent, the legacy slide `logo`/`section` and presentation `footer`/`date` aliases keep working, with automatic page numbering enabled. New slide chrome overrides legacy aliases and inherited values. Omitting content does not expand the safe area or move the remaining header/footer slots. Long labels block validation rather than clipping or using an ellipsis.

Positions on 1920 × 1080: brand x40/y32 (text y34), section centered at x960/y34, footer baseline region y1022 with x40/960/1880 anchors. Footer has three fixed tracks, so removing the left field never moves the number or right field. One-line budgets apply to each text field. Footer text over the cards' dark photo stays white; its no-photo counterpart uses ink.

## In the agent workflow

The same object is accepted as `plan.presentation.chrome` and `plan.slides[i].chrome`, outside the source-mapped `fields` object. These are presentation instructions/metadata, not a place to hide source body text. Source coverage still checks all body content independently. Supplied logo paths in build-deck resolve relative to the original text input file (absolute local paths are accepted) and are copied into the result; no sample brand asset is adopted automatically. Logo source files follow the existing local-image checks.

The source guard permits later chrome and supported typography-position changes without requiring a body rewrite. Actual source text/figures remain guarded, and a changed chrome still changes the document fingerprint, requiring a fresh PDF. All layouts use the same renderer path.

## Image-free counterparts

Every decorative single-image recipe must declare a same-family no-image counterpart via `pairedTemplate`; the registry rejects missing pairs. Current pairs cover all four cover treatments, split, both card treatments, agenda, section opener, and the figure/text alternative. Removing an image also removes its frame/blank region. Text uses the designed image-free region; contrast is recomputed for photo-backed cards.

The figure text alternative requires supplied explanatory text in `caption`. It is an explicit alternative, not permission to discard a source diagram. Automatic source coverage rejects a plan that omits a provided visual even when a text-only template exists.

## Agenda and section opener

Agenda photo follows Figma 1:53: title, two columns in column-major reading order, optional descriptions/page references, and a photo at x1420/y112, 500 × 856. The no-photo agenda expands the two columns. Both accept 1–8 items; each item has a nonempty title, optional description, and optional `target` slide ID or explicit positive integer `page` (not both). A target resolves to its actual position after reordering and is validated before export. A missing description/reference leaves no empty text node. Footer pagination is independent of agenda references.

The revised section opener follows Figma frames 14:102 and 20:173 inside section 20:191. Both use the x40 title group, 130 px Outfit 900 title, 744 px heading width, 611 px description width, 40 px gap, and vertical centering. The photo version uses the provided book image at x964/y112, 956 × 856; the image-free version preserves the supplied Figma arrangement. The earlier accent strip is removed. Optional sectionNumber remains accepted for existing source compatibility, but is not inserted into the new preview.

Gallery (D31–D32) contains photographs as its primary content. It uses exactly one, two or three supplied images and the same optional chrome. Without images, choose another compatible designed template with the supplied text; do not create a blank gallery. This collection-content exception does not change decorative single-image pairs.


## Visible sample footer slot — D75

Every Templates preview, including its enlarged preview, shows the shared example date in the right footer so users can discover this text slot. Use catalog.metadata.date / the banking sample date consistently; do not leave new example recipes with date:"". This is preview metadata only. Real presentation footerRight/date remains optional and user-controlled; instantiate must not inherit example dates, and copied prompts must still avoid sample branding/dates.
