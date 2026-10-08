# Database

Postgres on Supabase.
The schema is defined by `supabase/migrations/`.
The generated types are in `src/supabase/utils/database.types.ts`.

## Tables

### `public.sketches`

A sketch drawn by a user.

| Column                     | Notes                                                                   |
| -------------------------- | ----------------------------------------------------------------------- |
| `id`                       | uuid, primary key                                                       |
| `user_id`                  | References `auth.users` (`ON DELETE CASCADE`). Defaults to `auth.uid()` |
| `title`                    | Defaults to `'Untitled'`                                                |
| `description`              |                                                                         |
| `canvas_json`              | jsonb. The fabric canvas serialized with `toJSON()`. Defaults to `{}`   |
| `fabric_version`           | The fabric version used when saving                                     |
| `frame_id`                 | References `canvas_frames` (`ON DELETE SET NULL`)                       |
| `width`, `height`          | 320 to 1920                                                             |
| `cell_size`                | Defaults to 20. 4 to 200                                                |
| `created_at`, `updated_at` | `updated_at` is set by the `trg_set_updated_at` trigger                 |

### `public.canvas_frames`

A canvas size (frame) that a sketch can use.

| Column            | Notes                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------- |
| `id`              | uuid, primary key                                                                       |
| `user_id`         | References `auth.users` (`ON DELETE CASCADE`). `NULL` means an official preset          |
| `name`            | 1 to 100 characters. Cannot be only whitespace. Official presets must have unique names |
| `width`, `height` | 320 to 1920                                                                             |

### Official frames

`supabase/seed.sql` inserts 7 official frames (`user_id` is `NULL`).

| Name               | Size      |
| ------------------ | --------- |
| `desktop_fhd`      | 1920x1080 |
| `laptop`           | 1440x900  |
| `tablet_portrait`  | 768x1024  |
| `tablet_landscape` | 1024x768  |
| `mobile_portrait`  | 390x844   |
| `mobile_landscape` | 844x390   |
| `mobile_small`     | 320x568   |

## Frame and size rules

The `sketches_apply_frame` trigger runs before an insert, or before an update of `frame_id`, `width` or `height`.

- If nothing is specified on insert, the `desktop_fhd` frame is applied.
- If only `frame_id` is specified, the width and height of the frame are copied.
- If `width` and `height` are specified, they take priority. If they do not match the frame, `frame_id` is set to `NULL`.
- On insert, specifying only one of `width` and `height` is an error.

Official frames are not protected from changes in the DB at present (the protecting trigger was dropped).

## Row Level Security

- RLS is enabled on both tables.
- `sketches`: a user can do everything on their own rows (`auth.uid() = user_id`).
- `canvas_frames`: a user can read official frames and their own frames, and can create, update and delete only their own frames.

## Privileges

- `anon` and `service_role` have no privileges on these tables.
- `authenticated` has `SELECT`, `INSERT`, `UPDATE` and `DELETE` only.
- The default privileges of the `public` schema are revoked for `anon`, `authenticated` and `service_role`.
- Tests for these rules are in `src/supabase/DB/privileges.test.ts`.

## Changing the schema

1. Create a migration with `pnpm db:new`. See [Database setup](../setup/database.en.md).
2. Start the migration with `SET lock_timeout = '5s'` when it alters a table.
3. Regenerate the types with `pnpm type:gen-local`.
4. Update this document.
