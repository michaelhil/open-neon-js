import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'PupilLabsNeonBrowser',
      formats: ['es', 'umd'],
      fileName: (format) => format === 'es' ? 'index.js' : 'index.umd.js'
    },
    rollupOptions: {
      external: ['open-neon-js-api-core'],
      output: {
        globals: {
          'open-neon-js-api-core': 'OpenNeonCore'
        }
      }
    },
    minify: false,
    sourcemap: true
  }
})