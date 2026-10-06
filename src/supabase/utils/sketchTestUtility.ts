import { TestUser } from "@/supabase/utils/supabaseTestUtility.types";
import type { InsertSketch } from "@/supabase/sketch-crud/handleDb.types";

const FABRIC_VERSION = "6.0.0";

// Every column is optional so that the tests can omit columns on purpose.
type SketchPayload = Partial<InsertSketch>;

const insertSketchOrThrow = async (
  user: TestUser,
  payload: SketchPayload = {},
) => {
  const { data, error } = await user.client
    .from("sketches")
    // width and height are filled in by the trigger, so they are required in the type but omitted here.
    .insert({ fabric_version: FABRIC_VERSION, ...payload } as InsertSketch)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export { insertSketchOrThrow };
export type { SketchPayload };
