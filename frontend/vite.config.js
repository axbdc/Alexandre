import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// Põe o CSS principal dentro do index.html: evita um pedido que bloqueava a
// primeira pintura (o aspeto fica exatamente igual).
const inlineCss = () => ({
    name: "inline-main-css",
    apply: "build",
    enforce: "post",
    generateBundle(_, bundle) {
        const html = Object.values(bundle).find((f) => f.fileName === "index.html");
        if (!html) return;
        let src = String(html.source);
        for (const f of Object.values(bundle)) {
            if (f.type !== "asset" || !f.fileName.endsWith(".css")) continue;
            const tag = new RegExp(`<link rel="stylesheet"[^>]*href="/${f.fileName}"[^>]*>`);
            if (!tag.test(src)) continue;
            src = src.replace(tag, () => `<style>${String(f.source)}</style>`);
        }
        html.source = src;
    },
});

export default defineConfig({
    plugins: [react(), inlineCss()],
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
