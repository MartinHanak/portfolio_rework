import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from 'three';
import { GeometryUtils, Line2, LineGeometry } from "three/examples/jsm/Addons.js";
import { LineMaterial } from "./LineMaterial";

export default function FatLine() {

    const scene = useThree(root => root.scene);
    const renderer = useThree(root => root.gl);
    useFrame(() => {
        renderer.clearDepth();
    });

    const lineMesh = useMemo(() => {


        // Position and THREE.Color Data

        const positions = [];
        const colors = [];

        const points = GeometryUtils.hilbert3D(new THREE.Vector3(0, 0, 0), 20.0, 1, 0, 1, 2, 3, 4, 5, 6, 7);

        const spline = new THREE.CatmullRomCurve3(points);
        const divisions = Math.round(12 * points.length);
        const point = new THREE.Vector3();
        const color = new THREE.Color();

        for (let i = 0, l = divisions; i < l; i++) {

            const t = i / l;

            spline.getPoint(t, point);
            positions.push(point.x, point.y, point.z);

            color.setHSL(t, 1.0, 0.5, THREE.SRGBColorSpace);
            colors.push(color.r, color.g, color.b);

        }

        // Line2 ( LineGeometry, LineMaterial )

        const geometry = new LineGeometry();
        geometry.setPositions(positions);
        geometry.setColors(colors);

        const matLine = new LineMaterial({
            // @ts-ignore
            color: 0xffffff,
            linewidth: 1, // in world units with size attenuation, pixels otherwise
            worldUnits: true,
            vertexColors: true,

            dashed: false,
            alphaToCoverage: true,


        });

        // TODO: remove after test
        matLine.clipping = true;
        // @ts-ignore
        const line = new Line2(geometry, matLine);
        line.computeLineDistances();
        line.scale.set(1, 1, 1);
        scene.add(line);
        console.log(renderer);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0.0);
        return line;
    }, []);
    return <>
    </>;
}