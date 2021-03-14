import React, { useRef, useCallback } from "react";
import { defaultConnect, MovableConnect } from "./connect";
import {
  BoundingRect,
  Position2D,
  Rect,
  emptyBoundingRect,
  toBoundingRect,
  isBoundingRect,
  emptyPosition2D,
} from "./util";

export interface MoveState {
  origin?: Position2D;
  position?: Position2D;
  delta: Position2D;
  originRect?: BoundingRect;
  startedMoving: boolean;
  stoppedMoving: boolean;
  moving: boolean;
}

export interface MoveEvent extends MoveState {
  origin: Position2D;
  position: Position2D;
  originRect: BoundingRect;
  rect: BoundingRect;
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
  onMove?: (data: MoveEvent) => void;
  /**
   * Called when the elements starts moving
   */
  onMoveStart?: (data: MoveEvent) => void;
  /**
   * Called when element stops moving
   */
  onMoveEnd?: (data: MoveEvent) => void;
  /**
   * Function that is called on move-start, move and move-end
   */
  onChange?: (date: MoveState) => void;
  /**
   * Connector that connects hook to DOM or something else.
   */
  connect?: MovableConnect;
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
  size: Rect,
  bounds?: Rect
): Position2D => {
  /**
   * These min/max fields define the minimum and maximum values which we're allowed to move the element in.
   * It uses the size of the element to make sure the element doesn't overflow the parent.
   */
  const maxX = bounds
    ? bounds.left + bounds.width - (size.width - (origin.x - size.left))
    : Infinity;

  const maxY = bounds
    ? bounds.top + bounds.height - (size.height - (origin.y - size.top))
    : Infinity;

  const minX = bounds ? bounds.left + (origin.x - size.left) : -Infinity;

  const minY = bounds ? bounds.top + (origin.y - size.top) : -Infinity;

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
const defaultMeasure = (e?: HTMLElement) => {
  return e?.getBoundingClientRect();
};

/**
 * Supports mouse/touch events out of the box
 */
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
    connect = defaultConnect,
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
  const disconnect = useRef<() => void>();
  const getState = useCallback(() => {
    return state.current;
  }, []);

  const setState = useCallback((mutator: StateMutator) => {
    const newState = { ...state.current };
    mutator(newState);
    state.current = Object.freeze(newState);
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
        if (sizeRef?.current?.parentElement) {
          return measure(sizeRef?.current.parentElement);
        }
        return measure(ref?.current?.parentElement as HTMLElement);
      }
      if (isBoundingRect(boundsProp)) return boundsProp;
      if (typeof boundsProp === "function") {
        const bounds = boundsProp();
        return isBoundingRect(bounds) ? bounds : undefined;
      }
      return boundsProp.current?.getBoundingClientRect();
    }
    return undefined;
  }, [boundsProp, sizeRef, measure]);

  // This starts a movement. Also sets the origin and original size of the movable element.
  const moveStart = useCallback(
    (ev: Position2D = emptyPosition2D()) => {
      const toMeasure = sizeRef?.current || ref.current;
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

      if (onMoveStart) onMoveStart(getState() as MoveEvent);
      if (onChange) onChange(getState());
    },
    [getState, measure, onChange, onMoveStart, setState, sizeRef]
  );

  // Called when the element is moving.
  const moveTo = useCallback(
    (position: Position2D) => {
      const state = getState();
      if (!state.origin || !state.moving) return;
      const cleanPosition = {
        x: !axis || axis === "x" ? position.x : state.position?.x || 0,
        y: !axis || axis === "y" ? position.y : state.position?.y || 0,
      };

      setState((state) => {
        if (!state.origin || !state.originRect) return;
        state.position = cleanPosition;
        const newDelta = calcDelta(
          state.origin,
          cleanPosition,
          state.originRect,
          getBounds()
        );
        state.delta = newDelta;
        state.startedMoving = false;
      });

      if (onMove) onMove(getState() as MoveEvent);
      if (onChange) onChange(getState());
    },
    [getState, axis, setState, onMove, onChange, getBounds]
  );

  const move = useCallback(
    (movement: Position2D) => {
      const base = getState().position as Position2D;
      const position = {
        x: axis === "x" || !axis ? base.x + movement.x : base.x,
        y: axis === "y" || !axis ? base.y + movement.y : base.y,
      };

      setState((state) => {
        if (!state.origin || !state.position || !state.moving) return;
        state.delta = calcDelta(
          state.origin,
          position,
          state.originRect || emptyBoundingRect(),
          getBounds()
        );
        state.position = position;
        state.startedMoving = false;
      });

      if (onMove) onMove(getState() as MoveEvent);
      if (onChange) onChange(getState());
    },
    [getState, axis, setState, onMove, onChange, getBounds]
  );

  // Called when the element finished moving.
  const moveEnd = useCallback(() => {
    const { moving, origin, position, originRect } = getState();
    if (!moving || !origin || !position || !originRect) return;
    setState((state) => {
      state.stoppedMoving = true;
      state.moving = false;
    });

    if (onMoveEnd) onMoveEnd(getState() as MoveEvent);
    if (onChange) onChange(getState());
  }, [getState, onChange, onMoveEnd, setState]);

  const doDisconnect = useCallback(() => {
    if (disconnect.current) disconnect.current();
    disconnect.current = undefined;
  }, []);

  // Attaches mousedown listen to the given element. If there's still an old one, remove the listeners on the old one first.
  const callback = useCallback(
    (node: HTMLElement | null) => {
      doDisconnect();
      if (!node) return;
      disconnect.current = connect({
        actions: { move, moveTo, moveStart, moveEnd },
        el: node,
      });
      ref.current = node;
      state.current = { ...initialState };
    },
    [doDisconnect, connect, move, moveTo, moveStart, moveEnd]
  );

  return callback;
};
