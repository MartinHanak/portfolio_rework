import { describe, it, expect, beforeEach } from "vitest";
import Graph from "../../canvas/graph/Graph";
import { BoxGeometry } from "three";
import GraphVertex from "../../canvas/graph/GraphVertex";
import { lessThan } from "three/examples/jsm/nodes/Nodes.js";
import { edgeHashes, faceHashes } from "../../canvas/utils/hash";

let graph = new Graph();

beforeEach(() => {
  graph = new Graph();
});

describe("Graph", () => {
  it("should start with 0 vertices", () => {
    let count = 0;
    for (const vertex of graph) {
      count += 1;
    }

    expect(count).toBe(0);
  });

  it("should contain each geometry vertex once", () => {
    const geometry = new BoxGeometry();
    graph.setVertices(geometry);

    let count = 0;
    for (const vertex of graph) {
      count += 1;
    }

    expect(count).toBe(8);
  });

  it("should build correct number of lines and faces", () => {
    const geometry = new BoxGeometry();
    graph.setVertices(geometry);
    const result = graph.buildGeometryData();

    // 1 line segment = 2 vertices = 6 numbers
    // 1 box = 18 lines, 12 faces
    expect(result.lines.positions.length).toBe(18 * 6);
    // each face = 3 vertices
    expect(result.faces.positions.length).toBe(12 * 3 * 3);
  });

  it("should have iterator that goes through every vertex exactly once", () => {
    const geometry = new BoxGeometry();
    graph.setVertices(geometry);

    const visitedVertices = new Set();

    let eachVertexOnce = true;

    for (const vertex of graph) {
      if (!visitedVertices.has(vertex)) {
        visitedVertices.add(vertex);
      } else {
        eachVertexOnce = false;
      }
    }

    expect(eachVertexOnce).toBe(true);
    expect(visitedVertices.size).toBe(8);
  });

  it("should be able to find shortest path between vertices", () => {
    const geometry = new BoxGeometry();
    graph.setVertices(geometry);

    let index = 0;
    let firstVertex: GraphVertex | undefined = undefined;
    let secondVertex: GraphVertex | undefined = undefined;
    for (const vertex of graph) {
      console.log(index);
      if (index === 0) firstVertex = vertex;
      if (index === 7) secondVertex = vertex;
      index += 1;
    }

    if (!firstVertex || !secondVertex) throw new Error("No vertices defined");

    const path = graph.findPath(firstVertex, secondVertex);
    //const path = [];

    console.log(path);
    expect(path.length).toBe(2);
  });

  it("traverses every edge once", () => {
    const geometry = new BoxGeometry();
    graph.setVertices(geometry);

    const visitedEdges = new Set<string>();

    for (const edge of graph.edges) {
      const hashes = edgeHashes(edge);
      if (hashes.some((hash) => visitedEdges.has(hash))) {
        throw new Error("Edge visited twice");
      } else {
        visitedEdges.add(hashes[0]);
      }
    }

    expect(visitedEdges.size).toBe(18);
  });

  it("traverses every face once", () => {
    const geometry = new BoxGeometry();
    graph.setVertices(geometry);

    const visitedFaces = new Set<string>();

    for (const face of graph.faces) {
      const hashes = faceHashes(face);
      if (hashes.some((hash) => visitedFaces.has(hash))) {
        throw new Error("Face visited twice");
      } else {
        visitedFaces.add(hashes[0]);
      }
    }

    expect(visitedFaces.size).toBe(12);
  });
});
