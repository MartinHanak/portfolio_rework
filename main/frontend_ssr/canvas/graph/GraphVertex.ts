import { Vector3 } from "three";

export default class GraphVertex {
  // hash = position stored as string
  hash: string;
  position: Vector3 = new Vector3();
  neighbors: Set<GraphVertex> = new Set();

  // faces vertices are stored in this order:
  // this vertex, vertex2, vertex3
  // given 2 vertices: this and vertex2, there can be multiple vertex3
  private faceVec2Vec3: Map<GraphVertex, Set<GraphVertex>> = new Map();
  private faceVec3Vec2: Map<GraphVertex, Set<GraphVertex>> = new Map();

  get faces(): Array<[GraphVertex, GraphVertex, GraphVertex]> {
    const faces: Array<[GraphVertex, GraphVertex, GraphVertex]> = [];
    for (const [vec2, setOfVec3] of this.faceVec2Vec3.entries()) {
      for (const vec3 of setOfVec3.values()) {
        faces.push([this, vec2, vec3]);
      }
    }
    return faces;
  }

  constructor(hash: string, position: Vector3) {
    this.hash = hash;
    this.position.set(position.x, position.y, position.z);
  }

  addFace(vertices: [GraphVertex, GraphVertex, GraphVertex]) {
    const index = vertices.findIndex((vertex) => vertex === this);

    if (index < 0)
      throw Error("Vertices used in addFace do not contain this vertex");

    const vec2Index = (index + 1) % 3;
    const vec3Index = (index + 2) % 3;

    const vertex2 = vertices[vec2Index];
    const vertex3 = vertices[vec3Index];

    let setOfVec3 = this.faceVec2Vec3.get(vertex2);
    let setOfVec2 = this.faceVec3Vec2.get(vertex3);

    // init if not already
    if (!setOfVec3) {
      const newSetOfVec3 = new Set<GraphVertex>();
      setOfVec3 = newSetOfVec3;
      this.faceVec2Vec3.set(vertex2, setOfVec3);
    }

    if (!setOfVec2) {
      const newSetOfVec2 = new Set<GraphVertex>();
      setOfVec2 = newSetOfVec2;
      this.faceVec3Vec2.set(vertex3, setOfVec2);
    }

    // add if not already
    if (!setOfVec3.has(vertex3)) setOfVec3.add(vertex3);
    if (!setOfVec2.has(vertex2)) setOfVec2.add(vertex2);
  }

  commonFacesWith(vertex: GraphVertex) {
    const commonFaces: Array<[GraphVertex, GraphVertex, GraphVertex]> = [];

    const setOfVec3 = this.faceVec2Vec3.get(vertex);
    const setOfVec2 = this.faceVec3Vec2.get(vertex);

    if (setOfVec3)
      for (const vec3 of setOfVec3.values()) {
        commonFaces.push([this, vertex, vec3]);
      }

    if (setOfVec2)
      for (const vec2 of setOfVec2.values()) {
        commonFaces.push([this, vec2, vertex]);
      }

    return commonFaces;
  }
}
