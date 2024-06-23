import {
  BufferGeometry,
  Mesh,
  NearestMipmapLinearFilter,
  Vector3,
} from "three";
import GraphVertex from "./GraphVertex";
import { edgeHashes, faceHashes, vectorHash } from "../utils/hash";
import faceNormal from "../utils/faceNormal";
import Heap from "./Heap";

export default class Graph {
  private graph = new Map<string, GraphVertex>();

  get vertices() {
    const iterator = this[Symbol.iterator]();
    return {
      [Symbol.iterator](): Iterator<GraphVertex> {
        return iterator;
      },
    };
  }

  get edges() {
    const iterator = this.getEdgesIterator();
    return {
      [Symbol.iterator](): Iterator<[GraphVertex, GraphVertex]> {
        return iterator;
      },
    };
  }

  get faces() {
    const iterator = this.getFacesIterator();
    return {
      [Symbol.iterator](): Iterator<[GraphVertex, GraphVertex, GraphVertex]> {
        return iterator;
      },
    };
  }

  get size() {
    return this.graph.size;
  }

  get pointPositionsBuffer() {
    const vertexPositions: number[] = [];
    for (const vertex of this) {
      vertexPositions.push(...vertex.position);
    }
    return new Float32Array(vertexPositions);
  }

  constructor() {}

  setVertices(input: Mesh | BufferGeometry) {
    const geometry = input instanceof Mesh ? input.geometry : input;

    if (geometry.index === null) {
      console.error("Mesh geometry needs to be converted to indexed geometry");
      return;
    }

    // temp variables, faster if they are not recreated all the time
    const start = new Vector3();
    const end = new Vector3();
    const third = new Vector3();

    // indexed BufferGeometry
    const position = geometry.attributes.position;
    const indices = geometry.index;
    let groups = geometry.groups;

    if (groups.length === 0) {
      groups = [{ start: 0, count: indices.count, materialIndex: 0 }];
    }

    for (let o = 0, ol = groups.length; o < ol; ++o) {
      const group = groups[o];

      const groupStart = group.start;
      const groupCount = group.count;

      for (let i = groupStart, l = groupStart + groupCount; i < l; i += 3) {
        for (let j = 0; j < 3; j++) {
          const index1 = indices.getX(i + j);
          const index2 = indices.getX(i + ((j + 1) % 3));
          const index3 = indices.getX(i + ((j + 2) % 3));

          start.fromBufferAttribute(position, index1);
          end.fromBufferAttribute(position, index2);
          third.fromBufferAttribute(position, index3);

          this.addVerticesFromFace(start, end, third);
        }
      }
    }
  }

  buildGeometryData() {
    const visitedFaces = new Set<string>();
    const visitedEdges = new Set<string>();

    const result: {
      faces: {
        positions: number[];
        normals: number[];
        vertexOrder: number[];
        firstNeighbors: number[];
        secondNeighbors: number[];
      };
      lines: {
        positions: number[];
        segmentWidth: number[];
        neighborOne: number[];
        neighborTwo: number[];
      };
    } = {
      faces: {
        positions: [],
        normals: [],
        vertexOrder: [],
        firstNeighbors: [],
        secondNeighbors: [],
      },
      lines: {
        positions: [],
        segmentWidth: [],
        neighborOne: [],
        neighborTwo: [],
      },
    };

    for (const vertex of this) {
      // check all faces on current vertex
      for (const face of vertex.faces) {
        // each face only once
        if (!this.isUniqueFace(face, visitedFaces)) continue;

        // face vertex positions
        result.faces.positions.push(
          ...face[0].position,
          ...face[1].position,
          ...face[2].position
        );

        // face vertex order
        result.faces.vertexOrder.push(0, 1, 2);

        // face normals
        // every vertex needs info about the normal
        const normal = faceNormal(face);
        result.faces.normals.push(...normal, ...normal, ...normal);

        // each vertex needs info about its neighbors
        result.faces.firstNeighbors.push(
          ...face[1].position,
          ...face[2].position,
          ...face[0].position
        );
        result.faces.secondNeighbors.push(
          ...face[2].position,
          ...face[0].position,
          ...face[1].position
        );
      }

      // check all edges
      for (const neighbor of vertex.neighbors) {
        if (!this.isUniqueEdge([vertex, neighbor], visitedEdges)) continue;

        // line segment start and end
        result.lines.positions.push(...vertex.position, ...neighbor.position);

        // common neighbors
        const commonNeighbors = vertex.commonNeighborsWith(neighbor);
        if (commonNeighbors.length !== 2)
          throw new Error(
            "Vertices do not share two common neihbors. Neighbors length: " +
              commonNeighbors.length
          );

        const neighborOne = commonNeighbors[0];
        const neighborTwo = commonNeighbors[1];

        result.lines.neighborOne.push(
          ...neighborOne.neighbor.position,
          neighborOne.order
        );
        result.lines.neighborTwo.push(
          ...neighborTwo.neighbor.position,
          neighborTwo.order
        );

        // line segment width = 0 by default = only edges
        result.lines.segmentWidth.push(0);
      }
    }
    return result;
  }

  markVertices(vertices: GraphVertex[]) {
    const result: {
      faces: {
        segmentWidth: number[];
      };
      lines: {
        segmentWidth: number[];
      };
    } = {
      faces: {
        segmentWidth: [],
      },
      lines: {
        segmentWidth: [],
      },
    };

    for (const vertex of this) {
    }

    return result;
  }

  findPath(start: GraphVertex, end: GraphVertex) {
    const path: GraphVertex[] = [];

    const shortestPaths = new Map<GraphVertex, number>();

    const heap = new Heap<GraphVertex>();
    heap.push(start, 0);

    while (heap.front() !== null) {
      const closestVertex = heap.pop();

      if (shortestPaths.has(closestVertex.value)) continue;

      shortestPaths.set(closestVertex.value, closestVertex.weight);

      // if end found, skip the rest
      if (closestVertex.value === end) break;

      for (const neighbor of closestVertex.value.neighbors) {
        if (!shortestPaths.has(neighbor)) {
          // all weights = 1 for now
          heap.push(neighbor, closestVertex.weight + 1);
        }
      }
    }

    // reconstruct the path
    const endDistance = shortestPaths.get(end);
    if (!endDistance) throw Error("End vertex not found in the graph");

    let currentVertex = end;
    while (currentVertex !== start) {
      path.push(currentVertex);

      let nextVertex: GraphVertex = currentVertex;
      let closestDistance: number = Infinity;

      // loop all currentVertex neighbors
      // find one that was visited, with shortest path
      for (const neighbor of currentVertex.neighbors) {
        const distance = shortestPaths.get(neighbor);

        if (distance !== undefined && distance < closestDistance) {
          nextVertex = neighbor;
          closestDistance = distance;
        }
      }

      if (nextVertex === currentVertex) throw new Error("Path not found");

      // next step
      currentVertex = nextVertex;
    }

    path.reverse();

    return path;
  }

  private addVerticesFromFace(start: Vector3, end: Vector3, third: Vector3) {
    const triangleVertices = [start, end, third];

    // initialize vertices
    for (const vec of triangleVertices) {
      const vecHash = vectorHash(vec);

      let vertex = this.graph.get(vecHash);
      if (!vertex) {
        const newVertex = new GraphVertex(vecHash, vec);
        vertex = newVertex;
        this.graph.set(vecHash, vertex);
      }
    }

    // add neighbors
    for (const vec1 of triangleVertices) {
      for (const vec2 of triangleVertices) {
        if (vec1 === vec2) break;

        const vertex1 = this.graph.get(vectorHash(vec1));
        const vertex2 = this.graph.get(vectorHash(vec2));

        if (!vertex1 || !vertex2) break;

        if (!vertex1.neighbors.has(vertex2)) vertex1.neighbors.add(vertex2);
        if (!vertex2.neighbors.has(vertex1)) vertex2.neighbors.add(vertex1);
      }
    }

    // faces
    const startVertex = this.graph.get(vectorHash(start));
    const endVertex = this.graph.get(vectorHash(end));
    const thirdVertex = this.graph.get(vectorHash(third));

    if (!startVertex || !endVertex || !thirdVertex) return;

    const face: [GraphVertex, GraphVertex, GraphVertex] = [
      startVertex,
      endVertex,
      thirdVertex,
    ];
    startVertex.addFace(face);
    endVertex.addFace(face);
    thirdVertex.addFace(face);
  }

  private isUniqueEdge(
    edge: [GraphVertex, GraphVertex],
    visitedEdges: Set<string>
  ) {
    const hashes = edgeHashes(edge);
    if (hashes.some((hash) => visitedEdges.has(hash))) {
      return false;
    } else {
      visitedEdges.add(hashes[0]);
      return true;
    }
  }

  private isUniqueFace(
    face: [GraphVertex, GraphVertex, GraphVertex],
    visitedFaces: Set<string>
  ) {
    const hashes = faceHashes(face);

    if (hashes.some((hash) => visitedFaces.has(hash))) {
      return false;
    } else {
      visitedFaces.add(hashes[0]);
      return true;
    }
  }

  getVertex(position: [number, number, number]) {
    const vec3 = new Vector3(...position);
    const hash = vectorHash(vec3);

    return this.graph.get(hash);
  }

  getFacesIterator(): Iterator<[GraphVertex, GraphVertex, GraphVertex]> {
    const visitedFaces = new Set<string>();
    const isUniqueFace = this.isUniqueFace.bind(this);

    const vertexIterator = this[Symbol.iterator]();

    let vertex: GraphVertex | undefined;
    const vertexFaces = new Set<[GraphVertex, GraphVertex, GraphVertex]>();
    let face: [GraphVertex, GraphVertex, GraphVertex] | undefined;

    const facesIterator = vertexFaces[Symbol.iterator]();

    return {
      next() {
        // has to cover the case when a next vertex does not add any unique face
        while (vertexFaces.size === 0) {
          const nextVertexIteration = vertexIterator.next();
          if (nextVertexIteration.done) return { done: true, value: undefined };
          vertex = nextVertexIteration.value;

          for (const face of vertex.faces) {
            if (isUniqueFace(face, visitedFaces)) vertexFaces.add(face);
          }
        }

        const nextFaceIteration = facesIterator.next();

        if (nextFaceIteration.done) return { done: true, value: undefined };

        face = nextFaceIteration.value;
        vertexFaces.delete(face);
        return { done: false, value: face };
      },
    };
  }

  getEdgesIterator(): Iterator<[GraphVertex, GraphVertex]> {
    const visitedEdges = new Set<string>();
    const isUniqueEdge = this.isUniqueEdge.bind(this);

    const vertexIterator = this[Symbol.iterator]();

    let vertex: GraphVertex | undefined;
    // save reference to current vertex neighbor
    // reset when current vertex reset !!!
    // only call next vertex if all current neighbor edges traversed
    const vertexNeighbors = new Set<GraphVertex>();
    let neighbor: GraphVertex | undefined;

    const neighborsIterator = vertexNeighbors[Symbol.iterator]();

    return {
      next() {
        if (vertexNeighbors.size === 0) {
          const nextVertexIteration = vertexIterator.next();
          if (nextVertexIteration.done) return { done: true, value: undefined };
          vertex = nextVertexIteration.value;

          for (const newVertexNeighbor of vertex.neighbors) {
            if (isUniqueEdge([vertex, newVertexNeighbor], visitedEdges)) {
              vertexNeighbors.add(newVertexNeighbor);
            }
          }

          const nextNeighborIteration = neighborsIterator.next();
          if (nextNeighborIteration.done)
            return { done: true, value: undefined };
          neighbor = nextNeighborIteration.value;
          vertexNeighbors.delete(neighbor);
        } else {
          const nextNeighborIteration = neighborsIterator.next();
          if (nextNeighborIteration.done)
            return { done: true, value: undefined };
          neighbor = nextNeighborIteration.value;
          vertexNeighbors.delete(neighbor);
        }

        return { done: false, value: [vertex!, neighbor] };
      },
    };
  }

  // custom iterator = BFS graph traversal
  [Symbol.iterator](): Iterator<GraphVertex> {
    const visitedVertices = new Set<GraphVertex>();

    let firstVertex: GraphVertex | null = null;
    for (const vertex of this.graph.values()) {
      firstVertex = vertex;
      break;
    }

    // empty graph
    if (!firstVertex)
      return {
        next: () => {
          return { done: true, value: undefined };
        },
      };

    // init
    const neighbors = [firstVertex];
    let currentVertex: GraphVertex | undefined;

    return {
      next: () => {
        // if neighbors array empty = done
        if (neighbors.length === 0) {
          return { value: undefined, done: true };
        }
        // current value = first value from neighbors array
        currentVertex = neighbors.shift();
        if (!currentVertex) throw new Error("currentVertex is undefined");
        // mark as visited
        visitedVertices.add(currentVertex);
        // add all its neighbors (if not visited)
        for (const neighbor of currentVertex.neighbors) {
          if (!visitedVertices.has(neighbor)) {
            neighbors.push(neighbor);
            visitedVertices.add(neighbor);
          }
        }
        // return
        return { value: currentVertex, done: false };
      },
    };
  }
}
