# Authentication

Authentication uses Supabase Auth.
Anonymous sign-in is enabled (`enable_anonymous_sign_ins = true` in `supabase/config.toml`).

## Session refresh

- `src/proxy.ts` runs `updateSession` (`src/supabase/auth/proxy.ts`) on each request.
  - Static files and images are excluded by the `matcher`.
- `updateSession` creates a Supabase server client and syncs the cookies.
  Then it passes the same client to `getAuthState` to determine the auth state.
- It redirects according to the auth state and the path as follows.
  Paths are matched by prefix.
  The redirect also carries over the refreshed cookies.

| Auth state   | Path                    | Behavior                 |
| ------------ | ----------------------- | ------------------------ |
| `signedOut`  | Starts with `/sketches` | Redirects to `/`         |
| `registered` | Starts with `/signin`   | Redirects to `/sketches` |
| `registered` | Starts with `/signup`   | Redirects to `/sketches` |
| `guest`      | Any                     | Does not redirect        |

- Any other combination is not redirected.

## Auth state

`getAuthState` (`src/supabase/auth/getAuthState.ts`) returns one of three states.

| State        | Condition                         |
| ------------ | --------------------------------- |
| `signedOut`  | There are no claims               |
| `guest`      | The `is_anonymous` claim is true  |
| `registered` | A non-anonymous user is signed in |

- It receives a Supabase client as an argument.
  This is to use the client with cookie syncing that `updateSession` creates, as it is.
- It throws when `getClaims` returns an error, and leaves the handling to Next.js.
- It imports `server-only`, so it can only be used on the server.

## Sign-in functions

Defined in `src/supabase/auth/` and use the browser client.
Each returns `Result<void>`.

| Function                              | What it does                                            |
| ------------------------------------- | ------------------------------------------------------- |
| `signInWithOTP`                       | Sends a one-time password to the email address          |
| `verifyOTP`                           | Verifies the one-time password                          |
| `signInAnonymously`                   | Signs in as an anonymous user                           |
| `convertAnonymousUserToPermanentUser` | Adds an email to an anonymous user to make it permanent |
| `signOut`                             | Signs out                                               |

## Test setup

- `server-only` throws an error when imported outside Next.js.
- `vitest.config.mts` replaces it with `src/test/emptyModule.ts`, an empty module.

## Authorization

- Anonymous users also use the `authenticated` role in the DB.
- Access to data is limited by RLS. See [Database](./database.en.md).
