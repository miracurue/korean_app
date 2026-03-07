export interface PoemWord {
  text: string;
  baseForm?: string;
  particles?: string;
  translation: string;
  grammar?: string;
}

export interface PoemLine {
  id: number;
  translation?: string;
  words: PoemWord[];
}

export interface PoemStanza {
  id: number;
  lines: PoemLine[];
}

export interface Poem {
  id: number;
  title: string;
  koreanTitle: string;
  author: string;
  tags: string[];
  hasAudio: boolean;
  image: string;
  artisticTranslation: string;
  stanzas: PoemStanza[];
}

export const POEMS: Poem[] = [
  {
    id: 1,
    title: 'Три медведя',
    koreanTitle: '곰 세 마리',
    author: 'Народная (Детская)',
    tags: ['Детские стихи', 'Песни', 'Семья', 'Основы'],
    hasAudio: true,
    image: '/pics/bear.png', // Fallback if no images, but using transparent for now in UI
    artisticTranslation: "Три медведя живут в одном доме:\nПапа-медведь, мама-медведица, малыш-медвежонок.\nПапа-медведь — толстый,\nМама-медведица — стройная,\nМалыш-медвежонок — такой милый!\nУх ты, ух ты, как здорово!",
    stanzas: [
      {
        id: 1,
        lines: [
          {
            id: 11,
            translation: "Три медведя живут в одном доме",
            words: [
              { text: "곰", baseForm: "곰", translation: "Медведь", grammar: "Существительное" },
              { text: "세", baseForm: "셋", translation: "Три", grammar: "Числительное (исконно корейское)" },
              { text: "마리가", baseForm: "마리", particles: "가", translation: "Штуки (для животных)", grammar: "Счетное слово + им. падеж" },
              { text: "한", baseForm: "하나", translation: "Один", grammar: "Числительное" },
              { text: "집에", baseForm: "집", particles: "에", translation: "В доме", grammar: "Существительное + местный падеж" },
              { text: "있어", baseForm: "있다", particles: "어", translation: "Находятся / Живут", grammar: "Глагол наличия" }
            ]
          },
          {
            id: 12,
            translation: "Папа-медведь, мама-медведица, малыш-медвежонок.",
            words: [
              { text: "아빠", baseForm: "아빠", translation: "Папа", grammar: "Существительное" },
              { text: "곰,", translation: "Медведь,", grammar: "Существительное" },
              { text: "엄마", baseForm: "엄마", translation: "Мама", grammar: "Существительное" },
              { text: "곰,", translation: "Медведь,", grammar: "Существительное" },
              { text: "애기", baseForm: "애기 (아기)", translation: "Малыш (Ребенок)", grammar: "Существительное" },
              { text: "곰", translation: "Медведь", grammar: "Существительное" }
            ]
          }
        ]
      },
      {
        id: 2,
        lines: [
          {
            id: 21,
            translation: "Папа-медведь — толстый (крепкий)",
            words: [
              { text: "아빠", translation: "Папа", grammar: "" },
              { text: "곰은", baseForm: "곰", particles: "은", translation: "Медведь (тема)", grammar: "Существительное + выделительная частица" },
              { text: "뚱뚱해", baseForm: "뚱뚱하다", particles: "해", translation: "Толстый", grammar: "Прилагательное" }
            ]
          },
          {
            id: 22,
            translation: "Мама-медведица — стройная",
            words: [
              { text: "엄마", translation: "Мама", grammar: "" },
              { text: "곰은", baseForm: "곰", particles: "은", translation: "Медведь (тема)", grammar: "" },
              { text: "날씬해", baseForm: "날씬하다", particles: "해", translation: "Стройная", grammar: "Прилагательное" }
            ]
          },
          {
            id: 23,
            translation: "Малыш-медвежонок — такой милый!",
            words: [
              { text: "애기", translation: "Малыш", grammar: "" },
              { text: "곰은", baseForm: "곰", particles: "은", translation: "Медведь (тема)", grammar: "" },
              { text: "너무", baseForm: "너무", translation: "Слишком / Очень", grammar: "Наречие" },
              { text: "귀여워", baseForm: "귀엽다", particles: "워", translation: "Милый", grammar: "Прилагательное (ㅂ-исключение)" }
            ]
          },
          {
            id: 24,
            translation: "Ух ты, ух ты, как здорово! (звукоподражание пожимания плечами)",
            words: [
              { text: "으쓱", baseForm: "으쓱하다", translation: "Поводить плечами", grammar: "Звукоподражание (의태어)" },
              { text: "으쓱", translation: "Поводить плечами", grammar: "Звукоподражание" },
              { text: "잘한다", baseForm: "잘하다", particles: "ㄴ다", translation: "Хорошо делает / Молодец", grammar: "Глагол" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Бабочка (Набия)',
    koreanTitle: '나비야',
    author: 'Народная (Детская)',
    tags: ['Детские стихи', 'Песни', 'Природа'],
    hasAudio: true,
    image: '/pics/butterfly.png',
    artisticTranslation: "Бабочка, бабочка, лети сюда!\nЖелтая бабочка, белая бабочка, танцуя, летите сюда.",
    stanzas: [
      {
        id: 1,
        lines: [
          {
            id: 11,
            translation: "Бабочка, бабочка, лети сюда!",
            words: [
              { text: "나비야", baseForm: "나비", particles: "야", translation: "Бабочка (обращение)", grammar: "Звательный падеж" },
              { text: "나비야", translation: "Бабочка (обращение)", grammar: "" },
              { text: "이리", baseForm: "이리", translation: "Сюда", grammar: "Наречие направления" },
              { text: "날아오너라", baseForm: "날아오다", particles: "너라", translation: "Прилетай", grammar: "Глагол (лететь сюда) + повелительное накл." }
            ]
          },
          {
            id: 12,
            translation: "Желтая бабочка, белая бабочка, танцуя, летите сюда.",
            words: [
              { text: "노랑나비", baseForm: "노랗다 + 나비", translation: "Желтая бабочка", grammar: "Прилагательное + Существительное" },
              { text: "흰나비", baseForm: "희다 + 나비", translation: "Белая бабочка", grammar: "Прилагательное + Существительное" },
              { text: "춤을", baseForm: "춤", particles: "을", translation: "Танец", grammar: "Винительный падеж" },
              { text: "추며", baseForm: "추다", particles: "며", translation: "Танцуя", grammar: "Деепричастие одновременности" },
              { text: "오너라", translation: "Прилетай/Приходи", grammar: "Глагол 오다 + повелит. 일/너라" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'Молоко',
    koreanTitle: '우유',
    author: 'Детская поэзия',
    tags: ['Детские стихи', 'Еда', 'Основы'],
    hasAudio: false,
    image: '/pics/milk.png',
    artisticTranslation: "Белое молоко, вкусное молоко.\nЕсли выпью молоко — вырасту большим!",
    stanzas: [
      {
        id: 1,
        lines: [
          {
            id: 11,
            translation: "Белое молоко, вкусное молоко",
            words: [
              { text: "하얀", baseForm: "하얗다", translation: "Белое", grammar: "Прилагательное + 오/은 (определение)" },
              { text: "우유,", baseForm: "우유", translation: "Молоко,", grammar: "Существительное" },
              { text: "맛있는", baseForm: "맛있다", particles: "는", translation: "Вкусное", grammar: "Прилагательное + 는 (определение)" },
              { text: "우유", translation: "Молоко", grammar: "Существительное" }
            ]
          },
          {
            id: 12,
            translation: "Если выпью молоко, стану выше!",
            words: [
              { text: "우유를", baseForm: "우유", particles: "를", translation: "Молоко (объект)", grammar: "Винительный падеж" },
              { text: "마시면", baseForm: "마시다", particles: "면", translation: "Если выпить", grammar: "Условное наклонение" },
              { text: "키가", baseForm: "키", particles: "가", translation: "Рост", grammar: "Именительный падеж" },
              { text: "쑥쑥", baseForm: "쑥쑥", translation: "Быстро (расти)", grammar: "Подражательное (성어)" },
              { text: "크지요", baseForm: "크다", particles: "지요", translation: "Увеличивается (же)", grammar: "Глагол 가다 + 비격식 의문/서술" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 4,
    title: 'Азалея',
    koreanTitle: '진달래꽃',
    author: 'Ким Со Воль (김소월)',
    tags: ['Классика', 'Лирика', 'Прощание'],
    hasAudio: true,
    image: '/pics/azalea.png',
    artisticTranslation: "Когда вы уйдёте, устав от меня,\nЯ молча покорно вас провожу.\nВ горах Яксан в Ёнбёне\nНарву охапку цветов азалии\nИ рассыплю на вашем пути.",
    stanzas: [
      {
        id: 1,
        lines: [
          {
            id: 11,
            translation: "Когда вы уйдёте, устав от меня,",
            words: [
              { text: "나", baseForm: "나", translation: "Я (скромно)", grammar: "Местоимение 1л. ед.ч." },
              { text: "보기가", baseForm: "보다", particles: "기가", translation: "Видеть (меня)", grammar: "Глагол + 기 가 (образует существительное)" },
              { text: "역겨워", baseForm: "역겹다", particles: "워", translation: "Противно/тошно", grammar: "Прилагательное (ㅂ-исключение)" }
            ]
          },
          {
            id: 12,
            translation: "Я молча покорно вас провожу",
            words: [
              { text: "가실", baseForm: "가다", particles: "실", translation: "Уйдёте (уваж.)", grammar: "Глагол 우시다/시 + ㄹ (причастие буд. времени)" },
              { text: "때에는", baseForm: "때", particles: "에는", translation: "В то время когда", grammar: "Существительное время + 에 + 는" },
              { text: "말없이", baseForm: "말없이", translation: "Молча / без слов", grammar: "Наречие" },
              { text: "고이", baseForm: "고이", translation: "Аккуратно / покорно", grammar: "Наречие" },
              { text: "보내드리우리다", baseForm: "보내다", particles: "드리우리다", translation: "Провожу вас", grammar: "Глагол + 드리다 (уваж. давать) + 리다 (устар. обещание)" }
            ]
          }
        ]
      },
      {
        id: 2,
        lines: [
          {
            id: 21,
            translation: "В горах Яксан в Ёнбёне",
            words: [
              { text: "영변에", baseForm: "영변", particles: "에", translation: "В Ёнбёне (топоним)", grammar: "Местный падеж" },
              { text: "약산", baseForm: "약산", translation: "Гора Яксан", grammar: "Топоним" }
            ]
          },
          {
            id: 22,
            translation: "Нарву охапку цветов азалии",
            words: [
              { text: "진달래꽃", baseForm: "진달래꽃", translation: "Цветы азалии", grammar: "Существительное" },
              { text: "아름", baseForm: "아름", translation: "Охапка", grammar: "Существительное" },
              { text: "따다", baseForm: "따다", translation: "Нарвав (сорвав)", grammar: "Глагол" }
            ]
          },
          {
            id: 23,
            translation: "И рассыплю на вашем пути.",
            words: [
              { text: "가실", translation: "Уйдёте", grammar: "как выше" },
              { text: "길에", baseForm: "길", particles: "에", translation: "На пути", grammar: "Существительное + местный падеж" },
              { text: "뿌리우리다", baseForm: "뿌리다", particles: "우리다", translation: "Рассыплю", grammar: "Глагол разбрасывать + 고풍스러운 оттенок" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 5,
    title: 'Пролог (서시)',
    koreanTitle: '서시',
    author: 'Юн Дон Чжу (윤동주)',
    tags: ['Классика', 'Космос', 'Философия'],
    hasAudio: true,
    image: '/pics/stars.png',
    artisticTranslation: "Желаю до самого дня моей смерти\nСмотреть в небеса без единого пятнышка стыда.\nДаже от ветра, что шелестит в листве,\nМое сердце страдало.",
    stanzas: [
      {
        id: 1,
        lines: [
          {
            id: 11,
            translation: "Желаю до самого дня моей смерти",
            words: [
              { text: "죽는", baseForm: "죽다", particles: "는", translation: "Умирать", grammar: "Глагол + 어미 (определение)" },
              { text: "날까지", baseForm: "날", particles: "까지", translation: "До дня", grammar: "Существительное + 방위사 다지" },
              { text: "하늘을", baseForm: "하늘", particles: "을", translation: "Небо", grammar: "Винительный падеж" },
              { text: "우러러", baseForm: "우러르다", particles: "어", translation: "Смотреть вверх", grammar: "Глагол" }
            ]
          },
          {
            id: 12,
            translation: "Смотреть в небеса без единого пятнышка стыда.",
            words: [
              { text: "한점", baseForm: "한점", translation: "Одной капли/пятнышка", grammar: "" },
              { text: "부끄럼이", baseForm: "부끄럼", particles: "이", translation: "Стыд", grammar: "" },
              { text: "없기를,", baseForm: "없다", particles: "기를", translation: "Чтобы не было", grammar: "기 원/조건" }
            ]
          },
          {
            id: 13,
            translation: "Даже от ветра, что шелестит в листве,",
            words: [
              { text: "잎새에", baseForm: "잎새", particles: "에", translation: "В листьях", grammar: "" },
              { text: "이는", baseForm: "일다", particles: "는", translation: "Возникающий", grammar: "" },
              { text: "바람에도", baseForm: "바람", particles: "에도", translation: "Даже ветру", grammar: "" }
            ]
          },
          {
            id: 14,
            translation: "Мое сердце страдало.",
            words: [
              { text: "나는", baseForm: "나", particles: "는", translation: "Я", grammar: "" },
              { text: "괴로워했다.", baseForm: "괴로워하다", translation: "Страдал", grammar: "과거시제" }
            ]
          }
        ]
      }
    ]
  }
];
