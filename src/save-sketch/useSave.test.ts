import { act, renderHook } from "@testing-library/react";
import { useSave } from "@/draw/useSave";
import { Canvas } from "fabric";
import consola from "consola";

const canvasEl = document.createElement("canvas");
const fabricCanvasEl = new Canvas(canvasEl);

describe("useSave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should return a json", () => {
    const { result } = renderHook(() => useSave());

    act(() => {
      result.current.save();
    });
  });
});
