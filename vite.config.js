import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const stripGeneratedRouteTypes = () => ({
  name: "strip-generated-route-types",
  enforce: "pre",
  transform(code, id) {
    if (!id.endsWith("routeTree.gen.js")) return;
    return {
      code: code.replace(/\nimport type \{ getRouter \}[\s\S]*$/, "\n"),
      map: null,
    };
  },
  closeBundle() {
    const routeTree = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "src/routeTree.gen.js",
    );
    if (!fs.existsSync(routeTree)) return;
    const code = fs.readFileSync(routeTree, "utf8");
    fs.writeFileSync(routeTree, code.replace(/\nimport type \{ getRouter \}[\s\S]*$/, "\n"));
  },
});

export default defineConfig({
  plugins: [
    tanstackStart({ router: { disableTypes: true, generatedRouteTree: "./routeTree.gen.js" } }),
    tailwindcss(),
    react(),
    stripGeneratedRouteTypes(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src"),
    },
  },
  build: {
    cssMinify: false,
  },
});
