import { createConnect } from "../packages/react-move-hook/src/connect";

export const withKeyboard = createConnect(({ actions, el }) => {
  const moveListener = (e: KeyboardEvent) => {
    if (document.activeElement !== el) return;
    e.preventDefault();
    actions.moveStart();
    switch (e.key) {
      case "ArrowUp":
        // Using move to move incrementally
        actions.move({ x: 0, y: -10 });
        break;
      case "ArrowRight":
        actions.move({ x: 10, y: 0 });
        break;
      case "ArrowDown":
        actions.move({ x: 0, y: 10 });
        break;
      case "ArrowLeft":
        actions.move({ x: -10, y: 0 });
        break;
      default:
    }
    actions.moveEnd();
  };

  window.addEventListener("keydown", moveListener);

  return () => {
    window.removeEventListener("keydown", moveListener);
  };
});
