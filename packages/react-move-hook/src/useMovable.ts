import React, { useRef, useCallback, useEffect } from "react";
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

export interface UseMovableProps {
  /**
   * Boundary in which the element can be dragged
   */
  bounds?:
    | (() => BoundingRect | undefined)
    | BoundingRect
    | React.RefObject<HTMLElement | undefined>;
  /**
   * Setting this to false will make the movable object unbounded, it can then be moved outside of its parent or bounding element.
   */
  unbounded?: boolean;
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
  onMove?: (data: MoveData) => void;
  /**
   * Called when the elements starts moving
   */
  onMoveStart?: (data: MoveData) => void;
  /**
   * Called when element stops moving
   */
  onMoveEnd?: (data: MoveData) => void;
  /**
   * Connector that connects hook to DOM or something else.
   */
  connector?: MovableConnector;
  /**
   * Measuring method, defaults to get [getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
   */
  measure?: (el: HTMLElement) => BoundingRect;
}

export interface MoveData {
  /**
   * The original mouse position from which we started moving.
   */
  origin: Position2D;
  /**
   * The moved bounding rect.
   */
  rect: BoundingRect;
  /**
   * The difference in pixels from the origin of the current position.
   */
  delta: Position2D;
  /**
   * Delta across all moves
   */
  accDelta: Position2D;
  /**
   * The original bounding rect
   */
  originalRect: BoundingRect;
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
  bounds?: Rect,
  size?: Rect
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

type FromMoveArgs = {
  /**
   * The current event.
   */
  position: Position2D;
  /**
   * The original event from which we started dragging.
   */
  origin: Position2D;
  /**
   * The bounds in which we're allowed to move.
   */
  bounds?: BoundingRect;
  /**
   * The size of the element being moved.
   */
  elementSize: BoundingRect;
  lastMove?: MoveData;
};

const getMoveData = ({
  position,
  origin,
  bounds,
  elementSize,
  lastMove,
}: FromMoveArgs): MoveData => {
  const delta = calcDelta(origin, position, bounds, elementSize);

  const accDelta = {
    x: (lastMove?.accDelta.x || 0) + delta.x,
    y: (lastMove?.accDelta.y || 0) + delta.y,
  };

  const rect = {
    ...elementSize,
    left: elementSize.left + delta.x,
    top: elementSize.top + delta.y,
  };

  return {
    rect,
    delta,
    origin,
    originalRect: elementSize,
    accDelta,
  };
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

/**
 * React Hook that allows an element to be moved around. Returns a callback.
 *
 * Takes onMove, onMoveStart, onMove callback properties.
 *
 * @param props Props of the hook.
 */
export const useMovable = (props: UseMovableProps) => {
  /**
   * Reference to the element we're moving.
   */
  const ref = useRef<HTMLElement>();

  // The first event from which we started the current movement.
  const origin = useRef<Position2D>();
  /**
   * This is the original bounding rect of the element we started moving.
   * Used by calcDelta to to make sure we don't overflow the parent element.
   */
  const originalBoundingRect = useRef<BoundingRect>();
  const lastPosition = useRef<Position2D>();
  const lastMove = useRef<MoveData>();

  const {
    bounds: boundsProp,
    connector = defaultConnector,
    measure: measureProp = defaultMeasure,
    unbounded,
    onMove,
    onMoveStart,
    onMoveEnd,
    sizeRef,
    axis,
  } = props;

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
    if (boundsProp || !unbounded) {
      if (isBoundingRect(boundsProp)) return boundsProp;
      if (typeof boundsProp === "function") {
        const bounds = boundsProp();
        return isBoundingRect(bounds) ? bounds : undefined;
      }
      if (boundsProp?.current) {
        return boundsProp.current.getBoundingClientRect();
      }

      if (sizeRef?.current && sizeRef?.current.parentElement) {
        return measure(sizeRef?.current.parentElement);
      }

      if (ref?.current?.parentElement) {
        return measure(ref?.current?.parentElement);
      }
    }
    return undefined;
  }, [boundsProp, unbounded, sizeRef, measure]);

  // This starts a movement. Also sets the origin and original size of the movable element.
  const moveStart = useCallback(
    (ev: Position2D = emptyPosition2D()) => {
      origin.current = ev;
      lastPosition.current = ev;
      if (ref.current) {
        originalBoundingRect.current = measure(sizeRef?.current || ref.current);
        if (onMoveStart) {
          onMoveStart(
            getMoveData({
              origin: ev,
              position: ev,
              bounds: getBounds(),
              elementSize: originalBoundingRect.current,
              lastMove: lastMove.current,
            })
          );
        }
      }
    },
    [getBounds, onMoveStart, sizeRef]
  );

  // Called when the element is moving.
  const moveTo = useCallback(
    (position: Position2D) => {
      const cleanPosition = {
        x: !axis || axis === "x" ? position.x : 0,
        y: !axis || axis === "y" ? position.y : 0,
      };
      if (origin.current && originalBoundingRect.current) {
        const moveData = getMoveData({
          position: cleanPosition,
          origin: origin.current,
          bounds: getBounds(),
          elementSize: originalBoundingRect.current,
          lastMove: lastMove.current,
        });
        lastPosition.current = cleanPosition;
        if (onMove) onMove(moveData);
      }
    },
    [getBounds, onMove, axis]
  );

  const move = useCallback((movement: Partial<Position2D>) => {
    if (
      origin.current &&
      originalBoundingRect.current &&
      lastPosition.current
    ) {
      const base = lastPosition.current;
      const position = {
        x: axis === "x" || !axis ? base.x + (movement.x || 0) : base.x,
        y: axis === "y" || !axis ? base.y + (movement.y || 0) : base.y,
      };
      const moveData = getMoveData({
        position,
        origin: origin.current,
        bounds: getBounds(),
        elementSize: originalBoundingRect.current,
        lastMove: lastMove.current,
      });
      lastPosition.current = moveData.delta;
      if (onMove) onMove(moveData);
    }
  }, []);

  // Called when the element finished moving.
  const moveEnd = useCallback(() => {
    if (
      origin.current &&
      lastPosition.current &&
      originalBoundingRect.current
    ) {
      const data = getMoveData({
        position: lastPosition.current,
        origin: origin.current,
        bounds: getBounds(),
        elementSize: originalBoundingRect.current,
        lastMove: lastMove.current,
      });
      lastMove.current = data;
      if (onMoveEnd) {
        onMoveEnd(data);
      }
      lastPosition.current = undefined;
      origin.current = undefined;
    }
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
