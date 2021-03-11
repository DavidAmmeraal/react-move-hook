import { MovableConnector } from "../connector";

export const withKeyboard = (
  connector?: MovableConnector
): MovableConnector => {
  const listeners = {} as { [key: string]: (...args: any) => void };

  return {
    connect: (el, actions) => {
      connector?.connect(el, actions);
      listeners.move = (e: KeyboardEvent) => {
        if (document.activeElement !== el) return;
        e.preventDefault();
        actions.moveStart();
        switch (e.key) {
          case "ArrowUp":
            actions.move({ y: -10 });
            break;
          case "ArrowRight":
            actions.move({ x: 10 });
            break;
          case "ArrowDown":
            actions.move({ y: 10 });
            break;
          case "ArrowLeft":
            actions.move({ x: -10 });
            break;
          default:
        }
        actions.moveEnd();
      };
      window.addEventListener("keydown", listeners.move);
    },
    disconnect: (el) => {
      connector?.disconnect(el);
      el.addEventListener("focus", listeners.moveStart);
      window.addEventListener("keydown", listeners.move);
      el.addEventListener("blur", listeners.moveEnd);
    },
  };
};
