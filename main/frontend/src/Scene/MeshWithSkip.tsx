import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { LineMaterial, LineSegments2, LineSegmentsGeometry } from "three/examples/jsm/Addons.js";
import * as THREE from 'three';
import SkipLineVertex from '../shaders/skipLine/SkipLineVertex.glsl';
import SkipLineFragment from '../shaders/skipLine/SkipLineFragment.glsl';

export default function MeshWithSkip() {
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

            shader.vertexShader = SkipLineVertex;
            shader.fragmentShader = SkipLineFragment;

        };
        return material;
    }, []);

    const lineGeom = useMemo(() => {
        const geom = new LineSegmentsGeometry();

        const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));


        geom.fromMesh(box);
        console.log(geom);
        //geom.setPositions([0.1, 0, 0, -0.1, 0, 0]);
        //geom.setColors([0.0, 1.0, 0.0, 0, 0, 1]);

        geom.scale(1, 1, 1);
        geom.translate(1, 1, 1);

        const count = geom.attributes.position.count;
        const skip = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            skip[i] = i % 2;
        }

        geom.setAttribute('aSkip', new THREE.BufferAttribute(skip, 1));
        return geom;
    }, []);

    const lineGeom2 = useMemo(() => {
        const geom = new LineSegmentsGeometry();

        const positions = [
            [1.0, 1.0, 0.0],
            [1.0, 2.0, 0.0],
            [1.0, 2.0, 0.0],
            [3.0, 2.0, 0.0],
        ];

        geom.setPositions(positions.flat());
        //geom.setColors([0.0, 1.0, 0.0, 0, 0, 1, 0, 0, 1]);

        //geom.scale(1, 1, 1);

        const count = geom.attributes.position.count;
        const skip = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            if (i === 1) {
                skip[i] = 1;
            } else {
                skip[i] = 0;
            }
        }

        geom.setAttribute('aSkip', new THREE.InstancedBufferAttribute(skip, 1));
        return geom;
    }, []);

    useLayoutEffect(() => {
        line2.computeLineDistances();
    }, [line2]);

    useEffect(() => {
        return () => lineGeom.dispose();
    }, [lineGeom]);

    return <primitive object={line2}>
        <primitive object={lineGeom2} attach="geometry" />

        <primitive object={lineMaterial} attach="material" />
    </primitive>;
}