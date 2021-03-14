![npm](https://img.shields.io/npm/v/react-move-hook)
[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/tterb/atomic-design-ui/blob/master/LICENSEs)
[![Actions Status](https://github.com/DavidAmmeraal/react-move-hook/workflows/Build/badge.svg)](https://github.com/DavidAmmeraal/react-move-hook/actions)
[![codecov](https://codecov.io/gh/DavidAmmeraal/react-move-hook/branch/main/graph/badge.svg?token=TH02P0LR1Z)](https://codecov.io/gh/DavidAmmeraal/react-move-hook)

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
  <summary>A simple example (open in <a href="https://githubbox.com/DavidAmmeraal/react-move-hook/tree/main/examples/basic">codesandbox</a>)
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

### More examples

- [codesandbox](https://githubbox.com/DavidAmmeraal/react-move-hook/tree/main/examples/handle) Using a handle to move an element around. 
- [codesandbox](https://githubbox.com/DavidAmmeraal/react-move-hook/tree/main/examples/update-position) Using ```useState()``` to update positions. 
- [codesandbox](https://githubbox.com/DavidAmmeraal/react-move-hook/tree/main/examples/keyboard) Using the keyboard to move stuff around with a custom ```connect()``` option. 
- [codesandbox](https://githubbox.com/DavidAmmeraal/react-move-hook/tree/main/examples/multiple) Making multiple elements movable (try moving them around at the same time on your mobile device).
- [codesandbox](https://githubbox.com/DavidAmmeraal/react-move-hook/tree/main/examples/x-axis) Restricting movement through the ```bounds``` and ```axis``` options.


### Options

```typescript
interface UseMovableOptions {
  /**
   * The boundary in which the element can be moved.
   *
   * When not set, the element can be moved around freely.
   *
   * When set to ```"parent"```, will use parent element of referenced
   * element or the parent of the given sizeRef element.
   *
   * Can also be given a DOMRect, a function returning a DOMRect or a reference to
   * another HTMLElement.
   */
  bounds?:
    | "parent"
    | (() => DOMRect | undefined)
    | DOMRect
    | React.RefObject<HTMLElement | undefined>;

  /**
   * Restricts the axis on which moves can be made.
   * ```"x"``` is the horizontal axis, ```"y"``` is the vertical axis.
   */
  axis?: "x" | "y";

  /**
   * The element that defines the size of "what" is being moved around.
   *
   * This is used when you are moving an element, but are initiating movements
   * through another element (usually a handle of some sorts within the element
   * being moved around.
   */
  sizeRef?: React.RefObject<HTMLElement>;

  /**
   * Called when moving starts.
   */
  onMove?: (data: MoveEvent) => void;

  /**
   * Called when the elements starts moving
   */
  onMoveStart?: (data: MoveEvent) => void;

  /**
   * Called when element stops moving, make sure this function is memoized
   */
  onMoveEnd?: (data: MoveEvent) => void;

  /**
   * Function that is called on move-start, move and move-end
   */
  onChange?: (date: MoveEvent) => void;

  /**
   * A function connects the hook to the referenced HTML element. See
   * MovableConnect for more information.
   */
  connect?: MovableConnect;

  /**
   * Measuring method, defaults to getBoundingClientRect
   */
  measure?: (el: HTMLElement) => BoundingRect;
}
```

## Using events

You can use the ```onMoveStart```, ```onMove```, ```onMoveEnd```, ```onChange``` options
to listen for position changes of the element being dragged. These functions will all take a 
MoveEvent object whenever they're called.

**It's important to note that you have to use ```useCallback``` to create a memoized callback function**.

```typescript
const handleMove = useCallback((e) => {
  console.log(e);
}, []);

const ref = useMovable({ onMove: handleMove });
```

A MoveEvent has the following shape 

```typescript
type MoveEvent = {
  // The position from which this move was initiated.
  origin: { x: number, y: number },
  // The current position (this will not be bounded)
  position: { x: number, y: number },
  // The distance from the origin
  delta: { x: number, y: number },
  // The original [DOMRect](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect) of the element being moved
  originRect: DOMRect,
  // True if moving
  moving: boolean,
  // True if started moving
  startedMoving: boolean,
  // True if stopped moving
  stoppedMoving: boolean, 
}
```

## Restricting movement

### Bounds 

By default, an element passed into the ```useMovable``` callback can move unrestricted. If you want to create bounds within which an element can be moved you can use the ```bounds``` option. The bounds option can take a value of the following type:

```typescript
  bounds?:
    | "parent"
    | (() => DOMRect | undefined)
    | DOMRect
    | React.RefObject<HTMLElement | undefined>;
```

If bounds is set to "parent" it will set the bounds to the DOMRect of the parent element of the element being moved. If the ```sizeRef``` option is also used, it will use the parent of the ```sizeRef``` element.

You can also pass a DOMRect directly, or a function returning a DOMRect.

If you pass a React.RefObject, it will use the DOMRect of that element to set the bounds. 

The event handlers will now only receive events with a ```delta``` that is within the set bounds.

### Axis restriction

If you want to restrict movement on an axis (for example, only horizontal movement). You can use the "axis" option. The option can be set to either "x" or "y". If set to "x", you will receive events only containing a delta on the "x" values.

## Customising behaviour

For a working example check [codesandbox](https://githubbox.com/DavidAmmeraal/react-move-hook/tree/main/examples/keyboard).

By default useMovable will listen to touch and mouse events.

This functionality can easily be extended or overwritten using a custom ```connect``` option. 

```useMovable``` takes a ```connect``` option that is a function of the following signature:

```typescript
(args: {
  actions: { 
    // Called when the move starts, required before calling any of the other actions.
    moveStart: ({ x: number, y: number }) => void,

    // Called to move to a new position relative from the current position, 
    // so move ({ x: 10, y: 0 }) will move 10px to the right of the last position.
    move: ({ x: number, y: number }) => void,

    // Used to move to an absolute new position.
    moveTo: ({ x: number, y: number }) => void,

    // Called when the move ended. 
    moveEnd: () => void
  },
  // The element passed into the useMovable callback
  el: HTMLElement
}) => () => void;
```

This is a function that will return another function to clean up any listeners or other side effects, a bit
like the [useEffect](https://reactjs.org/docs/hooks-effect.html) hook.

The default ```connect``` function is a composition of the ```withMouse``` and ```withTouch``` connect functions 
defined in [src/connect.ts](packages/react-move-hook/src/connect.ts)

If you want to create your own connect function you can use the ```createConnect()```. For example, to listen
to keyboard events you could use the following code.

```typescript
import { createConnect } from "../packages/react-move-hook/src/connect";

export const withKeyboard = createConnect(({ actions, el }) => {
  const moveListener = (e) => {
    if (document.activeElement !== el) return;
    e.preventDefault();
    actions.moveStart();
    switch (e.key) {
      case "ArrowUp":
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

  // This will clean up the listeners when element is dismounted or
  // another element is passed into the useMovable callback.
  return () => {
    window.removeEventListener("keydown", moveListener);
  };
});
```

You can then use this function to compose new connect function, for example if you want to support
both mouse and keyboard input, you could make a new composition like this:

```typescript
const withMouseAndKeyboard = withMouse(withKeyboard());
```

or using a compose function ([like the one in ramda](https://ramdajs.com/docs/#compose)):

```typescript
import { compose } from "ramda";

const withMouseAndKeyboard = compose(withMouse, withKeyboard)();

```

This function can now be passed into the ```connect``` option like: 

```typescript
const ref = useMovable({ connect: withMouseAndKeyboard });
```