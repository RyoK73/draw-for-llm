import { z } from "zod";
import { Database } from "@/supabase/utils/database.types";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
});

type GetSketchJson =
  Database["public"]["Tables"]["sketches"]["Row"]["canvas_json"];

type InsertSketch = Database["public"]["Tables"]["sketches"]["Insert"];
type ReturnSketch = Database["public"]["Tables"]["sketches"]["Row"];

type GetSketchData = Pick<
  Database["public"]["Tables"]["sketches"]["Row"],
  "id" | "title" | "description" | "created_at"
>[];

export type { GetSketchJson, InsertSketch, ReturnSketch, GetSketchData };
export { envSchema };
