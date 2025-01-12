import { Canvas } from "@react-three/fiber";
import CanvasVideoScene from "./components/CanvasVideoScene";

export default function Page() {
    return <main className="fixed w-screen h-screen overflow-hidden top-0 left-0 flex">
        <h1>Canvas video</h1>
        <Canvas>
            <CanvasVideoScene />
        </Canvas>
    </main>;
}