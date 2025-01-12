import { useVideoTexture } from "@react-three/drei";
import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import Graph from "../../../../canvas/graph/Graph";
import DistortedVideoMaterial from "./DistortedVideoMaterial";


export default function CanvasVideo() {

    const texture = useVideoTexture('/assets/Gravitorium.mp4');

    const testMesh = useMemo(() => {
        const width = 2;
        const height = 2;
        const planeGeometry = new PlaneGeometry(width, height, 1, 1);
        const graph = new Graph();
        graph.setVertices(planeGeometry);

        const geometryData = graph.buildGeometryData();

        console.log(geometryData);

        const generatedGeometry = new BufferGeometry();
        const verticesArray = new Float32Array(geometryData.faces.positions);
        const positionAttribute = new BufferAttribute(verticesArray, 3);
        generatedGeometry.setAttribute("position", positionAttribute);

        const vertexNumber = Math.round(geometryData.faces.positions.length / 3);

        // order
        const orderArray = [];
        for (let i = 0, order = 0; i < vertexNumber; i += 3, order += 1) {
            orderArray[i] = i;
            orderArray[i + 1] = i;
            orderArray[i + 2] = i;
        }
        const typedOrderArray = new Float32Array(orderArray);
        const orderAttribute = new BufferAttribute(typedOrderArray, 1);
        generatedGeometry.setAttribute("order", orderAttribute);

        // uv
        const uv: number[] = [];

        for (let i = 0; i < vertexNumber; i++) {
            const position = geometryData.faces.positions.slice(0 + i * 3, 3 + i * 3);

            const shift = [1, 1, 0];

            const shiftedScaledPosition = [
                (position[0] + shift[0]) / width,
                (position[1] + shift[1]) / height,
                position[2] + shift[2],
            ];

            uv.push(...[
                shiftedScaledPosition[0],
                shiftedScaledPosition[1]
            ]);

        }

        const typedUVArray = new Float32Array(uv);
        const uvAttribute = new BufferAttribute(typedUVArray, 2);
        generatedGeometry.setAttribute("uv", uvAttribute);





        const material = new MeshBasicMaterial();
        material.toneMapped = false;
        material.map = texture;

        //const mesh = new Mesh(new PlaneGeometry(2, 2, 1, 1), material);

        const generatedMaterial = new DistortedVideoMaterial();
        generatedMaterial.uniforms = {
            ...generatedMaterial.uniforms,
            videoTexture: { value: texture }
        };

        const mesh = new Mesh(generatedGeometry, generatedMaterial);

        // TODO: define the shaders for UV mapping to display correctly 
        return mesh;
    }, [texture]);

    return <>


        {/* PLANE */}
        <mesh rotation={[0, 0, 0]} position={[0, 0, 1.1]}>
            <planeGeometry args={[3.2, 1.9]} />

            <meshBasicMaterial map={texture} toneMapped={false} />

            {/* <meshStandardMaterial emissive={"white"} side={THREE.DoubleSide}>

            <videoTexture attach="map" args={[video]} />
            <videoTexture attach="emissiveMap" args={[video]} />
        </meshStandardMaterial> */}

        </mesh>


        {/* TEST */}
        <primitive object={testMesh} position={[0, 0, 2.1]} />
    </>;
}