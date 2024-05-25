import React from "react";
import { Canvas } from "@react-three/fiber";
import { Perf } from 'r3f-perf';
import EditorScene from "./components/EditorScene";
import { useControls } from "leva";
import EditorControls from "./components/EditorControls";
import EditorContext from "./components/EditorContext";


export default function Page() {
    const { backgroundColor } = useControls({ backgroundColor: '#2a2727' });

    return <main className="fixed w-screen h-screen overflow-hidden top-0 left-0 flex" style={{ backgroundColor: backgroundColor }}>
        <EditorContext>
            <EditorControls />
            <div className="w-1/2 h-screen">
                <Canvas>
                    <EditorScene variant="selection" />
                </Canvas>
            </div>
            <div className="w-1/2 h-screen">
                <Canvas>
                    <Perf position="top-left" />
                    <EditorScene variant="display" />
                </Canvas>
            </div>

        </EditorContext>
    </main>;

}