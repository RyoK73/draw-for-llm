import { z } from "zod";
import { Database } from "@/supabase/database.types";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
});

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

type GetSketchJson =
  Database["public"]["Tables"]["sketches"]["Row"]["canvas_json"];

type InsertSketch = Database["public"]["Tables"]["sketches"]["Insert"];

type GetSketchData = Pick<
  Database["public"]["Tables"]["sketches"]["Row"],
  "id" | "title" | "description" | "created_at"
>[];

export type { Result, GetSketchJson, InsertSketch, GetSketchData };
export { envSchema };
