# 前提ツール

## 必要なツール

| ツール       | 用途                                     | 備考                                                         |
| ------------ | ---------------------------------------- | ------------------------------------------------------------ |
| Node.js      | Next.js、vitest、開発用スクリプトの実行  | `@types/node`が`^22`のため、Node.js 22以上を想定しています。 |
| pnpm         | パッケージマネージャー                   | ロックファイルは`pnpm-lock.yaml`のみです。                   |
| Supabase CLI | ローカルDBの起動、マイグレーションの管理 | 開発依存(`supabase`)として導入されます。                     |
| Docker       | ローカルのSupabaseの実行                 | `supabase start`に必要です。                                 |

## 依存関係のインストール

```bash
pnpm install
```

- pnpmのみを使用します。npmやyarnは使用しません。
- `pnpm-workspace.yaml`で、`canvas`、`esbuild`、`unrs-resolver`のビルドスクリプトを許可しています。

## 次のステップ

- [環境変数](./environment.ja.md)
