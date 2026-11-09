# Working on Slidebaby

Read README.md, CONTRIBUTING.md and the relevant skill/project guide before editing.
The installable skill is skills/slidebaby. Preserve its public identity,
recipe IDs, source/replay records and empty registered-template starters.
Read docs/TEMPLATES.md and use the registry/manifest rather than assuming Brite
is the product or that every template has its layouts.

User presentations belong outside the installed skill. Preserve originals and
prior releases; use new artifact names rather than overwriting existing exports.
Do not install dependencies, change global settings, publish or start persistent
services without authorization. Keep EN/PL interface independent of slide text.

LICENSE governs authored code/instructions/layout implementation; retain original
third-party terms. Paid client presentation work is allowed; resale of the skill
or modified versions is prohibited. Keep license copies synchronized; preserve
conflicting user-authored legal files.

Before release run node scripts/check-release.mjs and node scripts/build-release.mjs
with a new output directory. Generated archives and user decks are not source files.
Update release.json, SKILL metadata, CHANGELOG.md, RELEASE_NOTES.md and the local
EN/PL changelog together. Do not claim unperformed host or publication checks.
