import { act, renderHook, waitFor } from "@testing-library/react";
import { useSave } from "@/save-sketch/useSave";
import { Canvas } from "fabric";
import { saveToDb } from "@/save-sketch/saveToDb";
import { CanvasFrame } from "@/save-sketch/saveToDb.types";

vi.mock("@/save-sketch/saveToDb", () => ({
  saveToDb: vi.fn(),
}));

describe("useSave", () => {
  const fabricCanvasTestRef = { current: new Canvas() };
  const canvasIdTestRef = { current: "canvas_id" };
  const testFrame: CanvasFrame = {
    width: 1920,
    height: 1080,
    frame_id: "test-frame-id",
  };
  const frameTestRef: { current: CanvasFrame | null } = {
    current: testFrame,
  };
  const testError = new Error("Error: Test Error");

  beforeEach(() => {
    vi.clearAllMocks();
    frameTestRef.current = testFrame;
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
        cell_size: 32,
        frame_id: null,
        width: 1920,
        height: 1080,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call saveToDb when customHook calls", async () => {
    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
      };
    });

    await act(async () => {
      fabricCanvasTestRef.current.fire("object:modified");
    });

    await waitFor(() => {
      expect(saveToDb).toHaveBeenCalled();
    });
  });

  it("should call saveToDb when save funtion is called", async () => {
    const { result, rerender } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef),
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
  it("should return last one when save() called in a row.", async () => {
    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
      };
    });

    const promises: Promise<void>[] = [];
    await act(async () => {
      for (let ct: number = 0; ct < 4; ct++) {
        promises.push(result.current.save());
      }
    });
    await Promise.all(promises);

    expect(saveToDb).toHaveBeenCalledOnce();
  });
  it("should call saveToDb with the frame of frameRef", async () => {
    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
      };
    });

    await act(async () => {
      await result.current.save();
    });

    expect(saveToDb).toHaveBeenCalledWith(
      fabricCanvasTestRef.current,
      result.current.sketchInfoRef.current,
      testFrame,
      canvasIdTestRef.current,
    );
  });
  it("should call saveToDb with the latest frame of frameRef", async () => {
    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
      };
    });
    const customFrame: CanvasFrame = {
      width: 800,
      height: 600,
      frame_id: null,
    };
    frameTestRef.current = customFrame;

    await act(async () => {
      await result.current.save();
    });

    expect(saveToDb).toHaveBeenCalledWith(
      fabricCanvasTestRef.current,
      result.current.sketchInfoRef.current,
      customFrame,
      canvasIdTestRef.current,
    );
  });
  it("should pass cell_size in sketchInfoRef to saveToDb", async () => {
    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
        cell_size: 32,
      };
    });

    await act(async () => {
      await result.current.save();
    });

    expect(saveToDb).toHaveBeenCalledWith(
      fabricCanvasTestRef.current,
      { title: "test title", cell_size: 32 },
      testFrame,
      canvasIdTestRef.current,
    );
  });
  it("should set null to the err when saveToDb succeeds", async () => {
    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef),
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
  test("The second saveToDb calling should call saveToDb with the Id that first test returns", async () => {
    const testId: string = "returned-id";
    vi.mocked(saveToDb).mockResolvedValue({
      ok: true,
      value: {
        id: testId,
        user_id: "test",
        canvas_json: "test",
        created_at: "test",
        updated_at: "test",
        title: "test",
        description: "test",
        fabric_version: "test",
        cell_size: 32,
        frame_id: null,
        width: 1920,
        height: 1080,
      },
    });

    const canvasIdReturnableRef: { current: string | undefined } = {
      current: undefined,
    };

    const { result } = renderHook(() =>
      useSave(fabricCanvasTestRef, canvasIdReturnableRef, frameTestRef),
    );

    act(() => {
      result.current.sketchInfoRef.current = {
        title: "test title",
      };
    });

    await act(async () => {
      await result.current.save();
    });
    await act(async () => {
      await result.current.save();
    });

    expect(saveToDb).toHaveBeenNthCalledWith(
      1,
      fabricCanvasTestRef.current,
      result.current.sketchInfoRef.current,
      testFrame,
      undefined,
    );
    expect(saveToDb).toHaveBeenNthCalledWith(
      2,
      fabricCanvasTestRef.current,
      result.current.sketchInfoRef.current,
      testFrame,
      testId,
    );
  });
  describe("Error pattern", () => {
    it("should return an error as err when saveToDb returns an error", async () => {
      vi.mocked(saveToDb).mockResolvedValue({
        ok: false,
        error: testError,
      });
      const { result, rerender } = renderHook(() =>
        useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef),
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
        useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef),
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
        useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef),
      );

      await act(async () => {
        await result.current.save();
      });

      expect(saveToDb).not.toHaveBeenCalled();
    });
    it("should retrun error when sketchInfoRef is null", async () => {
      const { result } = renderHook(() =>
        useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef),
      );

      await act(async () => {
        fabricCanvasTestRef.current.fire("object:modified");
      });

      expect(result.current.err?.message).toEqual(
        "Error: sketchInfoRef is null.",
      );
    });
    it("should not call saveToDb when frameRef is null", async () => {
      frameTestRef.current = null;
      const { result } = renderHook(() =>
        useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef),
      );

      act(() => {
        result.current.sketchInfoRef.current = {
          title: "test title",
        };
      });

      await act(async () => {
        await result.current.save();
      });

      expect(saveToDb).not.toHaveBeenCalled();
    });
    it("should return error when frameRef is null", async () => {
      frameTestRef.current = null;
      const { result } = renderHook(() =>
        useSave(fabricCanvasTestRef, canvasIdTestRef, frameTestRef),
      );

      act(() => {
        result.current.sketchInfoRef.current = {
          title: "test title",
        };
      });

      await act(async () => {
        await result.current.save();
      });

      expect(result.current.err?.message).toEqual("Error: frameRef is null.");
    });
  });
});
