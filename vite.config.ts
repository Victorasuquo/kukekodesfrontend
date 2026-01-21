import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://linkup-neon-ten.vercel.app',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: 'https://linkup-neon-ten.vercel.app',
        changeOrigin: true,
        secure: false,
      },
      '/courses/run-code': {
        target: 'https://linkup-neon-ten.vercel.app',
        changeOrigin: true,
        secure: false,
      },
      '/courses/ai-query': {
        target: 'https://linkup-neon-ten.vercel.app',
        changeOrigin: true,
        secure: false,
      },
      '/courses/submission-status': {
        target: 'https://linkup-neon-ten.vercel.app',
        changeOrigin: true,
        secure: false,
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
