import React from "react";
import { Canvas } from "@react-three/fiber";
import { Perf } from 'r3f-perf';
import EditorScene from "./components/EditorScene";
import { useControls } from "leva";
import EditorControls from "./components/EditorControls";
import EditorContext from "./components/EditorContext";


export default function Page() {
    const { backgroundColor } = useControls({ backgroundColor: '#2a2727' });

    return <main className="fixed w-screen h-screen overflow-hidden top-0 left-0" style={{ backgroundColor: backgroundColor }}>
        <EditorContext>
            <EditorControls />

            <Canvas>
                <Perf position="top-left" />
                <EditorScene />
            </Canvas>
        </EditorContext>
    </main>;

}