import { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";

type InsertSketch = DatabaseModified["public"]["Tables"]["sketches"]["Insert"];
type ReturnSketch = DatabaseModified["public"]["Tables"]["sketches"]["Row"];

export type { InsertSketch, ReturnSketch };
