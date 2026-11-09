# Contributing

Report a reproducible issue or propose a focused change. Include your host/OS,
release version and minimal non-sensitive input. Do not attach client material,
credentials or local source/recovery directories to a public issue.

By submitting a contribution, you confirm that you have rights to contribute it
under the repository's Slidebaby Community License. Third-party materials retain
their own terms and need truthful source/license notes. Free modified forks must
retain notices and identify modifications; do not imply official endorsement.

## Run checks

With existing Node.js20+:

```sh
node scripts/check-release.mjs
```

This runs release consistency, local-document links, packaging hygiene, JavaScript
syntax and the bundled tests. It does not install packages, open a GUI or publish.
Actual HTML/PDF smoke tests additionally require the documented existing runtime;
use the skill's run-smoke.mjs only with new output/work paths outside the skill.

Keep current source wording, source coverage/edit replay and last-good outputs
intact when changing layouts. Match tests to meaningful behavior. Visual/layout
changes need rendered review; passing a syntax check is not visual verification.

## Package

```sh
node scripts/build-release.mjs --out /absolute/NEW-release-directory
```

The builder uses Node's existing runtime, writes new files only, creates the skill
and source ZIPs plus checksums/notes, and never changes the source project.
See [release handoff](docs/RELEASING.md) for the first GitHub publication.
