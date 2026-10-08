# Prerequisites

## Required tools

| Tool         | Purpose                                        | Notes                                                     |
| ------------ | ---------------------------------------------- | --------------------------------------------------------- |
| Node.js      | Runs Next.js, vitest and the dev scripts       | `@types/node` is `^22`, so Node.js 22 or later is assumed |
| pnpm         | Package manager                                | `pnpm-lock.yaml` is the only lock file                    |
| Supabase CLI | Runs the local database and manages migrations | Installed as a dev dependency (`supabase`)                |
| Docker       | Runs the local Supabase stack                  | Required by `supabase start`                              |

## Install dependencies

```bash
pnpm install
```

- Use pnpm only. Do not use npm or yarn.
- `pnpm-workspace.yaml` allows the build scripts of `canvas`, `esbuild` and `unrs-resolver`.

## Next

- [Environment variables](./environment.en.md)
