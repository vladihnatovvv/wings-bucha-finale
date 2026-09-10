# Деплой на звичайний сервер або хостинг

Цей проєкт підготовлений для деплою на VPS або сервер з `Node.js 20+` і `nginx`.

## Що передати системному адміну

Передайте весь репозиторій цілком, включно з:

- `package.json`
- `package-lock.json`
- `src/`
- `public/`
- `deploy/`
- `vite.config.ts`
- `tsconfig.json`

Найпростіше: дати адміну архів усієї папки проєкту.

## Що має бути на сервері

- `Node.js 20+`
- `npm 10+`
- `nginx`

## Команди на сервері

```bash
cd /var/www/wings-bucha
npm ci
npm run build
npm run start
```

За замовчуванням застосунок стартує на порту `3000`.

## Env-змінні

Перед `npm run build` на сервері треба задати:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/wingsbucha_db?schema=public"
ADMIN_PASSWORD="надійний-пароль-для-адмінки"
ADMIN_SESSION_SECRET="довгий-випадковий-секрет-для-cookie"
UPLOAD_DIR="public/uploads"
PUBLIC_UPLOAD_BASE_URL="/uploads"
```

Якщо `DATABASE_URL` заданий, під час `npm run build` автоматично виконаються Prisma-міграції.

## Запуск як сервіс

У папці [deploy/wings-bucha.service](/Users/ihnatovvladgmail.com/Downloads/wings-bucha/deploy/wings-bucha.service) є готовий `systemd` unit.

Що треба зробити адміну:

1. Скопіювати файл у `/etc/systemd/system/wings-bucha.service`
2. За потреби змінити `WorkingDirectory`, `User`, `Group`
3. Активувати сервіс:

```bash
sudo systemctl daemon-reload
sudo systemctl enable wings-bucha
sudo systemctl restart wings-bucha
sudo systemctl status wings-bucha
```

## Nginx

У папці [deploy/nginx.conf](/Users/ihnatovvladgmail.com/Downloads/wings-bucha/deploy/nginx.conf) є базовий reverse-proxy конфіг.

Що треба змінити:

- `server_name` на реальний домен
- за потреби SSL через Let's Encrypt / Certbot

Після цього `nginx` має проксувати трафік на `127.0.0.1:3000`.

## Важливо

- Перед запуском у продакшні треба обов'язково виконати `npm run build`
- Серверний запуск іде через [deploy/node-server.mjs](/Users/ihnatovvladgmail.com/Downloads/wings-bucha/deploy/node-server.mjs)
- Цей раннер сам віддає `dist/client` як статику і SSR-сторінки через `dist/server/server.js`
- Для продакшену обов'язково потрібні `DATABASE_URL`, `ADMIN_PASSWORD` і `ADMIN_SESSION_SECRET`
