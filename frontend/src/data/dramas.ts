/** Base URL for media served from the backend. */
const MEDIA_BASE = '/media/k-dramas/mini_videos';

export interface Episode {
  id: number;
  title: string;
  duration: string;
  progressPercent: number; // 0-100
  wordsLearned: number;
  /** Path to the video file, served via backend proxy */
  videoUrl?: string;
  /** Path to the markdown analysis file for this episode clip */
  analysisUrl?: string;
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
      {
        id: 1,
        title: 'Эп. 1 — Сцена 1',
        duration: '0:01:30',
        progressPercent: 0,
        wordsLearned: 0,
        videoUrl: `${MEDIA_BASE}/lonely_god_01/lonely_god_01_01.mov`,
        analysisUrl: `${MEDIA_BASE}/lonely_god_01/ep01_01.md`,
      },
      {
        id: 2,
        title: 'Эп. 1 — Сцена 2',
        duration: '0:02:10',
        progressPercent: 0,
        wordsLearned: 0,
        videoUrl: `${MEDIA_BASE}/lonely_god_01/lonely_god_01_02.mov`,
        analysisUrl: `${MEDIA_BASE}/lonely_god_01/ep01_02.md`,
      },
      {
        id: 3,
        title: 'Эп. 1 — Сцена 3',
        duration: '0:01:05',
        progressPercent: 0,
        wordsLearned: 0,
        videoUrl: `${MEDIA_BASE}/lonely_god_01/lonely_god_01_03.mov`,
        analysisUrl: `${MEDIA_BASE}/lonely_god_01/ep01_03.md`,
      },
      {
        id: 4,
        title: 'Эп. 1 — Сцена 4',
        duration: '0:02:15',
        progressPercent: 0,
        wordsLearned: 0,
        videoUrl: `${MEDIA_BASE}/lonely_god_01/lonely_god_01_04.mov`,
        analysisUrl: `${MEDIA_BASE}/lonely_god_01/ep01_04.md`,
      },
      {
        id: 5,
        title: 'Эп. 1 — Сцена 5',
        duration: '0:00:58',
        progressPercent: 0,
        wordsLearned: 0,
        videoUrl: `${MEDIA_BASE}/lonely_god_01/lonely_god_01_05.mov`,
        analysisUrl: `${MEDIA_BASE}/lonely_god_01/ep01_05.md`,
      },
      {
        id: 6,
        title: 'Эп. 1 — Сцена 6',
        duration: '0:01:15',
        progressPercent: 0,
        wordsLearned: 0,
        videoUrl: `${MEDIA_BASE}/lonely_god_01/lonely_god_01_06.mov`,
        analysisUrl: `${MEDIA_BASE}/lonely_god_01/ep01_06.md`,
      },
      {
        id: 7,
        title: 'Эп. 1 — Сцена 7',
        duration: '0:02:08',
        progressPercent: 0,
        wordsLearned: 0,
        videoUrl: `${MEDIA_BASE}/lonely_god_01/lonely_god_01_07.mov`,
        analysisUrl: `${MEDIA_BASE}/lonely_god_01/ep01_07.md`,
      },
      {
        id: 8,
        title: 'Эп. 1 — Сцена 8',
        duration: '0:01:05',
        progressPercent: 0,
        wordsLearned: 0,
        videoUrl: `${MEDIA_BASE}/lonely_god_01/lonely_god_01_08.mov`,
        analysisUrl: `${MEDIA_BASE}/lonely_god_01/ep01_08.md`,
      },
      {
        id: 9,
        title: 'Эп. 1 — Сцена 9',
        duration: '0:01:22',
        progressPercent: 0,
        wordsLearned: 0,
        videoUrl: `${MEDIA_BASE}/lonely_god_01/lonely_god_01_09.mov`,
        analysisUrl: `${MEDIA_BASE}/lonely_god_01/ep01_09.md`,
      },
      {
        id: 10,
        title: 'Эп. 1 — Сцена 10',
        duration: '0:00:57',
        progressPercent: 0,
        wordsLearned: 0,
        videoUrl: `${MEDIA_BASE}/lonely_god_01/lonely_god_01_10.mov`,
        analysisUrl: `${MEDIA_BASE}/lonely_god_01/ep01_10.md`,
      },
      {
        id: 11,
        title: 'Эп. 1 — Сцена 11',
        duration: '0:00:48',
        progressPercent: 0,
        wordsLearned: 0,
        videoUrl: `${MEDIA_BASE}/lonely_god_01/lonely_god_01_11.mov`,
        analysisUrl: `${MEDIA_BASE}/lonely_god_01/ep01_11.md`,
      },
      {
        id: 12,
        title: 'Эп. 1 — Сцена 12',
        duration: '0:00:52',
        progressPercent: 0,
        wordsLearned: 0,
        videoUrl: `${MEDIA_BASE}/lonely_god_01/lonely_god_01_12.mov`,
        analysisUrl: `${MEDIA_BASE}/lonely_god_01/ep01_12.md`,
      },
    ],
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
    ],
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
    ],
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
      { id: 1, title: 'Эпизод 1', duration: '1:20:00', progressPercent: 0, wordsLearned: 0 },
    ],
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
    ],
  },
  {
    id: 6,
    title: 'Алхимия душ',
    year: 2022,
    rating: 4.8,
    tags: ['Фэнтези', 'Исторический'],
    image: 'https://picsum.photos/seed/alchemy/400/600',
    description: 'История о молодых магах, чьи судьбы переплетаются из-за запретного заклинания «алхимии душ».',
    episodes: [
      { id: 1, title: 'Эпизод 1', duration: '1:15:00', progressPercent: 0, wordsLearned: 0 },
    ],
  },
];
