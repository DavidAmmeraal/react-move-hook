import { eventPosition, InputEvent } from "./events";
import { Position2D } from "./util";

export type MovableConnectArgs = {
  actions: MovableActions;
  el: HTMLElement;
};

export type MovableConnect = (args: MovableConnectArgs) => () => void;

export type MovableActions = {
  moveStart: (pos?: Position2D) => void;
  moveTo: (pos: Position2D) => void;
  move: (payload: Position2D) => void;
  moveEnd: () => void;
};

export const connect = (a: MovableConnect) => (
  b?: MovableConnect
): MovableConnect => {
  const c: MovableConnect = (...args) => {
    if (!b) return a(...args);
    const cleanupA = a(...args);
    const cleanupB = b(...args);

    return () => {
      cleanupA();
      cleanupB();
    };
  };

  return c;
};

export const withTouch = connect(({ actions, el }) => {
  const moveStartListener = (e: TouchEvent) => {
    e.preventDefault();
    actions.moveStart(eventPosition(e));
  };
  const moveListener = (e: TouchEvent) => {
    actions.moveTo(eventPosition(e));
  };
  const moveEndListener = () => {
    actions.moveEnd();
  };

  el.addEventListener("touchstart", moveStartListener);
  el.addEventListener("touchmove", moveListener);
  el.addEventListener("touchend", moveEndListener);

  return () => {
    el.removeEventListener("touchstart", moveStartListener);
    el.removeEventListener("touchmove", moveListener);
    el.removeEventListener("touchend", moveEndListener);
  };
});

export const withMouse = connect(({ actions, el }) => {
  const moveStartListener = (e: InputEvent) => {
    actions.moveStart(eventPosition(e));
  };
  const moveListener = (e: InputEvent) => {
    actions.moveTo(eventPosition(e));
  };
  const moveEndListener = () => {
    actions.moveEnd();
  };

  el.addEventListener("mousedown", moveStartListener);
  window.addEventListener("mousemove", moveListener);
  window.addEventListener("mouseup", moveEndListener);

  return () => {
    el.removeEventListener("mousedown", moveStartListener);
    window.removeEventListener("mousemove", moveListener);
    window.removeEventListener("mouseup", moveEndListener);
  };
});

export const defaultConnect = withMouse(withTouch());
