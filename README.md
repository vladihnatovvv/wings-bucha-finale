# Wings Bucha — Крила Бучі

Лендінг житлового комплексу "Wings Bucha" у Бучі.

## Технологічний стек

- React 19 + TypeScript
- TanStack Start / Router (file-based routing)
- Tailwind CSS v4
- Vite 7
- Bun (як пакетний менеджер; альтернативно — npm/pnpm)

## Локальна розробка

Встановити залежності та запустити dev-сервер:

```bash
bun install
bun run dev
```

Сайт відкриється на http://localhost:5173

Якщо немає Bun — підійде `npm install && npm run dev` або `pnpm install && pnpm dev`.

## Збірка для продакшну

```bash
bun run build
```

Після збірки в папці `.output/` будуть готові файли для деплою:
- `.output/public/` — статичні асети (HTML, JS, CSS, зображення)
- `.output/server/` — серверний бандл (для SSR)

## Деплой на сервер замовника

Проєкт підтримує **три способи деплою** залежно від інфраструктури:

### Варіант 1. Статичний хостинг (nginx / Apache) — найпростіше

Підходить для звичайного VPS або shared-хостингу. Сайт працює як SPA.

1. Локально виконати `bun run build`.
2. Завантажити вміст папки `.output/public/` у кореневу директорію сайту на сервері (наприклад, `/var/www/wings-bucha/`).
3. Налаштувати nginx так, щоб усі невідомі шляхи віддавали `index.html` (для клієнтського роутингу):

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/wings-bucha;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кешування статики
    location ~* \.(js|css|png|jpg|jpeg|gif|webp|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Для Apache аналогічно через `.htaccess`:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Варіант 2. Node.js-сервер (з SSR)

Якщо на сервері встановлено Node.js 20+ і потрібен повноцінний серверний рендеринг:

1. Завантажити весь проєкт на сервер.
2. Виконати:

```bash
bun install --production   # або: npm ci
bun run build
```

3. Запустити сервер (через PM2/systemd):

```bash
node .output/server/index.mjs
```

За замовчуванням слухатиме порт 3000 — пропустити через nginx як reverse proxy.

### Варіант 3. Docker

Створити `Dockerfile`:

```dockerfile
FROM oven/bun:1 AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

FROM nginx:alpine
COPY --from=builder /app/.output/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

Зібрати та запустити:

```bash
docker build -t wings-bucha .
docker run -d -p 80:80 wings-bucha
```

## Структура проєкту

- `src/routes/` — сторінки (file-based routing)
  - `index.tsx` — головна
  - `house.$id.tsx` — сторінка окремого будинку
  - `compare.tsx` — порівняння будинків
  - `__root.tsx` — кореневий лейаут і метатеги
- `src/components/site/` — UI-компоненти лендингу
- `src/components/ui/` — базові shadcn-компоненти
- `src/lib/houses.ts` — дані про будинки
- `src/styles.css` — глобальні стилі і дизайн-токени
- `public/` — статичні ресурси (зображення, og-image, favicon)

## Контент

Дані про будинки — у файлі `src/lib/houses.ts`. Щоб додати/відредагувати будинок, правте цей масив; зображення додавайте в `public/` і посилайтесь на них шляхами `/назва-файлу.jpg`.

## Підтримка

Проєкт побудований на стандартному відкритому стеку (React + Vite + TanStack). Будь-який React-розробник зможе його підтримувати без спеціальних знань.
