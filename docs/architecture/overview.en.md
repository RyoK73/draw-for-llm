# Overview

## Tech stack

| Area       | Technology                  |
| ---------- | --------------------------- |
| Framework  | Next.js (App Router), React |
| Drawing    | fabric.js                   |
| Backend    | Supabase (Postgres, Auth)   |
| Validation | zod                         |
| Styling    | Tailwind CSS                |
| Test       | vitest, Testing Library     |

Exact versions are in `package.json`.

## Directory structure

The codebase is split by what it does (vertical).
See [Directory structure](../rules/directory-structure.en.md) for the rule.

| Directory          | Role                                                      |
| ------------------ | --------------------------------------------------------- |
| `src/app/`         | Routing only                                              |
| `src/proxy.ts`     | Next.js proxy. Refreshes the auth session on each request |
| `src/draw/`        | Canvas, shapes and undo/redo history built on fabric.js   |
| `src/save-sketch/` | Saving a sketch to the DB                                 |
| `src/sketch-list/` | Showing the sketch list (Server Component)                |
| `src/supabase/`    | Supabase clients, auth, CRUD and DB tests                 |
| `src/utils/`       | Shared types                                              |
| `src/dev-scripts/` | Scripts for development                                   |
| `src/test/`        | Pure helpers for tests                                    |

## Drawing (`src/draw/`)

| File                 | Role                                                                      |
| -------------------- | ------------------------------------------------------------------------- |
| `useFabricCanvas.ts` | Creates a fabric canvas on mount and disposes it on unmount               |
| `useShapes.ts`       | Adds a rect, circle or triangle to the center of the canvas               |
| `useHistory.ts`      | Keeps `past` / `present` / `future` and provides `set`, `undo` and `redo` |

## Next

- [Authentication](./auth.en.md)
- [Database](./database.en.md)
- [Saving sketches](./save.en.md)
