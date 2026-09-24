import { act, renderHook } from "@testing-library/react";

import { useFabricCanvas, type FabricCanvas } from "@/draw/useFabricCanvas";
import { Canvas } from "fabric";

const testCanvas = document.createElement("canvas");

const canvasArgument: FabricCanvas = {
  width: 400,
  height: 600,
  backgroundColor: "#ffffff",
};

vi.mock("fabric", () => {
  const Canvas = vi.fn(
    class {
      dispose = vi.fn();
    },
  );
  return { Canvas };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useFabricCanvas", () => {
  test("should be initilized on mount", () => {
    const { result } = renderHook(() => useFabricCanvas(canvasArgument));

    act(() => {
      result.current.canvasElRef.current = testCanvas;
    });
    expect(result.current.canvasElRef).toBeDefined();
  });
  it("should be called when canvasRef is unmounted", () => {
    const { result, unmount, rerender } = renderHook(() =>
      useFabricCanvas(canvasArgument),
    );

    act(() => {
      result.current.canvasElRef.current = testCanvas;
    });
    rerender();
    const instance = vi.mocked(Canvas).mock.instances[0];
    unmount();

    expect(instance.dispose).toHaveBeenCalledOnce();
  });
});
