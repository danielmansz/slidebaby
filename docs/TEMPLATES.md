# Visual templates and layout recipes

Slidebaby is the installed skill. Brite is its first visual template: a coherent
set of typography, colors, layout recipes, imagery and measured fit rules.
The first release includes Brite only, with 69 recipes in 14 layout families.
Light/Dark can vary between slides within Brite.

## Package structure

```text
skills/slidebaby/
  SKILL.md
  scripts/slidebaby.mjs
  scripts/template-registry.mjs
  assets/templates.json
  assets/templates/brite/
    template.json
    studio/
```

`assets/templates.json` registers installed visual-template bundles and a default.
Each template.json declares identity/version, runtime path, catalogue counts,
capabilities and local commands. It does not download or install remote code.
The studio retains its own renderer/styles/assets and executable workflow adapter.
Do not assume a later visual template supports Brite's layout families or fields.

## Product commands

Run these with an existing Node20+ executable, from the installed skill folder:

```sh
node scripts/slidebaby.mjs templates
node scripts/slidebaby.mjs resolve --design brite
node scripts/slidebaby.mjs browse --output /absolute/NEW-empty-project --lang en
node scripts/slidebaby.mjs catalog --design brite --template cover-default
node scripts/slidebaby.mjs sample --output /absolute/NEW-sample --scratch /absolute/NEW-work --lang en
node scripts/slidebaby.mjs verify-document --project /absolute/current-project
```

`--design` selects the visual template. The existing `--template` flag selects a
layout recipe within that template. Other command flags remain defined in the
selected studio's guides. `resolve` returns its runtime path for detailed work.
Brite is selected automatically while it is the only/default template; do not add
a mandatory selection question. The sample uses existing runtime detection and
never installs tools. Browse creates a new empty project and real offline HTML; link its returned `url`
to open the requested UI language directly in the library.

Edits/exports with `--project` resolve its saved template instead of a new default.
Projects record `visualTemplate:{id,version}` separately from each slide's
`template:{id,version}` recipe and `palette`. A project marker also identifies its
saved renderer. Source plans, replay checks and export fingerprints preserve the
visual-template identity. Unknown IDs/versions or a requested different design
reject; no automatic cross-design conversion or mixed-design deck is implemented.

## Compatibility and adding a template

Recognized earlier Brite projects without template metadata remain readable and
editable with their own saved visual runtime. Existing recipe IDs and Brite
runtime globals remain internal adapter identifiers. Ordinary edits do not
rewrite their source/plan or silently upgrade their appearance.

To add a real visual template, supply its bundle/manifest and register it. Its
adapter must support the declared commands, preserve source/edit/asset evidence,
validate actual fit and produce matching portable HTML/PDF. Include an empty
starter, EN/PL help/prompts, declared metadata bindings/load files for release
inspection, legal notices and applicable tests. The release checker discovers
all registered bundles. Update release.json's template versions and public docs.
Run the new template's visual and first-use tests; registering files alone is not
proof that a new visual design works. Future common code can be extracted when
two actual adapters justify it.
