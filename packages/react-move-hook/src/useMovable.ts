import React, { useRef, useCallback, useEffect, useState } from "react";
import { MovableConnector, withMouse, withTouch } from "./connector";
import {
  BoundingRect,
  Position2D,
  Rect,
  emptyBoundingRect,
  toBoundingRect,
  isBoundingRect,
  emptyPosition2D,
} from "./util";

interface MoveState {
  origin?: Position2D;
  position?: Position2D;
  delta: Position2D;
  originRect?: BoundingRect;
  rect?: BoundingRect;
  startedMoving: boolean;
  stoppedMoving: boolean;
  moving: boolean;
}

const initialState: MoveState = Object.freeze({
  origin: undefined,
  position: undefined,
  delta: emptyPosition2D(),
  originRect: undefined,
  moving: false,
  startedMoving: false,
  stoppedMoving: false,
});

export interface UseMovableProps {
  /**
   * Boundary in which the element can be dragged
   */
  bounds?:
    | "parent"
    | (() => BoundingRect | undefined)
    | BoundingRect
    | React.RefObject<HTMLElement | undefined>;
  /**
   * Axis
   */
  axis?: "x" | "y";
  /**
   * The element which represents the size of the element being dragged around.
   */
  sizeRef?: React.RefObject<HTMLElement>;
  /**
   * Called when the element is being moved
   */
  onMove?: (data: MoveState) => void;
  /**
   * Called when the elements starts moving
   */
  onMoveStart?: (data: MoveState) => void;
  /**
   * Called when element stops moving
   */
  onMoveEnd?: (data: MoveState) => void;
  /**
   * Connector that connects hook to DOM or something else.
   */
  onChange?: (date: MoveState) => void;
  connector?: MovableConnector;
  /**
   * Measuring method, defaults to get [getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
   */
  measure?: (el: HTMLElement) => BoundingRect;
}

/**
 * Calculates the current delta relative to the origin.
 * @param origin The original event from which we started moving.
 * @param e The current event which we'll compare to the origin.
 * @param bounds The bounds in which the element is allowed to move.
 * @param size The size of the element. We need this so that the element won't overflow it's parent.
 */
const calcDelta = (
  origin: Position2D,
  position: Position2D,
  size?: Rect,
  bounds?: Rect
): Position2D => {
  // If no size is given, use a non-sized rect instead.
  const cleanSize = size || emptyBoundingRect();

  /**
   * These min/max fields define the minimum and maximum values which we're allowed to move the element in.
   * It uses the size of the element to make sure the element doesn't overflow the parent.
   */
  const maxX = bounds
    ? bounds.left +
      bounds.width -
      (cleanSize.width - (origin.x - cleanSize.left))
    : Infinity;

  const maxY = bounds
    ? bounds.top +
      bounds.height -
      (cleanSize.height - (origin.y - cleanSize.top))
    : Infinity;

  const minX = bounds ? bounds.left + (origin.x - cleanSize.left) : -Infinity;

  const minY = bounds ? bounds.top + (origin.y - cleanSize.top) : -Infinity;

  const x = Math.max(Math.min(position.x, maxX), minX);
  const y = Math.max(Math.min(position.y, maxY), minY);

  // Subtract it from the origin so we know the delta.
  const xDiff = x - origin.x;
  const yDiff = y - origin.y;
  return { x: xDiff, y: yDiff };
};

/**
 * Default measuring method, used to measure the size of the thing we're moving.
 * @param e The element we're trying to measure
 */
const defaultMeasure = (e: HTMLElement) => {
  return e.getBoundingClientRect();
};

/**
 * Supports mouse/touch events out of the box
 */
const defaultConnector = withMouse(withTouch());

type StateMutator = (state: MoveState) => void;

/**
 * React Hook that allows an element to be moved around. Returns a callback.
 *
 * Takes onMove, onMoveStart, onMove callback properties.
 *
 * @param props Props of the hook.
 */
export const useMovable = (
  props: UseMovableProps = {}
): ((node: HTMLElement | null) => void) => {
  const {
    bounds: boundsProp,
    connector = defaultConnector,
    measure: measureProp = defaultMeasure,
    onChange,
    onMove,
    onMoveStart,
    onMoveEnd,
    sizeRef,
    axis,
  } = props;

  /**
   * Reference to the element we're moving.
   */
  const ref = useRef<HTMLElement>();

  /**
   * Internal state stored in a reference to prevent unneccesary rerenders.
   */
  const state = useRef(initialState);
  const getState = useCallback(() => {
    return state.current;
  }, []);

  const setState = useCallback((mutator: StateMutator) => {
    const newState = { ...state.current };
    mutator(newState);
    state.current = Object.freeze(newState);
    if (!ref.current) return;
  }, []);

  const measure = useCallback(
    (el: HTMLElement) => {
      return toBoundingRect(measureProp(el));
    },
    [measureProp]
  );

  /**
   * Either returns a BoundingRect in which the element is allowed to be moved. Or returns undefined,
   * meaning the object can be moved unbounded. If no bounds was given in UseMovableProps, it uses
   * the parent of the element as its bounds.
   */
  const getBounds = useCallback((): BoundingRect | undefined => {
    if (boundsProp) {
      if (boundsProp === "parent") {
        if (ref?.current?.parentElement) {
          return measure(ref?.current?.parentElement);
        }
        if (sizeRef?.current?.parentElement) {
          return measure(sizeRef?.current.parentElement);
        }
        return;
      }
      if (isBoundingRect(boundsProp)) return boundsProp;
      if (typeof boundsProp === "function") {
        const bounds = boundsProp();
        return isBoundingRect(bounds) ? bounds : undefined;
      }
      if (boundsProp?.current) {
        return boundsProp.current.getBoundingClientRect();
      }
    }
    return undefined;
  }, [boundsProp, sizeRef, measure]);

  // This starts a movement. Also sets the origin and original size of the movable element.
  const moveStart = useCallback(
    (ev: Position2D = emptyPosition2D()) => {
      const toMeasure = ref.current || sizeRef?.current;
      if (!toMeasure) return;
      state.current = Object.freeze({ ...initialState });
      setState((state) => {
        const measured = measure(toMeasure);
        state.startedMoving = true;
        state.moving = true;
        state.origin = ev;
        state.position = ev;
        state.originRect = measured;
      });

      if (onMoveStart) onMoveStart(getState());
      if (onChange) onChange(getState());
    },
    [onMoveStart, sizeRef]
  );

  // Called when the element is moving.
  const moveTo = useCallback(
    (position: Position2D) => {
      const state = getState();
      if (!state.origin || !state.moving) return;
      const cleanPosition = {
        x: !axis || axis === "x" ? position.x : 0,
        y: !axis || axis === "y" ? position.y : 0,
      };

      setState((state) => {
        if (!state.origin) return;
        state.position = cleanPosition;
        state.moving = true;
        const newDelta = calcDelta(
          state.origin,
          state.position,
          state.originRect,
          getBounds()
        );
        state.delta = newDelta;
        state.startedMoving = false;
      });

      if (onMove) onMove(getState());
      if (onChange) onChange(getState());
    },
    [getBounds, onMove, axis]
  );

  const move = useCallback((movement: Partial<Position2D>) => {
    const base = getState().position;
    if (!base) return;
    const position = {
      x: axis === "x" || !axis ? base.x + (movement.x || 0) : base.x,
      y: axis === "y" || !axis ? base.y + (movement.y || 0) : base.y,
    };

    setState((state) => {
      if (!state.origin || !state.position || !state.moving) return;
      state.delta = calcDelta(
        state.origin,
        state.position,
        state.originRect,
        getBounds()
      );
      state.position = position;
      state.startedMoving = false;
    });

    if (onMove) onMove(getState());
    if (onChange) onChange(getState());
  }, []);

  // Called when the element finished moving.
  const moveEnd = useCallback(() => {
    const { origin, position, originRect } = getState();
    if (!origin || !position || !originRect) return;
    setState((state) => {
      state.stoppedMoving = true;
      state.moving = false;
    });

    if (onMoveEnd) onMoveEnd(getState());
    if (onChange) onChange(getState());
  }, [getBounds, onMoveEnd]);

  // Attaches mousedown listen to the given element. If there's still an old one, remove the listeners on the old one first.
  const callback = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      if (ref.current) connector.disconnect(ref.current);
      ref.current = node;
      connector.connect(node, {
        move,
        moveTo,
        moveStart,
        moveEnd,
      });
    },
    [connector, move, moveTo, moveEnd, moveStart]
  );

  useEffect(() => {
    return () => {
      if (ref.current) connector.disconnect(ref.current);
    };
  }, []);

  return callback;
};
