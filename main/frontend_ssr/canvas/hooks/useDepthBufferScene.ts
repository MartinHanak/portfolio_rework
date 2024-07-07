import { useFBO } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import {
  DepthTexture,
  DepthFormat,
  UnsignedShortType,
  Scene,
  Mesh,
} from "three";

export default function useDepthBufferScene({
  size = 256,
  frames = Infinity,
  disable = false,
  depthScene = new Scene(),
}: {
  size?: number;
  frames?: number;
  disable?: boolean;
  depthScene?: Scene;
} = {}) {
  const dpr = useThree((state) => state.viewport.dpr);
  const { width, height } = useThree((state) => state.size);
  const w = size || width * dpr;
  const h = size || height * dpr;

  const depthConfig = useMemo(() => {
    const depthTexture = new DepthTexture(w, h);
    depthTexture.format = DepthFormat;
    depthTexture.type = UnsignedShortType;
    return { depthTexture };
  }, [w, h]);

  let count = 0;
  const depthFBO = useFBO(w, h, depthConfig);

  console.log("depth scene");
  console.log(depthScene);

  useFrame((state) => {
    if (frames === Infinity || count < frames) {
      state.gl.setRenderTarget(depthFBO);
      state.gl.render(depthScene, state.camera);
      state.gl.setRenderTarget(null);
      count++;
    }
  });
  return depthFBO.depthTexture;
}
