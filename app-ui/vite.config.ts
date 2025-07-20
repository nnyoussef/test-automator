import { fileURLToPath, URL } from 'node:url';
import { defineConfig, Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import vueDevTools from 'vite-plugin-vue-devtools';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'node:path';
import * as fs from 'node:fs';
import minify from 'minify-xml';

function svgMineFication(): Plugin {
    return {
        name: 'svg-minification',
        apply: 'build',
        generateBundle() {
            const absPath = path.resolve('src/assets/icon-interactive.svg');
            const distPath = path.resolve('dist/assets/icon-interactive.svg');
            if (fs.existsSync(absPath)) {
                const originalContent = fs.readFileSync(absPath, 'utf-8');
                const newContent = minify(originalContent);
                fs.mkdirSync(path.dirname(distPath), { recursive: true });
                fs.writeFileSync(distPath, newContent, 'utf-8');
                this.warn(distPath);
                this.warn(`[rewrite-file-plugin] Minified SVG file: ${absPath}`);
            } else {
                this.error(`[rewrite-file-plugin] File not found: ${absPath}`);
            }
        },
    };
}

export default defineConfig({
    define: {
        __VUE_OPTIONS_API__: false,
        optimizeDeps: true,
    },
    plugins: [
        vue(),
        ViteMinifyPlugin(),
        vueDevTools(),
        visualizer({
            filename: './bundle-analysis.html', // Output file
            open: false, // Automatically open report in browser
            gzipSize: true,
            brotliSize: true,
            template: 'flamegraph',
        }),
        svgMineFication(),
    ],
    base: '/',
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
