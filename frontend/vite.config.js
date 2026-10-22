import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    // aceita as variáveis antigas (REACT_APP_*) já definidas na Vercel
    envPrefix: ["VITE_", "REACT_APP_"],
    build: {
        outDir: "dist",
        sourcemap: false,
        target: "es2020",
    },
});
