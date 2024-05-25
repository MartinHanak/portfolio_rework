import { OrbitControls, useGLTF } from '@react-three/drei';
import { useEditorContext } from './EditorContext';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { GLTF, GLTFLoader } from 'three/examples/jsm/Addons.js';

export default function EditorScene() {
    const [gltf, setGltf] = useState<GLTF>();

    const loader = useMemo(() => {
        return new GLTFLoader();
    }, []);

    const { file } = useEditorContext();

    const url = useMemo(() => {
        if (!file) return '';

        return URL.createObjectURL(file);
    }, [file]);

    useEffect(() => {
        file?.arrayBuffer().then((buffer) => {
            loader.parse(buffer, '', (gltf) => {
                console.log(gltf);
                setGltf(gltf);
            }, (e) => console.log(e));
        });
    }, [file]);

    const model = useMemo(() => {
        if (!gltf) return null;
        console.log('model');
        console.log(gltf.scene.children[0]);
        return gltf.scene.children[0];
    }, [gltf]);



    return <>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

        {!model && <mesh>
            <boxGeometry />
            <meshBasicMaterial />
        </mesh>}

        {model && <primitive object={model} />}

        <OrbitControls />

    </>;
}