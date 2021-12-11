import {
  emptyBoundingRect,
  toBoundingRect,
} from "../packages/react-move-hook/src/util";

describe("emptyBoundingRect", () => {
  it("returns an empty bounding rect", () => {
    expect(emptyBoundingRect()).toEqual({
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      bottom: 0,
      right: 0,
    });
  });
});

describe("toBoundingRect", () => {
  it("return empty bounding rect when undefined given", () => {
    expect(toBoundingRect(undefined)).toEqual({
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      bottom: 0,
      right: 0,
    });
  });

  it("should transform a given rect to a bounding rect", () => {
    expect(
      toBoundingRect({
        top: 20,
        left: 20,
        width: 50,
        height: 50,
      })
    ).toMatchObject({
      top: 20,
      left: 20,
      width: 50,
      height: 50,
      bottom: 70,
      right: 70,
    });
  });
});
