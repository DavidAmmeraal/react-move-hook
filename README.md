# react-move-hook

A unopinionated customisable react hook without dependencies (except for React) to move stuff around. This library keeps track of an element being moved around.

## Description

This hook is created to track movements on an HTMLElement, it will **not** add any CSS properties on the element on its own accord. This is done on purpose, so a developer has control over what styles are actually being used (such as css transforms or top/left positioning).

By default this hook will bind listeners to mouse and touch events, but the hook can also be [configured](#connectors) to use different methods to move an element around (such as keyboard events). 

By default, ```useMovable``` will use [getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) to do measurements on HTML elements.

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

<details>
  <summary>A simple example (open in <a href="https://githubbox.com/DavidAmmeraal/react-move-hook/tree/develop/examples/basic">codesandbox</a>)
</summary>

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
</details>

## API 

### useMovable
```typescript
(options?: UseMovableOptions) => (node: HTMLElement | null) => void
```
Returns a callback that can be set on a ref property of a JSX element like this:

#### Usage
```js
const ref = useMovable();
```

with options:

```js
const ref = useMovable({ bounds: "parent", ...rest })
```

```jsx
<div ref={ref}></div>
```

#### Options (UseMovableOptions)

##### - bounds: 
```typescript
"parent" | (() => DOMRect) | DOMRect | React.RefObject<HTMLElement>
```

Sets the boundary within the referenced element can be moved. 

When not set, the element can be moved around freely.
  
When set to ```"parent"``` will use parent element of referenced element or the parent of the given sizeRef element. Can also be given a DOMRect, a function returning a DOMRect or a reference to another HTMLElement.

##### - axis:

```typescript
"x"|"y"
```

Restricts the axis on which moves can be made. ```x``` is the horizontal axis, ```y``` is vertical axis. 

##### - sizeRef:
```typescript
React.RefObject<HTMLElement>
```

The element that defines the size of \"what\" is being moved around. This is used when you are moving an element, but are initiating movements through another element (usually a handle of some sorts within the element being moved around, see [handle example](https://githubbox.com/DavidAmmeraal/react-move-hook/tree/develop/examples/handle))

##### - onMoveStart:
```(data: MoveEvent) => void;```

Called when moving starts. Takes a [MoveEvent](MoveEvent) object.

##### - onMove:
```(data: MoveEvent) => void;```

Called when moving. Takes a [MoveEvent](MoveEvent) object.

##### - onMoveEnd:
```(data: MoveEvent) => void;```

Called when moving ended. Takes a [MoveEvent](MoveEvent) object.

##### - onChange:
```(data: MoveEvent) => void;```

Called when any of the above callbacks are called. Takes [MoveEvent](MoveEvent) object.

##### - connect
```MovableConnect```

A function connects the hook to the referenced HTML element. See [MovableConnect](MovableConnect) for more information. 

##### - measure
``` (el: HTMLElement) => BoundingRect```;

A function that returns a DOMRect for a given element. Usually you shouldn't have to use this. 

### MoveEvent

An object containing the current state of the movement of the following shape:

```typescript
type MoveEvent {
   /**
   * The origin from where we started moving
   */
  origin?: Position2D;
  /**
   * The position of the current movement
   */
  position?: Position2D;
  /**
   * The (bounded) difference from the origin to the current position
   */
  delta: Position2D;
  /**
   * The size and the position of the element when we started moving
   */
  originRect?: BoundingRect;
  /**
   * Set to `true` when movement started
   */
  startedMoving: boolean;
  /**
   * Set to `true` when movement stopped
   */
  stoppedMoving: boolean;
  /**
   * Set to `true` when moving
   */
  moving: boolean;
}
```
