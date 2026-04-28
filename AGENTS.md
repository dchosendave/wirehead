# Repository Guidelines

## Project Structure & Module Organization

WireHead is an Expo Router React Native puzzle game. Route-level screens live in `app/` (`game.tsx`, `home.tsx`, `settings.tsx`). Reusable UI belongs in `components/`, constants in `constants/`, and gameplay helpers in `lib/` such as `levelGenerator.ts`, `connectivity.ts`, `storage.ts`, and `audio.ts`. Shared TypeScript models are in `types/`. Static media is split under `assets/images/` and `assets/sounds/`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run start`: start the Expo development server.
- `npm run android`: start Expo for an Android target.
- `npm run ios`: start Expo for an iOS target.
- `npm run web`: start the web development target.
- `npm run lint`: run Expo ESLint checks.
- `npx tsc --noEmit`: run a strict TypeScript type check when touching shared types or game logic.

The `reset-project` script points to a missing file; do not rely on it until restored.

## Coding Style & Naming Conventions

Use TypeScript with strict mode enabled. Follow the existing style: 2-space indentation, single quotes, semicolons, named exports for reusable utilities/components, and React function components. Name components in PascalCase (`TileComponent.tsx`), hooks with `use` prefixes, route files in lowercase, and library helpers in camelCase. Keep game rules in `lib/` and presentation constants in `constants/ui-config.ts`.

## Testing Guidelines

No automated test framework or `npm test` script is configured yet. When adding tests, prioritize deterministic logic in `lib/levelGenerator.ts`, `lib/connectivity.ts`, and `lib/tileUtils.ts`. Use colocated files such as `connectivity.test.ts` or a top-level `__tests__/` directory. Until then, run `npm run lint`, `npx tsc --noEmit`, and manually verify gameplay through Expo.

## Commit & Pull Request Guidelines

Recent commits use a lightweight Conventional Commits style, for example `feat(app): add signal propagation`, `fix(bug): startLevel used before its initialized`, and `chore(code-cleanup): added single source of truth for game configs`. Prefer `feat`, `fix`, `chore`, or `docs`, with an optional scope.

Pull requests should include a short summary, testing notes, and screenshots or recordings for UI/gameplay changes. Link issues or roadmap items when available, and call out persistence, level generation, or progression changes because they can affect saved games.

## Security & Configuration Tips

This app is designed to work offline. Do not introduce backend, analytics, ads, or cloud dependencies without updating the README and product requirements. Keep `.expo/`, `dist/`, and `node_modules/` out of commits.
