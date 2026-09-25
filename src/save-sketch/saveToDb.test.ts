// 1. canvas instanceを受け取る
// 2. toJsonでjson化する
// 3. Dbに書き込む
// 4. 書き込めなかった場合エラーを返す
// ToDo
// [ ] canvasを渡し、書き込み済みのidを受け取る
// [ ]  fF
import { insertSketch } from "@/supabase/sketch-crud/handleDb";

vi.mock(import("@/supabase/sketch-crud/handleDb"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    insertSketch: vi.fn(),
  };
});

describe("saveToDb", () => {
  it("should call insertSketch to save into Db", () => {
    const canvas = document.createElement("canvas");
    saveToDb(canvas);
    expect(insertSketch).toHaveBeenCalled();
  });
});
