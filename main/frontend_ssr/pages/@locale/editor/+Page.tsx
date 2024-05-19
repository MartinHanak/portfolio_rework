import React from "react";
import { Canvas } from "@react-three/fiber";
import { Perf } from 'r3f-perf';
import { usePageContext } from "vike-react/usePageContext";
import EditorScene from "./components/EditorScene";

export default function Page() {

    return <Canvas>
        <Perf position="top-left" />
        <EditorScene />
    </Canvas>;

}