import { describe, it, expect } from "vitest";
import Graph from "../../canvas/graph/Graph";

describe("Graph", () => {
  it("should start with 0 vertices", () => {
    const graph = new Graph();
    let count = 0;

    for (const vertex of graph) {
      count += 1;
    }

    expect(count).toBe(0);
  });
});
