# 認証

認証にはSupabase Authを使用します。
匿名サインインが有効です(`supabase/config.toml`の`enable_anonymous_sign_ins = true`)。

## セッションの更新

- `src/proxy.ts`が、リクエストごとに`updateSession`(`src/supabase/auth/proxy.ts`)を実行します。
  - 静的ファイルと画像は`matcher`で除外されます。
- `updateSession`は、Supabaseのサーバークライアントを作成し、Cookieを同期します。
  その後、同じクライアントを`getAuthState`に渡して認証状態を判定します。
- 認証状態とパスに応じて、次のようにリダイレクトします。
  パスは前方一致で判定します。
  リダイレクト時も、更新したCookieを引き継ぎます。

| 認証状態     | パス                | 動作                          |
| ------------ | ------------------- | ----------------------------- |
| `signedOut`  | `/sketches`で始まる | `/`へリダイレクトする         |
| `registered` | `/signin`で始まる   | `/sketches`へリダイレクトする |
| `registered` | `/signup`で始まる   | `/sketches`へリダイレクトする |
| `guest`      | すべて              | リダイレクトしない            |

- 上記以外の組み合わせは、リダイレクトしません。

## 認証状態

`getAuthState`(`src/supabase/auth/getAuthState.ts`)は、3つの状態のいずれかを返します。

| 状態         | 条件                               |
| ------------ | ---------------------------------- |
| `signedOut`  | claimsがない                       |
| `guest`      | `is_anonymous` claimがtrue         |
| `registered` | 匿名ではないユーザーがサインイン中 |

- 引数でSupabaseクライアントを受け取ります。
  `updateSession`が作成したCookie同期付きのクライアントを、そのまま使うためです。
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
