# 概要

## 技術スタック

| 領域           | 技術                       |
| -------------- | -------------------------- |
| フレームワーク | Next.js(App Router)、React |
| 描画           | fabric.js                  |
| バックエンド   | Supabase(Postgres、Auth)   |
| バリデーション | zod                        |
| スタイリング   | Tailwind CSS               |
| テスト         | vitest、Testing Library    |

正確なバージョンは`package.json`を参照してください。

## ディレクトリ構成

コードは「何をするか」で縦に分割しています(vertical)。
ルールは[ディレクトリ構成](../rules/directory-structure.ja.md)を参照してください。

| ディレクトリ         | 役割                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| `src/app/`           | ルーティング専用                                                      |
| `src/proxy.ts`       | Next.jsのproxy。リクエストごとに認証セッションを更新します。          |
| `src/draw/`          | fabric.jsによるキャンバス、図形、undo/redo履歴                        |
| `src/save-sketch/`   | スケッチのDBへの保存                                                  |
| `src/auth-form/`     | サインインとゲスト登録のフォーム                                      |
| `src/landing-page/`  | ランディングページの表示(認証状態ごとのボタン)                        |
| `src/new-sketch/`    | スケッチの新規作成(ボタンとServer Action)                             |
| `src/sketch-detail/` | スケッチの個別ページの表示                                            |
| `src/sketch-list/`   | スケッチ一覧の表示(Server ComponentとClient Component)                |
| `src/design-system/` | 汎用UI部品(shadcn/ui由来のボタン、入力欄、ラベル、toast、`LocalTime`) |
| `src/supabase/`      | Supabaseのクライアント、認証、CRUD、DBテスト                          |
| `src/utils/`         | 共通の型                                                              |
| `src/dev-scripts/`   | 開発用スクリプト                                                      |
| `src/test/`          | テスト用のヘルパー                                                    |

## 描画(`src/draw/`)

| ファイル             | 役割                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| `useFabricCanvas.ts` | マウント時にfabricのキャンバスを作成し、アンマウント時に破棄します。       |
| `useShapes.ts`       | 四角形、円、三角形をキャンバスの中央に追加します。                         |
| `useHistory.ts`      | `past` / `present` / `future`を保持し、`set`、`undo`、`redo`を提供します。 |

## スケッチ一覧(`src/sketch-list/`)

| ファイル          | 役割                                                          |
| ----------------- | ------------------------------------------------------------- |
| `sketch-list.tsx` | Server Component。`getSketchList`で取得した一覧を描画します。 |
| `index.ts`        | 公開するのは`SketchList`です。                                |

## 日時表示(`src/design-system/local-time.tsx`)

`LocalTime`は、Client Componentです。
`updated_at`を`<time dateTime>`で表示します。
`LocalTime`の表示は、描画の場面によって次のように異なります。
`useSyncExternalStore`を使い、ハイドレーションの不一致を避けています。

| 場面                           | ロケール           | タイムゾーン           |
| ------------------------------ | ------------------ | ---------------------- |
| サーバー側とハイドレーション時 | `en-US`            | UTC                    |
| クライアント                   | ブラウザのロケール | ブラウザのタイムゾーン |

## スケッチの新規作成(`src/new-sketch/`)

| ファイル                | 役割                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| `start-new-sketch.ts`   | Server Action。必要なら匿名サインインし、空のスケッチを作成して`/sketches/{id}`へ遷移します。 |
| `new-sketch-button.tsx` | Client Component。`startNewSketch`を呼び、失敗したらtoastを表示します。                       |
| `index.ts`              | `NewSketchButton`と`startNewSketch`を公開します。                                             |

## ランディングページ(`src/landing-page/`)

| ファイル           | 役割                                                               |
| ------------------ | ------------------------------------------------------------------ |
| `landing-page.tsx` | Server Component。認証状態を取得し、状態ごとのボタンを描画します。 |
| `index.ts`         | 公開するのは`LandingPage`です。                                    |

## サインインとゲスト登録(`src/auth-form/`)

| ファイル        | 役割                                                                       |
| --------------- | -------------------------------------------------------------------------- |
| `auth-page.tsx` | Server Component。認証状態を取得し、ゲストかどうかを`AuthForm`に渡します。 |
| `auth-form.tsx` | Client Component。メールアドレスとコードの入力、再送、遷移を担当します。   |
| `auth-error.ts` | Supabaseのエラーコードを、表示用の文言に変換します。                       |
| `index.ts`      | 公開するのは`AuthPage`です。                                               |

詳細は[認証](./auth.ja.md)を参照してください。

## スケッチの個別ページ(`src/sketch-detail/`)

| ファイル            | 役割                                                     |
| ------------------- | -------------------------------------------------------- |
| `sketch-detail.tsx` | Server Component。`getSketch`で取得した1件を描画します。 |
| `index.ts`          | 公開するのは`SketchDetail`のみです。                     |

## 次のステップ

- [ルーティング](./routing.ja.md)
- [認証](./auth.ja.md)
- [データベース](./database.ja.md)
- [スケッチの保存](./save.ja.md)
