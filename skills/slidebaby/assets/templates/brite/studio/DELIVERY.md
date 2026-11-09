# Deliver the current HTML, PDF and optional project archive

Default completion shows or opens the generated **HTML first as the main presentation preview inside the agent**, when the host supports HTML previews. Put its genuine **Open presentation (HTML) / Otwórz prezentację (HTML)** link first, then provide a separate **Download PDF / Pobierz PDF** link. An optional project ZIP and editable project location follow. Use actual returned paths. A PDF-only or ZIP-only reply is insufficient unless the user requested that format alone. Edits continue in the agent conversation.

User-facing delivery order is HTML preview first, PDF download second. Inspect the PDF internally for quality before delivery; that check does not make PDF the initial user-facing preview. Open PDF as the main preview only when the user explicitly requests PDF-first or PDF-only delivery. If the host cannot render HTML or controls which attachment opens, still offer the downloadable HTML first, briefly explain the actual preview limitation and keep PDF separately downloadable. Do not claim an HTML preview opened without evidence. External-browser and Live preview guidance below still applies.

## Check and open

1. Inspect every PDF page, actual slide order/text/figures and the viewer's prepared Download PDF. Source/fit checks do not certify contrast or narrative quality.
2. Keep the same saved project and stable presentation.html / exports/presentation.pdf for later corrections. Use tracked helpers; do not edit the derived HTML or create numbered copies. Preserve generation, edit inputs, original assets and internal recovery history.
3. On a permitted local desktop, start/reuse bounded Live preview under LIVE_PREVIEW.md, then request the system external browser with the command below. This is independent of the PDF renderer. Reuse an already-open live tab after corrections; reopen only on request or when needed.
4. Remote/headless/attachment-only sessions receive real downloadable HTML/PDF. Never infer control of the user's desktop, show remote localhost as their laptop's address, claim a queued request visibly opened, or bypass host restrictions. Chat-link routing remains host-controlled.

```sh
NODE PROJECT/scripts/open-preview.mjs --project PROJECT --lang pl
```

Use --lang en for English UI. The helper prefers this project's matching live URL and otherwise opens its saved file through the OS association. A file may follow a separate HTML application association. requested:true means an opening request, not verified window visibility. It starts no server, changes no defaults and installs nothing. HTML can be viewed in Safari/Firefox; the PDF generator independently requires a compatible Chromium renderer.

For an empty copied catalogue run make-preview.mjs first, then open-preview.mjs --view templates. No PDF tools or live server are needed; keep the installed starter empty.

## Portable project ZIP

When a ZIP is useful or the host delivers downloadable projects, use:

```sh
NODE PROJECT/scripts/package-project.mjs --project PROJECT --output /absolute/NEW-project.zip
```

Use the active skill's helper for older projects. It creates a checked current-state archive using Node built-ins only, refuses collisions/busy or invalid exports and writes outside the source project. It retains generation and replay inputs/assets; excludes .brite recovery/work/live state, obsolete derived exports and unrecognized files; and lists included hashes/exclusions in PROJECT_ARCHIVE.json. Originals and full local history stay untouched. Keep any deliberately added unrecognized files separately if they are needed. Do not recursively ZIP the working folder or include local session credentials. Use a new archive filename when an earlier deliverable already exists.

Label the link **Project ZIP — optional backup/transfer / Projekt ZIP — opcjonalna kopia/przeniesienie**. It is for backup, another chat/computer or a deliberate move to local work. Downloading/unpacking is not required for edits in this conversation while the agent retains access to the project. Explain an actual missing-project problem if it occurs; do not imply ZIP is always necessary.

## First successful deck: one concise viewing/editing cue

After the first real deck or explicit sample, explain editing here, comfortable external viewing, Live preview and actual refresh behavior once. Respect a request to omit guidance and an already-running live session. Skip the empty-library-only path. Subsequent corrections get brief current-file/status guidance, not the whole setup again.

**Local, live active:** PL: “Poprawki zlecaj tutaj, podając numer slajdu i zmianę. Zostaw kartę Live preview otwartą — po sprawdzonym zapisie odświeży się automatycznie. Aktualny PDF pobierzesz z podglądu. ZIP jest opcjonalną kopią lub sposobem przeniesienia projektu.” EN: “Request edits here by slide number and change. Keep the Live preview tab open: it refreshes after a checked save, with the current PDF available there. The ZIP is an optional backup or transfer.” Say the browser is opened only when verified.

**Local, no live yet:** PL: “Edytujemy dalej tutaj. Dla wygodniejszego oglądania otwórz HTML w zewnętrznej przeglądarce. Możesz napisać: ‘Włącz Live preview i otwórz prezentację w mojej zewnętrznej przeglądarce’. Bez live odświeżaj aktualizowany lokalny HTML; po poprawkach aktualizuję również PDF.” EN: “Continue editing here. Open HTML in your external browser for comfortable viewing. You can say: ‘Enable Live preview and open the presentation in my external browser.’ Without live, refresh the locally updated HTML; I also update PDF after edits.”

**Cloud/attachments:** PL: “Poprawki zlecaj tutaj — nie musisz pobierać ani rozpakowywać ZIP-a. Dla wygodniejszego oglądania pobierz HTML i otwórz go w zewnętrznej przeglądarce; Prezentuj pokazuje same slajdy, strzałki zmieniają slajd, Escape wraca. Możesz poprosić o pomoc z Live preview, które wymaga pracy w tym samym lokalnym projekcie. Pobrana kopia nie synchronizuje się z chmurą. Po zmianach otwórz nową wersję w podglądzie agenta lub pobierz aktualne HTML/PDF ponownie.” EN: “Request edits here: downloading/unpacking the ZIP is not required. For comfortable viewing, download HTML and open it in your external browser; Present shows slides only, arrows navigate and Escape returns. You can ask for Live preview setup, which requires edits in the same local project. Downloaded copies do not sync with the cloud. After changes, open the new agent preview or download the updated HTML/PDF again.”

Checked saves update current HTML/PDF. Working local live reloads that same tab; offline local files need refresh; independent cloud downloads need a new download. An external PDF app or stale agent artifact is not promised to refresh automatically. For a chosen local migration use LIVE_PREVIEW.md; serving a completed project needs existing Node20+ only, while HTML viewing needs no runtime. No dead-end “remote, nothing installed” success message.

## Contextual next steps

Offer at most two relevant next actions, counting asset offers under ASSET_GUIDANCE.md. The first viewing/editing cue has priority. Zero tips are fine after a correction. Useful examples: change one slide to Dark while preserving content; use a compatible named variant; add an actual supplied logo; or find/add relevant free photography under the recorded source preference. Distinguish search-only candidates from an authorized find-and-add request. Never suggest a known supplied/declined/unchanged unanswered asset or use stock as evidence. Keep help outside slide/PDF content.
