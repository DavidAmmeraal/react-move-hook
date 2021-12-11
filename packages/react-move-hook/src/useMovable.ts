import { useCallback, useRef } from "react";
import { defaultConnect, MovableConnect } from "./connect";
import useMovableActions, { MoveEvent } from "./useMovableActions";
import { isBoundingRect } from "./util";

export interface UseMovableOptions {

	bounds?: | "parent"
    | (() => DOMRect | undefined)
    | DOMRect
		| React.RefObject<HTMLElement | undefined>;

	sizeRef?: (() => DOMRect | undefined)
		| DOMRect
		| React.RefObject<HTMLElement | undefined>; 
	
	connect?: MovableConnect,

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
}

export type UseMovableValue = (el: HTMLElement | null) => void;

export const useMovable = (options: UseMovableOptions = {}): UseMovableValue => {

	const { bounds, connect = defaultConnect, sizeRef } = options;

	const movingRef = useRef<HTMLElement>();
	const connection = useRef<(() => void)>();

	const measure = useCallback(() => {
		if (isBoundingRect(sizeRef)) return sizeRef;

		if (typeof sizeRef === "function") {
			const rect = sizeRef();
			return isBoundingRect(rect) ? rect : undefined;
		}

		if (typeof sizeRef === "object") {
			return sizeRef.current?.getBoundingClientRect();
		}
		if (movingRef) {
			return movingRef.current?.getBoundingClientRect();
		}
	}, []);

	const measureBounds = useCallback(() => {
		if (bounds === "parent" && movingRef.current) {
			return movingRef.current.parentElement?.getBoundingClientRect()
		}

		if (isBoundingRect(bounds)) return bounds;

		if (typeof bounds === "function") {
			const rect = bounds();
			return isBoundingRect(rect) ? rect : undefined;
		}

		if (typeof bounds === "object") {
			return bounds.current?.getBoundingClientRect();
		}

		return undefined;
	}, []);

	const actions = useMovableActions({
		...options,
		measure,
		measureBounds
	});

	const setRef = useCallback((el: HTMLElement | null) => {
		if (connection.current) {
			connection.current();
		}

		if (!el) return;
		connection.current = connect({ el, actions })
		movingRef.current = el;
	}, []);

	return setRef;
}