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
      external: ['@pupil-labs/neon-core', 'rxjs'],
      output: {
        globals: {
          '@pupil-labs/neon-core': 'PupilLabsNeonCore',
          'rxjs': 'rxjs'
        }
      }
    },
    minify: false,
    sourcemap: true
  }
})