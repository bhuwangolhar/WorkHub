import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// In dev, requests to /api/* are forwarded to the API (so no CORS setup is needed).
// Example: fetch("/api/health") -> http://localhost:3000/health
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});