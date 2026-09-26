import { InsertSketch } from "@/supabase/sketch-crud/handleDb.types";

type Required = "title" | "description";
type SketchInfo = Pick<InsertSketch, Required>;

export type { SketchInfo };
