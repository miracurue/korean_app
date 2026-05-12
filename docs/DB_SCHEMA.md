# DB_SCHEMA.md — Структура базы данных Korean App

> **Файл для быстрой передачи контекста схемы БД в новые чаты.**
> SQL-миграция: `backend/src/db/schema.sql`
> БД: PostgreSQL 17 + pgvector (Docker: `pgvector/pgvector:pg17`)

---

## ER-диаграмма (текстовая)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   videos     │       │    fragments      │       │   dictionary     │
│──────────────│       │──────────────────│       │──────────────────│
│ id (PK)      │──┐    │ id (PK)          │    ┌──│ id (PK)          │
│ series_title │  └───<│ video_id (FK)    │    │  │ base_word        │
│ episode_num  │       │ time_start       │    │  │ translations     │
│ video_url    │       │ time_end         │    │  └──────────────────┘
│ tags         │       │ original_text    │    │         │
│ created_at   │       │ translated_text  │    │         │
└──────────────┘       │ cultural_comment │    │         │
                       │ idioma           │    │         │
                       └───────┬──────────┘    │         │
                               │               │         │
                       ┌───────┴──────────┐    │         │
                       │ fragment_words    │    │         │
                       │──────────────────│    │         │
                       │ id (PK, SERIAL)  │    │         │
                       │ fragment_id (FK)─┼────┘         │
                       │ dictionary_id (FK)┼─────────────┘
                       │ word_in_text     │              │
                       │ char_start       │              │
                       │ char_end         │              │
                       │ context_translation│             │
                       │ grammar_note     │              │
                       │ position         │              │
                       └──────────────────┘              │
                                                         │
┌──────────────┐       ┌──────────────────┐              │
│   users      │       │ user_vocabulary   │              │
│──────────────│       │──────────────────│              │
│ id (PK, UUID)│──┐    │ id (PK, SERIAL)  │              │
│ email        │  └───<│ user_id (FK)     │              │
│ password_hash│       │ dictionary_id (FK)┼──────────────┘
│ created_at   │       │ status           │
└──────────────┘       │ next_review_date │
                       │ updated_at       │
                       └──────────────────┘
```

---

## Связи между таблицами

| Связь | Тип | Описание |
|-------|-----|----------|
| `videos` → `fragments` | 1:N | Один эпизод — много строк субтитров |
| `fragments` → `fragment_words` | 1:N | Одна строка — много слов в разборе |
| `dictionary` → `fragment_words` | 1:N | Одно слово словаря — много вхождений в текстах |
| `users` → `user_vocabulary` | 1:N | Один юзер — много слов в личном словаре |
| `dictionary` → `user_vocabulary` | 1:N | Одно слово — много юзеров, которые его учат |

---

## БЛОК 1: Контент

### 1. `videos` — Информация о медиа

Хранит общие данные о серии, чтобы не дублировать их в каждом фрагменте субтитров.

| Колонка | Тип | Обязательное | Описание |
|---------|-----|:---:|----------|
| `id` | `VARCHAR(32)` | PK | Код видео (например `"0001"`) |
| `series_title` | `VARCHAR(255)` | ✅ | Название сериала (`"Токкэби"`) |
| `episode_number` | `VARCHAR(10)` | ✅ | Номер серии (`"01"`, `"OVA"`) |
| `video_url` | `TEXT` | ✅ | Путь к видео-файлу в хранилище |
| `tags` | `TEXT` | nullable | Теги / категории |
| `created_at` | `TIMESTAMP` | auto | Дата добавления (`NOW()`) |

**Пример данных:**

| id | series_title | episode_number | video_url | tags |
|----|-------------|----------------|-----------|------|
| 0001 | Lonely_God | 01 | media/k-dramas/lonely_god/ep01.mp4 | дорама, фэнтези |

---

### 2. `fragments` — Блоки субтитров

Каждая запись — одна смысловая строка из файла субтитров, привязанная к конкретному времени.

| Колонка | Тип | Обязательное | Описание |
|---------|-----|:---:|----------|
| `id` | `VARCHAR(32)` | PK | Код фрагмента (например `"N6546"`) |
| `video_id` | `VARCHAR(32)` | FK → `videos.id` | К какому видео относится |
| `time_start` | `TEXT` | ✅ | Время начала: SRT `"00:00:00,375"` или секунды `"12.00"` |
| `time_end` | `TEXT` | ✅ | Время окончания |
| `original_text` | `TEXT` | ✅ | Оригинальная строка на корейском |
| `translated_text` | `TEXT` | nullable | Художественный перевод |
| `cultural_comment` | `TEXT` | nullable | Культурный контекст, сленг |
| `idioma` | `TEXT` | nullable | Лингвистический комментарий (идиомы) |

**Индексы:** `idx_fragments_video_id` (B-Tree на `video_id`)

**Пример данных:**

| id | video_id | time_start | time_end | original_text | translated_text | cultural_comment |
|----|----------|------------|----------|---------------|-----------------|------------------|
| N6546 | 0001 | 00:00:00,375 | 00:00:03,169 | 너 이 새끼 | Ах ты ублюдок. | Использование 'ты' (너) к незнакомцу — грубое нарушение субординации |

---

### 3. `dictionary` — Глобальный словарь

Справочник начальных форм слов. Одно слово — одна запись.

| Колонка | Тип | Обязательное | Описание |
|---------|-----|:---:|----------|
| `id` | `VARCHAR(32)` | PK | Код слова (например `"W1350"`) |
| `base_word` | `VARCHAR(255)` | ✅ | Слово в начальной форме |
| `translations` | `JSONB` | default `[]` | Массив переводов: `["ты", "вы"]` |

**Индексы:**
- `idx_dictionary_base_word` — B-Tree на `base_word` (быстрый поиск по слову)
- `idx_dictionary_translations` — GIN на `translations` (поиск по JSONB)

**Пример данных:**

| id | base_word | translations |
|----|-----------|-------------|
| W1350 | 너 | `["ты"]` |
| W1753 | 새끼 | `["детеныш", "ублюдок"]` |
| W5313 | 뭐 | `["что", "кто"]` |

**Запрос для поиска перевода:**
```sql
SELECT * FROM dictionary WHERE base_word = '너';
-- или поиск по переводу:
SELECT * FROM dictionary WHERE translations @> '["ты"]';
```

---

### 4. `fragment_words` — Пословный разбор предложения

Связывает конкретное слово из субтитров с его начальной формой в словаре. Указывает позицию слова в строке для подсветки на фронтенде.

| Колонка | Тип | Обязательное | Описание |
|---------|-----|:---:|----------|
| `id` | `SERIAL` | PK (auto) | Автоинкрементный ID |
| `fragment_id` | `VARCHAR(32)` | FK → `fragments.id` | Из какого субтитра |
| `dictionary_id` | `VARCHAR(32)` | FK → `dictionary.id` | Начальная форма слова |
| `word_in_text` | `VARCHAR(255)` | ✅ | Как написано в тексте (с частицами) |
| `char_start` | `INT` | nullable | Индекс начального символа (подсветка) |
| `char_end` | `INT` | nullable | Индекс конечного символа (подсветка) |
| `context_translation` | `VARCHAR(500)` | nullable | Перевод в данном контексте |
| `grammar_note` | `TEXT` | nullable | Грамматическое пояснение |
| `position` | `VARCHAR(50)` | nullable | Синтаксическая роль (`"подлежащее"`) |

**Индексы:** `idx_fragment_words_fragment_id`, `idx_fragment_words_dictionary_id`

**FK-поведение:**
- `fragment_id` → `ON DELETE CASCADE` (удаляем фрагмент — удаляются все его слова)
- `dictionary_id` → `ON DELETE RESTRICT` (нельзя удалить слово из словаря, если оно используется в разборе)

**Пример данных:**

| id | fragment_id | dictionary_id | word_in_text | context_translation | grammar_note | position |
|----|-------------|---------------|-------------|--------------------:|--------------|----------|
| 736 | N6546 | W1350 | 너 | ты | Местоимение 2-го лица | подлежащее |
| 737 | N6546 | W4536 | 이 | этот | | связка |
| 738 | N6546 | W1753 | 새끼 | ублюдок | | дополнение |

---

## БЛОК 2: Пользовательские данные

### 5. `users` — Аккаунты

| Колонка | Тип | Обязательное | Описание |
|---------|-----|:---:|----------|
| `id` | `UUID` | PK (auto) | Генерируется через `gen_random_uuid()` |
| `email` | `VARCHAR(255)` | ✅ UNIQUE | Email для входа |
| `password_hash` | `VARCHAR(255)` | ✅ | Хэш пароля (bcrypt/argon2) |
| `created_at` | `TIMESTAMP` | auto | Дата регистрации |

---

### 6. `user_vocabulary` — Личный словарь и прогресс

Хранит информацию о том, какие слова пользователь изучает. Связывается с глобальным словарём.

| Колонка | Тип | Обязательное | Описание |
|---------|-----|:---:|----------|
| `id` | `SERIAL` | PK (auto) | Автоинкрементный ID |
| `user_id` | `UUID` | FK → `users.id` | Кто учит |
| `dictionary_id` | `VARCHAR(32)` | FK → `dictionary.id` | Какое слово учим |
| `status` | `VARCHAR(20)` | ✅ default `"learning"` | Статус: `learning` / `known` / `ignored` |
| `next_review_date` | `TIMESTAMP` | nullable | Дата следующего повторения (spaced repetition) |
| `updated_at` | `TIMESTAMP` | auto | Время последнего изменения |

**Индексы:**
- `idx_user_vocabulary_user_id` — B-Tree
- `idx_user_vocabulary_dictionary_id` — B-Tree
- `idx_user_vocabulary_status` — B-Tree
- `idx_user_vocabulary_review_date` — Partial index (WHERE next_review_date IS NOT NULL)
- `idx_user_vocabulary_unique` — UNIQUE на `(user_id, dictionary_id)` — один юзер = одна запись на слово

**Статусы изучения:**
- `learning` — слово в процессе изучения
- `known` — слово выучено
- `ignored` — слово пропущено/скрыто

**Запрос для получения слов на повторение:**
```sql
SELECT uv.*, d.base_word, d.translations
FROM user_vocabulary uv
JOIN dictionary d ON d.id = uv.dictionary_id
WHERE uv.user_id = $1
  AND uv.status = 'learning'
  AND uv.next_review_date <= NOW()
ORDER BY uv.next_review_date ASC;
```

---

## Типовые запросы

### Получить все субтитры эпизода с пословным разбором
```sql
SELECT
    f.id AS fragment_id,
    f.time_start,
    f."time_end",
    f.original_text,
    f.translated_text,
    json_agg(
        json_build_object(
            'word', fw.word_in_text,
            'base', d.base_word,
            'translations', d.translations,
            'context', fw.context_translation,
            'grammar', fw.grammar_note,
            'position', fw.position,
            'char_start', fw.char_start,
            'char_end', fw.char_end
        ) ORDER BY fw.id
    ) AS words
FROM fragments f
LEFT JOIN fragment_words fw ON fw.fragment_id = f.id
LEFT JOIN dictionary d ON d.id = fw.dictionary_id
WHERE f.video_id = '0001'
GROUP BY f.id
ORDER BY f.time_start;
```

### Добавить слово в личный словарь
```sql
INSERT INTO user_vocabulary (user_id, dictionary_id, status)
VALUES ($1, 'W1350', 'learning')
ON CONFLICT (user_id, dictionary_id)
DO UPDATE SET
    status = 'learning',
    updated_at = NOW();
```

---

## Как накатить миграцию

### Вариант 1: Через docker exec (если контейнер БД запущен)
```bash
docker cp backend/src/db/schema.sql korean_app_db:/tmp/schema.sql
docker exec -i korean_app_db psql -U <DB_USER> -d <DB_NAME> -f /tmp/schema.sql
```

### Вариант 2: С хоста через psql
```bash
psql -h localhost -p <DB_PORT> -U <DB_USER> -d <DB_NAME> -f backend/src/db/schema.sql
```

### Переменные окружения (из .env)
```
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
DB_PORT=...
```

---

## Примечания

- **Расширение pgvector** — подключается через `CREATE EXTENSION IF NOT EXISTS vector`. Пока не используется, но заложено на будущее для семантического поиска по эмбеддингам слов.
- **ID-стратегия:** Контентные таблицы используют `VARCHAR` с кастомными кодами (удобно для импорта), пользовательские — `UUID` / `SERIAL`.
- **`time_start`/`time_end`** — `TEXT`, а не `FLOAT`, т.к. данные приходят в SRT-формате (`00:00:00,375`). Для конвертации в секунды — парсить на бэкенде/фронтенде.
- **`dictionary.translations`** — `JSONB` массив (`["ты", "вы"]`). Позволяет искать через операторы `@>`, `?`, `?|`.