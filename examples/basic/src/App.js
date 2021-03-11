import React, { useState, useCallback } from "react";
import { useMovable } from "react-move-hook";

import "./App.css";

function App() {
  const [state, setState] = useState({
    moving: false,
    position: { x: 0, y: 0 },
    delta: undefined,
  });

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

  const ref = useMovable({ onChange: handleChange, bounds: "parent" });

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
      <div ref={ref} className="movable" style={style}>
        MOVE ME
      </div>
    </div>
  );
}

export default App;
