import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: "all", // <-- allow all hosts in dev (safety)
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    host: true,
    allowedHosts: "wapp.techwin.sa", // <-- this line kills the "Blocked request" error
  },
});

