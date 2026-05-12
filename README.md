# Korean App

Приложение для изучения корейского языка через дорамы, музыку и цитаты.

## Структура проекта

```
korean_app/
├── frontend/          # React + Vite + TailwindCSS
├── backend/           # Express API + PostgreSQL
├── docs/              # Документация и спецификации
├── scripts/           # Утилиты и скрипты
└── docker-compose.yml # Оркестрация контейнеров
```

## Запуск локально

**Предварительные требования:** Node.js 22+, Docker

1. Установить зависимости:
   ```bash
   npm install
   ```

2. Скопировать `.env.example` в `.env` и заполнить переменные:
   ```bash
   copy .env.example .env
   ```

3. Запустить PostgreSQL через Docker:
   ```bash
   docker compose up db -d
   ```

4. Запустить frontend и backend:
   ```bash
   npm run dev:all
   ```

   Или по отдельности:
   ```bash
   npm run dev:frontend   # http://localhost:3000
   npm run dev:backend    # http://localhost:3001
   ```

## Деплой через Docker

```bash
docker compose up -d --build
```

- Frontend: http://localhost (nginx, порт 80)
- Backend API: http://localhost:3001
- PostgreSQL: порт из `.env` (по умолчанию 5432)