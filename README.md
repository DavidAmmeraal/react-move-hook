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

A simple example (open in [codesandbox](https://githubbox.com/DavidAmmeraal/react-move-hook/tree/develop/examples/basic))

```jsx
import React, { useState, useCallback, useEffect } from "react";
import { useMovable } from "react-move-hook";

import "./App.css";

function App() {
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
    backgroundColor: state.moving ? "red" : "transparent",
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
```

