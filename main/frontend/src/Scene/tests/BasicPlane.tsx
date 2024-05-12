import modifiedVertex from '../shaders/basicMeshMaterial/modifiedVertex.glsl';
import modifiedFragment from '../shaders/basicMeshMaterial/modifiedFragment.glsl';

import * as THREE from 'three';
import { useEffect, useRef } from 'react';

export default function BasicPlane() {
    const testRef = useRef<THREE.PlaneGeometry | null>(null);

    useEffect(() => {
        console.log(testRef.current);
    }, []);

    return <mesh position={[1, -1, 0]} >
        <planeGeometry ref={testRef} args={[1, 1, 1, 1]} />
        <shaderMaterial side={THREE.DoubleSide} uniforms={{ diffuse: { value: new THREE.Color('red') } }} vertexShader={modifiedVertex} fragmentShader={modifiedFragment} />
    </mesh>;
}