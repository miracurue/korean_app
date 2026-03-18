/**
 * Data types and mock data for the Social Citator feature.
 * Follows the data model from social_citator_spec.md.
 */

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  /** Sum of likes + clones received on their quotes */
  reputation: number;
  achievements: string[];
}

export interface Quote {
  id: string;
  originalCreatorId: string;
  currentOwnerId: string;
  isPublic: boolean;
  textKor: string;
  textRus: string;
  audioUrl?: string;
  source: string;
  likesCount: number;
  clonesCount: number;
  tags: string[];
  createdAt: number; // unix timestamp (ms)
}

// ─── Mock Users ───────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  {
    id: 'user_1',
    username: 'hana_학생',
    displayName: 'Hana',
    avatarUrl: 'https://api.dicebear.com/8.x/notionists/svg?seed=hana',
    bio: 'Учу корейский по дорамам уже 2 года 🌸',
    reputation: 3420,
    achievements: ['Полиглот', 'Первооткрыватель'],
  },
  {
    id: 'user_2',
    username: 'dramaQueen_99',
    displayName: 'Мирьям',
    avatarUrl: 'https://api.dicebear.com/8.x/notionists/svg?seed=miriam',
    bio: 'Фанат корейской классики. TOPIK II уровень.',
    reputation: 1805,
    achievements: ['Популярный учитель'],
  },
  {
    id: 'user_me',
    username: 'me',
    displayName: 'Вы',
    avatarUrl: 'https://api.dicebear.com/8.x/notionists/svg?seed=me',
    bio: 'Начинающий изучения корейского через дорамы и песни.',
    reputation: 42,
    achievements: [],
  },
];

// ─── Mock Quotes ──────────────────────────────────────────────────────────────

export const MOCK_QUOTES: Quote[] = [
  {
    id: 'q1',
    originalCreatorId: 'user_1',
    currentOwnerId: 'user_1',
    isPublic: true,
    textKor: '너와 함께한 시간 모두 눈부셨다. 날이 좋아서, 날이 좋지 않아서, 날이 적당해서, 모든 날이 좋았다.',
    textRus: 'Всё время, проведённое с тобой, было ослепительным. Потому что погода была хорошей, потому что плохой, потому что подходящей. Все дни были хорошими.',
    source: 'Токкэби (Гоблин)',
    likesCount: 1240,
    clonesCount: 318,
    tags: ['дорамы', 'любовь', 'intermediate'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: 'q2',
    originalCreatorId: 'user_2',
    currentOwnerId: 'user_2',
    isPublic: true,
    textKor: '포기하지 마. 포기하는 순간 경기는 끝나는 거야.',
    textRus: 'Не сдавайся. В тот момент, когда ты сдаёшься, игра заканчивается.',
    source: 'Итэвон Класс',
    likesCount: 2105,
    clonesCount: 472,
    tags: ['дорамы', 'мотивация', 'beginner'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'q3',
    originalCreatorId: 'user_1',
    currentOwnerId: 'user_1',
    isPublic: true,
    textKor: '사랑은 미안하다고 말하지 않는 거야.',
    textRus: 'Любовь означает никогда не говорить, что тебе жаль.',
    source: 'Зимняя соната',
    likesCount: 892,
    clonesCount: 201,
    tags: ['дорамы', 'классика', 'romance'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
  {
    id: 'q4',
    originalCreatorId: 'user_2',
    currentOwnerId: 'user_2',
    isPublic: true,
    textKor: '운명이란 없어. 만들어 가는 거야.',
    textRus: 'Судьбы не существует. Её создают.',
    source: 'Алхимия душ',
    likesCount: 635,
    clonesCount: 89,
    tags: ['дорамы', 'мотивация', 'intermediate'],
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: 'q5',
    originalCreatorId: 'user_1',
    currentOwnerId: 'user_1',
    isPublic: true,
    textKor: '나는 나를 사랑한다.',
    textRus: 'Я люблю себя.',
    source: 'BTS — Answer: Love Myself',
    likesCount: 3980,
    clonesCount: 901,
    tags: ['k-pop', 'мотивация', 'beginner'],
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'q6',
    originalCreatorId: 'user_2',
    currentOwnerId: 'user_2',
    isPublic: true,
    textKor: '죽고 싶다는 말 함부로 하지 마. 죽고 싶은 게 아니라 살기가 싫은 거잖아.',
    textRus: 'Не говори "хочу умереть" просто так. Ты не хочешь умереть — тебе просто не хочется жить.',
    source: 'Нашего синего (Моё синее) кита',
    likesCount: 447,
    clonesCount: 55,
    tags: ['дорамы', 'грусть', 'advanced'],
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
  },
];

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getUserById(id: string): User | undefined {
  return MOCK_USERS.find(u => u.id === id);
}

export const ALL_TAGS = ['дорамы', 'k-pop', 'мотивация', 'любовь', 'грусть', 'классика', 'romance', 'beginner', 'intermediate', 'advanced'];
