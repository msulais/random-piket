import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
    clearScreen: false,
    server: {
        strictPort: true
    },
    envPrefix: ['VITE_', 'TAURI_'],
    plugins: [solid()],
    build: {
        // Tauri uses Chromium on Windows and WebKit on macOS and Linux
        target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
        // don't minify for debug builds
        minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
        // produce sourcemaps for debug builds
        sourcemap: !!process.env.TAURI_DEBUG,
    },
})
