import React from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import {
  CustomConnector,
  Default,
  Unbounded,
} from "../stories/useMovable.stories";
import { UseMovableProps } from "../useMovable";

const mockBoundingRects = () => {
  screen.getByTestId("parent").getBoundingClientRect = jest.fn(() => {
    return {
      x: 20,
      y: 20,
      top: 20,
      left: 20,
      width: 300,
      height: 300,
      bottom: 300,
      right: 300,
    } as DOMRect;
  });

  screen.getByTestId("movable").getBoundingClientRect = jest.fn(() => {
    return {
      x: 30,
      y: 30,
      top: 30,
      left: 30,
      width: 50,
      height: 50,
      bottom: 50,
      right: 50,
    } as DOMRect;
  });
};

describe('with property "connector" not set', () => {
  const setup = () => {
    render(<Default {...Default.args} />);
    mockBoundingRects();
  };

  it("moving is set to `true` when mouse down", () => {
    setup();
    fireEvent.mouseDown(screen.getByTestId("movable"));
    expect(screen.getByTestId("movable").dataset.moving).toBe("true");
  });

  it("moving is set to `true` when touch starts", () => {
    setup();
    fireEvent.touchStart(screen.getByTestId("movable"), {
      touches: [
        {
          clientX: 55,
          clientY: 55,
        },
      ],
    });
    expect(screen.getByTestId("movable").dataset.moving).toBe("true");
  });

  it("moving set to false when pressed quickly", () => {
    setup();
    fireEvent.mouseDown(screen.getByTestId("movable"));
    fireEvent.mouseUp(global.window);
    expect(screen.getByTestId("movable").dataset.moving).toBe("false");
  });

  it("translates the element when moving with mouse in bounds", () => {
    setup();
    fireEvent.mouseDown(screen.getByTestId("movable"), {
      clientX: 55,
      clientY: 55,
    });
    fireEvent.mouseMove(global.window, { clientX: 60, clientY: 60 });
    expect(screen.getByTestId("movable").style.transform).toEqual(
      "translate3d(5px, 5px, 0)"
    );
  });

  it("translates the element when moving with touch in bounds", () => {
    setup();
    fireEvent.touchStart(screen.getByTestId("movable"), {
      touches: [
        {
          clientX: 55,
          clientY: 55,
        },
      ],
    });
    fireEvent.touchMove(global.window, {
      touches: [{ clientX: 60, clientY: 60 }],
    });
    expect(screen.getByTestId("movable").style.transform).toEqual(
      "translate3d(5px, 5px, 0)"
    );
  });

  it("updates the position when moving with mouse ends", () => {
    setup();
    fireEvent.mouseDown(screen.getByTestId("movable"), {
      clientX: 55,
      clientY: 55,
    });
    fireEvent.mouseMove(global.window, { clientX: 60, clientY: 60 });
    fireEvent.mouseUp(global.window);
    expect(screen.getByTestId("movable").style).toMatchObject({
      top: "5px",
      left: "5px",
    });
  });

  it("updates the position when moving with touch ends", () => {
    setup();
    fireEvent.touchStart(screen.getByTestId("movable"), {
      touches: [
        {
          clientX: 55,
          clientY: 55,
        },
      ],
    });
    fireEvent.touchMove(global.window, {
      touches: [{ clientX: 60, clientY: 60 }],
    });
    fireEvent.touchEnd(global.window);
    expect(screen.getByTestId("movable").style).toMatchObject({
      top: "5px",
      left: "5px",
    });
  });
});

describe('when property "bounds" not set', () => {
  const setup = () => {
    render(<Default {...Default.args} />);
    mockBoundingRects();
  };

  it("takes the parent element as bounds", () => {
    setup();
    fireEvent.mouseDown(screen.getByTestId("movable"), {
      clientX: 55,
      clientY: 55,
    });
    fireEvent.mouseMove(screen.getByTestId("movable"), {
      clientX: 10,
      clientY: 10,
    });
    expect(screen.getByTestId("movable").style.transform).toEqual(
      "translate3d(-10px, -10px, 0)"
    );

    fireEvent.mouseMove(screen.getByTestId("movable"), {
      clientX: 500,
      clientY: 500,
    });

    expect(screen.getByTestId("movable").style.transform).toEqual(
      "translate3d(240px, 240px, 0)"
    );
  });
});

describe('when property "unbounded" set to `true`', () => {
  const setup = () => {
    render(<Unbounded {...Unbounded.args} />);
    mockBoundingRects();
  };
  it("the element can be moved outside of parent", () => {
    setup();
    fireEvent.mouseDown(screen.getByTestId("movable"), {
      clientX: 55,
      clientY: 55,
    });
    fireEvent.mouseMove(screen.getByTestId("movable"), {
      clientX: 10,
      clientY: 10,
    });
    expect(screen.getByTestId("movable").style.transform).toEqual(
      "translate3d(-45px, -45px, 0)"
    );

    fireEvent.mouseMove(screen.getByTestId("movable"), {
      clientX: 500,
      clientY: 500,
    });

    expect(screen.getByTestId("movable").style.transform).toEqual(
      "translate3d(445px, 445px, 0)"
    );
  });
});

describe('when "bounds" property set', () => {
  const setup = (bounds: UseMovableProps["bounds"]) => {
    render(<Default {...Default.args} bounds={bounds} />);
    mockBoundingRects();
  };
  describe("to a bounding rect", () => {
    it("uses bounding rect as bounds", () => {
      setup({
        top: 10,
        left: 10,
        width: 100,
        height: 100,
        bottom: 110,
        right: 110,
      });
      fireEvent.mouseDown(screen.getByTestId("movable"), {
        clientX: 55,
        clientY: 55,
      });
      fireEvent.mouseMove(global.window, { clientX: -999, clientY: -999 });
      expect(screen.getByTestId("movable").style.transform).toEqual(
        "translate3d(-20px, -20px, 0)"
      );
      fireEvent.mouseMove(global.window, { clientX: 999, clientY: 999 });
      expect(screen.getByTestId("movable").style.transform).toEqual(
        "translate3d(30px, 30px, 0)"
      );
    });
  });

  describe("to a function returning a bounding rect", () => {
    it("uses returned bounding rect as bounds", () => {
      setup(() => ({
        top: 10,
        left: 10,
        width: 100,
        height: 100,
        bottom: 110,
        right: 110,
      }));
      fireEvent.mouseDown(screen.getByTestId("movable"), {
        clientX: 55,
        clientY: 55,
      });
      fireEvent.mouseMove(global.window, { clientX: -999, clientY: -999 });
      expect(screen.getByTestId("movable").style.transform).toEqual(
        "translate3d(-20px, -20px, 0)"
      );
      fireEvent.mouseMove(global.window, { clientX: 999, clientY: 999 });
      expect(screen.getByTestId("movable").style.transform).toEqual(
        "translate3d(30px, 30px, 0)"
      );
    });
  });

  describe("to a reference to an element", () => {
    it("uses the reference element as bounds", () => {
      setup({
        current: {
          getBoundingClientRect: () => ({
            x: 10,
            y: 10,
            top: 10,
            left: 10,
            width: 100,
            height: 100,
            bottom: 110,
            right: 110,
          }),
        },
      } as React.RefObject<HTMLElement>);
      fireEvent.mouseDown(screen.getByTestId("movable"), {
        clientX: 55,
        clientY: 55,
      });
      fireEvent.mouseMove(global.window, { clientX: -999, clientY: -999 });
      expect(screen.getByTestId("movable").style.transform).toEqual(
        "translate3d(-20px, -20px, 0)"
      );
      fireEvent.mouseMove(global.window, { clientX: 999, clientY: 999 });
      expect(screen.getByTestId("movable").style.transform).toEqual(
        "translate3d(30px, 30px, 0)"
      );
    });
  });
});

describe('when "sizeRef" property given', () => {
  const setup = () => {
    render(<Default {...Default.args} withHandle />);
    mockBoundingRects();
  };

  it("uses sizeRef parent as bounds when no bounds given", () => {
    setup();
    fireEvent.mouseDown(screen.getByTestId("handle"), {
      clientX: 55,
      clientY: 55,
    });
    fireEvent.mouseMove(screen.getByTestId("handle"), {
      clientX: -999,
      clientY: -999,
    });
    expect(screen.getByTestId("movable").style.transform).toEqual(
      "translate3d(-10px, -10px, 0)"
    );
  });
});

describe('when property "connector" set to custom keyboard connector', () => {
  const setup = () => {
    render(<CustomConnector {...CustomConnector.args} />);
    mockBoundingRects();
  };

  it("uses keyboard events to move element", () => {
    setup();
    screen.getByTestId("movable").focus();
    fireEvent.keyDown(global.window, {
      key: "ArrowDown",
    });
    fireEvent.keyDown(global.window, {
      key: "ArrowRight",
    });
    fireEvent.keyDown(global.window, {
      key: "ArrowRight",
    });
    expect(screen.getByTestId("movable").style).toMatchObject({
      top: "10px",
      left: "20px",
    });
  });
});
