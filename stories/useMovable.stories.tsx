import React, {
  CSSProperties,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { Story, Meta } from "@storybook/react/types-6-0";

import {
  useMovable,
  UseMovableProps,
} from "../packages/react-move-hook/src/useMovable";
import {
  MovableConnector,
  withMouse,
} from "../packages/react-move-hook/src/connector";
import {
  emptyPosition2D,
  Position2D,
} from "../packages/react-move-hook/src/util";

import "./useMovable.stories.css";
import { Movable } from "./components/Movable";

export default {
  title: "Example/useMovable",
} as Meta;

const BasicTemplate = (props: UseMovableProps) => {
  const [state, setState] = useState({
    moving: false,
    delta: undefined as Position2D | undefined,
    position: undefined as Position2D | undefined,
  });

  return (
    <div className="container">
      <Movable />
    </div>
  );
};

/*
interface MovableProps extends React.HTMLAttributes<HTMLDivElement> {
  delta?: Position2D;
  position?: Position2D;
}

const StoryContext = React.createContext({
  boundsRef: undefined as React.RefObject<HTMLElement> | undefined,
});

const Movable = React.forwardRef<HTMLDivElement, MovableProps>(
  ({ delta, position = emptyPosition2D(), style, ...props }, ref) => {
    const styleProp: CSSProperties = {
      ...style,
      position: "absolute",
      left: position.x,
      top: position.y,
      padding: "2em",
      border: "3px solid black",
      boxSizing: "border-box",
      userSelect: "none",
      ...(delta
        ? { transform: `translate3d(${delta.x}px, ${delta.y}px, 0)` }
        : {}),
    };
    return <div {...props} style={styleProp} ref={ref} />;
  }
);

const MovableHandle = React.forwardRef<HTMLDivElement, MovableProps>(
  ({ delta, style, ...rest }, ref) => {
    const styleProp: CSSProperties = {
      ...style,
      position: "absolute",
      backgroundColor: "red",
      borderRadius: "50%",
      width: "1em",
      height: "1em",
      top: ".5em",
      left: ".5em",
    };
    return <div {...rest} style={styleProp} ref={ref} />;
  }
);

interface MovableStoryTemplateArgs extends UseMovableProps {
  withHandle?: boolean;
}

const Template: Story<MovableStoryTemplateArgs> = (args) => {
  const { withHandle, bounds } = args;
  const { boundsRef } = useContext(StoryContext);

  const sizeRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({
    moving: false,
    delta: undefined as Position2D | undefined,
    position: undefined as Position2D | undefined,
  });

  const handleMoveStart = useCallback(() => {
    setState((s) => ({ ...s, moving: true }));
  }, []);

  const handleEndMoveEnd = useCallback((e: MoveData) => {
    setState((s) => {
      const pos = s.position || emptyPosition2D();
      const newPosition = { x: pos.x + e.delta.x, y: pos.y + e.delta.y };
      return {
        ...s,
        moving: false,
        position: newPosition,
        delta: undefined,
      };
    });
  }, []);

  const handleMove = useCallback((e: MoveData) => {
    setState((s) => ({ ...s, delta: e.delta }));
  }, []);

  const ref = useMovable({
    ...args,
    bounds: boundsRef || bounds,
    onMoveStart: handleMoveStart,
    onMove: handleMove,
    sizeRef,
    onMoveEnd: handleEndMoveEnd,
  });

  return (
    <div
      data-testid="parent"
      style={{
        position: "relative",
        marginTop: 10,
        marginLeft: 10,
        width: 300,
        height: 300,
        backgroundColor: "lightgrey",
      }}
    >
      <Movable
        ref={withHandle ? sizeRef : ref}
        delta={state.delta}
        position={state.position}
        tabIndex={0}
        data-testid="movable"
        data-moving={state.moving}
      >
        {withHandle && <MovableHandle ref={ref} data-testid="handle" />}
        Drag me
      </Movable>
    </div>
  );
};

export const Default = Template.bind({});
export const Unbounded = Template.bind({});
Unbounded.args = {
  unbounded: true,
};
export const Bounded = Template.bind({});
Bounded.decorators = [
  (RenderedStory) => {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <StoryContext.Provider value={{ boundsRef: ref }}>
        <div
          ref={ref}
          style={{
            padding: "3em",
            display: "inline-block",
            backgroundColor: "darkgrey",
          }}
        >
          <RenderedStory />
        </div>
      </StoryContext.Provider>
    );
  },
];

export const WithHandle = Template.bind({});
WithHandle.args = {
  withHandle: true,
};

const withKeyboard = (connector?: MovableConnector): MovableConnector => {
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

export const CustomConnector = Template.bind({});
CustomConnector.args = {
  connector: withKeyboard(),
};

export const ComposedConnector = Template.bind({});
ComposedConnector.args = {
  connector: withKeyboard(withMouse()),
};
*/
