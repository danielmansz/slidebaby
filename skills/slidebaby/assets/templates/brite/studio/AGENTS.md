# Slidebaby project instructions

Read [AGENT_GUIDE.md](AGENT_GUIDE.md), then the relevant source/edit/delivery reference. These files describe current behavior; release history is in changelog.js, and the author's decision history stays outside this portable project.

- Preserve the user's material, source mapping, generation records and replayable edit inputs. UI language is independent from slide language. Never inherit catalogue content/assets into a real deck.
- Use the live catalogue for template IDs/contracts. Build a first deck in a new project, then update that same project with the tracked helpers. Never edit the installed empty starter. Omit edit `--output` unless a separate copy was requested.
- Validate and inspect matching HTML/PDF after edits. Stable files are presentation.html and exports/presentation.pdf. Failed checks preserve the last valid result; internal recovery history is not a substitute for generation/edit provenance.
- Read REFLOW.md for supported Content/Cards, Cards/Process and Cover/Section opener projections and measured overflow choices. Present the actual text/count and obtain acceptance before applying a proposed split. Keep failed drafts separate from the last valid result.
- No automatic type reduction. Card body reduction needs recorded user permission and affects all cards together. No clipping, truncation or unauthorized rewriting.
- Use one shared Light/Dark catalogue switch; it changes examples/prompts only. Save requested palettes on actual slides. Respect existing layout/image preferences and the no-gradient rule.
- Preserve LICENSE, LICENSING.md, THIRD_PARTY_NOTICES.md and font notices in distributed projects. Paid presentation work is allowed; resale of the skill/modified versions is prohibited. Standalone HTML carries inert notice data without adding slide/PDF branding.
- No dependency installation, global configuration, publication or persistent service without authorization. Local Live preview is bounded and opt-in/host-permitted; never promise a cloud download will synchronize locally.
- Use package-project.mjs for optional current-project ZIPs; leave authoritative history and originals untouched. The portable ZIP deliberately omits local recovery snapshots and session state.

Created and designed by Daniel Mansz: https://www.linkedin.com/in/daniel-mansz/ . Product: Slidebaby; template: Brite; public skill ID: slidebaby. See PRODUCT_RELEASES.md before changing identity or release metadata.
