/* Edit this file to change the content. No build step or server is required. */
window.BRITE_DECKS = {
  brite: {
    title: 'Brite — banking app',
    language: 'en',
    footer: 'BRITE | BANKING APP',
    date: 'SEPT 28, 2027',
    slides: [
      {
        id: 'cover', layout: 'cover', label: 'Cover / light',
        title: ['SPEND TODAY.', 'PLAN FOR TOMORROW.'],
        description: 'A banking app that helps you manage everyday spending, save for your plans, and see what you can afford.',
        image: 'assets/images/cover.webp',
        imageAlt: 'A hand holding a smartphone against a light background.',
        logo: 'assets/images/brite-logo.svg'
      },
      {
        id: 'problem', layout: 'split', label: 'Text + image', section: 'THE PROBLEM',
        title: 'Your balance doesn’t tell the whole story.',
        paragraphs: [
          'There’s money in your account. But rent is due next week, subscriptions are about to renew, and you’re saving for a trip. Your balance alone doesn’t show how much you can spend today.',
          'Working that out means checking upcoming payments, subtracting expenses, and remembering what you’ve already set aside. Even a small purchase can take more thought than it should.'
        ],
        points: ['What’s already committed?', 'What should stay in savings?', 'What’s actually available to spend?'],
        image: 'assets/images/problem.webp',
        imageAlt: 'Hands using a banking application on a smartphone.',
        logo: 'assets/images/brite-logo-problem.svg'
      },
      {
        id: 'solution', layout: 'cards', label: 'Three cards / image below', section: 'THE SOLUTION',
        title: 'Know what you can spend.',
        description: 'Brite brings your balance, upcoming bills, and savings goals into one view. See what’s available after your commitments are accounted for, without doing the maths every time.',
        cards: [1, 2, 3].map(() => ({
          title: 'Plan ahead. Enjoy what’s left.',
          description: 'Check what’s coming up, keep your savings on track, and make everyday spending decisions with a clearer picture.'
        })),
        image: 'assets/images/cards-background.webp',
        imageAlt: '',
        logo: 'assets/images/brite-logo-cards.svg'
      }
    ]
  },
  test: {
    title: 'Brite — Polish content example',
    language: 'pl',
    footer: 'BRITE | CODZIENNE FINANSE',
    date: '03 NOV, 2026',
    slides: [
      {
        id: 'cover', layout: 'cover', label: 'Cover / Polish characters',
        title: ['TWÓJ PLAN.', 'TWOJE MOŻLIWOŚCI.'],
        description: 'Rachunki, codzienne zakupy i oszczędności na dłuższy wyjazd. Zobacz, ile możesz dziś wydać, uwzględniając wszystko, co już zaplanowano.',
        image: 'assets/images/cover.webp',
        imageAlt: 'Dłoń trzymająca telefon na jasnym tle.',
        logo: 'assets/images/brite-logo.svg'
      },
      {
        id: 'problem', layout: 'split', label: 'Text + image / longer content', section: 'CODZIENNE DECYZJE',
        title: 'Każdy wydatek ma swój dalszy ciąg.',
        paragraphs: [
          'Płacisz za kawę, kupujesz bilet i dorzucasz się do wspólnego prezentu. Każda z tych kwot jest niewielka. Dopiero pod koniec tygodnia widzisz, jak dużo zniknęło z konta — i próbujesz odtworzyć, na co właściwie poszły te pieniądze.',
          'Do tego dochodzą rachunki, które czekają na opłacenie, oraz oszczędności na wakacje. Żeby ocenić kolejny zakup, potrzebujesz widoku łączącego dzisiejsze wydatki z planami na następne tygodnie.'
        ],
        points: ['Sprawdź zbliżające się płatności.', 'Uwzględnij oszczędności na później.', 'Zobacz kwotę dostępną na dziś.'],
        image: 'assets/images/problem.webp',
        imageAlt: 'Dłonie obsługujące aplikację bankową na telefonie.',
        logo: 'assets/images/brite-logo-problem.svg'
      },
      {
        id: 'solution', layout: 'cards', label: 'Three cards / varied content lengths', section: 'TWÓJ PLAN',
        title: 'Miejsce na Twoje plany.',
        description: 'Zobacz najbliższe opłaty, odłóż wybraną kwotę i sprawdź, co zostaje na codzienne wydatki. Jeden widok pomaga połączyć małe decyzje z większymi planami.',
        cards: [
          { title: 'Rachunki.', description: 'Czynsz, telefon i subskrypcje. Zobacz, które opłaty pojawią się przed kolejną wypłatą.' },
          { title: 'Oszczędności na później.', description: 'Ustal cel i zdecyduj, ile chcesz na niego odłożyć. Pieniądze na wyjazd pozostają częścią Twojego planu.' },
          { title: 'Ile zostaje na co dzień?', description: 'Sprawdź kwotę dostępną po uwzględnieniu planowanych opłat i oszczędności. Łatwiej ocenisz, czy kolejny zakup mieści się w Twoim budżecie.' }
        ],
        image: 'assets/images/cards-background.webp',
        imageAlt: '',
        logo: 'assets/images/brite-logo-cards.svg'
      }
    ]
  }
};
