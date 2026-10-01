import {
  Canvas,
  Circle,
  FabricObject,
  FabricObjectProps,
  Rect,
  Triangle,
} from "fabric";
import { RefObject } from "react";

type ShapeType = "rect" | "circle" | "triangle";

type OptionalParameters = {
  fill: string;
  stroke: string;
  strokeWidth: number;
};

type Builder = (optionalParam: OptionalParameters) => FabricObject;

const commonParameters: Partial<FabricObjectProps> = {
  originX: "center",
  originY: "center",
  selectable: true,
};

const shapes: Record<ShapeType, Builder> = {
  rect: (optionalParam) =>
    new Rect({
      ...commonParameters,
      ...optionalParam,
      width: 200,
      height: 100,
    }),
  circle: (optionalParam) =>
    new Circle({ ...commonParameters, ...optionalParam, radius: 100 }),
  triangle: (optionalParam) =>
    new Triangle({ ...commonParameters, ...optionalParam }),
};

const useShapes = (fabricCanvasRef: RefObject<Canvas>) => {
  if (fabricCanvasRef.current === null) return;
  const createShape = (
    type: ShapeType,
    fillColor: string = "transparent",
    strokeColor: string = "#575757",
    strokeWidth: number = 10,
  ) => {
    const shape = shapes[type]({
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
    });
    fabricCanvasRef.current.add(shape);
    fabricCanvasRef.current.centerObject(shape);
  };

  return { createShape };
};

export { useShapes };
