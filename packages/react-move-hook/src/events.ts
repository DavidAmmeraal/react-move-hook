import { Position2D } from "./util";

export type InputEvent = MouseEvent | TouchEvent;

function isTouchEvent(e: InputEvent): e is TouchEvent {
  if ((e as TouchEvent).targetTouches) {
    return true;
  }
  return false;
}

export function eventPosition(e: InputEvent): Position2D {
  if (isTouchEvent(e)) {
    return {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }
  return { x: e.clientX, y: e.clientY };
}
