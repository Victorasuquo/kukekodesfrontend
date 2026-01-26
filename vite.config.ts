import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const BACKEND_URL = 'https://kukekodesbackend-714266210254.europe-west1.run.app';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/v1': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: true,
      },
      '/health': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
