import {
  LineMaterial,
  LineMaterialParameters,
} from "three/examples/jsm/Addons.js";
import LineFragment from "./lineShaders/LineFragment.glsl";
import LineVertex from "./lineShaders/LineVertex.glsl";

export default class LineMaterial3 extends LineMaterial {
  constructor(parameters: LineMaterialParameters) {
    super({
      // color: "rgba(0,0,1,1)",
      linewidth: 0.05, // in world units with size attenuation, pixels otherwise
      vertexColors: true,
      // //resolution:  // to be set by renderer, eventually
      // dashed: false,
      alphaToCoverage: true, // NOTE: true = overlaps visible, false = bad antialias
      worldUnits: true,
      // do not enable transparent: alpha parts then display background color instead
      //transparent: true,
      ...parameters,
    });
    this.vertexShader = LineVertex;
    this.fragmentShader = LineFragment;
  }
}
