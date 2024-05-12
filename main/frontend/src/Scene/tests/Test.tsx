import testVertexShader from '../shaders/testVertexShader.glsl';
import testFragmentShader from '../shaders/testFragmentShader.glsl';

export default function Test() {
    return (
        <mesh position={[0, 1, 0]} rotation={[0, 0.5, 0]} >
            <planeGeometry args={[1, 1]} />
            <shaderMaterial vertexShader={testVertexShader} fragmentShader={testFragmentShader} />
            {/* <meshStandardMaterial /> */}
        </mesh>
    );
}