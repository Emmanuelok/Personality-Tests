/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@core": fileURLToPath(new URL("./src/core", import.meta.url)),
    },
  },
  build: {
    // Split rarely-changing vendor and the large static instrument catalog into
    // their own long-cacheable chunks, so app-code deploys don't re-bust them and
    // first paint can fetch them in parallel. The es/fr instrument translations are
    // split out separately so the (eagerly-needed) English catalog stays lean and the
    // two cache-bust independently. PDF/report engines keep their dynamic chunks.
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("/react/") || id.includes("/scheduler/")) return "react-vendor";
            return undefined;
          }
          if (id.includes("/src/core/instruments/i18n")) return "instrument-i18n";
          if (id.includes("/src/core/instruments/")) return "catalog";
          return undefined;
        },
      },
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
  },
});
