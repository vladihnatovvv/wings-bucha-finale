# Wings Bucha: технічна передача проєкту

Оновлено: 19 листопада 2026 року.

Цей файл є головною точкою входу для нового розробника або ШІ. Спочатку прочитайте його, потім `ACCESS_CHECKLIST_UA.md`, `.env.example`, `ADMIN_POSTGRES_SETUP_UA.md` і `DEPLOY-HOSTING.md`.

## 1. Репозиторій і публічні адреси

- GitHub: https://github.com/vladihnatovvv/wings-bucha-finale
- Основна гілка коду: `main`
- Статична демонстрація: https://vladihnatovvv.github.io/wings-bucha-finale/
- Гілка демонстрації: `gh-pages`
- Домен замовника: `wingsbucha.com` (доступ до сервера/реєстратора не збережений у репозиторії)
- Адмінка SSR-версії: `/admin`

GitHub Pages є лише демонстрацією. На ньому немає робочої PostgreSQL-бази, серверної авторизації, постійних upload-файлів та повноцінної CMS. Бойову версію треба запускати як Node.js SSR-застосунок на сервері замовника.

## 2. Поточний стек

- React 19 + TypeScript
- TanStack Start і TanStack Router
- Vite 7
- Tailwind CSS 4
- Prisma 6 + PostgreSQL
- Motion для анімацій
- Node.js 20+ і npm 10+
- SSR-раннер: `deploy/node-server.mjs`
- Reverse proxy: nginx

## 3. Швидкий локальний запуск

```bash
npm ci
cp .env.example .env
npm run dev
```

Без `DATABASE_URL` сайт працює на локальних fallback-даних. У development-режимі, якщо `ADMIN_PASSWORD` не заданий, демо-пароль адмінки: `admin`.

Production-перевірка:

```bash
npm run build
npm run start
```

За замовчуванням production-сервер відкривається на `http://localhost:3000`.

## 4. Змінні середовища

Повний шаблон є в `.env.example`.

| Змінна | Обов'язкова в production | Призначення |
| --- | --- | --- |
| `DATABASE_URL` | Так | PostgreSQL connection string для Prisma |
| `ADMIN_PASSWORD` | Так | Пароль входу до `/admin` |
| `ADMIN_SESSION_SECRET` | Так | Сіль для захищеної httpOnly session cookie |
| `UPLOAD_DIR` | Так для локальних upload | Фізична папка для фото, PDF та відео |
| `PUBLIC_UPLOAD_BASE_URL` | Так для локальних upload | Публічний URL, що відповідає `UPLOAD_DIR` |
| `PORT` | Ні | Порт Node.js, стандартно `3000` |
| `HOST` | Ні | Host Node.js, стандартно `0.0.0.0` |
| `NODE_ENV` | Так | У production має бути `production` |

Секретні значення не можна додавати в Git. Вони мають зберігатися в секретах хостингу, systemd EnvironmentFile або закритому password manager.

## 5. CMS та дані

Адмінка знаходиться у `src/routes/admin.tsx`. Серверні операції описані в `src/lib/content.functions.ts`, авторизація в `src/lib/server/admin-auth.ts`, робота з даними в `src/lib/server/content-repository.ts`.

CMS керує:

- будинками, типами та цінами;
- плануваннями й статусами `available`, `reserved`, `sold`;
- заявками з контактної форми;
- контактами сайту;
- документами;
- ходом будівництва;
- відео другого анімованого блока;
- фото, PDF та відеофайлами.

Схема БД: `prisma/schema.prisma`. Міграції: `prisma/migrations/`.

Якщо `DATABASE_URL` відсутній, repository використовує fallback-дані з `src/lib/houses.ts` і `src/lib/admin-store.ts`. Це зручно для демо, але не замінює production-БД.

## 6. Upload-файли

Upload реалізовано в `src/lib/server/uploads.ts`.

- Підтримуються зображення, PDF та відео.
- За замовчуванням файли пишуться в `public/uploads`.
- nginx має пропускати запити до Node.js або окремо віддавати цю папку.
- Папка upload повинна бути постійною та мати права запису для користувача сервісу.
- Для serverless/Cloudflare/Vercel локальний диск не підходить; треба перенести upload у S3/R2 та замінити реалізацію `uploads.ts`.

## 7. Аналітика та комунікації

Інтеграції знаходяться в `src/routes/__root.tsx`:

- Meta Pixel ID: `1058761913721264`
- TikTok Pixel ID: `DAF8JE3C77UDHLL3L250`
- обидва пікселі завантажуються після основного контенту через idle-виклик, щоб не погіршувати LCP;
- контакти Telegram, WhatsApp, телефону й email беруться з CMS/fallback-налаштувань;
- статичні fallback-посилання також є в `src/components/site/FloatingContacts.tsx`.

Перед production-релізом власник має надати доступи до Meta Events Manager і TikTok Events Manager, щоб перевірити PageView та домен. Ідентифікатори пікселів не є секретами, але права до рекламних кабінетів у Git не зберігаються.

## 8. SEO

- Глобальні meta/OG-теги: `src/routes/__root.tsx`
- SEO головної сторінки та canonical: `src/routes/index.tsx`
- SEO сторінок будинків: `src/routes/house.$id.tsx`
- OG-зображення: `public/og-image.jpg`
- Favicon: `public/favicon.png` і оптимізований логотип у `public/images/logo-wings.webp`

Canonical головної зараз вказує на `https://wingsbucha.com/`. Якщо зміниться бойовий домен, оновити `HOME_CANONICAL_URL` у `src/routes/index.tsx` і OG URL.

## 9. Продуктивність

Виконані оптимізації:

- адаптивні WebP-зображення в `public/images/`;
- self-hosted WOFF2-шрифти в `src/assets/fonts/`;
- відкладене завантаження нижніх зображень, відео, калькулятора й selector-компонента;
- Meta/TikTok Pixel відкладені до idle;
- hero не приховується стартовою opacity-анімацією;
- CSS Tailwind обмежений реальними source-папками;
- production target: ES2022.

GitHub Pages має короткий TTL, який неможливо змінити з репозиторію. На nginx конфіг кешу можна контролювати самостійно.

## 10. Важливі файли

| Файл | Призначення |
| --- | --- |
| `src/routes/index.tsx` | Головна сторінка |
| `src/routes/admin.tsx` | CMS |
| `src/routes/house.$id.tsx` | Детальна сторінка будинку |
| `src/routes/compare.tsx` | Порівняння |
| `src/routes/__root.tsx` | Root layout, SEO, pixels |
| `src/lib/content.functions.ts` | Server functions/API |
| `src/lib/server/content-repository.ts` | PostgreSQL/fallback repository |
| `src/lib/server/admin-auth.ts` | Авторизація адмінки |
| `src/lib/server/uploads.ts` | Upload-файли |
| `src/lib/houses.ts` | Типи та fallback-дані будинків |
| `src/lib/admin-store.ts` | Інші fallback-дані |
| `src/styles.css` | Глобальні стилі та шрифти |
| `prisma/schema.prisma` | Схема PostgreSQL |
| `deploy/node-server.mjs` | Production Node.js server |
| `deploy/nginx.conf` | Reverse proxy шаблон |
| `deploy/wings-bucha.service` | systemd шаблон |

## 11. Відомі обмеження та незавершені пункти

- Потрібно отримати реальні контакти замовника замість placeholder-номера.
- Потрібно перевірити реальні Telegram/WhatsApp URL у CMS.
- Потрібно підключити production PostgreSQL і виконати міграції.
- Потрібно перевірити права запису й backup для upload-папки.
- Потрібно перевірити Meta/TikTok Pixel у кабінетах замовника.
- Перед кожним релізом повторювати `npx tsc --noEmit`; nullable guard для редагування ціни в адмінці додано 19 листопада 2026 року.
- `npm run lint` може показувати багато старих Prettier-зауважень; не форматувати весь проєкт без окремого погодження, щоб не створити шумний diff.
- GitHub Pages є статичною демонстрацією, тому зміни CMS там не зберігаються на сервері.

## 12. Безпечний порядок наступної роботи

1. Перевірити `git status`, `git log --oneline -10` і актуальність `origin/main`.
2. Заповнити доступи за `ACCESS_CHECKLIST_UA.md`, не додаючи секрети до Git.
3. Створити локальний `.env` з production-like значеннями.
4. Виконати `npm ci`, `npm run build`, `npx tsc --noEmit`.
5. Перевірити `/`, `/house/duplex`, `/compare`, `/admin`, форму заявки та upload.
6. Після змін перевірити мобільний viewport 393x852 і desktop.
7. Деплоїти `main` на SSR-сервер замовника; `gh-pages` оновлювати лише як демо.

## 13. Критерії готовності production

- SSL активний, canonical збігається з бойовим доменом.
- БД має backup і окремого користувача з мінімальними правами.
- `/admin` приймає production-пароль, cookie secure/httpOnly.
- CMS-зміни переживають restart сервера.
- Upload-файли доступні після restart/redeploy.
- Форма створює заявку в PostgreSQL.
- Meta Pixel і TikTok Pixel отримують PageView.
- Lighthouse перевірено окремо на mobile і desktop.
- У Git немає `.env`, паролів, токенів, SSH-ключів або connection string.
