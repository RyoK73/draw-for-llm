import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";

type FabricCanvas = {
  width: number;
  height: number;
  backgroundColor: string;
};

const useFabricCanvas = ({ width, height, backgroundColor }: FabricCanvas) => {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width,
      height,
      backgroundColor,
    });

    return () => {
      canvas.dispose();
      canvasElRef.current = null;
    };
  });

  return { canvasElRef, fabricCanvasRef, isDrawing, setIsDrawing };
};

export { useFabricCanvas };
export type { FabricCanvas };
