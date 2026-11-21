# Wings Bucha — Крила Бучі

Сайт котеджного містечка Wings Bucha з SSR, CMS-адмінкою, PostgreSQL, формою заявок, upload-файлами та маркетинговою аналітикою.

## Передача проєкту

Новому розробнику або ШІ спочатку потрібно прочитати:

1. `PROJECT_HANDOFF_UA.md` — повний технічний контекст.
2. `ACCESS_CHECKLIST_UA.md` — потрібні доступи та поля для власника.
3. `AI_CONTEXT.md` — короткий контекст для іншого ШІ.
4. `.env.example` — шаблон змінних середовища.
5. `ADMIN_POSTGRES_SETUP_UA.md` — CMS і PostgreSQL.
6. `DEPLOY-HOSTING.md` — production-деплой.

## Посилання

- Репозиторій: https://github.com/vladihnatovvv/wings-bucha-finale
- GitHub Pages demo: https://vladihnatovvv.github.io/wings-bucha-finale/
- Production target: https://wingsbucha.com/
- Адмінка production: `/admin`

GitHub Pages є статичною демонстрацією. Для CMS, PostgreSQL, авторизації й upload потрібен Node.js SSR-сервер.

## Стек

- React 19 + TypeScript
- TanStack Start / Router
- Tailwind CSS 4
- Vite 7
- Prisma 6 + PostgreSQL
- Motion
- Node.js 20+ / npm 10+

## Локальна розробка

```bash
npm ci
cp .env.example .env
npm run dev
```

Dev-сервер стандартно відкривається на `http://localhost:5173`.

Без `DATABASE_URL` сайт використовує fallback-дані. У development-режимі демо-пароль `/admin` — `admin`, якщо `ADMIN_PASSWORD` не заданий.

## Production-збірка

```bash
npm run build
npm run start
```

Результат збірки:

- `dist/client/` — браузерні assets;
- `dist/server/server.js` — SSR handler;
- `deploy/node-server.mjs` — production HTTP server.

Production-сервер стандартно слухає порт `3000`.

## Перевірки

```bash
npm run build
npx tsc --noEmit
npm run lint
```

`npm run lint` може показувати старі форматувальні зауваження. Не запускайте масове форматування всього репозиторію без окремого погодження.

## Структура

- `src/routes/index.tsx` — головна сторінка.
- `src/routes/admin.tsx` — CMS.
- `src/routes/house.$id.tsx` — сторінка будинку.
- `src/routes/compare.tsx` — порівняння.
- `src/routes/__root.tsx` — root layout, SEO, Meta/TikTok pixels.
- `src/components/site/` — компоненти сайту.
- `src/lib/content.functions.ts` — server functions.
- `src/lib/server/` — auth, repository, database, uploads.
- `src/lib/houses.ts` — типи й fallback-дані будинків.
- `src/lib/admin-store.ts` — інші fallback-дані.
- `prisma/schema.prisma` — схема БД.
- `prisma/migrations/` — міграції.
- `public/images/` — оптимізовані WebP.
- `src/assets/fonts/` — self-hosted WOFF2.
- `deploy/` — Node, nginx і systemd конфіги.

## Безпека

Не комітьте `.env`, `DATABASE_URL`, паролі, токени, SSH-ключі або доступи до рекламних кабінетів. Передавайте секрети окремо через password manager або захищене одноразове посилання.
