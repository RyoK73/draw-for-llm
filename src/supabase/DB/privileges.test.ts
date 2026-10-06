import { Client } from "pg";

const DATABASE_URL = process.env.SUPABASE_LOCAL_DB_URL;

const client = new Client({ connectionString: DATABASE_URL });

beforeAll(() => client.connect());
afterAll(() => client.end());

describe("privileges", () => {
  test("The anon and service_role roles have no privileges and authenticated role doesn't have `truncate,references,maintain,trigger` privileges", async () => {
    const { rows } = await client.query(`
        select pgc.oid,pgc.relkind,pgnsp.nspname,pgc.relname
        from pg_class as pgc
        join pg_namespace as pgnsp on pgc.relnamespace = pgnsp.oid
        where relkind in ('r','v','m','p')
        and pgnsp.nspname = 'public'
        and(
          has_table_privilege('anon',pgc.oid,'select,insert,delete,update,truncate,references,maintain,trigger')
        or has_table_privilege('authenticated',pgc.oid,'truncate,references,maintain,trigger')
        or has_table_privilege('service_role',pgc.oid,'select,insert,delete,update,truncate,references,maintain,trigger')
        )
    `);
    expect(rows.length).toBe(0);
  });

  test("The authenticated role has `select,insert,delete,update` privileges", async () => {
    const { rowCount } = await client.query(
      `select * from information_schema.tables where table_schema = 'public'`,
    );

    const { rows } = await client.query(`
        select pgc.oid,pgc.relkind,pgnsp.nspname,pgc.relname
        from pg_class as pgc
        join pg_namespace as pgnsp on pgc.relnamespace = pgnsp.oid
        where relkind in ('r','v','m','p')
        and pgnsp.nspname = 'public'
        and has_table_privilege('authenticated',pgc.oid,'select')
        and has_table_privilege('authenticated',pgc.oid,'insert')
        and has_table_privilege('authenticated',pgc.oid,'delete')
        and has_table_privilege('authenticated',pgc.oid,'update')
    `);
    expect(rows.length).toBe(rowCount);
  });
});
