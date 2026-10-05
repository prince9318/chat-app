import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-router") || id.includes("react-dom") || id.includes("/react/")) {
              return "react-vendor";
            }
            if (id.includes("@mui") || id.includes("@emotion")) {
              return "mui-vendor";
            }
            if (id.includes("socket.io-client") || id.includes("axios") || id.includes("react-hot-toast")) {
              return "chat-vendor";
            }
            if (id.includes("emoji-picker-react") || id.includes("react-easy-crop")) {
              return "media-vendor";
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "axios", "socket.io-client", "react-hot-toast"],
  },
  server: {
    hmr: true,
    open: false,
  },
});
