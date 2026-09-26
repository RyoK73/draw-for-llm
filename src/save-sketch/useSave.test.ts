import { act, renderHook } from "@testing-library/react";
import { useSave } from "@/save-sketch/useSave";
import { Canvas } from "fabric";
import { saveToDb } from "@/save-sketch/saveToDb";

vi.mock("@/save-sketch/saveToDb", () => ({
  saveToDb: vi.fn(),
}));

describe("useSave", () => {
  const fabricCanvasTestRef = { current: new Canvas() };
  const canvasIdTestRef = { current: "canvas_id" };
  const testError = new Error("Error: Test Error");

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(saveToDb).mockResolvedValue({
      ok: true,
      value: {
        id: "test",
        user_id: "test",
        canvas_json: "test",
        created_at: "test",
        updated_at: "test",
        title: "test",
        description: "test",
        fabric_version: "test",
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call saveToDb when customHook calls", async () => {
    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
      };
    });

    await act(async () => {
      fabricCanvasTestRef.current.fire("object:modified");
    });

    expect(saveToDb).toHaveBeenCalled();
  });

  it("should call saveToDb when save funtion is called", async () => {
    const { result, rerender } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
      };
    });

    await act(async () => {
      await result.current.save();
    });

    rerender();

    expect(saveToDb).toHaveBeenCalled();
  });

  it("should return an error as err when saveToDb returns an error", async () => {
    vi.mocked(saveToDb).mockResolvedValue({
      ok: false,
      error: testError,
    });
    const { result, rerender } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
      };
    });

    await act(async () => {
      await result.current.save();
    });

    rerender();

    expect(result.current.err).toEqual(testError);
  });
  it("should not call saveToDb when isAutoSave is false", async () => {
    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
      };
      result.current.setAutoSave(false);
    });

    await act(async () => {
      fabricCanvasTestRef.current.fire("object:modified");
    });

    expect(saveToDb).not.toHaveBeenCalled();
  });
  it("should not call saveToDb when sketchInfoRef is null", async () => {
    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef),
    );

    await act(async () => {
      await result.current.save();
    });

    expect(saveToDb).not.toHaveBeenCalled();
  });
  it("should set null to the err when saveToDb succeeds", async () => {
    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
      };
    });

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.err).toBeUndefined();
  });
});
