import React, { useState } from "react";
import { useMovable } from "react-move-hook";

function App() {
  const [move, setMove] = useState();

  const ref = useMovable({ onMove: setMove });

  return (
    <div
      style={{
        position: "absolute",
        margin: "10px",
        width: "300px",
        height: "300px",
        backgroundColor: "lightgray",
      }}
    >
      <div
        ref={ref}
        style={{
          position: "absolute",
          padding: "5px",
          transform: `translate3d(${move?.accDelta.x || 0}px, ${
            move?.accDelta.y || 0
          }px, 0)`,
          top: 0,
          left: 0,
          border: "1px solid black",
        }}
      >
        MOVE ME
      </div>
    </div>
  );
}

export default App;
