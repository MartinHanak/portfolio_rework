import {
  LineMaterial,
  LineMaterialParameters,
} from "three/examples/jsm/lines/LineMaterial.js";
import LineVertex from "./originalShaders/LineVertex.glsl";
import LineFragment from "./originalShaders/LineFragment.glsl";

export default class LineMaterial3 extends LineMaterial {
  constructor(parameters: LineMaterialParameters) {
    super(parameters);
    this.vertexShader = LineVertex;
    this.fragmentShader = LineFragment;
  }
}
