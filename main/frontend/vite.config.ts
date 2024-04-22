import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import glsl from "vite-plugin-glsl";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), glsl()],
  server: {
    port: 8080,
    strictPort: true,
    host: true,
    watch: {
      usePolling: true,
    },
  },
});
