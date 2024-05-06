import { Mesh, Vector3 } from "three";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";

export default class LineSegmentsGeometry3 extends LineSegmentsGeometry {
  constructor() {
    super();
  }

  fromMesh(mesh: Mesh) {
    // convert mesh.geometry to wire geometry
    const geometry = mesh.geometry;

    const vertices = [];
    const edges = new Set<string>();

    const start = new Vector3();
    const end = new Vector3();

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

          start.fromBufferAttribute(position, index1);
          end.fromBufferAttribute(position, index2);

          if (isUniqueEdge(start, end, edges) === true) {
            vertices.push(start.x, start.y, start.z);
            vertices.push(end.x, end.y, end.z);
          }
        }
      }
    }

    // positions from wireframe
    //this.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    this.setPositions(vertices);

    // NOTE: setPositions unchanged

    return this;
  }
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
