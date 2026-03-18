export type ClipType = 'video' | 'audio_story';

export interface Word {
  id: string;
  kor: string;
  rus: string;
  base?: string;       // Начальная форма слова (инфинитив)
  particles?: string;  // Присоединенные частицы словом / морфемы
  grammar?: string;    // Объяснение грамматической конструкции
  context?: string;    // Идиома, устойчивое выражение или культурный комментарий
  dictUrl?: string;
}

export interface Phrase {
  id: string;
  speaker?: string;    // Имя персонажа (если есть)
  kor: string;         // Оригинальный корейский текст
  rus: string;         // Русский перевод
  start: number;       // Секунда начала реплики
  end: number;         // Секунда конца реплики
  words?: Word[];      // Опционально: массив слов для пословного разбора
}

export interface Clip {
  id: string;          // Уникальный ID отрывка (напр. 'goblin_rain_scene')
  type: ClipType;      // Тип медиа
  title: string;       // Название сцены
  source: string;      // Название дорамы / шоу
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  tags: string[];      // Теги
  mediaUrl: string;    // Путь к медиа файлу (в данном случае заглушки)
  coverUrl?: string;   // Обложка видео
  coverUrls?: string[]; // Массив картинок для 'audio_story'
  dialogue: Phrase[];  // Массив всех реплик диалога
}

export const sampleClips: Clip[] = [
  {
    id: 'cafe_meeting_sample',
    type: 'video',
    title: 'Знакомство в кафе',
    source: 'Разговорная практика (Sample)',
    level: 'A1',
    tags: ['знакомство', 'кафе', 'вежливость', 'разговорный', 'простое'],
    mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 
    coverUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80',
    dialogue: [
      {
        id: 'p1',
        speaker: 'Джи Хун',
        kor: '안녕하세요? 처음 뵙겠습니다.',
        rus: 'Здравствуйте. Приятно познакомиться.',
        start: 2.0,
        end: 4.5,
        words: [
          { id: 'w1', kor: '안녕하세요', rus: 'Здравствуйте', base: '안녕하다', grammar: 'Официально-вежливый стиль приветствия', context: 'Буквально: "Вы пребываете в мире/спокойствии?". Самое частое приветствие.' },
          { id: 'w2', kor: '처음', rus: 'Впервые', context: 'В сочетании с 상견 파생 (встреча) образует устойчивое 대면 성어 (клише для первой встречи).' },
          { id: 'w3', kor: '뵙겠습니다', rus: 'Увидимся (вежливо)', base: '뵙다', particles: '-겠- (намерение/будущее), -습니다 (оф. вежл. стиль)', grammar: 'Глагол 오다/만나다 в супер-вежливой форме (скромно о себе).' }
        ]
      },
      {
        id: 'p2',
        speaker: 'Мин А',
        kor: '네, 안녕하세요. 저는 민아라고 합니다.',
        rus: 'Да, здравствуйте. Меня зовут Мин А.',
        start: 5.0,
        end: 8.5,
        words: [
          { id: 'w4', kor: '네', rus: 'Да', context: 'В корейском "не" часто используется просто как знак того, что вы слушаете собеседника (поддакивание).' },
          { id: 'w5', kor: '안녕하세요', rus: 'Здравствуйте' },
          { id: 'w6', kor: '저는', rus: 'Я', base: '저', particles: '는 (тематическая частица)', grammar: 'Выделяет тему предложения (Я).' },
          { id: 'w7', kor: '민아', rus: 'Мин А (имя)' },
          { id: 'w8', kor: '라고 합니다', rus: 'Меня зовут...', base: '하다', particles: '라고 (косвенная речь)', grammar: '(Существительное) + (이)라고 하다 — "Говорят, что это..." или "Меня зовут...".' }
        ]
      },
      {
        id: 'p3',
        speaker: 'Джи Хун',
        kor: '만나서 반가워요. 커피 좋아하세요?',
        rus: 'Рад встрече. Вы любите кофе?',
        start: 9.0,
        end: 12.0,
        words: [
          { id: 'w9', kor: '만나서', rus: 'Встретил и... (причина)' },
          { id: 'w10', kor: '반가워요', rus: 'Рад' },
          { id: 'w11', kor: '커피', rus: 'Кофе' },
          { id: 'w12', kor: '좋아하세요', rus: 'Вам нравится? (вежливо)' }
        ]
      },
      {
        id: 'p4',
        speaker: 'Мин А',
        kor: '네, 아주 좋아해요.',
        rus: 'Да, очень люблю.',
        start: 12.5,
        end: 14.5,
        words: [
          { id: 'w13', kor: '네', rus: 'Да' },
          { id: 'w14', kor: '아주', rus: 'Очень' },
          { id: 'w15', kor: '좋아해요', rus: 'Люблю (нравится)' }
        ]
      }
    ]
  },
  {
    id: 'restaurant_order',
    type: 'video',
    title: 'Заказ в ресторане',
    source: 'Мой уютный ресторан',
    level: 'A2',
    tags: ['ресторан', 'еда', 'заказ', 'разговорный', 'простое'],
    mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80',
    dialogue: [
      { id: 'p1', speaker: 'Официант', kor: '주문하시겠어요?', rus: 'Будете заказывать?', start: 1, end: 3, words: [] },
      { id: 'p2', speaker: 'Гость', kor: '비빔밥 하나 주세요.', rus: 'Один пибимпаб, пожалуйста.', start: 4, end: 6, words: [] }
    ]
  },
  {
    id: 'farewell_airport',
    type: 'video',
    title: 'Прощание в аэропорту',
    source: 'Ты слышишь моё сердце',
    level: 'B1',
    tags: ['прощание', 'аэропорт', 'эмоциональное', 'романтика', 'грамматика'],
    mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80',
    dialogue: [
      { id: 'p1', speaker: 'Со Ён', kor: '잘 지내야 해, 알겠지?', rus: 'Береги себя, хорошо?', start: 2, end: 5, words: [] },
      { id: 'p2', speaker: 'Джин У', kor: '금방 돌아올게.', rus: 'Я вернусь скоро.', start: 5.5, end: 8, words: [] }
    ]
  },
  {
    id: 'confession_scene',
    type: 'video',
    title: 'Признание в любви',
    source: 'Когда звонит сердце',
    level: 'B1',
    tags: ['признание', 'романтика', 'эмоциональное', 'грамматика'],
    mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80',
    dialogue: [
      { id: 'p1', speaker: 'Ким Хан', kor: '나... 너 좋아해. 오래전부터.', rus: 'Я... ты мне нравишься. Уже давно.', start: 3, end: 7, words: [] },
      { id: 'p2', speaker: 'Ю Ра', kor: '지금 뭐라고 했어?', rus: 'Что ты только что сказал?', start: 8, end: 10, words: [] }
    ]
  },
  {
    id: 'office_conflict',
    type: 'video',
    title: 'Конфликт в офисе',
    source: 'Господин Солнечный свет',
    level: 'B2',
    tags: ['работа', 'офис', 'конфликт', 'умное', 'деловой', 'грамматика'],
    mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
    dialogue: [
      { id: 'p1', speaker: 'Директор', kor: '이 보고서는 기준 미달입니다.', rus: 'Этот отчёт не соответствует стандартам.', start: 1, end: 4, words: [] },
      { id: 'p2', speaker: 'Сотрудник', kor: '죄송합니다. 제가 다시 검토하겠습니다.', rus: 'Извините. Я пересмотрю его.', start: 5, end: 8, words: [] }
    ]
  },
  {
    id: 'friends_funny',
    type: 'video',
    title: 'Весёлые друзья',
    source: 'Ответь on 1988',
    level: 'A2',
    tags: ['дружба', 'смешное', 'разговорный', 'простое', 'сленг'],
    mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80',
    dialogue: [
      { id: 'p1', speaker: 'Дон Рён', kor: '야, 너 진짜 웃기다!', rus: 'Эй, ты реально смешной!', start: 1, end: 3, words: [] },
      { id: 'p2', speaker: 'Тэк', kor: '내가 뭘?', rus: 'Что я такого сделал?', start: 3.5, end: 5, words: [] }
    ]
  }
];
