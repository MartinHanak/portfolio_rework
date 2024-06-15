import { OrbitControls, Points, useGLTF } from '@react-three/drei';
import { useEditorContext } from './EditorContext';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { GLTF, GLTFLoader } from 'three/examples/jsm/Addons.js';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import Graph from '../../../../canvas/graph/Graph';
import { Color, Float32BufferAttribute, Mesh, SRGBColorSpace } from 'three';
import LineSegments3 from '../../../../canvas/mesh/LineSegments3';
import GraphVertex from '../../../../canvas/graph/GraphVertex';

interface IEditorScene {
    variant: 'selection' | 'display';
}

export default function EditorScene({ variant }: IEditorScene) {
    const camera = useThree(root => root.camera);

    const { file, cameraMatrix, cameraMatrixChange, originalModel, line, faces, graph, points } = useEditorContext();

    const selectedVertices = useRef<GraphVertex[]>([]);

    useFrame(() => {
        if (variant === 'selection') {
            cameraMatrixChange(camera);
        } else {
            camera.copy(cameraMatrix.current);
        }
    });

    const handlePointClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();

        const index = e.index;
        if (index === undefined) return;

        const positionAttribute = points.geometry.attributes['position'];
        const position: [number, number, number] = [
            positionAttribute.getX(index),
            positionAttribute.getY(index),
            positionAttribute.getZ(index)
        ];

        const vertex = graph.getVertex(position);
        if (!vertex) return;


        if (e.shiftKey && selectedVertices.current.length > 0) {

            const previouslySelectedVertex = selectedVertices.current[selectedVertices.current.length - 1];

            console.log(graph.findPath(previouslySelectedVertex, vertex));

            // add points to selection = find shortest path (maybe biased by the angle ???) in the graph

            // points between = graph.findPath(start, end);

        } else {
            // select one new point, reset previous selection

            selectedVertices.current = [vertex];

            const colors: number[] = [];
            const color = new Color();

            for (let i = 0; i < graph.size; i++) {

                if (i === e.index) {
                    color.setRGB(1, 0, 0, SRGBColorSpace);
                } else {
                    color.setRGB(0, 0, 1, SRGBColorSpace);
                }

                colors.push(color.r, color.g, color.b);
            }

            points.geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
        }
    };


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
        {variant === 'display' && <primitive object={faces} />}

        {variant === 'selection' && <>
            <primitive object={points} onClick={handlePointClick} />
        </>}


        {variant === 'selection' && <OrbitControls />}

    </>;
}