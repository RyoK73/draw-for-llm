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

| ディレクトリ       | 役割                                                         |
| ------------------ | ------------------------------------------------------------ |
| `src/app/`         | ルーティング専用                                             |
| `src/proxy.ts`     | Next.jsのproxy。リクエストごとに認証セッションを更新します。 |
| `src/draw/`        | fabric.jsによるキャンバス、図形、undo/redo履歴               |
| `src/save-sketch/` | スケッチのDBへの保存                                         |
| `src/sketch-list/` | スケッチ一覧の表示(Server ComponentとClient Component)       |
| `src/supabase/`    | Supabaseのクライアント、認証、CRUD、DBテスト                 |
| `src/utils/`       | 共通の型                                                     |
| `src/dev-scripts/` | 開発用スクリプト                                             |
| `src/test/`        | テスト用のヘルパー                                           |

## 描画(`src/draw/`)

| ファイル             | 役割                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| `useFabricCanvas.ts` | マウント時にfabricのキャンバスを作成し、アンマウント時に破棄します。       |
| `useShapes.ts`       | 四角形、円、三角形をキャンバスの中央に追加します。                         |
| `useHistory.ts`      | `past` / `present` / `future`を保持し、`set`、`undo`、`redo`を提供します。 |

## スケッチ一覧(`src/sketch-list/`)

| ファイル          | 役割                                                            |
| ----------------- | --------------------------------------------------------------- |
| `sketch-list.tsx` | Server Component。`getSketchData`で取得した一覧を描画します。   |
| `local-time.tsx`  | Client Component。`updated_at`を`<time dateTime>`で表示します。 |
| `index.ts`        | 公開するのは`SketchList`のみです。                              |

`LocalTime`の表示は、描画の場面によって次のように異なります。
`useSyncExternalStore`を使い、ハイドレーションの不一致を避けています。

| 場面                           | ロケール           | タイムゾーン           |
| ------------------------------ | ------------------ | ---------------------- |
| サーバー側とハイドレーション時 | `en-US`            | UTC                    |
| クライアント                   | ブラウザのロケール | ブラウザのタイムゾーン |

## 次のステップ

- [ルーティング](./routing.ja.md)
- [認証](./auth.ja.md)
- [データベース](./database.ja.md)
- [スケッチの保存](./save.ja.md)
