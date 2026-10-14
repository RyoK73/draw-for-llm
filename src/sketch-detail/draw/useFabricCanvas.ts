import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";

type FabricCanvas = {
  width: number;
  height: number;
  backgroundColor: string;
  canvasJson: Record<string, unknown>;
};

const useFabricCanvas = ({
  width,
  height,
  backgroundColor,
  canvasJson,
}: FabricCanvas) => {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error>();

  useEffect(() => {
    if (!canvasElRef.current) return;

    const controller = new AbortController();
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width,
      height,
      backgroundColor,
    });
    fabricCanvasRef.current = canvas;

    canvas
      .loadFromJSON(canvasJson, undefined, { signal: controller.signal })
      .then(() => {
        // `loadFromJSON` clears the background color given to the constructor.
        if (!canvas.backgroundColor) canvas.backgroundColor = backgroundColor;
        canvas.requestRenderAll();
        setIsLoaded(true);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLoadError(
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      });

    return () => {
      controller.abort();
      canvas.dispose();
      setLoadError(undefined);
      setIsLoaded(false);
    };
  }, []); // First mount only

  return { canvasElRef, fabricCanvasRef, isLoaded, loadError };
};

export { useFabricCanvas };
export type { FabricCanvas };
