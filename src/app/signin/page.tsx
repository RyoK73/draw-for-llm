"use client";
import { useFabricCanvas } from "@/draw/useFabricCanvas";
import { Rect, Pattern } from "fabric";

export const App = () => {
  const { canvasElRef, fabricCanvasRef, isDrawing, setIsDrawing } =
    useFabricCanvas({
      width: 1000,
      height: 1000,
      backgroundColor: "#ffffff",
    });

  const rect = new Rect({
    width: 200,
    height: 100,
    fill: "transparent",
    strokeLineCap: "butt",
    strokeLineJoin: "round",
    stroke: "#575757",
    strokeWidth: 10,
    strokeDashArray: [30, 5],
    strokeUniform: true,
    selectable: true,
    originX: "center",
    originY: "center",
  });

  return (
    <main className="h-full">
      <h1>title</h1>
      <canvas
        width="100%"
        height="1000"
        ref={canvasElRef}
        className="w-full h-full"
      />
      <button
        className="bg-emerald-600 p-3"
        onClick={() =>
          fabricCanvasRef.current?.add(rect) &&
          fabricCanvasRef.current.centerObject(rect)
        }
      >
        四角追加
      </button>
    </main>
  );
};

export default App;
