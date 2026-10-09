# Database

The database is Supabase (Postgres).
Migrations are in `supabase/migrations/`, and the seed data is in `supabase/seed.sql`.

## Local database

| Command           | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `pnpm db:start`   | Starts the local Supabase stack (Docker is required)      |
| `pnpm db:status`  | Shows the URLs and keys of the local stack                |
| `pnpm db:reset`   | Recreates the local DB from the migrations and `seed.sql` |
| `pnpm db:stop`    | Stops the local stack                                     |
| `pnpm db:version` | Shows the Supabase CLI version                            |

### Main local ports

Defined in `supabase/config.toml`.

| Service                 | Port  |
| ----------------------- | ----- |
| API                     | 54321 |
| DB                      | 54322 |
| Studio                  | 54323 |
| local_smtp (local mail) | 54324 |

## Migrations

| Command              | What it does                                                                |
| -------------------- | --------------------------------------------------------------------------- |
| `pnpm db:new <name>` | Creates a new migration file                                                |
| `pnpm db:push`       | Applies the migrations to the linked remote project. The DB link is needed. |
| `pnpm db:pull`       | Pulls the schema of the remote project as a migration                       |

## Generate types

The types are written to `src/supabase/utils/database.types.ts`.
Regenerate them whenever the schema changes.

| Command               | Source                                                 |
| --------------------- | ------------------------------------------------------ |
| `pnpm type:gen-local` | The local DB                                           |
| `pnpm type:gen`       | The remote project (needs `PROJECTID` in `.env.local`) |

## Next

- [Development](./development.en.md)
- [Database design](../architecture/database.en.md)
