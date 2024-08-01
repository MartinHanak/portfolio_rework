import { OrbitControls } from '@react-three/drei';
import { useEditorContext } from './EditorContext';
import { useEffect, useMemo, useState } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Color, Float32BufferAttribute, SRGBColorSpace } from 'three'; import GraphVertex from '../../../../canvas/graph/GraphVertex';

interface IEditorScene {
    variant: 'selection' | 'display';
}

export default function EditorScene({ variant }: IEditorScene) {
    const camera = useThree(root => root.camera);

    const { file, cameraMatrix, cameraMatrixChange, originalModel, line, faces, graph, points } = useEditorContext();

    const [selectedVertices, setSelectedVertices] = useState<Array<GraphVertex>>([]);

    const userSelectedVerticesSet = useMemo(() => {
        const set = new Set<GraphVertex>();

        for (const vertex of selectedVertices) {
            set.add(vertex);
        }

        return set;
    }, [selectedVertices]);

    // find path of connected vertices between the user selected ones
    const verticesPath = useMemo(() => {
        const path: GraphVertex[] = [];

        for (const vertex of selectedVertices) {
            if (path.length === 0) {
                path.push(vertex);
            } else {
                const previousVertex = path[path.length - 1];
                const pathBetweenVertices = graph.findPath(previousVertex, vertex);

                for (const vertex of pathBetweenVertices) {
                    path.push(vertex);
                }
            }
        }

        return path;
    }, [selectedVertices]);

    const verticesPathSet = useMemo(() => {
        const pathSet = new Set<GraphVertex>();

        for (const vertex of verticesPath) {
            pathSet.add(vertex);
        }
        return pathSet;
    }, [verticesPath]);

    // update points colors when selected vertices change
    useEffect(() => {
        const colorAttribute = points.geometry.getAttribute('color');
        if (!colorAttribute) return;

        const colorAttributeArray = colorAttribute.array;

        const color = new Color();

        let arrayIndex = 0;
        for (const vertex of graph.vertices) {

            if (verticesPathSet.has(vertex)) {
                color.setRGB(1, 0, 0, SRGBColorSpace);
            } else {
                color.setRGB(0, 0, 1, SRGBColorSpace);
            }

            colorAttributeArray[arrayIndex] = color.r;
            colorAttributeArray[arrayIndex + 1] = color.g;
            colorAttributeArray[arrayIndex + 2] = color.b;

            arrayIndex += 3;
        }

        colorAttribute.needsUpdate = true;

    }, [verticesPath]);

    // const depthScene = useMemo(() => {
    //     const scene = new Scene();
    //     scene.add(faces);
    //     return scene;
    // }, [faces]);

    // const depthBuffer = useDepthBufferScene({ disable: (variant === 'selection'), depthScene: depthScene });

    // useEffect(() => {
    //     console.log('Depth buffer or line changed');
    //     line.material.uniforms.uDepth.value = depthBuffer;
    // }, [depthBuffer, line]);


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

        console.log(`Clicked vertex `, vertex);

        if (e.shiftKey) {
            setSelectedVertices((prev) => {
                return [...prev, vertex];
            });
        } else {
            setSelectedVertices(() => {
                return [vertex];
            });
        }
    };


    return <>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />


        {!originalModel &&
            <>
                <mesh>
                    <boxGeometry />
                    <meshBasicMaterial />
                </mesh>
                {/* <FatLine /> */}
            </>}

        {variant === 'selection' && originalModel && <primitive object={originalModel} />}

        {variant === 'display' && <primitive object={faces} />}
        {variant === 'display' && <primitive object={line} />}

        {variant === 'selection' && <>
            <primitive object={points} onClick={handlePointClick} />
        </>}


        {variant === 'selection' && <OrbitControls />}

    </>;
}