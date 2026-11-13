# Installation and viewing

Use the complete skill folder. Product name: Slidebaby. Folder/invocation:
`slidebaby`. One installation is enough; duplicate copies with the same name
can create duplicate entries in a host's skill selector.

## Codex

From your project, ask `$skill-installer` to install the complete skill into
`.agents/skills/slidebaby` in this project from:

```text
https://github.com/danielmansz/slidebaby/tree/v1.2.0/skills/slidebaby
```

For manual project-scoped setup, download the skill ZIP from the release,
unzip it and copy its entire `slidebaby` folder to:

```text
YOUR-PROJECT/.agents/skills/slidebaby/SKILL.md
YOUR-PROJECT/.agents/skills/slidebaby/assets/
YOUR-PROJECT/.agents/skills/slidebaby/references/
```

If you downloaded the source repository, the installable folder is
`skills/slidebaby`; copy that folder to the destination above.

The listing is abbreviated; preserve every file, including licenses and agents/.
Codex's documented user-wide location is `~/.agents/skills/`; project scope keeps
the installation attached to your chosen project. These instructions do not
change global configuration. Start a new session if discovery has not refreshed.

Official reference: [OpenAI — Build skills](https://learn.chatgpt.com/docs/build-skills).

## Claude and Claude Code

Where your Claude account provides custom Skills and code execution, upload
`slidebaby-skill-v1.2.0.zip` through **Customize → Skills → + Create skill → Upload a skill**,
then enable it. The ZIP has one top-level `slidebaby` folder containing SKILL.md
and all resources. Do not use the whole source/repository ZIP for skill upload.

Claude Code project-scoped manual setup uses `.claude/skills/slidebaby`.
Use the host's skill selector/invocation. Host/account availability and execution
permissions can differ; the release does not promise a particular subscription plan.

Official reference: [Claude — Create custom skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills).

## First request

Ask “Help me get started”, or send your material directly. The three starter
choices are empty library browsing, an explicit three-slide photo sample, and
your own material. Installation does not itself send a message or generate a deck.

## Runtime requirements

Opening the empty template library needs existing Node to prepare its portable
viewer. Viewing a completed standalone HTML needs only a browser. PDF creation
requires Node.js20+, Playwright, pdf-lib and a compatible Chrome/Edge/Chromium in
the environment executing the agent. Existing tools are checked first. These
packages/browsers are not bundled and nothing installs automatically.

If tools are missing, ask the agent to identify the exact missing component and
explain a local setup. Approve installation separately if you want it. The optional
Python image helper is not required for the browser-backed raster workflow.

## Viewing and later edits

- Request edits in the agent conversation; the viewer is not a canvas editor.
- Checked edits update one current `presentation.html` and `exports/presentation.pdf`.
- On a permitted local desktop, the agent requests opening the system external
  browser. A chat link can still route through the host's built-in preview.
- Local Live preview uses a bounded Node server for that same project, with Stop
  and idle expiry. Keep its URL open to see checked updates automatically.
- Without live, refresh the locally updated HTML. A previously opened external
  PDF viewer is not promised to reload automatically.
- A cloud agent cannot open your local browser or synchronize a downloaded copy.
  Download fresh HTML/PDF after cloud edits. Local live requires the editable
  project and a local agent/runtime operating on that copy.

## Updates and transferring a project

Keep the actual presentation project outside the installed skill. Preserve its
source/generation/edit records and original assets. Before replacing an installed
skill folder, keep the old installation as a backup; do not merge arbitrary old
files or overwrite an unrelated folder. Download a complete new skill version.
Existing projects can be revised with current helpers; deliberate visual-runtime
upgrades require measured checks. A conflicting user-authored license is retained
for explicit reconciliation.

An optional Project ZIP is a backup/transfer, not a prerequisite to continue in
the current chat. After a deliberate move, unpack it and ask your local agent to
continue from the project folder. Opening only a derived HTML is not access to
all source/replay records needed for guarded edits.

## Earlier private Brite packages

The public skill is now `slidebaby`; earlier private packages used `brite-compose`.
Keep the old package/installation as a recoverable backup and preserve actual
presentation projects separately. Enable/select Slidebaby for new work; disable
the old skill through your host when appropriate to avoid two competing entries.
No automatic removal, alias installation or global migration is performed.
Existing recognized Brite projects can still be edited with Slidebaby; their
recipe IDs and saved visual runtime remain compatible.
