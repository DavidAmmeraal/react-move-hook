import { Position2D } from "./util";

export type MovableConnector = {
  connect: (el: HTMLElement, actions: MovableActions) => void;
  disconnect: (el: HTMLElement) => void;
};

export type MovableActions = {
  moveStart: (pos?: Position2D) => void;
  moveTo: (pos: Position2D) => void;
  move: (payload: Partial<Position2D>) => void;
  moveEnd: (pos?: Position2D) => void;
};

export type MoveEvent = MouseEvent | TouchEvent;

function isTouchEvent(e: MoveEvent): e is TouchEvent {
  if ((e as TouchEvent).touches) {
    return true;
  }
  return false;
}

const eventPosition = (e: MoveEvent) => {
  if (isTouchEvent(e)) {
    return {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }
  return { x: e.clientX, y: e.clientY };
};

const emptyConnector: MovableConnector = {
  connect: () => {},
  disconnect: () => {},
};

export const withTouch = (connector = emptyConnector): MovableConnector => {
  const listeners = {} as { [key: string]: (args: any) => void };

  return {
    connect: (el, actions) => {
      connector.connect(el, actions);

      listeners.moveStartListener = (e: MoveEvent) => {
        actions.moveStart(eventPosition(e));
      };
      listeners.moveListener = (e: MoveEvent) => {
        actions.moveTo(eventPosition(e));
      };
      listeners.moveEndListener = () => {
        actions.moveEnd();
      };

      el.addEventListener("touchstart", listeners.moveStartListener);
      window.addEventListener("touchmove", listeners.moveListener);
      window.addEventListener("touchend", listeners.moveEndListener);
    },
    disconnect: (el) => {
      connector.disconnect(el);
      el.removeEventListener("touchstart", listeners.moveStartListener);
      window.removeEventListener("touchmove", listeners.moveListener);
      window.removeEventListener("touchend", listeners.moveEndListener);
    },
  };
};

export const withMouse = (connector = emptyConnector): MovableConnector => {
  const listeners = {} as { [key: string]: (args: any) => void };
  return {
    connect: (el, actions) => {
      connector.connect(el, actions);

      listeners.moveStartListener = (e: MoveEvent) => {
        actions.moveStart(eventPosition(e));
      };
      listeners.moveListener = (e: MoveEvent) => {
        actions.moveTo(eventPosition(e));
      };
      listeners.moveEndListener = () => {
        actions.moveEnd();
      };

      el.addEventListener("mousedown", listeners.moveStartListener);
      window.addEventListener("mousemove", listeners.moveListener);
      window.addEventListener("mouseup", listeners.moveEndListener);
    },
    disconnect: (el) => {
      connector.disconnect(el);
      el.removeEventListener("mousedown", listeners.moveStartListener);
      window.removeEventListener("mousemove", listeners.moveListener);
      window.removeEventListener("mouseup", listeners.moveEndListener);
    },
  };
};
