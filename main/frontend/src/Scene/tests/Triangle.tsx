import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { LineMaterial, LineSegments2, LineSegmentsGeometry } from "three/examples/jsm/Addons.js";
import * as THREE from 'three';
import WithFacesLineVertex from '../shaders/withFaces/WithFacesLineVertex.glsl';
import WithFacesFragment from '../shaders/withFaces/WithFacesFragment.glsl';

export default function Triangle() {
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

            shader.vertexShader = WithFacesLineVertex;
            shader.fragmentShader = WithFacesFragment;

        };
        return material;
    }, []);

    const lineGeom3 = useMemo(() => {
        const geom = new LineSegmentsGeometry();


        const positions = [
            [-2.0, -2.0, 0.0],
            [-1.0, -2.0, 0.0],
            [-1.0, -2.0, 0.0],
            [-1.0, -1.0, 0.0],
            [-1.0, -1.0, 0.0],
            [-2.0, -2.0, 0.0],
            [-2.0, -2.0, 0.0],
            [-2.0, -3.0, 0.0],
            [-2.0, -3.0, 0.0],
            [-3.0, -3.0, 0.0],
            [-3.0, -3.0, 0.0],
            [-2.0, -2.0, 0.0],
        ];

        geom.setPositions(positions.flat());
        //geom.setColors([0.0, 1.0, 0.0, 0, 0, 1, 0, 0, 1]);

        //geom.scale(1, 1, 1);
        /*
        TEST position attribute 
        
        
                const positionsAttribute = [-1, 2, 0, 1, 2, 0, - 1, 1, 0, 1, 1, 0, - 1, 0, 0, 1, 0, 0, - 1, - 1, 0, 1, - 1, 0];
                
        
                geom.setAttribute('position', new THREE.Float32BufferAttribute(positionsAttribute, 3));
        */
        const count = geom.attributes.position.count;
        const skip = new Float32Array(count);

        geom.setAttribute('aSkip', new THREE.InstancedBufferAttribute(skip, 1));
        console.log('TRIANGLE GEOMETRY');
        console.log(geom);
        return geom;
    }, []);

    useLayoutEffect(() => {
        line2.computeLineDistances();
    }, [line2]);

    useEffect(() => {
        return () => lineGeom3.dispose();
    }, [lineGeom3]);

    return <primitive object={line2}>
        <primitive object={lineGeom3} attach="geometry" />

        <primitive object={lineMaterial} attach="material" />
    </primitive>;
}