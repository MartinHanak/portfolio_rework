import { ShaderMaterial } from "three";
import faceWithEdgesVertex from "./faceShaders/faceWithEdgesVertex.glsl";
import faceWithEdgesFragment from "./faceShaders/faceWithEdgesFragment.glsl";

export default class FaceWithEdgesMaterial extends ShaderMaterial {
  constructor() {
    super();
    this.vertexShader = faceWithEdgesVertex;
    this.fragmentShader = faceWithEdgesFragment;
  }
}
