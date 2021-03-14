import React, { useCallback, useState } from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { Story } from "@storybook/react/types-6-0";
import { Position2D } from "../packages/react-move-hook/src/util";
import {
  useMovable,
  UseMovableOptions,
  withMouse,
  withTouch,
} from "../packages/react-move-hook/src";
import { Movable, MovableProps } from "./components/Movable";
import { compose } from "ramda";

import "./useMovable.stories.css";

export default {
  title: "useMovable",
  component: useMovable,
};

type UseMovableStoryArgs = UseMovableOptions & {
  movable?: MovableProps & { moving: boolean };
  description?: JSX.Element;
};

const Template: Story<UseMovableStoryArgs> = (args) => {
  const { sizeRef, description } = args;

  // Making props undefined if args is empty to get test coverage over default UseMovableProps.
  const useMovableProps = Object.keys(args).length === 0 ? undefined : args;

  const ref = useMovable(useMovableProps);

  return (
    <div className="main">
      <div data-testid="container" className="container">
        <Movable
          ref={sizeRef ? (sizeRef as React.RefObject<HTMLDivElement>) : ref}
          {...args.movable}
          // These props are added for testing purposes
          data-testmoving={`${!!args.movable?.moving}`}
          data-testid="movable"
          tabIndex={0}
        >
          {sizeRef && <div data-testid="handle" className="handle" ref={ref} />}
          Move me
        </Movable>
      </div>
      {description}
    </div>
  );
};

const WithStateTemplate: Story<UseMovableStoryArgs> = (args) => {
  const [state, setState] = useState({
    moving: false,
    delta: undefined as Position2D | undefined,
    position: { x: 0, y: 0 } as Position2D,
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

  return <Template {...args} onChange={handleChange} movable={state} />;
};

export const Basic = Template.bind({});
Basic.args = {};

export const WithState = WithStateTemplate.bind({});
WithState.args = {};

export const BoundedByParent = WithStateTemplate.bind({});
BoundedByParent.args = {
  bounds: "parent",
};

export const WithHandle = WithStateTemplate.bind({});
WithHandle.args = {
  sizeRef: { current: null },
  bounds: "parent",
};

const connect = compose(withMouse, withTouch)();

export const WithKeyboard = WithStateTemplate.bind({});
WithKeyboard.args = {
  connect,
  bounds: "parent",
};
