import { BufferAttribute, BufferGeometry, Mesh, Vector3 } from "three";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import GraphVertex, { faceNormal } from "./GraphVertex";

export default class LineSegmentsGeometry3 extends LineSegmentsGeometry {
  constructor() {
    super();
  }

  fromMesh(mesh: Mesh, facesGeometry?: BufferGeometry) {
    // convert mesh.geometry to wire geometry
    const geometry = mesh.geometry;

    const vertices = [];
    const edges = new Set<string>();
    const faces = new Set<string>();
    const vertexToFace = new Map<string, Set<string>>();
    const vertexGraph = new Map<string, GraphVertex>();

    const start = new Vector3();
    const end = new Vector3();
    const third = new Vector3();

    if (geometry.index === null) {
      console.error(
        "Mesh geometry needs to be converted to indexed geometry before using fromMesh method on LineSegmentsGeometry3"
      );
      return this;
    }

    // indexed BufferGeometry
    const position = geometry.attributes.position;
    const indices = geometry.index;
    let groups = geometry.groups;

    if (groups.length === 0) {
      groups = [{ start: 0, count: indices.count, materialIndex: 0 }];
    }

    // create a data structure that contains all edges without duplicates
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

          if (isUniqueEdge(start, end, edges) === true) {
            vertices.push(start.x, start.y, start.z);
            vertices.push(end.x, end.y, end.z);
          }

          isUniqueFace(start, end, third, faces, vertexToFace);

          addVerticesToGraph(start, end, third, vertexGraph);
        }
      }
    }

    // traverse graph, set positions and other attributes
    const traversedVertices = traverse(vertexGraph, facesGeometry);
    this.setPositions(traversedVertices);

    // correct:
    // this.setPositions(vertices);

    // NOTE: setPositions unchanged

    return this;
  }
}

function addVerticesToGraph(
  start: Vector3,
  end: Vector3,
  third: Vector3,
  graph: Map<string, GraphVertex>
) {
  const triangleVertices = [start, end, third];

  // initialize vertices
  for (const vec of triangleVertices) {
    const vecHash = vectorHash(vec);

    let vertex = graph.get(vecHash);
    if (!vertex) {
      const newVertex = new GraphVertex(vecHash, vec);
      vertex = newVertex;
      graph.set(vecHash, vertex);
    }
  }

  // add neighbors
  for (const vec1 of triangleVertices) {
    for (const vec2 of triangleVertices) {
      if (vec1 === vec2) break;

      const vertex1 = graph.get(vectorHash(vec1));
      const vertex2 = graph.get(vectorHash(vec2));

      if (!vertex1 || !vertex2) break;

      if (!vertex1.neighbors.has(vertex2)) vertex1.neighbors.add(vertex2);
      if (!vertex2.neighbors.has(vertex1)) vertex2.neighbors.add(vertex1);
    }
  }

  // faces
  const startVertex = graph.get(vectorHash(start));
  const endVertex = graph.get(vectorHash(end));
  const thirdVertex = graph.get(vectorHash(third));

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

function isUniqueEdge(start: Vector3, end: Vector3, edges: Set<string>) {
  const hash1 = `${start.x},${start.y},${start.z}-${end.x},${end.y},${end.z}`;
  const hash2 = `${end.x},${end.y},${end.z}-${start.x},${start.y},${start.z}`; // coincident edge

  if (edges.has(hash1) === true || edges.has(hash2) === true) {
    return false;
  } else {
    edges.add(hash1);
    edges.add(hash2);
    return true;
  }
}

function isUniqueFace(
  start: Vector3,
  end: Vector3,
  third: Vector3,
  faces: Set<string>,
  vertexToFace: Map<string, Set<string>>
) {
  const hash1 = `${start.x},${start.y},${start.z}-${end.x},${end.y},${end.z}-${third.x},${third.y},${third.z}`;
  const hash2 = `${end.x},${end.y},${end.z}-${third.x},${third.y},${third.z}-${start.x},${start.y},${start.z}`;
  const hash3 = `${third.x},${third.y},${third.z}-${start.x},${start.y},${start.z}-${end.x},${end.y},${end.z}`;

  if (
    faces.has(hash1) === true ||
    faces.has(hash2) === true ||
    faces.has(hash3) === true
  ) {
    return false;
  } else {
    faces.add(hash1);

    for (const vec of [start, end, third]) {
      const vecHash = vectorHash(vec);

      let vecFaces = vertexToFace.get(vecHash);
      if (!vecFaces) {
        const newSet = new Set<string>();
        vecFaces = newSet;
        vertexToFace.set(vecHash, vecFaces);
      }

      vecFaces.add(hash1);
    }

    // only add 1 hash for unique faces, exclude these:
    //faces.add(hash2);
    //faces.add(hash3);
    return true;
  }
}

function vectorHash(vec: Vector3) {
  return `${vec.x},${vec.y},${vec.z}`;
}

function faceHash([start, end, third]: [
  GraphVertex,
  GraphVertex,
  GraphVertex
]) {
  return `${vectorHash(start.position)}-${vectorHash(
    end.position
  )}-${vectorHash(third.position)}`;
}

function traverse(
  graph: Map<string, GraphVertex>,
  facesGeometry?: BufferGeometry
) {
  const vertices = [];
  const faceVertices: number[] = [];
  const faceNormals: number[] = [];
  const faceFirstNeighbors: number[] = [];
  const faceSecondNeighbors: number[] = [];
  const visitedEdges = new Set<string>();
  const visitedFaces = new Set<string>();
  const vertexToFace = new Map<string, Set<string>>();
  const visitedVertices = new Set<GraphVertex>();
  let firstVertex: GraphVertex | null = null;

  for (const vertex of graph.values()) {
    firstVertex = vertex;
    break;
  }

  if (!firstVertex) return [];

  const neighbors = [firstVertex];
  let currentVertex: GraphVertex | undefined;

  while (neighbors.length > 0) {
    const levelLength = neighbors.length;

    for (let i = 0; i < levelLength; i++) {
      currentVertex = neighbors.shift();

      if (!currentVertex) throw new Error("Undefined current vertex");

      // mark as visited
      visitedVertices.add(currentVertex);

      // check all faces  on currentVertex
      for (const face of currentVertex.faces) {
        if (
          isUniqueFace(
            face[0].position,
            face[1].position,
            face[2].position,
            visitedFaces,
            vertexToFace
          )
        ) {
          // face vertex positions
          faceVertices.push(
            ...face[0].position,
            ...face[1].position,
            ...face[2].position
          );

          // face normals
          // every vertex needs info about the normal
          const normal = faceNormal(face);
          faceNormals.push(...normal, ...normal, ...normal);

          // each vertex needs info about its neighbors
          faceFirstNeighbors.push(
            ...face[1].position,
            ...face[2].position,
            ...face[0].position
          );
          faceSecondNeighbors.push(
            ...face[2].position,
            ...face[0].position,
            ...face[1].position
          );
        }
      }

      for (const neighbor of currentVertex.neighbors) {
        // if neighbors not visited, add them
        if (!visitedVertices.has(neighbor)) neighbors.push(neighbor);

        // if edges not visited, add them
        const hash1 = `${vectorHash(currentVertex.position)}-${vectorHash(
          neighbor.position
        )}`;
        const hash2 = `${vectorHash(neighbor.position)}-${vectorHash(
          currentVertex.position
        )}`;

        if (!visitedEdges.has(hash1) && !visitedEdges.has(hash2)) {
          visitedEdges.add(hash1);

          vertices.push(...currentVertex.position, ...neighbor.position);

          // // check shared faces
          // const commonFaces = currentVertex.commonFacesWith(neighbor);
          // const normals = commonFaces.map((face) => faceNormal(face));

          // if (commonFaces.length !== 2 || normals.length !== 2)
          //   throw new Error("Edge should have two shared faces");

          // const cameraView = new Vector3(1, 1, 1);
          // const dot1 = cameraView.dot(normals[0]);
          // const dot2 = cameraView.dot(normals[1]);

          // const dotProduct = normals[0].dot(normals[1]);
          // if (dotProduct < 0.5 && (dot1 > 0 || dot2 > 0))
          //   vertices.push(...currentVertex.position, ...neighbor.position);
        }
      }
    }
  }

  if (facesGeometry) {
    const verticesArray = new Float32Array(faceVertices);
    const positionAttribute = new BufferAttribute(verticesArray, 3);
    facesGeometry.setAttribute("position", positionAttribute);

    const normalsArray = new Float32Array(faceNormals);
    const normalsAttribute = new BufferAttribute(normalsArray, 3);
    facesGeometry.setAttribute("aNormal", normalsAttribute);

    const firstNeighbors = new Float32Array(faceFirstNeighbors);
    const firstNeighborAttribute = new BufferAttribute(firstNeighbors, 3);
    facesGeometry.setAttribute("aFirstNeighbor", firstNeighborAttribute);

    const secondNeighbors = new Float32Array(faceSecondNeighbors);
    const secondNeighborAttribute = new BufferAttribute(secondNeighbors, 3);
    facesGeometry.setAttribute("aSecondNeighbor", secondNeighborAttribute);
  }

  return vertices;
}
