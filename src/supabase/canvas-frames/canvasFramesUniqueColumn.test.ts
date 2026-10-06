import { Client } from "pg";

const DATABASE_URL = process.env.SUPABASE_LOCAL_DB_URL;

const client = new Client({ connectionString: DATABASE_URL });

beforeAll(() => client.connect());
afterAll(() => client.end());

const CANVAS_FRAMES_NAME_UNIQUE_VIOLATION = "23505";

it("should return an error 'ERROR:  23505: duplicate key value violates unique constraint'", async () => {
  await expect(
    client.query(`
    begin;
    insert into public.canvas_frames (name,width,height) values('desktop_fhd',800,800);
rollback;`),
  ).rejects.toMatchObject({ code: CANVAS_FRAMES_NAME_UNIQUE_VIOLATION });
});
