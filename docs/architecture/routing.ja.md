# ルーティング

## ルート一覧

| パス             | 内容                                               |
| ---------------- | -------------------------------------------------- |
| `/`              | create-next-appの初期ページです。                  |
| `/signin`        | プレースホルダーです(`<h1>sample</h1>`のみ)。      |
| `/signup`        | プレースホルダーです(`<h1>sample</h1>`のみ)。      |
| `/sketches`      | スケッチ一覧です。`loading.tsx`を持ちます。        |
| `/sketches/[id]` | プレースホルダーです。一覧の各項目のリンク先です。 |

パスごとのリダイレクトは[認証](./auth.ja.md)を参照してください。

## スケッチ一覧(`/sketches`)

`src/app/sketches/page.tsx`は、`src/sketch-list/`の`SketchList`を表示します。
コンポーネントの構成は[概要](./overview.ja.md)を参照してください。

### 取得

- `SketchList`は、`createSupabaseServerClient`で作成したクライアントを`getSketchData`(`src/supabase/sketch-crud/getSketchData.ts`)に渡します。
- `getSketchData`はサーバー専用(`server-only`)です。
- `id`、`title`、`description`、`created_at`、`updated_at`を取得します。
  `canvas_json`は取得しません。
- `updated_at`の降順に並べます。
- `getSketchData`自体には、`user_id`による絞り込みがありません。
  `sketches`テーブルのRLS(`auth.uid() = user_id`)により、ログイン中のユーザーの行だけが返ります。
  詳細は[データベース](./database.ja.md)を参照してください。
- `getSketchData`は`Result<T>`を返します(`src/utils/utility.types.ts`)。

### 表示

| 状態       | 表示                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------ |
| 読み込み中 | `loading.tsx`の「読み込み中…」                                                                   |
| 取得失敗   | `role="alert"`の「スケッチ一覧の取得に失敗しました。」                                           |
| 0件        | 「スケッチがまだありません。」                                                                   |
| 1件以上    | 各項目が`/sketches/{id}`へのリンクです。`title`、`description`(ある場合)、更新日時を表示します。 |

- 更新日時は`LocalTime`で表示します。`updated_at`が`null`の場合は表示しません。
