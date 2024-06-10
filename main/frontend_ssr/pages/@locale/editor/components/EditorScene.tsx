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
    const camera = useThree(root => root.camera);

    const { file, cameraMatrix, cameraMatrixChange, originalModel, line, faces } = useEditorContext();

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


        {!originalModel && <mesh>
            <boxGeometry />
            <meshBasicMaterial />
        </mesh>}

        {variant === 'selection' && originalModel && <primitive object={originalModel} />}

        {variant === 'display' && <primitive object={line} />}

        {variant === 'selection' && <OrbitControls />}

    </>;
}