import { OrbitControls, useGLTF } from '@react-three/drei';
import { useEditorContext } from './EditorContext';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { GLTF, GLTFLoader } from 'three/examples/jsm/Addons.js';
import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import Graph from '../../../../canvas/graph/Graph';
import { Mesh } from 'three';
import LineSegments3 from '../../../../canvas/mesh/LineSegments3';

interface IEditorScene {
    variant: 'selection' | 'display';
}

export default function EditorScene({ variant }: IEditorScene) {
    const [gltf, setGltf] = useState<GLTF>();
    const camera = useThree(root => root.camera);

    const loader = useMemo(() => {
        return new GLTFLoader();
    }, []);

    const { file, cameraMatrix, cameraMatrixChange } = useEditorContext();

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
        const original = gltf.scene.children[0];
        console.log(original instanceof Mesh);

        if (variant === 'selection') {
            return original;
        } else {
            if (!(original instanceof Mesh)) return original;
            const graph = new Graph();
            graph.setVertices(original);
            console.log(graph);

            const result = graph.buildGeometryData();
            console.log(result);

            const line = new LineSegments3();
            console.log(result.lines.positions.length);
            line.geometry.setPositions(result.lines.positions);
            console.log(line.geometry.attributes);
            console.log(line);
            return line;
        }
    }, [gltf]);

    useFrame(() => {
        if (variant === 'selection') {
            cameraMatrixChange(camera);
        } else {
            camera.copy(cameraMatrix.current);
        }
    });


    return <>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

        {!model && <mesh>
            <boxGeometry />
            <meshBasicMaterial />
        </mesh>}

        {model && <primitive object={model} />}

        {variant === 'selection' && <OrbitControls />}

    </>;
}