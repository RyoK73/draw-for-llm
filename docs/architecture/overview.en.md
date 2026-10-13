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

| Directory            | Role                                                                          |
| -------------------- | ----------------------------------------------------------------------------- |
| `src/app/`           | Routing only                                                                  |
| `src/proxy.ts`       | Next.js proxy. Refreshes the auth session on each request                     |
| `src/draw/`          | Canvas, shapes and undo/redo history built on fabric.js                       |
| `src/save-sketch/`   | Saving a sketch to the DB                                                     |
| `src/auth-form/`     | The form for sign-in and guest registration                                   |
| `src/landing-page/`  | Showing the landing page (buttons by auth state)                              |
| `src/new-sketch/`    | Creating a sketch (button and Server Action)                                  |
| `src/sketch-detail/` | Showing the sketch page                                                       |
| `src/design-system/` | Generic UI parts (button, input, label and toast from shadcn/ui, `LocalTime`) |
| `src/sketch-list/`   | Showing the sketch list (Server and Client Components)                        |
| `src/supabase/`      | Supabase clients, auth, CRUD and DB tests                                     |
| `src/utils/`         | Shared types                                                                  |
| `src/dev-scripts/`   | Scripts for development                                                       |
| `src/test/`          | Pure helpers for tests                                                        |

## Drawing (`src/draw/`)

| File                 | Role                                                                      |
| -------------------- | ------------------------------------------------------------------------- |
| `useFabricCanvas.ts` | Creates a fabric canvas on mount and disposes it on unmount               |
| `useShapes.ts`       | Adds a rect, circle or triangle to the center of the canvas               |
| `useHistory.ts`      | Keeps `past` / `present` / `future` and provides `set`, `undo` and `redo` |

## Sketch list (`src/sketch-list/`)

| File              | Role                                                    |
| ----------------- | ------------------------------------------------------- |
| `sketch-list.tsx` | Server Component. Renders the list from `getSketchList` |
| `index.ts`        | Exports `SketchList`                                    |

## Date and time (`src/design-system/local-time.tsx`)

`LocalTime` is a Client Component.
It shows `updated_at` in a `<time dateTime>` element.

`LocalTime` renders differently depending on where it runs.
It uses `useSyncExternalStore` to avoid a hydration mismatch.

| Where                        | Locale         | Time zone         |
| ---------------------------- | -------------- | ----------------- |
| Server side and on hydration | `en-US`        | UTC               |
| Client                       | Browser locale | Browser time zone |

## Creating a sketch (`src/new-sketch/`)

| File                    | Role                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| `start-new-sketch.ts`   | Server Action. Signs in anonymously if needed, creates an empty sketch and goes to `/sketches/{id}` |
| `new-sketch-button.tsx` | Client Component. Calls `startNewSketch` and shows a toast on failure                               |
| `index.ts`              | Exports `NewSketchButton` and `startNewSketch`                                                      |

## Landing page (`src/landing-page/`)

| File               | Role                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| `landing-page.tsx` | Server Component. Gets the auth state and renders the buttons for it |
| `index.ts`         | Exports `LandingPage`                                                |

## Sign-in and guest registration (`src/auth-form/`)

| File            | Role                                                                                 |
| --------------- | ------------------------------------------------------------------------------------ |
| `auth-page.tsx` | Server Component. Gets the auth state and passes whether it is a guest to `AuthForm` |
| `auth-form.tsx` | Client Component. Handles entering the email and the code, resending and navigation  |
| `auth-error.ts` | Converts Supabase error codes into messages to show                                  |
| `index.ts`      | Exports `AuthPage`                                                                   |

See [Authentication](./auth.en.md) for details.

## Sketch page (`src/sketch-detail/`)

| File                | Role                                                    |
| ------------------- | ------------------------------------------------------- |
| `sketch-detail.tsx` | Server Component. Renders one sketch got by `getSketch` |
| `index.ts`          | Exports only `SketchDetail`                             |

## Next

- [Routing](./routing.en.md)
- [Authentication](./auth.en.md)
- [Database](./database.en.md)
- [Saving sketches](./save.en.md)
