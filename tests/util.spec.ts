import { emptyBoundingRect } from "../packages/react-move-hook/src/util";

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
