import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { BoxGeometry, Mesh } from "three";
import { LineMaterial, LineSegments2, LineSegmentsGeometry } from "three/examples/jsm/Addons.js";
import * as THREE from 'three';

export default function WireFromMesh() {
    const line2 = useMemo(() => new LineSegments2(), []);
    const [lineMaterial] = useState(() => new LineMaterial({
        color: 0xffffff,
        linewidth: 0.05, // in world units with size attenuation, pixels otherwise
        vertexColors: true,

        //resolution:  // to be set by renderer, eventually
        dashed: false,
        alphaToCoverage: true,
        worldUnits: true,
        side: THREE.FrontSide
    }));
    const lineGeom = useMemo(() => {
        const geom = new LineSegmentsGeometry();

        const box = new Mesh(new BoxGeometry(1, 1, 1));


        geom.fromMesh(box);
        console.log(geom);
        //geom.setPositions([0.1, 0, 0, -0.1, 0, 0]);
        //geom.setColors([0.0, 1.0, 0.0, 0, 0, 1]);

        geom.scale(1, 1, 1);
        return geom;
    }, []);

    useLayoutEffect(() => {
        line2.computeLineDistances();
    }, [line2]);

    useEffect(() => {
        return () => lineGeom.dispose();
    }, [lineGeom]);

    return <primitive object={line2}>
        <primitive object={lineGeom} attach="geometry" />
        <primitive object={lineMaterial} attach="material" />
    </primitive>;
}