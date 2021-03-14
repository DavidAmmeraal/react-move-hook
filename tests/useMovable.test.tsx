import React from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { Basic, WithState } from "../stories/useMovable.stories";
import { TestAdapter } from "./TestAdapter";
import * as fixtures from "./fixtures";
import { Position2D } from "../packages/react-move-hook/src/util";
import { MoveEvent, UseMovableProps } from "../packages/react-move-hook/src";

const mockBoundingRects = () => {
  screen.getByTestId("container").getBoundingClientRect = jest.fn(
    () => fixtures.containerRect
  );
  screen.getByTestId("movable").getBoundingClientRect = jest.fn(
    () => fixtures.movableRect
  );
};

const BasicTest = (props: UseMovableProps = {}) => (
  <Basic {...Basic.args} {...props} />
);

type Setup<T = UseMovableProps> = (args?: {
  toRender?: React.FC<T>;
  useAdapter?: boolean;
}) => (
  props?: T
) => {
  adapter: TestAdapter;
  unmount: () => void;
};

const doMoves = (positions: Position2D[]) => (adapter: TestAdapter) => {
  positions.forEach((pos) => adapter.actions?.moveTo(pos));
};

const setup: Setup = (setupArgs = {}) => (renderProps) => {
  const { toRender: ToRender = BasicTest, useAdapter = true } = setupArgs;
  const adapter = new TestAdapter();

  const props = useAdapter
    ? {
        connect: adapter.connect,
        ...renderProps,
      }
    : renderProps;

  const { unmount } = render(<ToRender {...props} />);
  mockBoundingRects();

  return {
    unmount,
    adapter,
  };
};

describe("with no properties given", () => {
  it("renders", () => {
    setup({ useAdapter: false })();
    expect(screen.getByTestId("movable")).toBeInTheDocument();
  });
});

describe("when connector given", () => {
  it("will connect to referenced element", () => {
    const { adapter } = setup()();
    expect(adapter.element).toBe(screen.getByTestId("movable"));
  });
  it("will clean up when referenced elements dismounts", async () => {
    const { adapter, unmount } = setup()();
    unmount();
    expect(adapter.cleanup).toHaveBeenCalledTimes(1);
  });
});

describe("when starts moving", () => {
  it("onMoveStart is called", () => {
    const onMoveStart = jest.fn();
    const { adapter } = setup()({ onMoveStart });
    adapter.actions?.moveStart({
      x: 55,
      y: 55,
    });
    expect(onMoveStart).toHaveBeenCalledTimes(1);
    expect(onMoveStart).toHaveBeenLastCalledWith(
      expect.objectContaining({
        moving: true,
        startedMoving: true,
      })
    );
  });

  it("onChange is called", () => {
    const onChange = jest.fn();
    const { adapter } = setup()({ onChange });
    adapter.actions?.moveStart({
      x: 55,
      y: 55,
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        moving: true,
        startedMoving: true,
      })
    );
  });
});

describe("when moving", () => {
  it("calls onMove and onChange", () => {
    const onMove = jest.fn();
    const onChange = jest.fn();
    const { adapter } = setup()({ onMove, onChange });
    const origin = { x: 55, y: 55 };
    const position = { x: 56, y: 56 };
    adapter.actions?.moveStart(origin);
    adapter.actions?.moveTo(position);
    const eventMatcher = expect.objectContaining({
      startedMoving: false,
      moving: true,
      delta: { x: 1, y: 1 },
      origin,
      position,
    });
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onMove).toHaveBeenLastCalledWith(eventMatcher);
    expect(onChange).toHaveBeenCalledWith(eventMatcher);
  });

  it("calls onMove and onChange when moving further with accumulative delta", () => {
    const onMove = jest.fn();
    const onChange = jest.fn();
    const { adapter } = setup()({ onMove, onChange });
    const origin = { x: 55, y: 55 };
    const position = { x: 57, y: 57 };
    const eventMatcher = expect.objectContaining({
      startedMoving: false,
      moving: true,
      delta: { x: 2, y: 2 },
      origin,
      position,
    });

    adapter.actions?.moveStart(origin);
    doMoves([{ x: 56, y: 56 }, position])(adapter);

    expect(onMove).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onMove).toHaveBeenLastCalledWith(eventMatcher);
    expect(onChange).toHaveBeenLastCalledWith(eventMatcher);
  });
});

test("when moving incrementally, calls onMove and onChange with", () => {
  const onMove = jest.fn();
  const onChange = jest.fn();
  const { adapter } = setup()({ onMove, onChange });
  const origin = { x: 55, y: 55 };
  const move = { x: 1, y: 1 };
  adapter.actions?.moveStart(origin);
  adapter.actions?.move(move);
  adapter.actions?.move(move);
  const eventMatcher = expect.objectContaining({
    startedMoving: false,
    moving: true,
    delta: { x: 2, y: 2 },
    origin,
    position: { x: 57, y: 57 },
  });
  expect(onMove).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenCalledTimes(3);
  expect(onMove).toHaveBeenLastCalledWith(eventMatcher);
  expect(onChange).toHaveBeenCalledWith(eventMatcher);
});

test("when moving incrementally, calls onMove and onChange when moving further with accumulated delta", () => {
  const onMove = jest.fn();
  const onChange = jest.fn();
  const { adapter } = setup()({ onMove, onChange });
  const origin = { x: 55, y: 55 };
  const position = { x: 57, y: 57 };
  const eventMatcher = expect.objectContaining({
    startedMoving: false,
    moving: true,
    delta: { x: 2, y: 2 },
    origin,
    position,
  });

  adapter.actions?.moveStart(origin);
  doMoves([{ x: 56, y: 56 }, position])(adapter);

  expect(onMove).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenCalledTimes(3);
  expect(onMove).toHaveBeenLastCalledWith(eventMatcher);
  expect(onChange).toHaveBeenLastCalledWith(eventMatcher);
});

describe("when stops moving", () => {
  it("calls onMoveEnd and onChange", () => {
    const onMoveEnd = jest.fn();
    const onChange = jest.fn();
    const { adapter } = setup()({ onMoveEnd, onChange });

    const origin = { x: 55, y: 55 };
    adapter.actions?.moveStart(origin);
    const position = { x: 57, y: 57 };
    doMoves([{ x: 56, y: 56 }, position])(adapter);
    adapter.actions?.moveEnd();

    const eventMatcher = expect.objectContaining({
      startedMoving: false,
      moving: false,
      stoppedMoving: true,
      delta: { x: 2, y: 2 },
      origin,
      position,
    });

    expect(onChange).toHaveBeenCalledTimes(4);
    expect(onMoveEnd).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(eventMatcher);
    expect(onMoveEnd).toHaveBeenLastCalledWith(eventMatcher);
  });
});

describe("when unbounded", () => {
  it("can move freely in any direction", () => {
    const moves: MoveEvent[] = [];
    const onMove = (e: MoveEvent) => moves.push(e);

    const { adapter } = setup()({ onMove });
    adapter.actions?.moveStart(fixtures.unbounded.origin);
    doMoves([...fixtures.unbounded.moves])(adapter);
    expect(moves).toEqual(fixtures.unbounded.results);
  });
});

describe("when bounded", () => {
  it("by parent, will return events with data that stays within bounds of parent", () => {
    const moves: MoveEvent[] = [];
    const onMove = (e: MoveEvent) => moves.push(e);

    const { adapter } = setup()({ bounds: "parent", onMove });
    adapter.actions?.moveStart(fixtures.bounded.origin);
    doMoves([...fixtures.bounded.moves])(adapter);
    expect(moves).toEqual(fixtures.bounded.results);
  });
  it("by bounding rect, will return events with data that stays within bounds of parent", () => {
    const moves: MoveEvent[] = [];
    const onMove = (e: MoveEvent) => moves.push(e);

    const { adapter } = setup()({ bounds: fixtures.containerRect, onMove });
    adapter.actions?.moveStart(fixtures.bounded.origin);
    doMoves([...fixtures.bounded.moves])(adapter);
    expect(moves).toEqual(fixtures.bounded.results);
  });

  it("by function returning bounding rect, will return events with data that stays within bounds of parent", () => {
    const moves: MoveEvent[] = [];
    const onMove = (e: MoveEvent) => moves.push(e);

    const { adapter } = setup()({
      bounds: () => fixtures.containerRect,
      onMove,
    });
    adapter.actions?.moveStart(fixtures.bounded.origin);
    doMoves([...fixtures.bounded.moves])(adapter);
    expect(moves).toEqual(fixtures.bounded.results);
  });

  it("by a React.RefObject<HTMLElement>, will return events with data that stays within bounds of parent", () => {
    const moves: MoveEvent[] = [];
    const onMove = (e: MoveEvent) => moves.push(e);

    const { adapter } = setup()({
      bounds: {
        current: {
          getBoundingClientRect: () => fixtures.containerRect,
        } as HTMLElement,
      },
      onMove,
    });
    adapter.actions?.moveStart(fixtures.bounded.origin);
    doMoves([...fixtures.bounded.moves])(adapter);
    expect(moves).toEqual(fixtures.bounded.results);
  });
});

describe("when restricted to x-axis", () => {
  it("when moving, restricts delta and position changes to the horizontal axis", () => {
    const onMove = jest.fn();
    const { adapter } = setup()({
      axis: "x",
      onMove,
    });

    adapter.actions?.moveStart({ x: 55, y: 55 });
    adapter.actions?.moveTo({ x: 100, y: 100 });

    expect(onMove).toHaveBeenLastCalledWith(
      expect.objectContaining({
        delta: {
          x: 45,
          y: 0,
        },
      })
    );
  });

  it("when moving incrementally, restricts delta and position changes to the horizontal axis", () => {
    const onMove = jest.fn();
    const { adapter } = setup()({
      axis: "x",
      onMove,
    });

    adapter.actions?.moveStart({ x: 55, y: 55 });
    adapter.actions?.move({ x: 10, y: 100 });

    expect(onMove).toHaveBeenLastCalledWith(
      expect.objectContaining({
        delta: {
          x: 10,
          y: 0,
        },
      })
    );
  });
});

describe("when restricted to y-axis", () => {
  it("when moving, restricts delta and position changes to the vertical axis", () => {
    const onMove = jest.fn();
    const { adapter } = setup()({
      axis: "y",
      onMove,
    });

    adapter.actions?.moveStart({ x: 55, y: 55 });
    adapter.actions?.moveTo({ x: 100, y: 100 });

    expect(onMove).toHaveBeenLastCalledWith(
      expect.objectContaining({
        delta: {
          x: 0,
          y: 45,
        },
      })
    );
  });

  it("when moving incrementally, restricts delta and position changes to the vertical axis", () => {
    const onMove = jest.fn();
    const { adapter } = setup()({
      axis: "y",
      onMove,
    });

    adapter.actions?.moveStart({ x: 55, y: 55 });
    adapter.actions?.move({ x: 10, y: 100 });

    expect(onMove).toHaveBeenLastCalledWith(
      expect.objectContaining({
        delta: {
          x: 0,
          y: 100,
        },
      })
    );
  });
});

describe("when given a sizeRef", () => {
  it("will connect to the handle", () => {
    const { adapter } = setup()({ sizeRef: { current: null } });
    expect(adapter.element).toBe(screen.getByTestId("handle"));
  });

  it("will use the element as base for making bound overflows calculations", () => {
    const moves: MoveEvent[] = [];
    const onMove = (e: MoveEvent) => moves.push(e);

    const { adapter } = setup()({
      sizeRef: { current: null },
      bounds: "parent",
      onMove,
    });
    adapter.actions?.moveStart(fixtures.bounded.origin);
    doMoves([...fixtures.bounded.moves])(adapter);
    expect(moves).toEqual(fixtures.bounded.results);
  });
});

describe("when using default connect prop", () => {
  it("moving starts on mouse down", () => {
    const onMoveStart = jest.fn();
    setup({ useAdapter: false })({
      onMoveStart,
    });

    fireEvent.mouseDown(screen.getByTestId("movable"), {
      clientX: 55,
      clientY: 55,
    });

    expect(onMoveStart).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: { x: 55, y: 55 },
      })
    );
  });

  it("moving happens while moving mouse when keeping mouse pressed", () => {
    const onMove = jest.fn();
    setup({ useAdapter: false })({
      onMove,
    });

    fireEvent.mouseDown(screen.getByTestId("movable"), {
      clientX: 55,
      clientY: 55,
    });

    fireEvent.mouseMove(screen.getByTestId("movable"), {
      clientX: 56,
      clientY: 56,
    });

    expect(onMove).toHaveBeenCalledWith(
      expect.objectContaining({
        delta: { x: 1, y: 1 },
      })
    );
  });

  it("move finishes when mouse up after keeping pressed", () => {
    const onMoveEnd = jest.fn();
    setup({ useAdapter: false })({
      onMoveEnd,
    });

    fireEvent.mouseDown(screen.getByTestId("movable"), {
      clientX: 55,
      clientY: 55,
    });

    fireEvent.mouseMove(global.window, {
      clientX: 56,
      clientY: 56,
    });

    fireEvent.mouseUp(global.window);

    expect(onMoveEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        delta: { x: 1, y: 1 },
      })
    );
  });

  it("moving starts on touch start", () => {
    const onMoveStart = jest.fn();
    setup({ useAdapter: false })({
      onMoveStart,
    });

    fireEvent.touchStart(screen.getByTestId("movable"), {
      targetTouches: [
        {
          clientX: 55,
          clientY: 55,
        },
      ],
    });

    expect(onMoveStart).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: { x: 55, y: 55 },
      })
    );
  });

  it("moving happens while moving touch", () => {
    const onMove = jest.fn();
    setup({ useAdapter: false })({
      onMove,
    });

    fireEvent.touchStart(screen.getByTestId("movable"), {
      targetTouches: [
        {
          clientX: 55,
          clientY: 55,
        },
      ],
    });

    fireEvent.touchMove(screen.getByTestId("movable"), {
      targetTouches: [
        {
          clientX: 56,
          clientY: 56,
        },
      ],
    });

    expect(onMove).toHaveBeenCalledWith(
      expect.objectContaining({
        delta: { x: 1, y: 1 },
      })
    );
  });

  it("moving finishes when releasing touch", () => {
    const onMoveEnd = jest.fn();
    setup({ useAdapter: false })({
      onMoveEnd,
    });

    fireEvent.touchStart(screen.getByTestId("movable"), {
      targetTouches: [
        {
          clientX: 55,
          clientY: 55,
        },
      ],
    });

    fireEvent.touchMove(screen.getByTestId("movable"), {
      targetTouches: [
        {
          clientX: 56,
          clientY: 56,
        },
      ],
    });

    fireEvent.touchEnd(screen.getByTestId("movable"));

    expect(onMoveEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        delta: { x: 1, y: 1 },
      })
    );
  });
});
