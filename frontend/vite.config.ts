import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "public/img",
          dest: path.resolve(__dirname, "../backend/public"),
        },
      ],
    }),
  ],
  server: {
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"), // keep /api prefix
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../backend/public"),
    emptyOutDir: true,
  },
});
