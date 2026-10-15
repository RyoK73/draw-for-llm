import { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";

type GetSketchList = Pick<
  DatabaseModified["public"]["Tables"]["sketches"]["Row"],
  "id" | "title" | "description" | "created_at" | "updated_at"
>[];

export type { GetSketchList };
