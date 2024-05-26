import { Vector3 } from "three";
import GraphVertex from "../graph/GraphVertex";

export function vectorHash(vec: Vector3) {
  return `${vec.x},${vec.y},${vec.z}`;
}

export function edgeHashes(edge: [GraphVertex, GraphVertex]) {
  const start = edge[0].position;
  const end = edge[1].position;

  const hash1 = `${vectorHash(start)}-${vectorHash(end)}`;
  const hash2 = `${vectorHash(end)}-${vectorHash(start)}`;

  return [hash1, hash2];
}

export function faceHashes(face: [GraphVertex, GraphVertex, GraphVertex]) {
  const start = face[0].position;
  const end = face[1].position;
  const third = face[2].position;

  const hash1 = `${start.x},${start.y},${start.z}-${end.x},${end.y},${end.z}-${third.x},${third.y},${third.z}`;
  const hash2 = `${end.x},${end.y},${end.z}-${third.x},${third.y},${third.z}-${start.x},${start.y},${start.z}`;
  const hash3 = `${third.x},${third.y},${third.z}-${start.x},${start.y},${start.z}-${end.x},${end.y},${end.z}`;

  return [hash1, hash2, hash3];
}
