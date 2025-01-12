import { OrbitControls } from "@react-three/drei";
import CanvasVideo from "./CavasVideo";

export default function CanvasVideoScene() {
    return <>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />


        <mesh>
            <boxGeometry />
            <meshBasicMaterial />
        </mesh>

        <CanvasVideo />

        <OrbitControls />
    </>;
}