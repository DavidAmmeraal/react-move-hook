import { useRef, useCallback } from "react";
import { MovableActions } from "./connect";
import {
  BoundingRect,
  Position2D,
  Rect,
  emptyBoundingRect,
  emptyPosition2D,
} from "./util";

export interface MoveState {
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

export interface UseMovableActions {
  /**
   * Restricts the axis on which moves can be made.
   * ```"x"``` is the horizontal axis, ```"y"``` is the vertical axis.
   */
  axis?: "x" | "y";

  /**
   * Called when moving starts.
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
  onChange?: (date: MoveEvent) => void;

  /**
   * Measurement method
   */
  measure: () => BoundingRect | undefined;

  /**
   * Bouds measurement method
   */
  measureBounds: () => BoundingRect | undefined;
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

type StateMutator = (state: MoveState) => void;

/**
 * React Hook that allows an element to be moved around. Returns a callback.
 *
 * Takes onMove, onMoveStart, onMove callback properties.
 *
 * @param props Props of the hook.
 */
const useMovableActions = (options: UseMovableActions): MovableActions => {
  const {
    measure,
    measureBounds,
    onChange,
    onMove,
    onMoveStart,
    onMoveEnd,
    axis,
  } = options;

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
  }, []);

  // This starts a movement. Also sets the origin and original size of the movable element.
  const moveStart = useCallback(
    (ev: Position2D = emptyPosition2D()) => {
      state.current = Object.freeze({ ...initialState });
      setState((state) => {
        const measured = measure();
        state.startedMoving = true;
        state.moving = true;
        state.origin = ev;
        state.position = ev;
        state.originRect = measured;
      });

      if (onMoveStart) onMoveStart(getState() as MoveEvent);
      if (onChange) onChange(getState() as MoveEvent);
    },
    [getState, measure, onChange, onMoveStart, setState]
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
          measureBounds()
        );
        state.delta = newDelta;
        state.startedMoving = false;
      });

      if (onMove) onMove(getState() as MoveEvent);
      if (onChange) onChange(getState() as MoveEvent);
    },
    [getState, axis, setState, onMove, onChange, measureBounds]
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
          measureBounds()
        );
        state.position = position;
        state.startedMoving = false;
      });

      if (onMove) onMove(getState() as MoveEvent);
      if (onChange) onChange(getState() as MoveEvent);
    },
    [getState, axis, setState, onMove, onChange, measureBounds]
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
    if (onChange) onChange(getState() as MoveEvent);
  }, [getState, onChange, onMoveEnd, setState]);

  return {
    move,
    moveTo,
    moveStart,
    moveEnd,
  };
};

export default useMovableActions;
