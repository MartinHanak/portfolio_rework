import { ShaderMaterial } from "three";
import videoVertex from "./VideoVertexShader.glsl";
import videoFragment from "./VideoFragmentShader.glsl";

export default class DistortedVideoMaterial extends ShaderMaterial {
    constructor() {
        super();
        this.vertexShader = videoVertex;
        this.fragmentShader = videoFragment;
    }
}