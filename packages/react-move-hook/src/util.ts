export function isUnknownObject(
  x: unknown
): x is { [key in PropertyKey]: unknown } {
  return x !== null && typeof x === "object";
}

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Bounds {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export type BoundingRect = Rect & Bounds;

export const emptyBoundingRect = (): BoundingRect => ({
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  bottom: 0,
  right: 0,
});

export function isBoundingRect(arg: unknown): arg is BoundingRect {
  return (
    isUnknownObject(arg) &&
    typeof arg.top === "number" &&
    typeof arg.left === "number" &&
    typeof arg.bottom === "number" &&
    typeof arg.right === "number" &&
    typeof arg.width === "number" &&
    typeof arg.height === "number"
  );
}

export function toBoundingRect(input: Rect | undefined): BoundingRect {
  if (!input) return emptyBoundingRect();
  return {
    ...input,
    top: input.top,
    left: input.left,
    width: input.width,
    height: input.height,
    right: isBoundingRect(input) ? input.right : 0,
    bottom: isBoundingRect(input) ? input.bottom : 0,
  };
}

export function rectDelta(a?: Rect, b?: Rect) {
  return {
    x: a && b ? b.left - a.left : 0,
    y: a && b ? b.top - a.top : 0,
  };
}

export function addPos(
  a: Position2D = emptyPosition2D(),
  b: Position2D = emptyPosition2D()
) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

export function subPos(
  a: Position2D = emptyPosition2D(),
  b: Position2D = emptyPosition2D()
) {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}

export type Position2D = {
  x: number;
  y: number;
};

export const emptyPosition2D = () => ({
  x: 0,
  y: 0,
});
