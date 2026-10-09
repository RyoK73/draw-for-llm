# 認証

認証にはSupabase Authを使用します。
匿名サインインが有効です(`supabase/config.toml`の`enable_anonymous_sign_ins = true`)。

## セッションの更新

- `src/proxy.ts`が、リクエストごとに`updateSession`(`src/supabase/auth/proxy.ts`)を実行します。
  - 静的ファイルと画像は`matcher`で除外されます。
- `updateSession`は、Supabaseのサーバークライアントを作成し、Cookieを同期して、`auth.getClaims()`を呼びます。
- claimsがなく、パスが`/signin`でも`/auth`でもない場合は、`/signin`へリダイレクトします。
- `/signin`ルートは、まだ存在しません。

## 認証状態

`getAuthState`(`src/supabase/auth/getAuthState.ts`)は、3つの状態のいずれかを返します。

| 状態         | 条件                               |
| ------------ | ---------------------------------- |
| `signedOut`  | claimsがない                       |
| `guest`      | `is_anonymous` claimがtrue         |
| `registered` | 匿名ではないユーザーがサインイン中 |

- `getClaims`がエラーを返したときは、throwしてNext.jsに処理を任せます。
- `server-only`をimportしているため、サーバーでのみ使用できます。

## サインイン関数

`src/supabase/auth/`に定義され、ブラウザクライアントを使用します。
いずれも`Result<void>`を返します。

| 関数                                  | 内容                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| `signInWithOTP`                       | メールアドレスにワンタイムパスワードを送信します。           |
| `verifyOTP`                           | ワンタイムパスワードを検証します。                           |
| `signInAnonymously`                   | 匿名ユーザーとしてサインインします。                         |
| `convertAnonymousUserToPermanentUser` | 匿名ユーザーにメールアドレスを追加し、永続ユーザーにします。 |
| `signOut`                             | サインアウトします。                                         |

## テストの設定

- `server-only`は、Next.jsの外でimportするとエラーになります。
- `vitest.config.mts`で、空のモジュールである`src/test/emptyModule.ts`に差し替えています。

## 認可

- 匿名ユーザーも、DBでは`authenticated`ロールを使用します。
- データへのアクセスはRLSで制限されます。
  詳細は[データベース](./database.ja.md)を参照してください。
