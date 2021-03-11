import React, { CSSProperties } from "react";
import {
  Position2D,
  emptyPosition2D,
} from "../../packages/react-move-hook/src/util";

import "./Movable.css";

interface MovableProps extends React.HTMLAttributes<HTMLDivElement> {
  delta?: Position2D;
  position?: Position2D;
}

export const Movable = React.forwardRef<HTMLDivElement, MovableProps>(
  (
    { delta, position = emptyPosition2D(), style, className, ...props },
    ref
  ) => {
    const styleProp: CSSProperties = {
      ...style,
      left: position.x,
      top: position.y,
      ...(delta
        ? { transform: `translate3d(${delta.x}px, ${delta.y}px, 0)` }
        : {}),
    };
    return (
      <div
        {...props}
        className={`movable${className ? ` ${className}` : ``}`}
        style={styleProp}
        ref={ref}
      />
    );
  }
);
