import { useVideoTexture } from "@react-three/drei";


export default function CanvasVideo() {

    const texture = useVideoTexture('/assets/Gravitorium.mp4');

    return <mesh rotation={[0, 0, 0]} position={[0, 0, 1.1]}>
        <planeGeometry args={[3.2, 1.9]} />

        <meshBasicMaterial map={texture} toneMapped={false} />

        {/* <meshStandardMaterial emissive={"white"} side={THREE.DoubleSide}>

            <videoTexture attach="map" args={[video]} />
            <videoTexture attach="emissiveMap" args={[video]} />
        </meshStandardMaterial> */}

    </mesh>;
}