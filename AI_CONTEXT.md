# AI context: Wings Bucha

You are continuing development of the Wings Bucha website.

Read these files before changing code:

1. `PROJECT_HANDOFF_UA.md`
2. `ACCESS_CHECKLIST_UA.md`
3. `.env.example`
4. `ADMIN_POSTGRES_SETUP_UA.md`
5. `DEPLOY-HOSTING.md`

Repository: https://github.com/vladihnatovvv/wings-bucha-finale

Rules:

- Preserve the existing visual language and mobile layout.
- Preserve CMS, PostgreSQL, admin auth, upload, Meta Pixel and TikTok Pixel.
- Never commit secrets, `.env`, credentials, SSH keys or production connection strings.
- Treat GitHub Pages as a static demo only; production requires the Node.js SSR server.
- Before edits, inspect `git status`, current branch and latest commits.
- Do not overwrite unrelated user changes.
- Use responsive WebP assets and keep below-the-fold media lazy.
- Keep analytics deferred until load/idle to protect LCP.
- After edits run `npm run build` and `npx tsc --noEmit`.
- Verify `/`, `/house/duplex`, `/compare`, `/admin`, form submission and upload.
- Verify mobile at 393x852 and desktop before deployment.
- If TypeScript errors remain in `src/routes/admin.tsx`, report and fix them explicitly rather than hiding them.

Current public demo: https://vladihnatovvv.github.io/wings-bucha-finale/

Production target domain: https://wingsbucha.com/

Primary code areas:

- Main page: `src/routes/index.tsx`
- Admin CMS: `src/routes/admin.tsx`
- Server functions: `src/lib/content.functions.ts`
- Database repository: `src/lib/server/content-repository.ts`
- Prisma schema: `prisma/schema.prisma`
- Auth: `src/lib/server/admin-auth.ts`
- Upload: `src/lib/server/uploads.ts`
- SEO and pixels: `src/routes/__root.tsx`
- Production server: `deploy/node-server.mjs`
