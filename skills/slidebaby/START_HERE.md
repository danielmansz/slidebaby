# Start with Slidebaby / Zacznij ze Slidebaby

Created and designed by [Daniel Mansz](https://www.linkedin.com/in/daniel-mansz/).

## Polski

Po dodaniu całego folderu skilla wybierz Slidebaby w swoim agencie i napisz „Pomóż mi zacząć”. Samo zainstalowanie paczki nie otwiera rozmowy. Prezentacje powstają w szablonie Brite. Możesz zacząć na trzy sposoby:

1. **Obejrzyj szablony.** Otworzę pustą prezentację z biblioteką układów. Wyszukasz szablon po nazwie lub zastosowaniu, a następnie skopiujesz prompt albo wskażesz agentowi wariant po nazwie. Napisz: „Otwórz pustą prezentację i pokaż szablony”.
2. **Wypróbuj Slidebaby na przykładzie.** Przygotuję trzy przykładowe slajdy ze zdjęciami, podgląd HTML i PDF. Potem poproś o poprawkę. Napisz: „Przygotuj prezentację testową”.
3. **Stwórz prezentację z własnych materiałów.** Wklej tekst/notatki, dołącz plik lub istniejącą prezentację albo podaj adres strony. Dobiorę układy do odczytanej treści. Gdy załącznika nie da się odczytać, poproszę o tekst slajdów. Napisz: „Zrób prezentację na podstawie tych materiałów”.

Wybierz 1, 2 lub 3 albo od razu prześlij materiały. Warto dopisać cel, odbiorców, przybliżoną liczbę slajdów i czy wolno skracać tekst. Logo i zdjęcia są opcjonalne.

Otrzymasz osobne HTML i PDF. Poprawki zlecaj dalej tutaj w rozmowie; zapisują się w tym samym projekcie. Projekt ZIP to **opcjonalna kopia/przeniesienie**, nie wymaga pobierania ani rozpakowania do dalszej edycji tutaj. Lokalnie agent spróbuje otworzyć podgląd w domyślnej zewnętrznej przeglądarce. W chmurze pobierz HTML i otwórz go na komputerze. Działający lokalny Live preview odświeża kartę po sprawdzonych zmianach; bez niego odśwież aktualizowany lokalny HTML. Po zmianach w chmurze pobierz nowe pliki — pobrana kopia nie synchronizuje się z chmurą.

## English

After adding the complete skill folder, select Slidebaby in your agent and say “Help me get started.” Installing the package does not itself start a chat. Presentations use the Brite template. There are three ways to start:

1. **Explore the templates.** I’ll open an empty presentation with the layout library. Search by name or use case, then copy a prompt or ask your agent for a variant by name. Say: “Open an empty presentation and show me the templates.”
2. **Try Slidebaby with a sample.** I’ll create three sample slides with photos, an HTML preview and a PDF. Then request a change. Say: “Create a sample presentation.”
3. **Create from your own material.** Paste text/notes, attach a content file or existing presentation, or provide a webpage URL. I’ll choose layouts for the content I can read. If an attachment cannot be read, I’ll ask for slide text. Say: “Create a presentation from these materials.”

Choose 1, 2 or 3, or send your material directly. Purpose, audience, approximate slide count and whether wording may be shortened help. Logos/photos are optional.

You receive separate HTML and PDF files. Keep requesting edits here; they update the same project. Project ZIP is an **optional backup/transfer**, not something you must download/unpack to keep editing here. Locally, the agent tries the default external browser. In a cloud session, download HTML and open it on your computer. Working local Live preview refreshes the tab after checked saves; otherwise refresh the locally updated HTML. After cloud edits, download the new files: downloaded copies do not synchronize with the cloud.

## Licencja / License

PL: Możesz bezpłatnie tworzyć prezentacje, także odpłatnie dla klientów, i przekazywać PDF, HTML oraz edytowalne projekty. Odsprzedaż samego skilla i jego przerobionych wersji jest zabroniona. Bezpłatne forki zachowują licencję i informacje o autorze.

EN: Create presentations for free, including paid client work, and deliver PDF, HTML and editable projects. Reselling the skill or its modified versions is prohibited. Free forks retain the license and author notices.

[Full license / Pełna licencja](LICENSE) · [EN/PL summary / Podsumowanie](LICENSING.md) · [Third-party materials / Materiały zewnętrzne](THIRD_PARTY_NOTICES.md).

## Setup / Instalacja

PL: W lokalnym projekcie Codex zachowaj cały folder w `.agents/skills/slidebaby`; publiczne wywołanie to `$slidebaby`. W hostach obsługujących przesyłanie skilli dodaj cały pakiet zgodnie z ich instalatorem. Nie przesyłaj samego SKILL.md. Paczka 1.1.0 zawiera cały skill; instrukcje instalacji są w README repozytorium.

EN: In a local Codex project, keep the complete folder at `.agents/skills/slidebaby`; `$slidebaby` is the public invocation. Hosts supporting uploaded skills should receive the complete package through their installer. Do not upload SKILL.md alone. The 1.1.0 package contains the complete skill; see the repository README for installation.

PL: Generowanie PDF wymaga istniejących Node20+, Playwright, zgodnego Chrome/Edge/Chromium i pdf-lib tam, gdzie pracuje agent. Najpierw sprawdzane są dostępne narzędzia; nic nie instaluje się automatycznie. Oglądanie samodzielnego HTML nie wymaga tych narzędzi i może działać w Safari/Firefox. Lokalny Live preview gotowego projektu potrzebuje Node; ma przycisk Zatrzymaj i wygasa po godzinie bezczynności. Link w czacie może otworzyć podgląd aplikacji — to zależy od hosta.

EN: PDF generation needs existing Node20+, Playwright, compatible Chrome/Edge/Chromium and pdf-lib where the agent runs. Available tools are checked first; nothing installs automatically. Standalone HTML viewing needs none of these tools and can use Safari/Firefox. Local live serving of a completed project needs Node, has Stop and expires after an idle hour. A chat link may open the host's preview; routing depends on that host.

PL: Zdjęcia możesz dodać później lub poprosić: „Znajdź i dodaj darmowe zdjęcie z Unsplash lub Pexels do slajdu 3 o [temat]. Zachowaj tekst i pozostałe slajdy”. Dostępność wyszukiwania zależy od narzędzi agenta.

EN: Add your photos later or ask: “Find and add a free Unsplash or Pexels photo to slide 3 about [topic]. Keep the text and other slides.” Search depends on your agent's tools.

Detailed agent procedure: [first-run.md](references/first-run.md). Viewing and optional ZIP: [DELIVERY.md](assets/templates/brite/studio/DELIVERY.md). Live setup: [LIVE_PREVIEW.md](assets/templates/brite/studio/LIVE_PREVIEW.md).
