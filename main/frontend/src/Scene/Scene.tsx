import { MeshProps, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Mesh } from 'three';
import { OrbitControls } from '@react-three/drei';
import Line3Test from './Line3Test';
import Triangle from './tests/Triangle';

function Box(props: MeshProps) {
    // This reference will give us direct access to the mesh
    const meshRef = useRef<Mesh>(null);
    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false);
    const [active, setActive] = useState(false);
    // Subscribe this component to the render-loop, rotate the mesh every frame
    useFrame((state, delta) => {
        if (meshRef.current)
            meshRef.current.rotation.x += delta;
    });
    // Return view, these are regular three.js elements expressed in JSX
    return (
        <mesh
            {...props}
            ref={meshRef}
            scale={active ? 1.5 : 1}
            onClick={(event) => setActive(!active)}
            onPointerOver={(event) => setHover(true)}
            onPointerOut={(event) => setHover(false)}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
        </mesh>
    );
}


export default function Scene() {
    return <>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        {/*
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
         <Test />

        <WireTest />

        <FatLineTest />

        <WireFromMesh />

        <OrbitControls />

        <MeshWithSkip />

        <BasicPlane />

        <Triangle />

        <TriangleWithFace /> */}
        <Triangle />

        <OrbitControls />

        <Line3Test />
    </>;
}