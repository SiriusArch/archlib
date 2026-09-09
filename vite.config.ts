import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import wgsl from '@vgpu/wgsl/loader-vite'

export default defineConfig({
  plugins: [react(), tailwindcss(), wgsl()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
