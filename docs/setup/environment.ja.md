# 環境変数

## 置き場所

- リポジトリ直下に`.env.local`を作成します。
- `.env.example`をコピーして作成してください。
- `.env*`はgit管理外です。ただし`.env.example`のみ管理対象です。
- `src/setupTests.ts`が全テストの実行時に`.env.local`を読み込みます。
- そのため、`pnpm test`の実行にも`.env.local`が必要です。

## 変数一覧

| 変数                            | 使用箇所                            | 用途                                      |
| ------------------------------- | ----------------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | アプリ(ブラウザ、サーバー)          | SupabaseプロジェクトのURL                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | アプリ(ブラウザ、サーバー)          | Supabaseのanonキー                        |
| `SUPABASE_LOCAL_URL`            | ローカルDBに対するテスト            | ローカルSupabaseのAPI URL                 |
| `SUPABASE_LOCAL_ANON_KEY`       | ローカルDBに対するテスト            | ローカルSupabaseのanonキー                |
| `SUPABASE_LOCAL_ADMIN_KEY`      | ローカルDBに対するテスト            | ローカルSupabaseの管理者キー              |
| `SUPABASE_LOCAL_DB_URL`         | `pg`でPostgresに直接接続するテスト  | ローカルDBの接続文字列                    |
| `PROJECTID`                     | `pnpm type:gen`、`pnpm test:remote` | リモートSupabaseのプロジェクトID          |
| `SUPABASE_ACCESS_TOKEN`         | `pnpm test:remote`                  | Supabase Management APIのアクセストークン |

- アプリは`NEXT_PUBLIC_SUPABASE_URL`と`NEXT_PUBLIC_SUPABASE_ANON_KEY`をzodで検証します(`src/supabase/sketch-crud/handleDb.types.ts`)。
- ローカル用の値は、`pnpm db:start`の後に`pnpm db:status`で確認できます。
- 実際の値は絶対にコミットしないでください。

## 次のステップ

- [データベース](./database.ja.md)
