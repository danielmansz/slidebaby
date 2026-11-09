# Release handoff

Target repository: `danielmansz/slidebaby`. This checkout prepares version 1.0.0;
it does not create the repository, push a branch, tag or publish a GitHub Release.
The owner was read from the connected GitHub profile. Change repository metadata
and installation URLs together if a different destination is chosen.

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

1. Create the public `slidebaby` repository in the chosen GitHub account. Use the
   included custom LICENSE; do not select MIT/GPL from GitHub's license chooser.
2. Upload/push this repository's contents, including skills/, docs/ and scripts/.
   Keep generated dist/work/output folders and client projects out of Git.
   From a new local checkout, the equivalent Git steps are:

   ```sh
   git init --initial-branch=main
   git add .
   git commit -m "Prepare Slidebaby 1.0.0"
   git remote add origin https://github.com/danielmansz/slidebaby.git
   git push -u origin main
   git tag v1.0.0
   git push origin v1.0.0
   ```

   Use your own configured Git identity and account authentication. These commands
   are instructions for the reviewed publication step, not an action run by the builder.

3. Create/select tag `v1.0.0` on the reviewed source commit (the CLI example already creates it), then create a GitHub Release with that tag. Use the contents of RELEASE_NOTES.md as its description.
4. Attach `slidebaby-skill-v1.0.0.zip`, `slidebaby-source-v1.0.0.zip` and `SHA256SUMS`.
   GitHub's automatic source ZIP is not the installable skill ZIP.
5. Verify the public README image/links, download and checksum both archives, then
   install the skill from the tagged skills/slidebaby path in a fresh project.
   Try the sample and one later correction with actual HTML/PDF download.

The grant in LICENSE permits paid presentation work and prohibits tool resale;
third-party font/photo rights remain independent. CREDITS.md records the author's
source statements and technical inventory, without claiming independent clearance
of every depicted brand/person. Professional review of the custom license is
recommended; do not label this an OSI-approved open-source project.

[GitHub release documentation](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
