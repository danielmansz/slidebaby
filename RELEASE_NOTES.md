# Slidebaby v1.0.0

Create designed HTML/PDF presentations with your AI agent. Brite provides 69
layout variants across 14 families, with Light/Dark per slide and English/Polish
interface/help independent of your slide language.

Start with an empty library, try the three-slide photo sample, or provide your
own text, notes, readable material or one webpage. Continue requesting edits in
the same conversation. Supported layout changes preserve wording; overflow can
offer a concrete measured proposal for approval.

## Downloads

- `slidebaby-skill-v1.0.0.zip`: install/upload this complete skill folder.
- `slidebaby-source-v1.0.0.zip`: full repository source and release tooling.
- `SHA256SUMS`: checksums of the two archives.

## Requirements

PDF generation needs existing Node.js 20+, Playwright, pdf-lib and compatible
Chrome/Edge/Chromium. They are not bundled or installed automatically. A completed
standalone HTML can be viewed in a modern browser. Host model usage/access is separate.

## License

Free presentation creation, including paid client work and delivery of real
PDF/HTML/editable projects. No resale of the skill or modified versions.
See LICENSE and separate font/image terms. This is custom source-available software.

## Known limits

- The browser is a viewer/library; the agent performs edits.
- Original-layout PPTX/PDF import, native charts, arbitrary fonts/themes and
  unrestricted component mixing are outside scope.
- Local browser opening/live depends on host permissions. Cloud downloads are
  snapshots and do not synchronize with your computer.
- Measured fit/source checks do not certify visual contrast or narrative quality.
  Overlapping classic Cover photos and bright areas behind light footer text
  need visual inspection. No contrast gradients are added automatically.
- Local macOS/Chrome, source/replay, export/archive and agent scenarios were
  tested. Windows/Linux and this exact version in a new Claude account do not
  have end-to-end clean-machine certification.

Slidebaby installs as `slidebaby`, with registered visual-template bundles. Brite
provides the initial visual system; saved visual-template identity is separate
from layout recipe IDs and Light/Dark. Earlier private Brite projects remain
compatible. This release does not automatically convert between visual templates.
