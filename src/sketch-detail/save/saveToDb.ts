import { Canvas, version } from "fabric";
import { InsertSketch } from "@/supabase/sketch-crud/handleDb.types";
import { upsertSketch } from "@/supabase/sketch-crud/handleDb";
import { createSupabaseBrowserClient } from "@/supabase/utils/browserClient";
import { SketchInfo, CanvasFrame } from "@/sketch-detail/save/saveToDb.types";

const saveToDb = async (
  canvasEl: Canvas,
  sketchInfo: SketchInfo,
  frame: CanvasFrame,
  sketchId?: string,
): ReturnType<typeof upsertSketch> => {
  const canvasJson = canvasEl.toJSON();
  const sketch: InsertSketch = {
    ...sketchInfo,
    ...frame,
    canvas_json: canvasJson,
    fabric_version: version,
  };
  if (sketchId) sketch.id = sketchId;

  const upsertResult = await upsertSketch(
    createSupabaseBrowserClient(),
    sketch,
  );
  return upsertResult;
};

export { saveToDb };
