// 1. canvas instanceを受け取る
// 2. toJsonでjson化する
// 3. Dbに書き込む
// 4. 書き込めなかった場合エラーを返す
// ToDo
// [ ] canvasを渡し、書き込み済みのidを受け取る
// [ ]  fF
import { upsertSketch } from "@/supabase/sketch-crud/handleDb";
import { saveToDb } from "@/save-sketch/saveToDb";
import { Canvas } from "fabric";
import { getFabricVersion } from "@/supabase/sketch-crud/serverUtility";
import { InsertSketch } from "@/supabase/sketch-crud/handleDb.types";

vi.mock(import("@/supabase/sketch-crud/handleDb"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    upsertSketch: vi.fn(),
  };
});

const canvas = new Canvas();

describe("saveToDb", () => {
  const testTitle = "Test Title";
  const fabricVersion = getFabricVersion();

  it("should call insertSketch to save into Db with the valid arguments.", () => {
    saveToDb(canvas, { title: testTitle });
    const validArgument: InsertSketch = {
      title: testTitle,
      canvas_json: canvas.toJSON(),
      fabric_version: fabricVersion,
    };
    expect(upsertSketch).toHaveBeenCalledWith(validArgument);
  });

  it("should return id", async () => {
    vi.mocked(upsertSketch).mockResolvedValue({
      ok: true,
      value: {
        canvas_json: "test json",
        title: testTitle,
        fabric_version: fabricVersion,
        created_at: Date.now().toString(),
        description: null,
        id: "test-id",
        user_id: "test-user-id",
        updated_at: Date.now().toString(),
      },
    });
    const saveResult = await saveToDb(canvas, { title: testTitle });
    if (!saveResult.ok) {
      throw new Error(saveResult.error.message);
    }

    expect(saveResult.value.id).not.toBeNull();
    expect(saveResult.value.id).not.toBeUndefined();
  });

  it("should return an error when upsertSketch fails", async () => {
    const testError: Error = {
      name: "Test Error",
      message: "Test Error Message",
    };
    vi.mocked(upsertSketch).mockResolvedValue({
      ok: false,
      error: testError,
    });
    const saveResult = await saveToDb(canvas, { title: testTitle });
    if (saveResult.ok) throw new Error(`saveResult returns ${saveResult.ok}`);

    expect(saveResult.ok).toBe(false);
    expect(saveResult.error).toEqual(testError);
  });
});
