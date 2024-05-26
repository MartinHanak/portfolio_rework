import { Vector3 } from "three";
import GraphVertex from "../graph/GraphVertex";

export default function faceNormal([start, end, third]: [
  GraphVertex,
  GraphVertex,
  GraphVertex,
]) {
  const edge1 = new Vector3().subVectors(end.position, start.position);
  const edge2 = new Vector3().subVectors(third.position, start.position);

  return new Vector3().crossVectors(edge1, edge2).normalize();
}
