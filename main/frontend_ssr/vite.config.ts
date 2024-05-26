import ssr from "vike/plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  plugins: [react({}), ssr({ prerender: true }), glsl()],
  server: {
    port: 8080,
    strictPort: true,
    host: true,
    watch: {
      usePolling: true,
    },
  },
});
