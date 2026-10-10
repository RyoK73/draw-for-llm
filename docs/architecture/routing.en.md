# Routing

## Routes

| Path             | Content                                               |
| ---------------- | ----------------------------------------------------- |
| `/`              | The initial page of create-next-app                   |
| `/signin`        | Placeholder (only `<h1>sample</h1>`)                  |
| `/signup`        | Placeholder (only `<h1>sample</h1>`)                  |
| `/sketches`      | The sketch list. Has a `loading.tsx`                  |
| `/sketches/[id]` | Placeholder. The link target of each item in the list |

See [Authentication](./auth.en.md) for the redirects by path.

## Sketch list (`/sketches`)

`src/app/sketches/page.tsx` renders `SketchList` from `src/sketch-list/`.
See [Overview](./overview.en.md) for the components.

### Fetching

- `SketchList` passes a client made by `createSupabaseServerClient` to `getSketchData` (`src/supabase/sketch-crud/getSketchData.ts`).
- `getSketchData` is server only (`server-only`).
- It gets `id`, `title`, `description`, `created_at` and `updated_at`.
  It does not get `canvas_json`.
- It orders the rows by `updated_at` descending.
- `getSketchData` itself has no filter by `user_id`.
  The RLS of the `sketches` table (`auth.uid() = user_id`) returns only the rows of the signed-in user.
  See [Database](./database.en.md).
- `getSketchData` returns `Result<T>` (`src/utils/utility.types.ts`).

### Display

| State   | Display                                                                                         |
| ------- | ----------------------------------------------------------------------------------------------- |
| Loading | "読み込み中…" from `loading.tsx`                                                                |
| Error   | "スケッチ一覧の取得に失敗しました。" with `role="alert"`                                        |
| No rows | "スケッチがまだありません。"                                                                    |
| 1+ rows | Each item links to `/sketches/{id}`. Shows `title`, `description` (if any) and the updated time |

- The updated time is shown by `LocalTime`. It is not shown when `updated_at` is `null`.
