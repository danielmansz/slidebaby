# Release handoff

Target repository: `danielmansz/slidebaby`. Prepare and verify each release in a separate checkout.

## Prepare locally

```sh
node scripts/check-release.mjs
node scripts/build-release.mjs --out /absolute/NEW-release-directory
```

Keep the generated skill/source ZIPs, SHA256SUMS and RELEASE_NOTES.md together.
The builder refuses an existing output directory and includes only intended
repository paths. Previous development packages are preserved outside this repo.
No automatic GitHub workflow or release publisher is installed.

## Publish after reviewing the files

1. Start from the current main branch. Review the change and verify the version
   in release.json, SKILL.md, CHANGELOG.md, and the viewer changelog.
2. Commit and tag the verified source using the version in release.json. Push
   the reviewed commit and new tag to the existing repository.
3. Create a GitHub Release from the new tag and use RELEASE_NOTES.md as its
   description. Attach the built skill ZIP, source ZIP, SHA256SUMS, and
   RELEASE_MANIFEST.json. GitHub's generated source ZIP is separate from the
   installable skill.
4. Verify the public release and tagged installation path. Download both
   attached archives and compare their checksums to the local builds.

The grant in LICENSE permits paid presentation work and prohibits tool resale;
third-party font/photo rights remain independent. CREDITS.md records the author's
source statements and technical inventory, without claiming independent clearance
of every depicted brand/person. Professional review of the custom license is
recommended; do not label this an OSI-approved open-source project.

[GitHub release documentation](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
