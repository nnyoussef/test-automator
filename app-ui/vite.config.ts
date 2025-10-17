import { fileURLToPath, URL } from 'node:url';
import { defineConfig, Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'node:path';
import * as fs from 'node:fs';
import minify from 'minify-xml';
import { JSDOM } from 'jsdom';
import vueDevTools from 'vite-plugin-vue-devtools';
import Inspector from 'unplugin-vue-inspector/vite';
import Inspect from 'vite-plugin-inspect';

//https://vueschool.io/articles/vuejs-tutorials/7-awesome-vue-js-3-plugins-and-libraries-to-know-in-2023/
//https://vuejs.org/guide/built-ins/transition-group.html#staggering-list-transitions
function svgMinification(): Plugin {
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

function indexHandler(): Plugin {
    let apihostPort: string;
    let envMode: string;
    let version: string;

    return {
        name: 'neutralino-library',
        apply: 'build',
        configResolved(config) {
            apihostPort = new URL(config.env.VITE_API_URL).origin;
            envMode = config.env.MODE;
            version = config.env.VITE_APP_VERSION;
            this.warn(`[index-handler] API Host: ${apihostPort}`);
            this.warn(`[index-handler] Environment Mode: ${envMode}`);
            this.warn(`[index-handler] App Version: ${version}`);
        },
        transformIndexHtml(html) {
            const dom = new JSDOM(html);
            const document = dom.window.document;

            const neutralineoScript = document.createElement('script');
            neutralineoScript.src = '/js/neutralino.js';
            neutralineoScript.setAttribute('defer', '');
            neutralineoScript.setAttribute('async', '');
            document.head.appendChild(neutralineoScript);

            const mainScript = document.createElement('script');
            mainScript.src = '/js/main.js';
            mainScript.setAttribute('defer', '');
            mainScript.setAttribute('async', '');
            document.head.appendChild(mainScript);

            const apiHostLink = document.createElement('link');
            apiHostLink.rel = 'preconnect';
            apiHostLink.href = apihostPort;
            document.head.appendChild(apiHostLink);

            const moduleScript = Array.from(document.scripts).find(
                (script) => script.type === 'module',
            );
            moduleScript?.setAttribute('defer', '');

            const deploymentInfo = document.getElementById('deployment-info');
            deploymentInfo!.textContent = `Version: ${version} | Environment: ${envMode}`;

            return dom.serialize();
        },
    };
}

export default defineConfig((config) => {
    const mode = config.mode || 'production';
    return {
        define: {
            __VUE_OPTIONS_API__: false,
            optimizeDeps: true,
        },
        plugins: [
            vue(),
            ViteMinifyPlugin(),
            mode === 'dev' && vueDevTools(),
            mode === 'dev' &&
                Inspector({
                    enabled: true,
                    toggleButtonVisibility: 'always',
                    toggleButtonPos: 'top-right',
                    launchEditor: 'webstorm',
                }),
            mode === 'dev' && Inspect(),
            visualizer({
                filename: './bundle-analysis.html', // Output file
                open: false, // Automatically open report in browser
                gzipSize: true,
                brotliSize: true,
                template: 'flamegraph',
            }),
            svgMinification(),
            indexHandler(),
        ].filter(Boolean),
        base: '/',
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
    };
});
