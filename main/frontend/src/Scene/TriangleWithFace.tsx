import { useEffect, useLayoutEffect, useMemo } from "react";
import { LineMaterial, LineSegments2, LineSegmentsGeometry } from "three/examples/jsm/Addons.js";
import * as THREE from 'three';
import LineVertex from '../shaders/LineVertex.glsl';
import LineFragment from '../shaders/LineFragment.glsl';

import triangleVertex from '../shaders/triangleFace/triangleVertex.glsl';
import triangleFragment from '../shaders/triangleFace/triangleFragment.glsl';


export default function TriangleWithFace() {
    const line2 = useMemo(() => new LineSegments2(), []);

    const lineMaterial = useMemo(() => {
        const material = new LineMaterial({
            color: 0xffffff,
            linewidth: 0.05, // in world units with size attenuation, pixels otherwise
            vertexColors: true,

            //resolution:  // to be set by renderer, eventually
            dashed: false,
            alphaToCoverage: true,
            worldUnits: true,
        });

        material.onBeforeCompile = (shader) => {

            shader.vertexShader = LineVertex;
            shader.fragmentShader = LineFragment;

        };
        return material;
    }, []);

    const bufferGeom = useMemo(() => {
        const geom = new THREE.BufferGeometry();

        const positions = [
            [1.0, 1.0, 1 - 0.025],
            [1.0, 2.0, 1 - 0.025],
            [0.0, 2.0, 1 - 0.025],
        ];

        const vertices = new Float32Array(positions.flat());

        geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        const colors = [
            [1, 0, 0, 1],
            [1, 0, 0, 1],
            [0, 0, 0, 1],
        ];

        geom.setAttribute('aColor', new THREE.BufferAttribute(
            new Float32Array(colors.flat()), 4
        ));
        return geom;
    }, []);

    const lineGeom3 = useMemo(() => {
        const geom = new LineSegmentsGeometry();


        const positions = [
            [1.0, 1.0, 1.0],
            [1.0, 2.0, 1.0],
            [1.0, 2.0, 1.0],
            [0.0, 2.0, 1.0],
            [0.0, 2.0, 1.0],
            [1.0, 1.0, 1.0],
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

    return <>
        <mesh renderOrder={0}>
            <primitive object={bufferGeom} attach="geometry" />

            <shaderMaterial transparent depthTest={true} depthWrite={false} vertexShader={triangleVertex} fragmentShader={triangleFragment} />
        </mesh>

        <primitive object={line2} >
            <primitive object={lineGeom3} attach="geometry" />

            <primitive object={lineMaterial} attach="material" />
        </primitive>
    </>;
}