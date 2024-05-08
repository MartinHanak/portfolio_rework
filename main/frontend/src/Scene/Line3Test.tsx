import LineSegments3 from "../mesh/LineSegments3";
import LineSegmentsGeometry3 from "../geometry/LineSegmentsGeometry3";
import LineMaterial3 from "../material/LineMaterial3";
import { useMemo } from "react";
import { AdditiveBlending, BoxGeometry, Mesh, WireframeGeometry } from "three";


export default function Line3Test() {

    const line3 = useMemo(() => new LineSegments3(), []);
    const lineMaterial3 = useMemo(() => new LineMaterial3({
        color: 0xffffff,
        linewidth: 0.05, // in world units with size attenuation, pixels otherwise
        vertexColors: true,

        //resolution:  // to be set by renderer, eventually
        dashed: false,
        alphaToCoverage: true, // NOTE: true = overlaps visible, false = bad antialias
        worldUnits: true,
        transparent: true
    }), []);

    const lineGeo = useMemo(() => {
        const box = new Mesh();
        box.position.set(1, 1, 1);
        const boxGeo = new BoxGeometry();
        box.geometry = boxGeo;

        const lineSegmentsGeo = new LineSegmentsGeometry3();

        //lineSegmentsGeo.fromWireframeGeometry(new WireframeGeometry(boxGeo));
        lineSegmentsGeo.fromMesh(box);
        console.log(lineSegmentsGeo);
        return lineSegmentsGeo;
    }, []);

    return <primitive object={line3} >
        <primitive object={lineGeo} attach="geometry" />
        <primitive object={lineMaterial3} attach="material" />
    </primitive>;
}