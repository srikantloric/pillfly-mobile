import { hasMoreSearchPages } from "../hooks/useProductSearch";
import { mergeUniqueBy } from "../utils/mergeUniqueBy";

const byId = (item: { id: string }) => item.id;

describe("mergeUniqueBy", () => {
  it("appends new items and skips keys already present", () => {
    expect(mergeUniqueBy([{ id: "1" }], [{ id: "1" }, { id: "2" }], byId).map(byId)).toEqual([
      "1",
      "2",
    ]);
  });

  it("drops duplicates within the incoming page", () => {
    expect(mergeUniqueBy([], [{ id: "1" }, { id: "1" }], byId)).toHaveLength(1);
  });
});

describe("hasMoreSearchPages", () => {
  it("stops when there is no further page", () => {
    expect(hasMoreSearchPages(0, 0)).toBe(false);
    expect(hasMoreSearchPages(0, 1)).toBe(false);
    expect(hasMoreSearchPages(0, 2)).toBe(true);
    expect(hasMoreSearchPages(1, 2)).toBe(false);
  });
});
