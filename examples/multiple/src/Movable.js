import React, { useState, useEffect, useCallback } from "react";
import { useMovable } from "react-move-hook";

const Movable = ({ style: styleProp }) => {
  const [state, setState] = useState({
    moving: false,
    delta: undefined,
  });

  useEffect(() => {
    // Adding a class with overflow: hidden to body, so screen doesn't move while using touch input
    document.body.classList.toggle("moving", state.moving);
  }, [state.moving]);

  const handleChange = useCallback((moveData) => {
    setState({
      ...moveData,
      delta: moveData.moving ? moveData.delta : undefined,
    });
  }, []);

  const ref = useMovable({ onChange: handleChange, bounds: "parent" });

  const style = {
    ...styleProp,
    backgroundColor: state.moving ? "red" : "transparent",
    transform: state.delta
      ? `translate3d(${state.delta.x}px, ${state.delta.y}px, 0)`
      : undefined,
  };

  return (
    <div className="movable" ref={ref} style={style}>
      MOVE ME
    </div>
  );
};

export default Movable;
