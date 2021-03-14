import React, { useState, useCallback, useEffect } from "react";
import { useMovable, withMouse } from "react-move-hook";
import { withKeyboard } from "./withKeyboard";
import { compose } from "ramda";

import "./App.css";

// Connectors can be composed
const connect = compose(withMouse, withKeyboard)();

function App() {
  const [state, setState] = useState({
    moving: false,
    position: { x: 0, y: 0 },
    delta: undefined,
  });

  useEffect(() => {
    document.body.classList.toggle("moving", state.moving);
  }, [state.moving]);

  const handleChange = useCallback((moveData) => {
    setState((state) => ({
      moving: moveData.moving,
      position: moveData.stoppedMoving
        ? {
            ...state.position,
            x: state.position.x + moveData.delta.x,
            y: state.position.y + moveData.delta.y,
          }
        : state.position,
      delta: moveData.moving ? moveData.delta : undefined,
    }));
  }, []);

  const ref = useMovable({ onChange: handleChange, connect });

  const style = {
    backgroundColor: state.moving ? "red" : "transparent",
    left: state.position.x,
    top: state.position.y,
    transform: state.delta
      ? `translate3d(${state.delta.x}px, ${state.delta.y}px, 0)`
      : undefined,
  };

  return (
    <div className="container">
      <div ref={ref} className="movable" style={style} tabIndex={0}>
        MOVE ME
      </div>
    </div>
  );
}

export default App;
