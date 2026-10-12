import { Database } from "@/supabase/utils/database.types";

type GetSketchList = Pick<
  Database["public"]["Tables"]["sketches"]["Row"],
  "id" | "title" | "description" | "created_at" | "updated_at"
>[];

export type { GetSketchList };
