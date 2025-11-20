import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "/chiban-viewer/",
  plugins: [react()],
  build: {
    outDir: 'build',
  },
})
