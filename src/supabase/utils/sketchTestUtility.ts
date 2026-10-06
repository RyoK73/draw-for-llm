import { TestUser } from "@/supabase/utils/supabaseTestUtility.types";
import type { InsertSketch } from "@/supabase/sketch-crud/handleDb.types";

const FABRIC_VERSION = "6.0.0";

// Every column is optional so that the tests can omit columns on purpose.
type SketchPayload = Partial<InsertSketch>;

const insertSketch = (user: TestUser, payload: SketchPayload = {}) =>
  user.client
    .from("sketches")
    // width and height are filled in by the trigger, so they are required in the type but omitted here.
    .insert({ fabric_version: FABRIC_VERSION, ...payload } as InsertSketch)
    .select()
    .single();

const insertSketchOrThrow = async (
  user: TestUser,
  payload: SketchPayload = {},
) => {
  const { data, error } = await insertSketch(user, payload);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export { FABRIC_VERSION, insertSketch, insertSketchOrThrow };
export type { SketchPayload };
