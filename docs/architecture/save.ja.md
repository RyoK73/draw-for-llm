# スケッチの保存

## 流れ

```
fabric "object:modified"
  -> useSave (250msのdebounce)
  -> saveToDb
  -> upsertSketch (ブラウザのSupabaseクライアント)
  -> sketchesテーブル (RLS: 自分の行のみ)
```

## ファイル

| ファイル                                    | 役割                                                                              |
| ------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/save-sketch/useSave.ts`                | 自動保存がオンのとき、`object:modified`で保存するフックです。                     |
| `src/save-sketch/saveToDb.ts`               | キャンバスから行を組み立て、`upsertSketch`を呼びます。                            |
| `src/supabase/sketch-crud/handleDb.ts`      | `getSketchJson`、`insertSketch`、`upsertSketch`                                   |
| `src/supabase/sketch-crud/serverUtility.ts` | `package.json`から`fabric`のバージョンを読むServer Action`getFabricVersion`です。 |

## 詳細

- `useSave`
  - debounceの待ち時間(`SAVE_DELAY`)は250msで、`p-debounce`を使います。
  - 自動保存(`isAutoSave`)は、デフォルトでオンです。
  - 最初の保存で返ったidを`sketchIdRef`に保持し、以降は同じ行をupsertします。
  - `sketchInfoRef`か`frameRef`が未設定の場合は、保存せずに`err`を設定します。
- `saveToDb`
  - キャンバスのJSON(`canvas.toJSON()`)とfabricのバージョンを取得します。
  - スケッチ情報(`title`、`description`、`cell_size`)と、フレーム(`width`、`height`、`frame_id`)を合成します。
- `handleDb`
  - すべての関数が`Result<T>`(`src/utils/utility.types.ts`)を返します。
  - これらは純粋なCRUD関数です。
  - `upsertSketch`は、返った行数が1でない場合にエラーとなります。
- `width`、`height`、`updated_at`は、DBのトリガが最終的に確定します。
  詳細は[データベース](./database.ja.md)を参照してください。
