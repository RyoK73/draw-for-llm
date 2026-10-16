import { InsertSketch } from "@/supabase/sketch-crud/handleDb.types";

type Required = "title" | "description" | "cell_size";
type SketchInfo = Pick<InsertSketch, Required>;
type CanvasFrame = Pick<InsertSketch, "width" | "height" | "frame_id">;

export type { SketchInfo, CanvasFrame };
