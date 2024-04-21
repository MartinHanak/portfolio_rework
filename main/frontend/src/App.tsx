import { Canvas } from "@react-three/fiber";
import Scene from "./Scene/Scene";
import { useControls } from "leva";
import { Perf } from 'r3f-perf';


function App() {
  const { backgroundColor } = useControls({ backgroundColor: '#2a2727' });

  return (
    <main style={{ backgroundColor: backgroundColor }}>
      <Canvas>
        <Perf position="top-left" />
        <Scene />
      </Canvas>
    </main>
  );
}

export default App;
