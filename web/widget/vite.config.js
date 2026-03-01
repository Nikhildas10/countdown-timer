import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [preact()],

    build: {
        lib: {
            entry: path.resolve(__dirname, "src/main.jsx"),
            name: "CountdownWidget",
            fileName: () => "countdown-widget.js",
            formats: ["iife"],
        },

        outDir: path.resolve(__dirname, "../../extensions/countdown/assets"),
        emptyOutDir: false,

        rollupOptions: {
            output: {
                inlineDynamicImports: true,
            },
        },
    },

    define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
    },
});
