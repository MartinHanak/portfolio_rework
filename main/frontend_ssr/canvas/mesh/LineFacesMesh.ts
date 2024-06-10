import { BufferGeometry, Mesh } from "three";
import FaceMaterial from "../material/FaceMaterial";

export default class LineFacesMesh extends Mesh {
  constructor(geometry = new BufferGeometry(), material = new FaceMaterial()) {
    super(geometry, material);
  }
}
