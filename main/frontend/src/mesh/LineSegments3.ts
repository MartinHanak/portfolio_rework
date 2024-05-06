import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import LineSegmentsGeometry3 from "../geometry/LineSegmentsGeometry3";
import LineMaterial3 from "../material/LineMaterial3";

export default class LineSegments3 extends LineSegments2 {
  constructor(
    geometry = new LineSegmentsGeometry3(),
    material = new LineMaterial3({ color: Math.random() * 0xffffff })
  ) {
    super(geometry, material);
  }
}
