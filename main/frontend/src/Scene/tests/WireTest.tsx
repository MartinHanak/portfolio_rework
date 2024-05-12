import wireVertexShader from '../shaders/wireVertexShader.glsl';
import wireFragmentShader from '../shaders/wireFragmentShader.glsl';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { ShaderMaterial } from 'three';

export default function WireTest() {
    const geometryRef = useRef<THREE.BoxGeometry | null>(null);
    const materialRef = useRef<ShaderMaterial | null>(null);
    useEffect(() => {
        if (!geometryRef.current || !materialRef.current) return;

        geometryRef.current.toNonIndexed();
        geometryRef.current.deleteAttribute('normal');
        geometryRef.current.deleteAttribute('uv');
        setupAttributes(geometryRef.current);

        // TODO: check why type error
        //@ts-ignore
        //material.extensions.derivatives = true;
    }, []);
    return (
        <mesh position={[0, -1.5, 0]} rotation={[0, 0.2, 0]} >
            <boxGeometry ref={geometryRef} args={[1, 1, 1]} />
            <shaderMaterial ref={materialRef} vertexShader={wireVertexShader} fragmentShader={wireFragmentShader} uniforms={{
                'thickness': {
                    value: 2
                }
            }} side={THREE.DoubleSide} alphaToCoverage={true} />
            {/* <meshStandardMaterial /> */}
        </mesh>
    );
}



function setupAttributes(geometry: THREE.BufferGeometry) {
    console.log(geometry);
    const vectors = [
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 1)
    ];

    const position = geometry.attributes.position;
    const centers = new Float32Array(position.count * 3);

    for (let i = 0, l = position.count; i < l; i++) {

        vectors[i % 3].toArray(centers, i * 3);

    }

    geometry.setAttribute('center', new THREE.BufferAttribute(centers, 3));

}
