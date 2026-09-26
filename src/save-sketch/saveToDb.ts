import { Canvas } from "fabric";
import { InsertSketch } from "@/supabase/sketch-crud/handleDb.types";
import { upsertSketch } from "@/supabase/sketch-crud/handleDb";
import { getFabricVersion } from "@/supabase/sketch-crud/serverUtility";

type Required = "title" | "description";

const saveToDb = async (
  canvasEl: Canvas,
  sketchInfo: Pick<InsertSketch, Required>,
  sketchId?: string,
): ReturnType<typeof upsertSketch> => {
  const canvasJson = canvasEl.toJSON();
  const fabricVersion = getFabricVersion();
  const sketch: InsertSketch = {
    ...sketchInfo,
    canvas_json: canvasJson,
    fabric_version: fabricVersion,
  };
  if (sketchId) sketch.id = sketchId;

  const upsertResult = await upsertSketch(sketch);
  return upsertResult;
};

export { saveToDb };
