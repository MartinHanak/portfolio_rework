import { ShaderMaterial } from "three";
import faceVertex from "./faceShaders/faceVertex.glsl";
import faceFragment from "./faceShaders/faceFragment.glsl";

export default class FaceMaterial extends ShaderMaterial {
  constructor() {
    super();
    this.vertexShader = faceVertex;
    this.fragmentShader = faceFragment;
  }
}
