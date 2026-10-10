# Saving sketches

## Flow

```
fabric "object:modified"
  -> useSave (debounce 250 ms)
  -> saveToDb
  -> upsertSketch (browser Supabase client)
  -> sketches table (RLS: own rows only)
```

## Files

| File                                        | Role                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/save-sketch/useSave.ts`                | Hook that saves on `object:modified` when auto-save is on                             |
| `src/save-sketch/saveToDb.ts`               | Builds the row from the canvas and calls `upsertSketch`                               |
| `src/supabase/sketch-crud/handleDb.ts`      | `getSketchJson`, `insertSketch`, `upsertSketch`                                       |
| `src/supabase/sketch-crud/getSketchData.ts` | Server only. Gets the sketch list without `canvas_json`, ordered by `updated_at` desc |
| `src/supabase/sketch-crud/serverUtility.ts` | Server action `getFabricVersion` that reads the `fabric` version from `package.json`  |

## Details

- `useSave`
  - The debounce delay (`SAVE_DELAY`) is 250 ms and uses `p-debounce`.
  - Auto-save (`isAutoSave`) is on by default.
  - The id returned by the first save is kept in `sketchIdRef`, and later saves upsert the same row.
  - If `sketchInfoRef` or `frameRef` is not set, it sets `err` instead of saving.
- `saveToDb`
  - Takes the canvas JSON (`canvas.toJSON()`) and the fabric version.
  - Combines them with the sketch info (`title`, `description`, `cell_size`) and the frame (`width`, `height`, `frame_id`).
- `handleDb`
  - Every function returns `Result<T>` (`src/utils/utility.types.ts`).
  - These are the pure CRUD functions.
  - `upsertSketch` is an error if the number of returned rows is not 1.
- `width`, `height` and `updated_at` are finished by DB triggers. See [Database](./database.en.md).
