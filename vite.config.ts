/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    env: {
      // src/services/api.ts lança em import se ausente; testes não batem
      // num backend real, então qualquer valor sintático válido serve.
      VITE_API_URL: "http://localhost:3000",
    },
  },
});
