import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'PupilLabsNeonNode',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs'
    },
    rollupOptions: {
      external: [
        'open-neon-core',
        'ws',
        'node-fetch', 
        'bonjour-service',
        'rxjs',
        'node:events',
        'node:buffer',
        'node:stream',
        'node:util',
        'node:url',
        'node:crypto'
      ]
    },
    minify: false,
    sourcemap: true
  }
})