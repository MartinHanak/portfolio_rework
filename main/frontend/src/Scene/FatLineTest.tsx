import { useEffect, useRef } from "react";
import { GeometryUtils, Line2, LineGeometry, LineMaterial } from "three/examples/jsm/Addons.js";
import * as THREE from 'three';
import { GroupProps, ThreeElements } from "@react-three/fiber";

export default function FatLineTest() {
    const groupRef = useRef<any>();
    useEffect(() => {
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

        let matLine = new LineMaterial({

            color: 0xffffff,
            linewidth: 0.1, // in world units with size attenuation, pixels otherwise
            vertexColors: true,

            //resolution:  // to be set by renderer, eventually
            dashed: false,
            alphaToCoverage: true,

        });

        let line = new Line2(geometry, matLine);
        line.computeLineDistances();
        line.scale.set(1, 1, 1);

        if (groupRef.current && groupRef.current.add) {
            groupRef.current.add(line);
        }
    }, []);

    return <group ref={groupRef}></group>;
}