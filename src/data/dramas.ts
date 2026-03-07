export interface Episode {
  id: number;
  title: string;
  duration: string;
  progressPercent: number; // 0-100
  wordsLearned: number;
}

export interface Drama {
  id: number;
  title: string;
  year: number;
  rating: number;
  tags: string[];
  image: string;
  description: string;
  episodes: Episode[];
}

export const DRAMAS: Drama[] = [
  { 
    id: 1, 
    title: 'Токкэби (Гоблин)', 
    year: 2016, 
    rating: 4.9, 
    tags: ['Фэнтези', 'Романтика', 'Драма'], 
    image: '/pics/Guardian The Lonely and Great God.png',
    description: 'Бессмертный демон-токкэби живет уже более 900 лет и каждый день проклинает свою судьбу. Он не может умереть, пока не найдет свою невесту...',
    episodes: [
      { id: 1, title: 'Эпизод 1', duration: '1:12:45', progressPercent: 100, wordsLearned: 45 },
      { id: 2, title: 'Эпизод 2', duration: '1:08:20', progressPercent: 100, wordsLearned: 52 },
      { id: 3, title: 'Эпизод 3', duration: '1:10:15', progressPercent: 100, wordsLearned: 68 },
      { id: 4, title: 'Эпизод 4', duration: '1:05:30', progressPercent: 55, wordsLearned: 30 },
      { id: 5, title: 'Эпизод 5', duration: '1:09:10', progressPercent: 0, wordsLearned: 0 },
      { id: 6, title: 'Эпизод 6', duration: '1:15:00', progressPercent: 0, wordsLearned: 0 },
    ]
  },
  { 
    id: 2, 
    title: 'Аварийная посадка любви', 
    year: 2019, 
    rating: 4.8, 
    tags: ['Романтика', 'Комедия'], 
    image: 'https://picsum.photos/seed/crash/400/600',
    description: 'Наследница южнокорейского конгломерата из-за торнадо совершает вынужденную посадку на параплане в Северной Корее.',
    episodes: [
      { id: 1, title: 'Эпизод 1', duration: '1:15:00', progressPercent: 10, wordsLearned: 5 },
      { id: 2, title: 'Эпизод 2', duration: '1:10:00', progressPercent: 0, wordsLearned: 0 },
    ]
  },
  { 
    id: 3, 
    title: 'Итэвон Класс', 
    year: 2020, 
    rating: 4.7, 
    tags: ['Драма', 'Бизнес'], 
    image: 'https://picsum.photos/seed/itaewon/400/600',
    description: 'Молодой человек, чей отец погиб из-за наследника крупной корпорации, открывает свой бар в Итэвоне, чтобы отомстить.',
    episodes: [
      { id: 1, title: 'Эпизод 1', duration: '1:05:00', progressPercent: 100, wordsLearned: 120 },
      { id: 2, title: 'Эпизод 2', duration: '1:08:00', progressPercent: 80, wordsLearned: 95 },
      { id: 3, title: 'Эпизод 3', duration: '1:12:00', progressPercent: 0, wordsLearned: 0 },
    ]
  },
  { 
    id: 4, 
    title: 'Винченцо', 
    year: 2021, 
    rating: 4.8, 
    tags: ['Криминал', 'Комедия'], 
    image: 'https://picsum.photos/seed/vincenzo/400/600',
    description: 'Корейско-итальянский адвокат мафии возвращается на родину, чтобы дать отпор злому конгломерату их же методами.',
    episodes: [
      { id: 1, title: 'Эпизод 1', duration: '1:20:00', progressPercent: 0, wordsLearned: 0 }
    ]
  },
  { 
    id: 5, 
    title: 'Слава', 
    year: 2022, 
    rating: 4.9, 
    tags: ['Триллер', 'Месть'], 
    image: 'https://picsum.photos/seed/glory/400/600',
    description: 'Женщина всю жизнь готовится отомстить одноклассникам, которые жестоко издевались над ней в школе.',
    episodes: [
      { id: 1, title: 'Эпизод 1', duration: '0:55:00', progressPercent: 100, wordsLearned: 40 },
      { id: 2, title: 'Эпизод 2', duration: '0:50:00', progressPercent: 100, wordsLearned: 35 },
      { id: 3, title: 'Эпизод 3', duration: '0:52:00', progressPercent: 100, wordsLearned: 50 },
      { id: 4, title: 'Эпизод 4', duration: '0:54:00', progressPercent: 100, wordsLearned: 60 },
      { id: 5, title: 'Эпизод 5', duration: '0:58:00', progressPercent: 100, wordsLearned: 80 },
      { id: 6, title: 'Эпизод 6', duration: '0:51:00', progressPercent: 20, wordsLearned: 15 },
    ]
  },
  { 
    id: 6, 
    title: 'Алхимия душ', 
    year: 2022, 
    rating: 4.8, 
    tags: ['Фэнтези', 'Исторический'], 
    image: 'https://picsum.photos/seed/alchemy/400/600',
    description: 'История о молодых магах, чьи судьбы переплетаются из-за запретного заклинания "алхимии душ".',
    episodes: [
      { id: 1, title: 'Эпизод 1', duration: '1:15:00', progressPercent: 0, wordsLearned: 0 },
    ]
  },
];
