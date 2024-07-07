import { ShaderMaterial } from "three";
// import faceVertex from "./faceShaders/faceVertex.glsl";
// import faceFragment from "./faceShaders/faceFragment.glsl";
import faceVertex from "./faceShaders/faceDepthVertex.glsl";
import faceFragment from "./faceShaders/faceDepthFragment.glsl";

export default class FaceMaterial extends ShaderMaterial {
  constructor() {
    super();
    this.vertexShader = faceVertex;
    this.fragmentShader = faceFragment;
    this.type = "DepthOnlyMaterial";
  }
}
