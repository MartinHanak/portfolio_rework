import { useEffect, useLayoutEffect, useMemo } from "react";
import { LineMaterial, LineSegments2, LineSegmentsGeometry } from "three/examples/jsm/Addons.js";
import ModifiedLineFragment from '../shaders/ModifiedLineFragment.glsl';

export default function FatLineTest() {
    const line2 = useMemo(() => new LineSegments2(), []);
    const lineMaterial = useMemo(() => {
        const material = new LineMaterial({
            color: 0xffffff,
            linewidth: 0.05, // in world units with size attenuation, pixels otherwise
            vertexColors: true,

            //resolution:  // to be set by renderer, eventually
            dashed: false,
            alphaToCoverage: true,
            worldUnits: true
        });

        material.onBeforeCompile = (shader) => {

            shader.fragmentShader = ModifiedLineFragment;

            console.log(shader.vertexShader);
            console.log(shader.fragmentShader);
        };
        return material;
    }, []);

    const lineGeom = useMemo(() => {
        const geom = new LineSegmentsGeometry();

        geom.setPositions([0.1, 0, 0, -0.1, 0, 0]);
        geom.setColors([0.0, 1.0, 0.0, 0, 0, 1]);

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