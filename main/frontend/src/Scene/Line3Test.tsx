import LineSegments3 from "../mesh/LineSegments3";
import LineSegmentsGeometry3 from "../geometry/LineSegmentsGeometry3";
import LineMaterial3 from "../material/LineMaterial3";
import { useMemo } from "react";
import { AdditiveBlending, BoxGeometry, BufferGeometry, Mesh, WireframeGeometry } from "three";
import FaceMaterial from "../material/FaceMaterial";


export default function Line3Test() {

    const line3 = useMemo(() => new LineSegments3(), []);
    const lineMaterial3 = useMemo(() => new LineMaterial3({
        color: 'rgba(0,0,1,1)',
        linewidth: 0.05, // in world units with size attenuation, pixels otherwise
        vertexColors: true,

        //resolution:  // to be set by renderer, eventually
        dashed: false,
        alphaToCoverage: true, // NOTE: true = overlaps visible, false = bad antialias
        worldUnits: true,
        transparent: true,
    }), []);

    const faceMaterial = useMemo(() => {
        const material = new FaceMaterial();

        return material;
    }, []);

    const [lineGeo, facesGeo] = useMemo(() => {
        const box = new Mesh();
        box.position.set(1, 1, 1);
        const boxGeo = new BoxGeometry();
        box.geometry = boxGeo;

        const lineSegmentsGeo = new LineSegmentsGeometry3();

        //lineSegmentsGeo.fromWireframeGeometry(new WireframeGeometry(boxGeo));
        const facesGeometry = new BufferGeometry();
        lineSegmentsGeo.fromMesh(box, facesGeometry);

        console.log(facesGeometry);

        return [lineSegmentsGeo, facesGeometry];
    }, []);

    return <>

        <mesh renderOrder={1}>
            <primitive object={facesGeo} attach="geometry" />
            <primitive object={faceMaterial} attach="material" />
        </mesh>


        <primitive object={line3} renderOrder={2} >
            <primitive object={lineGeo} attach="geometry" />
            <primitive object={lineMaterial3} attach="material" />
        </primitive>

        {/* <mesh renderOrder={10} scale={0.95}>
            <boxGeometry />
            <meshBasicMaterial />
        </mesh> */}
    </>;
}