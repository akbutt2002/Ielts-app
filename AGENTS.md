# Repository Guidelines

## Project Structure & Module Organization
This is a pnpm + Turborepo monorepo. `apps/web` is the Next.js app. Public marketing pages are under `apps/web/app/(marketing)`, authenticated routes under `apps/web/app/home`, and auth flows under `apps/web/app/auth`. Static assets live in `apps/web/public`, while Supabase schema, migrations, and templates live in `apps/web/supabase`.

Shared code is split across `packages/*`: `ui` for reusable components, `auth` and `accounts` for feature logic, `supabase` for client helpers, `i18n` for translations, and `next` for app helpers. Repo-wide tooling lives in `tooling/*`.

## Architecture Overview
The marketing landing page now uses a split composition pattern: `landing-page.tsx` assembles the page, `landing-page.content.ts` stores static data, and `landing-page.shared.tsx` holds reusable helpers. Each section lives in its own file, such as `hero-section.tsx`, `features-section.tsx`, and `newsletter-section.tsx`.

## Build, Test, and Development Commands
- `pnpm install`: install dependencies and run the repo preinstall checks.
- `pnpm dev`: start all workspace dev tasks through Turbo.
- `pnpm build`: create production builds for the workspace packages and apps.
- `pnpm lint`: run ESLint across the monorepo and `manypkg` workspace checks.
- `pnpm format` / `pnpm format:fix`: check or rewrite formatting with Prettier.
- `pnpm typecheck`: run TypeScript checks across the repo.
- `pnpm test`: run all workspace test tasks.
- `pnpm run supabase:web:start|stop|reset`: manage the local Supabase stack for `apps/web`.
- `pnpm --filter web-e2e test`: run Playwright end-to-end tests in `apps/e2e`.

## Coding Style & Naming Conventions
TypeScript is the default. Use 2-space indentation, semicolons, single quotes, and an 80-character print width. Import order is enforced by Prettier: React/Next, third-party modules, then `@kit/*`, `~/*`, and relative imports. Keep components in `PascalCase`, hooks in `use*` form, and route folders/file names aligned with Next.js conventions. Avoid `react-i18next` `Trans`; use `@kit/ui/trans` instead.

## Testing Guidelines
Playwright is the main test framework. E2E specs live in `apps/e2e/tests/**/*.spec.ts`, and page objects use `*.po.ts`. Use `pnpm --filter web-e2e test:ui` for interactive debugging.

## Commit & Pull Request Guidelines
Recent commits are short and imperative, such as `fix branding issue` or `Change marketing page UI`. Keep subjects focused on one change. PRs should include a concise summary, linked issue if there is one, and screenshots for UI changes. Mention Supabase migrations or env var changes explicitly.

## Security & Configuration Tips
Copy required values into `.env.local` before running the app. Turbo watches `.env` files, and generated outputs such as `.next/` and `database.types.ts` should stay out of commits unless regenerated on purpose.
