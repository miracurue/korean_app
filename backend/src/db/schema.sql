-- ============================================================
-- Korean App — Схема базы данных (PostgreSQL 17 + pgvector)
-- ============================================================
-- Запуск: docker exec -i korean_app_db psql -U <user> -d <dbname> -f /path/to/schema.sql
-- Или:    psql -h localhost -p <port> -U <user> -d <dbname> -f backend/src/db/schema.sql
-- ============================================================

-- Расширение для векторного поиска (установлено в Docker-образе pgvector)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- БЛОК 1: Контент (видео, субтитры, словарь)
-- ============================================================

-- -----------------------------------------------------------
-- 1. videos — Информация о медиа (сериалы, эпизоды)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS videos (
    id              VARCHAR(32)    PRIMARY KEY,          -- Код видео (например "0001")
    series_title    VARCHAR(255)   NOT NULL,             -- Название сериала ("Токкэби")
    episode_number  VARCHAR(10)    NOT NULL,             -- Номер серии ("01", "02"...)
    video_url       TEXT           NOT NULL,             -- Путь к видео-файлу
    tags            TEXT           DEFAULT NULL,         -- Теги/категории
    created_at      TIMESTAMP      DEFAULT NOW()         -- Дата добавления
);

COMMENT ON TABLE  videos            IS 'Информация о медиа-контенте (сериалы, эпизоды)';
COMMENT ON COLUMN videos.id          IS 'Уникальный код видео (например "0001")';
COMMENT ON COLUMN videos.series_title IS 'Название сериала';
COMMENT ON COLUMN videos.episode_number IS 'Номер серии (строка для гибкости: "01", "OVA" и т.д.)';
COMMENT ON COLUMN videos.video_url   IS 'Путь к видео-файлу в хранилище';
COMMENT ON COLUMN videos.tags        IS 'Теги и категории';

-- -----------------------------------------------------------
-- 2. fragments — Блоки субтитров (одна строка = одна фраза)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS fragments (
    id              VARCHAR(32)    PRIMARY KEY,          -- Код фрагмента (например "N6546")
    video_id        VARCHAR(32)    NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    time_start      TEXT           NOT NULL,             -- Время начала (SRT: "00:00:00,375" или секунды: "12.00")
    time_end        TEXT           NOT NULL,             -- Время окончания
    original_text   TEXT           NOT NULL,             -- Оригинальная строка на корейском
    translated_text TEXT           DEFAULT NULL,         -- Перевод строки
    cultural_comment TEXT          DEFAULT NULL,         -- Культурный комментарий / контекст
    idioma          TEXT           DEFAULT NULL          -- Языковой/лингвистический комментарий
);

COMMENT ON TABLE  fragments              IS 'Блоки субтитров — одна смысловая строка из файла субтитров';
COMMENT ON COLUMN fragments.id            IS 'Уникальный код фрагмента (например "N6546")';
COMMENT ON COLUMN fragments.video_id      IS 'FK → videos.id — к какому видео относится';
COMMENT ON COLUMN fragments.time_start    IS 'Время начала (SRT-формат "00:00:00,375" или секунды "12.00")';
COMMENT ON COLUMN fragments.time_end      IS 'Время окончания';
COMMENT ON COLUMN fragments.original_text IS 'Оригинальная строка на корейском со знаками препинания';
COMMENT ON COLUMN fragments.translated_text IS 'Художественный / полный перевод строки';
COMMENT ON COLUMN fragments.cultural_comment IS 'Заметка о контексте, сленге или культуре';
COMMENT ON COLUMN fragments.idioma        IS 'Лингвистический комментарий (идиома, устойчивое выражение)';

CREATE INDEX idx_fragments_video_id ON fragments(video_id);

-- -----------------------------------------------------------
-- 3. dictionary — Глобальный словарь (начальные формы слов)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS dictionary (
    id              VARCHAR(32)    PRIMARY KEY,          -- Код слова (например "W1350")
    base_word       VARCHAR(255)   NOT NULL,             -- Слово в начальной форме
    translations    JSONB          DEFAULT '[]'::JSONB   -- Массив переводов: ["ты", "вы"]
);

COMMENT ON TABLE  dictionary              IS 'Глобальный словарь — начальные формы слов';
COMMENT ON COLUMN dictionary.id            IS 'Уникальный код слова (например "W1350")';
COMMENT ON COLUMN dictionary.base_word     IS 'Слово в начальной форме (инфинитив)';
COMMENT ON COLUMN dictionary.translations  IS 'Массив переводов в JSONB: ["ты", "вы"]';

-- B-Tree индекс для быстрого поиска по слову
CREATE INDEX idx_dictionary_base_word ON dictionary(base_word);
-- GIN индекс для поиска по переводам (JSONB)
CREATE INDEX idx_dictionary_translations ON dictionary USING GIN (translations);

-- -----------------------------------------------------------
-- 4. fragment_words — Пословный разбор предложения
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS fragment_words (
    id                  SERIAL         PRIMARY KEY,
    fragment_id         VARCHAR(32)    NOT NULL REFERENCES fragments(id) ON DELETE CASCADE,
    dictionary_id       VARCHAR(32)    NOT NULL REFERENCES dictionary(id) ON DELETE RESTRICT,
    word_in_text        VARCHAR(255)   NOT NULL,             -- Слово как в тексте (с частицами)
    char_start          INT            DEFAULT NULL,          -- Индекс начального символа в original_text
    char_end            INT            DEFAULT NULL,          -- Индекс конечного символа в original_text
    context_translation VARCHAR(500)   DEFAULT NULL,         -- Перевод в данном контексте
    grammar_note        TEXT           DEFAULT NULL,         -- Грамматическое пояснение
    position            VARCHAR(50)    DEFAULT NULL          -- Синтаксическая роль ("подлежащее", "связка")
);

COMMENT ON TABLE  fragment_words                  IS 'Пословный разбор предложения — связка fragment ↔ dictionary';
COMMENT ON COLUMN fragment_words.fragment_id       IS 'FK → fragments.id — из какого субтитра';
COMMENT ON COLUMN fragment_words.dictionary_id      IS 'FK → dictionary.id — начальная форма слова';
COMMENT ON COLUMN fragment_words.word_in_text       IS 'Как слово написано в тексте (с окончаниями/частицами)';
COMMENT ON COLUMN fragment_words.char_start         IS 'Индекс начального символа в original_text (для подсветки)';
COMMENT ON COLUMN fragment_words.char_end           IS 'Индекс конечного символа в original_text (для подсветки)';
COMMENT ON COLUMN fragment_words.context_translation IS 'Перевод слова именно в этом контексте';
COMMENT ON COLUMN fragment_words.grammar_note       IS 'Объяснение грамматики/частиц для данного случая';
COMMENT ON COLUMN fragment_words.position           IS 'Синтаксическая роль слова в предложении';

CREATE INDEX idx_fragment_words_fragment_id ON fragment_words(fragment_id);
CREATE INDEX idx_fragment_words_dictionary_id ON fragment_words(dictionary_id);

-- ============================================================
-- БЛОК 2: Пользовательские данные (изолированные)
-- ============================================================

-- -----------------------------------------------------------
-- 5. users — Аккаунты пользователей
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255)   NOT NULL UNIQUE,
    password_hash   VARCHAR(255)   NOT NULL,
    created_at      TIMESTAMP      DEFAULT NOW()
);

COMMENT ON TABLE  users              IS 'Аккаунты пользователей';
COMMENT ON COLUMN users.email         IS 'Уникальный email для входа';
COMMENT ON COLUMN users.password_hash IS 'Хэш пароля (bcrypt/argon2)';

-- -----------------------------------------------------------
-- 6. user_vocabulary — Личный словарь и прогресс (Spaced Repetition)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_vocabulary (
    id                  SERIAL         PRIMARY KEY,
    user_id             UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dictionary_id       VARCHAR(32)    NOT NULL REFERENCES dictionary(id) ON DELETE RESTRICT,
    status              VARCHAR(20)    NOT NULL DEFAULT 'learning',   -- learning | known | ignored
    next_review_date    TIMESTAMP      DEFAULT NULL,                  -- Для spaced repetition
    updated_at          TIMESTAMP      DEFAULT NOW()
);

COMMENT ON TABLE  user_vocabulary                  IS 'Личный словарь пользователя и прогресс изучения';
COMMENT ON COLUMN user_vocabulary.user_id           IS 'FK → users.id — кто учит';
COMMENT ON COLUMN user_vocabulary.dictionary_id     IS 'FK → dictionary.id — какое слово';
COMMENT ON COLUMN user_vocabulary.status            IS 'Статус: learning / known / ignored';
COMMENT ON COLUMN user_vocabulary.next_review_date  IS 'Дата следующего повторения (spaced repetition)';
COMMENT ON COLUMN user_vocabulary.updated_at        IS 'Время последнего изменения статуса';

CREATE INDEX idx_user_vocabulary_user_id ON user_vocabulary(user_id);
CREATE INDEX idx_user_vocabulary_dictionary_id ON user_vocabulary(dictionary_id);
CREATE INDEX idx_user_vocabulary_status ON user_vocabulary(status);
CREATE INDEX idx_user_vocabulary_review_date ON user_vocabulary(next_review_date) WHERE next_review_date IS NOT NULL;

-- ============================================================
-- Уникальное ограничение: один юзер — одна запись на слово
-- ============================================================
CREATE UNIQUE INDEX idx_user_vocabulary_unique ON user_vocabulary(user_id, dictionary_id);