import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8092, // 8080 = TikTally-seller, 8091 vive ocupada por outra sessão → creator fixa na 8092
    strictPort: true, // NÃO pula de porta — porta fixa e previsível pro túnel
    allowedHosts: [
      "localhost",
      ".loca.lt", // LocalTunnel (callback OAuth do creator)
      ".ngrok.io",
      ".ngrok-free.app",
    ],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
