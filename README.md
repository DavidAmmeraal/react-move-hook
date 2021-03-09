# react-move-hook

A unopinionated customisable react hook without dependencies (except for React) to move stuff around. This library keeps track of an element being moved around.

## Install

You can install react-move-hook with npm

```bash
npm install --save react-move-hook
```

or  yarn
```bash
yarn add react-move-hook
```

## Usage

A simple example (open in [codesandbox](https://githubbox.com/Noterik/_user_/_project_/tree/_branch_/examples/basic))

```jsx
import React, { useState } from "react";
import { useMovable } from "react-move-hook";

const containerStyle = {
  position: "absolute",
  margin: "10px",
  width: "300px",
  height: "300px",
  backgroundColor: "lightgray",
};

const movableStyle = {
  position: "absolute",
  padding: "5px",
  top: 0,
  left: 0,
  border: "1px solid black",
};

function App() {
  const [move, setMove] = useState();

  const ref = useMovable({ onMove: setMove });

  return (
    <div style={containerStyle}>
      <div
        ref={ref}
        style={{
          ...movableStyle,
          transform: `translate3d(${move?.accDelta.x || 0}px, ${move?.accDelta.y || 0}px, 0)`,
        }}
      >
        MOVE ME
      </div>
    </div>
  );
}

export default App;
```

