/* Local templates and shared slide chrome. Preview content never initializes user slides. */
(()=>{
'use strict';
const base=window.BRITE_DECKS.brite;
const families=[
  {
    "id": "cover",
    "name": {
      "en": "Cover",
      "pl": "Okładka"
    },
    "description": {
      "en": "Open your presentation with a clear first impression.",
      "pl": "Zacznij prezentację od wyrazistej okładki."
    }
  },
  {
    "id": "agenda",
    "name": {
      "en": "Agenda",
      "pl": "Agenda"
    },
    "description": {
      "en": "Introduce your sections, with optional descriptions and slide references.",
      "pl": "Przedstaw sekcje, opcjonalne opisy i odwołania do slajdów."
    }
  },
  {
    "id": "split",
    "name": {
      "en": "Content",
      "pl": "Treść"
    },
    "description": {
      "en": "Explain an idea with paragraphs or numbered points, with or without a photograph.",
      "pl": "Przedstaw pomysł w akapitach lub punktach, ze zdjęciem albo bez niego."
    }
  },
  {
    "id": "cards",
    "name": {
      "en": "Feature cards",
      "pl": "Karty"
    },
    "description": {
      "en": "Present two, three, or four parallel ideas with filled or outlined cards.",
      "pl": "Pokaż dwie, trzy lub cztery równorzędne idee na kartach z wypełnieniem lub obramowaniem."
    }
  },
  {
    "id": "text",
    "name": {
      "en": "Text & lists",
      "pl": "Tekst i listy"
    },
    "description": {
      "en": "Explain your ideas without needing a photograph.",
      "pl": "Przedstaw swoje pomysły bez obowiązkowego zdjęcia."
    }
  },
  {
    "id": "divider",
    "name": {
      "en": "Section opener",
      "pl": "Początek sekcji"
    },
    "description": {
      "en": "Give the next chapter a clear starting point.",
      "pl": "Wyraźnie zaznacz początek kolejnej części prezentacji."
    }
  },
  {
    "id": "figure",
    "name": {
      "en": "Figure & caption",
      "pl": "Grafika i podpis"
    },
    "description": {
      "en": "Show a complete image, diagram, or screenshot without cropping.",
      "pl": "Pokaż całą grafikę, diagram lub zrzut ekranu bez przycinania."
    }
  },
  {
    "id": "gallery",
    "name": {
      "en": "Gallery",
      "pl": "Galeria"
    },
    "description": {
      "en": "Show one, two, or three photographs in a clean full-width composition.",
      "pl": "Pokaż jedno, dwa lub trzy zdjęcia w przejrzystym układzie na szerokość slajdu."
    }
  }
];
const layouts={
  "cover": {
    "roles": [
      "opening",
      "introduction"
    ],
    "required": [
      "title"
    ],
    "optional": [
      "description",
      "imageAlt",
      "logo",
      "section",
      "image",
      "chrome"
    ],
    "itemCounts": {},
    "image": {
      "required": false,
      "fit": "cover",
      "purpose": "optional decorative photograph"
    },
    "budgets": {
      "titleLines": 4,
      "descriptionLines": 5
    },
    "regions": {
      "titleWidth": 1015,
      "contentTop": 100,
      "contentBottom": 978
    },
    "defaultAlignment": "center"
  },
  "split": {
    "roles": [
      "explanation",
      "problem",
      "context"
    ],
    "required": [
      "title"
    ],
    "optional": [
      "paragraphs",
      "points",
      "imageAlt",
      "logo",
      "section",
      "image",
      "chrome"
    ],
    "itemCounts": {
      "paragraphs": {
        "min": 0,
        "max": 3
      },
      "points": {
        "min": 0,
        "max": 3
      }
    },
    "image": {
      "required": false,
      "fit": "cover",
      "purpose": "optional decorative photograph"
    },
    "budgets": {
      "titleLines": 4
    },
    "regions": {
      "titleWidth": 1131,
      "contentTop": 100,
      "contentBottom": 978
    },
    "defaultAlignment": "center"
  },
  "cards": {
    "roles": [
      "parallel-benefits",
      "features",
      "steps"
    ],
    "required": [
      "title",
      "cards"
    ],
    "optional": [
      "description",
      "imageAlt",
      "logo",
      "section",
      "image",
      "chrome",
      "cardNumbers",
      "cardTypography"
    ],
    "itemCounts": {
      "cards": {
        "min": 2,
        "max": 4
      }
    },
    "image": {
      "required": false,
      "fit": "cover",
      "purpose": "optional decorative photograph"
    },
    "budgets": {
      "titleLines": 4,
      "cardTitleLines": 2,
      "cardDescriptionLinesGuide": 5
    },
    "regions": {
      "titleWidth": 1389,
      "contentTop": 100,
      "contentBottom": 978
    },
    "defaultAlignment": "top",
    "capacity": {
      "mode": "measured-safe-area",
      "bodyLineCap": null,
      "equalRowHeight": true
    }
  },
  "text": {
    "roles": [
      "explanation",
      "summary",
      "list",
      "continuation"
    ],
    "required": [
      "title"
    ],
    "optional": [
      "paragraphs",
      "points",
      "logo",
      "section",
      "chrome"
    ],
    "anyOf": [
      "paragraphs",
      "points"
    ],
    "itemCounts": {
      "paragraphs": {
        "min": 0,
        "max": 3
      },
      "points": {
        "min": 0,
        "max": 5
      }
    },
    "image": {
      "required": false,
      "fit": null,
      "purpose": "none"
    },
    "budgets": {
      "titleLines": 3,
      "totalBodyLines": 12,
      "pointLines": 2
    },
    "regions": {
      "titleWidth": 1560,
      "contentTop": 100,
      "contentBottom": 978
    },
    "defaultAlignment": "top"
  },
  "divider": {
    "roles": [
      "section-break",
      "chapter-introduction"
    ],
    "required": [
      "title"
    ],
    "optional": [
      "description",
      "sectionNumber",
      "logo",
      "section",
      "image",
      "imageAlt",
      "chrome"
    ],
    "itemCounts": {},
    "image": {
      "required": false,
      "fit": "cover",
      "purpose": "optional decorative photograph"
    },
    "budgets": {
      "titleLines": 4,
      "descriptionLines": 3
    },
    "regions": {
      "titleWidth": 744,
      "contentTop": 100,
      "contentBottom": 978,
      "defaultTop": 361
    },
    "defaultAlignment": "center"
  },
  "figure": {
    "roles": [
      "diagram",
      "screenshot",
      "chart-image",
      "visual-evidence"
    ],
    "required": [
      "title",
      "image",
      "imageAlt"
    ],
    "optional": [
      "description",
      "caption",
      "logo",
      "section",
      "chrome"
    ],
    "itemCounts": {},
    "image": {
      "required": true,
      "fit": "contain",
      "purpose": "complete content figure"
    },
    "budgets": {
      "titleLines": 2,
      "descriptionLines": 4,
      "captionLines": 2
    },
    "regions": {
      "titleWidth": 1389,
      "defaultTop": 143,
      "mediaMaxWidth": 1534,
      "captionWidth": 1363,
      "contentTop": 100,
      "contentBottom": 978
    },
    "defaultAlignment": "top"
  },
  "agenda": {
    "roles": [
      "table-of-contents",
      "section-overview"
    ],
    "required": [
      "title",
      "items"
    ],
    "optional": [
      "image",
      "imageAlt",
      "logo",
      "section",
      "chrome"
    ],
    "itemCounts": {
      "items": {
        "min": 1,
        "max": 8
      }
    },
    "image": {
      "required": false,
      "fit": "cover",
      "purpose": "optional decorative photograph"
    },
    "budgets": {
      "titleLines": 1,
      "itemTitleLines": 1,
      "itemDescriptionLines": 1
    },
    "regions": {
      "titleWidth": 1320,
      "contentTop": 100,
      "contentBottom": 978,
      "defaultTop": 136
    },
    "defaultAlignment": "top"
  },
  "gallery": {
    "roles": [
      "photo-gallery",
      "visual-showcase"
    ],
    "required": [
      "images"
    ],
    "optional": [
      "logo",
      "section",
      "chrome"
    ],
    "itemCounts": {
      "images": {
        "min": 1,
        "max": 3
      }
    },
    "image": {
      "required": true,
      "collection": true,
      "fit": "cover",
      "purpose": "supplied gallery content"
    },
    "budgets": {},
    "regions": {
      "titleWidth": 0,
      "contentTop": 115,
      "contentBottom": 965
    },
    "defaultAlignment": "fixed"
  }
};
const entries=[
  {
    "id": "cover-default",
    "family": "cover",
    "source": 0,
    "name": {
      "en": "Classic cover",
      "pl": "Klasyczna okładka"
    },
    "description": {
      "en": "A bold title, a short introduction, and a photograph on the right.",
      "pl": "Wyrazisty tytuł, krótki opis i zdjęcie po prawej stronie."
    },
    "instruction": {
      "en": "Use the classic cover layout with its title, description, and image.",
      "pl": "Użyj klasycznej okładki z tytułem, opisem i zdjęciem."
    },
    "photo": true,
    "pairedTemplate": "cover-no-image"
  },
  {
    "id": "cover-no-image",
    "family": "cover",
    "source": 0,
    "name": {
      "en": "Classic cover · no photo",
      "pl": "Klasyczna okładka · bez zdjęcia"
    },
    "description": {
      "en": "Keep this arrangement with your own text and no image. Empty image space is removed.",
      "pl": "Zachowaj ten układ z własną treścią, bez obrazu i zarezerwowanego na niego miejsca."
    },
    "instruction": {
      "en": "Use this no-image variant. Do not add or inherit a photo. Keep supplied wording and let the text use its designed image-free region.",
      "pl": "Użyj tego wariantu bez obrazu. Nie dodawaj ani nie dziedzicz zdjęcia. Zachowaj treść i wykorzystaj przewidziany dla niej obszar bez zdjęcia."
    },
    "noImage": true,
    "pairedTemplate": "cover-default",
    "patch": {
      "image": null,
      "imageAlt": null
    }
  },
  {
    "id": "cover-four-lines",
    "family": "cover",
    "source": 0,
    "patch": {
      "title": [
        "SPEND",
        "TODAY.",
        "PLAN FOR",
        "TOMORROW."
      ],
      "overrides": {
        "title": {
          "fontSize": 112,
          "width": 780,
          "targetLines": 4
        }
      }
    },
    "name": {
      "en": "Four-line title",
      "pl": "Tytuł w czterech liniach"
    },
    "description": {
      "en": "A smaller, narrower title arranged in exactly four lines.",
      "pl": "Mniejszy, węższy tytuł ułożony dokładnie w czterech liniach."
    },
    "instruction": {
      "en": "Set the cover title to 112 px with a 780 px width and exactly four rendered lines. Keep the description below it.",
      "pl": "Ustaw tytuł okładki na 112 px i szerokość 780 px. Ułóż go dokładnie w czterech liniach. Zachowaj opis pod tytułem."
    },
    "photo": true,
    "pairedTemplate": "cover-four-lines-no-image"
  },
  {
    "id": "cover-four-lines-no-image",
    "family": "cover",
    "source": 0,
    "patch": {
      "title": [
        "SPEND",
        "TODAY.",
        "PLAN FOR",
        "TOMORROW."
      ],
      "overrides": {
        "title": {
          "fontSize": 112,
          "width": 780,
          "targetLines": 4
        }
      },
      "image": null,
      "imageAlt": null
    },
    "name": {
      "en": "Four-line title · no photo",
      "pl": "Tytuł w czterech liniach · bez zdjęcia"
    },
    "description": {
      "en": "Keep this arrangement with your own text and no image. Empty image space is removed.",
      "pl": "Zachowaj ten układ z własną treścią, bez obrazu i zarezerwowanego na niego miejsca."
    },
    "instruction": {
      "en": "Use this no-image variant. Do not add or inherit a photo. Keep supplied wording and let the text use its designed image-free region.",
      "pl": "Użyj tego wariantu bez obrazu. Nie dodawaj ani nie dziedzicz zdjęcia. Zachowaj treść i wykorzystaj przewidziany dla niej obszar bez zdjęcia."
    },
    "noImage": true,
    "pairedTemplate": "cover-four-lines"
  },
  {
    "id": "cover-title-only",
    "family": "cover",
    "source": 0,
    "patch": {
      "description": null
    },
    "name": {
      "en": "Title only",
      "pl": "Sam tytuł"
    },
    "description": {
      "en": "No description. The title group centers vertically on its own.",
      "pl": "Bez opisu. Tytuł automatycznie wyśrodkowuje się w pionie."
    },
    "instruction": {
      "en": "Omit the cover description and its spacing. Center the remaining title group vertically.",
      "pl": "Pomiń opis okładki i zajmowany przez niego odstęp. Wyśrodkuj pozostały tytuł w pionie."
    },
    "photo": true,
    "pairedTemplate": "cover-title-only-no-image"
  },
  {
    "id": "cover-title-only-no-image",
    "family": "cover",
    "source": 0,
    "patch": {
      "description": null,
      "image": null,
      "imageAlt": null
    },
    "name": {
      "en": "Title only · no photo",
      "pl": "Sam tytuł · bez zdjęcia"
    },
    "description": {
      "en": "Keep this arrangement with your own text and no image. Empty image space is removed.",
      "pl": "Zachowaj ten układ z własną treścią, bez obrazu i zarezerwowanego na niego miejsca."
    },
    "instruction": {
      "en": "Use this no-image variant. Do not add or inherit a photo. Keep supplied wording and let the text use its designed image-free region.",
      "pl": "Użyj tego wariantu bez obrazu. Nie dodawaj ani nie dziedzicz zdjęcia. Zachowaj treść i wykorzystaj przewidziany dla niej obszar bez zdjęcia."
    },
    "noImage": true,
    "pairedTemplate": "cover-title-only"
  },
  {
    "id": "cover-lowered",
    "family": "cover",
    "source": 0,
    "patch": {
      "overrides": {
        "group": {
          "verticalAlign": "center",
          "offsetY": 60
        }
      }
    },
    "name": {
      "en": "Lower title group",
      "pl": "Tytuł i opis niżej"
    },
    "description": {
      "en": "Move the title and description down together, keeping their spacing.",
      "pl": "Przesuń tytuł i opis razem w dół, zachowując odstęp między nimi."
    },
    "instruction": {
      "en": "Center the title-and-description group, then apply a 60 px downward offset. Retain that position during later text edits.",
      "pl": "Wyśrodkuj grupę tytułu i opisu, a następnie przesuń ją o 60 px w dół. Zachowaj tę pozycję przy późniejszych zmianach tekstu."
    },
    "photo": true,
    "pairedTemplate": "cover-lowered-no-image"
  },
  {
    "id": "cover-lowered-no-image",
    "family": "cover",
    "source": 0,
    "patch": {
      "overrides": {
        "group": {
          "verticalAlign": "center",
          "offsetY": 60
        }
      },
      "image": null,
      "imageAlt": null
    },
    "name": {
      "en": "Lower title group · no photo",
      "pl": "Tytuł i opis niżej · bez zdjęcia"
    },
    "description": {
      "en": "Keep this arrangement with your own text and no image. Empty image space is removed.",
      "pl": "Zachowaj ten układ z własną treścią, bez obrazu i zarezerwowanego na niego miejsca."
    },
    "instruction": {
      "en": "Use this no-image variant. Do not add or inherit a photo. Keep supplied wording and let the text use its designed image-free region.",
      "pl": "Użyj tego wariantu bez obrazu. Nie dodawaj ani nie dziedzicz zdjęcia. Zachowaj treść i wykorzystaj przewidziany dla niej obszar bez zdjęcia."
    },
    "noImage": true,
    "pairedTemplate": "cover-lowered"
  },
  {
    "id": "agenda-default",
    "family": "agenda",
    "photo": true,
    "pairedTemplate": "agenda-no-image",
    "example": {
      "layout": "agenda",
      "title": "AGENDA",
      "image": "assets/figma/agenda-photo.webp",
      "imageAlt": "Hands using a banking application on a smartphone.",
      "items": [
        {
          "title": "The problem",
          "description": "Why your balance doesn’t tell the whole story.",
          "page": 3
        },
        {
          "title": "The solution",
          "description": "A clear view of what you can spend.",
          "page": 4
        },
        {
          "title": "Everyday banking",
          "description": "Your accounts and activity, together.",
          "page": 5
        },
        {
          "title": "Spending insights",
          "description": "Understand where your money goes.",
          "page": 6
        },
        {
          "title": "Savings goals",
          "description": "Why your balance doesn’t tell the whole story.",
          "page": 7
        },
        {
          "title": "Payments and transfers",
          "description": "A clear view of what you can spend.",
          "page": 8
        },
        {
          "title": "Security and control",
          "description": "Your accounts and activity, together.",
          "page": 9
        },
        {
          "title": "What’s next",
          "description": "Understand where your money goes.",
          "page": 10
        }
      ]
    },
    "name": {
      "en": "Agenda · photo",
      "pl": "Agenda · zdjęcie"
    },
    "description": {
      "en": "The Figma agenda: two columns of sections and optional slide references, with a side photograph.",
      "pl": "Agenda z Figmy: dwie kolumny sekcji i opcjonalne odwołania do slajdów, ze zdjęciem z boku."
    },
    "instruction": {
      "en": "Use the Figma agenda with one to eight supplied items in column reading order. Include descriptions and page references only when supplied. Prefer target slide IDs for references that update after reordering. Use the supplied photo.",
      "pl": "Użyj agendy z Figmy z jedną do ośmiu podanych pozycji, w kolejności czytania kolumn. Dodaj opisy i odwołania tylko wtedy, gdy je podam. Preferuj identyfikatory slajdów docelowych, aby numery aktualizowały się po zmianie kolejności. Użyj wskazanego zdjęcia."
    }
  },
  {
    "id": "agenda-no-image",
    "family": "agenda",
    "photo": false,
    "pairedTemplate": "agenda-default",
    "example": {
      "layout": "agenda",
      "title": "AGENDA",
      "image": "assets/figma/agenda-photo.webp",
      "imageAlt": "Hands using a banking application on a smartphone.",
      "items": [
        {
          "title": "The problem",
          "description": "Why your balance doesn’t tell the whole story.",
          "page": 3
        },
        {
          "title": "The solution",
          "description": "A clear view of what you can spend.",
          "page": 4
        },
        {
          "title": "Everyday banking",
          "description": "Your accounts and activity, together.",
          "page": 5
        },
        {
          "title": "Spending insights",
          "description": "Understand where your money goes.",
          "page": 6
        },
        {
          "title": "Savings goals",
          "description": "Why your balance doesn’t tell the whole story.",
          "page": 7
        },
        {
          "title": "Payments and transfers",
          "description": "A clear view of what you can spend.",
          "page": 8
        },
        {
          "title": "Security and control",
          "description": "Your accounts and activity, together.",
          "page": 9
        },
        {
          "title": "What’s next",
          "description": "Understand where your money goes.",
          "page": 10
        }
      ]
    },
    "name": {
      "en": "Agenda · no photo",
      "pl": "Agenda · bez zdjęcia"
    },
    "description": {
      "en": "The same two-column agenda expanded across the slide, without a photo.",
      "pl": "Ta sama agenda w dwóch kolumnach, poszerzona na slajdzie i bez zdjęcia."
    },
    "instruction": {
      "en": "Use the image-free agenda. Keep the supplied items in column reading order, expand the text columns, and do not add a photograph. Optional descriptions/page references may be omitted.",
      "pl": "Użyj agendy bez zdjęcia. Zachowaj kolejność pozycji w kolumnach, poszerz obszar tekstu i nie dodawaj obrazu. Opcjonalne opisy i odwołania mogą być pominięte."
    },
    "noImage": true,
    "patch": {
      "image": null,
      "imageAlt": null
    }
  },
  {
    "id": "split-default",
    "family": "split",
    "source": 1,
    "name": {
      "en": "Text, list, and image",
      "pl": "Tekst, lista i zdjęcie"
    },
    "description": {
      "en": "Explain a problem or idea with paragraphs, three points, and a side image.",
      "pl": "Przedstaw problem lub pomysł za pomocą akapitów, trzech punktów i zdjęcia z boku."
    },
    "instruction": {
      "en": "Use the text-and-image layout: title and paragraphs on the left, three numbered points below, and the image on the right.",
      "pl": "Użyj układu tekstu ze zdjęciem: tytuł i akapity po lewej, pod nimi trzy numerowane punkty, a po prawej zdjęcie."
    },
    "photo": true,
    "pairedTemplate": "split-no-image"
  },
  {
    "id": "split-no-image",
    "family": "split",
    "source": 1,
    "name": {
      "en": "Text and numbered list · no photo",
      "pl": "Tekst i lista numerowana · bez zdjęcia"
    },
    "description": {
      "en": "Keep this arrangement with your own text and no image. Empty image space is removed.",
      "pl": "Zachowaj ten układ z własną treścią, bez obrazu i zarezerwowanego na niego miejsca."
    },
    "instruction": {
      "en": "Use this no-image variant. Do not add or inherit a photo. Keep supplied wording and let the text use its designed image-free region.",
      "pl": "Użyj tego wariantu bez obrazu. Nie dodawaj ani nie dziedzicz zdjęcia. Zachowaj treść i wykorzystaj przewidziany dla niej obszar bez zdjęcia."
    },
    "noImage": true,
    "pairedTemplate": "split-default",
    "patch": {
      "image": null,
      "imageAlt": null
    }
  },
  {
    "id": "cards-default",
    "family": "cards",
    "source": 2,
    "name": {
      "en": "Three cards with introduction",
      "pl": "Trzy karty ze wstępem"
    },
    "description": {
      "en": "Introduce an idea, then show three features, benefits, or steps.",
      "pl": "Wprowadź temat, a następnie pokaż trzy funkcje, korzyści lub kroki."
    },
    "instruction": {
      "en": "Use three cards below a centered title and introduction. Each card has a short heading and description.",
      "pl": "Umieść trzy karty pod wyśrodkowanym tytułem i wstępem. Każda karta ma krótki nagłówek i opis."
    },
    "photo": true,
    "pairedTemplate": "cards-no-image",
    "cardStyle": "filled",
    "cardCount": 3,
    "patch": {
      "cards": [
        {
          "title": "Know what’s\nsafe to spend.",
          "description": "See your balance after upcoming bills and planned savings, so you can decide what to spend today."
        },
        {
          "title": "Keep bills\nin view.",
          "description": "Keep rent, subscriptions and regular payments together, with a clear view of what is due next."
        },
        {
          "title": "Make room\nfor your goals.",
          "description": "Set money aside for a trip or a rainy day, and see how much you have saved toward each goal."
        }
      ]
    }
  },
  {
    "id": "cards-no-image",
    "family": "cards",
    "source": 2,
    "name": {
      "en": "Three cards with introduction · no photo",
      "pl": "Trzy karty ze wstępem · bez zdjęcia"
    },
    "description": {
      "en": "Keep this arrangement with your own text and no image. Empty image space is removed.",
      "pl": "Zachowaj ten układ z własną treścią, bez obrazu i zarezerwowanego na niego miejsca."
    },
    "instruction": {
      "en": "Use this no-image variant. Do not add or inherit a photo. Keep supplied wording and let the text use its designed image-free region.",
      "pl": "Użyj tego wariantu bez obrazu. Nie dodawaj ani nie dziedzicz zdjęcia. Zachowaj treść i wykorzystaj przewidziany dla niej obszar bez zdjęcia."
    },
    "noImage": true,
    "pairedTemplate": "cards-default",
    "patch": {
      "image": null,
      "imageAlt": null,
      "cards": [
        {
          "title": "Know what’s\nsafe to spend.",
          "description": "See your balance after upcoming bills and planned savings, so you can decide what to spend today."
        },
        {
          "title": "Keep bills\nin view.",
          "description": "Keep rent, subscriptions and regular payments together, with a clear view of what is due next."
        },
        {
          "title": "Make room\nfor your goals.",
          "description": "Set money aside for a trip or a rainy day, and see how much you have saved toward each goal."
        }
      ]
    },
    "cardStyle": "filled",
    "cardCount": 3
  },
  {
    "id": "cards-no-description",
    "family": "cards",
    "source": 2,
    "patch": {
      "description": null,
      "cards": [
        {
          "title": "Know what’s\nsafe to spend.",
          "description": "See your balance after upcoming bills and planned savings, so you can decide what to spend today."
        },
        {
          "title": "Keep bills\nin view.",
          "description": "Keep rent, subscriptions and regular payments together, with a clear view of what is due next."
        },
        {
          "title": "Make room\nfor your goals.",
          "description": "Set money aside for a trip or a rainy day, and see how much you have saved toward each goal."
        }
      ]
    },
    "name": {
      "en": "Three cards, no introduction",
      "pl": "Trzy karty bez wstępu"
    },
    "description": {
      "en": "Remove the introduction. The card row moves up to follow the title.",
      "pl": "Bez opisu wprowadzającego. Rząd kart przesuwa się w górę, bliżej tytułu."
    },
    "instruction": {
      "en": "Omit the introduction paragraph and its empty space. Let the three-card row follow the title with the layout’s normal gap.",
      "pl": "Pomiń akapit wprowadzający i pustą przestrzeń po nim. Umieść trzy karty pod tytułem ze standardowym odstępem tego układu."
    },
    "photo": true,
    "pairedTemplate": "cards-no-description-no-image",
    "cardStyle": "filled",
    "cardCount": 3
  },
  {
    "id": "cards-no-description-no-image",
    "family": "cards",
    "source": 2,
    "patch": {
      "description": null,
      "image": null,
      "imageAlt": null,
      "cards": [
        {
          "title": "Know what’s\nsafe to spend.",
          "description": "See your balance after upcoming bills and planned savings, so you can decide what to spend today."
        },
        {
          "title": "Keep bills\nin view.",
          "description": "Keep rent, subscriptions and regular payments together, with a clear view of what is due next."
        },
        {
          "title": "Make room\nfor your goals.",
          "description": "Set money aside for a trip or a rainy day, and see how much you have saved toward each goal."
        }
      ]
    },
    "name": {
      "en": "Three cards, no introduction · no photo",
      "pl": "Trzy karty bez wstępu · bez zdjęcia"
    },
    "description": {
      "en": "Keep this arrangement with your own text and no image. Empty image space is removed.",
      "pl": "Zachowaj ten układ z własną treścią, bez obrazu i zarezerwowanego na niego miejsca."
    },
    "instruction": {
      "en": "Use this no-image variant. Do not add or inherit a photo. Keep supplied wording and let the text use its designed image-free region.",
      "pl": "Użyj tego wariantu bez obrazu. Nie dodawaj ani nie dziedzicz zdjęcia. Zachowaj treść i wykorzystaj przewidziany dla niej obszar bez zdjęcia."
    },
    "noImage": true,
    "pairedTemplate": "cards-no-description",
    "cardStyle": "filled",
    "cardCount": 3
  },
  {
    "id": "cards-filled-2",
    "family": "cards",
    "cardStyle": "filled",
    "cardCount": 2,
    "example": {
      "layout": "cards",
      "title": "Know what you can spend.",
      "description": "Brite brings your balance, upcoming bills, and savings goals into one view. See what’s available after your commitments are accounted for, without doing the maths every time.",
      "section": "THE SOLUTION",
      "cards": [
        {
          "title": "Spend with your bills covered.",
          "description": "See what is left after rent, subscriptions and other upcoming payments, so everyday purchases fit your plan."
        },
        {
          "title": "Save for something that matters.",
          "description": "Put money aside for a trip, a new laptop or a rainy day, and follow each goal in the same place."
        }
      ],
      "image": "assets/figma/cards-strip-photo.webp",
      "imageAlt": "A banking app on a smartphone held in two hands."
    },
    "name": {
      "en": "2 filled cards",
      "pl": "2 karty z wypełnieniem"
    },
    "description": {
      "en": "2 parallel blocks, a centered introduction and soft filled surfaces.",
      "pl": "2 równorzędne bloki, wyśrodkowany wstęp i karty z jasnym wypełnieniem."
    },
    "instruction": {
      "en": "Use exactly 2 supplied cards, in order, with filled styling. Do not invent extra cards or shorten supplied wording. Use my supplied photograph; ask for it if missing.",
      "pl": "Użyj dokładnie 2 moich kart w podanej kolejności, z wypełnieniem. Nie dopisuj kart ani nie skracaj podanych tekstów. Użyj mojego zdjęcia; zapytaj o nie, jeśli go brakuje."
    },
    "pairedTemplate": "cards-filled-2-no-image",
    "photo": true
  },
  {
    "id": "cards-filled-2-no-image",
    "family": "cards",
    "cardStyle": "filled",
    "cardCount": 2,
    "example": {
      "layout": "cards",
      "title": "Know what you can spend.",
      "description": "Brite brings your balance, upcoming bills, and savings goals into one view. See what’s available after your commitments are accounted for, without doing the maths every time.",
      "section": "THE SOLUTION",
      "cards": [
        {
          "title": "Spend with your bills covered.",
          "description": "See what is left after rent, subscriptions and other upcoming payments, so everyday purchases fit your plan."
        },
        {
          "title": "Save for something that matters.",
          "description": "Put money aside for a trip, a new laptop or a rainy day, and follow each goal in the same place."
        }
      ]
    },
    "name": {
      "en": "2 filled cards · no photo",
      "pl": "2 karty z wypełnieniem · bez zdjęcia"
    },
    "description": {
      "en": "2 parallel blocks, a centered introduction and soft filled surfaces. No photograph.",
      "pl": "2 równorzędne bloki, wyśrodkowany wstęp i karty z jasnym wypełnieniem. Bez zdjęcia."
    },
    "instruction": {
      "en": "Use exactly 2 supplied cards, in order, with filled styling. Do not invent extra cards or shorten supplied wording. Do not add or inherit a photograph.",
      "pl": "Użyj dokładnie 2 moich kart w podanej kolejności, z wypełnieniem. Nie dopisuj kart ani nie skracaj podanych tekstów. Nie dodawaj ani nie dziedzicz zdjęcia."
    },
    "pairedTemplate": "cards-filled-2",
    "noImage": true
  },
  {
    "id": "cards-filled-4",
    "family": "cards",
    "cardStyle": "filled",
    "cardCount": 4,
    "example": {
      "layout": "cards",
      "title": "Know what you can spend.",
      "description": "Brite brings your balance, upcoming bills, and savings goals into one view. See what’s available after your commitments are accounted for, without doing the maths every time.",
      "section": "THE SOLUTION",
      "cards": [
        {
          "title": "Available today.",
          "description": "See what is left after upcoming bills and planned savings before you make your next purchase."
        },
        {
          "title": "Bills ahead.",
          "description": "Keep rent, subscriptions and regular payments in one view, so you know what is due next."
        },
        {
          "title": "Savings goals.",
          "description": "Set a target for your next trip or a new laptop and follow the money you have put aside."
        },
        {
          "title": "Spending trends.",
          "description": "See how groceries, transport and subscriptions shape your month, and spot small costs that add up."
        }
      ],
      "image": "assets/figma/cards-strip-photo.webp",
      "imageAlt": "A banking app on a smartphone held in two hands."
    },
    "name": {
      "en": "4 filled cards",
      "pl": "4 karty z wypełnieniem"
    },
    "description": {
      "en": "4 parallel blocks, a centered introduction and soft filled surfaces.",
      "pl": "4 równorzędne bloki, wyśrodkowany wstęp i karty z jasnym wypełnieniem."
    },
    "instruction": {
      "en": "Use exactly 4 supplied cards, in order, with filled styling. Do not invent extra cards or shorten supplied wording. Use my supplied photograph; ask for it if missing. Choose this layout for short supplied headings; do not shorten source wording without permission.",
      "pl": "Użyj dokładnie 4 moich kart w podanej kolejności, z wypełnieniem. Nie dopisuj kart ani nie skracaj podanych tekstów. Użyj mojego zdjęcia; zapytaj o nie, jeśli go brakuje. Wybierz ten układ dla krótkich podanych nagłówków; nie skracaj tekstów bez zgody."
    },
    "pairedTemplate": "cards-filled-4-no-image",
    "photo": true
  },
  {
    "id": "cards-filled-4-no-image",
    "family": "cards",
    "cardStyle": "filled",
    "cardCount": 4,
    "example": {
      "layout": "cards",
      "title": "Know what you can spend.",
      "description": "Brite brings your balance, upcoming bills, and savings goals into one view. See what’s available after your commitments are accounted for, without doing the maths every time.",
      "section": "THE SOLUTION",
      "cards": [
        {
          "title": "Available today.",
          "description": "See what is left after upcoming bills and planned savings before you make your next purchase."
        },
        {
          "title": "Bills ahead.",
          "description": "Keep rent, subscriptions and regular payments in one view, so you know what is due next."
        },
        {
          "title": "Savings goals.",
          "description": "Set a target for your next trip or a new laptop and follow the money you have put aside."
        },
        {
          "title": "Spending trends.",
          "description": "See how groceries, transport and subscriptions shape your month, and spot small costs that add up."
        }
      ]
    },
    "name": {
      "en": "4 filled cards · no photo",
      "pl": "4 karty z wypełnieniem · bez zdjęcia"
    },
    "description": {
      "en": "4 parallel blocks, a centered introduction and soft filled surfaces. No photograph.",
      "pl": "4 równorzędne bloki, wyśrodkowany wstęp i karty z jasnym wypełnieniem. Bez zdjęcia."
    },
    "instruction": {
      "en": "Use exactly 4 supplied cards, in order, with filled styling. Do not invent extra cards or shorten supplied wording. Do not add or inherit a photograph. Choose this layout for short supplied headings; do not shorten source wording without permission.",
      "pl": "Użyj dokładnie 4 moich kart w podanej kolejności, z wypełnieniem. Nie dopisuj kart ani nie skracaj podanych tekstów. Nie dodawaj ani nie dziedzicz zdjęcia. Wybierz ten układ dla krótkich podanych nagłówków; nie skracaj tekstów bez zgody."
    },
    "pairedTemplate": "cards-filled-4",
    "noImage": true
  },
  {
    "id": "cards-outline-2",
    "family": "cards",
    "cardStyle": "outline",
    "cardCount": 2,
    "example": {
      "layout": "cards",
      "title": "Know what you can spend.",
      "description": "Brite brings your balance, upcoming bills, and savings goals into one view. See what’s available after your commitments are accounted for, without doing the maths every time.",
      "section": "THE SOLUTION",
      "cards": [
        {
          "title": "Spend with your bills covered.",
          "description": "See what is left after rent, subscriptions and other upcoming payments, so everyday purchases fit your plan."
        },
        {
          "title": "Save for something that matters.",
          "description": "Put money aside for a trip, a new laptop or a rainy day, and follow each goal in the same place."
        }
      ],
      "image": "assets/figma/cards-side-photo.webp",
      "imageAlt": "A banking app on a smartphone held in two hands."
    },
    "name": {
      "en": "2 outlined cards",
      "pl": "2 karty z obramowaniem"
    },
    "description": {
      "en": "2 parallel blocks, a left-aligned introduction and paper cards with a black outline.",
      "pl": "2 równorzędne bloki, wstęp wyrównany do lewej i jasne karty z czarnym obramowaniem."
    },
    "instruction": {
      "en": "Use exactly 2 supplied cards, in order, with outline styling. Do not invent extra cards or shorten supplied wording. Use my supplied photograph; ask for it if missing.",
      "pl": "Użyj dokładnie 2 moich kart w podanej kolejności, z obramowaniem. Nie dopisuj kart ani nie skracaj podanych tekstów. Użyj mojego zdjęcia; zapytaj o nie, jeśli go brakuje."
    },
    "pairedTemplate": "cards-outline-2-no-image",
    "photo": true
  },
  {
    "id": "cards-outline-2-no-image",
    "family": "cards",
    "cardStyle": "outline",
    "cardCount": 2,
    "example": {
      "layout": "cards",
      "title": "Know what you can spend.",
      "description": "Brite brings your balance, upcoming bills, and savings goals into one view. See what’s available after your commitments are accounted for, without doing the maths every time.",
      "section": "THE SOLUTION",
      "cards": [
        {
          "title": "Spend with your bills covered.",
          "description": "See what is left after rent, subscriptions and other upcoming payments, so everyday purchases fit your plan."
        },
        {
          "title": "Save for something that matters.",
          "description": "Put money aside for a trip, a new laptop or a rainy day, and follow each goal in the same place."
        }
      ]
    },
    "name": {
      "en": "2 outlined cards · no photo",
      "pl": "2 karty z obramowaniem · bez zdjęcia"
    },
    "description": {
      "en": "2 parallel blocks, a left-aligned introduction and paper cards with a black outline. No photograph.",
      "pl": "2 równorzędne bloki, wstęp wyrównany do lewej i jasne karty z czarnym obramowaniem. Bez zdjęcia."
    },
    "instruction": {
      "en": "Use exactly 2 supplied cards, in order, with outline styling. Do not invent extra cards or shorten supplied wording. Do not add or inherit a photograph.",
      "pl": "Użyj dokładnie 2 moich kart w podanej kolejności, z obramowaniem. Nie dopisuj kart ani nie skracaj podanych tekstów. Nie dodawaj ani nie dziedzicz zdjęcia."
    },
    "pairedTemplate": "cards-outline-2",
    "noImage": true
  },
  {
    "id": "cards-outline-3",
    "family": "cards",
    "cardStyle": "outline",
    "cardCount": 3,
    "example": {
      "layout": "cards",
      "title": "Know what you can spend.",
      "description": "Brite brings your balance, upcoming bills, and savings goals into one view. See what’s available after your commitments are accounted for, without doing the maths every time.",
      "section": "THE SOLUTION",
      "cards": [
        {
          "title": "Know what’s\nsafe to spend.",
          "description": "See your balance after upcoming bills and planned savings, so you can decide what to spend today."
        },
        {
          "title": "Keep bills\nin view.",
          "description": "Keep rent, subscriptions and regular payments together, with a clear view of what is due next."
        },
        {
          "title": "Make room\nfor your goals.",
          "description": "Set money aside for a trip or a rainy day, and see how much you have saved toward each goal."
        }
      ],
      "image": "assets/figma/cards-side-photo.webp",
      "imageAlt": "A banking app on a smartphone held in two hands."
    },
    "name": {
      "en": "3 outlined cards",
      "pl": "3 karty z obramowaniem"
    },
    "description": {
      "en": "3 parallel blocks, a left-aligned introduction and paper cards with a black outline.",
      "pl": "3 równorzędne bloki, wstęp wyrównany do lewej i jasne karty z czarnym obramowaniem."
    },
    "instruction": {
      "en": "Use exactly 3 supplied cards, in order, with outline styling. Do not invent extra cards or shorten supplied wording. Use my supplied photograph; ask for it if missing.",
      "pl": "Użyj dokładnie 3 moich kart w podanej kolejności, z obramowaniem. Nie dopisuj kart ani nie skracaj podanych tekstów. Użyj mojego zdjęcia; zapytaj o nie, jeśli go brakuje."
    },
    "pairedTemplate": "cards-outline-3-no-image",
    "photo": true
  },
  {
    "id": "cards-outline-3-no-image",
    "family": "cards",
    "cardStyle": "outline",
    "cardCount": 3,
    "example": {
      "layout": "cards",
      "title": "Know what you can spend.",
      "description": "Brite brings your balance, upcoming bills, and savings goals into one view. See what’s available after your commitments are accounted for, without doing the maths every time.",
      "section": "THE SOLUTION",
      "cards": [
        {
          "title": "Know what’s\nsafe to spend.",
          "description": "See your balance after upcoming bills and planned savings, so you can decide what to spend today."
        },
        {
          "title": "Keep bills\nin view.",
          "description": "Keep rent, subscriptions and regular payments together, with a clear view of what is due next."
        },
        {
          "title": "Make room\nfor your goals.",
          "description": "Set money aside for a trip or a rainy day, and see how much you have saved toward each goal."
        }
      ]
    },
    "name": {
      "en": "3 outlined cards · no photo",
      "pl": "3 karty z obramowaniem · bez zdjęcia"
    },
    "description": {
      "en": "3 parallel blocks, a left-aligned introduction and paper cards with a black outline. No photograph.",
      "pl": "3 równorzędne bloki, wstęp wyrównany do lewej i jasne karty z czarnym obramowaniem. Bez zdjęcia."
    },
    "instruction": {
      "en": "Use exactly 3 supplied cards, in order, with outline styling. Do not invent extra cards or shorten supplied wording. Do not add or inherit a photograph.",
      "pl": "Użyj dokładnie 3 moich kart w podanej kolejności, z obramowaniem. Nie dopisuj kart ani nie skracaj podanych tekstów. Nie dodawaj ani nie dziedzicz zdjęcia."
    },
    "pairedTemplate": "cards-outline-3",
    "noImage": true
  },
  {
    "id": "cards-outline-4",
    "family": "cards",
    "cardStyle": "outline",
    "cardCount": 4,
    "example": {
      "layout": "cards",
      "title": "Know what you can spend.",
      "description": "Brite brings your balance, upcoming bills, and savings goals into one view. See what’s available after your commitments are accounted for, without doing the maths every time.",
      "section": "THE SOLUTION",
      "cards": [
        {
          "title": "Available today.",
          "description": "See what is left after upcoming bills and planned savings before you make your next purchase."
        },
        {
          "title": "Bills ahead.",
          "description": "Keep rent, subscriptions and regular payments in one view, so you know what is due next."
        },
        {
          "title": "Savings goals.",
          "description": "Set a target for your next trip or a new laptop and follow the money you have put aside."
        },
        {
          "title": "Spending trends.",
          "description": "See how groceries, transport and subscriptions shape your month, and spot small costs that add up."
        }
      ],
      "image": "assets/figma/cards-side-photo.webp",
      "imageAlt": "A banking app on a smartphone held in two hands."
    },
    "name": {
      "en": "4 outlined cards",
      "pl": "4 karty z obramowaniem"
    },
    "description": {
      "en": "4 parallel blocks, a left-aligned introduction and paper cards with a black outline.",
      "pl": "4 równorzędne bloki, wstęp wyrównany do lewej i jasne karty z czarnym obramowaniem."
    },
    "instruction": {
      "en": "Use exactly 4 supplied cards, in order, with outline styling. Do not invent extra cards or shorten supplied wording. Use my supplied photograph; ask for it if missing. Choose this layout for short supplied headings; do not shorten source wording without permission.",
      "pl": "Użyj dokładnie 4 moich kart w podanej kolejności, z obramowaniem. Nie dopisuj kart ani nie skracaj podanych tekstów. Użyj mojego zdjęcia; zapytaj o nie, jeśli go brakuje. Wybierz ten układ dla krótkich podanych nagłówków; nie skracaj tekstów bez zgody."
    },
    "pairedTemplate": "cards-outline-4-no-image",
    "photo": true
  },
  {
    "id": "cards-outline-4-no-image",
    "family": "cards",
    "cardStyle": "outline",
    "cardCount": 4,
    "example": {
      "layout": "cards",
      "title": "Know what you can spend.",
      "description": "Brite brings your balance, upcoming bills, and savings goals into one view. See what’s available after your commitments are accounted for, without doing the maths every time.",
      "section": "THE SOLUTION",
      "cards": [
        {
          "title": "Available today.",
          "description": "See what is left after upcoming bills and planned savings before you make your next purchase."
        },
        {
          "title": "Bills ahead.",
          "description": "Keep rent, subscriptions and regular payments in one view, so you know what is due next."
        },
        {
          "title": "Savings goals.",
          "description": "Set a target for your next trip or a new laptop and follow the money you have put aside."
        },
        {
          "title": "Spending trends.",
          "description": "See how groceries, transport and subscriptions shape your month, and spot small costs that add up."
        }
      ]
    },
    "name": {
      "en": "4 outlined cards · no photo",
      "pl": "4 karty z obramowaniem · bez zdjęcia"
    },
    "description": {
      "en": "4 parallel blocks, a left-aligned introduction and paper cards with a black outline. No photograph.",
      "pl": "4 równorzędne bloki, wstęp wyrównany do lewej i jasne karty z czarnym obramowaniem. Bez zdjęcia."
    },
    "instruction": {
      "en": "Use exactly 4 supplied cards, in order, with outline styling. Do not invent extra cards or shorten supplied wording. Do not add or inherit a photograph. Choose this layout for short supplied headings; do not shorten source wording without permission.",
      "pl": "Użyj dokładnie 4 moich kart w podanej kolejności, z obramowaniem. Nie dopisuj kart ani nie skracaj podanych tekstów. Nie dodawaj ani nie dziedzicz zdjęcia. Wybierz ten układ dla krótkich podanych nagłówków; nie skracaj tekstów bez zgody."
    },
    "pairedTemplate": "cards-outline-4",
    "noImage": true
  },
  {
    "id": "cards-without-numbers",
    "family": "cards",
    "cardStyle": "outline",
    "cardCount": 3,
    "example": {
      "layout": "cards",
      "title": "Know what you can spend.",
      "description": "Brite brings your balance, upcoming bills, and savings goals into one view. See what’s available after your commitments are accounted for, without doing the maths every time.",
      "section": "THE SOLUTION",
      "cards": [
        {
          "title": "Know what’s\nsafe to spend.",
          "description": "See your balance after upcoming bills and planned savings, so you can decide what to spend today."
        },
        {
          "title": "Keep bills\nin view.",
          "description": "Keep rent, subscriptions and regular payments together, with a clear view of what is due next."
        },
        {
          "title": "Make room\nfor your goals.",
          "description": "Set money aside for a trip or a rainy day, and see how much you have saved toward each goal."
        }
      ],
      "cardNumbers": false
    },
    "name": {
      "en": "Cards without numbers",
      "pl": "Karty bez numerków"
    },
    "description": {
      "en": "One example of hidden badges. You can turn numbers off in every card layout.",
      "pl": "Przykład bez plakietek. Numerki możesz wyłączyć w każdym układzie kart."
    },
    "instruction": {
      "en": "Use exactly 3 supplied cards, in order, with outline styling. Do not invent extra cards or shorten supplied wording. Do not add or inherit a photograph.  Hide the card badges in this example.",
      "pl": "Użyj dokładnie 3 moich kart w podanej kolejności, z obramowaniem. Nie dopisuj kart ani nie skracaj podanych tekstów. Nie dodawaj ani nie dziedzicz zdjęcia.  W tym przykładzie pomiń numerki kart."
    },
    "pairedTemplate": "cards-outline-3",
    "noImage": true,
    "patch": {
      "cardNumbers": false
    }
  },
  {
    "id": "text-default",
    "family": "text",
    "example": {
      "layout": "text",
      "title": "MAKE ROOM FOR WHAT MATTERS.",
      "paragraphs": [
        "A clear plan connects everyday decisions with a bigger goal. Start with the essentials, explain what changes, and make the next step easy to understand."
      ],
      "points": [
        "Give every section one clear purpose.",
        "Keep useful detail close to the main idea.",
        "End with a practical next step."
      ]
    },
    "name": {
      "en": "Text and list",
      "pl": "Tekst i lista"
    },
    "description": {
      "en": "A title with paragraphs, bullet points, or both. No image required.",
      "pl": "Tytuł z akapitami, punktami lub jednym i drugim. Bez obowiązkowego zdjęcia."
    },
    "instruction": {
      "en": "Use the text layout with the supplied paragraphs and/or bullet points. Do not add a photograph. Omit unused blocks and preserve the wording.",
      "pl": "Użyj układu tekstowego z podanymi akapitami i/lub punktami. Nie dodawaj zdjęcia. Pomiń niepotrzebne bloki i zachowaj treść."
    }
  },
  {
    "id": "divider-default",
    "family": "divider",
    "example": {
      "layout": "divider",
      "title": [
        "THE NEXT",
        "CHAPTER."
      ],
      "description": "A clear transition from the current situation to the work ahead.",
      "section": "What’s next?"
    },
    "name": {
      "en": "Section opener · no photo",
      "pl": "Początek sekcji · bez zdjęcia"
    },
    "description": {
      "en": "The revised Figma layout: a left-aligned title and introduction, vertically centered.",
      "pl": "Poprawiony układ z Figmy: tytuł i opis po lewej, wyśrodkowane w pionie."
    },
    "instruction": {
      "en": "Use the revised Figma section opener without a photograph. Keep the title group left-aligned and vertically centered. Include only supplied optional content.",
      "pl": "Użyj poprawionego slajdu otwierającego sekcję bez zdjęcia. Zachowaj wyrównanie grupy do lewej i wyśrodkowanie w pionie. Dodaj tylko podane elementy opcjonalne."
    },
    "noImage": true,
    "pairedTemplate": "divider-image"
  },
  {
    "id": "divider-image",
    "family": "divider",
    "photo": true,
    "pairedTemplate": "divider-default",
    "example": {
      "layout": "divider",
      "title": [
        "THE NEXT",
        "CHAPTER."
      ],
      "description": "A clear transition from the current situation to the work ahead.",
      "section": "What’s next?",
      "image": "assets/figma/section-photo.webp",
      "imageAlt": "An open book, a mug, and a laptop on a desk."
    },
    "name": {
      "en": "Section opener · photo",
      "pl": "Początek sekcji · zdjęcie"
    },
    "description": {
      "en": "The revised Figma title group beside a vertically centered photograph.",
      "pl": "Poprawiony układ z Figmy: grupa tytułu obok zdjęcia wyśrodkowanego w pionie."
    },
    "instruction": {
      "en": "Use the revised Figma section opener with the supplied photograph in the right-hand frame. Center the image on the whole slide.",
      "pl": "Użyj poprawionego początku sekcji ze wskazanym zdjęciem w prawej ramce. Wyśrodkuj obraz względem całego slajdu."
    }
  },
  {
    "id": "figure-default",
    "family": "figure",
    "example": {
      "layout": "figure",
      "title": "See how your money moves.",
      "description": "Explore spending patterns, cash flow and progress toward your next savings goal.",
      "image": "assets/examples/figure-charts.webp",
      "imageAlt": "Three illustrative area and point charts, shown together without cropping.",
      "caption": "Illustrative charts only. Replace them with your own data or screenshot."
    },
    "name": {
      "en": "Centered figure",
      "pl": "Grafika wyśrodkowana"
    },
    "description": {
      "en": "A centered title, optional description and borderless figure with a caption.",
      "pl": "Wyśrodkowany tytuł, opcjonalny opis i grafika bez ramki z podpisem."
    },
    "instruction": {
      "en": "Use the supplied image as a complete content figure with contain fitting, preserving its aspect ratio without cropping. Add a meaningful image description and include a caption only when supplied. Center the title and optional description. Keep the borderless image and optional caption together, vertically centered between the introduction and footer. Omitted fields leave no empty gap. Do not reuse the sample illustration.",
      "pl": "Pokaż podany obraz w całości, zachowując proporcje i bez przycinania (contain). Dodaj opis obrazu i podpis tylko wtedy, gdy go podam. Wyśrodkuj tytuł i opcjonalny opis. Grafikę bez ramki i opcjonalny podpis traktuj jako grupę wyśrodkowaną w pionie między nagłówkiem a stopką. Brak opcjonalnego pola usuwa jego odstęp. Nie używaj ilustracji z przykładu."
    },
    "photo": true,
    "pairedTemplate": "figure-no-image"
  },
  {
    "id": "figure-no-image",
    "family": "figure",
    "example": {
      "layout": "figure",
      "title": "Plan for your next goal.",
      "caption": "Account for upcoming bills, choose a realistic savings amount, and review what remains for everyday spending."
    },
    "name": {
      "en": "Text alternative · no image",
      "pl": "Wersja tekstowa · bez obrazu"
    },
    "description": {
      "en": "A title and supplied explanatory text, with no figure. Never removes a source visual automatically.",
      "pl": "Tytuł i podany tekst objaśniający, bez grafiki. Nie usuwa automatycznie wizualizacji ze źródła."
    },
    "instruction": {
      "en": "Use this no-image variant. Do not add or inherit a photo. Keep supplied wording and let the text use its designed image-free region.",
      "pl": "Użyj tego wariantu bez obrazu. Nie dodawaj ani nie dziedzicz zdjęcia. Zachowaj treść i wykorzystaj przewidziany dla niej obszar bez zdjęcia."
    },
    "noImage": true,
    "pairedTemplate": "figure-default",
    "patch": {
      "image": null,
      "imageAlt": null
    }
  },
  {
    "id": "gallery-1",
    "family": "gallery",
    "imageCount": 1,
    "example": {
      "layout": "gallery",
      "section": "Gallery",
      "images": [
        {
          "src": "assets/gallery/atlantic-money-desk.webp",
          "alt": "A person using a banking app at a desk."
        }
      ]
    },
    "name": {
      "en": "One photograph",
      "pl": "Jedno zdjęcie"
    },
    "description": {
      "en": "One photograph in an 850 px-high image strip, centered vertically on the slide.",
      "pl": "Jedno zdjęcie w pasie o wysokości 850 px, wyśrodkowanym w pionie na slajdzie."
    },
    "instruction": {
      "en": "Use exactly 1 supplied photographs in their supplied order. Keep a full-width strip at y115, height 850, with 50 px gaps between images. Preserve aspect ratios; use centered cover cropping for photos and contain for complete screenshots or diagrams. Ask for missing photos. Never reuse the preview images or invent captions. Do not add a body heading; the optional centered section label is controlled through shared chrome. If I supply text without any images, choose another compatible designed library template rather than an empty gallery.",
      "pl": "Użyj dokładnie 1 moich zdjęć w podanej kolejności. Zachowaj pas na pełną szerokość od y115, wysokość 850 px i odstępy 50 px między zdjęciami. Zachowaj proporcje; zdjęcia kadruj centralnie (cover), a kompletne zrzuty ekranu lub diagramy pokazuj w całości (contain). Zapytaj o brakujące zdjęcia. Nie kopiuj obrazów z podglądu ani nie wymyślaj podpisów. Nie dodawaj nagłówka w treści; opcjonalną nazwę sekcji ustaw przez wspólny nagłówek. Jeśli podam tekst bez żadnych zdjęć, wybierz inny pasujący, zaprojektowany szablon z biblioteki zamiast pustej galerii."
    }
  },
  {
    "id": "gallery-2",
    "family": "gallery",
    "imageCount": 2,
    "example": {
      "layout": "gallery",
      "section": "Gallery",
      "images": [
        {
          "src": "assets/gallery/atlantic-money-desk.webp",
          "alt": "A person using a banking app at a desk."
        },
        {
          "src": "assets/gallery/atlantic-money-hand.webp",
          "alt": "A person choosing a currency in a banking app."
        }
      ]
    },
    "name": {
      "en": "Two photographs",
      "pl": "Dwa zdjęcia"
    },
    "description": {
      "en": "Two photographs in an 850 px-high image strip, centered vertically on the slide.",
      "pl": "Dwa zdjęcia w pasie o wysokości 850 px, wyśrodkowanym w pionie na slajdzie."
    },
    "instruction": {
      "en": "Use exactly 2 supplied photographs in their supplied order. Keep a full-width strip at y115, height 850, with 50 px gaps between images. Preserve aspect ratios; use centered cover cropping for photos and contain for complete screenshots or diagrams. Ask for missing photos. Never reuse the preview images or invent captions. Do not add a body heading; the optional centered section label is controlled through shared chrome. If I supply text without any images, choose another compatible designed library template rather than an empty gallery.",
      "pl": "Użyj dokładnie 2 moich zdjęć w podanej kolejności. Zachowaj pas na pełną szerokość od y115, wysokość 850 px i odstępy 50 px między zdjęciami. Zachowaj proporcje; zdjęcia kadruj centralnie (cover), a kompletne zrzuty ekranu lub diagramy pokazuj w całości (contain). Zapytaj o brakujące zdjęcia. Nie kopiuj obrazów z podglądu ani nie wymyślaj podpisów. Nie dodawaj nagłówka w treści; opcjonalną nazwę sekcji ustaw przez wspólny nagłówek. Jeśli podam tekst bez żadnych zdjęć, wybierz inny pasujący, zaprojektowany szablon z biblioteki zamiast pustej galerii."
    }
  },
  {
    "id": "gallery-3",
    "family": "gallery",
    "imageCount": 3,
    "example": {
      "layout": "gallery",
      "section": "Gallery",
      "images": [
        {
          "src": "assets/gallery/atlantic-money-desk.webp",
          "alt": "A person using a banking app at a desk."
        },
        {
          "src": "assets/gallery/atlantic-money-hand.webp",
          "alt": "A person choosing a currency in a banking app."
        },
        {
          "src": "assets/figma/agenda-photo.webp",
          "alt": "The banking photograph used in the agenda example."
        }
      ]
    },
    "name": {
      "en": "Three photographs",
      "pl": "Trzy zdjęcia"
    },
    "description": {
      "en": "Three photographs in an 850 px-high image strip, centered vertically on the slide.",
      "pl": "Trzy zdjęcia w pasie o wysokości 850 px, wyśrodkowanym w pionie na slajdzie."
    },
    "instruction": {
      "en": "Use exactly 3 supplied photographs in their supplied order. Keep a full-width strip at y115, height 850, with 50 px gaps between images. Preserve aspect ratios; use centered cover cropping for photos and contain for complete screenshots or diagrams. Ask for missing photos. Never reuse the preview images or invent captions. Do not add a body heading; the optional centered section label is controlled through shared chrome. If I supply text without any images, choose another compatible designed library template rather than an empty gallery.",
      "pl": "Użyj dokładnie 3 moich zdjęć w podanej kolejności. Zachowaj pas na pełną szerokość od y115, wysokość 850 px i odstępy 50 px między zdjęciami. Zachowaj proporcje; zdjęcia kadruj centralnie (cover), a kompletne zrzuty ekranu lub diagramy pokazuj w całości (contain). Zapytaj o brakujące zdjęcia. Nie kopiuj obrazów z podglądu ani nie wymyślaj podpisów. Nie dodawaj nagłówka w treści; opcjonalną nazwę sekcji ustaw przez wspólny nagłówek. Jeśli podam tekst bez żadnych zdjęć, wybierz inny pasujący, zaprojektowany szablon z biblioteki zamiast pustej galerii."
    }
  }
];
const hasText=value=>typeof value==='string'&&value.trim().length>0;
const validBackground=value=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).every(k=>['src','alt'].includes(k))&&hasText(value.src)&&hasText(value.alt);
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
function merge(target,patch){for(const[key,value]of Object.entries(patch)){if(['__proto__','constructor','prototype'].includes(key))throw new Error('Unsupported property');if(value&&typeof value==='object'&&!Array.isArray(value)){if(!target[key]||typeof target[key]!=='object'||Array.isArray(target[key]))target[key]={};merge(target[key],value);}else target[key]=structuredClone(value);}return target;}
function get(id){const entry=entries.find(item=>item.id===id);if(!entry)throw new Error(`Unknown template: ${id}`);return entry;}
const chromeContract={inheritance:'deck defaults, then slide overrides; null hides all',fields:{brand:'null | {kind:"image",src,alt?} | {kind:"text",text}',section:'text|null',footerLeft:'text|null',pageNumbers:'boolean',footerRight:'text|null'},budgets:{brandLines:1,sectionLines:1,footerLines:1},positions:{brand:[40,32],section:[960,34],footerLeft:[40,1022],pageNumbers:[960,1022],footerRight:[1880,1022]}};
function validateChrome(value){
 const out=[],error=message=>out.push({field:'chrome',message});
 if(value==null)return out;
 if(typeof value!=='object'||Array.isArray(value)){error('Shared header/footer settings must be an object or null.');return out;}
 for(const key of Object.keys(value))if(!Object.hasOwn(chromeContract.fields,key))error(`Unsupported shared header/footer field: ${key}.`);
 for(const key of ['section','footerLeft','footerRight'])if(value[key]!=null&&typeof value[key]!=='string')error(`Shared header/footer text must be text or null: ${key}.`);
 if(Object.hasOwn(value,'pageNumbers')&&typeof value.pageNumbers!=='boolean')error('Page numbering must be true or false.');
 if(value.brand!=null){const b=value.brand;if(typeof b!=='object'||Array.isArray(b)||!['image','text'].includes(b.kind)){error('Choose an image brand, a text brand, or null.');return out;}
  const allowed=b.kind==='image'?['kind','src','alt']:['kind','text'];if(Object.keys(b).some(key=>!allowed.includes(key))||!hasText(b.kind==='image'?b.src:b.text)||(b.alt!=null&&typeof b.alt!=='string'))error('Provide only the fields required by the selected brand type.');
 }
 return out;
}
function resolveChrome(slide,deck){
 const hidden={brand:null,section:null,footerLeft:null,pageNumbers:false,footerRight:null};
 const legacy={brand:hasText(slide.logo)?{kind:'image',src:slide.logo,alt:'Brand logo'}:null,section:slide.section??null,footerLeft:typeof deck.footer==='string'?deck.footer:null,pageNumbers:true,footerRight:deck.date??null};
 let result=deck.chrome===null?{...hidden}:{...legacy,...(deck.chrome||{})};
 // Existing per-slide aliases continue to override inherited deck fields unless chrome explicitly overrides them.
 if(deck.chrome!==null&&Object.hasOwn(slide,'logo'))result.brand=hasText(slide.logo)?{kind:'image',src:slide.logo,alt:'Brand logo'}:null;
 if(deck.chrome!==null&&Object.hasOwn(slide,'section'))result.section=slide.section;
 return slide.chrome===null?{...hidden}:{...result,...(slide.chrome||{})};
}
function contractFor(slide){
 const entry=slide.template?.id?entries.find(e=>e.id===slide.template.id):null;
 if(entry)return entry.contract;
 const c=structuredClone(layouts[slide.layout]);if(!c)return null;
 if(slide.layout==='cover'&&!hasText(slide.image))c.regions.titleWidth=1480;
 if(slide.layout==='split'&&!hasText(slide.image))c.regions.titleWidth=1560;
 return c;
}

// Figma 33:250, 34:399 and 41:781; new families reuse shared chrome.
families.push(...[
  {
    "id": "metrics",
    "name": {
      "en": "Key metrics",
      "pl": "Wskaźniki"
    },
    "description": {
      "en": "Show supplied numbers with clear labels and optional supporting detail.",
      "pl": "Pokaż podane liczby z czytelnymi etykietami i opcjonalnym opisem."
    }
  },
  {
    "id": "quote",
    "name": {
      "en": "Quotes & testimonials",
      "pl": "Cytaty i opinie"
    },
    "description": {
      "en": "Give a supplied quote space, with optional attribution and portrait.",
      "pl": "Wyeksponuj podany cytat, opcjonalnie z podpisem i portretem."
    }
  }
]);
Object.assign(layouts,{
  "metrics": {
    "roles": [
      "key-metrics",
      "results",
      "market-validation"
    ],
    "required": [
      "title",
      "metrics"
    ],
    "optional": [
      "description",
      "logo",
      "section"
    ],
    "itemCounts": {
      "metrics": {
        "min": 2,
        "max": 4
      }
    },
    "image": {
      "required": false,
      "purpose": "none"
    },
    "budgets": {
      "titleLines": 3,
      "descriptionLines": 4,
      "valueLines": 1,
      "labelLines": 2
    },
    "regions": {
      "titleWidth": 744,
      "contentTop": 100,
      "contentBottom": 978,
      "defaultTop": 177
    },
    "defaultAlignment": "top"
  },
  "quote": {
    "roles": [
      "quotation",
      "testimonial"
    ],
    "required": [
      "quote"
    ],
    "optional": [
      "author",
      "authorRole",
      "image",
      "imageAlt",
      "logo",
      "section"
    ],
    "itemCounts": {},
    "image": {
      "required": false,
      "fit": "cover",
      "purpose": "optional supplied speaker portrait"
    },
    "budgets": {
      "titleLines": 0,
      "quoteLinesGuide": 6,
      "authorLines": 2,
      "authorRoleLines": 2
    },
    "regions": {
      "titleWidth": 1479,
      "contentTop": 100,
      "contentBottom": 978
    },
    "defaultAlignment": "center"
  }
});
entries.push(...[
  {
    "id": "metrics-3",
    "family": "metrics",
    "metricCount": 3,
    "metricDetails": true,
    "metricEmphasis": false,
    "example": {
      "layout": "metrics",
      "title": "Banking that adds up.",
      "description": "A sample monthly snapshot of how people use Brite to manage spending and build savings. All figures are illustrative.",
      "section": "Key metrics",
      "metrics": [
        {
          "value": "290k",
          "label": "Active customers",
          "description": "People using Brite to manage everyday spending, upcoming bills and savings in one place."
        },
        {
          "value": "90%",
          "label": "Monthly retention",
          "description": "Customers who returned the following month to check their balance and plan their spending."
        },
        {
          "value": "£390k",
          "label": "Saved toward goals",
          "description": "Money customers set aside for holidays, emergency funds and the things that matter to them."
        }
      ]
    },
    "name": {
      "en": "Three metrics",
      "pl": "Trzy wskaźniki"
    },
    "description": {
      "en": "3 supplied values with labels and supporting descriptions.",
      "pl": "3 podane wartości z etykietami i opisami."
    },
    "instruction": {
      "en": "Use exactly 3 supplied metric values and labels. Preserve their units, qualifiers and wording. Keep supplied supporting descriptions. Never invent numbers, evidence or sample data. Optional introduction and shared header/footer may be omitted. Keep fixed designed typography and validate measured capacity; do not shrink or truncate values.",
      "pl": "Użyj dokładnie 3 podanych wartości i etykiet wskaźników. Zachowaj jednostki, zastrzeżenia i brzmienie tekstów. Zachowaj podane opisy wskaźników. Nie wymyślaj liczb, dowodów ani danych z podglądu. Wstęp i wspólne nagłówki/stopki są opcjonalne. Zachowaj zaprojektowaną typografię i sprawdź pojemność; nie zmniejszaj ani nie obcinaj wartości."
    }
  },
  {
    "id": "metrics-2-emphasis",
    "family": "metrics",
    "metricCount": 2,
    "metricDetails": true,
    "metricEmphasis": false,
    "example": {
      "layout": "metrics",
      "title": "Banking that adds up.",
      "description": "A sample monthly snapshot of how people use Brite to manage spending and build savings. All figures are illustrative.",
      "section": "Key metrics",
      "metrics": [
        {
          "value": "290k",
          "label": "Active customers",
          "description": "People using Brite to manage everyday spending, upcoming bills and savings in one place."
        },
        {
          "value": "£390k",
          "label": "Saved toward goals",
          "description": "Money customers set aside for holidays, emergency funds and the things that matter to them."
        }
      ]
    },
    "name": {
      "en": "Two metrics",
      "pl": "Dwa wskaźniki"
    },
    "description": {
      "en": "2 supplied values with labels and supporting descriptions.",
      "pl": "2 podane wartości z etykietami i opisami."
    },
    "instruction": {
      "en": "Use exactly 2 supplied metric values and labels. Preserve their units, qualifiers and wording. Keep supplied supporting descriptions. Never invent numbers, evidence or sample data. Optional introduction and shared header/footer may be omitted. Keep fixed designed typography and validate measured capacity; do not shrink or truncate values.",
      "pl": "Użyj dokładnie 2 podanych wartości i etykiet wskaźników. Zachowaj jednostki, zastrzeżenia i brzmienie tekstów. Zachowaj podane opisy wskaźników. Nie wymyślaj liczb, dowodów ani danych z podglądu. Wstęp i wspólne nagłówki/stopki są opcjonalne. Zachowaj zaprojektowaną typografię i sprawdź pojemność; nie zmniejszaj ani nie obcinaj wartości."
    }
  },
  {
    "id": "metrics-3-emphasis",
    "family": "metrics",
    "metricCount": 3,
    "metricDetails": true,
    "metricEmphasis": true,
    "example": {
      "layout": "metrics",
      "title": "Market Validation",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "section": "Key metrics",
      "metrics": [
        {
          "value": "290k",
          "label": "Total users",
          "description": "Check what’s coming up, keep your savings on track, and make everyday spending decisions with a clearer picture."
        },
        {
          "value": "90%",
          "label": "Total users",
          "description": "Check what’s coming up, keep your savings on track, and make everyday spending decisions with a clearer picture."
        },
        {
          "value": "290k",
          "label": "Total users",
          "description": "Check what’s coming up, keep your savings on track, and make everyday spending decisions with a clearer picture."
        }
      ]
    },
    "name": {
      "en": "Three metrics · emphasis",
      "pl": "Trzy wskaźniki · wyróżnienie"
    },
    "description": {
      "en": "3 supplied values with labels and supporting descriptions.",
      "pl": "3 podane wartości z etykietami i opisami."
    },
    "instruction": {
      "en": "Use exactly 3 supplied metric values and labels. Preserve their units, qualifiers and wording. Keep supplied supporting descriptions. Never invent numbers, evidence or sample data. Optional introduction and shared header/footer may be omitted. Keep fixed designed typography and validate measured capacity; do not shrink or truncate values.",
      "pl": "Użyj dokładnie 3 podanych wartości i etykiet wskaźników. Zachowaj jednostki, zastrzeżenia i brzmienie tekstów. Zachowaj podane opisy wskaźników. Nie wymyślaj liczb, dowodów ani danych z podglądu. Wstęp i wspólne nagłówki/stopki są opcjonalne. Zachowaj zaprojektowaną typografię i sprawdź pojemność; nie zmniejszaj ani nie obcinaj wartości."
    },
    "retired": true
  },
  {
    "id": "metrics-4",
    "family": "metrics",
    "metricCount": 4,
    "metricDetails": true,
    "metricEmphasis": false,
    "example": {
      "layout": "metrics",
      "title": "Banking that adds up.",
      "description": "A sample monthly snapshot of how people use Brite to manage spending and build savings. All figures are illustrative.",
      "section": "Key metrics",
      "metrics": [
        {
          "value": "290k",
          "label": "Active customers",
          "description": "People using Brite to manage everyday spending, upcoming bills and savings in one place."
        },
        {
          "value": "90%",
          "label": "Monthly retention",
          "description": "Customers who returned the following month to check their balance and plan their spending."
        },
        {
          "value": "£390k",
          "label": "Saved toward goals",
          "description": "Money customers set aside for holidays, emergency funds and the things that matter to them."
        },
        {
          "value": "4.8/5",
          "label": "App store rating",
          "description": "An example of how customer feedback can sit alongside adoption and savings metrics."
        }
      ]
    },
    "name": {
      "en": "Four metrics",
      "pl": "Cztery wskaźniki"
    },
    "description": {
      "en": "4 supplied values with labels and supporting descriptions.",
      "pl": "4 podane wartości z etykietami i opisami."
    },
    "instruction": {
      "en": "Use exactly 4 supplied metric values and labels. Preserve their units, qualifiers and wording. Keep supplied supporting descriptions. Never invent numbers, evidence or sample data. Optional introduction and shared header/footer may be omitted. Keep fixed designed typography and validate measured capacity; do not shrink or truncate values.",
      "pl": "Użyj dokładnie 4 podanych wartości i etykiet wskaźników. Zachowaj jednostki, zastrzeżenia i brzmienie tekstów. Zachowaj podane opisy wskaźników. Nie wymyślaj liczb, dowodów ani danych z podglądu. Wstęp i wspólne nagłówki/stopki są opcjonalne. Zachowaj zaprojektowaną typografię i sprawdź pojemność; nie zmniejszaj ani nie obcinaj wartości."
    }
  },
  {
    "id": "metrics-4-no-details",
    "family": "metrics",
    "metricCount": 4,
    "metricDetails": false,
    "metricEmphasis": false,
    "example": {
      "layout": "metrics",
      "title": "Banking that adds up.",
      "description": "A sample monthly snapshot of how people use Brite to manage spending and build savings. All figures are illustrative.",
      "section": "Key metrics",
      "metrics": [
        {
          "value": "290k",
          "label": "Active customers"
        },
        {
          "value": "90%",
          "label": "Monthly retention"
        },
        {
          "value": "£390k",
          "label": "Saved toward goals"
        },
        {
          "value": "4.8/5",
          "label": "App store rating"
        }
      ]
    },
    "name": {
      "en": "Four metrics · labels only",
      "pl": "Cztery wskaźniki · same etykiety"
    },
    "description": {
      "en": "4 supplied values with labels, without supporting descriptions.",
      "pl": "4 podane wartości z etykietami, bez dodatkowych opisów."
    },
    "instruction": {
      "en": "Use exactly 4 supplied metric values and labels. Preserve their units, qualifiers and wording. This variant has no per-metric descriptions; choose a detailed variant if the source contains them. Never invent numbers, evidence or sample data. Optional introduction and shared header/footer may be omitted. Keep fixed designed typography and validate measured capacity; do not shrink or truncate values.",
      "pl": "Użyj dokładnie 4 podanych wartości i etykiet wskaźników. Zachowaj jednostki, zastrzeżenia i brzmienie tekstów. Ten wariant nie ma opisów wskaźników; jeśli występują w źródle, wybierz wariant z opisami. Nie wymyślaj liczb, dowodów ani danych z podglądu. Wstęp i wspólne nagłówki/stopki są opcjonalne. Zachowaj zaprojektowaną typografię i sprawdź pojemność; nie zmniejszaj ani nie obcinaj wartości."
    }
  },
  {
    "id": "quote-avatar",
    "family": "quote",
    "quoteStyle": "avatar",
    "photo": true,
    "noImage": false,
    "pairedTemplate": "quote-centered",
    "example": {
      "layout": "quote",
      "quote": "“I can see what’s left after bills and savings. Now I can say yes to a weekend away without guessing what I can afford.”",
      "author": "Example Brite customer",
      "authorRole": "Illustrative testimonial",
      "section": "Customer perspective",
      "image": "assets/figma/quote-portrait.webp",
      "imageAlt": "Portrait of the speaker in the supplied design example."
    },
    "name": {
      "en": "Quote with avatar",
      "pl": "Cytat z awatarem"
    },
    "description": {
      "en": "A centered quote with a circular speaker portrait.",
      "pl": "Wyśrodkowany cytat z okrągłym portretem autora."
    },
    "instruction": {
      "en": "Use the exact quote supplied by the user. Add attribution and role only when supplied; never invent testimonials, speakers or evidence. Use only a supplied speaker portrait for image variants; otherwise choose the paired no-image template. An anonymous quote may omit the attribution entirely. Do not add a separate body heading or hide source text in metadata. Preserve the quote, optional chrome and measured safe regions.",
      "pl": "Użyj dokładnie cytatu podanego przez użytkownika. Dodaj autora i stanowisko tylko, gdy zostały podane; nie wymyślaj opinii, autorów ani dowodów. W wariantach ze zdjęciem użyj wyłącznie dostarczonego portretu, a bez niego wybierz zgodny wariant bez zdjęcia. Cytat anonimowy może nie mieć podpisu. Nie dodawaj osobnego tytułu w treści ani nie ukrywaj tekstu w metadanych. Zachowaj cytat, opcjonalne wspólne elementy i bezpieczny obszar."
    }
  },
  {
    "id": "quote-centered",
    "family": "quote",
    "quoteStyle": "centered",
    "photo": false,
    "noImage": true,
    "pairedTemplate": "quote-avatar",
    "example": {
      "layout": "quote",
      "quote": "“I can see what’s left after bills and savings. Now I can say yes to a weekend away without guessing what I can afford.”",
      "author": "Example Brite customer",
      "authorRole": "Illustrative testimonial",
      "section": "Customer perspective"
    },
    "name": {
      "en": "Centered quote",
      "pl": "Cytat wyśrodkowany"
    },
    "description": {
      "en": "A centered quote with an optional text attribution.",
      "pl": "Wyśrodkowany cytat z opcjonalnym podpisem."
    },
    "instruction": {
      "en": "Use the exact quote supplied by the user. Add attribution and role only when supplied; never invent testimonials, speakers or evidence. Use only a supplied speaker portrait for image variants; otherwise choose the paired no-image template. An anonymous quote may omit the attribution entirely. Do not add a separate body heading or hide source text in metadata. Preserve the quote, optional chrome and measured safe regions.",
      "pl": "Użyj dokładnie cytatu podanego przez użytkownika. Dodaj autora i stanowisko tylko, gdy zostały podane; nie wymyślaj opinii, autorów ani dowodów. W wariantach ze zdjęciem użyj wyłącznie dostarczonego portretu, a bez niego wybierz zgodny wariant bez zdjęcia. Cytat anonimowy może nie mieć podpisu. Nie dodawaj osobnego tytułu w treści ani nie ukrywaj tekstu w metadanych. Zachowaj cytat, opcjonalne wspólne elementy i bezpieczny obszar."
    }
  },
  {
    "id": "quote-portrait",
    "family": "quote",
    "quoteStyle": "portrait",
    "photo": true,
    "noImage": false,
    "pairedTemplate": "quote-portrait-no-image",
    "example": {
      "layout": "quote",
      "quote": "“I can see what’s left after bills and savings. Now I can say yes to a weekend away without guessing what I can afford.”",
      "author": "Example Brite customer",
      "authorRole": "Illustrative testimonial",
      "section": "Customer perspective",
      "image": "assets/figma/quote-portrait.webp",
      "imageAlt": "Portrait of the speaker in the supplied design example."
    },
    "name": {
      "en": "Quote with portrait",
      "pl": "Cytat z portretem"
    },
    "description": {
      "en": "A left-aligned quote with a full-height portrait.",
      "pl": "Cytat wyrównany do lewej z portretem na całą wysokość."
    },
    "instruction": {
      "en": "Use the exact quote supplied by the user. Add attribution and role only when supplied; never invent testimonials, speakers or evidence. Use only a supplied speaker portrait for image variants; otherwise choose the paired no-image template. An anonymous quote may omit the attribution entirely. Do not add a separate body heading or hide source text in metadata. Preserve the quote, optional chrome and measured safe regions.",
      "pl": "Użyj dokładnie cytatu podanego przez użytkownika. Dodaj autora i stanowisko tylko, gdy zostały podane; nie wymyślaj opinii, autorów ani dowodów. W wariantach ze zdjęciem użyj wyłącznie dostarczonego portretu, a bez niego wybierz zgodny wariant bez zdjęcia. Cytat anonimowy może nie mieć podpisu. Nie dodawaj osobnego tytułu w treści ani nie ukrywaj tekstu w metadanych. Zachowaj cytat, opcjonalne wspólne elementy i bezpieczny obszar."
    }
  },
  {
    "id": "quote-portrait-no-image",
    "family": "quote",
    "quoteStyle": "portrait",
    "photo": false,
    "noImage": true,
    "pairedTemplate": "quote-portrait",
    "example": {
      "layout": "quote",
      "quote": "“I can see what’s left after bills and savings. Now I can say yes to a weekend away without guessing what I can afford.”",
      "author": "Example Brite customer",
      "authorRole": "Illustrative testimonial",
      "section": "Customer perspective"
    },
    "name": {
      "en": "Left-aligned quote",
      "pl": "Cytat wyrównany do lewej"
    },
    "description": {
      "en": "A left-aligned quote with no photograph.",
      "pl": "Cytat wyrównany do lewej bez zdjęcia."
    },
    "instruction": {
      "en": "Use the exact quote supplied by the user. Add attribution and role only when supplied; never invent testimonials, speakers or evidence. Use only a supplied speaker portrait for image variants; otherwise choose the paired no-image template. An anonymous quote may omit the attribution entirely. Do not add a separate body heading or hide source text in metadata. Preserve the quote, optional chrome and measured safe regions.",
      "pl": "Użyj dokładnie cytatu podanego przez użytkownika. Dodaj autora i stanowisko tylko, gdy zostały podane; nie wymyślaj opinii, autorów ani dowodów. W wariantach ze zdjęciem użyj wyłącznie dostarczonego portretu, a bez niego wybierz zgodny wariant bez zdjęcia. Cytat anonimowy może nie mieć podpisu. Nie dodawaj osobnego tytułu w treści ani nie ukrywaj tekstu w metadanych. Zachowaj cytat, opcjonalne wspólne elementy i bezpieczny obszar."
    }
  },
  {
    "id": "split-paragraphs",
    "family": "split",
    "source": 1,
    "contentMode": "paragraphs",
    "photo": true,
    "noImage": false,
    "pairedTemplate": "split-paragraphs-no-image",
    "patch": {
      "points": null,
      "title": "Know what’s safe to spend.",
      "section": "The solution",
      "paragraphs": [
        "Your balance is only the starting point. Brite brings upcoming bills, everyday spending and savings goals into one clear view, so you can see what your money needs to cover.",
        "Set money aside for rent and the trip you’re planning. Then check what’s available for today, with less mental maths and fewer surprises before your next payday."
      ]
    },
    "name": {
      "en": "Paragraphs with photo",
      "pl": "Akapity ze zdjęciem"
    },
    "description": {
      "en": "A classic title and paragraphs, without numbered points.",
      "pl": "Klasyczny tytuł i akapity, bez numerowanych punktów."
    },
    "instruction": {
      "en": "Use the supplied title and paragraphs, with no numbered list. Keep the remaining text group vertically centered. If source contains list items, choose a points variant rather than discarding them. Use only supplied imagery; select the paired no-photo variant when none is provided.",
      "pl": "Użyj podanego tytułu i akapitów, bez numerowanej listy. Wyśrodkuj pozostałą grupę tekstu w pionie. Jeśli źródło zawiera punkty, wybierz wariant z punktami zamiast je pomijać. Używaj wyłącznie dostarczonych zdjęć; bez zdjęcia wybierz zgodny wariant bez fotografii."
    }
  },
  {
    "id": "split-paragraphs-no-image",
    "family": "split",
    "source": 1,
    "contentMode": "paragraphs",
    "photo": false,
    "noImage": true,
    "pairedTemplate": "split-paragraphs",
    "patch": {
      "points": null,
      "image": null,
      "imageAlt": null,
      "title": "Know what’s safe to spend.",
      "section": "The solution",
      "paragraphs": [
        "Your balance is only the starting point. Brite brings upcoming bills, everyday spending and savings goals into one clear view, so you can see what your money needs to cover.",
        "Set money aside for rent and the trip you’re planning. Then check what’s available for today, with less mental maths and fewer surprises before your next payday."
      ]
    },
    "name": {
      "en": "Paragraphs without photo",
      "pl": "Akapity bez zdjęcia"
    },
    "description": {
      "en": "A classic title and paragraphs, without numbered points.",
      "pl": "Klasyczny tytuł i akapity, bez numerowanych punktów."
    },
    "instruction": {
      "en": "Use the supplied title and paragraphs, with no numbered list. Keep the remaining text group vertically centered. If source contains list items, choose a points variant rather than discarding them. Use only supplied imagery; select the paired no-photo variant when none is provided.",
      "pl": "Użyj podanego tytułu i akapitów, bez numerowanej listy. Wyśrodkuj pozostałą grupę tekstu w pionie. Jeśli źródło zawiera punkty, wybierz wariant z punktami zamiast je pomijać. Używaj wyłącznie dostarczonych zdjęć; bez zdjęcia wybierz zgodny wariant bez fotografii."
    }
  }
]);

// Figma60:1057: two independent content columns, in three designed appearances.
families.splice(families.findIndex(f=>f.id==='cards')+1,0,{id:'comparison',name:{en:'Comparison',pl:'Porównanie'},description:{en:'Compare two approaches or options in independent columns.',pl:'Porównaj dwa podejścia lub rozwiązania w niezależnych kolumnach.'}});
layouts.comparison={roles:['before-after','two-options','two-approaches','trade-offs'],required:['title','columns'],optional:['description','logo','section','chrome'],itemCounts:{columns:{min:2,max:2}},columnItems:{min:1,max:4},image:{required:false,fit:null,purpose:'none'},budgets:{titleLines:2,descriptionLines:3,columnTitleLines:2,itemTitleLines:2},regions:{titleWidth:1660,contentTop:100,contentBottom:978,defaultTop:177},defaultAlignment:'top'};
const comparisonExample={layout:'comparison',title:'From tracking to planning.',description:'Two approaches to managing everyday money.',section:'Comparison',columns:[
 {title:'Tracking spending',items:[{title:'Look back',description:'See where money went after purchases are made.'},{title:'Check the balance',description:'Use the current balance as a starting point.'},{title:'Review categories',description:'Spot patterns at the end of the month.'}]},
 {title:'Planning ahead',items:[{title:'Account for bills',description:'Set aside money for upcoming commitments.'},{title:'Separate goals',description:'Keep savings plans visible beside daily spending.'},{title:'Know what is available',description:'Review what remains before making a purchase.'}]}
]};
for(const style of ['outline','filled','plain'])entries.push({id:'comparison-'+style,family:'comparison',comparisonStyle:style,example:structuredClone(comparisonExample),name:{en:style==='outline'?'Outlined comparison':style==='filled'?'Filled comparison':'Plain comparison',pl:style==='outline'?'Porównanie z obramowaniem':style==='filled'?'Porównanie z wypełnieniem':'Porównanie bez kart'},description:{en:style==='outline'?'Two outlined columns, with independent headings and details.':style==='filled'?'Two equally filled columns, with independent headings and details.':'Two open text columns without dividers or card surfaces.',pl:style==='outline'?'Dwie kolumny z obramowaniem, niezależnymi nagłówkami i opisami.':style==='filled'?'Dwie kolumny z takim samym wypełnieniem, niezależnymi nagłówkami i opisami.':'Dwie otwarte kolumny tekstu bez separatorów i tła kart.'},instruction:{en:'Compare exactly two supplied options or approaches using '+style+' columns. Keep their titles and all items with their original option. Each column supports one to four items, with optional descriptions, subject to measured fit. Counts and text lengths may differ; do not invent matching items, force row equivalence, imply a winner or move content between options. Omit an absent introduction or item description with its spacing. Preserve wording; allow equal column height to grow within the safe region without shrinking fonts. This is an independent-column comparison, not a data matrix.',pl:'Porównaj dokładnie dwie podane opcje lub podejścia w kolumnach '+(style==='outline'?'z obramowaniem':style==='filled'?'z wypełnieniem':'bez tła kart')+'. Zachowaj nagłówki i wszystkie punkty przy ich oryginalnej opcji. Każda kolumna mieści od jednego do czterech punktów z opcjonalnymi opisami, po sprawdzeniu dopasowania. Liczba punktów i długość tekstu mogą się różnić. Nie dopisuj par, nie wymuszaj zgodności wierszy, nie sugeruj zwycięzcy i nie przenoś treści między opcjami. Brak wstępu lub opisu punktu usuwa jego odstęp. Zachowaj treść; wspólna wysokość kolumn może rosnąć w bezpiecznym obszarze bez zmniejszania fontu. To niezależne kolumny porównania, nie macierz danych.'}});

// Figma64:1244: an ordered, image-free process in three appearances.
families.splice(families.findIndex(f=>f.id==='comparison')+1,0,{id:'process',name:{en:'Process',pl:'Proces'},description:{en:'Explain an ordered sequence of steps from start to finish.',pl:'Przedstaw kolejne kroki procesu, od początku do końca.'}});
layouts.process={roles:['ordered-process','how-it-works','workflow','sequential-instructions'],required:['title','steps'],optional:['description','logo','section','chrome'],itemCounts:{steps:{min:2,max:4}},image:{required:false,fit:null,purpose:'none'},budgets:{titleLines:2,descriptionLines:3,stepTitleLines:2},regions:{titleWidth:1660,contentTop:100,contentBottom:978,defaultTop:177},defaultAlignment:'top'};
const processExample={layout:'process',title:'Build a savings habit.',description:'Four ordered steps from a goal to a recurring transfer.',section:'Process',steps:[
 {title:'Name the goal',description:'Choose what you are saving for and set a target.'},
 {title:'Pick an amount',description:'Choose what you can save each month.'},
 {title:'Set a schedule',description:'Set a day for your regular transfer.'},
 {title:'Review progress',description:'Check the plan and adjust when your needs change.'}
]};
for(const style of ['outline','filled','plain'])entries.push({id:'process-'+style,family:'process',processStyle:style,example:structuredClone(processExample),name:{en:style==='outline'?'Outlined process':style==='filled'?'Filled process':'Plain process',pl:style==='outline'?'Proces z obramowaniem':style==='filled'?'Proces z wypełnieniem':'Proces bez kart'},description:{en:style==='outline'?'Numbered steps in outlined cards with optional detail.':style==='filled'?'Numbered steps in filled cards with optional detail.':'Numbered steps in open columns, without card surfaces.',pl:style==='outline'?'Ponumerowane kroki w kartach z obramowaniem i opcjonalnymi opisami.':style==='filled'?'Ponumerowane kroki w kartach z wypełnieniem i opcjonalnymi opisami.':'Ponumerowane kroki w otwartych kolumnach, bez tła kart.'},instruction:{en:'Present the supplied process in its original order using '+style+' steps. Use two to four real steps, each with a title and optional description; include the introduction only when supplied. Do not invent filler stages, deadlines, dependencies or a process from unrelated benefits. Numbers follow the saved step order and do not replace source wording. Preserve all content; equal-height steps grow within the measured safe region without shrinking fonts. If the process has too many steps or does not fit, report the conflict or choose a genuinely compatible designed layout without dropping stages. This ordered process is not a dated roadmap.',pl:'Przedstaw podany proces w oryginalnej kolejności, w krokach '+(style==='outline'?'z obramowaniem':style==='filled'?'z wypełnieniem':'bez tła kart')+'. Użyj od dwóch do czterech rzeczywistych kroków, z tytułem i opcjonalnym opisem. Dodaj wstęp tylko wtedy, gdy go podam. Nie dopisuj etapów, terminów, zależności ani nie twórz procesu z niepowiązanych korzyści. Numeracja wynika z zapisanej kolejności kroków i nie zastępuje tekstu źródłowego. Zachowaj całą treść; równa wysokość bloków rośnie w dostępnym obszarze bez zmniejszania fontu. Gdy kroków jest zbyt wiele lub tekst się nie mieści, zgłoś konflikt albo wybierz rzeczywiście zgodny zaprojektowany układ, bez pomijania etapów. Proces to nie roadmapa z datami.'}});

// Figma65:1696: supplied time horizons and milestone outcomes, with no inferred dates.
families.splice(families.findIndex(f=>f.id==='process')+1,0,{id:'roadmap',name:{en:'Roadmap',pl:'Roadmapa'},description:{en:'Show supplied time horizons, milestones and their key activities.',pl:'Pokaż podane terminy, kamienie milowe i najważniejsze działania.'}});
layouts.roadmap={roles:['dated-roadmap','time-phased-plan','milestones'],required:['title','milestones'],optional:['description','logo','section','chrome'],itemCounts:{milestones:{min:2,max:4}},milestonePoints:{min:0,max:4},image:{required:false,fit:null,purpose:'none'},budgets:{titleLines:2,descriptionLines:3,periodLines:2,yearLines:1,milestoneTitleLines:2},regions:{titleWidth:1660,contentTop:100,contentBottom:978,defaultTop:177},defaultAlignment:'top'};
const roadmapExample={layout:'roadmap',title:'A clearer path to launch.',description:'Illustrative Brite roadmap, from early research to a controlled pilot.',section:'Roadmap',milestones:[
 {period:'JUL - AUG',year:'2026',title:'Understand the need',points:['Interview potential users','Map their planning habits','Define the first use case']},
 {period:'SEP - DEC',year:'2026',title:'Test the experience',points:['Build a working prototype','Test the weekly money review','Refine the key screens']},
 {period:'JAN - FEB',year:'2027',title:'Prepare the pilot',points:['Invite a small test group','Agree success criteria','Plan the feedback cycle']}
]};
for(const style of ['outline','filled','plain'])entries.push({id:'roadmap-'+style,family:'roadmap',roadmapStyle:style,example:structuredClone(roadmapExample),name:{en:style==='outline'?'Outlined roadmap':style==='filled'?'Filled roadmap':'Plain roadmap',pl:style==='outline'?'Roadmapa z obramowaniem':style==='filled'?'Roadmapa z wypełnieniem':'Roadmapa bez kart'},description:{en:style==='outline'?'Supplied dates and milestones in outlined cards.':style==='filled'?'Supplied dates and milestones in filled cards.':'Supplied dates and milestones in open columns, without card surfaces.',pl:style==='outline'?'Podane terminy i kamienie milowe w kartach z obramowaniem.':style==='filled'?'Podane terminy i kamienie milowe w kartach z wypełnieniem.':'Podane terminy i kamienie milowe w otwartych kolumnach, bez tła kart.'},instruction:{en:'Show two to four supplied milestones using '+style+' columns. Keep their original order, time labels, years, titles and activities exactly with the correct milestone. Each milestone can have up to four supplied bullet points. Period/year and activities can be absent individually; remove their spacing rather than inventing dates or filler. At least one milestone needs a supplied time horizon; if none exists, use a compatible Process or cards layout without inventing a schedule. Preserve date ranges as text: do not calculate dates, infer years, sort, change commitments or treat overlapping periods as a Gantt dependency. Keep equal-height columns within the measured safe area without shrinking type. Examples are illustrative and must never become the user’s plan.',pl:'Pokaż od dwóch do czterech podanych kamieni milowych w kolumnach '+(style==='outline'?'z obramowaniem':style==='filled'?'z wypełnieniem':'bez tła kart')+'. Zachowaj ich kolejność, terminy, lata, tytuły i działania przy właściwym etapie. Każdy etap może mieć do czterech podanych punktów. Okres, rok i działania mogą pojedynczo nie występować: usuń ich odstępy, zamiast wymyślać daty lub dopisywać treść. Przynajmniej jeden etap wymaga podanego horyzontu czasowego; bez takich informacji wybierz zgodny Proces lub Karty, bez wymyślania harmonogramu. Zachowaj zakresy dat jako tekst: nie obliczaj dat, nie dopowiadaj lat, nie sortuj etapów, nie zmieniaj zobowiązań i nie traktuj nakładających się okresów jak zależności Gantta. Zachowaj równą wysokość kolumn i bezpieczny obszar bez zmniejszania fontu. Przykładowe dane są ilustracyjne i nie mogą stać się planem użytkownika.'}});

// D68: native table, with structural source preservation and literal values.
families.splice(families.findIndex(f=>f.id==='roadmap')+1,0,{id:'table',name:{en:'Tables',pl:'Tabele'},description:{en:'Present related data or compare options against the same criteria.',pl:'Przedstaw dane lub porównaj opcje według wspólnych kryteriów.'}});
layouts.table={roles:['data-table','budget-snapshot','structured-values','tabular-report'],required:['title','table'],optional:['description','caption','logo','section','chrome'],itemCounts:{},tableCounts:{columns:{min:2,max:5},rows:{min:1,max:8}},image:{required:false,fit:null,purpose:'none'},budgets:{titleLines:2,descriptionLines:3,headerLines:2,captionLines:3},regions:{titleWidth:1804,contentTop:100,contentBottom:978,defaultTop:177},defaultAlignment:'top'};
entries.push({id:'table-default',family:'table',noImage:true,example:{layout:'table',title:'Where the monthly budget goes.',description:'A compact snapshot of planned and actual spending.',section:'Data table',table:{headers:['Category','Planned','Actual','Difference'],rows:[['Housing','£900','£900','£0'],['Groceries','£320','£350','+£30'],['Transport','£180','£150','−£30'],['Leisure','£200','£150','−£50'],['Savings','£200','£200','£0'],['Total','£1,800','£1,750','−£50']]},caption:'Illustrative monthly budget / GBP. Difference = actual minus planned.'},name:{en:'Table with note',pl:'Tabela z przypisem'},description:{en:'A native table with clear column headings, subtle row dividers and an optional source or note.',pl:'Tabela z czytelnymi nagłówkami kolumn, delikatnymi liniami między wierszami i opcjonalnym przypisem.'},instruction:{en:'Use this designed table for supplied tabular data: two to five columns and one to eight body rows, subject to measured fit. Preserve every header, cell, empty value, row/column relationship, original order, unit, sign and note exactly. Do not calculate totals, infer missing values, round, sort or turn the table into unrelated cards. Omit the introduction or note and their spacing when absent. Keep the designed type and let rows grow together across their cells when text wraps. If the full table cannot fit, report the count/fit conflict instead of dropping rows or shrinking fonts. No photograph is used; this template keeps the data readable.',pl:'Użyj tej tabeli do podanych danych: od dwóch do pięciu kolumn i od jednego do ośmiu wierszy danych, po sprawdzeniu dopasowania. Zachowaj każdy nagłówek, komórkę, pustą wartość, relację wiersza i kolumny, kolejność, jednostkę, znak i przypis. Nie przeliczaj sum, nie dopowiadaj wartości, nie zaokrąglaj i nie sortuj danych ani nie zamieniaj tabeli w niepowiązane karty. Gdy nie ma wstępu lub przypisu, pomiń go razem z odstępem. Zachowaj fonty; przy zawijaniu tekstu wysokość wiersza rośnie wspólnie dla wszystkich jego komórek. Jeżeli cała tabela się nie mieści, zgłoś konflikt zamiast usuwać wiersze lub zmniejszać fonty. Ten układ nie ma zdjęcia, aby dane pozostały czytelne.'}});

// D73: a criteria-matrix recipe reuses the native table/source/fit machinery.
entries.push({"id": "table-criteria-matrix", "family": "table", "tableStyle": "matrix", "noImage": true, "example": {"layout": "table", "title": "Choose the right account.", "description": "Compare everyday spending, shared bills and travel in one place.", "section": "Comparison matrix", "table": {"headers": ["Decision criterion", "Everyday", "Together", "Travel"], "rows": [["Main use", "Daily spending", "Shared spending", "Spending abroad"], ["Money pots", "Personal goals", "Shared goals", "Trip budgets"], ["Account access", "One person", "Two people", "One person"], ["Useful for", "Routine bills", "Shared plans", "Regular trips"]]}, "caption": "Illustrative Brite plans and features — not a product offer."}, "name": {"en": "Comparison matrix", "pl": "Macierz porównawcza"}, "description": {"en": "Compare two to four options against shared criteria, with equal option columns and a wider criterion column.", "pl": "Porównaj od dwóch do czterech opcji według wspólnych kryteriów, z równymi kolumnami opcji i szerszą kolumną kryteriów."}, "instruction": {"en": "Use the comparison matrix for two to four supplied options evaluated against the same one to six criteria, subject to measured fit. Use the first table column for criteria and the other columns for the actual option names and their values. Preserve every header, cell, blank value, qualifier, number, unit, sign, row/column relationship and source order exactly. Do not invent criteria, fill missing cells, calculate scores, rank options or imply a winner. Keep the wider criterion column and equal option columns. Rows grow together when text wraps, at the designed type size. Omit an absent introduction or note together with its spacing. If the complete matrix does not fit, try a compatible Data table with all content preserved or report the conflict; never drop rows or shrink text. No photo is used.", "pl": "Użyj macierzy do porównania od dwóch do czterech podanych opcji według tych samych od jednego do sześciu kryteriów, po sprawdzeniu dopasowania. Pierwsza kolumna tabeli zawiera kryteria, a pozostałe rzeczywiste nazwy opcji i ich wartości. Zachowaj wszystkie nagłówki, komórki, puste wartości, zastrzeżenia, liczby, jednostki, znaki, relacje wierszy i kolumn oraz kolejność źródła. Nie wymyślaj kryteriów, nie uzupełniaj pustych komórek, nie obliczaj punktacji, nie sortuj opcji i nie sugeruj zwycięzcy. Kolumna kryteriów jest szersza, a kolumny opcji równe. Wiersze rosną wspólnie przy zawijaniu tekstu, bez zmniejszania fontu. Gdy nie ma wstępu lub przypisu, usuń go razem z odstępem. Jeżeli cała macierz się nie mieści, spróbuj zgodnej Tabeli danych bez utraty treści albo zgłoś konflikt; nie usuwaj wierszy ani nie zmniejszaj tekstu. Układ nie ma zdjęcia."}});

// D74: closing takeaway and next steps; all appearances share exact source fields.
families.splice(families.findIndex(f=>f.id==='table')+1,0,{"id": "summary", "name": {"en": "Summary & next steps", "pl": "Podsumowanie i kolejne kroki"}, "description": {"en": "Close with a clear takeaway and practical next steps.", "pl": "Zakończ jasnym wnioskiem i konkretnymi kolejnymi krokami."}});
layouts.summary={"roles": ["summary", "closing", "takeaway-and-actions", "decision-recap", "next-steps"], "required": ["title", "takeaway", "actions"], "optional": ["description", "takeawayLabel", "takeawayDescription", "image", "imageAlt", "logo", "section", "chrome"], "itemCounts": {"actions": {"min": 1, "max": 4}}, "image": {"required": false, "fit": null, "purpose": "none"}, "budgets": {"titleLines": 3, "descriptionLines": 3, "takeawayLines": 5, "takeawayLabelLines": 1, "actionTitleLines": 2}, "regions": {"titleWidth": 805, "contentTop": 100, "contentBottom": 978, "defaultTop": 161}, "defaultAlignment": "top"};
entries.push({"id": "summary-outline-photo", "family": "summary", "summaryStyle": "outline", "example": {"layout": "summary", "title": "Build a better money habit.", "description": "Test a weekly money review before expanding the app.", "takeawayLabel": "The takeaway", "takeaway": "A clearer money picture starts with a repeatable habit.", "takeawayDescription": "Use the pilot to decide what Brite should improve next.", "section": "Next steps", "actions": [{"title": "Invite a pilot group", "description": "Include people with different spending habits."}, {"title": "Test the weekly review", "description": "Observe which information helps people plan ahead."}, {"title": "Define pilot success", "description": "Track whether people feel ready for the week."}], "image": "assets/summary-right-photo.webp", "imageAlt": "Abstract diagonal bands of blue and warm light on a dark background."}, "name": {"en": "Outlined next steps · background", "pl": "Kolejne kroki z obramowaniem · tło"}, "description": {"en": "A takeaway beside paper cards with black borders, with a right-side background image.", "pl": "Wniosek obok jasnych kart z czarną ramką, z grafiką tła po prawej."}, "instruction": {"en": "Use a supplied takeaway on the left and one to four supplied actions on the right. Preserve every title, conclusion, action and supporting detail in source order. The introduction, takeaway label/detail and action descriptions are optional; remove their spacing when absent. Use outline action cards over the supplied right-side background image. When present, keep the image vertically centered on the whole slide. The left column and vertically centered action stack reflow within safe bounds; action cards grow to the same measured height, without shrinking type. Do not invent a conclusion, next action, owner, date or success claim. Keep optional branding and footer choices. If it does not fit, report the conflict or use a truly compatible source-preserving layout.", "pl": "Umieść podany wniosek po lewej, a od jednego do czterech podanych działań po prawej. Zachowaj każdy tytuł, wniosek, krok i szczegół w kolejności źródła. Wstęp, etykieta i opis wniosku oraz opisy działań są opcjonalne: gdy ich nie ma, usuń ich odstępy. Użyj kart z obramowaniem na podanej grafice tła po prawej. Jeśli jest grafika, wyśrodkuj ją w pionie względem całego slajdu. Lewa kolumna i wyśrodkowana lista działań mieszczą się w bezpiecznym obszarze; karty wspólnie rosną do zmierzonej wysokości, bez zmniejszania fontów. Nie wymyślaj wniosku, działań, właścicieli, terminów ani wyników. Zachowaj wybór opcjonalnego logo i stopki. Gdy treść się nie mieści, zgłoś konflikt albo użyj zgodnego układu bez utraty treści."}, "photo": true, "sidePhoto": true, "photoRegions": {}, "pairedTemplate": "summary-outline"});
entries.push({"id": "summary-outline", "family": "summary", "summaryStyle": "outline", "example": {"layout": "summary", "title": "Build a better money habit.", "description": "Test a weekly money review before expanding the app.", "takeawayLabel": "The takeaway", "takeaway": "A clearer money picture starts with a repeatable habit.", "takeawayDescription": "Use the pilot to decide what Brite should improve next.", "section": "Next steps", "actions": [{"title": "Invite a pilot group", "description": "Include people with different spending habits."}, {"title": "Test the weekly review", "description": "Observe which information helps people plan ahead."}, {"title": "Define pilot success", "description": "Track whether people feel ready for the week."}]}, "name": {"en": "Outlined next steps", "pl": "Kolejne kroki z obramowaniem"}, "description": {"en": "A takeaway beside paper cards with black borders, without a background image.", "pl": "Wniosek obok jasnych kart z czarną ramką, bez grafiki tła."}, "instruction": {"en": "Use a supplied takeaway on the left and one to four supplied actions on the right. Preserve every title, conclusion, action and supporting detail in source order. The introduction, takeaway label/detail and action descriptions are optional; remove their spacing when absent. Use outline action cards without a background image. When present, keep the image vertically centered on the whole slide. The left column and vertically centered action stack reflow within safe bounds; action cards grow to the same measured height, without shrinking type. Do not invent a conclusion, next action, owner, date or success claim. Keep optional branding and footer choices. If it does not fit, report the conflict or use a truly compatible source-preserving layout.", "pl": "Umieść podany wniosek po lewej, a od jednego do czterech podanych działań po prawej. Zachowaj każdy tytuł, wniosek, krok i szczegół w kolejności źródła. Wstęp, etykieta i opis wniosku oraz opisy działań są opcjonalne: gdy ich nie ma, usuń ich odstępy. Użyj kart z obramowaniem bez grafiki tła. Jeśli jest grafika, wyśrodkuj ją w pionie względem całego slajdu. Lewa kolumna i wyśrodkowana lista działań mieszczą się w bezpiecznym obszarze; karty wspólnie rosną do zmierzonej wysokości, bez zmniejszania fontów. Nie wymyślaj wniosku, działań, właścicieli, terminów ani wyników. Zachowaj wybór opcjonalnego logo i stopki. Gdy treść się nie mieści, zgłoś konflikt albo użyj zgodnego układu bez utraty treści."}, "noImage": true, "pairedTemplate": "summary-outline-photo"});
entries.push({"id": "summary-filled-photo", "family": "summary", "summaryStyle": "filled", "example": {"layout": "summary", "title": "Build a better money habit.", "description": "Test a weekly money review before expanding the app.", "takeawayLabel": "The takeaway", "takeaway": "A clearer money picture starts with a repeatable habit.", "takeawayDescription": "Use the pilot to decide what Brite should improve next.", "section": "Next steps", "actions": [{"title": "Invite a pilot group", "description": "Include people with different spending habits."}, {"title": "Test the weekly review", "description": "Observe which information helps people plan ahead."}, {"title": "Define pilot success", "description": "Track whether people feel ready for the week."}], "image": "assets/summary-right-photo.webp", "imageAlt": "Abstract diagonal bands of blue and warm light on a dark background."}, "name": {"en": "Filled next steps · background", "pl": "Kolejne kroki z wypełnieniem · tło"}, "description": {"en": "A takeaway beside soft yellow action cards, with a right-side background image.", "pl": "Wniosek obok żółtawych kart działań, z grafiką tła po prawej."}, "instruction": {"en": "Use a supplied takeaway on the left and one to four supplied actions on the right. Preserve every title, conclusion, action and supporting detail in source order. The introduction, takeaway label/detail and action descriptions are optional; remove their spacing when absent. Use filled action cards over the supplied right-side background image. When present, keep the image vertically centered on the whole slide. The left column and vertically centered action stack reflow within safe bounds; action cards grow to the same measured height, without shrinking type. Do not invent a conclusion, next action, owner, date or success claim. Keep optional branding and footer choices. If it does not fit, report the conflict or use a truly compatible source-preserving layout.", "pl": "Umieść podany wniosek po lewej, a od jednego do czterech podanych działań po prawej. Zachowaj każdy tytuł, wniosek, krok i szczegół w kolejności źródła. Wstęp, etykieta i opis wniosku oraz opisy działań są opcjonalne: gdy ich nie ma, usuń ich odstępy. Użyj kart z żółtawym wypełnieniem na podanej grafice tła po prawej. Jeśli jest grafika, wyśrodkuj ją w pionie względem całego slajdu. Lewa kolumna i wyśrodkowana lista działań mieszczą się w bezpiecznym obszarze; karty wspólnie rosną do zmierzonej wysokości, bez zmniejszania fontów. Nie wymyślaj wniosku, działań, właścicieli, terminów ani wyników. Zachowaj wybór opcjonalnego logo i stopki. Gdy treść się nie mieści, zgłoś konflikt albo użyj zgodnego układu bez utraty treści."}, "photo": true, "sidePhoto": true, "photoRegions": {}, "pairedTemplate": "summary-filled"});
entries.push({"id": "summary-filled", "family": "summary", "summaryStyle": "filled", "example": {"layout": "summary", "title": "Build a better money habit.", "description": "Test a weekly money review before expanding the app.", "takeawayLabel": "The takeaway", "takeaway": "A clearer money picture starts with a repeatable habit.", "takeawayDescription": "Use the pilot to decide what Brite should improve next.", "section": "Next steps", "actions": [{"title": "Invite a pilot group", "description": "Include people with different spending habits."}, {"title": "Test the weekly review", "description": "Observe which information helps people plan ahead."}, {"title": "Define pilot success", "description": "Track whether people feel ready for the week."}]}, "name": {"en": "Filled next steps", "pl": "Kolejne kroki z wypełnieniem"}, "description": {"en": "A takeaway beside soft yellow action cards, without a background image.", "pl": "Wniosek obok żółtawych kart działań, bez grafiki tła."}, "instruction": {"en": "Use a supplied takeaway on the left and one to four supplied actions on the right. Preserve every title, conclusion, action and supporting detail in source order. The introduction, takeaway label/detail and action descriptions are optional; remove their spacing when absent. Use filled action cards without a background image. When present, keep the image vertically centered on the whole slide. The left column and vertically centered action stack reflow within safe bounds; action cards grow to the same measured height, without shrinking type. Do not invent a conclusion, next action, owner, date or success claim. Keep optional branding and footer choices. If it does not fit, report the conflict or use a truly compatible source-preserving layout.", "pl": "Umieść podany wniosek po lewej, a od jednego do czterech podanych działań po prawej. Zachowaj każdy tytuł, wniosek, krok i szczegół w kolejności źródła. Wstęp, etykieta i opis wniosku oraz opisy działań są opcjonalne: gdy ich nie ma, usuń ich odstępy. Użyj kart z żółtawym wypełnieniem bez grafiki tła. Jeśli jest grafika, wyśrodkuj ją w pionie względem całego slajdu. Lewa kolumna i wyśrodkowana lista działań mieszczą się w bezpiecznym obszarze; karty wspólnie rosną do zmierzonej wysokości, bez zmniejszania fontów. Nie wymyślaj wniosku, działań, właścicieli, terminów ani wyników. Zachowaj wybór opcjonalnego logo i stopki. Gdy treść się nie mieści, zgłoś konflikt albo użyj zgodnego układu bez utraty treści."}, "noImage": true, "pairedTemplate": "summary-filled-photo"});
entries.push({"id": "summary-plain", "family": "summary", "summaryStyle": "plain", "example": {"layout": "summary", "title": "Build a better money habit.", "description": "Test a weekly money review before expanding the app.", "takeawayLabel": "The takeaway", "takeaway": "A clearer money picture starts with a repeatable habit.", "takeawayDescription": "Use the pilot to decide what Brite should improve next.", "section": "Next steps", "actions": [{"title": "Invite a pilot group", "description": "Include people with different spending habits."}, {"title": "Test the weekly review", "description": "Observe which information helps people plan ahead."}, {"title": "Define pilot success", "description": "Track whether people feel ready for the week."}]}, "name": {"en": "Plain next steps", "pl": "Kolejne kroki bez kart"}, "description": {"en": "A takeaway beside a simple numbered action list, without a background image.", "pl": "Wniosek obok prostej numerowanej listy działań, bez grafiki tła."}, "instruction": {"en": "Use a supplied takeaway on the left and one to four supplied actions on the right. Preserve every title, conclusion, action and supporting detail in source order. The introduction, takeaway label/detail and action descriptions are optional; remove their spacing when absent. Use plain action cards without a background image. When present, keep the image vertically centered on the whole slide. The left column and vertically centered action stack reflow within safe bounds; action cards grow to the same measured height, without shrinking type. Do not invent a conclusion, next action, owner, date or success claim. Keep optional branding and footer choices. If it does not fit, report the conflict or use a truly compatible source-preserving layout.", "pl": "Umieść podany wniosek po lewej, a od jednego do czterech podanych działań po prawej. Zachowaj każdy tytuł, wniosek, krok i szczegół w kolejności źródła. Wstęp, etykieta i opis wniosku oraz opisy działań są opcjonalne: gdy ich nie ma, usuń ich odstępy. Użyj otwartej listy bez powierzchni kart bez grafiki tła. Jeśli jest grafika, wyśrodkuj ją w pionie względem całego slajdu. Lewa kolumna i wyśrodkowana lista działań mieszczą się w bezpiecznym obszarze; karty wspólnie rosną do zmierzonej wysokości, bez zmniejszania fontów. Nie wymyślaj wniosku, działań, właścicieli, terminów ani wyników. Zachowaj wybór opcjonalnego logo i stopki. Gdy treść się nie mieści, zgłoś konflikt albo użyj zgodnego układu bez utraty treści."}, "noImage": true});

// D67: right-side decorative photos only behind opaque outlined/filled cards.
for(const [family,width,top] of [['comparison',844,124],['process',983,177],['roadmap',1017,177]]){
 for(const style of ['outline','filled','plain']){
  const baseEntry=entries.find(e=>e.id===family+'-'+style);baseEntry.noImage=true;
  if(style==='plain')continue;
  const photo=structuredClone(baseEntry);photo.id=baseEntry.id+'-photo';delete photo.noImage;photo.photo=true;photo.sidePhoto=true;
  photo.pairedTemplate=baseEntry.id;baseEntry.pairedTemplate=photo.id;
  photo.example.image=family==='roadmap'?'assets/roadmap-gradient.webp':'assets/'+family+'-right-photo.webp';
  photo.example.imageAlt={comparison:'A notebook with a hand-drawn chart on a wooden desk.',process:'Coins in a glass savings jar on a wooden table.',roadmap:'A grain-textured teal and pale gray gradient fading into deep navy.'}[family];
  photo.name={en:baseEntry.name.en+' with photo',pl:baseEntry.name.pl+' ze zdjęciem'};
  photo.description={en:baseEntry.description.en+' A right-side photo sits behind the opaque cards.',pl:baseEntry.description.pl+' Zdjęcie po prawej znajduje się za nieprzezroczystymi kartami.'};
  photo.instruction={en:baseEntry.instruction.en+' Use my supplied decorative photo on the right, vertically centered on the whole slide. Keep the title and introduction left of the image and retain opaque card surfaces. Do not inherit the sample photo. If no photo is supplied, use '+baseEntry.id+'. Preserve all text when switching photo/appearance variants; recheck fit without shrinking fonts.',pl:baseEntry.instruction.pl+' Umieść moje zdjęcie dekoracyjne po prawej i wyśrodkuj je w pionie względem całego slajdu. Tytuł i wstęp pozostają po lewej od zdjęcia; zachowaj nieprzezroczyste tło kart. Nie kopiuj przykładowego zdjęcia. Bez zdjęcia użyj '+baseEntry.id+'. Przy zmianie wariantu zdjęcia lub wyglądu zachowaj całą treść i ponownie sprawdź dopasowanie bez zmniejszania fontów.'};
  if(family==='roadmap'){photo.name={en:baseEntry.name.en+' with background',pl:baseEntry.name.pl+' z tłem'};photo.description={en:baseEntry.description.en+' A right-side background sits behind the opaque cards.',pl:baseEntry.description.pl+' Tło po prawej znajduje się za nieprzezroczystymi kartami.'};photo.instruction={en:photo.instruction.en.replaceAll('photo','background image'),pl:photo.instruction.pl.replaceAll('moje zdjęcie dekoracyjne','moją grafikę tła').replaceAll('zdjęcia','grafiki').replaceAll('zdjęcie','grafikę').replaceAll('przykładowego grafiki','przykładowej grafiki')};}
  photo.photoRegions={titleWidth:width,defaultTop:top};
  entries.splice(entries.indexOf(baseEntry)+1,0,photo);
 }
}

// Horizontal treatments share one figure geometry and the existing title alignment control.
const figureBase=entries.find(e=>e.id==='figure-default');
for(const align of ['left','right']){
 const e=structuredClone(figureBase);e.id='figure-'+align;e.patch={overrides:{title:{align}}};e.retired=align==='right';
 e.name={en:align==='left'?'Figure aligned left':'Figure aligned right',pl:align==='left'?'Grafika do lewej':'Grafika do prawej'};
 e.description={en:'Align the title, description, borderless figure and caption '+align+'. Keep the image/caption group vertically centered.',pl:'Wyrównaj tytuł, opis, grafikę bez ramki i podpis do '+(align==='left'?'lewej':'prawej')+'. Grupa grafiki pozostaje wyśrodkowana w pionie.'};
 e.instruction={en:figureBase.instruction.en.replace('Center the title and optional description.','Align the title, optional description, image and caption '+align+'.')+' Set overrides.title.align to "'+align+'" for the whole figure composition.',pl:figureBase.instruction.pl.replace('Wyśrodkuj tytuł i opcjonalny opis.','Wyrównaj tytuł, opcjonalny opis, grafikę i podpis do '+(align==='left'?'lewej':'prawej')+'.')+' Ustaw overrides.title.align na "'+align+'" dla całego układu.'};
 entries.splice(entries.findIndex(x=>x.id==='figure-no-image'),0,e);
}
// D88: public variant names describe the layout; legacy labels remain discoverable by agents.
const variantNames={
  "cover-default": [
    "Cover · Title + intro · Photo",
    "Okładka · Tytuł i opis · Zdjęcie"
  ],
  "cover-no-image": [
    "Cover · Title + intro · Text only",
    "Okładka · Tytuł i opis · Bez zdjęcia"
  ],
  "cover-four-lines": [
    "Cover · Four-line title · Photo",
    "Okładka · Tytuł w 4 liniach · Zdjęcie"
  ],
  "cover-four-lines-no-image": [
    "Cover · Four-line title · Text only",
    "Okładka · Tytuł w 4 liniach · Bez zdjęcia"
  ],
  "cover-title-only": [
    "Cover · Title only · Photo",
    "Okładka · Sam tytuł · Zdjęcie"
  ],
  "cover-title-only-no-image": [
    "Cover · Title only · Text only",
    "Okładka · Sam tytuł · Bez zdjęcia"
  ],
  "cover-lowered": [
    "Cover · Lower title · Photo",
    "Okładka · Tytuł niżej · Zdjęcie"
  ],
  "cover-lowered-no-image": [
    "Cover · Lower title · Text only",
    "Okładka · Tytuł niżej · Bez zdjęcia"
  ],
  "agenda-default": [
    "Agenda · Two columns · Photo",
    "Agenda · Dwie kolumny · Zdjęcie"
  ],
  "agenda-no-image": [
    "Agenda · Two columns · Text only",
    "Agenda · Dwie kolumny · Bez zdjęcia"
  ],
  "split-default": [
    "Content · Text + points · Photo",
    "Treść · Tekst i punkty · Zdjęcie"
  ],
  "split-no-image": [
    "Content · Text + points · Text only",
    "Treść · Tekst i punkty · Bez zdjęcia"
  ],
  "split-paragraphs": [
    "Content · Paragraphs · Photo",
    "Treść · Akapity · Zdjęcie"
  ],
  "split-paragraphs-no-image": [
    "Content · Paragraphs · Text only",
    "Treść · Akapity · Bez zdjęcia"
  ],
  "cards-default": [
    "Cards · 3 filled · Photo",
    "Karty · 3 z tłem · Zdjęcie"
  ],
  "cards-no-image": [
    "Cards · 3 filled · Text only",
    "Karty · 3 z tłem · Bez zdjęcia"
  ],
  "cards-no-description": [
    "Cards · 3 filled · No intro · Photo",
    "Karty · 3 z tłem · Bez wstępu · Zdjęcie"
  ],
  "cards-no-description-no-image": [
    "Cards · 3 filled · No intro · Text only",
    "Karty · 3 z tłem · Bez wstępu · Bez zdjęcia"
  ],
  "cards-filled-2": [
    "Cards · 2 filled · Photo",
    "Karty · 2 z tłem · Zdjęcie"
  ],
  "cards-filled-2-no-image": [
    "Cards · 2 filled · Text only",
    "Karty · 2 z tłem · Bez zdjęcia"
  ],
  "cards-filled-4": [
    "Cards · 4 filled · Photo",
    "Karty · 4 z tłem · Zdjęcie"
  ],
  "cards-filled-4-no-image": [
    "Cards · 4 filled · Text only",
    "Karty · 4 z tłem · Bez zdjęcia"
  ],
  "cards-outline-2": [
    "Cards · 2 outlined · Photo",
    "Karty · 2 z ramką · Zdjęcie"
  ],
  "cards-outline-2-no-image": [
    "Cards · 2 outlined · Text only",
    "Karty · 2 z ramką · Bez zdjęcia"
  ],
  "cards-outline-3": [
    "Cards · 3 outlined · Photo",
    "Karty · 3 z ramką · Zdjęcie"
  ],
  "cards-outline-3-no-image": [
    "Cards · 3 outlined · Text only",
    "Karty · 3 z ramką · Bez zdjęcia"
  ],
  "cards-outline-4": [
    "Cards · 4 outlined · Photo",
    "Karty · 4 z ramką · Zdjęcie"
  ],
  "cards-outline-4-no-image": [
    "Cards · 4 outlined · Text only",
    "Karty · 4 z ramką · Bez zdjęcia"
  ],
  "cards-without-numbers": [
    "Cards · 3 outlined · No numbers · Text only",
    "Karty · 3 z ramką · Bez numerów · Bez zdjęcia"
  ],
  "comparison-outline": [
    "Comparison · Outline · Text only",
    "Porównanie · Ramka · Bez zdjęcia"
  ],
  "comparison-outline-photo": [
    "Comparison · Outline · Photo",
    "Porównanie · Ramka · Zdjęcie"
  ],
  "comparison-filled": [
    "Comparison · Filled · Text only",
    "Porównanie · Wypełnienie · Bez zdjęcia"
  ],
  "comparison-filled-photo": [
    "Comparison · Filled · Photo",
    "Porównanie · Wypełnienie · Zdjęcie"
  ],
  "comparison-plain": [
    "Comparison · Plain text",
    "Porównanie · Bez kart"
  ],
  "process-outline": [
    "Process · Outline · Text only",
    "Proces · Ramka · Bez zdjęcia"
  ],
  "process-outline-photo": [
    "Process · Outline · Photo",
    "Proces · Ramka · Zdjęcie"
  ],
  "process-filled": [
    "Process · Filled · Text only",
    "Proces · Wypełnienie · Bez zdjęcia"
  ],
  "process-filled-photo": [
    "Process · Filled · Photo",
    "Proces · Wypełnienie · Zdjęcie"
  ],
  "process-plain": [
    "Process · Plain text",
    "Proces · Bez kart"
  ],
  "roadmap-outline": [
    "Roadmap · Outline · Text only",
    "Roadmapa · Ramka · Bez zdjęcia"
  ],
  "roadmap-outline-photo": [
    "Roadmap · Outline · Background",
    "Roadmapa · Ramka · Tło po prawej"
  ],
  "roadmap-filled": [
    "Roadmap · Filled · Text only",
    "Roadmapa · Wypełnienie · Bez zdjęcia"
  ],
  "roadmap-filled-photo": [
    "Roadmap · Filled · Background",
    "Roadmapa · Wypełnienie · Tło po prawej"
  ],
  "roadmap-plain": [
    "Roadmap · Plain text",
    "Roadmapa · Bez kart"
  ],
  "table-default": [
    "Table · Data + note",
    "Tabela · Dane i przypis"
  ],
  "table-criteria-matrix": [
    "Table · Criteria matrix",
    "Tabela · Macierz kryteriów"
  ],
  "summary-outline": [
    "Summary · Outlined actions · Text only",
    "Podsumowanie · Działania z ramką · Bez zdjęcia"
  ],
  "summary-outline-photo": [
    "Summary · Outlined actions · Background",
    "Podsumowanie · Działania z ramką · Tło po prawej"
  ],
  "summary-filled": [
    "Summary · Filled actions · Text only",
    "Podsumowanie · Działania z tłem · Bez zdjęcia"
  ],
  "summary-filled-photo": [
    "Summary · Filled actions · Background",
    "Podsumowanie · Działania z tłem · Tło po prawej"
  ],
  "summary-plain": [
    "Summary · Action list",
    "Podsumowanie · Lista działań"
  ],
  "divider-default": [
    "Section opener · Text only",
    "Początek sekcji · Bez zdjęcia"
  ],
  "divider-image": [
    "Section opener · Photo",
    "Początek sekcji · Zdjęcie"
  ],
  "figure-default": [
    "Figure · Centered",
    "Grafika · Na środku"
  ],
  "figure-left": [
    "Figure · Left aligned",
    "Grafika · Do lewej"
  ],
  "figure-no-image": [
    "Figure · Text alternative",
    "Grafika · Wersja tekstowa"
  ],
  "gallery-1": [
    "Gallery · 1 image",
    "Galeria · 1 obraz"
  ],
  "gallery-2": [
    "Gallery · 2 images",
    "Galeria · 2 obrazy"
  ],
  "gallery-3": [
    "Gallery · 3 images",
    "Galeria · 3 obrazy"
  ],
  "metrics-2-emphasis": [
    "Metrics · 2 values + descriptions",
    "Wskaźniki · 2 wartości z opisem"
  ],
  "metrics-3": [
    "Metrics · 3 values + descriptions",
    "Wskaźniki · 3 wartości z opisem"
  ],
  "metrics-4": [
    "Metrics · 4 values + descriptions",
    "Wskaźniki · 4 wartości z opisem"
  ],
  "metrics-4-no-details": [
    "Metrics · 4 values · Labels only",
    "Wskaźniki · 4 wartości · Same etykiety"
  ],
  "quote-avatar": [
    "Quote · Centered + avatar",
    "Cytat · Na środku z awatarem"
  ],
  "quote-centered": [
    "Quote · Centered · Text only",
    "Cytat · Na środku · Bez zdjęcia"
  ],
  "quote-portrait": [
    "Quote · Full-height portrait",
    "Cytat · Portret na całą wysokość"
  ],
  "quote-portrait-no-image": [
    "Quote · Left aligned · Text only",
    "Cytat · Do lewej · Bez zdjęcia"
  ]
};
for(const entry of entries){
 const next=variantNames[entry.id];if(!next)continue;
 entry.aliases={en:[...new Set([...(entry.aliases?.en||[]),entry.name.en])],pl:[...new Set([...(entry.aliases?.pl||[]),entry.name.pl])]};
 entry.name={en:next[0],pl:next[1]};
}
// D93: only the first Cover retains intentional photo/text overlap.
{
 const entry=entries.find(e=>e.id==='cover-default');
 entry.description={en:'A bold title and introduction over a wide photo that extends behind the text. Choose a photo with enough contrast; no gradient is added.',pl:'Wyrazisty tytuł i opis na szerokim zdjęciu, które wchodzi pod tekst. Wybierz zdjęcie z odpowiednim kontrastem; układ nie dodaje gradientu.'};
}
// D91: Figma 92:2368, with existing image-free partner.
entries.splice(entries.findIndex(e=>e.id==='cover-no-image'),0,{"id": "cover-separated", "family": "cover", "source": 0, "photo": true, "pairedTemplate": "cover-no-image", "patch": {"logo": "assets/figma/cover-brand.svg"}, "name": {"en": "Cover · Separate photo", "pl": "Okładka · Zdjęcie obok tekstu"}, "description": {"en": "A clear text column with a separate photo on the right. The photo adapts to the text width, with no overlap or gradient.", "pl": "Wyraźna kolumna tekstu i osobne zdjęcie po prawej. Zdjęcie dopasowuje się do szerokości tekstu, bez nachodzenia i gradientu."}, "instruction": {"en": "Keep the title and optional introduction on the left. Fit the right photo into the remaining width, keeping a 26 px gap from the widest text block and vertical centering on the whole slide. Do not add a contrast gradient or reduce text size to make room for the photo.", "pl": "Zachowaj tytuł i opcjonalny opis po lewej. Dopasuj zdjęcie po prawej do pozostałej szerokości, z odstępem 26 px od najszerszego bloku tekstu i wyśrodkowaniem w pionie względem całego slajdu. Nie dodawaj gradientu dla kontrastu ani nie zmniejszaj fontu, żeby zrobić miejsce na zdjęcie."}});
// D94: full-slide backgrounds are independent of foreground imagery.
entries.splice(entries.findIndex(e=>e.id==='cover-no-image'),0,{"id": "cover-background", "family": "cover", "source": 0, "photo": true, "backgroundRequired": true, "pairedTemplate": "cover-no-image", "patch": {"logo": "assets/figma/cover-brand.svg", "background": {"src": "assets/images/cover-background-light.webp", "alt": "A soft blue, peach and cream abstract background."}}, "name": {"en": "Cover · Background image", "pl": "Okładka · Obraz w tle"}, "description": {"en": "A full-slide background image behind the title and a wide foreground photo. Background photos or graphics can be added to any template.", "pl": "Obraz na całym slajdzie, pod tytułem i szerokim zdjęciem na pierwszym planie. Zdjęcie lub grafikę w tle możesz dodać do każdego szablonu."}, "instruction": {"en": "Use my background image across the whole slide, behind all content, independently of the wide foreground photograph. Keep the authored photo/text overlap and whole-slide photo centering. Use only the assets I supply or explicitly authorize; do not add contrast gradients, overlays or filters. Background photos or graphics are supported on every template.", "pl": "Użyj mojego obrazu na całym slajdzie jako tła pod całą treścią, niezależnie od szerokiego zdjęcia na pierwszym planie. Zachowaj zaprojektowane nachodzenie tekstu na zdjęcie i wyśrodkowanie zdjęcia w pionie względem całego slajdu. Używaj tylko materiałów, które dostarczę lub jawnie zaakceptuję; nie dodawaj gradientów dla kontrastu, nakładek ani filtrów. Zdjęcie lub grafika w tle działa w każdym szablonie."}});
// D89: shared catalogue-only imagery; actual deck instances never inherit sample assets.
for(const entry of entries){
 if(entry.family!=='cards'||entry.noImage)continue;
 entry.patch={...(entry.patch||{}),image:'assets/summary-right-photo.webp',imageAlt:'An abstract blue, cream and warm orange gradient on a dark background.'};
 const previous=entry.name;
 entry.name={en:previous.en.replace(/ · Photo$/,' · Background'),pl:previous.pl.replace(/ · Zdjęcie$/,' · Grafika')};
 entry.aliases={en:[...new Set([...(entry.aliases?.en||[]),previous.en])],pl:[...new Set([...(entry.aliases?.pl||[]),previous.pl])]};
 const side=(entry.cardStyle||'filled')==='outline';
 entry.description={en:entry.description.en+(side?' An abstract background sits behind the cards on the right.':' An abstract background runs along the bottom.'),pl:entry.description.pl+(side?' Abstrakcyjne tło znajduje się po prawej, za kartami.':' Abstrakcyjne tło biegnie wzdłuż dolnej krawędzi.')};
}
for(const entry of entries){
 entry.version=1;const c=structuredClone(layouts[entry.family]);c.background={supported:true,required:entry.backgroundRequired===true,fit:'cover',position:'full-slide',purpose:'decorative',fields:['src','alt']};if(entry.backgroundRequired)c.required.push('background');else c.optional.push('background');
 if(entry.photo){c.required=[...new Set([...c.required,'image'])];c.optional=c.optional.filter(f=>f!=='image');c.image.required=true;}
 if(entry.noImage){c.required=c.required.filter(f=>!['image','imageAlt'].includes(f));c.optional=c.optional.filter(f=>!['image','imageAlt'].includes(f));c.omitted=['image','imageAlt'];c.image={required:false,fit:null,purpose:'none'};}
 if(entry.sidePhoto){c.optional=[...new Set([...c.optional,'imageAlt'])];c.required=[...new Set([...c.required,'imageAlt'])];c.optional=c.optional.filter(f=>f!=='imageAlt');c.image={required:true,fit:'cover',purpose:'decorative',position:'right',verticalCenter:'whole-slide'};Object.assign(c.regions,entry.photoRegions);}
 if(entry.family==='cover'&&entry.photo)c.image=['cover-default','cover-background'].includes(entry.id)?{...c.image,position:'behind-copy',left:614,width:1306,verticalCenter:'whole-slide',overlap:true}:{...c.image,position:'right-of-copy',gap:26,minWidth:320,verticalCenter:'whole-slide',overlap:false};
 if(entry.family==='cards'){c.cardStyle=entry.cardStyle||'filled';c.itemCounts.cards={min:entry.cardCount||3,max:entry.cardCount||3};c.controls={cardNumbers:{type:'boolean',default:entry.patch?.cardNumbers!==false,scope:'slide',omission:'remove badges and their spacing'}};c.controls.cardTypography={allowSmallerText:{type:'boolean',default:false},profile:['auto','normal','compact'],baseSize:[28,30],compactStep:2,scope:'whole-card-row',headings:'unchanged'};c.regions.titleWidth=c.cardStyle==='outline'?744:1389;}
 if(entry.family==='metrics'){c.itemCounts.metrics={min:entry.metricCount,max:entry.metricCount};c.metricDetails=entry.metricDetails;c.metricEmphasis=entry.metricEmphasis;c.regions.defaultTop=entry.metricDetails?177:242;}
 if(entry.family==='comparison')c.comparisonStyle=entry.comparisonStyle;
 if(entry.family==='process')c.processStyle=entry.processStyle;
 if(entry.family==='summary')c.summaryStyle=entry.summaryStyle;
 if(entry.family==='roadmap')c.roadmapStyle=entry.roadmapStyle;
 if(entry.family==='quote'){c.quoteStyle=entry.quoteStyle;c.regions.titleWidth=entry.quoteStyle==='portrait'?1088:1479;}
 if(entry.contentMode==='paragraphs'){c.required=[...c.required,'paragraphs'];c.omitted=[...(c.omitted||[]),'points'];}
 if(entry.family==='table'){c.tableStyle=entry.tableStyle||'data';if(c.tableStyle==='matrix'){c.roles=['criteria-matrix','comparison-matrix','shared-criteria','option-comparison'];c.tableCounts={columns:{min:3,max:5},rows:{min:1,max:6}};c.regions.criteriaWidth=580;c.regions.minRowHeight=85;}}
 if(entry.family==='cover'&&entry.noImage)c.regions.titleWidth=1480;
 if(entry.family==='split'&&entry.noImage)c.regions.titleWidth=1560;
 if(entry.family==='figure'&&entry.noImage){c.required=[...new Set([...c.required,'caption'])];c.optional=c.optional.filter(f=>f!=='caption');c.budgets.captionLines=8;}
 if(entry.family==='gallery')c.itemCounts.images={min:entry.imageCount,max:entry.imageCount};
 const allowedOverrides={title:{fontSize:{min:32,max:220},width:{min:160,max:c.regions.titleWidth},lineHeight:{min:.8,max:1.6},targetLines:{min:1,max:8,integer:true},align:['left','center','right']},group:{verticalAlign:['top','center','bottom'],offsetY:{min:-300,max:300}}};
 if(entry.family==='cover')allowedOverrides.title.textTransform=['uppercase','none'];
 entry.contract={schemaVersion:2,layout:entry.family,palettes:['light','dark'],allowedOverrides:entry.family==='gallery'?{}:entry.family==='quote'?{group:allowedOverrides.group}:entry.family==='figure'?{title:allowedOverrides.title}:allowedOverrides,...c,chrome:chromeContract,instanceDefaults:structuredClone(entry.patch?.overrides?{overrides:entry.patch.overrides}:{}),fallbacks:['paired-no-image-only-when-source-visual-not-required','another-compatible-template','permitted-continuation','report-conflict']};
 if(entry.family==='gallery')entry.contract.imageFreeStrategy='select-another-compatible-designed-template-with-supplied-content';
 if(entry.family==='gallery')entry.contract.fallbacks=['another-compatible-designed-template-preserving-content','permitted-continuation','report-missing-images'];
 if(entry.family==='figure')entry.contract.controls={horizontalAlign:{path:'overrides.title.align',values:['left','center','right'],default:entry.patch?.overrides?.title?.align||'center',scope:'whole-figure-composition'},mediaPlacement:'center-between-intro-and-footer',imageFit:'contain'};
 if(entry.family==='comparison')entry.contract.fallbacks=['another-compatible-comparison-style','permitted-continuation-preserving-both-options','report-conflict'];
 if(entry.family==='process')entry.contract.fallbacks=['another-compatible-process-style','another-designed-layout-preserving-the-complete-sequence','report-count-or-fit-conflict'];
 if(entry.family==='roadmap')entry.contract.fallbacks=['another-compatible-roadmap-style','another-designed-layout-preserving-dates-and-milestones','report-count-or-fit-conflict'];
 if(entry.family==='summary')entry.contract.fallbacks=['another-compatible-summary-appearance-with-the-same-imagery','source-preserving-compatible-layout','report-count-or-fit-conflict'];
 if(entry.family==='cards'&&entry.patch?.cardNumbers===false)entry.contract.instanceDefaults.cardNumbers=false;
 if(entry.patch?.description===null)entry.contract.omitted=[...(entry.contract.omitted||[]),'description'];
 if(entry.example)entry.previewMetadata={footer:'BRITE / LAYOUT EXAMPLE',date:base.date};
 if(['agenda','divider','gallery','metrics','quote'].includes(entry.family))entry.previewMetadata={footer:base.footer,date:base.date};
}
for(const entry of entries)if(entry.contract.image.required&&!entry.contract.image.collection){const partner=entries.find(e=>e.id===entry.pairedTemplate);if(!partner?.noImage||partner.family!==entry.family)throw new Error(`Image template ${entry.id} needs a same-family no-image counterpart.`);}
function validLayoutState(value){
 const object=v=>v&&typeof v==='object'&&!Array.isArray(v),only=(v,keys)=>object(v)&&Object.keys(v).every(k=>keys.includes(k)),hash=v=>typeof v==='string'&&/^[a-f\d]{64}$/.test(v),length=v=>v===null||(Number.isInteger(v)&&v>=0&&v<=4000);
 if(!only(value,['version','cards','split','cover'])||value.version!==1)return false;
 if(value.cards){
  const c=value.cards;if(!only(c,['items','cardNumbers','cardTypography'])||(c.cardNumbers!=null&&typeof c.cardNumbers!=='boolean'))return false;
  if(c.items&&(!Array.isArray(c.items)||c.items.length<2||c.items.length>4||new Set(c.items.map(i=>i?.id)).size!==c.items.length||c.items.some(i=>!only(i,['id','titleLength','descriptionLength','hash'])||typeof i.id!=='string'||!/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/.test(i.id)||!length(i.titleLength)||!length(i.descriptionLength)||!hash(i.hash))))return false;
  if(c.cardTypography){const t=c.cardTypography;if(!only(t,['allowSmallerText','profile','baseSize'])||typeof t.allowSmallerText!=='boolean'||(t.profile!=null&&!['auto','normal','compact'].includes(t.profile))||(t.baseSize!=null&&![28,30].includes(t.baseSize))||(t.profile==='compact'&&!t.allowSmallerText))return false;}
 }
 if(value.split&&(!only(value.split,['paragraphLengths','hash'])||!Array.isArray(value.split.paragraphLengths)||value.split.paragraphLengths.length>12||value.split.paragraphLengths.some(n=>!Number.isInteger(n)||n<0||n>4000)||!hash(value.split.hash)))return false;
 if(value.cover&&(!only(value.cover,['textTransform'])||!['none','uppercase'].includes(value.cover.textTransform)))return false;
 return true;
}
function validateContract(slide){
 const issues=[],add=(field,message)=>issues.push({field,message});
 if(!slide||typeof slide!=='object'||Array.isArray(slide))return [{field:'content',message:'Slide data must be an object.'}];
 if(!layouts[slide.layout])return [{field:'layout',message:'Choose a registered layout.'}];
 const entry=slide.template?.id?entries.find(e=>e.id===slide.template.id):null;
 if(slide.template&&(!entry||entry.version!==slide.template.version||entry.family!==slide.layout))add('template','The template reference or version is not supported.');
 const c=contractFor(slide),allowed=new Set([...c.required,...c.optional,...(c.omitted||[]),'id','layout','template','label','overrides','chrome','palette','background','layoutState']);
 if(Object.hasOwn(slide,'layoutState')&&!validLayoutState(slide.layoutState))add('layoutState','Layout state may contain only validated role lengths, hashes, IDs and restorable layout settings; never hidden body text.');
 if(slide.background!=null&&!validBackground(slide.background))add('background','Background needs a source and meaningful alt text, with no extra fields.');
 if(Object.hasOwn(slide,'palette')&&!['light','dark'].includes(slide.palette))add('palette','Slide palette must be light or dark.');
 for(const field of Object.keys(slide))if(!allowed.has(field))add(field,`This layout does not accept the field: ${field}.`);
 for(const field of c.required){const value=slide[field],valid=field==='background'?validBackground(value):field==='table'?value&&typeof value==='object'&&!Array.isArray(value):field==='title'?hasText(value)||(Array.isArray(value)&&value.length>0&&value.every(hasText)):['cards','columns','steps','actions','milestones','items','images','metrics','paragraphs','points'].includes(field)?Array.isArray(value)&&value.length>0:hasText(value);if(!valid)add(field,`Required content is missing or invalid: ${field}.`);}
 if(c.anyOf&&!c.anyOf.some(field=>Array.isArray(slide[field])&&slide[field].length))add('body','Provide at least one paragraph or list item.');
 for(const field of ['paragraphs','points'])if(slide[field]!=null&&(!Array.isArray(slide[field])||!slide[field].every(hasText)))add(field,'Provide an array of nonempty text items.');
 for(const[field,bounds]of Object.entries(c.itemCounts))if(Array.isArray(slide[field])&&(slide[field].length<bounds.min||slide[field].length>bounds.max))add(field,`Unsupported item count for ${field}: use ${bounds.min} to ${bounds.max}.`);
 for(const field of ['description','caption','section','sectionNumber','logo','image','imageAlt','takeaway','takeawayLabel','takeawayDescription'])if(slide[field]!=null&&typeof slide[field]!=='string')add(field,`This field must be text or null: ${field}.`);
 if(slide.layout==='summary'&&(!Array.isArray(slide.actions)||slide.actions.some(a=>!a||typeof a!=='object'||Array.isArray(a)||Object.keys(a).some(k=>!['title','description'].includes(k))||!hasText(a.title)||(a.description!=null&&typeof a.description!=='string'))))add('actions','Provide actions with a nonempty title and optional text description. Preserve each supplied detail; owners/dates belong in the supplied text, not invented metadata.');
 if(slide.layout==='table'){
  const bounds=c.tableCounts;
  const t=slide.table,valid=t&&typeof t==='object'&&!Array.isArray(t)&&Object.keys(t).every(k=>['headers','rows','alignments'].includes(k))&&Array.isArray(t.headers)&&t.headers.length>=bounds.columns.min&&t.headers.length<=bounds.columns.max&&t.headers.every(h=>typeof h==='string')&&t.headers.some(hasText)&&Array.isArray(t.rows)&&t.rows.length>=bounds.rows.min&&t.rows.length<=bounds.rows.max&&t.rows.every(row=>Array.isArray(row)&&row.length===t.headers.length&&row.every(cell=>typeof cell==='string'));
  if(!valid)add('table',`Provide a rectangular ${c.tableStyle==='matrix'?'comparison matrix':'table'} with ${bounds.columns.min} to ${bounds.columns.max} text headers and ${bounds.rows.min} to ${bounds.rows.max} equal-length body rows. Blank cells are allowed; preserve them rather than filling them.`);
  if(t?.alignments!=null&&(!Array.isArray(t.alignments)||t.alignments.length!==t.headers?.length||t.alignments.some(a=>a!==null&&!['left','center','right'].includes(a))))add('table','Column alignments must match the header count and use left, center, right or null for the designed default.');
 }
 if(slide.layout==='roadmap'){
  if(!Array.isArray(slide.milestones)||slide.milestones.length<2||slide.milestones.length>4||slide.milestones.some(m=>!m||typeof m!=='object'||Array.isArray(m)||Object.keys(m).some(k=>!['period','year','title','points'].includes(k))||!hasText(m.title)||(m.period!=null&&typeof m.period!=='string')||(m.year!=null&&typeof m.year!=='string')||(m.points!=null&&(!Array.isArray(m.points)||m.points.length>4||!m.points.every(hasText)))))add('milestones','Provide two to four milestones with titles, optional text period/year and up to four text points each.');
  if(Array.isArray(slide.milestones)&&!slide.milestones.some(m=>m&&(hasText(m.period)||hasText(m.year))))add('milestones','Roadmap needs at least one supplied time horizon. Use a compatible Process or cards composition when no timing is supplied; never invent dates.');
 }
 if(slide.layout==='process'){
  if(!Array.isArray(slide.steps)||slide.steps.length<2||slide.steps.length>4||slide.steps.some(step=>!step||typeof step!=='object'||Array.isArray(step)||Object.keys(step).some(k=>!['title','description'].includes(k))||!hasText(step.title)||(step.description!=null&&typeof step.description!=='string')))add('steps','Provide two to four ordered steps, each with a title and optional text description.');
 }
 if(slide.layout==='comparison'){
  if(!Array.isArray(slide.columns)||slide.columns.length!==2||slide.columns.some(column=>!column||typeof column!=='object'||Array.isArray(column)||Object.keys(column).some(k=>!['title','items'].includes(k))||!hasText(column.title)||!Array.isArray(column.items)||column.items.length<1||column.items.length>4||column.items.some(item=>!item||typeof item!=='object'||Array.isArray(item)||Object.keys(item).some(k=>!['title','description'].includes(k))||!hasText(item.title)||(item.description!=null&&typeof item.description!=='string'))))add('columns','Provide exactly two titled comparison columns, each with one to four titled items and optional text descriptions.');
 }
 if(slide.layout==='gallery'){
  if(!Array.isArray(slide.images)||slide.images.some(item=>!item||typeof item!=='object'||!hasText(item.src)||!hasText(item.alt)||Object.keys(item).some(k=>!['src','alt','fit'].includes(k))||(item.fit!=null&&!['cover','contain'].includes(item.fit))))add('images','Gallery images need a source, meaningful alt text, and optional cover or contain fitting.');
  if(slide.overrides&&Object.keys(slide.overrides).length)add('overrides','Gallery image positions are fixed; choose image fitting instead of title or group overrides.');
 }
 if(slide.layout==='metrics'){
  if(!Array.isArray(slide.metrics)||slide.metrics.some(m=>!m||typeof m!=='object'||Object.keys(m).some(k=>!['value','label','description'].includes(k))||!hasText(m.value)||!hasText(m.label)||(m.description!=null&&typeof m.description!=='string')))add('metrics','Each metric needs a supplied text value and label, with an optional description.');
  if(c.metricDetails===false&&slide.metrics?.some(m=>hasText(m.description)))add('metrics','This variant omits metric descriptions. Choose a detailed variant to preserve them.');
 }
 if(slide.layout==='quote'){
  for(const key of ['author','authorRole'])if(slide[key]!=null&&typeof slide[key]!=='string')add(key,'Quote attribution must be text or null.');
  if(hasText(slide.authorRole)&&!hasText(slide.author))add('author','A role needs a supplied author; omit both for an anonymous quote.');
  if(slide.overrides?.title)add('overrides','Quotes support group overrides, not a separate title override.');
 }
 if(Object.hasOwn(slide,'cardTypography')){
  const t=slide.cardTypography;if(!t||typeof t!=='object'||Array.isArray(t)||Object.keys(t).some(k=>!['allowSmallerText','profile','baseSize'].includes(k))||typeof t.allowSmallerText!=='boolean'||(t.profile!=null&&!['auto','normal','compact'].includes(t.profile))||(t.baseSize!=null&&![28,30].includes(t.baseSize)))add('cardTypography','Use a card typography object with an explicit allowSmallerText boolean and supported profile or base size.');
  else if(t.profile==='compact'&&!t.allowSmallerText)add('cardTypography','Compact card text requires explicit permission to use smaller text.');
 }
 if(Object.hasOwn(slide,'cardNumbers')&&typeof slide.cardNumbers!=='boolean')add('cardNumbers','Card numbers must be true or false.');
 if(slide.sectionNumber?.length>8)add('sectionNumber','Keep the section number within eight characters.');
 if(Array.isArray(slide.cards)&&slide.cards.some(card=>!card||(!hasText(card.title)&&!hasText(card.description))||(card.title!=null&&typeof card.title!=='string')||(card.description!=null&&typeof card.description!=='string')||Object.keys(card).some(k=>!['id','title','description'].includes(k))))add('cards','Each card needs a title or body text, or both; never invent headings for body-only content. Choose a matching two-, three-, or four-card template.');
 if(Array.isArray(slide.items)&&slide.items.some(item=>!item||!hasText(item.title)||Object.keys(item).some(k=>!['title','description','page','target'].includes(k))||(item.description!=null&&typeof item.description!=='string')||(item.page!=null&&(!Number.isInteger(item.page)||item.page<1))||(item.target!=null&&!hasText(item.target))||(item.target!=null&&item.page!=null)))add('items','Agenda items need a title, optional description, and either a positive page number or a target slide ID.');
 if(Array.isArray(slide.cards)){const ids=slide.cards.filter(card=>card?.id!=null).map(card=>card.id);if(ids.some(id=>typeof id!=='string'||!/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/.test(id))||new Set(ids).size!==ids.length)add('cards','Card IDs must be nonempty, unique identifiers within the slide.');}
 for(const field of c.omitted||[])if(hasText(slide[field])||(Array.isArray(slide[field])&&slide[field].length))add(field,`This template omits the field: ${field}. Choose another variant to keep this content.`);
 issues.push(...validateChrome(slide.chrome));return issues;
}
function instantiate(id,content={}){const entry=get(id),slide=merge({layout:entry.family,...structuredClone(entry.contract.instanceDefaults)},content);slide.layout=entry.family;slide.template={id,version:entry.version};return slide;}
function materialize(id,patch={}){const entry=get(id),sample=entry.example||base.slides[entry.source],slide=merge(merge(structuredClone(sample),entry.patch||{}),patch);if(entry.example)slide.logo=entry.family==='table'?'assets/figma/table-brand.svg':entry.family==='roadmap'?'assets/figma/roadmap-brand.svg':entry.family==='process'?'assets/figma/process-brand.svg':entry.family==='comparison'?'assets/figma/comparison-brand.svg':entry.family==='figure'?'assets/figma/figure-brand.svg':'assets/figma/brite-shared.svg';if(entry.family==='cards')slide.logo='assets/figma/cards-brand.svg';if(entry.id==='cover-background'&&!Object.hasOwn(patch,'background'))slide.background={src:`assets/images/cover-background-${slide.palette==='dark'?'dark':'light'}.webp`,alt:slide.palette==='dark'?'A dark abstract background with blue, teal, pink and orange light.':'A soft blue, peach and cream abstract background.'};if(entry.family==='cover'&&hasText(slide.image)&&slide.palette==='dark'&&!Object.hasOwn(patch,'image')){slide.image='assets/images/cover-dark-photo.webp';slide.imageAlt='A person using a banking app on a phone, with a blue sleeve and warm brown background.';}slide.template={id,version:entry.version};return slide;}
function prompt(id,language='en',palette='light'){
 if(!['light','dark'].includes(palette))throw new Error('Slide palette must be light or dark.');
 const e=get(id),pl=language==='pl',paletteName=palette==='dark'?(pl?'ciemnej':'Dark'):(pl?'jasnej':'Light');
 const numbers=e.family==='cards'?(pl?' Numerki kart są opcjonalne: cardNumbers:false usuwa je razem z odstępami, bez zmiany numeracji stron.':' Card badges are optional: cardNumbers:false removes them and their spacing without changing footer page numbers.'):'';
 const photoPlacement=['cover-default','cover-background'].includes(e.id)?(pl?' W tym wariancie zdjęcie celowo wchodzi pod tekst: zachowaj szeroki kadr od x614 do prawej krawędzi, wyśrodkowany w pionie względem całego slajdu, bez gradientu. Sprawdź czytelność z moim zdjęciem; jeśli jest niewystarczająca, zaproponuj cover-separated bez zmiany moich tekstów.':' In this variant the photo intentionally extends behind the text: keep its wide frame from x614 to the right edge, vertically centered on the whole slide, without a gradient. Check legibility with my photo; if needed, suggest cover-separated without rewriting my text.'):e.family==='cover'&&e.photo?(pl?' Dopasuj szerokość zdjęcia do pozostałego miejsca, zachowując 26 px odstępu od całego tekstu. Nie nakładaj tekstu na zdjęcie, nie dodawaj gradientu ani nie zmniejszaj fontu dla kontrastu.':' Fit the photo into the remaining width with a 26 px gap from all text. Do not overlap text and photo, add a contrast gradient, or reduce type to make room.'):'';
 const casing=e.family==='cover'?(pl?' Tytuł okładki domyślnie wyświetl wielkimi literami bez zmiany źródła; jeśli poproszę o oryginalną pisownię, użyj overrides.title.textTransform:"none".':' Display the Cover title in uppercase without changing source wording; if I request original case, use overrides.title.textTransform:"none".'):'';
 const backgroundHelp=pl?' Tło możesz dodać do każdego szablonu jako background:{src,alt}, niezależnie od innych zdjęć. Zapisz je tylko, gdy poproszę o tło; nie kopiuj obrazów z podglądu.':' A background image is available on every template as background:{src,alt}, independently of other photos. Add it only when I request it; never inherit preview imagery.';
 const common=pl?'Nagłówek i stopkę ustaw zgodnie z moimi wskazówkami: logo lub nazwa tekstowa, nazwa sekcji, tekst po lewej, automatyczna numeracja i tekst po prawej są niezależnie opcjonalne. Nie kopiuj danych marki ani daty z podglądu.':'Follow my header/footer choices: image or text brand, section label, left footer, automatic page numbers, and right footer are independently optional. Never inherit sample branding or dates.';
 return pl?`Pracuj w folderze tego projektu i przeczytaj AGENT_GUIDE.md. Użyj szablonu wizualnego Brite (visualTemplate: brite, wersja 1.0.0). Dodaj na końcu mojej prezentacji nowy slajd z szablonu „${e.name.pl}” (ID: ${id}, wersja ${e.version}), w ${paletteName} palecie (ustaw palette:"${palette}" na slajdzie). ${e.instruction.pl}${numbers}${casing}${photoPlacement} ${common}${backgroundHelp} Użyj mojej treści w oryginalnym języku. Zapytaj tylko o brakujące wymagane elementy. Nie kopiuj tekstów ani obrazów z podglądu. Zapisz niezależny slajd w presentation.js, sprawdź kontrakt i dopasowanie oraz przygotuj podgląd HTML i PDF zawierające wyłącznie moją prezentację. Otwórz podgląd, jeśli aplikacja to umożliwia, i podaj osobne linki do HTML i PDF.\n\nMoja treść:`:`Read AGENT_GUIDE.md in this project folder. Use the Brite visual template (visualTemplate: brite, version 1.0.0). Append a slide using “${e.name.en}” (template ID: ${id}, version ${e.version}) in the ${paletteName} palette (set palette:"${palette}" on the slide). ${e.instruction.en}${numbers}${casing}${photoPlacement} ${common}${backgroundHelp} Use my supplied content in its original language. Ask only for missing required fields. Do not copy preview text or imagery. Save an independent slide in presentation.js, validate its contract and fit, then prepare an HTML preview and PDF containing only my presentation. Open the preview where the host supports it and return separate HTML and PDF links.\n\nMy content:`;
}
// Discovery metadata describes use, never sample facts or the user's slide text.
const searchTerms={
 cover:{en:'opening introduction first slide title pitch presentation start headline',pl:'otwarcie początek pierwsza strona wprowadzenie tytuł okładka linie'},
 agenda:{en:'contents table of contents navigation meeting plan workshop topics overview outline',pl:'spis treści plan spotkania warsztat tematy przegląd zawartość orientacja'},
 split:{en:'explanation context problem solution story narrative product detail text paragraph bullets list',pl:'wyjaśnienie kontekst problem rozwiązanie historia narracja opis produktu szczegóły tekst akapit punkty lista'},
 cards:{en:'features benefits advantages value proposition capabilities pillars services offer highlights',pl:'funkcje korzyści zalety wartości możliwości filary usługi oferta najważniejsze bloki'},
 divider:{en:'section chapter transition separator pause introduction new topic',pl:'sekcja rozdział przejście separator przerwa wprowadzenie nowy temat'},
 figure:{en:'screenshot screen interface product demo diagram chart graph illustration caption visual evidence',pl:'screenshot zrzut ekranu interfejs demo produktu diagram wykres ilustracja podpis schemat dowód'},
 gallery:{en:'photographs pictures images portfolio moodboard collection visual showcase',pl:'zdjęcia fotografie obrazy portfolio moodboard kolekcja realizacje pokaz wizualny'},
 metrics:{en:'results numbers statistics kpi performance growth revenue traction impact business report',pl:'wyniki liczby statystyki wskaźniki efekty wzrost przychody trakcja raport biznesowy'},
 quote:{en:'customer feedback opinion testimonial review endorsement quotation voice social proof',pl:'opinia opinie klienta klientów referencje rekomendacja recenzja cytat wypowiedź głos zaufanie'},
 comparison:{en:'compare options alternatives before after versus differences approaches choice decision',pl:'porównanie opcji warianty alternatywy przed po różnice podejścia wybór decyzja'},
 process:{en:'workflow how it works steps sequence implementation onboarding method journey',pl:'jak to działa kroki etapy proces przebieg kolejność plan wdrożenia onboarding metoda ścieżka'},
 roadmap:{en:'timeline schedule milestones release launch future strategy planning implementation dates quarters',pl:'oś czasu harmonogram kamienie milowe plan wdrożenia premiery przyszłość strategia daty terminy kwartały'},
 table:{en:'data dataset report budget pricing costs comparison criteria matrix options values',pl:'dane zestawienie raport budżet cennik koszty porównanie kryteria macierz opcji wartości'},
 summary:{en:'conclusion recap takeaway closing next steps actions follow up decision recommendations priorities',pl:'wnioski podsumowanie zakończenie kolejne kroki działania decyzja rekomendacje priorytety'}
};
for(const family of families)family.searchTerms=searchTerms[family.id]||{en:'',pl:''};
const activeEntries=entries.filter(e=>e.id!=='text-default'&&!e.retired);
const normalizeSearch=value=>String(value??'').toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/ł/g,'l').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
const searchIndex=new Map(activeEntries.map(entry=>{
 const family=families.find(f=>f.id===entry.family),style=['cardStyle','comparisonStyle','processStyle','roadmapStyle','summaryStyle'].map(key=>entry.contract[key]).find(Boolean);
 const styles={outline:'outline outlined border frame obramowanie ramka',filled:'filled fill surface wypełnienie tło',plain:'plain minimal simple bez ramki prosty'};
 const text=[entry.id,...Object.values(entry.name),...Object.values(entry.description),...Object.values(entry.aliases||{}).flat(),...Object.values(family.name),...Object.values(family.description),...Object.values(family.searchTerms),styles[style]||'',entry.contract.image.required?'':'text only sam tekst'];
 return[entry.id,new Set(normalizeSearch(text.join(' ')).split(' '))];
}));
function search(query=''){
 const exact=activeEntries.find(entry=>entry.id===String(query??'').trim().toLowerCase());
 if(exact)return[exact];
 let value=normalizeSearch(query),media=null,conflict=false;
 const requireMedia=next=>{if(media!==null&&media!==next)conflict=true;media=next;return' ';};
 value=value.replace(/\b(?:without|no) (?:a )?(?:photos?|images?|pictures?|photographs?|photography)\b|\bbez (?:zdjecia|zdjec|obrazu|obrazow|grafiki)\b/g,()=>requireMedia(false));
 value=value.replace(/\bwith (?:a )?(?:photos?|images?|pictures?|photographs?|photography)\b|\b(?:ze|z) (?:zdjeciem|zdjeciami|obrazem|grafika)\b/g,()=>requireMedia(true));
 if(conflict)return[];
 const terms=value.trim().split(/\s+/).filter(Boolean);
 return activeEntries.filter(entry=>{
  const hasMedia=entry.contract.image.required===true||entry.contract.background?.required===true;
  return(media===null||hasMedia===media)&&terms.every(term=>[...searchIndex.get(entry.id)].some(word=>word.startsWith(term)));
 });
}
window.BriteCatalog=Object.freeze({schemaVersion:2,visualTemplate:Object.freeze({id:'brite',version:'1.0.0'}),entries:freeze(activeEntries),families:freeze(families.filter(f=>f.id!=='text')),layouts:freeze(layouts),chromeContract:freeze(chromeContract),validateChrome,resolveChrome,contractFor,instantiate,validateContract,materialize,prompt,merge,search,getContract:id=>structuredClone(get(id).contract),metadata:Object.freeze({footer:base.footer,date:base.date,language:base.language})});
})();
